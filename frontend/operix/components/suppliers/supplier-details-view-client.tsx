"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { getUserById, listOrders, updateUser } from "@/lib/procurement-api";
import { mapOrderToViewModel, OrderViewModel } from "@/lib/procurement-view";
import { UserRole, withRole } from "@/lib/roles";

interface SupplierDetailsViewClientProps {
  role: UserRole;
  supplierId: string;
  canEditSupplier: boolean;
}

export function SupplierDetailsViewClient({
  role,
  supplierId,
  canEditSupplier,
}: SupplierDetailsViewClientProps) {
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [relatedOrders, setRelatedOrders] = useState<OrderViewModel[]>([]);

  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [noticeText, setNoticeText] = useState("");

  const loadSupplierDetails = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const [supplierResponse, ordersResponse] = await Promise.all([
        getUserById(supplierId),
        listOrders(),
      ]);

      setSupplierName(supplierResponse.full_name);
      setSupplierEmail(supplierResponse.email);
      setNameInput(supplierResponse.full_name);
      setEmailInput(supplierResponse.email);

      const mappedOrders = ordersResponse
        .map(mapOrderToViewModel)
        .filter((order) => order.supplierId === supplierId);
      setRelatedOrders(mappedOrders);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить карточку поставщика.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSupplierDetails();
  }, [supplierId]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorText("");
    setIsSaving(true);

    try {
      const updatedSupplier = await updateUser(supplierId, {
        full_name: nameInput,
        email: emailInput,
      });

      setSupplierName(updatedSupplier.full_name);
      setSupplierEmail(updatedSupplier.email);
      setNoticeText("Данные поставщика обновлены и сохранены в базе данных.");
      setIsEditOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось сохранить изменения поставщика.";
      setErrorText(message);
    } finally {
      setIsSaving(false);
    }
  };

  const deliveredOrdersCount = useMemo(
    () => relatedOrders.filter((order) => order.statusLabel === "Доставлен").length,
    [relatedOrders],
  );

  if (isLoading) {
    return <Card className="rounded-3xl">Загрузка...</Card>;
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали поставщика</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">{supplierName || "—"}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{supplierId}</p>
        </div>
        {canEditSupplier ? (
          <Button onClick={() => setIsEditOpen(true)} size="sm" variant="secondary">
            Редактировать поставщика
          </Button>
        ) : null}
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card>
      ) : null}

      {noticeText ? (
        <Card className="rounded-3xl border border-[#DCFCE7] bg-[#F0FDF4] text-[#166534]">{noticeText}</Card>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Связанные заказы</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{relatedOrders.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Доставлено заказов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{deliveredOrdersCount}</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Карточка поставщика</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Название поставщика</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{supplierName || "Не указано"}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Email</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplierEmail || "Не указано"}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Телефон</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">Не указан в профиле</dd>
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
          <h2 className="text-lg font-semibold text-[#1F2937]">Связанные заказы</h2>
        </div>
        <Table
          headers={["ID заказа", "Статус", "Дата создания", "Связанный запрос", "Детали"]}
          rows={relatedOrders.map((order) => ({
            key: order.id,
            cells: [
              order.id,
              <StatusBadge key={`${order.id}-status`} status={order.statusLabel} />,
              formatDate(order.createdAt),
              `${order.requestId} — ${order.requestTitle}`,
              <Link
                key={`${order.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/orders/${order.id}`, role)}
              >
                Открыть
              </Link>,
            ],
          }))}
        />
        {relatedOrders.length === 0 ? (
          <p className="px-6 py-4 text-sm text-[#6B7280]">Для поставщика пока нет связанных заказов.</p>
        ) : null}
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
              {isSaving ? "Сохраняем..." : "Сохранить"}
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="edit-supplier-form" onSubmit={handleSave}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-name">
              Название поставщика
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="supplier-name"
              onChange={(event) => setNameInput(event.target.value)}
              required
              type="text"
              value={nameInput}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="supplier-email">
              Email
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="supplier-email"
              onChange={(event) => setEmailInput(event.target.value)}
              required
              type="email"
              value={emailInput}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
