from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import UserRole
from app.models.user import User


class UserRepository:
    """Repository for user-related persistence operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.flush()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        return self.db.scalar(stmt)

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.db.scalar(stmt)

    def list_all(self) -> list[User]:
        stmt = select(User).order_by(User.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def list_by_role(self, role: UserRole) -> list[User]:
        stmt = select(User).where(User.role == role).order_by(User.created_at.desc())
        return list(self.db.scalars(stmt).all())
