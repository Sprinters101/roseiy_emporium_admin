import React from "react";
import {
    ArrowLeft,
    ShoppingBag,
    Coins,
    Calendar,
    MapPin,
    RefreshCw,
    Package,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import { useGetAdminCustomer } from "@/service/queries";

export interface CustomerOrderHistoryItem {
    id: string;
    sn: string;
    orderId: string;
    date: string;
    amount: number;
    paymentStatus: "Paid" | "Pending" | "Failed";
    orderProgress: "In Transit" | "Delivered" | "Failed" | "Order Placed";
}

// Empty Order Box Illustration matching theme design
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

const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return isoString;
    }
};

const formatCurrency = (amount?: string | number) => {
    const num = Number(amount || 0);
    return `₦${num.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const AdminCustomerDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const {
        data: customerResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetAdminCustomer(id || "");

    const customer = customerResponse?.data?.customer;
    const addresses = customerResponse?.data?.addresses || [];
    const orders = customerResponse?.data?.orders || [];
    const summary = customerResponse?.data?.summary;

    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse pb-12">
                <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-64 bg-gray-100 rounded" />
                </div>
                <div className="h-28 bg-[#FAF7F2] rounded-2xl border border-[#F0EBE0]" />
                <div className="h-44 bg-white rounded-2xl border border-[#EAEAEA]" />
                <div className="h-44 bg-white rounded-2xl border border-[#EAEAEA]" />
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white border border-[#EAEAEA] rounded-2xl p-8 max-w-lg mx-auto mt-8">
                <p className="text-base font-semibold text-red-600 mb-1">
                    {isError
                        ? "Failed to load customer details"
                        : "Customer not found"}
                </p>
                <p className="text-xs text-[#737373] mb-5">
                    {(error as any)?.response?.data?.message ||
                        (error as any)?.message ||
                        "The requested customer account could not be found or retrieved."}
                </p>
                <div className="flex items-center gap-3">
                    {isError && (
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-white text-xs font-semibold hover:bg-[#C5A265] transition-colors cursor-pointer"
                        >
                            <RefreshCw className="size-3.5" />
                            <span>Retry</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate("/customers")}
                        className="px-4 py-2 rounded-lg bg-white border border-[#E5E5E5] text-xs font-semibold text-[#171717] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                        Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    const isVerified = customer.status === "verified";

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                            Customer Details
                        </h1>
                        <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                            View customer profile, saved delivery addresses, and
                            order history.
                        </p>
                    </div>

                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize",
                            isVerified
                                ? "bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]"
                                : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
                        )}
                    >
                        <span
                            className={cn(
                                "size-1.5 rounded-full",
                                isVerified ? "bg-[#1E7E34]" : "bg-[#D97706]",
                            )}
                        />
                        {isVerified
                            ? "Verified Customer"
                            : "Pending Verification"}
                    </span>
                </div>
            </div>

            {/* Top KPI Metrics Banner */}
            <div className="bg-[#FAF7F2] border border-[#F0EBE0] rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EAE2D2] gap-6 md:gap-0">
                    {/* 1. Total Orders */}
                    <div className="flex items-center gap-4 md:px-6 first:pl-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-[#D4AF37] shrink-0">
                            <ShoppingBag className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Total Orders
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                {summary?.totalOrders ??
                                    customer.orderCount ??
                                    0}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                All-time registered orders
                            </span>
                        </div>
                    </div>

                    {/* 2. Total Spent */}
                    <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-[#D4AF37] shrink-0">
                            <Coins className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Total Spent
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                {formatCurrency(
                                    summary?.totalSpent ?? customer.totalSpent,
                                )}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                Completed & active orders
                            </span>
                        </div>
                    </div>

                    {/* 3. Active Orders */}
                    <div className="flex items-center gap-4 md:px-6 pt-4 md:pt-0">
                        <div className="size-12 rounded-full bg-[#171717] flex items-center justify-center text-[#D4AF37] shrink-0">
                            <Calendar className="size-5" />
                        </div>
                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Active Orders
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold text-[#171717] font-hanken block mt-0.5">
                                {summary?.activeOrders ?? 0}
                            </span>
                            <span className="text-[11px] text-[#888888] block mt-0.5">
                                Processing or in-transit
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
                                {customer.firstName} {customer.lastName}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-[#737373] block font-medium">
                                Phone Number
                            </span>
                            <span className="text-sm font-bold text-[#171717] block mt-1">
                                {customer.phoneNumber || "-"}
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
                                {formatDate(customer.createdAt)}
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

                {addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {addresses.map((addr, idx) => (
                            <div
                                key={addr.addressId || idx}
                                className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-start gap-3.5"
                            >
                                <div className="size-10 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center text-[#171717] shrink-0 mt-0.5">
                                    <MapPin className="size-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-[#171717]">
                                            {addr.label || `Address ${idx + 1}`}
                                        </h4>
                                        {addr.isDefault && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10B981]">
                                                <span className="size-1.5 rounded-full bg-[#10B981]" />
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-[#171717] mt-1">
                                        {addr.firstName} {addr.lastName}{" "}
                                        {addr.phoneNumber &&
                                            `(${addr.phoneNumber})`}
                                    </p>
                                    <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                                        {addr.addressLine1}
                                        {addr.addressLine2
                                            ? `, ${addr.addressLine2}`
                                            : ""}
                                    </p>
                                    <p className="text-xs text-[#737373] leading-relaxed">
                                        {addr.city}, {addr.state}
                                        {addr.postalCode
                                            ? ` - ${addr.postalCode}`
                                            : ""}
                                        , {addr.country}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 text-center shadow-xs">
                        <MapPin className="size-8 text-[#CCCCCC] mx-auto mb-2" />
                        <p className="text-sm font-semibold text-[#171717]">
                            No saved addresses
                        </p>
                        <p className="text-xs text-[#737373] mt-1">
                            This customer has not saved any delivery addresses
                            yet.
                        </p>
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

                {orders.length === 0 ? (
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-12 text-center shadow-xs">
                        <EmptyOrderBoxIllustration />
                        <h4 className="text-sm font-semibold text-[#171717] mt-3">
                            No orders placed yet
                        </h4>
                        <p className="text-xs text-[#737373] mt-1">
                            This customer has not placed any registered orders.
                        </p>
                    </div>
                ) : (
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
                                        <th className="py-3.5 px-4">Items</th>
                                        <th className="py-3.5 px-4">Amount</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F5F5F5]">
                                    {orders.map((order, idx) => {
                                        const statusLower = (
                                            order.status || ""
                                        ).toLowerCase();
                                        const isDelivered =
                                            statusLower === "delivered";
                                        const isProcessing =
                                            statusLower === "processing" ||
                                            statusLower === "in_transit" ||
                                            statusLower === "shipped";
                                        const isCancelled =
                                            statusLower === "cancelled" ||
                                            statusLower === "failed";

                                        const firstItem = order.items?.[0];
                                        const remainingItemsCount =
                                            (order.items?.length || 1) - 1;

                                        return (
                                            <tr
                                                key={order.orderId || idx}
                                                className="hover:bg-[#FAF8F5] transition-colors"
                                            >
                                                <td className="py-3.5 px-4 text-sm text-[#171717]">
                                                    {String(idx + 1).padStart(
                                                        2,
                                                        "0",
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-sm font-medium text-[#171717]">
                                                    {order.orderNumber}
                                                </td>
                                                <td className="py-3.5 px-4 text-sm text-[#737373]">
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-xs text-[#171717]">
                                                    {firstItem ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Package className="size-3.5 text-[#888888] shrink-0" />
                                                            <span className="truncate max-w-[180px]">
                                                                {
                                                                    firstItem.productName
                                                                }
                                                            </span>
                                                            {remainingItemsCount >
                                                                0 && (
                                                                <span className="text-[11px] font-semibold text-[#888888]">
                                                                    +
                                                                    {
                                                                        remainingItemsCount
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#888888]">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-sm font-semibold text-[#171717]">
                                                    {formatCurrency(
                                                        order.total,
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold capitalize",
                                                            isDelivered &&
                                                                "bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]",
                                                            isProcessing &&
                                                                "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
                                                            isCancelled &&
                                                                "bg-[#FDF0F0] text-[#DC2626] border border-[#FCA5A5]",
                                                            !isDelivered &&
                                                                !isProcessing &&
                                                                !isCancelled &&
                                                                "bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]",
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "size-1.5 rounded-full",
                                                                isDelivered &&
                                                                    "bg-[#1E7E34]",
                                                                isProcessing &&
                                                                    "bg-[#D97706]",
                                                                isCancelled &&
                                                                    "bg-[#DC2626]",
                                                                !isDelivered &&
                                                                    !isProcessing &&
                                                                    !isCancelled &&
                                                                    "bg-[#4B5563]",
                                                            )}
                                                        />
                                                        {order.status.replace(
                                                            "_",
                                                            " ",
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/orders/${order.orderId}`,
                                                            )
                                                        }
                                                        className="text-sm font-medium text-[#171717] hover:text-[#D4AF37] transition-colors cursor-pointer underline"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
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
