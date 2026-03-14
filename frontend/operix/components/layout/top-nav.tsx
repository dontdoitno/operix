"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { clearAuthSession, getAuthSession } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";
import {
  UserRole,
  allRoles,
  parseUserRole,
  roleLabels,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface NavigationItem {
  href: string;
  label: string;
}

interface SessionIdentityState {
  role: UserRole | null;
  name: string | null;
}

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  employee: [
    { href: "/", label: "Главная" },
    { href: "/requests", label: "Запросы" },
  ],
  manager: [
    { href: "/", label: "Главная" },
    { href: "/requests", label: "Запросы" },
    { href: "/suppliers", label: "Поставщики" },
    { href: "/orders", label: "Заказы" },
  ],
  supplier: [
    { href: "/", label: "Главная" },
    { href: "/orders", label: "Заказы" },
    { href: "/merchandise", label: "Товары" },
  ],
};

const identityLabelByRole: Record<UserRole, string> = {
  employee: "Сотрудник",
  manager: "Менеджер",
  supplier: "Компания",
};

const authRoutes = new Set(["/login", "/register", "/logout"]);

function getInitialSessionIdentity(): SessionIdentityState {
  const session = getAuthSession();

  if (!session) {
    return {
      role: null,
      name: null,
    };
  }

  return {
    role: session.user.role,
    name: session.user.full_name,
  };
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionIdentity, setSessionIdentity] = useState<SessionIdentityState>(
    getInitialSessionIdentity,
  );

  const role =
    sessionIdentity.role ?? parseUserRole(searchParams.get("role") ?? undefined);

  if (authRoutes.has(pathname)) {
    return null;
  }

  const navigationItems = navigationByRole[role];
  const currentIdentity = sessionIdentity.name ?? roleProfiles[role].name;

  const handleRoleChange = (nextRole: UserRole) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("role", nextRole);
    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleClearSession = () => {
    clearAuthSession();
    setSessionIdentity({
      role: null,
      name: null,
    });
  };

  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(31,41,55,0.10)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-8">
              <Link className="text-2xl font-semibold tracking-tight text-[#1F2937]" href={withRole("/", role)}>
                Operix
              </Link>
              <nav className="hidden items-center gap-2 md:flex">
                {navigationItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      className={cn(
                        "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#FF5A3C] text-white"
                          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937]",
                      )}
                      href={withRole(item.href, role)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-[#6B7280]" htmlFor="role-select">
                Роль
              </label>
              <select
                className="h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#F3F4F6]"
                disabled={sessionIdentity.role !== null}
                id="role-select"
                onChange={(event) => handleRoleChange(event.target.value as UserRole)}
                value={role}
              >
                {allRoles.map((availableRole) => (
                  <option key={availableRole} value={availableRole}>
                    {roleLabels[availableRole]}
                  </option>
                ))}
              </select>
              <div className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#1F2937]">
                {roleLabels[role]}
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#4B5563]">
                <span className="font-semibold uppercase tracking-wide text-[#6B7280]">
                  {identityLabelByRole[role]}:
                </span>{" "}
                <span className="font-medium text-[#1F2937]">{currentIdentity}</span>
              </div>
              {sessionIdentity.role !== null ? (
                <>
                  <Link href="/logout">
                    <Button size="sm" variant="secondary">
                      Выйти
                    </Button>
                  </Link>
                  <Button onClick={handleClearSession} size="sm" variant="ghost">
                    Очистить локально
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="sm" variant="secondary">
                      Войти
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" variant="primary">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 md:hidden">
            {navigationItems.map((item) => {
              const isActive =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={`mobile-${item.href}`}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#FF5A3C] text-white"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937]",
                  )}
                  href={withRole(item.href, role)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
