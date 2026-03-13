import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import { merchandise } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface MerchandisePageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function MerchandisePage({ searchParams }: MerchandisePageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canViewMerchandise) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const supplierId = roleProfiles[role].supplierId;

  if (!supplierId) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const visibleMerchandise = merchandise.filter((item) => item.supplierId === supplierId);

  return (
    <div className="space-y-6 pb-4">
      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Товары</h1>
            <p className="mt-2 text-sm text-[#6B7280]">
              Управляйте текущими позициями каталога и отслеживайте доступные и зарезервированные остатки.
            </p>
          </div>
          {permissions.canManageMerchandise && (
            <Button size="md" variant="primary">
              Добавить товар
            </Button>
          )}
        </div>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Каталог поставщика</h2>
        </div>
        <Table
          headers={[
            "Название товара",
            "Доступное количество",
            "Забронированное количество",
            "Цена",
            "Действия",
          ]}
          rows={visibleMerchandise.map((item) => ({
            key: item.id,
            cells: [
              <span key={`${item.id}-name`} className="font-medium text-[#1F2937]">
                {item.name}
              </span>,
              item.availableQuantity,
              item.reservedQuantity,
              formatCurrency(item.price),
              <div key={`${item.id}-actions`} className="flex flex-wrap gap-2">
                {permissions.canManageMerchandise && (
                  <Button size="sm" variant="secondary">
                    Добавить товар
                  </Button>
                )}
                <Link href={withRole(`/merchandise/${item.id}`, role)}>
                  <Button size="sm" variant="primary">
                    Подробнее
                  </Button>
                </Link>
              </div>,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
