import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { orders, purchaseRequests } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface RequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

const timelineByStatus: Record<string, Array<{ label: string; date: string }>> = {
  Ожидает: [
    { label: "Отправлено", date: "2026-03-01" },
    { label: "Ожидает проверки менеджером", date: "2026-03-02" },
  ],
  "На согласовании": [
    { label: "Отправлено", date: "2026-03-01" },
    { label: "Предварительная проверка финансов", date: "2026-03-02" },
    { label: "Идет согласование менеджером", date: "2026-03-03" },
  ],
  Одобрено: [
    { label: "Отправлено", date: "2026-02-26" },
    { label: "Одобрено менеджером", date: "2026-02-27" },
    { label: "Подбор поставщика отделом закупок", date: "2026-02-28" },
  ],
  Отклонено: [
    { label: "Отправлено", date: "2026-02-20" },
    { label: "Проверка завершена", date: "2026-02-21" },
    { label: "Отклонено из-за бюджетных ограничений", date: "2026-02-21" },
  ],
};

export default async function RequestDetailsPage({
  params,
  searchParams,
}: RequestDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canAccessRequests) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const request = purchaseRequests.find((item) => item.id === resolvedParams.id);

  if (!request) {
    notFound();
  }

  if (!permissions.canViewAllRequests && request.requester !== roleProfiles[role].name) {
    redirect(withRole("/requests", role));
  }

  const relatedOrder = orders.find((order) => order.requestId === request.id);
  const timeline = timelineByStatus[request.status] ?? [];

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-[#6B7280]">Детали запроса</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {request.title}
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">{request.id}</p>
        </div>
        <StatusBadge status={request.status} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="rounded-3xl">
          <h2 className="text-lg font-semibold text-[#1F2937]">Карточка запроса</h2>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Название</dt>
              <dd className="mt-1 text-sm font-semibold text-[#1F2937]">{request.title}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Описание</dt>
              <dd className="mt-1 text-sm leading-6 text-[#4B5563]">{request.description}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Сумма</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {formatCurrency(request.amount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Статус</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{request.status}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Автор</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">{request.requester}</dd>
            </div>
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <dt className="text-xs uppercase tracking-wide text-[#6B7280]">Отправлен</dt>
              <dd className="mt-1 text-sm font-medium text-[#1F2937]">
                {formatDate(request.submittedAt)}
              </dd>
            </div>
          </dl>
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

            {permissions.canApproveRequest && (
              <>
                <Button className="w-full" size="sm" variant="primary">
                  Одобрить
                </Button>
                <Button className="w-full" size="sm" variant="secondary">
                  Отклонить
                </Button>
              </>
            )}
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
    </div>
  );
}
