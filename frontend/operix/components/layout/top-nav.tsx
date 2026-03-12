"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/requests", label: "Requests" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/orders", label: "Orders" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-white/80 px-5 py-4 shadow-[0_18px_40px_rgba(31,41,55,0.10)] backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-8">
            <Link className="text-2xl font-semibold tracking-tight text-[#1F2937]" href="/">
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
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <input
              aria-label="Search"
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 placeholder:text-[#9CA3AF] focus:ring-4 md:w-64"
              placeholder="Search requests, suppliers..."
              type="search"
            />
            <button
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
              type="button"
            >
              🔔
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2937] text-sm font-semibold text-white">
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
