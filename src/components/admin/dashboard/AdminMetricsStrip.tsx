import React from "react";
import { CircleDollarSign, CalendarDays, ShoppingBag, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminMetricsStripProps {
    totalRevenue?: number;
    todayRevenue?: number;
    totalOrders?: number;
    totalProducts?: number;
    isLoading?: boolean;
}

export const AdminMetricsStrip: React.FC<AdminMetricsStripProps> = ({
    totalRevenue = 0,
    todayRevenue = 0,
    totalOrders = 0,
    totalProducts = 0,
    isLoading = false,
}) => {
    // Format currency in Nigerian Naira ₦
    const formatCurrency = (val: number) => {
        return `₦${val.toLocaleString("en-NG")}`;
    };

    const metrics = [
        {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: CircleDollarSign,
            updated: "Updated few seconds ago",
            skeletonWidth: "w-32 sm:w-36",
        },
        {
            label: "Today's Revenue",
            value: formatCurrency(todayRevenue),
            icon: CalendarDays,
            updated: "Updated few seconds ago",
            skeletonWidth: "w-28 sm:w-32",
        },
        {
            label: "Total Orders",
            value: totalOrders.toLocaleString(),
            icon: ShoppingBag,
            updated: "Updated few seconds ago",
            skeletonWidth: "w-20 sm:w-24",
        },
        {
            label: "Total Products",
            value: totalProducts.toLocaleString(),
            icon: Package,
            updated: "Updated few seconds ago",
            skeletonWidth: "w-20 sm:w-24",
        },
    ];

    return (
        <div className="w-full bg-[#111111] border border-[#242424] rounded-2xl p-6 sm:p-7 shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 lg:divide-x lg:divide-[#242424]">
                {metrics.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.label}
                            className={`flex items-center gap-4.5 ${
                                idx > 0 ? "lg:pl-8" : ""
                            }`}
                        >
                            {/* Gold Icon Badge */}
                            <div className="size-12 rounded-full bg-[#241f14] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                                <Icon className="size-5.5 text-[#e5c158]" />
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs sm:text-sm font-medium text-[#999999] leading-tight mb-1">
                                    {item.label}
                                </span>
                                {isLoading ? (
                                    <Skeleton
                                        className={`h-7 sm:h-8.5 ${item.skeletonWidth} my-0.5 bg-[#252525] rounded-md`}
                                    />
                                ) : (
                                    <span className="text-2xl sm:text-3xl font-bold font-hanken text-white tracking-tight leading-tight">
                                        {item.value}
                                    </span>
                                )}
                                <span className="text-[11px] text-[#6b7280] font-medium mt-1">
                                    {item.updated}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminMetricsStrip;
