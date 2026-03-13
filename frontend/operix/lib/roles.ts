export type UserRole = "employee" | "manager" | "supplier";

export type SearchParamValue = string | string[] | undefined;
export type SearchParams = Record<string, SearchParamValue>;

interface RoleProfile {
  name: string;
  supplierId?: string;
}

interface RolePermissions {
  canAccessRequests: boolean;
  canCreateRequest: boolean;
  canApproveRequest: boolean;
  canManageSuppliers: boolean;
  canViewOrders: boolean;
  canManageOrders: boolean;
  canProcessSupplierOrders: boolean;
  canViewAllRequests: boolean;
  canViewMerchandise: boolean;
  canManageMerchandise: boolean;
}

export const roleLabels: Record<UserRole, string> = {
  employee: "Сотрудник",
  manager: "Менеджер",
  supplier: "Поставщик",
};

export const roleProfiles: Record<UserRole, RoleProfile> = {
  employee: {
    name: "Maya Chen",
  },
  manager: {
    name: "Ольга Петрова",
  },
  supplier: {
    name: "Nova Industrial",
    supplierId: "SUP-201",
  },
};

export const rolePermissions: Record<UserRole, RolePermissions> = {
  employee: {
    canAccessRequests: true,
    canCreateRequest: true,
    canApproveRequest: false,
    canManageSuppliers: false,
    canViewOrders: false,
    canManageOrders: false,
    canProcessSupplierOrders: false,
    canViewAllRequests: false,
    canViewMerchandise: false,
    canManageMerchandise: false,
  },
  manager: {
    canAccessRequests: true,
    canCreateRequest: true,
    canApproveRequest: true,
    canManageSuppliers: true,
    canViewOrders: true,
    canManageOrders: true,
    canProcessSupplierOrders: false,
    canViewAllRequests: true,
    canViewMerchandise: false,
    canManageMerchandise: false,
  },
  supplier: {
    canAccessRequests: false,
    canCreateRequest: false,
    canApproveRequest: false,
    canManageSuppliers: false,
    canViewOrders: true,
    canManageOrders: false,
    canProcessSupplierOrders: true,
    canViewAllRequests: false,
    canViewMerchandise: true,
    canManageMerchandise: true,
  },
};

export const allRoles: UserRole[] = ["employee", "manager", "supplier"];

export function parseUserRole(value: SearchParamValue): UserRole {
  const resolvedValue = Array.isArray(value) ? value[0] : value;

  if (resolvedValue === "employee" || resolvedValue === "manager" || resolvedValue === "supplier") {
    return resolvedValue;
  }

  return "manager";
}

export function getRoleFromSearchParams(searchParams?: SearchParams): UserRole {
  return parseUserRole(searchParams?.role);
}

export function withRole(path: string, role: UserRole): string {
  return `${path}?role=${role}`;
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === "employee") {
    return "/requests";
  }

  if (role === "supplier") {
    return "/orders";
  }

  return "/";
}
