from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
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
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def create_user(client: TestClient, email: str, full_name: str, role: str) -> dict:
    response = client.post(
        "/api/v1/users",
        json={
            "email": email,
            "full_name": full_name,
            "role": role,
        },
    )
    assert response.status_code == 201
    return response.json()


def test_procurement_lifecycle_success(client: TestClient) -> None:
    employee = create_user(client, "employee@operix.dev", "Employee User", "employee")
    manager = create_user(client, "manager@operix.dev", "Manager User", "manager")
    supplier = create_user(client, "supplier@operix.dev", "Supplier User", "supplier")

    create_request_response = client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Laptop purchase",
            "description": "Need new laptop for engineering tasks",
            "amount": "1800.00",
            "currency": "usd",
        },
        headers={"X-User-Id": employee["id"]},
    )
    assert create_request_response.status_code == 201
    purchase_request = create_request_response.json()
    assert purchase_request["status"] == "pending"
    assert purchase_request["currency"] == "USD"

    pending_response = client.get(
        "/api/v1/procurement/requests/pending",
        headers={"X-User-Id": manager["id"]},
    )
    assert pending_response.status_code == 200
    assert len(pending_response.json()) == 1

    approve_response = client.post(
        f"/api/v1/procurement/requests/{purchase_request['id']}/review",
        json={"approve": True},
        headers={"X-User-Id": manager["id"]},
    )
    assert approve_response.status_code == 200
    approved_request = approve_response.json()
    assert approved_request["status"] == "approved"

    create_order_response = client.post(
        "/api/v1/procurement/orders",
        json={
            "purchase_request_id": purchase_request["id"],
            "supplier_id": supplier["id"],
        },
        headers={"X-User-Id": manager["id"]},
    )
    assert create_order_response.status_code == 201
    purchase_order = create_order_response.json()
    assert purchase_order["status"] == "created"

    confirmed_response = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed", "supplier_note": "Order accepted"},
        headers={"X-User-Id": supplier["id"]},
    )
    assert confirmed_response.status_code == 200
    assert confirmed_response.json()["status"] == "confirmed"

    fulfillment_response = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "in_fulfillment", "supplier_note": "Preparing shipment"},
        headers={"X-User-Id": supplier["id"]},
    )
    assert fulfillment_response.status_code == 200
    assert fulfillment_response.json()["status"] == "in_fulfillment"

    delivered_response = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "delivered", "delivery_note": "Delivered to office reception"},
        headers={"X-User-Id": supplier["id"]},
    )
    assert delivered_response.status_code == 200
    assert delivered_response.json()["status"] == "delivered"

    received_response = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/confirm-received",
        headers={"X-User-Id": employee["id"]},
    )
    assert received_response.status_code == 200
    assert received_response.json()["status"] == "received"


def test_role_restrictions_and_auth_validation(client: TestClient) -> None:
    employee = create_user(client, "employee2@operix.dev", "Employee 2", "employee")
    manager = create_user(client, "manager2@operix.dev", "Manager 2", "manager")
    supplier = create_user(client, "supplier2@operix.dev", "Supplier 2", "supplier")
    supplier_other = create_user(client, "supplier3@operix.dev", "Supplier 3", "supplier")

    missing_auth_response = client.get("/api/v1/procurement/orders/my")
    assert missing_auth_response.status_code == 401

    forbidden_pending_response = client.get(
        "/api/v1/procurement/requests/pending",
        headers={"X-User-Id": employee["id"]},
    )
    assert forbidden_pending_response.status_code == 403

    forbidden_create_request_response = client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Invalid supplier request",
            "description": "Supplier should not create requests",
            "amount": "200.00",
            "currency": "USD",
        },
        headers={"X-User-Id": supplier["id"]},
    )
    assert forbidden_create_request_response.status_code == 403

    create_request_response = client.post(
        "/api/v1/procurement/requests",
        json={
            "title": "Monitor purchase",
            "description": "Need monitor for workstation",
            "amount": "350.00",
            "currency": "USD",
        },
        headers={"X-User-Id": employee["id"]},
    )
    assert create_request_response.status_code == 201
    purchase_request = create_request_response.json()

    approve_response = client.post(
        f"/api/v1/procurement/requests/{purchase_request['id']}/review",
        json={"approve": True},
        headers={"X-User-Id": manager["id"]},
    )
    assert approve_response.status_code == 200

    create_order_response = client.post(
        "/api/v1/procurement/orders",
        json={
            "purchase_request_id": purchase_request["id"],
            "supplier_id": supplier["id"],
        },
        headers={"X-User-Id": manager["id"]},
    )
    assert create_order_response.status_code == 201
    purchase_order = create_order_response.json()

    forbidden_supplier_update = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed"},
        headers={"X-User-Id": supplier_other["id"]},
    )
    assert forbidden_supplier_update.status_code == 403

    forbidden_manager_supplier_update = client.post(
        f"/api/v1/procurement/orders/{purchase_order['id']}/supplier-status",
        json={"status": "confirmed"},
        headers={"X-User-Id": manager["id"]},
    )
    assert forbidden_manager_supplier_update.status_code == 403
