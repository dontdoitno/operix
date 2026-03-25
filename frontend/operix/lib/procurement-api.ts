import { getAuthSession } from "@/lib/auth-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export type ApiRequestStatus = "pending" | "approved" | "rejected" | "order_created";
export type ApiOrderStatus = "created" | "confirmed" | "in_fulfillment" | "delivered" | "received";

export interface ApiPurchaseRequest {
  id: string;
  title: string;
  description: string;
  amount: string;
  currency: string;
  status: ApiRequestStatus;
  requester_id: string;
  requester_name?: string | null;
  reviewer_id?: string | null;
  reviewer_name?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiPurchaseOrder {
  id: string;
  purchase_request_id: string;
  purchase_request_title?: string | null;
  supplier_id: string;
  supplier_name?: string | null;
  manager_id: string;
  manager_name?: string | null;
  status: ApiOrderStatus;
  supplier_note?: string | null;
  delivery_note?: string | null;
  confirmed_at?: string | null;
  delivered_at?: string | null;
  received_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: "employee" | "manager" | "supplier";
  created_at: string;
}

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
  headers?: HeadersInit;
}

function getAccessToken(): string {
  const session = getAuthSession();
  if (!session?.accessToken) {
    throw new Error("Сессия не найдена. Выполните вход снова.");
  }

  return session.accessToken;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set("Content-Type", "application/json");

  if (options.authRequired !== false) {
    headers.set("Authorization", `Bearer ${getAccessToken()}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detail = "Ошибка запроса к серверу.";

    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        detail = payload.detail;
      }
    } catch {
      // Keep default detail for non-JSON responses.
    }

    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export function listPurchaseRequests(): Promise<ApiPurchaseRequest[]> {
  return request<ApiPurchaseRequest[]>("/procurement/requests");
}

export function getPurchaseRequest(requestId: string): Promise<ApiPurchaseRequest> {
  return request<ApiPurchaseRequest>(`/procurement/requests/${requestId}`);
}

export function createPurchaseRequest(payload: {
  title: string;
  description: string;
  amount: number;
  currency: string;
}): Promise<ApiPurchaseRequest> {
  return request<ApiPurchaseRequest>("/procurement/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updatePurchaseRequest(
  requestId: string,
  payload: { title: string; description: string; amount: number; currency: string },
): Promise<ApiPurchaseRequest> {
  return request<ApiPurchaseRequest>(`/procurement/requests/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function reviewPurchaseRequest(
  requestId: string,
  payload: { approve: boolean; rejection_reason?: string },
): Promise<ApiPurchaseRequest> {
  return request<ApiPurchaseRequest>(`/procurement/requests/${requestId}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function listOrders(): Promise<ApiPurchaseOrder[]> {
  return request<ApiPurchaseOrder[]>("/procurement/orders/my");
}

export function getOrder(orderId: string): Promise<ApiPurchaseOrder> {
  return request<ApiPurchaseOrder>(`/procurement/orders/${orderId}`);
}

export function createOrder(payload: {
  purchase_request_id: string;
  supplier_id: string;
}): Promise<ApiPurchaseOrder> {
  return request<ApiPurchaseOrder>("/procurement/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSupplierOrderStatus(
  orderId: string,
  payload: { status: ApiOrderStatus; supplier_note?: string; delivery_note?: string },
): Promise<ApiPurchaseOrder> {
  return request<ApiPurchaseOrder>(`/procurement/orders/${orderId}/supplier-status`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmOrderReceived(orderId: string): Promise<ApiPurchaseOrder> {
  return request<ApiPurchaseOrder>(`/procurement/orders/${orderId}/confirm-received`, {
    method: "POST",
  });
}

export function listSuppliers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/users/suppliers");
}

export function listUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/users");
}

export function getCurrentUser(): Promise<ApiUser> {
  return request<ApiUser>("/users/me");
}

export function getUserById(userId: string): Promise<ApiUser> {
  return request<ApiUser>(`/users/${userId}`);
}

export function updateUser(
  userId: string,
  payload: { full_name?: string; email?: string },
): Promise<ApiUser> {
  return request<ApiUser>(`/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
