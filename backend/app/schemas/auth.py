from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.base import SchemaBase
from app.schemas.user import UserOut


class RegisterRequest(SchemaBase):
    """Payload for public self-registration with password credentials."""

    email: str = Field(min_length=5, max_length=255)
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Invalid email format.")
        return normalized

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        normalized = value.strip()
        if len(normalized) < 2:
            raise ValueError("Full name must contain at least 2 characters.")
        return normalized


class LoginRequest(SchemaBase):
    """Payload for user login using email and password."""

    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
            raise ValueError("Invalid email format.")
        return normalized


class AuthSessionOut(SchemaBase):
    """Authentication response containing issued bearer token and user profile."""

    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserOut
