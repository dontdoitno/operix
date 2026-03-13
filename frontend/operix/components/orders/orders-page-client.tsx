"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { Order, suppliers } from "@/lib/mock-data";
import { UserRole, withRole } from "@/lib/roles";

interface OrdersPageClientProps {
  role: UserRole;
  canManageOrders: boolean;
  initialOrders: Order[];
}

export function OrdersPageClient({ role, canManageOrders, initialOrders }: OrdersPageClientProps) {
  const [ordersState, setOrdersState] = useState<Order[]>(initialOrders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplierName, setSupplierName] = useState(initialOrders[0]?.supplier ?? suppliers[0]?.name ?? "");
  const [companyName, setCompanyName] = useState("Орион Тех");
  const [requestId, setRequestId] = useState("REQ-");
  const [total, setTotal] = useState(1000);
  const [expectedDate, setExpectedDate] = useState("2026-04-01");
  const [notice, setNotice] = useState("");

  const deliveredOrders = useMemo(
    () => ordersState.filter((order) => order.status === "Доставлен").length,
    [ordersState],
  );
  const delayedOrders = useMemo(
    () => ordersState.filter((order) => order.status === "Задержан").length,
    [ordersState],
  );
  const totalOrderValue = useMemo(
    () => ordersState.reduce((sum, order) => sum + order.total, 0),
    [ordersState],
  );

  const handleCreateOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextOrderId = `ORD-${8800 + ordersState.length + 1}`;

    const newOrder: Order = {
      id: nextOrderId,
      supplier: supplierName,
      companyName,
      requestId,
      total,
      createdAt: new Date().toISOString(),
      expectedDate,
      status: "Черновик",
      approvedByManager: false,
    };

    setOrdersState((prevState) => [newOrder, ...prevState]);
    setNotice(`Создан новый заказ ${nextOrderId}. Таблица и показатели обновлены.`);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Заказы</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Отслеживайте ход исполнения, обязательства поставщиков и ожидаемые даты поставки.
            </p>
          </div>
          {canManageOrders ? (
            <Button onClick={() => setIsModalOpen(true)} size="md" variant="primary">
              Создать заказ
            </Button>
          ) : null}
        </div>
        {notice ? <p className="mt-3 text-xs font-medium text-[#166534]">{notice}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего заказов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{ordersState.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Доставлено</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{deliveredOrders}</p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">С задержкой</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{delayedOrders}</p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="flex flex-col gap-1 border-b border-[#E5E7EB] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[#1F2937]">Мониторинг заказов</h2>
          <p className="text-sm text-[#6B7280]">Общая сумма: {formatCurrency(totalOrderValue)}</p>
        </div>
        <Table
          headers={[
            "ID заказа",
            "Поставщик",
            "Компания",
            "ID заявки",
            "Дата создания",
            "Ожидаемая дата",
            "Сумма",
            "Статус",
          ]}
          rows={ordersState.map((order) => ({
            key: order.id,
            cells: [
              <Link
                key={`${order.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/orders/${order.id}`, role)}
              >
                {order.id}
              </Link>,
              <span key={`${order.id}-supplier`} className="font-medium text-[#1F2937]">
                {order.supplier}
              </span>,
              order.companyName,
              order.requestId,
              formatDate(order.createdAt),
              formatDate(order.expectedDate),
              formatCurrency(order.total),
              <StatusBadge key={`${order.id}-status`} status={order.status} />,
            ],
          }))}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Создание заказа"
        footer={
          <>
            <Button onClick={() => setIsModalOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="create-order-form" type="submit">
              Создать
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="create-order-form" onSubmit={handleCreateOrder}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-supplier">
              Поставщик
            </label>
            <select
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="order-supplier"
              onChange={(event) => setSupplierName(event.target.value)}
              value={supplierName}
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-company">
                Компания
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="order-company"
                onChange={(event) => setCompanyName(event.target.value)}
                required
                type="text"
                value={companyName}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-request">
                ID заявки
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="order-request"
                onChange={(event) => setRequestId(event.target.value)}
                required
                type="text"
                value={requestId}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-total">
                Сумма
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="order-total"
                min={100}
                onChange={(event) => setTotal(Number(event.target.value) || 100)}
                required
                type="number"
                value={total}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-date">
                Дата поставки
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="order-date"
                onChange={(event) => setExpectedDate(event.target.value)}
                required
                type="date"
                value={expectedDate}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
