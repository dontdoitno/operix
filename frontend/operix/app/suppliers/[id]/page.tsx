import { redirect } from "next/navigation";

import { SupplierDetailsViewClient } from "@/components/suppliers/supplier-details-view-client";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

interface SupplierDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function SupplierDetailsPage({ params, searchParams }: SupplierDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canManageSuppliers) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  return (
    <SupplierDetailsViewClient
      canEditSupplier={permissions.canManageSuppliers}
      role={role}
      supplierId={resolvedParams.id}
    />
  );
}
