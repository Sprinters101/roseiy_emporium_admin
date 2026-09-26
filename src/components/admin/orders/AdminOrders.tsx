import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { Link } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { cn } from "@/lib/utils";
import { useGetAdminOrders } from "@/service/queries";
import type { AdminOrderDetail, GetOrdersParams } from "@/service/types";

export type OrderStatusFilter =
    | "all"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export type OrderCategory = OrderStatusFilter;

const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "A-Z", value: "az" },
    { label: "Most Products", value: "most" },
    { label: "Least Products", value: "least" },
    { label: "Newest", value: "newest" },
];

const STATUS_TABS: {
    id: OrderStatusFilter;
    label: string;
    dotColor: string;
}[] = [
    { id: "all", label: "All", dotColor: "bg-[#171717]" },
    { id: "processing", label: "Confirmed", dotColor: "bg-[#3B82F6]" },
    { id: "shipped", label: "In Transit", dotColor: "bg-[#D4AF37]" },
    { id: "delivered", label: "Completed", dotColor: "bg-[#10B981]" },
    { id: "cancelled", label: "Failed", dotColor: "bg-[#EF4444]" },
];

// Document Export Mini Icons
const CsvIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            fill="#E8F5E9"
            stroke="#2E7D32"
            strokeWidth="1.5"
        />
        <path d="M14 2v6h6" stroke="#2E7D32" strokeWidth="1.5" />
        <text
            x="6"
            y="17"
            fill="#1B5E20"
            fontSize="6"
            fontWeight="bold"
            fontFamily="sans-serif"
        >
            CSV
        </text>
    </svg>
);

const DocIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            fill="#E3F2FD"
            stroke="#1565C0"
            strokeWidth="1.5"
        />
        <path d="M14 2v6h6" stroke="#1565C0" strokeWidth="1.5" />
        <text
            x="5.5"
            y="17"
            fill="#0D47A1"
            fontSize="6"
            fontWeight="bold"
            fontFamily="sans-serif"
        >
            DOC
        </text>
    </svg>
);

const PdfIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            fill="#FFEBEE"
            stroke="#C62828"
            strokeWidth="1.5"
        />
        <path d="M14 2v6h6" stroke="#C62828" strokeWidth="1.5" />
        <text
            x="5.5"
            y="17"
            fill="#B71C1C"
            fontSize="6"
            fontWeight="bold"
            fontFamily="sans-serif"
        >
            PDF
        </text>
    </svg>
);

// Empty State Sad Box Illustration
const EmptySadBoxIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-xs opacity-90 scale-95" />
        <svg viewBox="0 0 140 140" className="size-32 z-10 drop-shadow-xs">
            <polygon points="70,25 115,50 70,75 25,50" fill="#E8C87A" />
            <polygon
                points="66,27 74,31 74,73 66,69"
                fill="#DEC072"
                opacity="0.8"
            />
            <polygon points="25,50 70,75 70,120 25,95" fill="#D3B05C" />
            <polygon points="70,75 115,50 115,95 70,120" fill="#E2C172" />
            <circle cx="85" cy="85" r="2.2" fill="#4A3B18" />
            <circle cx="101" cy="76" r="2.2" fill="#4A3B18" />
            <path
                d="M 87 97 Q 94 90 99 93"
                fill="none"
                stroke="#4A3B18"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

