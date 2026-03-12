import { ReactNode } from "react";

import { TopNav } from "@/components/layout/top-nav";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen pb-8">
      <TopNav />
      <main className="mx-auto mt-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
