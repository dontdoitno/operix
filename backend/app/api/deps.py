from collections.abc import Callable
from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_session_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.auth_session_repository import AuthSessionRepository


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = User


def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    """Extract bearer token from Authorization header value."""
    if authorization is None:
        return None

    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None

    token = authorization[len(prefix) :].strip()
    if not token:
        return None

    return token


def get_current_user(
    db: DbSession,
    authorization: Optional[str] = Header(default=None, alias="Authorization"),
) -> User:
    """Resolve authenticated user strictly by Bearer token."""
    bearer_token = extract_bearer_token(authorization)
    if bearer_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization Bearer token is required.",
        )

    token_hash = hash_session_token(bearer_token)
    auth_session = AuthSessionRepository(db).get_active_by_token_hash(token_hash)
    if auth_session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is invalid or expired.",
        )

    return auth_session.user


def require_roles(*allowed_roles: UserRole) -> Callable[..., User]:
    """Build dependency enforcing role-based access rules."""

    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions for this operation.",
            )
        return current_user

    return _dependency
