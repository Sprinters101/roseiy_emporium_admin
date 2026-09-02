import React from "react";
import { Link } from "react-router";
import { PackageIllustration } from "./EmptyStateIllustrations";

export interface AdminOrderSummary {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail?: string;
    itemsCount?: number;
    totalAmount: number;
    status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "ongoing"
        | "failed"
        | "cancelled";
    // | string;
    createdAt: string;
}

interface RecentOrdersCardProps {
    orders?: AdminOrderSummary[];
    onViewAll?: () => void;
}

export const RecentOrdersCard: React.FC<RecentOrdersCardProps> = ({
    orders = [],
    onViewAll,
}) => {
    const renderStatus = (status: string) => {
        const s = status.toLowerCase();
        if (s === "delivered") {
            return (
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#10B981]">
                    <span className="size-1.5 rounded-full bg-[#10B981]" />
                    <span>Delivered</span>
                </div>
            );
        }
        if (
            s === "ongoing" ||
            s === "processing" ||
            s === "shipped" ||
            s === "pending"
        ) {
            return (
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#F59E0B]">
                    <span className="size-1.5 rounded-full bg-[#F59E0B]" />
                    <span>Ongoing</span>
                </div>
            );
        }
        if (s === "failed" || s === "cancelled") {
            return (
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#EF4444]">
                    <span className="size-1.5 rounded-full bg-[#EF4444]" />
                    <span>Failed</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#737373]">
                <span className="size-1.5 rounded-full bg-[#737373]" />
                <span className="capitalize">{status}</span>
            </div>
        );
    };

    return (
        <div className="bg-white border border-[#eaeaea] rounded-lg  shadow-xs flex flex-col min-h-95 mt-8">
            {/* Header */}
            <div className="flex items-center justify-between p-5">
                <h2 className="text-lg sm:text-xl font-bold font-hanken text-[#171717]">
                    Recent Orders
                </h2>
                <Link
                    to="/orders"
                    onClick={onViewAll}
                    className="text-xs sm:text-sm font-semibold text-gold-500 hover:text-gold-600 underline underline-offset-2 transition-colors cursor-pointer"
                >
                    View all
                </Link>
            </div>

            {/* Body */}
            {orders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <PackageIllustration className="size-36 mb-3" />
                    <p className="text-sm font-medium text-[#737373]">
                        No recent orders yet
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="bg-[#FAF7F2] text-xs font-semibold text-[#171717]">
                                <th className="py-3 px-4 font-medium">S/N</th>
                                <th className="py-3 px-4 font-medium">
                                    Order ID
                                </th>
                                <th className="py-3 px-4 font-medium">
                                    Customer Name
                                </th>
                                <th className="py-3 px-4 font-medium">
                                    Amount
                                </th>
                                <th className="py-3 px-4 font-medium">
                                    Status
                                </th>
                                <th className="py-3 px-4 font-medium">Date</th>
                                <th className="py-3 px-4  font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f5f5]">
                            {orders.map((order, index) => {
                                const sn = String(index + 1).padStart(2, "0");
                                const orderIdText =
                                    order.orderNumber.startsWith("Order")
                                        ? order.orderNumber
                                        : `Order ${order.orderNumber}`;

                                return (
                                    <tr
                                        key={order.id || index}
                                        className="hover:bg-[#fafafa] transition-colors"
                                    >
                                        <td className="py-4.5 px-4 text-sm text-[#737373]">
                                            {sn}
                                        </td>
                                        <td className="py-4.5 px-4 text-sm text-[#171717]">
                                            {orderIdText}
                                        </td>
                                        <td className="py-4.5 px-4 text-sm text-[#171717]">
                                            {order.customerName}
                                        </td>
                                        <td className="py-4.5 px-4 text-sm text-[#171717]">
                                            ₦
                                            {order.totalAmount.toLocaleString(
                                                "en-NG",
                                            )}
                                        </td>
                                        <td className="py-4.5 px-4">
                                            {renderStatus(order.status)}
                                        </td>
                                        <td className="py-4.5 px-4 text-sm text-[#737373]">
                                            {order.createdAt}
                                        </td>
                                        <td className="py-4.5 px-4">
                                            <Link
                                                to={`/orders?id=${order.id}`}
                                                className="text-sm text-[#171717] hover:text-gold-500 underline underline-offset-2 transition-colors cursor-pointer"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RecentOrdersCard;
