import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

interface OrdersPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canViewOrders) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const visibleOrders =
    role === "supplier"
      ? orders.filter((order) => order.approvedByManager)
      : orders;

  const deliveredOrders = visibleOrders.filter((order) => order.status === "Доставлен").length;
  const delayedOrders = visibleOrders.filter((order) => order.status === "Задержан").length;
  const totalOrderValue = visibleOrders.reduce((sum, order) => sum + order.total, 0);

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
          {permissions.canManageOrders && (
            <Button size="md" variant="primary">
              Создать заказ
            </Button>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего заказов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{visibleOrders.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Доставлено</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {deliveredOrders}
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">С задержкой</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {delayedOrders}
          </p>
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
          rows={visibleOrders.map((order) => ({
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
    </div>
  );
}
