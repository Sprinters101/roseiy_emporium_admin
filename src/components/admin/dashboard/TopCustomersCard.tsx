import React from "react";
import { BasketIllustration } from "./EmptyStateIllustrations";

interface CustomerItem {
    id: string;
    name: string;
    email: string;
    totalOrders: number;
    totalSpend: number;
}

interface TopCustomersCardProps {
    customers?: CustomerItem[];
}

export const TopCustomersCard: React.FC<TopCustomersCardProps> = ({
    customers = [],
}) => {
    return (
        <div className="bg-white border border-[#eaeaea] rounded-lg p-5 shadow-xs flex flex-col min-h-95">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
                <h2 className="text-lg sm:text-xl font-bold font-hanken text-[#171717]">
                    Top Customers
                </h2>
            </div>

            {/* Body */}
            {customers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                    <BasketIllustration className="size-36 mb-3" />
                    <p className="text-sm font-medium text-[#737373]">
                        No top customers yet
                    </p>
                </div>
            ) : (
                <div className="flex-1 divide-y divide-[#f5f5f5] overflow-y-auto max-h-fit pt-2">
                    {customers.map((cust) => (
                        <div
                            key={cust.id}
                            className="py-3.5 last:pb-0 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="size-14 rounded-full border border-black-50 bg-[#FDFAF1] text-[#B88E06] text-base flex items-center justify-center shrink-0">
                                    {cust.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="truncate">
                                    <h3 className="text-sm font-semibold text-[#171717] truncate">
                                        {cust.name}
                                    </h3>
                                    <p className="text-xs text-[#737373] truncate">
                                        {cust.totalOrders} Orders
                                    </p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <span className="text-sm font-bold text-[#171717]">
                                    ₦{cust.totalSpend.toLocaleString("en-NG")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TopCustomersCard;
