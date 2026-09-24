import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    RefreshCw,
    X,
    Copy,
    Check,
    Eye,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    HelpCircle,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomTable, type Column } from "@/components/common/CustomTable";
import { InteractiveDateRangeDropdown } from "@/components/common/InteractiveDateRangeDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useGetAdminPayments } from "@/service/queries";
import type {
    PaymentTransactionItem,
    GetPaymentsParams,
    PaymentStatus,
} from "@/service/types";
import { PaymentDetailsModal } from "./PaymentDetailsModal";

// Document Format Mini Icon for CSV Export
const CsvIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#EAF7EE" />
        <path
            d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
            fill="#34A853"
        />
        <path d="M11.5 4v3.5H15" fill="#A8DAB5" />
        <rect
            x="6.5"
            y="10"
            width="7"
            height="4.5"
            rx="0.5"
            fill="white"
            stroke="#34A853"
            strokeWidth="0.8"
        />
        <text
            x="10"
            y="13.2"
            fill="#1E7E34"
            fontSize="3"
            fontWeight="bold"
            fontFamily="sans-serif"
            textAnchor="middle"
        >
            CSV
        </text>
    </svg>
);

const STATUS_TABS: Array<{
    label: string;
    value: PaymentStatus | "all";
}> = [
    { label: "All Payments", value: "all" },
    { label: "Success", value: "success" },
    { label: "Pending", value: "pending" },
    { label: "Failed", value: "failed" },
    { label: "Requires Review", value: "requires_review" },
];

const formatApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const AdminPayments: React.FC = () => {
    const { role } = useAuth();

    // Query state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">(
        "all",
    );
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);

    // Details Modal State
    const [selectedPayment, setSelectedPayment] =
        useState<PaymentTransactionItem | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Format dates for API
    const dateFrom = useMemo(
        () => (fromDate ? formatApiDate(fromDate) : undefined),
        [fromDate],
    );
    const dateTo = useMemo(
        () => (toDate ? formatApiDate(toDate) : undefined),
        [toDate],
    );

    // Query parameters
    const queryParams: GetPaymentsParams = useMemo(() => {
        const p: GetPaymentsParams = {
            page,
            limit: pageSize,
        };
        if (debouncedSearch.trim()) {
            p.search = debouncedSearch.trim();
        }
        if (statusFilter !== "all") {
            p.status = statusFilter;
        }
        if (dateFrom) {
            p.dateFrom = dateFrom;
        }
        if (dateTo) {
            p.dateTo = dateTo;
        }
        return p;
    }, [page, pageSize, debouncedSearch, statusFilter, dateFrom, dateTo]);

    // Data fetching
    const {
        data: paymentsResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetAdminPayments(queryParams);

    const paymentsList: PaymentTransactionItem[] =
        paymentsResponse?.data?.payments || [];
    const pagination = paymentsResponse?.data?.pagination;
    const totalPaymentsCount = pagination?.total ?? paymentsList.length;
    const totalPages =
        pagination?.totalPages ??
        Math.max(1, Math.ceil(totalPaymentsCount / pageSize));
    const currentPage = pagination?.page ?? page;

    // Computed page range items
    const startItem =
        totalPaymentsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalPaymentsCount);

    // Page numbers list for pagination buttons
    const pageNumbers = useMemo(() => {
        const pages: number[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, currentPage + 2);
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    }, [totalPages, currentPage]);

    // Copy helper
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Formatters
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
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    const renderStatusBadge = (status: PaymentStatus) => {
        switch (status) {
            case "success":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]">
                        <CheckCircle2 className="size-3" />
                        Success
                    </span>
                );
            case "pending":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                        <Clock className="size-3" />
                        Pending
                    </span>
                );
            case "failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                        <XCircle className="size-3" />
                        Failed
                    </span>
                );
            case "requires_review":
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]">
                        <HelpCircle className="size-3" />
                        Requires Review
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {status}
                    </span>
                );
        }
    };

    // CSV Export
    const handleExportCSV = () => {
        if (paymentsList.length === 0) {
            toast.error("No payment transactions to export");
            return;
        }

        const headers = [
            "Reference",
            "Customer Email",
            "Amount",
            "Currency",
            "Payment Status",
            "Provider Status",
            "Order Number",
            "Created At",
            "Paid At",
        ];

        const rows = paymentsList.map((p) => [
            `"${p.reference}"`,
            `"${p.email || ""}"`,
            Number(p.amount || 0),
            `"${p.currency}"`,
            `"${p.status}"`,
            `"${p.providerStatus || ""}"`,
            `"${p.order?.orderNumber || ""}"`,
            `"${p.createdAt}"`,
            `"${p.paidAt || ""}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8," +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `payments_export_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${paymentsList.length} transactions to CSV`);
    };

    // Table Columns
    const columns: Column<PaymentTransactionItem>[] = [
        {
            key: "sn",
            header: "S/N",
            className: "w-14 text-sm text-[#737373]",
            render: (_, __, index) => (
                <span className="font-mono text-xs text-[#888888]">
                    {String((currentPage - 1) * pageSize + index + 1).padStart(
                        2,
                        "0",
                    )}
                </span>
            ),
        },
        {
            key: "reference",
            header: "Reference",
            className: "text-sm text-[#171717] min-w-[180px]",
            render: (_, item) => (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedPayment(item);
                            setIsDetailsOpen(true);
                        }}
                        className="font-mono font-medium hover:text-[#D4AF37] transition-colors text-left cursor-pointer truncate max-w-[150px]"
                        title={item.reference}
                    >
                        {item.reference}
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(
                                item.reference,
                                item.paymentTransactionId,
                            );
                        }}
                        className="text-[#888888] hover:text-[#171717] p-1 transition-colors cursor-pointer"
                        title="Copy Reference"
                    >
                        {copiedKey === item.paymentTransactionId ? (
                            <Check className="size-3 text-green-600" />
                        ) : (
                            <Copy className="size-3" />
                        )}
                    </button>
                </div>
            ),
        },
        {
            key: "email",
            header: "Customer Email",
            className: "text-sm text-[#171717] min-w-[200px]",
            render: (_, item) => (
                <div className="flex flex-col">
                    <span
                        className="font-normal text-[#171717] truncate max-w-[220px]"
                        title={item.email}
                    >
                        {item.email || "—"}
                    </span>
                    {item.customerId && (
                        <span className="text-[11px] text-[#888888] font-mono truncate max-w-[160px]">
                            ID: {item.customerId}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: "amount",
            header: "Amount",
            className: "text-sm font-semibold text-[#171717] min-w-[120px]",
            render: (_, item) => (
                <span>{formatCurrency(item.amount, item.currency)}</span>
            ),
        },
        {
            key: "status",
            header: "Payment Status",
            className: "text-xs min-w-[130px]",
            render: (_, item) => renderStatusBadge(item.status),
        },
        {
            key: "providerStatus",
            header: "Provider Status",
            className: "text-xs text-[#737373] min-w-[120px]",
            render: (_, item) => (
                <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#FAF7F2] text-[#737373] border border-[#EAEAEA] capitalize">
                    {item.providerStatus || "N/A"}
                </span>
            ),
        },
        {
            key: "order",
            header: "Order Number",
            className: "text-sm min-w-[140px]",
            render: (_, item) => {
                const orderId = item.order?.orderId || item.orderId;
                const orderNumber = item.order?.orderNumber;

                if (orderNumber && orderId) {
                    return (
                        <Link
                            to={`/orders/${orderId}`}
                            className="inline-flex items-center gap-1 font-mono font-medium text-[#D4AF37] hover:underline"
                            title="View Order"
                        >
                            <span>{orderNumber}</span>
                            <ExternalLink className="size-3" />
                        </Link>
                    );
                }
                return <span className="text-[#888888] text-xs">—</span>;
            },
        },
        {
            key: "createdAt",
            header: "Created",
            className: "text-xs text-[#737373] min-w-[140px]",
            render: (_, item) => <span>{formatDateTime(item.createdAt)}</span>,
        },
        {
            key: "paidAt",
            header: "Paid At",
            className: "text-xs min-w-[140px]",
            render: (_, item) => (
                <span
                    className={cn(
                        item.paidAt
                            ? "text-emerald-700 font-medium"
                            : "text-[#888888]",
                    )}
                >
                    {formatDateTime(item.paidAt)}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-12 text-right",
            render: (_, item) => (
                <button
                    type="button"
                    onClick={() => {
                        setSelectedPayment(item);
                        setIsDetailsOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                    title="View Transaction Details"
                >
                    <Eye className="size-4" />
                </button>
            ),
        },
    ];

    // Check for product_manager role access restriction
    if (role === "product_manager") {
        return (
            <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-[#EAEAEA] rounded-2xl text-center space-y-4 shadow-xs">
                <div className="size-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                    <ShieldAlert className="size-6" />
                </div>
                <h2 className="text-lg font-bold text-[#171717]">
                    Access Restricted
                </h2>
                <p className="text-sm text-[#737373]">
                    The Payments module is restricted to Super Admins, Store Managers, and Order Managers. Product Managers do not have permissions to audit payment transactions.
                </p>
                <Link
                    to="/products"
                    className="inline-flex px-4 py-2 bg-[#171717] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-colors"
                >
                    Return to Products
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
                        Payments & Transactions
                    </h1>
                    <p className="text-sm text-[#737373] mt-0.5">
                        Audit Paystack checkout references, verification statuses, customer charges, and revenue.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#171717] bg-white border border-[#E5E5E5] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                        <RefreshCw
                            className={cn(
                                "size-4 text-[#737373]",
                                isFetching && "animate-spin text-[#D4AF37]",
                            )}
                        />
                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#171717] bg-white border border-[#E5E5E5] hover:bg-[#FAF7F2] rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                        <CsvIcon />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {STATUS_TABS.map((tab) => {
                    const isActive = statusFilter === tab.value;
                    return (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => {
                                setStatusFilter(tab.value);
                                setPage(1);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 cursor-pointer",
                                isActive
                                    ? "bg-[#171717] text-white shadow-xs"
                                    : "bg-white border border-[#E5E5E5] text-[#737373] hover:bg-[#FAF7F2] hover:text-[#171717]",
                            )}
                        >
                            <span>{tab.label}</span>
                            {tab.value === "all" && (
                                isLoading ? (
                                    <Skeleton className="h-4 w-6 rounded-full inline-block bg-neutral-200" />
                                ) : totalPaymentsCount > 0 ? (
                                    <span
                                        className={cn(
                                            "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-[#F0EBE0] text-[#171717]",
                                        )}
                                    >
                                        {totalPaymentsCount}
                                    </span>
                                ) : null
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Controls Bar: Search & Interactive Calendar Dropdown */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by reference or customer email..."
                        className="w-full pl-9 pr-9 py-2 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg text-xs sm:text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:border-[#D4AF37] focus:bg-white transition-colors"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setDebouncedSearch("");
                                setPage(1);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] cursor-pointer"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                {/* Calendar Date Range Dropdown */}
                <div className="w-full sm:w-auto min-w-44">
                    <InteractiveDateRangeDropdown
                        fromDate={fromDate}
                        toDate={toDate}
                        onRangeChange={(from, to) => {
                            setFromDate(from);
                            setToDate(to);
                            setPage(1);
                        }}
                        onReset={() => {
                            setFromDate(null);
                            setToDate(null);
                            setPage(1);
                        }}
                        placeholder="Date Range"
                    />
                </div>
            </div>

            {/* Error Banner */}
            {isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-lg flex items-center justify-between">
                    <span>
                        Failed to fetch payment transactions:{" "}
                        {(error as any)?.response?.data?.message ||
                            "An unexpected error occurred."}
                    </span>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="underline font-semibold hover:text-red-800"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Main Table Area: Skeleton OR Table + Server Pagination */}
            {isLoading ? (
                /* Skeleton Loading State matching AdminOrders */
                <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs animate-pulse">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-14">
                                        S/N
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Reference
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Customer Email
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Amount
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Payment Status
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Provider Status
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Order Number
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Created
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Paid At
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {[...Array(6)].map((_, i) => (
                                    <tr key={i} className="h-16">
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-6 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-32 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
                                            <div className="h-3 w-20 bg-gray-100 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-20 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-5 w-24 bg-gray-200 rounded-full" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-5 w-20 bg-gray-200 rounded-md" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-24 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-28 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-28 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6 text-right">
                                            <div className="h-4 w-6 bg-gray-200 rounded ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-xs flex flex-col">
                    <CustomTable
                        data={paymentsList}
                        columns={columns}
                        keyExtractor={(item) => item.paymentTransactionId}
                        isLoading={false}
                        pagination={false}
                        emptyMessage="No payment transactions found matching the selected filters."
                        onRowClick={(item) => {
                            setSelectedPayment(item);
                            setIsDetailsOpen(true);
                        }}
                        rowClassName="cursor-pointer hover:bg-[#FAF8F5]/80 transition-colors"
                    />

                    {/* Bottom Server Pagination Controls matching AdminOrders */}
                    {paymentsList.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-[#E5E5E5] bg-[#FAFAFA] select-none">
                            <div className="flex items-center gap-4">
                                <span className="text-xs sm:text-sm text-[#737373] font-medium">
                                    Showing{" "}
                                    <span className="font-semibold text-[#171717]">
                                        {startItem} - {endItem}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-semibold text-[#171717]">
                                        {totalPaymentsCount}
                                    </span>{" "}
                                    Transactions
                                </span>

                                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#737373]">
                                    <span>Rows:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setPage(1);
                                        }}
                                        className="px-2 py-1 bg-white border border-[#E5E5E5] rounded-md text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pagination buttons */}
                            <div className="flex items-center gap-1.5 self-center sm:self-auto">
                                {/* Previous button */}
                                <button
                                    type="button"
                                    disabled={currentPage <= 1 || isFetching}
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    className="size-8 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Previous Page"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>

                                {/* Page numbers */}
                                {pageNumbers.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPage(p)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === p
                                                ? "bg-[#D4AF37] text-white shadow-xs"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}

                                {totalPages > 7 &&
                                    currentPage < totalPages - 2 && (
                                        <>
                                            <span className="text-xs text-[#737373] px-1 select-none">
                                                ...
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setPage(totalPages)}
                                                className={cn(
                                                    "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                                    currentPage === totalPages
                                                        ? "bg-[#D4AF37] text-white shadow-xs"
                                                        : "hover:bg-[#FAF7F2] text-[#737373]",
                                                )}
                                            >
                                                {totalPages}
                                            </button>
                                        </>
                                    )}

                                {/* Next button */}
                                <button
                                    type="button"
                                    disabled={
                                        currentPage >= totalPages || isFetching
                                    }
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    className="size-8 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    aria-label="Next Page"
                                    title="Next Page"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Details Modal */}
            <PaymentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedPayment(null);
                }}
                paymentId={selectedPayment?.paymentTransactionId || null}
                initialPayment={selectedPayment}
            />
        </div>
    );
};
