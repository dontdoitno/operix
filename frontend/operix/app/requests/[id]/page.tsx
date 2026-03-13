import { notFound, redirect } from "next/navigation";

import { RequestDetailsViewClient } from "@/components/requests/request-details-view-client";
import { orders, purchaseRequests } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
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
    redirect(`${getDefaultRouteForRole(role)}?role=${role}`);
  }

  const request = purchaseRequests.find((item) => item.id === resolvedParams.id);

  if (!request) {
    notFound();
  }

  if (!permissions.canViewAllRequests && request.requester !== roleProfiles[role].name) {
    redirect(`/requests?role=${role}`);
  }

  const relatedOrder = orders.find((order) => order.requestId === request.id) ?? null;
  const timeline = timelineByStatus[request.status] ?? [];

  return (
    <RequestDetailsViewClient
      canApproveRequest={permissions.canApproveRequest}
      canEditRequest={role === "employee"}
      relatedOrder={relatedOrder}
      request={request}
      role={role}
      timeline={timeline}
    />
  );
}
