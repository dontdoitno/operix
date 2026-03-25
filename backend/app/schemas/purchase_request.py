from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import Field, field_validator

from app.models.enums import PurchaseRequestStatus
from app.schemas.base import SchemaBase


class PurchaseRequestCreate(SchemaBase):
    """Payload for employee purchase request creation."""

    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=5)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class PurchaseRequestUpdate(SchemaBase):
    """Payload for employee request updates before approval."""

    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=5)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class PurchaseRequestDecision(SchemaBase):
    """Manager decision payload for request approval or rejection."""

    approve: bool
    rejection_reason: Optional[str] = Field(default=None, min_length=3, max_length=1000)


class PurchaseRequestOut(SchemaBase):
    """Purchase request response payload."""

    id: str
    title: str
    description: str
    amount: Decimal
    currency: str
    status: PurchaseRequestStatus
    requester_id: str
    requester_name: Optional[str]
    reviewer_id: Optional[str]
    reviewer_name: Optional[str]
    rejection_reason: Optional[str]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
