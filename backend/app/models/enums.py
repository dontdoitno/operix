from enum import Enum


class UserRole(str, Enum):
    """System roles for access control."""

    EMPLOYEE = "employee"
    MANAGER = "manager"
    SUPPLIER = "supplier"


class PurchaseRequestStatus(str, Enum):
    """Lifecycle statuses of a purchase request."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ORDER_CREATED = "order_created"


class PurchaseOrderStatus(str, Enum):
    """Lifecycle statuses of a purchase order."""

    CREATED = "created"
    CONFIRMED = "confirmed"
    IN_FULFILLMENT = "in_fulfillment"
    DELIVERED = "delivered"
    RECEIVED = "received"
