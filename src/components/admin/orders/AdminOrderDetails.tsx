import React, { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { toast } from "@/components/ui/sonner";
import {
    getOrderByIdOrNumber,
    updateOrderStatus,
    subscribeOrders,
    type OrderRecord,
} from "@/lib/orders_data";
import { cn } from "@/lib/utils";

export const AdminOrderDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<OrderRecord | undefined>(() =>
        getOrderByIdOrNumber(id || "1"),
    );

    useEffect(() => {
        const update = () => {
            setOrder(getOrderByIdOrNumber(id || "1"));
        };
        const unsubscribe = subscribeOrders(update);
        update();
        return unsubscribe;
    }, [id]);

    if (!order) {
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

    // Progression state indices
    // 0: Order Placed
    // 1: Order Confirmed
    // 2: In Transit
    // 3: Delivered
    // -1: Failed
    const currentStepIndex = (() => {
        if (order.progress === "Failed") return -1;
        if (order.progress === "Delivered") return 3;
        if (order.progress === "InTransit") return 2;
        if (order.progress === "Order Confirmed") return 1;
        return 0; // Order Placed
    })();

    const handleAdvanceStage = () => {
        if (currentStepIndex === 0) {
            updateOrderStatus(order.id, "Order Confirmed");
            toast.success("Order marked as Confirmed");
        } else if (currentStepIndex === 1) {
            updateOrderStatus(order.id, "InTransit");
            toast.success("Order marked as In Transit");
        } else if (currentStepIndex === 2) {
            updateOrderStatus(order.id, "Delivered");
            toast.success("Order marked as Delivered");
        }
    };

    const handleMarkAsFailed = () => {
        updateOrderStatus(order.id, "Failed");
        toast.error("Order marked as Failed");
    };

    const isDelivered = order.progress === "Delivered" || order.category === "completed";
    const isFailed = order.progress === "Failed" || order.category === "failed";

    const steps = [
        {
            title: "Order Placed",
            timestamp: order.placedAt || "29 July 2026 at 10:42PM",
            status: "completed",
        },
        {
            title: "Order Confirmed",
            timestamp:
                isDelivered || isFailed || currentStepIndex >= 1
                    ? order.confirmedAt || "29 July 2026 at 10:42PM"
                    : "N/A",
            status:
                isDelivered || isFailed || currentStepIndex >= 1
                    ? "completed"
                    : "pending",
        },
        {
            title: "In Transit",
            timestamp:
                isDelivered || isFailed || currentStepIndex >= 2
                    ? order.inTransitAt || "29 July 2026 at 10:42PM"
                    : "N/A",
            status:
                isDelivered || isFailed || currentStepIndex >= 2
                    ? "completed"
                    : "pending",
        },
        {
            title: "Delivered",
            timestamp: isDelivered
                ? order.deliveredAt || "29 July 2026 at 11:12PM"
                : "N/A",
            status: isDelivered
                ? "completed"
                : isFailed
                ? "failed"
                : currentStepIndex >= 3
                ? "completed"
                : "pending",
        },
    ];

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
                    Placed on {order.placedAt || "29 July 2026 at 10:42 PM"}
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
                                        {order.customerName}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {order.customerPhone}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {order.customerEmail}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Delivery Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {order.deliveryAddress}
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
                                            <th className="py-3.5 px-6">Product Name</th>
                                            <th className="py-3.5 px-6">Brand</th>
                                            <th className="py-3.5 px-6">Price</th>
                                            <th className="py-3.5 px-6">Quantity</th>
                                            <th className="py-3.5 px-6 text-right">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#F0F0F0]">
                                        {order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-[#FCFBF8] transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3.5 min-w-48">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="size-11 rounded-lg object-contain bg-[#FAF7F2] border border-[#EEEEEE] p-1 shrink-0"
                                                        />
                                                        <span className="text-xs sm:text-sm font-semibold text-[#171717]">
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-xs sm:text-sm text-[#171717]">
                                                    {item.brand}
                                                </td>
                                                <td className="py-4 px-6 text-xs sm:text-sm text-[#171717] font-medium">
                                                    ₦{item.price.toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-xs sm:text-sm text-[#171717]">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 px-6 text-xs sm:text-sm text-[#171717] text-right font-medium">
                                                    ₦{item.subtotal.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
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
                                <span>Subtotal ({order.items.length} Items):</span>
                                <span className="text-[#171717] font-medium">
                                    ₦{order.subtotal.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm text-[#737373]">
                                <span>Delivery Fee:</span>
                                <span className="text-[#171717] font-medium">
                                    {order.deliveryFee === 0
                                        ? "₦0"
                                        : `₦${order.deliveryFee.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="border-t border-[#F0F0F0] pt-3.5 flex items-center justify-between text-sm sm:text-base font-bold text-[#171717]">
                                <span>Total:</span>
                                <span>₦{order.amount.toLocaleString()}</span>
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
                                            : isFailed
                                            ? "bg-[#EF4444]"
                                            : "bg-[#D4AF37]",
                                    )}
                                />
                                <span
                                    className={cn(
                                        isDelivered
                                            ? "text-[#10B981]"
                                            : isFailed
                                            ? "text-[#EF4444]"
                                            : "text-[#D4AF37]",
                                    )}
                                >
                                    {isDelivered
                                        ? "Delivered"
                                        : isFailed
                                        ? "Failed"
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
                                    <div key={idx} className="relative flex items-start gap-4">
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

                        {/* Action Buttons - only shown for ongoing orders */}
                        {!isDelivered && !isFailed && (
                            <div className="pt-4 space-y-2.5">
                                {currentStepIndex === 0 && (
                                    <button
                                        type="button"
                                        onClick={handleAdvanceStage}
                                        className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                                    >
                                        Mark as Confirmed
                                    </button>
                                )}

                                {currentStepIndex === 1 && (
                                    <button
                                        type="button"
                                        onClick={handleAdvanceStage}
                                        className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                                    >
                                        Mark as in Transit
                                    </button>
                                )}

                                {currentStepIndex === 2 && (
                                    <button
                                        type="button"
                                        onClick={handleAdvanceStage}
                                        className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                                    >
                                        Mark as Delivered
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={handleMarkAsFailed}
                                    className="w-full border border-[#EF4444] text-[#EF4444] hover:bg-red-50 font-semibold py-3 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                                >
                                    Mark as Failed
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
                            <span className="text-[#737373]">Payment Status:</span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#10B981]">
                                <span className="size-2 rounded-full bg-[#10B981]" />
                                Completed
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-[#737373]">Amount:</span>
                            <span className="font-bold text-[#171717] text-sm sm:text-base">
                                ₦{order.amount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetails;
