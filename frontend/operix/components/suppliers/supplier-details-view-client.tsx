"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { MerchandiseItem, Order, Supplier } from "@/lib/mock-data";
import { UserRole, withRole } from "@/lib/roles";

interface SupplierDetailsViewClientProps {
  role: UserRole;
  supplier: Supplier;
  relatedOrders: Order[];
  availableProducts: MerchandiseItem[];
}

export function SupplierDetailsViewClient({
  role,
  supplier,
  relatedOrders,
  availableProducts,
}: SupplierDetailsViewClientProps) {
  const [supplierState, setSupplierState] = useState<Supplier>(supplier);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const [name, setName] = useState(supplier.name);
  const [industry, setIndustry] = useState(supplier.industry);
  const [email, setEmail] = useState(supplier.email);
  const [phone, setPhone] = useState(supplier.phone);

  const performanceLabel = useMemo(() => `${supplierState.performance}%`, [supplierState.performance]);

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSupplierState((prevState) => ({
      ...prevState,
      name,
      industry,
      category: industry,
      email,
      phone,
    }));

    setNotice("Карточка поставщика обновлена. Изменения отображаются на экране.");
    setIsEditOpen(false);
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали поставщика</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {supplierState.name}
          </h1>
        </div>
        <Button onClick={() => setIsEditOpen(true)} size="sm" variant="secondary">
          Редактировать поставщика
        </Button>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-[#DCFCE7] bg-[#F0FDF4] px-4 py-3 text-sm font-medium text-[#166534]">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Карточка поставщика</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Название компании</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{supplierState.name}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Отрасль</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplierState.industry}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Эффективность</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{performanceLabel}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Email</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplierState.email}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Телефон</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplierState.phone}</dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Быстрые действия</h2>
          <div className="mt-4 space-y-3">
            <Link href={withRole("/suppliers", role)}>
              <Button size="sm" variant="secondary">
                Вернуться к поставщикам
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Доступные товары для заказа</h2>
        </div>
        <Table
          headers={["Товар", "Доступное количество", "Цена"]}
          rows={availableProducts.map((item) => ({
            key: item.id,
            cells: [item.name, item.availableQuantity, formatCurrency(item.price)],
          }))}
        />
      </Card>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Связанные заказы</h2>
        </div>
        <Table
          headers={[
            "ID заказа",
            "Статус",
            "Дата создания",
            "Ожидаемая дата",
            "Сумма",
          ]}
          rows={relatedOrders.map((order) => ({
            key: order.id,
            cells: [
              <Link
                key={`${order.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/orders/${order.id}`, role)}
              >
                {order.id}
              </Link>,
              <StatusBadge key={`${order.id}-status`} status={order.status} />,
              formatDate(order.createdAt),
              formatDate(order.expectedDate),
              formatCurrency(order.total),
            ],
          }))}
        />
      </Card>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Редактирование поставщика"
        footer={
          <>
            <Button onClick={() => setIsEditOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="edit-supplier-form" type="submit">
              Сохранить
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="edit-supplier-form" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-name">
              Название компании
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="supplier-name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-industry">
              Отрасль
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="supplier-industry"
              onChange={(event) => setIndustry(event.target.value)}
              required
              type="text"
              value={industry}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-email">
                Email
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="supplier-email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-phone">
                Телефон
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="supplier-phone"
                onChange={(event) => setPhone(event.target.value)}
                required
                type="text"
                value={phone}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
