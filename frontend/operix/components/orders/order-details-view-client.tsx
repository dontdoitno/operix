"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/format";
import {
  ApiOrderStatus,
  getOrder,
  updateSupplierOrderStatus,
} from "@/lib/procurement-api";
import { mapOrderToViewModel, OrderViewModel } from "@/lib/procurement-view";
import { UserRole, withRole } from "@/lib/roles";

interface OrderDetailsViewClientProps {
  orderId: string;
  role: UserRole;
  canProcessSupplierOrders: boolean;
}

const nextSupplierStatusMap: Partial<Record<ApiOrderStatus, ApiOrderStatus>> = {
  created: "confirmed",
  confirmed: "in_fulfillment",
  in_fulfillment: "delivered",
};

const nextSupplierActionLabelMap: Partial<Record<ApiOrderStatus, string>> = {
  created: "Подтвердить заказ",
  confirmed: "Перевести в исполнение",
  in_fulfillment: "Отметить как доставленный",
};

export function OrderDetailsViewClient({
  orderId,
  role,
  canProcessSupplierOrders,
}: OrderDetailsViewClientProps) {
  const [order, setOrder] = useState<OrderViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const loadOrder = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const response = await getOrder(orderId);
      setOrder(mapOrderToViewModel(response));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить заказ.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [orderId]);

  const handleSupplierStatusUpdate = async () => {
    if (!order) {
      return;
    }

    const nextStatus = nextSupplierStatusMap[order.status];
    if (!nextStatus) {
      return;
    }

    setErrorText("");

    try {
      const updated = await updateSupplierOrderStatus(order.id, {
        status: nextStatus,
      });
      const mappedOrder = mapOrderToViewModel(updated);
      setOrder(mappedOrder);
      setStatusMessage(`Статус заказа обновлен: ${mappedOrder.statusLabel}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось обновить статус заказа.";
      setErrorText(message);
    }
  };

  if (isLoading) {
    return <Card className="rounded-3xl">Загрузка...</Card>;
  }

  if (!order) {
    return (
      <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">
        {errorText || "Заказ не найден."}
      </Card>
    );
  }

  const nextActionLabel = nextSupplierActionLabelMap[order.status];

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали заказа</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">Заказ {order.id}</h1>
        </div>
        <StatusBadge status={order.statusLabel} />
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card>
      ) : null}

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
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{order.supplierName}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Статус</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{order.statusLabel}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Дата создания</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Связанный запрос</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{order.requestId} — {order.requestTitle}</dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Действия</h2>
          <div className="mt-4 space-y-3">
            <Link href={withRole("/orders", role)}>
              <Button size="sm" variant="secondary">
                Вернуться к заказам
              </Button>
            </Link>

            {canProcessSupplierOrders && nextActionLabel ? (
              <Button className="w-full" onClick={() => void handleSupplierStatusUpdate()} size="sm" variant="primary">
                {nextActionLabel}
              </Button>
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
