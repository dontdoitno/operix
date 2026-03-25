"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  createOrder,
  getPurchaseRequest,
  listOrders,
  listSuppliers,
  reviewPurchaseRequest,
  updatePurchaseRequest,
} from "@/lib/procurement-api";
import { mapOrderToViewModel, mapRequestToViewModel, OrderViewModel, RequestViewModel } from "@/lib/procurement-view";
import { UserRole, withRole } from "@/lib/roles";

interface RequestDetailsViewClientProps {
  requestId: string;
  role: UserRole;
  canApproveRequest: boolean;
  canEditRequest: boolean;
}

export function RequestDetailsViewClient({
  requestId,
  role,
  canApproveRequest,
  canEditRequest,
}: RequestDetailsViewClientProps) {
  const [requestState, setRequestState] = useState<RequestViewModel | null>(null);
  const [relatedOrder, setRelatedOrder] = useState<OrderViewModel | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(1);
  const [description, setDescription] = useState("");

  const [suppliers, setSuppliers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);

  const canEmployeeEditByStatus =
    requestState?.statusLabel === "Ожидает" || requestState?.statusLabel === "Отклонено";

  const timeline = useMemo(() => {
    if (!requestState) {
      return [] as Array<{ label: string; date: string }>;
    }

    const baseTimeline = [{ label: "Запрос создан", date: requestState.createdAt }];

    if (requestState.statusLabel === "Одобрено" || requestState.statusLabel === "Заказ создан") {
      baseTimeline.push({ label: "Одобрен менеджером", date: requestState.updatedAt });
    }

    if (requestState.statusLabel === "Отклонено") {
      baseTimeline.push({ label: "Отклонен менеджером", date: requestState.updatedAt });
    }

    if (relatedOrder) {
      baseTimeline.push({ label: "Создан связанный заказ", date: relatedOrder.createdAt });
    }

    return baseTimeline;
  }, [relatedOrder, requestState]);

  const loadRequestData = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const [requestResponse, ordersResponse, suppliersResponse] = await Promise.all([
        getPurchaseRequest(requestId),
        listOrders(),
        canApproveRequest ? listSuppliers() : Promise.resolve([]),
      ]);

      const mappedRequest = mapRequestToViewModel(requestResponse);
      const mappedOrders = ordersResponse.map(mapOrderToViewModel);
      const foundRelatedOrder = mappedOrders.find((order) => order.requestId === mappedRequest.id) ?? null;

      setRequestState(mappedRequest);
      setRelatedOrder(foundRelatedOrder);
      setTitle(mappedRequest.title);
      setAmount(Math.max(mappedRequest.amount, 1));
      setDescription(mappedRequest.description);

      if (canApproveRequest && suppliersResponse.length > 0) {
        setSuppliers(suppliersResponse.map((s) => ({ id: s.id, full_name: s.full_name })));
        setSelectedSupplierId(suppliersResponse[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить данные запроса.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRequestData();
  }, [requestId]);

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestState) {
      return;
    }

    setErrorText("");

    try {
      const updatedRequest = await updatePurchaseRequest(requestState.id, {
        title,
        amount,
        description,
        currency: requestState.currency,
      });

      setRequestState(mapRequestToViewModel(updatedRequest));
      setIsEditOpen(false);
      setStatusMessage("Запрос обновлен и сохранен в базе данных.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось обновить запрос.";
      setErrorText(message);
    }
  };

  const handleReview = async (approve: boolean) => {
    if (!requestState) {
      return;
    }

    setErrorText("");

    try {
      const reviewedRequest = await reviewPurchaseRequest(requestState.id, {
        approve,
        rejection_reason: approve ? undefined : "Отклонено менеджером",
      });

      setRequestState(mapRequestToViewModel(reviewedRequest));
      setStatusMessage(approve ? "Запрос одобрен менеджером." : "Запрос отклонен менеджером.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось обновить статус запроса.";
      setErrorText(message);
    }
  };

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestState) {
      return;
    }

    setErrorText("");

    try {
      await createOrder({
        purchase_request_id: requestState.id,
        supplier_id: selectedSupplierId,
      });

      setIsCreateOrderOpen(false);
      setStatusMessage("Заказ создан и назначен поставщику.");
      await loadRequestData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось создать заказ.";
      setErrorText(message);
    }
  };

  const isApproved = requestState?.statusLabel === "Одобрено";
  const isPending = requestState?.statusLabel === "Ожидает";
  const canCreateOrderHere = canApproveRequest && isApproved && !relatedOrder && suppliers.length > 0;

  if (isLoading) {
    return <Card className="rounded-3xl">Загрузка...</Card>;
  }

  if (!requestState) {
    return <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText || "Запрос не найден."}</Card>;
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали запроса</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">{requestState.title}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{requestState.id}</p>
        </div>
        <StatusBadge status={requestState.statusLabel} />
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card>
      ) : null}

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
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{requestState.statusLabel}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Автор</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{requestState.requesterName}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Создан</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatDate(requestState.createdAt)}</dd>
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
              <p className="text-sm font-medium text-[#1F2937]">{relatedOrder.supplierName}</p>
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

            {canApproveRequest && isPending ? (
              <>
                <Button className="w-full" onClick={() => void handleReview(true)} size="sm" variant="primary">
                  Одобрить
                </Button>
                <Button className="w-full" onClick={() => void handleReview(false)} size="sm" variant="secondary">
                  Отклонить
                </Button>
              </>
            ) : null}

            {canCreateOrderHere ? (
              <Button className="w-full" onClick={() => setIsCreateOrderOpen(true)} size="sm" variant="primary">
                Создать заказ поставщику
              </Button>
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
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="edit-amount">
              Сумма
            </label>
            <input
              className="h-10 w-full rounded-xl border border-[#E5E7EB] px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="edit-amount"
              min={1}
              onChange={(event) => setAmount(Number(event.target.value) || 1)}
              required
              type="number"
              value={amount}
            />
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

      <Modal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        title="Создание заказа поставщику"
        footer={
          <>
            <Button onClick={() => setIsCreateOrderOpen(false)} variant="secondary">
              Отмена
            </Button>
            <Button form="create-order-form" type="submit">
              Создать заказ
            </Button>
          </>
        }
      >
        <form className="space-y-4" id="create-order-form" onSubmit={handleCreateOrder}>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <p className="text-xs uppercase tracking-wide text-[#6B7280]">Запрос</p>
            <p className="mt-1 text-sm font-semibold text-[#1F2937]">{requestState?.title}</p>
            <p className="mt-1 text-xs text-[#6B7280]">{formatCurrency(requestState?.amount ?? 0)}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-supplier">
              Назначить поставщика
            </label>
            <select
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="order-supplier"
              onChange={(event) => setSelectedSupplierId(event.target.value)}
              required
              value={selectedSupplierId}
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.full_name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
