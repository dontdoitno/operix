import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders, purchaseRequests, suppliers } from "@/lib/mock-data";
import {
  SearchParams,
  getRoleFromSearchParams,
  roleLabels,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface DashboardPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  const availableRequests = permissions.canAccessRequests
    ? permissions.canViewAllRequests
      ? purchaseRequests
      : purchaseRequests.filter((request) => request.requester === roleProfiles[role].name)
    : [];

  const availableOrders = permissions.canViewOrders
    ? role === "supplier"
      ? orders.filter((order) => order.approvedByManager)
      : orders
    : [];

  const totalSpend = availableOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingApprovals = availableRequests.filter(
    (request) => request.status === "Ожидает" || request.status === "На согласовании",
  ).length;

  const dashboardStats = [
    {
      label: permissions.canViewOrders ? "Расходы за месяц" : "Ваши заявки",
      value: permissions.canViewOrders ? formatCurrency(totalSpend) : String(availableRequests.length),
      description: permissions.canViewOrders
        ? "По подтвержденным и доставленным заказам"
        : "Количество заявок, созданных в вашем профиле",
    },
    {
      label: permissions.canAccessRequests ? "Открытые заявки" : "Активные заказы",
      value: permissions.canAccessRequests
        ? String(availableRequests.length)
        : String(availableOrders.length),
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
      value: permissions.canManageSuppliers ? String(suppliers.length) : roleLabels[role],
      description: permissions.canManageSuppliers
        ? "Поставщики, закрывающие текущий спрос"
        : "Интерфейс адаптирован под текущие полномочия",
    },
  ];

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              headers={["Заявка", "Отдел", "Отправлена", "Сумма", "Статус"]}
              rows={availableRequests.slice(0, 4).map((request) => ({
                key: request.id,
                cells: [
                  <Link
                    key={`${request.id}-link`}
                    className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                    href={withRole(`/requests/${request.id}`, role)}
                  >
                    {request.id}
                  </Link>,
                  request.department,
                  formatDate(request.submittedAt),
                  formatCurrency(request.amount),
                  <StatusBadge key={`${request.id}-status`} status={request.status} />,
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
              headers={["ID заказа", "Поставщик", "Компания", "Сумма", "Статус"]}
              rows={availableOrders.slice(0, 4).map((order) => ({
                key: order.id,
                cells: [
                  <Link
                    key={`${order.id}-link`}
                    className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                    href={withRole(`/orders/${order.id}`, role)}
                  >
                    {order.id}
                  </Link>,
                  order.supplier,
                  order.companyName,
                  formatCurrency(order.total),
                  <StatusBadge key={`${order.id}-status`} status={order.status} />,
                ],
              }))}
            />
          </Card>
        )}

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Пульс поставщиков</h2>
          <ul className="mt-4 space-y-4">
            {suppliers.slice(0, 3).map((supplier) => (
              <li key={supplier.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="font-medium text-[#1F2937]">{supplier.name}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{supplier.category}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Эффективность</span>
                  <span className="font-medium text-[#1F2937]">{supplier.performance}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
