import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateRequestModal } from "@/components/requests/create-request-modal";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { purchaseRequests } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface RequestsPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canAccessRequests) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const visibleRequests = permissions.canViewAllRequests
    ? purchaseRequests
    : purchaseRequests.filter((request) => request.requester === roleProfiles[role].name);

  const totalRequested = visibleRequests.reduce((sum, request) => sum + request.amount, 0);
  const approvedCount = visibleRequests.filter((request) => request.status === "Одобрено").length;

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Запросы на закупку</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Отслеживайте отправленные запросы, статусы согласования и общий запрошенный бюджет в одном месте.
          </p>
        </div>
        {permissions.canCreateRequest && <CreateRequestModal />}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего запросов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {visibleRequests.length}
          </p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Запрошенная сумма</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">
            {formatCurrency(totalRequested)}
          </p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Одобрено запросов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{approvedCount}</p>
        </Card>
      </section>

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Список запросов</h2>
        </div>
        <Table
          headers={[
            "ID запроса",
            "Название",
            "Отдел",
            "Автор",
            "Отправлен",
            "Сумма",
            "Статус",
          ]}
          rows={visibleRequests.map((request) => ({
            key: request.id,
            cells: [
              <Link
                key={`${request.id}-link`}
                className="font-medium text-[#1F2937] hover:text-[#FF5A3C]"
                href={withRole(`/requests/${request.id}`, role)}
              >
                {request.id}
              </Link>,
              request.title,
              request.department,
              request.requester,
              formatDate(request.submittedAt),
              formatCurrency(request.amount),
              <StatusBadge key={`${request.id}-status`} status={request.status} />,
            ],
          }))}
        />
      </Card>
    </div>
  );
}
