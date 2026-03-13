import { ReactNode, Suspense } from "react";

import { TopNav } from "@/components/layout/top-nav";

interface AppShellProps {
  children: ReactNode;
}

function TopNavFallback() {
  return (
    <header className="sticky top-0 z-20" aria-hidden>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-[88px] rounded-3xl border border-white/40 bg-white/70 shadow-[0_18px_40px_rgba(31,41,55,0.08)] backdrop-blur" />
      </div>
    </header>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen pb-8">
      <Suspense fallback={<TopNavFallback />}>
        <TopNav />
      </Suspense>
      <main className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
