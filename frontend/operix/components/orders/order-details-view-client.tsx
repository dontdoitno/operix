"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { Order } from "@/lib/mock-data";
import { UserRole, withRole } from "@/lib/roles";

interface OrderDetailsViewClientProps {
  order: Order;
  role: UserRole;
  canProcessSupplierOrders: boolean;
  relatedRequestText: string;
  relatedRequestLink?: string;
}

export function OrderDetailsViewClient({
  order,
  role,
  canProcessSupplierOrders,
  relatedRequestText,
  relatedRequestLink,
}: OrderDetailsViewClientProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [statusMessage, setStatusMessage] = useState("");

  const handleStatusChange = (nextStatus: Order["status"], message: string) => {
    setCurrentStatus(nextStatus);
    setStatusMessage(message);
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали заказа</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">Заказ {order.id}</h1>
        </div>
        <StatusBadge status={currentStatus} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Карточка заказа</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">ID заказа</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{order.id}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Поставщик</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{order.supplier}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Компания</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{order.companyName}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Статус</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{currentStatus}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Дата создания</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Связанный запрос</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {relatedRequestLink ? (
                  <Link className="text-[#1F2937] hover:text-[#FF5A3C]" href={relatedRequestLink}>
                    {relatedRequestText}
                  </Link>
                ) : (
                  relatedRequestText
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6B7280]">Сумма заказа</p>
            <p className="mt-1 text-xl font-semibold text-[#1F2937]">{formatCurrency(order.total)}</p>
          </div>
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Действия</h2>
          <div className="mt-4 space-y-3">
            <Link href={withRole("/orders", role)}>
              <Button size="sm" variant="secondary">
                Вернуться к заказам
              </Button>
            </Link>

            {canProcessSupplierOrders ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("Подтвержден", "Статус заказа изменен на «Подтвержден».")}
                  size="sm"
                  variant="primary"
                >
                  Принять заказ
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("Отклонен", "Статус заказа изменен на «Отклонен».")}
                  size="sm"
                  variant="secondary"
                >
                  Отклонить заказ
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("Доставлен", "Статус заказа изменен на «Доставлен».")}
                  size="sm"
                  variant="secondary"
                >
                  Отметить как доставленный
                </Button>
              </>
            ) : null}
          </div>

          {statusMessage ? (
            <p className="mt-4 rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] px-3 py-2 text-xs font-medium text-[#166534]">
              {statusMessage}
            </p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
