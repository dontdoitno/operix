"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  MerchandiseItem,
  Order,
  PurchaseRequest,
  RequestStatus,
  merchandise,
  suppliers,
} from "@/lib/mock-data";
import { UserRole, withRole } from "@/lib/roles";

interface RequestDetailsViewClientProps {
  request: PurchaseRequest;
  role: UserRole;
  canApproveRequest: boolean;
  canEditRequest: boolean;
  relatedOrder: Order | null;
  timeline: Array<{ label: string; date: string }>;
}

export function RequestDetailsViewClient({
  request,
  role,
  canApproveRequest,
  canEditRequest,
  relatedOrder,
  timeline,
}: RequestDetailsViewClientProps) {
  const [requestState, setRequestState] = useState<PurchaseRequest>(request);
  const [statusMessage, setStatusMessage] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [title, setTitle] = useState(request.title);
  const [department, setDepartment] = useState(request.department);
  const [supplierId, setSupplierId] = useState(request.supplierId);
  const [productId, setProductId] = useState(request.productId);
  const [quantity, setQuantity] = useState(request.requestedQuantity);
  const [description, setDescription] = useState(request.description);

  const availableProducts = useMemo(
    () => merchandise.filter((item) => item.supplierId === supplierId),
    [supplierId],
  );

  const selectedProduct: MerchandiseItem | undefined =
    availableProducts.find((item) => item.id === productId) ?? availableProducts[0];

  const safeQuantity = Math.min(Math.max(quantity, 1), selectedProduct?.availableQuantity ?? 1);
  const nextAmount = (selectedProduct?.price ?? 0) * safeQuantity;

  const canEmployeeEditByStatus =
    requestState.status === "На согласовании" || requestState.status === "Отклонено";

  const handleEditSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const selectedSupplier = suppliers.find((supplier) => supplier.id === supplierId);

    setRequestState((prevState) => ({
      ...prevState,
      title,
      department,
      supplierId,
      supplierName: selectedSupplier?.name ?? prevState.supplierName,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      requestedQuantity: safeQuantity,
      unitPrice: selectedProduct.price,
      amount: nextAmount,
      description,
    }));

    setIsEditOpen(false);
    setStatusMessage("Запрос обновлен. Изменения сохранены в карточке.");
  };

  const handleStatusChange = (nextStatus: RequestStatus, message: string) => {
    setRequestState((prevState) => ({
      ...prevState,
      status: nextStatus,
    }));
    setStatusMessage(message);
  };

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали запроса</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">{requestState.title}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{requestState.id}</p>
        </div>
        <StatusBadge status={requestState.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#1F2937]">Карточка запроса</h2>
            {canEditRequest && canEmployeeEditByStatus ? (
              <Button onClick={() => setIsEditOpen(true)} size="sm" variant="secondary">
                Редактировать
              </Button>
            ) : null}
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Название</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{requestState.title}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Описание</dt>
              <dd className="mt-1 text-sm leading-6 text-[#4B5563]">{requestState.description}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Сумма</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatCurrency(requestState.amount)}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Статус</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{requestState.status}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Автор</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{requestState.requester}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Отправлен</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatDate(requestState.submittedAt)}</dd>
            </div>
          </dl>

          {statusMessage ? (
            <p className="mt-4 rounded-xl border border-[#DCFCE7] bg-[#F0FDF4] px-3 py-2 text-xs font-medium text-[#166534]">
              {statusMessage}
            </p>
          ) : null}
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Связанный заказ</h2>
          {relatedOrder ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-sm text-[#6B7280]">ID заказа</p>
              <p className="text-base font-semibold text-[#1F2937]">{relatedOrder.id}</p>
              <p className="text-sm text-[#6B7280]">Поставщик</p>
              <p className="text-sm font-medium text-[#1F2937]">{relatedOrder.supplier}</p>
              <Link href={withRole(`/orders/${relatedOrder.id}`, role)}>
                <Button size="sm" variant="secondary">
                  Открыть детали заказа
                </Button>
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#6B7280]">Для этого запроса заказ еще не создан.</p>
          )}

          <div className="mt-4 space-y-2">
            <Link href={withRole("/requests", role)}>
              <Button size="sm" variant="secondary">
                Вернуться к запросам
              </Button>
            </Link>

            {canApproveRequest ? (
              <>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("Одобрено", "Запрос одобрен менеджером.")}
                  size="sm"
                  variant="primary"
                >
                  Одобрить
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange("Отклонено", "Запрос отклонен менеджером.")}
                  size="sm"
                  variant="secondary"
                >
                  Отклонить
                </Button>
              </>
            ) : null}
          </div>
        </Card>
      </section>

      <Card className="rounded-3xl">
        <h2 className="text-lg font-semibold text-[#1F2937]">Хронология согласования</h2>
        <ol className="mt-4 space-y-4">
          {timeline.map((event) => (
            <li key={`${event.label}-${event.date}`} className="flex gap-4">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#FF5A3C]" />
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{event.label}</p>
                <p className="text-xs text-[#6B7280]">{formatDate(event.date)}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Редактирование запроса"
        footer={
          <>
            <Button onClick={() => setIsEditOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="edit-request-form" type="submit">
              Сохранить
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="edit-request-form" onSubmit={handleEditSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-title">
              Название заявки
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="edit-title"
              onChange={(event) => setTitle(event.target.value)}
              required
              type="text"
              value={title}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-department">
              Отдел
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="edit-department"
              onChange={(event) => setDepartment(event.target.value)}
              required
              type="text"
              value={department}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-supplier">
                Поставщик
              </label>
              <select
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="edit-supplier"
                onChange={(event) => {
                  const nextSupplierId = event.target.value;
                  setSupplierId(nextSupplierId);
                  const firstProduct = merchandise.find((item) => item.supplierId === nextSupplierId);
                  setProductId(firstProduct?.id ?? "");
                  setQuantity(1);
                }}
                value={supplierId}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-product">
                Товар
              </label>
              <select
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="edit-product"
                onChange={(event) => {
                  setProductId(event.target.value);
                  setQuantity(1);
                }}
                value={selectedProduct?.id ?? ""}
              >
                {availableProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — остаток {item.availableQuantity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-quantity">
                Количество
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
                id="edit-quantity"
                max={selectedProduct?.availableQuantity ?? 1}
                min={1}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
                type="number"
                value={safeQuantity}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-amount">
                Сумма
              </label>
              <input
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm font-medium text-[#1F2937]"
                id="edit-amount"
                readOnly
                type="text"
                value={formatCurrency(nextAmount)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-description">
              Описание
            </label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="edit-description"
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
