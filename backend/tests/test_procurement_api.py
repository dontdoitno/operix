from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import (
    create_session_token,
    get_session_expiration,
    hash_password,
    hash_session_token,
)
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.auth_session import AuthSession
from app.models.enums import UserRole
from app.models.user import User


class ProcurementApiContext:
    """Container with test client and session factory for procurement API tests."""

    def __init__(self, client: TestClient, session_factory: sessionmaker) -> None:
        self.client = client
        self.session_factory = session_factory


@pytest.fixture()
def context() -> Generator[ProcurementApiContext, None, None]:
    """Create API client with isolated SQLite database per test."""
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)

    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield ProcurementApiContext(test_client, testing_session_local)

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def create_authenticated_user(
    context: ProcurementApiContext,
    email: str,
    full_name: str,
    role: UserRole,
    password: str = "StrongPass123",
) -> tuple[dict, str]:
    """Persist a user and active auth session, then return user payload with raw bearer token."""
    with context.session_factory() as db:
        user = User(
            email=email,
            full_name=full_name,
            role=role,
            password_hash=hash_password(password),
        )
        db.add(user)
        db.flush()
        db.refresh(user)

        raw_token = create_session_token()
        auth_session = AuthSession(
            user_id=user.id,
            token_hash=hash_session_token(raw_token),
            expires_at=get_session_expiration(),
        )
        db.add(auth_session)
        db.commit()

        user_payload = {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value,
        }

    return user_payload, raw_token


def auth_headers(token: str) -> dict[str, str]:
    """Build Authorization header payload for authenticated API requests."""
    return {"Authorization": f"Bearer {token}"}


def test_procurement_lifecycle_success(context: ProcurementApiContext) -> None:
    employee, employee_token = create_authenticated_user(
        context,
        "employee@operix.dev",
        "Employee User",
        UserRole.EMPLOYEE,
    )
    manager, manager_token = create_authenticated_user(
        context,
        "manager@operix.dev",
        "Manager User",
        UserRole.MANAGER,
    )
    supplier, supplier_token = create_authenticated_user(
        context,
        "supplier@operix.dev",
        "Supplier User",
        UserRole.SUPPLIER,
    )

    create_request_response = context.client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Laptop purchase",
            "description": "Need new laptop for engineering tasks",
            "amount": "1800.00",
            "currency": "usd",
        },
        headers=auth_headers(employee_token),
    )
    assert create_request_response.status_code == 201
    purchase_request = create_request_response.json()
    assert purchase_request["status"] == "pending"
    assert purchase_request["currency"] == "USD"
    assert purchase_request["requester_id"] == employee["id"]

    pending_response = context.client.get(
        "/api/v1/procurement/requests/pending",
        headers=auth_headers(manager_token),
    )
    assert pending_response.status_code == 200
    assert len(pending_response.json()) == 1

    approve_response = context.client.post(
        f"/api/v1/procurement/requests/{purchase_request['id']}/review",
        json={"approve": True},
        headers=auth_headers(manager_token),
    )
    assert approve_response.status_code == 200
    approved_request = approve_response.json()
    assert approved_request["status"] == "approved"

    create_order_response = context.client.post(
        "/api/v1/procurement/orders",
        json={
            "purchase_request_id": purchase_request["id"],
            "supplier_id": supplier["id"],
        },
        headers=auth_headers(manager_token),
    )
    assert create_order_response.status_code == 201
    purchase_order = create_order_response.json()
    assert purchase_order["status"] == "created"
    assert purchase_order["manager_id"] == manager["id"]

    confirmed_response = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed", "supplier_note": "Order accepted"},
        headers=auth_headers(supplier_token),
    )
    assert confirmed_response.status_code == 200
    assert confirmed_response.json()["status"] == "confirmed"

    fulfillment_response = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "in_fulfillment", "supplier_note": "Preparing shipment"},
        headers=auth_headers(supplier_token),
    )
    assert fulfillment_response.status_code == 200
    assert fulfillment_response.json()["status"] == "in_fulfillment"

    delivered_response = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "delivered", "delivery_note": "Delivered to office reception"},
        headers=auth_headers(supplier_token),
    )
    assert delivered_response.status_code == 200
    assert delivered_response.json()["status"] == "delivered"

    received_response = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/confirm-received",
        headers=auth_headers(employee_token),
    )
    assert received_response.status_code == 200
    assert received_response.json()["status"] == "received"


def test_role_restrictions_and_auth_validation(context: ProcurementApiContext) -> None:
    employee, employee_token = create_authenticated_user(
        context,
        "employee2@operix.dev",
        "Employee 2",
        UserRole.EMPLOYEE,
    )
    manager, manager_token = create_authenticated_user(
        context,
        "manager2@operix.dev",
        "Manager 2",
        UserRole.MANAGER,
    )
    supplier, supplier_token = create_authenticated_user(
        context,
        "supplier2@operix.dev",
        "Supplier 2",
        UserRole.SUPPLIER,
    )
    supplier_other, supplier_other_token = create_authenticated_user(
        context,
        "supplier3@operix.dev",
        "Supplier 3",
        UserRole.SUPPLIER,
    )

    missing_auth_response = context.client.get("/api/v1/procurement/orders/my")
    assert missing_auth_response.status_code == 401

    forbidden_user_creation_response = context.client.post(
        "/api/v1/users",
        json={
            "email": "illegal.manager@operix.dev",
            "full_name": "Illegal Manager",
            "role": "manager",
        },
        headers=auth_headers(employee_token),
    )
    assert forbidden_user_creation_response.status_code == 403

    allowed_user_creation_response = context.client.post(
        "/api/v1/users",
        json={
            "email": "created.supplier@operix.dev",
            "full_name": "Created Supplier",
            "role": "supplier",
        },
        headers=auth_headers(manager_token),
    )
    assert allowed_user_creation_response.status_code == 201

    forbidden_pending_response = context.client.get(
        "/api/v1/procurement/requests/pending",
        headers=auth_headers(employee_token),
    )
    assert forbidden_pending_response.status_code == 403

    forbidden_create_request_response = context.client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Invalid supplier request",
            "description": "Supplier should not create requests",
            "amount": "200.00",
            "currency": "USD",
        },
        headers=auth_headers(supplier_token),
    )
    assert forbidden_create_request_response.status_code == 403

    create_request_response = context.client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Monitor purchase",
            "description": "Need monitor for workstation",
            "amount": "350.00",
            "currency": "USD",
        },
        headers=auth_headers(employee_token),
    )
    assert create_request_response.status_code == 201
    purchase_request = create_request_response.json()
    assert purchase_request["requester_id"] == employee["id"]

    approve_response = context.client.post(
        f"/api/v1/procurement/requests/{purchase_request['id']}/review",
        json={"approve": True},
        headers=auth_headers(manager_token),
    )
    assert approve_response.status_code == 200
    assert approve_response.json()["reviewer_id"] == manager["id"]

    create_order_response = context.client.post(
        "/api/v1/procurement/orders",
        json={
            "purchase_request_id": purchase_request["id"],
            "supplier_id": supplier["id"],
        },
        headers=auth_headers(manager_token),
    )
    assert create_order_response.status_code == 201
    purchase_order = create_order_response.json()

    forbidden_supplier_update = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed"},
        headers=auth_headers(supplier_other_token),
    )
    assert forbidden_supplier_update.status_code == 403

    forbidden_manager_supplier_update = context.client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed"},
        headers=auth_headers(manager_token),
    )
    assert forbidden_manager_supplier_update.status_code == 403
