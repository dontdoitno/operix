from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError, PermissionDeniedError, ValidationError
from app.models.enums import PurchaseOrderStatus, PurchaseRequestStatus, UserRole
from app.models.purchase_order import PurchaseOrder
from app.models.purchase_request import PurchaseRequest
from app.models.user import User
from app.repositories.purchase_order_repository import PurchaseOrderRepository
from app.repositories.purchase_request_repository import PurchaseRequestRepository
from app.repositories.user_repository import UserRepository
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderStatusUpdate
from app.schemas.purchase_request import PurchaseRequestCreate, PurchaseRequestDecision


class ProcurementService:
    """Application service containing procurement lifecycle business rules."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.user_repository = UserRepository(db)
        self.request_repository = PurchaseRequestRepository(db)
        self.order_repository = PurchaseOrderRepository(db)

    def create_purchase_request(self, employee: User, payload: PurchaseRequestCreate) -> PurchaseRequest:
        if employee.role != UserRole.EMPLOYEE:
            raise PermissionDeniedError("Only employees can create purchase requests.")

        purchase_request = PurchaseRequest(
            title=payload.title,
            description=payload.description,
            amount=payload.amount,
            currency=payload.currency,
            requester_id=employee.id,
            status=PurchaseRequestStatus.PENDING,
        )
        self.request_repository.create(purchase_request)
        self.db.commit()
        self.db.refresh(purchase_request)
        return purchase_request

    def list_employee_requests(self, employee: User) -> list[PurchaseRequest]:
        if employee.role != UserRole.EMPLOYEE:
            raise PermissionDeniedError("Only employees can view their own requests.")
        return self.request_repository.list_by_requester(employee.id)

    def list_pending_requests(self, manager: User) -> list[PurchaseRequest]:
        if manager.role != UserRole.MANAGER:
            raise PermissionDeniedError("Only managers can review pending requests.")
        return self.request_repository.list_pending()

    def review_purchase_request(
        self,
        manager: User,
        request_id: str,
        payload: PurchaseRequestDecision,
    ) -> PurchaseRequest:
        if manager.role != UserRole.MANAGER:
            raise PermissionDeniedError("Only managers can review requests.")

        purchase_request = self.request_repository.get_by_id(request_id)
        if purchase_request is None:
            raise NotFoundError("Purchase request was not found.")

        if purchase_request.status != PurchaseRequestStatus.PENDING:
            raise ConflictError("Only pending requests can be reviewed.")

        purchase_request.reviewer_id = manager.id
        purchase_request.updated_at = datetime.now(timezone.utc)

        if payload.approve:
            purchase_request.status = PurchaseRequestStatus.APPROVED
            purchase_request.approved_at = datetime.now(timezone.utc)
            purchase_request.rejection_reason = None
        else:
            if not payload.rejection_reason:
                raise ValidationError("Rejection reason is required when rejecting a request.")
            purchase_request.status = PurchaseRequestStatus.REJECTED
            purchase_request.rejection_reason = payload.rejection_reason

        self.db.commit()
        self.db.refresh(purchase_request)
        return purchase_request

    def create_purchase_order(self, manager: User, payload: PurchaseOrderCreate) -> PurchaseOrder:
        if manager.role != UserRole.MANAGER:
            raise PermissionDeniedError("Only managers can create purchase orders.")

        purchase_request = self.request_repository.get_by_id(payload.purchase_request_id)
        if purchase_request is None:
            raise NotFoundError("Purchase request was not found.")

        if purchase_request.status != PurchaseRequestStatus.APPROVED:
            raise ConflictError("Only approved requests can be converted to purchase orders.")

        existing_order = self.order_repository.get_by_request_id(payload.purchase_request_id)
        if existing_order is not None:
            raise ConflictError("A purchase order has already been created for this request.")

        supplier = self.user_repository.get_by_id(payload.supplier_id)
        if supplier is None or supplier.role != UserRole.SUPPLIER:
            raise ValidationError("Supplier must reference an existing user with supplier role.")

        purchase_order = PurchaseOrder(
            purchase_request_id=payload.purchase_request_id,
            supplier_id=payload.supplier_id,
            manager_id=manager.id,
            status=PurchaseOrderStatus.CREATED,
        )
        self.order_repository.create(purchase_order)

        purchase_request.status = PurchaseRequestStatus.ORDER_CREATED
        purchase_request.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(purchase_order)
        return purchase_order

    def list_manager_orders(self, manager: User) -> list[PurchaseOrder]:
        if manager.role != UserRole.MANAGER:
            raise PermissionDeniedError("Only managers can view managed orders.")
        return self.order_repository.list_by_manager(manager.id)

    def list_supplier_orders(self, supplier: User) -> list[PurchaseOrder]:
        if supplier.role != UserRole.SUPPLIER:
            raise PermissionDeniedError("Only suppliers can view assigned orders.")
        return self.order_repository.list_by_supplier(supplier.id)

    def list_employee_orders(self, employee: User) -> list[PurchaseOrder]:
        if employee.role != UserRole.EMPLOYEE:
            raise PermissionDeniedError("Only employees can view their purchase orders.")
        return self.order_repository.list_by_requester(employee.id)

    def update_supplier_order_status(
        self,
        supplier: User,
        order_id: str,
        payload: PurchaseOrderStatusUpdate,
    ) -> PurchaseOrder:
        if supplier.role != UserRole.SUPPLIER:
            raise PermissionDeniedError("Only suppliers can update order statuses.")

        purchase_order = self.order_repository.get_by_id(order_id)
        if purchase_order is None:
            raise NotFoundError("Purchase order was not found.")

        if purchase_order.supplier_id != supplier.id:
            raise PermissionDeniedError("Suppliers can only update orders assigned to them.")

        allowed_transitions = {
            PurchaseOrderStatus.CREATED: PurchaseOrderStatus.CONFIRMED,
            PurchaseOrderStatus.CONFIRMED: PurchaseOrderStatus.IN_FULFILLMENT,
            PurchaseOrderStatus.IN_FULFILLMENT: PurchaseOrderStatus.DELIVERED,
        }
        expected_next = allowed_transitions.get(purchase_order.status)
        if expected_next is None or payload.status != expected_next:
            raise ConflictError(
                f"Invalid order transition from '{purchase_order.status}' to '{payload.status}'."
            )

        purchase_order.status = payload.status
        purchase_order.supplier_note = payload.supplier_note
        purchase_order.delivery_note = payload.delivery_note
        purchase_order.updated_at = datetime.now(timezone.utc)

        if payload.status == PurchaseOrderStatus.CONFIRMED:
            purchase_order.confirmed_at = datetime.now(timezone.utc)
        if payload.status == PurchaseOrderStatus.DELIVERED:
            purchase_order.delivered_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(purchase_order)
        return purchase_order

    def confirm_order_received(self, employee: User, order_id: str) -> PurchaseOrder:
        if employee.role != UserRole.EMPLOYEE:
            raise PermissionDeniedError("Only employees can confirm order receipt.")

        purchase_order = self.order_repository.get_by_id(order_id)
        if purchase_order is None:
            raise NotFoundError("Purchase order was not found.")

        if purchase_order.purchase_request.requester_id != employee.id:
            raise PermissionDeniedError("Employees can only confirm receipt for their own orders.")

        if purchase_order.status != PurchaseOrderStatus.DELIVERED:
            raise ConflictError("Only delivered orders can be marked as received.")

        purchase_order.status = PurchaseOrderStatus.RECEIVED
        purchase_order.received_at = datetime.now(timezone.utc)
        purchase_order.updated_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(purchase_order)
        return purchase_order
