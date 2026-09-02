import React, { useState, useEffect } from "react";
import { AdminMetricsStrip } from "./AdminMetricsStrip";
import { BestSellersCard } from "./BestSellersCard";
import { TopCustomersCard } from "./TopCustomersCard";
import { RecentOrdersCard } from "./RecentOrdersCard";
import {
    products,
    bestSellingProducts,
    topCustomers,
    recentOrders,
    adminMetrics,
} from "@/lib/site_data";
import { useAuth } from "@/context/AuthContext";
import { formatLiveDateTime, getGreeting } from "@/lib/utils";

export const AdminOverview: React.FC = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);
        return () => clearInterval(timer);
    }, []);

    const adminFirstName = user?.firstName || "Roseiy";

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
                totalRevenue={adminMetrics.totalRevenue}
                todayRevenue={adminMetrics.todayRevenue}
                totalOrders={adminMetrics.totalOrders}
                totalProducts={products.length || 0}
            />

            {/* 2-Column Row: Best Sellers & Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                <BestSellersCard items={bestSellingProducts} />
                <TopCustomersCard customers={topCustomers} />
            </div>

            {/* Full-Width Row: Recent Orders */}
            <RecentOrdersCard orders={recentOrders} />
        </div>
    );
};

export default AdminOverview;
