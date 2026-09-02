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
import { AdminCustomers } from "@/components/admin/customers/AdminCustomers";
import { AdminCustomerDetails } from "@/components/admin/customers/AdminCustomerDetails";
import { AdminSettings } from "@/components/admin/settings/AdminSettings";
import { AdminLogin } from "@/components/admin/auth/AdminLogin";

export const router = createBrowserRouter([
    // Dedicated Admin Management Application
    {
        path: "/",
        element: <AdminLayout />,
        children: [
            { index: true, element: <AdminOverview /> },
            { path: "products", element: <AdminProducts /> },
            { path: "products/new", element: <AdminAddProduct /> },
            { path: "products/edit/:id", element: <AdminEditProduct /> },
            { path: "products/:id/edit", element: <AdminEditProduct /> },
            { path: "categories", element: <AdminCategories /> },
            { path: "brands", element: <AdminBrands /> },
            { path: "orders", element: <AdminOrders /> },
            { path: "orders/:id", element: <AdminOrderDetails /> },
            { path: "deliveries", element: <AdminDeliveries /> },
            { path: "customers", element: <AdminCustomers /> },
            { path: "customers/:id", element: <AdminCustomerDetails /> },
            { path: "settings", element: <AdminSettings /> },
        ],
    },

    // Admin Auth Gateway
    {
        path: "/login",
        element: <AdminLogin />,
    },

    // Catch-all redirect to Admin Dashboard
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);

export default router;
