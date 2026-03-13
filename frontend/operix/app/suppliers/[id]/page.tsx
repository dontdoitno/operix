import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders, suppliers } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

interface SupplierDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function SupplierDetailsPage({
  params,
  searchParams,
}: SupplierDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canManageSuppliers) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const supplier = suppliers.find((item) => item.id === resolvedParams.id);

  if (!supplier) {
    notFound();
  }

  const relatedOrders = orders.filter((order) => order.supplier === supplier.name);

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали поставщика</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {supplier.name}
          </h1>
        </div>
        <Button size="sm" variant="secondary">
          Редактировать поставщика
        </Button>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Карточка поставщика</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">
                Название поставщика
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{supplier.name}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Email</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplier.email}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Телефон</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{supplier.phone}</dd>
            </div>
          </dl>
        </Card>

        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Показатели</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Категория</p>
              <p className="mt-1 text-sm font-medium text-[#1F2937]">{supplier.category}</p>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs uppercase tracking-wide text-[#6B7280]">Эффективность</p>
              <p className="mt-1 text-sm font-medium text-[#1F2937]">{supplier.performance}%</p>
            </div>
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
    </div>
  );
}
