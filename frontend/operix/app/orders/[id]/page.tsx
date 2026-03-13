import { notFound, redirect } from "next/navigation";

import { OrderDetailsViewClient } from "@/components/orders/order-details-view-client";
import { orders, purchaseRequests } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function OrderDetailsPage({
  params,
  searchParams,
}: OrderDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canViewOrders) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const order = orders.find((item) => item.id === resolvedParams.id);

  if (!order) {
    notFound();
  }

  if (role === "supplier" && !order.approvedByManager) {
    redirect(withRole("/orders", role));
  }

  const relatedRequest = purchaseRequests.find((request) => request.id === order.requestId);

  return (
    <OrderDetailsViewClient
      canProcessSupplierOrders={permissions.canProcessSupplierOrders}
      order={order}
      relatedRequestLink={
        relatedRequest && role === "manager"
          ? withRole(`/requests/${relatedRequest.id}`, role)
          : undefined
      }
      relatedRequestText={
        relatedRequest
          ? `${relatedRequest.id} — ${relatedRequest.title}`
          : "Запрос не найден"
      }
      role={role}
    />
  );
}
