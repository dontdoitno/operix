from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import PurchaseRequestStatus
from app.models.purchase_request import PurchaseRequest


class PurchaseRequestRepository:
    """Repository for purchase request persistence operations."""

    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, purchase_request: PurchaseRequest) -> PurchaseRequest:
        self.db.add(purchase_request)
        self.db.flush()
        self.db.refresh(purchase_request)
        return purchase_request

    def get_by_id(self, request_id: str) -> Optional[PurchaseRequest]:
        stmt = select(PurchaseRequest).where(PurchaseRequest.id == request_id)
        return self.db.scalar(stmt)

    def list_all(self) -> list[PurchaseRequest]:
        stmt = select(PurchaseRequest).order_by(PurchaseRequest.created_at.desc())
        return list(self.db.scalars(stmt).all())

    def list_by_requester(self, requester_id: str) -> list[PurchaseRequest]:
        stmt = (
            select(PurchaseRequest)
            .where(PurchaseRequest.requester_id == requester_id)
            .order_by(PurchaseRequest.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def list_pending(self) -> list[PurchaseRequest]:
        stmt = (
            select(PurchaseRequest)
            .where(PurchaseRequest.status == PurchaseRequestStatus.PENDING)
            .order_by(PurchaseRequest.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())

    def list_approved(self) -> list[PurchaseRequest]:
        stmt = (
            select(PurchaseRequest)
            .where(PurchaseRequest.status == PurchaseRequestStatus.APPROVED)
            .order_by(PurchaseRequest.created_at.desc())
        )
        return list(self.db.scalars(stmt).all())
