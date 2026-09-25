import React from "react";
import { Link } from "react-router";
import { BasketIllustration } from "./EmptyStateIllustrations";
import { Skeleton } from "@/components/ui/skeleton";

export interface CustomerItem {
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpend: number;
}

interface TopCustomersCardProps {
    customers?: CustomerItem[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = ({
    customers = [],
    isLoading = false,
    onViewAll,
}) => {
    return (
        <div className="bg-white border border-[#eaeaea] rounded-lg p-5 shadow-xs flex flex-col min-h-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
                <h2 className="text-lg sm:text-xl font-bold font-hanken text-[#171717]">
                    Top Customers
                </h2>
                <Link
                    to="/customers"
                    onClick={onViewAll}
                    className="text-xs sm:text-sm font-semibold text-gold-500 hover:text-gold-600 underline underline-offset-2 transition-colors cursor-pointer"
                >
                    View all
                </Link>
            </div>

            {/* Body */}
            {isLoading ? (
                <div className="flex-1 divide-y divide-[#f5f5f5] pt-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="py-3.5 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <Skeleton className="size-14 rounded-full bg-gray-100 shrink-0" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 bg-gray-100" />
                                    <Skeleton className="h-3 w-16 bg-gray-100" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-20 bg-gray-100" />
                        </div>
                    ))}
                </div>
            ) : customers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <BasketIllustration className="size-36 mb-3" />
                    <p className="text-sm font-medium text-[#737373]">
                        No top customers yet
                    </p>
                </div>
            ) : (
                <div className="flex-1 divide-y divide-[#f5f5f5] overflow-hidden max-h-fit pt-2">
                    {customers.map((cust) => (
                        <Link
                            key={cust.id}
                            to={
                                cust.id ? `/customers/${cust.id}` : "/customers"
                            }
                            className="py-3.5 last:pb-0 flex items-center justify-between gap-4 hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="size-14 rounded-full border border-black-50 bg-[#FDFAF1] text-[#B88E06] text-base flex items-center justify-center shrink-0 font-bold group-hover:border-[#D4AF37] transition-colors">
                                    {cust.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <h3 className="text-sm font-semibold text-[#171717] group-hover:text-gold-500 transition-colors truncate">
                                        {cust.name}
                                    </h3>
                                    <p className="text-xs text-[#737373] truncate">
                                        {cust.totalOrders}{" "}
                                        {cust.totalOrders === 1
                                            ? "Order"
                                            : "Orders"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-[#171717]">
                                    ₦
                                    {cust.totalSpend.toLocaleString("en-NG", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopCustomersCard;
