"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Card } from "@/components/ui/card";
import { loginRequest } from "@/lib/api";
import { saveAuthSession } from "@/lib/auth-storage";
import { withRole } from "@/lib/roles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await loginRequest({ email, password });

      saveAuthSession({
        accessToken: response.access_token,
        expiresAt: response.expires_at,
        user: response.user,
      });

      router.push(withRole("/", response.user.role));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось выполнить вход.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-md pb-8">
      <Card className="rounded-3xl p-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#6B7280]">Добро пожаловать в Operix</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Вход в аккаунт</h1>
          <p className="text-sm text-[#6B7280]">
            Введите email и пароль, чтобы перейти в рабочее пространство закупок.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="email">
              Email
            </label>
            <input
              className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="password">
              Пароль
            </label>
            <input
              className="h-11 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Введите пароль"
              required
              type="password"
              value={password}
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
              {errorMessage}
            </p>
          ) : null}

          <button
            className="h-11 w-full rounded-xl bg-[#FF5A3C] text-sm font-medium text-white transition-colors hover:bg-[#E84D31] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Выполняем вход..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-sm text-[#6B7280]">
          Еще нет аккаунта?{" "}
          <Link className="font-medium text-[#FF5A3C]" href="/register">
            Зарегистрироваться
          </Link>
        </p>
      </Card>
    </div>
  );
}
