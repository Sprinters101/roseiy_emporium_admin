import React from "react";
import { ArrowLeft, Check, Package, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { cn } from "@/lib/utils";
import {
    useGetAdminOrder,
    useGetAdminOrderProgress,
} from "@/service/queries";
import { useUpdateAdminOrderStatus } from "@/service/mutations";

const formatOrderDateTime = (isoString?: string | null) => {
    if (!isoString) return "N/A";
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "long" });
        const year = d.getFullYear();
        const time = d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return `${day} ${month} ${year} at ${time}`;
    } catch {
        return isoString;
    }
};

export const AdminOrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Data fetching
    const {
        data: orderResponse,
        isLoading: isOrderLoading,
        isError,
    } = useGetAdminOrder(id || "");

    const { data: progressResponse } = useGetAdminOrderProgress(id || "");

    const updateStatusMutation = useUpdateAdminOrderStatus();

    const order = orderResponse?.data?.order;
    const progressData = progressResponse?.data?.progress;

    if (isOrderLoading) {
        return (
            <div className="space-y-6 animate-pulse pb-12">
                <div className="space-y-2">
                    <div className="h-6 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-64 bg-gray-100 rounded" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="h-44 bg-white rounded-2xl border border-[#EAEAEA]" />
                        <div className="h-64 bg-white rounded-2xl border border-[#EAEAEA]" />
                        <div className="h-36 bg-white rounded-2xl border border-[#EAEAEA]" />
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="h-72 bg-white rounded-2xl border border-[#EAEAEA]" />
                        <div className="h-32 bg-white rounded-2xl border border-[#EAEAEA]" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="py-20 text-center">
                <p className="text-base font-semibold text-[#171717]">
                    Order not found
                </p>
                <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="mt-4 px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm font-semibold cursor-pointer"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const currentStatus = (
        progressData?.currentStatus ||
        order.status ||
        ""
    ).toLowerCase();

    const isDelivered = currentStatus === "delivered";
    const isCancelled =
        currentStatus === "cancelled" ||
        currentStatus === "failed" ||
        Boolean(progressData?.cancelled);
    const isInTransit = currentStatus === "shipped";
    const isProcessing =
        currentStatus === "processing" ||
        (!isDelivered && !isCancelled && !isInTransit);

    // Dynamic steps from progress API or fallback
    const apiSteps = progressData?.steps || [];
    const stepProcessing = apiSteps.find(
        (s) => s.status.toLowerCase() === "processing",
    );
    const stepShipped = apiSteps.find(
        (s) => s.status.toLowerCase() === "shipped",
    );
    const stepDelivered = apiSteps.find(
        (s) => s.status.toLowerCase() === "delivered",
    );

    const steps = [
        {
            title: "Order Placed",
            timestamp: formatOrderDateTime(
                stepProcessing?.occurredAt || order.createdAt,
            ),
            status: "completed",
        },
        {
            title: "In Transit",
            timestamp: stepShipped?.occurredAt
                ? formatOrderDateTime(stepShipped.occurredAt)
                : "N/A",
            status: isDelivered
                ? "completed"
                : isCancelled
                  ? "failed"
                  : stepShipped?.completed || isInTransit
                    ? "completed"
                    : "pending",
        },
        {
            title: "Delivered",
            timestamp: stepDelivered?.occurredAt
                ? formatOrderDateTime(stepDelivered.occurredAt)
                : "N/A",
            status: isDelivered
                ? "completed"
                : isCancelled
                  ? "failed"
                  : "pending",
        },
    ];

    const customerName = order.customer
        ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
        : "Customer";

    const deliveryAddressStr = order.deliveryAddress
        ? `${order.deliveryAddress.addressLine1}${
              order.deliveryAddress.addressLine2
                  ? `, ${order.deliveryAddress.addressLine2}`
                  : ""
          }, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}${
              order.deliveryAddress.postalCode
                  ? ` - ${order.deliveryAddress.postalCode}`
                  : ""
          }, ${order.deliveryAddress.country}`
        : "No delivery address provided";

    const subtotalNum = Number(order.subtotal || 0);
    const deliveryFeeNum = Number(order.deliveryFee || 0);
    const totalAmountNum = Number(order.total || 0);

    const isUpdating = updateStatusMutation.isPending;

    const handleUpdateStatus = (
        newStatus: "processing" | "shipped" | "delivered" | "cancelled",
    ) => {
        if (!id) return;
        updateStatusMutation.mutate({
            orderId: id,
            payload: { status: newStatus },
        });
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Header with Back Button */}
            <div>
                <button
                    type="button"
                    onClick={() => navigate("/orders")}
                    className="p-1 rounded-md text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer mb-2 inline-flex items-center"
                    aria-label="Go back to orders"
                >
                    <ArrowLeft className="size-5" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Order #{order.orderNumber}
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    Placed on {formatOrderDateTime(order.createdAt)}
                </p>
            </div>

            {/* 2-Column Responsive Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Customer Info, Items Table, Summary */}
                <div className="lg:col-span-8 space-y-6">
                    {/* 1. Customer Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                1
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                Customer Information
                            </h2>
                        </div>

                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Customer Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {customerName}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {order.customer?.phoneNumber || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {order.customer?.email || "-"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Delivery Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {deliveryAddressStr}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Ordered Items */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                2
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                Ordered Items
                            </h2>
                        </div>

                        <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA] text-xs font-bold text-[#171717]">
                                            <th className="py-3.5 px-6">
                                                Product Name
                                            </th>
                                            <th className="py-3.5 px-6">Brand</th>
                                            <th className="py-3.5 px-6">Price</th>
                                            <th className="py-3.5 px-6">
                                                Quantity
                                            </th>
                                            <th className="py-3.5 px-6 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F0F0F0]">
                                        {order.items.map((item, idx) => {
                                            const itemImage =
                                                item.product?.images?.[0]
                                                    ?.imageUrl;
                                            const itemBrand =
                                                item.product?.brand?.name ||
                                                item.sellingUnitName ||
                                                "-";
                                            const unitPriceNum = Number(
                                                item.unitPrice || 0,
                                            );
                                            const lineTotalNum = Number(
                                                item.lineTotal || 0,
                                            );

                                            return (
                                                <tr
                                                    key={
                                                        item.orderItemId || idx
                                                    }
                                                    className="hover:bg-[#FCFBF8] transition-colors"
                                                >
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3.5 min-w-48">
                                                            {itemImage ? (
                                                                <img
                                                                    src={
                                                                        itemImage
                                                                    }
                                                                    alt={
                                                                        item.productName
                                                                    }
                                                                    className="size-11 rounded-lg object-contain bg-[#FAF7F2] border border-[#EEEEEE] p-1 shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="size-11 rounded-lg bg-[#FAF7F2] border border-[#EEEEEE] flex items-center justify-center text-[#888888] shrink-0">
                                                                    <Package className="size-5" />
                                                                </div>
                                                            )}
                                                            <span className="text-xs sm:text-sm font-semibold text-[#171717]">
                                                                {item.productName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-xs sm:text-sm text-[#171717]">
                                                        {itemBrand}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs sm:text-sm text-[#171717] font-medium">
                                                        ₦
                                                        {unitPriceNum.toLocaleString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs sm:text-sm text-[#171717]">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="py-4 px-6 text-xs sm:text-sm text-[#171717] text-right font-medium">
                                                        ₦
                                                        {lineTotalNum.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* 3. Order Summary */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5">
                            <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                3
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                Order Summary
                            </h2>
                        </div>

                        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between text-xs sm:text-sm text-[#737373]">
                                <span>
                                    Subtotal ({order.items.length} Items):
                                </span>
                                <span className="text-[#171717] font-medium">
                                    ₦{subtotalNum.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-[#737373]">
                                <span>Delivery Fee:</span>
                                <span className="text-[#171717] font-medium">
                                    {deliveryFeeNum === 0
                                        ? "₦0"
                                        : `₦${deliveryFeeNum.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="border-t border-[#F0F0F0] pt-3.5 flex items-center justify-between text-sm sm:text-base font-bold text-[#171717]">
                                <span>Total:</span>
                                <span>₦{totalAmountNum.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Progress Stepper & Payment Summary */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                    {/* Order Progress Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-[#171717]">
                                Order Progress
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                <span
                                    className={cn(
                                        "size-2 rounded-full",
                                        isDelivered
                                            ? "bg-[#10B981]"
                                            : isCancelled
                                              ? "bg-[#EF4444]"
                                              : "bg-[#D4AF37]",
                                    )}
                                />
                                <span
                                    className={cn(
                                        isDelivered
                                            ? "text-[#10B981]"
                                            : isCancelled
                                              ? "text-[#EF4444]"
                                              : "text-[#D4AF37]",
                                    )}
                                >
                                    {isDelivered
                                        ? "Delivered"
                                        : isCancelled
                                          ? "Failed"
                                          : isInTransit
                                            ? "In Transit"
                                            : "Ongoing"}
                                </span>
                            </div>
                        </div>

                        {/* Stepper Timeline */}
                        <div className="space-y-6 pt-1">
                            {steps.map((step, idx) => {
                                const isLast = idx === steps.length - 1;
                                const nextStepCompleted =
                                    idx + 1 < steps.length &&
                                    steps[idx + 1].status === "completed";

                                return (
                                    <div
                                        key={idx}
                                        className="relative flex items-start gap-4"
                                    >
                                        {/* Step Icon */}
                                        <div className="relative z-10 shrink-0">
                                            {step.status === "completed" ? (
                                                <div className="size-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-2xs">
                                                    <Check
                                                        className="size-3"
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            ) : step.status === "failed" ? (
                                                <div className="size-5 rounded-full bg-[#EF4444] text-white flex items-center justify-center shadow-2xs">
                                                    <Check
                                                        className="size-3"
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="size-5 rounded-full bg-[#F0F0F0] text-[#888888] flex items-center justify-center">
                                                    <Check
                                                        className="size-3 text-[#A0A0A0]"
                                                        strokeWidth={2.5}
                                                    />
                                                </div>
                                            )}

                                            {/* Connector line below circle */}
                                            {!isLast && (
                                                <div
                                                    className={cn(
                                                        "absolute left-1/2 -translate-x-1/2 top-5.5 w-0.5 h-10",
                                                        nextStepCompleted
                                                            ? "bg-[#10B981]"
                                                            : "bg-[#E5E5E5]",
                                                    )}
                                                />
                                            )}
                                        </div>

                                        {/* Step Content */}
                                        <div className="min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-[#171717]">
                                                {step.title}
                                            </h4>
                                            <p className="text-[11px] text-[#888888] mt-0.5">
                                                {step.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons - only shown for non-delivered and non-cancelled orders */}
                        {!isDelivered && !isCancelled && (
                            <div className="pt-4 space-y-2.5">
                                {isProcessing && (
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() =>
                                            handleUpdateStatus("shipped")
                                        }
                                        className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : null}
                                        <span>Mark as in Transit</span>
                                    </button>
                                )}

                                {isInTransit && (
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() =>
                                            handleUpdateStatus("delivered")
                                        }
                                        className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : null}
                                        <span>Mark as Delivered</span>
                                    </button>
                                )}

                                <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() =>
                                        handleUpdateStatus("cancelled")
                                    }
                                    className="w-full border border-[#EF4444] text-[#EF4444] hover:bg-red-50 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : null}
                                    <span>Mark as Failed</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Summary Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-base font-bold text-[#171717]">
                            Payment Summary
                        </h3>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-[#737373]">
                                Payment Status:
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#10B981]">
                                <span className="size-2 rounded-full bg-[#10B981]" />
                                {order.paidAt ? "Completed" : "Paid"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-[#737373]">Amount:</span>
                            <span className="font-bold text-[#171717] text-sm sm:text-base">
                                ₦{totalAmountNum.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
