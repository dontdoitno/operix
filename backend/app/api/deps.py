from collections.abc import Callable
from typing import Annotated, Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = User


def get_current_user(
    db: DbSession,
    x_user_id: Optional[str] = Header(default=None, alias="X-User-Id"),
) -> User:
    """Resolve the authenticated user from request headers."""
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="X-User-Id header is required.",
        )

    user = UserRepository(db).get_by_id(x_user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user was not found.",
        )

    return user


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
