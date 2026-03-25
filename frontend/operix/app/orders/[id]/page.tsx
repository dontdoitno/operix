import { redirect } from "next/navigation";

import { OrderDetailsViewClient } from "@/components/orders/order-details-view-client";
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

  return (
    <OrderDetailsViewClient
      canProcessSupplierOrders={permissions.canProcessSupplierOrders}
      orderId={resolvedParams.id}
      role={role}
    />
  );
}
