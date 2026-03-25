from datetime import datetime
from typing import Optional

from pydantic import Field, field_validator

from app.models.enums import UserRole
from app.schemas.base import SchemaBase


class UserCreate(SchemaBase):
    """Payload for creating a platform user."""

    email: str = Field(min_length=5, max_length=255)
    full_name: str = Field(min_length=2, max_length=255)
    role: UserRole

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Invalid email format.")
        return normalized


class UserUpdate(SchemaBase):
    """Payload for updating mutable user profile fields."""

    email: Optional[str] = Field(default=None, min_length=5, max_length=255)
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=255)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Invalid email format.")
        return normalized

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Full name must contain at least 2 characters.")
        return normalized


class UserOut(SchemaBase):
    """User response schema."""

    id: str
    email: str
    full_name: str
    role: UserRole
    created_at: datetime
