from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.purchase_order import PurchaseOrder
from app.models.purchase_request import PurchaseRequest


class PurchaseOrderRepository:
    """Repository for purchase order persistence operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, purchase_order: PurchaseOrder) -> PurchaseOrder:
        self.db.add(purchase_order)
        self.db.flush()
        self.db.refresh(purchase_order)
        return purchase_order

    def get_by_id(self, order_id: str) -> Optional[PurchaseOrder]:
        stmt = select(PurchaseOrder).where(PurchaseOrder.id == order_id)
        return self.db.scalar(stmt)

    def get_by_request_id(self, request_id: str) -> Optional[PurchaseOrder]:
        stmt = select(PurchaseOrder).where(PurchaseOrder.purchase_request_id == request_id)
        return self.db.scalar(stmt)

    def list_all(self) -> list[PurchaseOrder]:
        stmt = select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def list_by_supplier(self, supplier_id: str) -> list[PurchaseOrder]:
        stmt = (
            select(PurchaseOrder)
            .where(PurchaseOrder.supplier_id == supplier_id)
            .order_by(PurchaseOrder.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def list_by_manager(self, manager_id: str) -> list[PurchaseOrder]:
        stmt = (
            select(PurchaseOrder)
            .where(PurchaseOrder.manager_id == manager_id)
            .order_by(PurchaseOrder.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def list_by_requester(self, requester_id: str) -> list[PurchaseOrder]:
        stmt = (
            select(PurchaseOrder)
            .join(PurchaseRequest, PurchaseOrder.purchase_request_id == PurchaseRequest.id)
            .where(PurchaseRequest.requester_id == requester_id)
            .order_by(PurchaseOrder.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())
