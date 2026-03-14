export type ApiUserRole = "employee" | "manager" | "supplier";

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  role: ApiUserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  expires_at: string;
  user: ApiUser;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  full_name: string;
  role: ApiUserRole;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
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

export function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(accessToken: string): Promise<void> {
  return request<void>("/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
