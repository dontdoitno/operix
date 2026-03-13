import { notFound, redirect } from "next/navigation";

import { SupplierDetailsViewClient } from "@/components/suppliers/supplier-details-view-client";
import { merchandise, orders, suppliers } from "@/lib/mock-data";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
} from "@/lib/roles";

interface SupplierDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function SupplierDetailsPage({
  params,
  searchParams,
}: SupplierDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canManageSuppliers) {
    redirect(`${getDefaultRouteForRole(role)}?role=${role}`);
  }

  const supplier = suppliers.find((item) => item.id === resolvedParams.id);

  if (!supplier) {
    notFound();
  }

  const relatedOrders = orders.filter((order) => order.supplier === supplier.name);
  const availableProducts = merchandise.filter((item) => item.supplierId === supplier.id);

  return (
    <SupplierDetailsViewClient
      availableProducts={availableProducts}
      relatedOrders={relatedOrders}
      role={role}
      supplier={supplier}
    />
  );
}
