"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  createOrder,
  listOrders,
  listPurchaseRequests,
  listSuppliers,
} from "@/lib/procurement-api";
import {
  mapOrderToViewModel,
  mapRequestToViewModel,
  OrderViewModel,
  RequestViewModel,
} from "@/lib/procurement-view";
import { getRoleFromSearchParams, rolePermissions, SearchParams, withRole } from "@/lib/roles";

export function OrdersPageClient() {
  const searchParams = useSearchParams();
  const role = getRoleFromSearchParams({ role: searchParams.get("role") } as SearchParams);
  const permissions = rolePermissions[role];

  const [orders, setOrders] = useState<OrderViewModel[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<RequestViewModel[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; full_name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const [ordersResponse, requestsResponse, suppliersResponse] = await Promise.all([
        listOrders(),
        permissions.canManageOrders ? listPurchaseRequests() : Promise.resolve([]),
        permissions.canManageOrders ? listSuppliers() : Promise.resolve([]),
      ]);

      const mappedOrders = ordersResponse.map(mapOrderToViewModel);
      setOrders(mappedOrders);

      if (permissions.canManageOrders) {
        const mappedRequests = requestsResponse.map(mapRequestToViewModel);
        const requestOptions = mappedRequests.filter((request) => request.statusLabel === "Одобрено");

        setApprovedRequests(requestOptions);
        setSuppliers(
          suppliersResponse.map((supplier) => ({
            id: supplier.id,
            full_name: supplier.full_name,
          })),
        );

        setSelectedRequestId(requestOptions[0]?.id ?? "");
        setSelectedSupplierId(suppliersResponse[0]?.id ?? "");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить данные заказов.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!permissions.canViewOrders) {
      return;
    }

    void loadData();
  }, [permissions.canManageOrders, permissions.canViewOrders]);

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.statusLabel === "Доставлен").length,
    [orders],
  );

  const inProgressOrders = useMemo(
    () => orders.filter((order) => order.statusLabel === "В исполнении").length,
    [orders],
  );

  const totalOrderCount = orders.length;

  const handleCreateOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorText("");

    try {
      await createOrder({
        purchase_request_id: selectedRequestId,
        supplier_id: selectedSupplierId,
      });

      setNotice("Заказ создан и сохранен в базе данных.");
      setIsModalOpen(false);
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось создать заказ.";
      setErrorText(message);
    }
  };

  if (!permissions.canViewOrders) {
    return <AccessDeniedCard role={role} description="У вашей роли нет доступа к разделу заказов." />;
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Заказы</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Отслеживайте ход исполнения и статусы заказов из базы данных в реальном времени.
            </p>
          </div>
          {permissions.canManageOrders ? (
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
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{totalOrderCount}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">В исполнении</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{inProgressOrders}</p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Доставлено</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{deliveredOrders}</p>
        </Card>
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card>
      ) : null}

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Мониторинг заказов</h2>
        </div>
        <Table
          headers={["ID заказа", "Поставщик", "Связанный запрос", "Дата создания", "Статус"]}
          rows={orders.map((order) => ({
            key: order.id,
            cells: [
              <Link
                key={`${order.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/orders/${order.id}`, role)}
              >
                {order.id}
              </Link>,
              order.supplierName,
              order.requestTitle,
              formatDate(order.createdAt),
              <StatusBadge key={`${order.id}-status`} status={order.statusLabel} />,
            ],
          }))}
        />
        {isLoading ? <p className="px-6 py-4 text-sm text-[#6B7280]">Загрузка...</p> : null}
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
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-request">
              Одобренный запрос
            </label>
            <select
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#1F2937] outline-none ring-[#FF5A3C]/40 focus:ring-4"
              id="order-request"
              onChange={(event) => setSelectedRequestId(event.target.value)}
              required
              value={selectedRequestId}
            >
              {approvedRequests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.id} — {request.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-[#1F2937]" htmlFor="order-supplier">
              Поставщик
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
