import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/format";
import { merchandise } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface MerchandiseDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function MerchandiseDetailsPage({
  params,
  searchParams,
}: MerchandiseDetailsPageProps) {
  const resolvedParams = await params;
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

  const item = merchandise.find((entry) => entry.id === resolvedParams.id && entry.supplierId === supplierId);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали товара</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">{item.name}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">{item.id}</p>
        </div>
        <Link href={withRole("/merchandise", role)}>
          <Button size="sm" variant="secondary">
            Вернуться к товарам
          </Button>
        </Link>
      </section>

      <Card className="rounded-3xl">
        <h2 className="text-lg font-semibold text-[#1F2937]">Карточка товара</h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Название товара</dt>
            <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{item.name}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Артикул</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{item.sku}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Категория</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{item.category}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Доступное количество</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{item.availableQuantity}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Забронированное количество</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{item.reservedQuantity}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Цена</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatCurrency(item.price)}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Обновлено</dt>
            <dd className="mt-1 text-sm font-medium text-[#1F2937]">{formatDate(item.updatedAt)}</dd>
          </div>
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Описание</dt>
            <dd className="mt-1 text-sm leading-6 text-[#4B5563]">{item.description}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
