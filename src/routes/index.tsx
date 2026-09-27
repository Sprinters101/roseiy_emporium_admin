import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AdminOverview } from "@/components/admin/dashboard/AdminOverview";
import { AdminProducts } from "@/components/admin/products/AdminProducts";
import { AdminAddProduct } from "@/components/admin/products/AdminAddProduct";
import { AdminEditProduct } from "@/components/admin/products/AdminEditProduct";
import { AdminCategories } from "@/components/admin/categories/AdminCategories";
import { AdminBrands } from "@/components/admin/brands/AdminBrands";
import { AdminOrders } from "@/components/admin/orders/AdminOrders";
import { AdminOrderDetails } from "@/components/admin/orders/AdminOrderDetails";
import { AdminDeliveries } from "@/components/admin/deliveries/AdminDeliveries";
import { AdminPayments } from "@/components/admin/payments/AdminPayments";
import { AdminCustomers } from "@/components/admin/customers/AdminCustomers";
import { AdminCustomerDetails } from "@/components/admin/customers/AdminCustomerDetails";
import { AdminSettings } from "@/components/admin/settings/AdminSettings";
import { AdminLogin } from "@/components/admin/auth/AdminLogin";
import { ProtectedRoute, PublicAuthRoute, RoleRoute } from "@/routes/guards";
import { ROUTE_PERMISSIONS } from "@/config/permissions";

export const router = createBrowserRouter([
    // Dedicated Admin Management Application (Protected)
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.dashboard}
                        moduleName="Dashboard"
                    >
                        <AdminOverview />
                    </RoleRoute>
                ),
            },
            {
                path: "products",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.products}
                        moduleName="Products"
                    >
                        <AdminProducts />
                    </RoleRoute>
                ),
            },
            {
                path: "products/new",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.productsManage}
                        moduleName="Product Creation"
                    >
                        <AdminAddProduct />
                    </RoleRoute>
                ),
            },
            {
                path: "products/edit/:id",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.productsManage}
                        moduleName="Product Editing"
                    >
                        <AdminEditProduct />
                    </RoleRoute>
                ),
            },
            {
                path: "products/:id/edit",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.productsManage}
                        moduleName="Product Editing"
                    >
                        <AdminEditProduct />
                    </RoleRoute>
                ),
            },
            {
                path: "categories",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.categories}
                        moduleName="Categories"
                    >
                        <AdminCategories />
                    </RoleRoute>
                ),
            },
            {
                path: "brands",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.brands}
                        moduleName="Brands"
                    >
                        <AdminBrands />
                    </RoleRoute>
                ),
            },
            {
                path: "orders",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.orders}
                        moduleName="Orders"
                    >
                        <AdminOrders />
                    </RoleRoute>
                ),
            },
            {
                path: "orders/:id",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.orders}
                        moduleName="Order Details"
                    >
                        <AdminOrderDetails />
                    </RoleRoute>
                ),
            },
            {
                path: "payments",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.payments}
                        moduleName="Payments"
                    >
                        <AdminPayments />
                    </RoleRoute>
                ),
            },
            {
                path: "deliveries",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.deliveries}
                        moduleName="Deliveries"
                    >
                        <AdminDeliveries />
                    </RoleRoute>
                ),
            },
            {
                path: "customers",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.customers}
                        moduleName="Customers"
                    >
                        <AdminCustomers />
                    </RoleRoute>
                ),
            },
            {
                path: "customers/:id",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.customers}
                        moduleName="Customer Details"
                    >
                        <AdminCustomerDetails />
                    </RoleRoute>
                ),
            },
            {
                path: "settings",
                element: (
                    <RoleRoute
                        allowedRoles={ROUTE_PERMISSIONS.settings}
                        moduleName="Settings"
                    >
                        <AdminSettings />
                    </RoleRoute>
                ),
            },
        ],
    },

    // Admin Auth Gateway (Public with auto-redirect if logged in)
    {
        path: "/login",
        element: (
            <PublicAuthRoute>
                <AdminLogin />
            </PublicAuthRoute>
        ),
    },

    // Catch-all redirect
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;
