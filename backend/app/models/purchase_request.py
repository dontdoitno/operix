from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import uuid4

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import PurchaseRequestStatus


def _enum_values(enum_cls: type[PurchaseRequestStatus]) -> list[str]:
    """Return enum values for SQLAlchemy DB persistence mapping."""
    return [member.value for member in enum_cls]


class PurchaseRequest(Base):
    """Purchase request created by an employee and reviewed by a manager."""

    __tablename__ = "purchase_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    status: Mapped[PurchaseRequestStatus] = mapped_column(
        Enum(
            PurchaseRequestStatus,
            name="purchase_request_status",
            values_callable=_enum_values,
        ),
        nullable=False,
        default=PurchaseRequestStatus.PENDING,
        index=True,
    )

    requester_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reviewer_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    requester = relationship("User", foreign_keys=[requester_id], back_populates="purchase_requests")
    reviewer = relationship("User", foreign_keys=[reviewer_id], back_populates="reviewed_requests")
    purchase_order = relationship("PurchaseOrder", back_populates="purchase_request", uselist=False)
