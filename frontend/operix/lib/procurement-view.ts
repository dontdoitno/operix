import {
  ApiOrderStatus,
  ApiPurchaseOrder,
  ApiPurchaseRequest,
  ApiRequestStatus,
} from "@/lib/procurement-api";

export const requestStatusLabels: Record<ApiRequestStatus, string> = {
  pending: "Ожидает",
  approved: "Одобрено",
  rejected: "Отклонено",
  order_created: "Заказ создан",
};

export const orderStatusLabels: Record<ApiOrderStatus, string> = {
  created: "Черновик",
  confirmed: "Подтвержден",
  in_fulfillment: "В исполнении",
  delivered: "Доставлен",
  received: "Получен",
};

export interface RequestViewModel {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  statusLabel: string;
  requesterName: string;
  requesterId: string;
  reviewerName: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderViewModel {
  id: string;
  requestId: string;
  requestTitle: string;
  supplierId: string;
  supplierName: string;
  managerId: string;
  managerName: string;
  status: ApiOrderStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
}

export function mapRequestToViewModel(request: ApiPurchaseRequest): RequestViewModel {
  return {
    id: request.id,
    title: request.title,
    description: request.description,
    amount: Number(request.amount),
    currency: request.currency,
    statusLabel: requestStatusLabels[request.status],
    requesterName: request.requester_name ?? request.requester_id,
    requesterId: request.requester_id,
    reviewerName: request.reviewer_name ?? null,
    rejectionReason: request.rejection_reason ?? null,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}

export function mapOrderToViewModel(order: ApiPurchaseOrder): OrderViewModel {
  return {
    id: order.id,
    requestId: order.purchase_request_id,
    requestTitle: order.purchase_request_title ?? "—",
    supplierId: order.supplier_id,
    supplierName: order.supplier_name ?? order.supplier_id,
    managerId: order.manager_id,
    managerName: order.manager_name ?? order.manager_id,
    status: order.status,
    statusLabel: orderStatusLabels[order.status],
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}
