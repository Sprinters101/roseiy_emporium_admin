import React, { useMemo } from "react";
import { ArrowLeft, ShoppingBag, Coins, Calendar, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { initialCustomersList, type CustomerData } from "./AdminCustomers";
import { cn } from "@/lib/utils";

export interface CustomerOrderHistoryItem {
    id: string;
    sn: string;
    orderId: string;
    date: string;
    amount: number;
    paymentStatus: "Paid" | "Pending" | "Failed";
    orderProgress: "In Transit" | "Delivered" | "Failed" | "Order Placed";
}

const mockCustomerOrders: CustomerOrderHistoryItem[] = [
    {
        id: "RE-2026-7890",
        sn: "01",
        orderId: "Order RE-2026-7890",
        date: "25th July, 2024",
        amount: 75000,
        paymentStatus: "Paid",
        orderProgress: "In Transit",
    },
    {
        id: "RE-2026-7892",
        sn: "02",
        orderId: "Order RE-2026-7892",
        date: "26th July, 2024",
        amount: 3125000,
        paymentStatus: "Paid",
        orderProgress: "Delivered",
    },
    {
        id: "RE-2026-7891",
        sn: "03",
        orderId: "Order RE-2026-7891",
        date: "27th July, 2024",
        amount: 120000,
        paymentStatus: "Paid",
        orderProgress: "Failed",
    },
    {
        id: "RE-2026-7890-2",
        sn: "04",
        orderId: "Order RE-2026-7890",
        date: "25th July, 2024",
        amount: 5000000,
        paymentStatus: "Paid",
        orderProgress: "Delivered",
    },
    {
        id: "RE-2026-7893",
        sn: "05",
        orderId: "Order RE-2026-7893",
        date: "28th July, 2024",
        amount: 1225000,
        paymentStatus: "Paid",
        orderProgress: "Delivered",
    },
];

// Empty Order Box Illustration matching screenshot 5
const EmptyOrderBoxIllustration = () => (
    <div className="relative size-36 flex items-center justify-center mx-auto mb-2">
        <div className="absolute inset-0 bg-[#FAF3E0] rounded-full filter blur-sm opacity-90 scale-95" />
        <svg viewBox="0 0 100 100" className="size-24 z-10 drop-shadow-xs">
            {/* Box main body */}
            <rect x="25" y="38" width="50" height="42" rx="2" fill="#D4AF37" />
            <rect x="25" y="38" width="25" height="42" fill="#C5A265" />
            {/* Top flaps */}
            <polygon points="25,38 15,25 35,28 45,38" fill="#B8860B" />
            <polygon points="75,38 85,25 65,28 55,38" fill="#B8860B" />
            <polygon points="25,38 45,28 65,28 75,38" fill="#A4770A" />
            {/* Sad eyes & mouth */}
            <circle cx="58" cy="55" r="1.5" fill="#555" />
            <circle cx="68" cy="55" r="1.5" fill="#555" />
            <path
                d="M60 65 Q63 61 66 65"
                stroke="#555"
                strokeWidth="1.2"
                fill="none"
            />
        </svg>
    </div>
);

export const AdminCustomerDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Find customer by id or fallback to John Amadi
    const customer: CustomerData = useMemo(() => {
        const found = initialCustomersList.find((c) => c.id === id);
        if (found) return found;
        return initialCustomersList[0];
    }, [id]);

    const isDaisyDine = customer.id === "6" || customer.totalOrders === 0;

    const ordersList = isDaisyDine ? [] : mockCustomerOrders;

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Header with Back Button */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/customers")}
                    className="p-1 rounded-md text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer mb-2 inline-flex items-center"
                    aria-label="Back to customers"
                >
                    <ArrowLeft className="size-5" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Customer Details
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    View customer information , order history and addresses.
                </p>
            </div>

            {/* Top KPI Metrics Banner */}
            <div className="bg-[#FAF7F2] border border-[#F0EBE0] rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAE2D2] gap-6 md:gap-0">
                    {/* 1. Total Orders */}
                    <div className="flex items-center gap-4 md:px-6 first:pl-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-gold-500 shrink-0">
                            <ShoppingBag className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Total Orders
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                {customer.totalOrders}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                Updated few seconds ago
                            </span>
                        </div>
                    </div>

                    {/* 2. Total Spent */}
                    <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-gold-500 shrink-0">
                            <Coins className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Total Spent
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                ₦{customer.totalSpent.toLocaleString("en-NG")}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                Updated few seconds ago
                            </span>
                        </div>
                    </div>

                    {/* 3. Last Order */}
                    <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-gold-500 shrink-0">
                            <Calendar className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Last Order
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                {customer.lastOrder || "2 Days Ago"}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                Updated few seconds ago
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 1: Customer Information */}
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        1
                    </span>
                    <h2 className="text-base font-bold text-[#171717]">
                        Customer Information
                    </h2>
                </div>

                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Customer Name
                            </span>
                            <span className="text-sm font-bold text-[#171717] block mt-1">
                                {customer.name}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Phone Number
                            </span>
                            <span className="text-sm font-bold text-[#171717] block mt-1">
                                {customer.phone}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Email Address
                            </span>
                            <span className="text-sm font-bold text-[#171717] block mt-1">
                                {customer.email}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Date Joined
                            </span>
                            <span className="text-sm font-bold text-[#171717] block mt-1">
                                12 February 2025
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: Saved Addresses */}
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        2
                    </span>
                    <h2 className="text-base font-bold text-[#171717]">
                        Saved Addresses
                    </h2>
                </div>

                {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {customer.addresses.map((addr, idx) => (
                            <div
                                key={addr.id || idx}
                                className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-start gap-3.5"
                            >
                                <div className="size-10 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
                                    <MapPin className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-[#171717]">
                                            {addr.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                                        {addr.address}
                                    </p>
                                    {addr.isDefault && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] mt-2">
                                            <span className="size-1.5 rounded-full bg-[#10B981]" />
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
                            <div className="size-10 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
                                <MapPin className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#171717]">
                                    Shipping Address 1
                                </h4>
                                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                                    Plot 8 Augustus Alakiya Close, Ogombo, Lekki
                                    Lagos
                                </p>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981] mt-2">
                                    <span className="size-1.5 rounded-full bg-[#10B981]" />
                                    Default
                                </span>
                            </div>
                        </div>

                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
                            <div className="size-10 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
                                <MapPin className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#171717]">
                                    Shipping Address 2
                                </h4>
                                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                                    Plot 8 Augustus Alakiya Close, Ogombo, Lekki
                                    Lagos
                                </p>
                            </div>
                        </div>

                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-start gap-3.5">
                            <div className="size-10 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
                                <MapPin className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#171717]">
                                    Shipping Address 3
                                </h4>
                                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                                    Plot 8 Augustus Alakiya Close, Ogombo, Lekki
                                    Lagos
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 3: Order History */}
            <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="size-5 rounded-full bg-[#B8860B] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        3
                    </span>
                    <h2 className="text-base font-bold text-[#171717]">
                        Order History
                    </h2>
                </div>

                {ordersList.length === 0 ? (
                    /* Empty Orders state matching screenshot 5 */
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-12 text-center shadow-xs">
                        <EmptyOrderBoxIllustration />
                        <h4 className="text-sm font-semibold text-[#171717] mt-3">
                            No orders available yet
                        </h4>
                    </div>
                ) : (
                    /* Orders Table matching screenshot 3 */
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-[#FAF7F2] text-xs font-semibold text-[#171717]">
                                        <th className="py-3.5 px-4">S/N</th>
                                        <th className="py-3.5 px-4">
                                            Order ID
                                        </th>
                                        <th className="py-3.5 px-4">Date</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">
                                            Payment Status
                                        </th>
                                        <th className="py-3.5 px-4">
                                            Order Progress
                                        </th>
                                        <th className="py-3.5 px-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F5F5F5]">
                                    {ordersList.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-[#FAF8F5] transition-colors"
                                        >
                                            <td className="py-3.5 px-4 text-sm text-[#171717]">
                                                {order.sn}
                                            </td>
                                            <td className="py-3.5 px-4 text-sm text-[#171717]">
                                                {order.orderId}
                                            </td>
                                            <td className="py-3.5 px-4 text-sm text-[#171717]">
                                                {order.date}
                                            </td>
                                            <td className="py-3.5 px-4 text-sm text-[#171717]">
                                                ₦
                                                {order.amount.toLocaleString(
                                                    "en-NG",
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                                                    <span className="size-1.5 rounded-full bg-[#10B981]" />
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 text-xs font-semibold",
                                                        order.orderProgress ===
                                                            "Delivered" &&
                                                            "text-[#10B981]",
                                                        order.orderProgress ===
                                                            "In Transit" &&
                                                            "text-[#D4AF37]",
                                                        order.orderProgress ===
                                                            "Failed" &&
                                                            "text-[#EF4444]",
                                                        order.orderProgress ===
                                                            "Order Placed" &&
                                                            "text-[#3B82F6]",
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "size-1.5 rounded-full",
                                                            order.orderProgress ===
                                                                "Delivered" &&
                                                                "bg-[#10B981]",
                                                            order.orderProgress ===
                                                                "In Transit" &&
                                                                "bg-[#D4AF37]",
                                                            order.orderProgress ===
                                                                "Failed" &&
                                                                "bg-[#EF4444]",
                                                            order.orderProgress ===
                                                                "Order Placed" &&
                                                                "bg-[#3B82F6]",
                                                        )}
                                                    />
                                                    {order.orderProgress}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/orders/${order.id}`,
                                                        )
                                                    }
                                                    className="text-sm font-medium text-[#171717] hover:text-[#D4AF37] transition-colors cursor-pointer underline"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomerDetails;
