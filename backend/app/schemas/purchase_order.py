from datetime import datetime
from typing import Optional

from pydantic import Field, field_validator

from app.models.enums import PurchaseOrderStatus
from app.schemas.base import SchemaBase


class PurchaseOrderCreate(SchemaBase):
    """Payload for manager purchase order creation from approved request."""

    purchase_request_id: str = Field(min_length=36, max_length=36)
    supplier_id: str = Field(min_length=36, max_length=36)


class PurchaseOrderStatusUpdate(SchemaBase):
    """Payload for supplier-driven purchase order status updates."""

    status: PurchaseOrderStatus
    supplier_note: Optional[str] = Field(default=None, max_length=1000)
    delivery_note: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("status")
    @classmethod
    def validate_supplier_status(cls, value: PurchaseOrderStatus) -> PurchaseOrderStatus:
        allowed = {
            PurchaseOrderStatus.CONFIRMED,
            PurchaseOrderStatus.IN_FULFILLMENT,
            PurchaseOrderStatus.DELIVERED,
        }
        if value not in allowed:
            raise ValueError("Supplier can only set confirmed, in_fulfillment, or delivered status.")
        return value


class PurchaseOrderOut(SchemaBase):
    """Purchase order response payload."""

    id: str
    purchase_request_id: str
    supplier_id: str
    manager_id: str
    status: PurchaseOrderStatus
    supplier_note: Optional[str]
    delivery_note: Optional[str]
    confirmed_at: Optional[datetime]
    delivered_at: Optional[datetime]
    received_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
