from datetime import datetime

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_session_token,
    get_session_expiration,
    hash_password,
    hash_session_token,
    verify_password,
)
from app.models.auth_session import AuthSession
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.auth_session_repository import AuthSessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    """Application service for authentication workflows and session lifecycle."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.auth_session_repository = AuthSessionRepository(db)

    def register(self, payload: RegisterRequest) -> tuple[User, str, datetime]:
        """Create a new employee account and issue an authenticated session token."""
        existing_user = self.user_repository.get_by_email(payload.email)
        if existing_user is not None:
            raise ConflictError("User with this email already exists.")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            role=UserRole.EMPLOYEE,
            password_hash=hash_password(payload.password),
        )
        self.user_repository.create(user)

        raw_token = create_session_token()
        expires_at = get_session_expiration()
        session = AuthSession(
            user_id=user.id,
            token_hash=hash_session_token(raw_token),
            expires_at=expires_at,
        )
        self.auth_session_repository.create(session)

        self.db.commit()
        self.db.refresh(user)
        return user, raw_token, expires_at

    def login(self, payload: LoginRequest) -> tuple[User, str, datetime]:
        """Validate credentials and create a fresh authenticated session token."""
        user = self.user_repository.get_by_email(payload.email)
        if user is None or not verify_password(payload.password, user.password_hash):
            raise UnauthorizedError("Invalid email or password.")

        raw_token = create_session_token()
        expires_at = get_session_expiration()
        session = AuthSession(
            user_id=user.id,
            token_hash=hash_session_token(raw_token),
            expires_at=expires_at,
        )
        self.auth_session_repository.create(session)

        self.db.commit()
        self.db.refresh(user)
        return user, raw_token, expires_at

    def logout(self, raw_token: str) -> None:
        """Revoke an active session token to terminate user authentication."""
        token_hash = hash_session_token(raw_token)
        session = self.auth_session_repository.get_active_by_token_hash(token_hash)
        if session is None:
            raise UnauthorizedError("Invalid or expired authentication token.")

        self.auth_session_repository.revoke(session)
        self.db.commit()
