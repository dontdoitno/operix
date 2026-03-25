from collections.abc import Generator

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.security import hash_session_token
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.auth_session import AuthSession
from app.models.enums import UserRole
from app.models.user import User


class AuthApiContext:
    """Container for API client and SQLAlchemy session factory used in auth tests."""

    def __init__(self, client: TestClient, session_factory: sessionmaker) -> None:
        self.client = client
        self.session_factory = session_factory


def _build_test_context() -> Generator[AuthApiContext, None, None]:
    """Create API client with isolated in-memory SQLite DB shared across sessions."""
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
        yield AuthApiContext(test_client, testing_session_local)

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_register_creates_user_and_session_in_database() -> None:
    context_generator = _build_test_context()
    context = next(context_generator)

    try:
        register_response = context.client.post(
            "/api/v1/register",
            json={
                "email": "new.employee@operix.dev",
                "full_name": "Новый Сотрудник",
                "password": "StrongPass123",
            },
        )

        assert register_response.status_code == 201
        payload = register_response.json()
        assert payload["user"]["email"] == "new.employee@operix.dev"
        assert payload["user"]["role"] == "employee"
        assert payload["access_token"]
        assert payload["token_type"] == "bearer"

        with context.session_factory() as db:
            users = list(db.scalars(select(User)).all())
            sessions = list(db.scalars(select(AuthSession)).all())

        assert len(users) == 1
        assert users[0].password_hash is not None
        assert users[0].password_hash != "StrongPass123"

        assert len(sessions) == 1
        assert sessions[0].user_id == users[0].id
        assert sessions[0].revoked_at is None
    finally:
        try:
            next(context_generator)
        except StopIteration:
            pass


def test_register_ignores_privileged_role_and_creates_employee() -> None:
    context_generator = _build_test_context()
    context = next(context_generator)

    try:
        register_response = context.client.post(
            "/api/v1/register",
            json={
                "email": "spoofed.manager@operix.dev",
                "full_name": "Попытка Эскалации",
                "password": "StrongPass123",
                "role": "manager",
            },
        )

        assert register_response.status_code == 201
        payload = register_response.json()
        assert payload["user"]["role"] == "employee"

        with context.session_factory() as db:
            created_user = db.scalar(select(User).where(User.email == "spoofed.manager@operix.dev"))

        assert created_user is not None
        assert created_user.role == UserRole.EMPLOYEE
    finally:
        try:
            next(context_generator)
        except StopIteration:
            pass


def test_login_logout_cycle_revokes_session_and_blocks_future_requests() -> None:
    context_generator = _build_test_context()
    context = next(context_generator)

    try:
        register_response = context.client.post(
            "/api/v1/register",
            json={
                "email": "secure.employee@operix.dev",
                "full_name": "Безопасный Сотрудник",
                "password": "AnotherStrongPass123",
            },
        )
        assert register_response.status_code == 201

        login_response = context.client.post(
            "/api/v1/login",
            json={
                "email": "secure.employee@operix.dev",
                "password": "AnotherStrongPass123",
            },
        )
        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"]
        assert access_token

        logout_response = context.client.post(
            "/api/v1/logout",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert logout_response.status_code == 204

        blocked_response = context.client.get(
            "/api/v1/procurement/requests/my",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert blocked_response.status_code == 401

        login_token_hash = hash_session_token(access_token)
        with context.session_factory() as db:
            revoked_session = db.scalar(
                select(AuthSession).where(AuthSession.token_hash == login_token_hash)
            )

        assert revoked_session is not None
        assert revoked_session.revoked_at is not None
    finally:
        try:
            next(context_generator)
        except StopIteration:
            pass


def test_login_with_wrong_password_returns_unauthorized() -> None:
    context_generator = _build_test_context()
    context = next(context_generator)

    try:
        register_response = context.client.post(
            "/api/v1/register",
            json={
                "email": "supplier.auth@operix.dev",
                "full_name": "Пользователь Авторизации",
                "password": "SupplierPass123",
            },
        )
        assert register_response.status_code == 201

        login_response = context.client.post(
            "/api/v1/login",
            json={
                "email": "supplier.auth@operix.dev",
                "password": "WrongPassword123",
            },
        )
        assert login_response.status_code == 401
        assert login_response.json()["detail"] == "Invalid email or password."
    finally:
        try:
            next(context_generator)
        except StopIteration:
            pass
