import React, { useState, useEffect } from "react";
import { AdminMetricsStrip } from "./AdminMetricsStrip";
import { BestSellersCard } from "./BestSellersCard";
import { TopCustomersCard } from "./TopCustomersCard";
import { RecentOrdersCard, type AdminOrderSummary } from "./RecentOrdersCard";
import { useAuth } from "@/context/AuthContext";
import { formatLiveDateTime, getGreeting } from "@/lib/utils";
import { useGetAdminDashboard } from "@/service/queries";

export const AdminOverview: React.FC = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    const { data: dashboardData, isLoading, isPending } =
        useGetAdminDashboard();
    const isDashboardLoading = isLoading || isPending;
    const dashboard = dashboardData?.data?.dashboard;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const adminFirstName = user?.firstName || "Roseiy";

    // Extract live metrics from dashboard endpoint (0 defaults, no dummy data)
    const totalRevenue = dashboard?.salesSummary?.totalSales
        ? parseFloat(dashboard.salesSummary.totalSales)
        : 0;

    // Today's revenue is not provided by the backend endpoint yet
    const todayRevenue = 0;

    const totalOrders = dashboard?.ordersSummary?.total ?? 0;

    const totalProducts = dashboard?.inventorySummary?.totalProducts ?? 0;

    // Map live recentOrders from dashboard endpoint; empty array if none available
    const mappedRecentOrders: AdminOrderSummary[] =
        dashboard?.recentOrders && Array.isArray(dashboard.recentOrders)
            ? dashboard.recentOrders.map((order: any, idx: number) => {
                  let customerName = "Customer";
                  if (order.customer) {
                      const first = order.customer.firstName || "";
                      const last = order.customer.lastName || "";
                      customerName =
                          `${first} ${last}`.trim() ||
                          order.customer.email ||
                          "Customer";
                  } else if (order.customerName) {
                      customerName = order.customerName;
                  }

                  let createdAt = order.createdAt || "";
                  if (createdAt) {
                      const d = new Date(createdAt);
                      if (!Number.isNaN(d.getTime())) {
                          createdAt = d.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                          });
                      }
                  }

                  const rawTotal = order.total ?? order.totalAmount ?? 0;
                  const totalAmount =
                      typeof rawTotal === "string"
                          ? parseFloat(rawTotal)
                          : Number(rawTotal);

                  return {
                      id: order.orderId || order.id || String(idx + 1),
                      orderNumber: order.orderNumber || "",
                      customerName,
                      customerEmail:
                          order.customer?.email || order.customerEmail,
                      totalAmount: Number.isNaN(totalAmount) ? 0 : totalAmount,
                      status: order.status || "pending",
                      createdAt,
                  };
              })
            : [];

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Top Greeting & Date Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-md sm:text-lg lg:text-[1.5625rem] font-bold font-playfair text-[#171717]  flex items-center gap-2">
                        {getGreeting(currentTime)}, {adminFirstName}{" "}
                        <span role="img" aria-label="wave">
                            👏
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-black-200 font-hanken mt-1">
                        Here's what's happening with your store today
                    </p>
                </div>

                <div className="text-xs sm:text-sm font-medium text-black-200  self-start sm:self-auto">
                    {formatLiveDateTime(currentTime)}
                </div>
            </div>

            {/* High-Contrast Dark Metrics Strip */}
            <AdminMetricsStrip
                totalRevenue={totalRevenue}
                todayRevenue={todayRevenue}
                totalOrders={totalOrders}
                totalProducts={totalProducts}
                isLoading={isDashboardLoading}
            />

            {/* 2-Column Row: Best Sellers & Top Customers (shows empty state when no data) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                <BestSellersCard items={[]} />
                <TopCustomersCard customers={[]} />
            </div>

            {/* Full-Width Row: Recent Orders (shows empty state when no data) */}
            <RecentOrdersCard orders={mappedRecentOrders} />
        </div>
    );
};

export default AdminOverview;
