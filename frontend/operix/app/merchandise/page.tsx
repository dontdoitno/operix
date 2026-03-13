import { redirect } from "next/navigation";

import { MerchandisePageClient } from "@/components/merchandise/merchandise-page-client";
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
    <MerchandisePageClient
      canManageMerchandise={permissions.canManageMerchandise}
      initialMerchandise={visibleMerchandise}
      role={role}
    />
  );
}
