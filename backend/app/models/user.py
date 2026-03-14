from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base
from app.models.enums import UserRole


def _enum_values(enum_cls: type[UserRole]) -> list[str]:
    """Return enum values for SQLAlchemy DB persistence mapping."""
    return [member.value for member in enum_cls]


class User(Base):
    """System user model used for employees, managers, and suppliers."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=_enum_values),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    purchase_requests = relationship(
        "PurchaseRequest",
        back_populates="requester",
        foreign_keys="PurchaseRequest.requester_id",
        cascade="all,delete-orphan",
    )
    reviewed_requests = relationship(
        "PurchaseRequest",
        back_populates="reviewer",
        foreign_keys="PurchaseRequest.reviewer_id",
    )
    supplied_orders = relationship(
        "PurchaseOrder",
        back_populates="supplier",
        foreign_keys="PurchaseOrder.supplier_id",
    )
    managed_orders = relationship(
        "PurchaseOrder",
        back_populates="manager",
        foreign_keys="PurchaseOrder.manager_id",
    )
