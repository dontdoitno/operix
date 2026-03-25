from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, get_current_user, require_roles
from app.core.exceptions import PermissionDeniedError
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.user_service import UserService

router = APIRouter()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: DbSession,
    _manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> UserOut:
    """Create a platform user. Accessible only for managers."""
    service = UserService(db)
    user = service.create_user(payload)
    return UserOut.model_validate(user)


@router.get("/me", response_model=UserOut)
def get_me(
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserOut:
    """Return current authenticated user profile."""
    service = UserService(db)
    user = service.get_user_by_id(current_user.id)
    return UserOut.model_validate(user)


@router.get("/suppliers", response_model=list[UserOut])
def list_suppliers(
    db: DbSession,
    _manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> list[UserOut]:
    """List supplier records for manager assignment workflows."""
    service = UserService(db)
    return [UserOut.model_validate(user) for user in service.list_suppliers()]


@router.get("", response_model=list[UserOut])
def list_users(
    db: DbSession,
    _manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> list[UserOut]:
    """List all users. Accessible only for managers."""
    service = UserService(db)
    return [UserOut.model_validate(user) for user in service.list_users()]


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserOut:
    """Return user profile. Managers can access all users, others only themselves."""
    if current_user.role != UserRole.MANAGER and current_user.id != user_id:
        raise PermissionDeniedError("You do not have enough permissions for this operation.")

    service = UserService(db)
    user = service.get_user_by_id(user_id=user_id)
    return UserOut.model_validate(user)


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserOut:
    """Update user profile. Managers can edit any user, others can edit only themselves."""
    if current_user.role != UserRole.MANAGER and current_user.id != user_id:
        raise PermissionDeniedError("You do not have enough permissions for this operation.")

    service = UserService(db)
    user = service.update_user_profile(user_id=user_id, payload=payload)
    return UserOut.model_validate(user)
