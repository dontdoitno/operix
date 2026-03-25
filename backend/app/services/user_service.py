from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    """Application service for user-related business workflows."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)

    def create_user(self, payload: UserCreate) -> User:
        existing_user = self.user_repository.get_by_email(payload.email)
        if existing_user is not None:
            raise ConflictError("User with this email already exists.")

        user = User(
            email=str(payload.email),
            full_name=payload.full_name,
            role=payload.role,
        )
        self.user_repository.create(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_id(self, user_id: str) -> User:
        user = self.user_repository.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User was not found.")
        return user

    def list_users(self) -> list[User]:
        return self.user_repository.list_all()

    def list_suppliers(self) -> list[User]:
        return self.user_repository.list_by_role(UserRole.SUPPLIER)

    def update_user_profile(self, user_id: str, payload: UserUpdate) -> User:
        user = self.user_repository.get_by_id(user_id)
        if user is None:
            raise NotFoundError("User was not found.")

        if payload.email is not None and payload.email != user.email:
            existing_user = self.user_repository.get_by_email(payload.email)
            if existing_user is not None and existing_user.id != user.id:
                raise ConflictError("User with this email already exists.")
            user.email = payload.email

        if payload.full_name is not None:
            user.full_name = payload.full_name

        self.db.commit()
        self.db.refresh(user)
        return user
