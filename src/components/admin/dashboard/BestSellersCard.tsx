import React from "react";
import { Link } from "react-router";
import { BasketIllustration } from "./EmptyStateIllustrations";
import { Skeleton } from "@/components/ui/skeleton";

export interface BestSellerItem {
    id: string;
    name: string;
    image?: string | null;
    totalSold: number;
    revenue: number;
    slug?: string;
}

interface BestSellersCardProps {
    items?: BestSellerItem[];
    isLoading?: boolean;
    onViewAll?: () => void;
}

export const BestSellersCard: React.FC<BestSellersCardProps> = ({
    items = [],
    isLoading = false,
    onViewAll,
}) => {
    return (
        <div className="bg-white border border-[#eaeaea] rounded-lg p-6 sm:p-7 shadow-xs flex flex-col min-h-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
                <h2 className="text-lg sm:text-xl font-bold font-hanken text-[#171717]">
                    Best Sellers
                </h2>
                <Link
                    to="/products"
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
                                <Skeleton className="size-14 rounded-lg bg-gray-100" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32 bg-gray-100" />
                                    <Skeleton className="h-3 w-16 bg-gray-100" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-20 bg-gray-100" />
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <BasketIllustration className="size-36 mb-3" />
                    <p className="text-sm font-medium text-[#737373]">
                        No best sellers yet
                    </p>
                </div>
            ) : (
                <div className="flex-1 divide-y divide-[#f5f5f5] overflow-hidden max-h-fit pt-2">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            to={
                                item.id
                                    ? `/products/edit/${item.id}`
                                    : "/products"
                            }
                            className="py-3.5 last:pb-0 flex items-center justify-between gap-4 hover:bg-[#fafafa] -mx-2 px-2 rounded-lg transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="size-14 rounded-lg object-contain bg-[#fafafa] border border-[#f0f0f0] p-1 shrink-0 group-hover:border-[#D4AF37]/60 transition-colors"
                                        onError={(e) => {
                                            (
                                                e.currentTarget as HTMLElement
                                            ).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <div className="size-14 rounded-lg bg-[#FAF5E6] border border-[#f0f0f0] text-[#D4AF37] flex items-center justify-center font-bold text-base shrink-0 group-hover:border-[#D4AF37]/60 transition-colors">
                                        {item.name.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="truncate">
                                    <h3 className="text-sm font-semibold text-[#171717] group-hover:text-gold-500 transition-colors truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-xs text-[#737373]">
                                        {item.totalSold}{" "}
                                        {item.totalSold === 1
                                            ? "Unit"
                                            : "Units"}{" "}
                                        Sold
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-[#171717]">
                                    ₦
                                    {item.revenue.toLocaleString("en-NG", {
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

export default BestSellersCard;
