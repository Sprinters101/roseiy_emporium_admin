import type { AdminRole } from "@/service/types";

export const ROLE_LABELS: Record<AdminRole, string> = {
    super_admin: "Super Administrator",
    administrator: "Administrator",
    admin: "Admin",
    store_manager: "Store Manager",
    order_manager: "Order Manager",
    product_manager: "Product Manager",
};

/**
 * Route-level permission mappings based on the official Roseiy Emporium RBAC Matrix.
 */
export const ROUTE_PERMISSIONS = {
    dashboard: [
        "super_admin",
        "administrator",
        "admin",
        "store_manager",
        "order_manager",
        "product_manager",
    ] as AdminRole[],

    products: [
        "super_admin",
        "administrator",
        "admin",
        "store_manager",
        "product_manager",
    ] as AdminRole[],

    productsManage: [
        "super_admin",
        "store_manager",
        "product_manager",
    ] as AdminRole[],

    categories: [
        "super_admin",
        "administrator",
        "admin",
        "store_manager",
        "product_manager",
    ] as AdminRole[],

    brands: [
        "super_admin",
        "administrator",
        "admin",
        "store_manager",
        "product_manager",
    ] as AdminRole[],

    orders: [
        "super_admin",
        "store_manager",
        "order_manager",
    ] as AdminRole[],

    deliveries: [
        "super_admin",
        "store_manager",
        "order_manager",
    ] as AdminRole[],

    customers: [
        "super_admin",
        "store_manager",
        "order_manager",
    ] as AdminRole[],

    payments: [
        "super_admin",
        "store_manager",
        "order_manager",
    ] as AdminRole[],

    settings: [
        "super_admin",
        "administrator",
        "admin",
        "store_manager",
        "order_manager",
        "product_manager",
    ] as AdminRole[],

    adminManagement: [
        "super_admin",
    ] as AdminRole[],

    businessSettings: [
        "super_admin",
        "store_manager",
    ] as AdminRole[],
};

// ----------------------------------------------------------------------
// Permission Check Helpers
// ----------------------------------------------------------------------

export const isRoleAuthorized = (
    userRole: string | undefined | null,
    allowedRoles: AdminRole[],
): boolean => {
    if (!userRole) return false;
    const normalized = userRole.toLowerCase() as AdminRole;
    if (normalized === "super_admin") return true;
    return allowedRoles.includes(normalized);
};

export const canManageCatalogue = (userRole: string | undefined | null): boolean => {
    return isRoleAuthorized(userRole, ROUTE_PERMISSIONS.productsManage);
};

export const canManageOrders = (userRole: string | undefined | null): boolean => {
    return isRoleAuthorized(userRole, ROUTE_PERMISSIONS.orders);
};

export const canManageDeliveries = (userRole: string | undefined | null): boolean => {
    return isRoleAuthorized(userRole, ROUTE_PERMISSIONS.deliveries);
};

export const canManageStoreSettings = (userRole: string | undefined | null): boolean => {
    return isRoleAuthorized(userRole, ROUTE_PERMISSIONS.businessSettings);
};

export const canManageAdminUsers = (userRole: string | undefined | null): boolean => {
    return isRoleAuthorized(userRole, ROUTE_PERMISSIONS.adminManagement);
};
