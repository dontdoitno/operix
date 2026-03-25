import { redirect } from "next/navigation";

import { RequestDetailsViewClient } from "@/components/requests/request-details-view-client";
import {
  SearchParams,
  getDefaultRouteForRole,
  getRoleFromSearchParams,
  rolePermissions,
  withRole,
} from "@/lib/roles";

interface RequestDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<SearchParams>;
}

export default async function RequestDetailsPage({ params, searchParams }: RequestDetailsPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const role = getRoleFromSearchParams(resolvedSearchParams);
  const permissions = rolePermissions[role];

  if (!permissions.canAccessRequests) {
    redirect(withRole(getDefaultRouteForRole(role), role));
  }

  return (
    <RequestDetailsViewClient
      canApproveRequest={permissions.canApproveRequest}
      canEditRequest={role === "employee"}
      requestId={resolvedParams.id}
      role={role}
    />
  );
}
