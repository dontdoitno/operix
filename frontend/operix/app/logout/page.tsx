"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { getAuthSession, clearAuthSession } from "@/lib/auth-storage";
import { logoutRequest } from "@/lib/api";

export default function LogoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Завершаем сессию...");

  useEffect(() => {
    const logout = async () => {
      const session = getAuthSession();

      if (!session) {
        setMessage("Сессия не найдена. Перенаправляем на вход.");
        router.replace("/login");
        return;
      }

      try {
        await logoutRequest(session.accessToken);
        setMessage("Вы успешно вышли из аккаунта. Перенаправляем...");
      } catch {
        setMessage("Сессия завершена локально. Перенаправляем на вход...");
      } finally {
        clearAuthSession();
        router.replace("/login");
      }
    };

    void logout();
  }, [router]);

  return (
    <div className="mx-auto mt-20 w-full max-w-md pb-8">
      <Card className="rounded-3xl p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#1F2937]">Выход из Operix</h1>
        <p className="mt-3 text-sm text-[#6B7280]">{message}</p>
      </Card>
    </div>
  );
}
