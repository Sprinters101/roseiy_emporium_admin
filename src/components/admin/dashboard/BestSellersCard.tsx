import React from "react";
import { BasketIllustration } from "./EmptyStateIllustrations";
import type { Product } from "@/config/types";

interface BestSellersCardProps {
    items?: Array<{
        product: Product;
        totalSold: number;
        revenue: number;
    }>;
}

export const BestSellersCard: React.FC<BestSellersCardProps> = ({
    items = [],
}) => {
    return (
        <div className="bg-white border border-[#eaeaea] rounded-lg p-6 sm:p-7 shadow-xs flex flex-col min-h-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
                <h2 className="text-lg sm:text-xl font-bold font-hanken text-[#171717]">
                    Best Sellers
                </h2>
            </div>

            {/* Body */}
            {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <BasketIllustration className="size-36 mb-3" />
                    <p className="text-sm font-medium text-[#737373]">
                        No best sellers yet
                    </p>
                </div>
            ) : (
                <div className="flex-1 divide-y divide-[#f5f5f5] overflow-y-auto max-h-fit pt-2">
                    {items.map(({ product, totalSold, revenue }) => (
                        <div
                            key={product.id}
                            className="py-3.5 last:pb-0 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="size-14 rounded-lg object-contain bg-[#fafafa] border border-[#f0f0f0] p-1 shrink-0"
                                />
                                <div className="truncate">
                                    <h3 className="text-sm font-semibold text-[#171717] truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-xs text-[#737373]">
                                        {totalSold} Sold
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-[#171717]">
                                    ₦{revenue.toLocaleString("en-NG")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BestSellersCard;
