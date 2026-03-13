import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { suppliers } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

const averagePerformance = Math.round(
  suppliers.reduce((sum, supplier) => sum + supplier.performance, 0) / suppliers.length,
);

const totalActiveOrders = suppliers.reduce(
  (sum, supplier) => sum + supplier.activeOrders,
  0,
);

interface SuppliersPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canManageSuppliers) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Поставщики</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Контролируйте качество поставщиков, покрытие категорий и текущую загрузку по исполнению заказов.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего поставщиков</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {suppliers.length}
          </p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Средняя эффективность</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {averagePerformance}%
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Активные заказы</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {totalActiveOrders}
          </p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Справочник поставщиков</h2>
        </div>
        <Table
          headers={[
            "ID поставщика",
            "Название",
            "Категория",
            "Email",
            "Телефон",
            "Эффективность",
            "Активные заказы",
          ]}
          rows={suppliers.map((supplier) => ({
            key: supplier.id,
            cells: [
              supplier.id,
              <Link
                key={`${supplier.id}-name`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/suppliers/${supplier.id}`, role)}
              >
                {supplier.name}
              </Link>,
              supplier.category,
              supplier.email,
              supplier.phone,
              `${supplier.performance}%`,
              supplier.activeOrders,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
