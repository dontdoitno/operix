from datetime import datetime

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


class UserOut(SchemaBase):
    """User response schema."""

    id: str
    email: str
    full_name: str
    role: UserRole
    created_at: datetime
