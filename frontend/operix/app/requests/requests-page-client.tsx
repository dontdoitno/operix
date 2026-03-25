"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CreateRequestModal } from "@/components/requests/create-request-modal";
import { AccessDeniedCard } from "@/components/ui/access-denied-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";
import { listPurchaseRequests } from "@/lib/procurement-api";
import { mapRequestToViewModel, RequestViewModel } from "@/lib/procurement-view";
import { getRoleFromSearchParams, rolePermissions, SearchParams, withRole } from "@/lib/roles";

export default function RequestsPageClient() {
  const searchParams = useSearchParams();
  const role = getRoleFromSearchParams({ role: searchParams.get("role") } as SearchParams);
  const permissions = rolePermissions[role];

  const [requests, setRequests] = useState<RequestViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const loadRequests = async () => {
    setIsLoading(true);
    setErrorText("");

    try {
      const response = await listPurchaseRequests();
      setRequests(response.map(mapRequestToViewModel));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Не удалось загрузить список запросов.";
      setErrorText(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!permissions.canAccessRequests) {
      return;
    }

    void loadRequests();
  }, [permissions.canAccessRequests]);

  const totalRequested = useMemo(
    () => requests.reduce((sum, request) => sum + request.amount, 0),
    [requests],
  );

  const approvedCount = useMemo(
    () => requests.filter((request) => request.statusLabel === "Одобрено").length,
    [requests],
  );

  if (!permissions.canAccessRequests) {
    return (
      <AccessDeniedCard
        description="У вашей роли нет доступа к разделу запросов."
        role={role}
      />
    );
  }

  return (
    <div className="space-y-6 pb-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-[0_12px_30px_rgba(31,41,55,0.06)] md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F2937]">Запросы на закупку</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Отслеживайте отправленные запросы, статусы согласования и общий запрошенный бюджет в одном месте.
          </p>
        </div>
        {permissions.canCreateRequest ? <CreateRequestModal onCreated={loadRequests} /> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Всего запросов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{requests.length}</p>
        </Card>
        <Card className="rounded-3xl">
          <p className="text-sm font-medium text-[#6B7280]">Запрошенная сумма</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{formatCurrency(totalRequested)}</p>
        </Card>
        <Card className="rounded-3xl sm:col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-[#6B7280]">Одобрено запросов</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#1F2937]">{approvedCount}</p>
        </Card>
      </section>

      {errorText ? (
        <Card className="rounded-3xl border border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]">
          {errorText}
        </Card>
      ) : null}

      <Card className="rounded-3xl p-0">
        <div className="border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#1F2937]">Список запросов</h2>
        </div>
        <Table
          headers={["ID запроса", "Название", "Автор", "Отправлен", "Сумма", "Статус"]}
          rows={requests.map((request) => ({
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
              request.requesterName,
              formatDate(request.createdAt),
              formatCurrency(request.amount),
              <StatusBadge key={`${request.id}-status`} status={request.statusLabel} />,
            ],
          }))}
        />
        {isLoading ? <p className="px-6 py-4 text-sm text-[#6B7280]">Загрузка...</p> : null}
      </Card>
    </div>
  );
}
