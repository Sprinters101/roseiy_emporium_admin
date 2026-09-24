import React, { useEffect, useState } from "react";
import {
    X,
    CreditCard,
    Check,
    Copy,
    ExternalLink,
    Clock,
    Calendar,
    ArrowRight,
    AlertCircle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    User,
    ShoppingBag,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetAdminPaymentDetail } from "@/service/queries";
import type { PaymentTransactionItem, PaymentStatus } from "@/service/types";

interface PaymentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: string | null;
    initialPayment?: PaymentTransactionItem | null;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
    isOpen,
    onClose,
    paymentId,
    initialPayment,
}) => {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Fetch full single payment transaction if ID provided
    const {
        data: paymentResponse,
        isLoading,
        isError,
    } = useGetAdminPaymentDetail(paymentId || undefined);

    const payment: PaymentTransactionItem | null =
        paymentResponse?.data?.payment || initialPayment || null;

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    const formatCurrency = (amount?: string | number, currency = "NGN") => {
        const num = Number(amount || 0);
        if (currency.toUpperCase() === "NGN") {
            return `₦${num.toLocaleString("en-NG", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
        }
        return `${currency} ${num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const renderStatusBadge = (status?: PaymentStatus) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]">
                        <CheckCircle2 className="size-3.5" />
                        Success
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        <Clock className="size-3.5" />
                        Pending
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                        <XCircle className="size-3.5" />
                        Failed
                    </span>
                );
            case "requires_review":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                        <HelpCircle className="size-3.5" />
                        Requires Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                        <AlertCircle className="size-3.5" />
                        {status || "Unknown"}
                    </span>
                );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E5E5] overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA]">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#B08920]">
                            <CreditCard className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-[#171717]">
                                Payment Transaction
                            </h2>
                            <p className="text-xs text-[#737373]">
                                Full gateway audit details & linked order
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading && !payment ? (
                        <div className="space-y-6">
                            {/* Top Hero Highlight Skeleton */}
                            <div className="bg-[#FAF7F2] border border-[#E9DFD0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-20 bg-gray-200" />
                                    <Skeleton className="h-8 w-44 bg-gray-200" />
                                    <Skeleton className="h-3 w-36 bg-gray-200" />
                                </div>
                                <div className="space-y-2 sm:flex sm:flex-col sm:items-end">
                                    <Skeleton className="h-3 w-24 bg-gray-200" />
                                    <Skeleton className="h-6 w-28 rounded-full bg-gray-200" />
                                    <Skeleton className="h-3 w-20 bg-gray-200" />
                                </div>
                            </div>

                            {/* Identifiers Grid Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-3.5 w-48 bg-gray-200" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF8F5]/60 border border-[#EAEAEA] rounded-xl p-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <Skeleton className="h-3 w-24 bg-gray-200" />
                                            <Skeleton className="h-4 w-36 bg-gray-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Card Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-3.5 w-32 bg-gray-200" />
                                <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex justify-between items-center">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-gray-200" />
                                        <Skeleton className="h-3 w-40 bg-gray-200" />
                                    </div>
                                    <Skeleton className="h-8 w-28 rounded-lg bg-gray-200" />
                                </div>
                            </div>

                            {/* Timestamps Skeleton */}
                            <div className="space-y-3">
                                <Skeleton className="h-3.5 w-32 bg-gray-200" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5]/60 border border-[#EAEAEA] rounded-xl p-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <Skeleton className="h-3 w-20 bg-gray-200" />
                                            <Skeleton className="h-4 w-28 bg-gray-200" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : isError && !payment ? (
                        <div className="py-12 text-center">
                            <AlertCircle className="size-10 text-red-500 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-[#171717]">
                                Unable to load transaction
                            </p>
                            <p className="text-xs text-[#737373] mt-1">
                                The requested payment could not be retrieved.
                            </p>
                        </div>
                    ) : payment ? (
                        <>
                            {/* Top Hero Highlight */}
                            <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6] border border-[#E9DFD0] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-xs font-medium uppercase tracking-wider text-[#8A7032]">
                                        Amount Paid
                                    </span>
                                    <div className="text-2xl sm:text-3xl font-bold text-[#171717] mt-0.5">
                                        {formatCurrency(
                                            payment.amount,
                                            payment.currency,
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-[#737373]">
                                            Reference:
                                        </span>
                                        <span className="font-mono text-xs font-semibold text-[#171717]">
                                            {payment.reference}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                copyToClipboard(
                                                    payment.reference,
                                                    "ref",
                                                )
                                            }
                                            className="text-[#737373] hover:text-[#171717] transition-colors p-1"
                                            title="Copy Reference"
                                        >
                                            {copiedKey === "ref" ? (
                                                <Check className="size-3 text-green-600" />
                                            ) : (
                                                <Copy className="size-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:items-end gap-1.5">
                                    <div className="text-xs font-medium text-[#737373]">
                                        Payment Status
                                    </div>
                                    {renderStatusBadge(payment.status)}
                                    <div className="text-[11px] text-[#737373] mt-0.5">
                                        Provider Status:{" "}
                                        <span className="font-medium text-[#171717] capitalize">
                                            {payment.providerStatus || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 1: Customer & Checkout Info */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] mb-3 flex items-center gap-1.5">
                                    <User className="size-3.5" /> Customer & Gateway
                                    Identifiers
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF8F5]/60 border border-[#EAEAEA] rounded-xl p-4 text-xs">
                                    <div>
                                        <span className="text-[#888888] block mb-0.5">
                                            Customer Email
                                        </span>
                                        <span className="font-medium text-[#171717] break-all">
                                            {payment.email || "—"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[#888888] block mb-0.5">
                                            Transaction ID
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono text-[#171717] truncate max-w-[180px]">
                                                {payment.paymentTransactionId}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        payment.paymentTransactionId,
                                                        "txId",
                                                    )
                                                }
                                                className="text-[#888888] hover:text-[#171717] p-0.5"
                                                title="Copy Transaction ID"
                                            >
                                                {copiedKey === "txId" ? (
                                                    <Check className="size-3 text-green-600" />
                                                ) : (
                                                    <Copy className="size-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {payment.customerId && (
                                        <div>
                                            <span className="text-[#888888] block mb-0.5">
                                                Customer ID
                                            </span>
                                            <span className="font-mono text-[#171717] truncate block max-w-[200px]">
                                                {payment.customerId}
                                            </span>
                                        </div>
                                    )}

                                    {payment.cartId && (
                                        <div>
                                            <span className="text-[#888888] block mb-0.5">
                                                Cart ID
                                            </span>
                                            <span className="font-mono text-[#171717] truncate block max-w-[200px]">
                                                {payment.cartId}
                                            </span>
                                        </div>
                                    )}

                                    {payment.accessCode && (
                                        <div>
                                            <span className="text-[#888888] block mb-0.5">
                                                Paystack Access Code
                                            </span>
                                            <span className="font-mono text-[#171717]">
                                                {payment.accessCode}
                                            </span>
                                        </div>
                                    )}

                                    {payment.authorizationUrl && (
                                        <div>
                                            <span className="text-[#888888] block mb-0.5">
                                                Authorization URL
                                            </span>
                                            <a
                                                href={payment.authorizationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline font-medium"
                                            >
                                                <span>Paystack Checkout</span>
                                                <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Linked Order */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] mb-3 flex items-center gap-1.5">
                                    <ShoppingBag className="size-3.5" /> Associated
                                    Order
                                </h3>
                                {payment.order || payment.orderId ? (
                                    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold text-sm text-[#171717]">
                                                    {payment.order
                                                        ?.orderNumber ||
                                                        "Order Assigned"}
                                                </span>
                                                {payment.order?.status && (
                                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F5F5] text-[#171717] border border-[#E5E5E5] capitalize">
                                                        {payment.order.status}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-[#737373]">
                                                Order ID:{" "}
                                                <span className="font-mono">
                                                    {payment.order?.orderId ||
                                                        payment.orderId}
                                                </span>
                                            </p>
                                        </div>
                                        <Link
                                            to={`/orders/${payment.order?.orderId || payment.orderId}`}
                                            onClick={onClose}
                                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#171717] text-white hover:bg-[#333333] transition-colors shrink-0"
                                        >
                                            <span>View Order Details</span>
                                            <ArrowRight className="size-3.5" />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl p-4 text-xs text-[#737373] text-center">
                                        No order has been finalized or associated with this payment transaction yet.
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Timestamps Audit */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373] mb-3 flex items-center gap-1.5">
                                    <Calendar className="size-3.5" /> Audit Timestamps
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5]/60 border border-[#EAEAEA] rounded-xl p-4 text-xs">
                                    <div>
                                        <span className="text-[#888888] block mb-0.5">
                                            Created At
                                        </span>
                                        <span className="font-medium text-[#171717]">
                                            {formatDateTime(payment.createdAt)}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[#888888] block mb-0.5">
                                            Paid At
                                        </span>
                                        <span
                                            className={cn(
                                                "font-medium",
                                                payment.paidAt
                                                    ? "text-emerald-700"
                                                    : "text-[#888888]",
                                            )}
                                        >
                                            {formatDateTime(payment.paidAt)}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[#888888] block mb-0.5">
                                            Last Updated
                                        </span>
                                        <span className="font-medium text-[#171717]">
                                            {formatDateTime(
                                                payment.updatedAt ||
                                                    payment.createdAt,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                    <span className="text-xs text-[#737373]">
                        {payment?.reference
                            ? `Ref: ${payment.reference}`
                            : "Roseiy Payments Audit"}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-[#171717] bg-white border border-[#E5E5E5] hover:bg-[#F5F5F5] rounded-lg transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
