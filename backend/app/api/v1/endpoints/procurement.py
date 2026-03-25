from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, DbSession, get_current_user, require_roles
from app.models.enums import UserRole
from app.schemas.purchase_order import (
    PurchaseOrderCreate,
    PurchaseOrderOut,
    PurchaseOrderStatusUpdate,
)
from app.schemas.purchase_request import (
    PurchaseRequestCreate,
    PurchaseRequestDecision,
    PurchaseRequestOut,
    PurchaseRequestUpdate,
)
from app.services.procurement_service import ProcurementService

router = APIRouter()


@router.post("/requests", response_model=PurchaseRequestOut, status_code=status.HTTP_201_CREATED)
def create_purchase_request(
    payload: PurchaseRequestCreate,
    db: DbSession,
    employee: Annotated[CurrentUser, Depends(require_roles(UserRole.EMPLOYEE))],
) -> PurchaseRequestOut:
    """Create a new purchase request as an employee."""
    service = ProcurementService(db)
    purchase_request = service.create_purchase_request(employee=employee, payload=payload)
    return PurchaseRequestOut.model_validate(purchase_request)


@router.get("/requests", response_model=list[PurchaseRequestOut])
def list_purchase_requests(
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> list[PurchaseRequestOut]:
    """List purchase requests visible to current user based on role access rules."""
    service = ProcurementService(db)
    return [
        PurchaseRequestOut.model_validate(request)
        for request in service.list_requests_for_user(current_user=current_user)
    ]


@router.get("/requests/my", response_model=list[PurchaseRequestOut])
def list_my_purchase_requests(
    db: DbSession,
    employee: Annotated[CurrentUser, Depends(require_roles(UserRole.EMPLOYEE))],
) -> list[PurchaseRequestOut]:
    """List purchase requests created by the authenticated employee."""
    service = ProcurementService(db)
    return [
        PurchaseRequestOut.model_validate(request)
        for request in service.list_employee_requests(employee=employee)
    ]


@router.get("/requests/pending", response_model=list[PurchaseRequestOut])
def list_pending_requests(
    db: DbSession,
    manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> list[PurchaseRequestOut]:
    """List pending purchase requests for manager review."""
    service = ProcurementService(db)
    return [
        PurchaseRequestOut.model_validate(request)
        for request in service.list_pending_requests(manager=manager)
    ]


@router.get("/requests/{request_id}", response_model=PurchaseRequestOut)
def get_purchase_request(
    request_id: str,
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> PurchaseRequestOut:
    """Get a single purchase request if current user has access."""
    service = ProcurementService(db)
    purchase_request = service.get_request_for_user(current_user=current_user, request_id=request_id)
    return PurchaseRequestOut.model_validate(purchase_request)


@router.put("/requests/{request_id}", response_model=PurchaseRequestOut)
def update_purchase_request(
    request_id: str,
    payload: PurchaseRequestUpdate,
    db: DbSession,
    employee: Annotated[CurrentUser, Depends(require_roles(UserRole.EMPLOYEE))],
) -> PurchaseRequestOut:
    """Update employee purchase request before final approval."""
    service = ProcurementService(db)
    purchase_request = service.update_purchase_request(
        employee=employee,
        request_id=request_id,
        payload=payload,
    )
    return PurchaseRequestOut.model_validate(purchase_request)


@router.post("/requests/{request_id}/review", response_model=PurchaseRequestOut)
def review_purchase_request(
    request_id: str,
    payload: PurchaseRequestDecision,
    db: DbSession,
    manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> PurchaseRequestOut:
    """Approve or reject a pending purchase request as a manager."""
    service = ProcurementService(db)
    purchase_request = service.review_purchase_request(
        manager=manager,
        request_id=request_id,
        payload=payload,
    )
    return PurchaseRequestOut.model_validate(purchase_request)


@router.post("/orders", response_model=PurchaseOrderOut, status_code=status.HTTP_201_CREATED)
def create_purchase_order(
    payload: PurchaseOrderCreate,
    db: DbSession,
    manager: Annotated[CurrentUser, Depends(require_roles(UserRole.MANAGER))],
) -> PurchaseOrderOut:
    """Create a purchase order from an approved request and assign a supplier."""
    service = ProcurementService(db)
    purchase_order = service.create_purchase_order(manager=manager, payload=payload)
    return PurchaseOrderOut.model_validate(purchase_order)


@router.get("/orders/my", response_model=list[PurchaseOrderOut])
def list_my_orders(
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> list[PurchaseOrderOut]:
    """List orders visible to current user based on role ownership rules."""
    service = ProcurementService(db)

    if current_user.role == UserRole.MANAGER:
        orders = service.list_manager_orders(manager=current_user)
    elif current_user.role == UserRole.SUPPLIER:
        orders = service.list_supplier_orders(supplier=current_user)
    else:
        orders = service.list_employee_orders(employee=current_user)

    return [PurchaseOrderOut.model_validate(order) for order in orders]


@router.get("/orders/{order_id}", response_model=PurchaseOrderOut)
def get_order(
    order_id: str,
    db: DbSession,
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> PurchaseOrderOut:
    """Get a single purchase order if current user has access."""
    service = ProcurementService(db)
    purchase_order = service.get_order_for_user(current_user=current_user, order_id=order_id)
    return PurchaseOrderOut.model_validate(purchase_order)


@router.post("/orders/{order_id}/supplier-status", response_model=PurchaseOrderOut)
def update_supplier_order_status(
    order_id: str,
    payload: PurchaseOrderStatusUpdate,
    db: DbSession,
    supplier: Annotated[CurrentUser, Depends(require_roles(UserRole.SUPPLIER))],
) -> PurchaseOrderOut:
    """Update order progress by assigned supplier using valid lifecycle transitions."""
    service = ProcurementService(db)
    purchase_order = service.update_supplier_order_status(
        supplier=supplier,
        order_id=order_id,
        payload=payload,
    )
    return PurchaseOrderOut.model_validate(purchase_order)


@router.post("/orders/{order_id}/confirm-received", response_model=PurchaseOrderOut)
def confirm_order_received(
    order_id: str,
    db: DbSession,
    employee: Annotated[CurrentUser, Depends(require_roles(UserRole.EMPLOYEE))],
) -> PurchaseOrderOut:
    """Confirm final order receipt by the employee who requested the purchase."""
    service = ProcurementService(db)
    purchase_order = service.confirm_order_received(employee=employee, order_id=order_id)
    return PurchaseOrderOut.model_validate(purchase_order)
