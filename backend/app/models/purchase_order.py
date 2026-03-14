from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import PurchaseOrderStatus


def _enum_values(enum_cls: type[PurchaseOrderStatus]) -> list[str]:
    """Return enum values for SQLAlchemy DB persistence mapping."""
    return [member.value for member in enum_cls]


class PurchaseOrder(Base):
    """Purchase order created from an approved purchase request."""

    __tablename__ = "purchase_orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    purchase_request_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("purchase_requests.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    supplier_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    manager_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    status: Mapped[PurchaseOrderStatus] = mapped_column(
        Enum(
            PurchaseOrderStatus,
            name="purchase_order_status",
            values_callable=_enum_values,
        ),
        nullable=False,
        default=PurchaseOrderStatus.CREATED,
        index=True,
    )

    supplier_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    delivery_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    received_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    purchase_request = relationship("PurchaseRequest", back_populates="purchase_order")
    supplier = relationship("User", foreign_keys=[supplier_id], back_populates="supplied_orders")
    manager = relationship("User", foreign_keys=[manager_id], back_populates="managed_orders")
