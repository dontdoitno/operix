import { redirect } from "next/navigation";

import { OrdersPageClient } from "@/components/orders/orders-page-client";
import { orders } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  roleProfiles,
  withRole,
} from "@/lib/roles";

interface OrdersPageProps {
  searchParams?: Promise<SearchParams>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canViewOrders) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  const visibleOrders =
    role === "supplier"
      ? orders.filter((order) => order.approvedByManager && order.supplier === roleProfiles[role].name)
      : orders;

  return (
    <OrdersPageClient
      canManageOrders={permissions.canManageOrders}
      initialOrders={visibleOrders}
      role={role}
    />
  );
}
