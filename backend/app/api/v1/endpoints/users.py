from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, require_roles
from app.models.enums import UserRole
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService

router = APIRouter()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: DbSession) -> UserOut:
    """Create a platform user (employee, manager, or supplier)."""
    service = UserService(db)
    user = service.create_user(payload)
    return UserOut.model_validate(user)


@router.get("", response_model=list[UserOut])
def list_users(
    db: DbSession,
    _manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> list[UserOut]:
    """List all users. Accessible only for managers."""
    service = UserService(db)
    return [UserOut.model_validate(user) for user in service.list_users()]


@router.get("/suppliers", response_model=list[UserOut])
def list_suppliers(
    db: DbSession,
    _manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> list[UserOut]:
    """List supplier records for manager assignment workflows."""
    service = UserService(db)
    return [UserOut.model_validate(user) for user in service.list_suppliers()]
