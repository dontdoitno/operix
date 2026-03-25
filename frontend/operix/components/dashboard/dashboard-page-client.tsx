"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { SupplierPulseCard } from "@/components/dashboard/supplier-pulse-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { merchandise, Supplier, suppliers as mockSuppliers } from "@/lib/mock-data";
import { listOrders, listPurchaseRequests, listSuppliers } from "@/lib/procurement-api";
import {
  mapOrderToViewModel,
  mapRequestToViewModel,
  OrderViewModel,
  RequestViewModel,
} from "@/lib/procurement-view";
import {
  getRoleFromSearchParams,
  roleLabels,
  rolePermissions,
  SearchParams,
  withRole,
} from "@/lib/roles";

export function DashboardPageClient() {
  const searchParams = useSearchParams();
  const role = getRoleFromSearchParams({ role: searchParams.get("role") } as SearchParams);
  const permissions = rolePermissions[role];

  const [requests, setRequests] = useState<RequestViewModel[]>([]);
  const [orders, setOrders] = useState<OrderViewModel[]>([]);
  const [pulseSuppliers, setPulseSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const loadDashboardData = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const [requestsResponse, ordersResponse, suppliersResponse] = await Promise.all([
        permissions.canAccessRequests ? listPurchaseRequests() : Promise.resolve([]),
        permissions.canViewOrders ? listOrders() : Promise.resolve([]),
        permissions.canManageSuppliers ? listSuppliers() : Promise.resolve([]),
      ]);

      const mappedRequests = requestsResponse.map(mapRequestToViewModel);
      const mappedOrders = ordersResponse.map(mapOrderToViewModel);

      setRequests(mappedRequests);
      setOrders(mappedOrders);

      if (permissions.canManageSuppliers) {
        setPulseSuppliers(
          suppliersResponse.slice(0, 3).map((supplier, index) => ({
            id: supplier.id,
            name: supplier.full_name,
            category: "Поставщик",
            industry: "Поставщик",
            email: supplier.email,
            phone: "—",
            performance: Math.max(86, 96 - index * 3),
            activeOrders: mappedOrders.filter((order) => order.supplierId === supplier.id).length,
          })),
        );
      } else if (role === "employee") {
        setPulseSuppliers(mockSuppliers.slice(0, 3));
      } else {
        setPulseSuppliers([]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить данные дашборда.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboardData();
  }, [permissions.canAccessRequests, permissions.canManageSuppliers, permissions.canViewOrders, role]);

  const totalSpend = useMemo(() => {
    if (orders.length === 0 || requests.length === 0) {
      return 0;
    }

    const requestAmountById = new Map(requests.map((request) => [request.id, request.amount]));

    return orders.reduce((sum, order) => sum + (requestAmountById.get(order.requestId) ?? 0), 0);
  }, [orders, requests]);

  const pendingApprovals = useMemo(
    () => requests.filter((request) => request.statusLabel === "Ожидает").length,
    [requests],
  );

  const defaultStats = [
    {
      label: permissions.canViewOrders ? "Расходы за месяц" : "Ваши заявки",
      value: permissions.canViewOrders ? formatCurrency(totalSpend) : String(requests.length),
      description: permissions.canViewOrders
        ? "По заказам, связанным с заявками"
        : "Количество заявок, созданных в вашем профиле",
    },
    {
      label: permissions.canAccessRequests ? "Открытые заявки" : "Активные заказы",
      value: permissions.canAccessRequests ? String(requests.length) : String(orders.length),
      description: permissions.canAccessRequests
        ? "Заявки на закупку в текущей работе"
        : "Заказы, доступные для обработки поставщиком",
    },
    {
      label: permissions.canApproveRequest ? "Ожидают согласования" : "В работе",
      value: String(pendingApprovals),
      description: permissions.canApproveRequest
        ? "Заявки, ожидающие решения менеджера"
        : permissions.canViewOrders
          ? "Заказы, требующие ваших следующих действий"
          : "Заявки и заказы, требующие следующих действий",
    },
    {
      label: permissions.canManageSuppliers ? "Активные поставщики" : "Доступная роль",
      value: permissions.canManageSuppliers ? String(pulseSuppliers.length) : roleLabels[role],
      description: permissions.canManageSuppliers
        ? "Поставщики, доступные в текущем справочнике"
        : "Интерфейс адаптирован под текущие полномочия",
    },
  ];

  const dashboardStats =
    role === "supplier"
      ? [
          {
            label: "Доход за месяц",
            value: formatCurrency(totalSpend),
            description: "Сумма заказов вашей компании",
          },
          {
            label: "Одобренные заказы",
            value: String(orders.length),
            description: "Заказы вашей компании, назначенные поставщику",
          },
        ]
      : defaultStats;

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl bg-gradient-to-r from-[#111827] to-[#374151] p-8 text-white shadow-[0_20px_40px_rgba(31,41,55,0.25)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-white/80">Обзор закупок</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">С возвращением в Operix</h1>
            <p className="mt-3 text-sm text-white/75">
              Рабочее пространство для роли «{roleLabels[role]}». Интерфейс и действия
              автоматически подстроены под ваши права.
            </p>
          </div>
          {permissions.canCreateRequest ? (
            <Link href={withRole("/requests", role)}>
              <Button className="bg-[#FF5A3C] text-white hover:bg-[#e84d31]" size="md">
                Создать заявку
              </Button>
            </Link>
          ) : permissions.canViewOrders ? (
            <Link href={withRole("/orders", role)}>
              <Button className="bg-[#FF5A3C] text-white hover:bg-[#e84d31]" size="md">
                Открыть заказы
              </Button>
            </Link>
          ) : null}
        </div>
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">{errorText}</Card>
      ) : null}

      <section
        className={
          role === "supplier" ? "grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="rounded-3xl p-6">
            <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{stat.value}</p>
            <p className="mt-2 text-sm text-[#6B7280]">{stat.description}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {permissions.canAccessRequests ? (
          <Card className="rounded-3xl p-0">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Последние заявки</h2>
              <Link className="text-sm font-medium text-[#FF5A3C]" href={withRole("/requests", role)}>
                Смотреть все
              </Link>
            </div>
            <Table
              headers={["Заявка", "Автор", "Отправлена", "Сумма", "Статус"]}
              rows={requests.slice(0, 4).map((request) => ({
                key: request.id,
                cells: [
                  <Link
                    key={`${request.id}-link`}
                    className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                    href={withRole(`/requests/${request.id}`, role)}
                  >
                    {request.id}
                  </Link>,
                  request.requesterName,
                  formatDate(request.createdAt),
                  formatCurrency(request.amount),
                  <StatusBadge key={`${request.id}-status`} status={request.statusLabel} />,
                ],
              }))}
            />
          </Card>
        ) : (
          <Card className="rounded-3xl p-0">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1F2937]">Одобренные заказы</h2>
              <Link className="text-sm font-medium text-[#FF5A3C]" href={withRole("/orders", role)}>
                Смотреть все
              </Link>
            </div>
            <Table
              headers={["ID заказа", "Поставщик", "Менеджер", "Создан", "Статус"]}
              rows={orders.slice(0, 4).map((order) => ({
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
                  order.managerName,
                  formatDate(order.createdAt),
                  <StatusBadge key={`${order.id}-status`} status={order.statusLabel} />,
                ],
              }))}
            />
          </Card>
        )}

        {role !== "supplier" && pulseSuppliers.length > 0 ? (
          <SupplierPulseCard
            canCreateQuickRequest={permissions.canCreateRequest}
            merchandise={merchandise}
            onRequestCreated={permissions.canCreateRequest ? loadDashboardData : undefined}
            suppliers={pulseSuppliers}
          />
        ) : null}
      </section>

      {isLoading ? <Card className="rounded-3xl">Загрузка...</Card> : null}
    </div>
  );
}
