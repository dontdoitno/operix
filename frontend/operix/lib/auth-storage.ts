import { ApiUser } from "@/lib/api";

const AUTH_SESSION_STORAGE_KEY = "operix.auth.session";

export interface StoredAuthSession {
  accessToken: string;
  expiresAt: string;
  user: ApiUser;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthSession(session: StoredAuthSession): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getAuthSession(): StoredAuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredAuthSession;

    if (!parsed.accessToken || !parsed.expiresAt || !parsed.user?.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}