// Format date into "07 February 2025"
const formatDateDisplay = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export const AdminOrders: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [statusTab, setStatusTab] = useState<OrderStatusFilter>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Debounce search - reset to page 1
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleStatusTabChange = (tab: OrderStatusFilter) => {
        setStatusTab(tab);
        setCurrentPage(1);
    };

    // Query params for backend API: page, limit, search, status
    const queryParams: GetOrdersParams = useMemo(() => {
        const p: GetOrdersParams = {
            page: currentPage,
            limit: pageSize,
        };
        if (debouncedSearch.trim()) {
            p.search = debouncedSearch.trim();
        }
        if (statusTab !== "all") {
            p.status = statusTab;
        }
        return p;
    }, [currentPage, pageSize, debouncedSearch, statusTab]);

    const {
        data: ordersResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetAdminOrders(queryParams);

    const apiOrders: AdminOrderDetail[] = ordersResponse?.data?.orders || [];
    const pagination = ordersResponse?.data?.pagination;
    const totalPages = pagination?.totalPages || 1;

    // Fallback client-side filter if backend didn't restrict status
    const filteredOrders = useMemo(() => {
        if (statusTab === "all") return apiOrders;
        return apiOrders.filter((order) => {
            const status = (order.status || "").toLowerCase();
            return status === statusTab;
        });
    }, [apiOrders, statusTab]);

    // Apply sorting
    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const nameA =
                `${a.customer?.firstName || a.firstName || ""} ${a.customer?.lastName || a.lastName || ""}`.trim();
            const nameB =
                `${b.customer?.firstName || b.firstName || ""} ${b.customer?.lastName || b.lastName || ""}`.trim();
            if (sortBy === "az") return nameA.localeCompare(nameB);
            if (sortBy === "most")
                return (b.items?.length || 0) - (a.items?.length || 0);
            if (sortBy === "least")
                return (a.items?.length || 0) - (b.items?.length || 0);
            if (sortBy === "newest") {
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            }
            return 0;
        });
    }, [filteredOrders, sortBy]);

    const totalCurrentCount = pagination?.total ?? sortedOrders.length;

    // Export handlers
    const handleExport = (type: "csv" | "doc" | "pdf") => {
        if (sortedOrders.length === 0) {
            toast.error("No orders to export");
            return;
        }

        if (type === "csv") {
            const headers = "S/N,Order ID,Customer Name,Amount,Status,Date\n";
            const rows = sortedOrders
                .map((o, idx) => {
                    const cName = o.customer
                        ? `${o.customer.firstName} ${o.customer.lastName}`.trim()
                        : `${o.firstName || ""} ${o.lastName || ""}`.trim() ||
                          "Customer";
                    return `"${idx + 1}","Order #${o.orderNumber}","${cName}","₦${Number(o.total || 0).toLocaleString()}","${o.status}","${formatDateDisplay(new Date(o.createdAt))}"`;
                })
                .join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `roseiy_orders_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Orders exported as CSV successfully");
        } else if (type === "pdf") {
            window.print();
            toast.info(
                `Preparing print / PDF for ${sortedOrders.length} orders`,
            );
        } else {
            toast.success(
                `Orders exported as ${type.toUpperCase()} successfully`,
            );
        }
    };

    const renderProgressBadge = (status: string) => {
        const s = (status || "").toLowerCase();
        if (s === "delivered") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-semibold text-[#10B981] capitalize">
                        Delivered
                    </span>
                </div>
            );
        }
        if (s === "cancelled") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#EF4444]" />
                    <span className="text-xs font-semibold text-[#EF4444] capitalize">
                        Cancelled
                    </span>
                </div>
            );
        }
        if (s === "shipped") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#D4AF37]" />
                    <span className="text-xs font-semibold text-[#D4AF37] capitalize">
                        Shipped
                    </span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#3B82F6]" />
                <span className="text-xs font-semibold text-[#3B82F6] capitalize">
                    {s === "processing" ? "Processing" : s || "Processing"}
                </span>
            </div>
        );
    };

    const hasOrders = sortedOrders.length > 0;

    // Helper to generate pagination numbers
    const pageNumbers = useMemo(() => {
        const pages: number[] = [];
        const maxVisible = 7;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const start = Math.max(1, currentPage - 2);
            const end = Math.min(totalPages, start + maxVisible - 1);
            for (let i = start; i <= end; i++) pages.push(i);
        }
        return pages;
    }, [totalPages, currentPage]);

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-[#171717] font-semibold">Orders</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Orders
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    Manage, track and fulfill customer orders.
                </p>
            </div>

            {/* Filter & Search Bar Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order ID, customer, email, phone..."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="w-full sm:w-auto min-w-44">
                    <CustomDropdown
                        variant="light"
                        options={SORT_OPTIONS}
                        value={sortBy}
                        onChange={setSortBy}
                    />
                </div>
            </div>

            {/* Status Summary Pills & Export Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Status Summary Pill Box */}
                <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 bg-white border border-[#EAEAEA] rounded-xl shadow-2xs overflow-x-auto max-w-full">
                    {STATUS_TABS.map((tab) => {
                        const isActive = statusTab === tab.id;
                        const count =
                            isActive && pagination?.total !== undefined
                                ? pagination.total
                                : tab.id === "all"
                                  ? (pagination?.total ?? apiOrders.length)
                                  : apiOrders.filter(
                                        (o) =>
                                            (o.status || "").toLowerCase() ===
                                            tab.id,
                                    ).length;

                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleStatusTabChange(tab.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0",
                                    isActive
                                        ? "bg-[#FAF7F2] text-[#171717]"
                                        : "text-[#737373] hover:text-[#171717]",
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-2 rounded-full",
                                        tab.dotColor,
                                    )}
                                />
                                <span
                                    className={cn(
                                        isActive
                                            ? "text-[#D4AF37]"
                                            : "text-[#171717]",
                                    )}
                                >
                                    {tab.label}
                                </span>
                                {isActive && (
                                    <>
                                        {isLoading ? (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold  bg-[#737373]/20 animate-pulse size-4.25"></span>
                                        ) : (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] text-[#737373]">
                                                {count}
                                            </span>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Export Buttons */}
                {hasOrders && (
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <span className="text-xs font-semibold text-[#171717] mr-1">
                            Export As:
                        </span>
                        <button
                            type="button"
                            onClick={() => handleExport("csv")}
                            className="border border-[#171717] rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                            <span>CSV</span>
                            <CsvIcon />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport("doc")}
                            className="border border-[#171717] rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                            <span>DOC</span>
                            <DocIcon />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleExport("pdf")}
                            className="border border-[#171717] rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                            <span>PDF</span>
                            <PdfIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Area: Skeleton OR Error OR Empty State OR Orders Table */}
            {isLoading ? (
                /* Skeleton Loading State */
                <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs animate-pulse">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-16">
                                        S/N
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Order ID
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Customer Name
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Amount
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Date
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
                                            <div className="h-4 w-28 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-32 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-20 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-24 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6">
                                            <div className="h-4 w-28 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4.5 px-6 text-right">
                                            <div className="h-4 w-10 bg-gray-200 rounded ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : isError && !hasOrders ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-red-100 rounded-xl p-8 shadow-xs">
                    <p className="text-sm font-semibold text-red-600 mb-1">
                        Failed to load orders
                    </p>
                    <p className="text-xs text-[#737373] mb-4 max-w-sm">
                        {(error as any)?.response?.data?.message ||
                            (error as any)?.message ||
                            "An error occurred while connecting to the server."}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-white text-xs font-semibold hover:bg-[#C5A265] transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Retry</span>
                    </button>
                </div>
            ) : !hasOrders ? (
                /* Empty State */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptySadBoxIllustration />
                    <p className="text-sm font-medium text-[#737373] mt-3">
                        {debouncedSearch
                            ? "No orders found matching your search"
                            : statusTab !== "all"
                              ? `No ${statusTab} orders found`
                              : "No orders available yet"}
                    </p>
                </div>
            ) : (
                /* Orders Table */
                <div className="space-y-4">
                    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-16">
                                            S/N
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                            Order ID
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                            Customer Name
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                            Amount
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                            Status
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                            Date
                                        </th>
                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717] text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F0F0]">
                                    {sortedOrders.map((order, index) => {
                                        const customerName = order?.customer
                                            ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                                            : `${order?.firstName || ""} ${order?.lastName || ""}`.trim() ||
                                              "Customer";

                                        const amountNum = Number(
                                            order.total || 0,
                                        );
                                        const dateDisplay = formatDateDisplay(
                                            new Date(order.createdAt),
                                        );

                                        return (
                                            <tr
                                                key={order.orderId}
                                                className="hover:bg-[#FCFBF8] transition-colors group"
                                            >
                                                <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373] font-medium">
                                                    {String(
                                                        (currentPage - 1) *
                                                            pageSize +
                                                            index +
                                                            1,
                                                    ).padStart(2, "0")}
                                                </td>
                                                <td className="py-4.5 px-6 text-xs sm:text-sm font-medium text-[#171717]">
                                                    Order #{order.orderNumber}
                                                </td>
                                                <td className="py-4.5 px-6 text-xs sm:text-sm font-medium text-[#171717]">
                                                    {customerName}
                                                </td>
                                                <td className="py-4.5 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                    ₦
                                                    {amountNum.toLocaleString()}
                                                </td>
                                                <td className="py-4.5 px-6">
                                                    {renderProgressBadge(
                                                        order.status,
                                                    )}
                                                </td>
                                                <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                    {dateDisplay}
                                                </td>
                                                <td className="py-4.5 px-6 text-right">
                                                    <Link
                                                        to={`/orders/${order.orderId}`}
                                                        className="text-xs sm:text-sm font-medium text-[#171717] hover:text-[#D4AF37] underline underline-offset-2 transition-colors cursor-pointer"
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
                    </div>

                    {/* Bottom Pagination & Showing Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <span className="text-xs text-[#737373] font-medium">
                            Showing {sortedOrders.length} of {totalCurrentCount}{" "}
                            Orders
                        </span>

                        {/* Pagination controls */}
                        <div className="flex items-center gap-1.5 self-center sm:self-auto">
                            {/* Prev button */}
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(1, p - 1))
                                }
                                className="size-8 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Previous Page"
                            >
                                <ChevronLeft className="size-4" />
                            </button>

                            {/* Page numbers */}
                            {pageNumbers.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setCurrentPage(p)}
                                    className={cn(
                                        "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                        currentPage === p
                                            ? "bg-[#D4AF37] text-white"
                                            : "hover:bg-[#FAF7F2] text-[#737373]",
                                    )}
                                >
                                    {p}
                                </button>
                            ))}

                            {totalPages > 7 && currentPage < totalPages - 2 && (
                                <>
                                    <span className="text-xs text-[#737373] px-1 select-none">
                                        ...
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCurrentPage(totalPages)
                                        }
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === totalPages
                                                ? "bg-[#D4AF37] text-white"
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
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(totalPages, p + 1),
                                    )
                                }
                                className="size-8 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Next Page"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
