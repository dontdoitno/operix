from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate


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

    def list_users(self) -> list[User]:
        return self.user_repository.list_all()

    def list_suppliers(self) -> list[User]:
        return self.user_repository.list_by_role(UserRole.SUPPLIER)
