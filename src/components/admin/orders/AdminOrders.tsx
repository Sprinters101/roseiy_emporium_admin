import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ChevronDown,
    RefreshCw,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useGetAdminOrders } from "@/service/queries";
import type { AdminOrderDetail, GetOrdersParams } from "@/service/types";

export type OrderCategory = "ongoing" | "completed" | "failed";

const PROGRESS_OPTIONS = [
    { label: "All Progress", value: "all" },
    { label: "In Transit", value: "InTransit" },
    { label: "Confirmed", value: "Order Confirmed" },
];

const SORT_OPTIONS = [
    { label: "Default", value: "default" },
    { label: "A-Z", value: "az" },
    { label: "Most Products", value: "most" },
    { label: "Least Products", value: "least" },
    { label: "Newest", value: "newest" },
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

// Empty State Sad Box Illustration matching Screenshot 1
const EmptySadBoxIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        {/* Soft warm beige blob backdrop */}
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-xs opacity-90 scale-95" />

        {/* 3D Sad Cardboard Box SVG */}
        <svg viewBox="0 0 140 140" className="size-32 z-10 drop-shadow-xs">
            {/* Box Top face */}
            <polygon points="70,25 115,50 70,75 25,50" fill="#E8C87A" />
            {/* Box Top Center Seam / Tape */}
            <polygon
                points="66,27 74,31 74,73 66,69"
                fill="#DEC072"
                opacity="0.8"
            />

            {/* Box Left face (darker isometric shade) */}
            <polygon points="25,50 70,75 70,120 25,95" fill="#D3B05C" />

            {/* Box Right face (lighter isometric shade) */}
            <polygon points="70,75 115,50 115,95 70,120" fill="#E2C172" />

            {/* Left Eye */}
            <circle cx="85" cy="85" r="2.2" fill="#4A3B18" />

            {/* Right Eye */}
            <circle cx="101" cy="76" r="2.2" fill="#4A3B18" />

            {/* Sad Mouth Curve */}
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

const isSameDay = (d1: Date, d2: Date) => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

const isBetween = (date: Date, start: Date, end: Date) => {
    return date > start && date < end;
};

// Interactive Calendar Date Range Popover matching Screenshot 5 design
const InteractiveDateRangeDropdown = ({
    fromDate,
    toDate,
    onRangeChange,
    onReset,
}: {
    fromDate: Date | null;
    toDate: Date | null;
    onRangeChange: (from: Date, to: Date) => void;
    onReset?: () => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTarget, setActiveTarget] = useState<"from" | "to">("from");
    const [tempFrom, setTempFrom] = useState<Date | null>(fromDate);
    const [tempTo, setTempTo] = useState<Date | null>(toDate);
    const [viewMonth, setViewMonth] = useState<Date>(
        fromDate
            ? new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );

    // Sync when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTempFrom(fromDate);
            setTempTo(toDate);
            setViewMonth(
                fromDate
                    ? new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
                    : new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          1,
                      ),
            );
            setActiveTarget(fromDate ? "to" : "from");
        }
    }, [isOpen, fromDate, toDate]);

    // Build calendar grid for current viewMonth
    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const days: { date: Date; currentMonth: boolean }[] = [];

        // Leading days from previous month
        const firstDayIndex = new Date(year, month, 1).getDay();
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDate - i),
                currentMonth: false,
            });
        }

        // Days in current month
        const totalDays = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true,
            });
        }

        // Trailing days
        const remaining = (7 - (days.length % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false,
            });
        }

        return days;
    }, [viewMonth]);

    const handleDateSelect = (selectedDate: Date) => {
        if (activeTarget === "from") {
            setTempFrom(selectedDate);
            if (tempTo && selectedDate > tempTo) {
                setTempTo(null);
            }
            setActiveTarget("to");
        } else {
            if (tempFrom && selectedDate < tempFrom) {
                setTempFrom(selectedDate);
                setActiveTarget("to");
            } else {
                setTempTo(selectedDate);
            }
        }
    };

    const handleApply = () => {
        if (tempFrom && tempTo) {
            onRangeChange(tempFrom, tempTo);
            setIsOpen(false);
        } else if (tempFrom) {
            onRangeChange(tempFrom, tempFrom);
            setIsOpen(false);
        } else {
            setIsOpen(false);
        }
    };

    const handleReset = () => {
        setTempFrom(null);
        setTempTo(null);
        if (onReset) {
            onReset();
        }
        setIsOpen(false);
    };

    const monthYearTitle = viewMonth.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
    });

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2.5 px-4 py-2.5 bg-white border border-[#E5E5E5] hover:border-[#D4AF37] focus:border-[#D4AF37] data-[state=open]:border-[#D4AF37] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs w-full min-w-44 outline-none">
                <div className="flex items-center gap-2 truncate">
                    <Calendar className="size-4 text-[#737373] shrink-0" />
                    <span className="truncate">
                        {fromDate && toDate
                            ? `${formatDateDisplay(fromDate)} - ${formatDateDisplay(toDate)}`
                            : "Date Range"}
                    </span>
                </div>
                <ChevronDown className="size-4 text-[#737373] shrink-0 transition-transform duration-200" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 p-4 bg-white border border-[#EAEAEA] rounded-2xl shadow-xl z-50 animate-in fade-in-50 zoom-in-95"
            >
                <div className="space-y-4">
                    {/* Header Range summary */}
                    <div className="flex items-center justify-between border-b border-[#F0F0F0] pb-3">
                        <span className="text-xs font-bold text-[#171717]">
                            Filter by Date Range
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737373]">
                            <span
                                onClick={() => setActiveTarget("from")}
                                className={cn(
                                    "px-2 py-0.5 rounded cursor-pointer transition-colors",
                                    activeTarget === "from"
                                        ? "bg-[#FAF7F2] text-[#D4AF37] border border-[#D4AF37]"
                                        : "hover:text-[#171717]",
                                )}
                            >
                                {tempFrom
                                    ? formatDateDisplay(tempFrom)
                                    : "From"}
                            </span>
                            <span>→</span>
                            <span
                                onClick={() => setActiveTarget("to")}
                                className={cn(
                                    "px-2 py-0.5 rounded cursor-pointer transition-colors",
                                    activeTarget === "to"
                                        ? "bg-[#FAF7F2] text-[#D4AF37] border border-[#D4AF37]"
                                        : "hover:text-[#171717]",
                                )}
                            >
                                {tempTo ? formatDateDisplay(tempTo) : "To"}
                            </span>
                        </div>
                    </div>

                    {/* Month Navigator */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonth.getFullYear(),
                                        viewMonth.getMonth() - 1,
                                        1,
                                    ),
                                )
                            }
                            className="p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <span className="text-xs font-bold text-[#171717]">
                            {monthYearTitle}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonth.getFullYear(),
                                        viewMonth.getMonth() + 1,
                                        1,
                                    ),
                                )
                            }
                            className="p-1 rounded-md text-[#737373] hover:text-[#171717] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Calendar Day Labels */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <span
                                key={d}
                                className="text-[10px] font-bold text-[#A0A0A0] py-1"
                            >
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Calendar Day Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map(({ date, currentMonth }, idx) => {
                            const isStart = tempFrom
                                ? isSameDay(date, tempFrom)
                                : false;
                            const isEnd = tempTo
                                ? isSameDay(date, tempTo)
                                : false;
                            const inRange =
                                tempFrom && tempTo
                                    ? isBetween(date, tempFrom, tempTo)
                                    : false;
                            const isSelected = isStart || isEnd;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleDateSelect(date)}
                                    className={cn(
                                        "size-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer",
                                        !currentMonth && "text-[#CCCCCC]",
                                        currentMonth &&
                                            !isSelected &&
                                            !inRange &&
                                            "text-[#171717] hover:bg-[#FAF7F2]",
                                        inRange &&
                                            "bg-[#FAF7F2] text-[#D4AF37] rounded-none",
                                        isSelected &&
                                            "bg-[#D4AF37] text-white font-bold shadow-2xs",
                                    )}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-[#F0F0F0] pt-3">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="text-xs font-semibold text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#C5A265] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                            Apply Range
                        </button>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const AdminOrders: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [progressFilter, setProgressFilter] = useState("all");
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [sortBy, setSortBy] = useState("newest");
    const [statusTab, setStatusTab] = useState<OrderCategory>("ongoing");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleStatusTabChange = (tab: OrderCategory) => {
        setStatusTab(tab);
        setCurrentPage(1);
    };

    // Query params for backend
    const queryParams: GetOrdersParams = useMemo(() => {
        const p: GetOrdersParams = {
            page: currentPage,
            limit: pageSize,
        };
        if (debouncedSearch.trim()) {
            p.search = debouncedSearch.trim();
        }
        if (statusTab === "completed") {
            p.status = "delivered";
        } else if (statusTab === "failed") {
            p.status = "cancelled";
        } else if (statusTab === "ongoing") {
            if (progressFilter === "InTransit") {
                p.status = "shipped";
                return;
            } else if (progressFilter === "Order Confirmed") {
                p.status = "processing";
                return;
            }
            p.status = "processing";
        }
        return p;
    }, [currentPage, pageSize, debouncedSearch, statusTab, progressFilter]);

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

    // Filter by tab on client-side if status was not restricted on backend
    const tabFilteredOrders = useMemo(() => {
        return apiOrders.filter((order) => {
            const status = (order.status || "").toLowerCase();
            if (statusTab === "ongoing") {
                if (progressFilter === "InTransit") return status === "shipped";
                if (progressFilter === "Order Confirmed")
                    return status === "processing";
                return status === "processing" || status === "shipped";
            }
            if (statusTab === "completed") {
                return status === "delivered";
            }
            if (statusTab === "failed") {
                return status === "cancelled" || status === "failed";
            }

            // Apply date filtering only if admin selected a range
            if (fromDate && toDate) {
                const orderDate = new Date(order.createdAt);
                const startOfDay = new Date(
                    fromDate.getFullYear(),
                    fromDate.getMonth(),
                    fromDate.getDate(),
                    0,
                    0,
                    0,
                    0,
                );
                const endOfDay = new Date(
                    toDate.getFullYear(),
                    toDate.getMonth(),
                    toDate.getDate(),
                    23,
                    59,
                    59,
                    999,
                );
                if (orderDate < startOfDay || orderDate > endOfDay) {
                    return false;
                }
            }

            return true;
        });
    }, [apiOrders, statusTab, progressFilter, fromDate, toDate]);

    // Apply sorting
    const sortedOrders = useMemo(() => {
        return [...tabFilteredOrders].sort((a, b) => {
            const nameA =
                `${a.customer?.firstName || ""} ${a.customer?.lastName || ""}`.trim();
            const nameB =
                `${b.customer?.firstName || ""} ${b.customer?.lastName || ""}`.trim();
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
    }, [tabFilteredOrders, sortBy]);

    const totalCurrentCount = sortedOrders.length;

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
                        : "Customer";
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
                    <span className="text-xs font-semibold text-[#10B981]">
                        Completed
                    </span>
                </div>
            );
        }
        if (s === "cancelled" || s === "failed") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#EF4444]" />
                    <span className="text-xs font-semibold text-[#EF4444]">
                        Failed
                    </span>
                </div>
            );
        }
        if (s === "shipped" || s === "intransit") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#D4AF37]" />
                    <span className="text-xs font-semibold text-[#D4AF37]">
                        InTransit
                    </span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#3B82F6]" />
                <span className="text-xs font-semibold text-[#3B82F6]">
                    Confirmed
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
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by order ID, customer...."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap items-center gap-3">
                    {statusTab === "ongoing" && (
                        <>
                            <div className="w-full sm:w-auto min-w-36">
                                <CustomDropdown
                                    variant="light"
                                    options={PROGRESS_OPTIONS}
                                    value={progressFilter}
                                    onChange={setProgressFilter}
                                />
                            </div>

                            <div className="w-full sm:w-auto min-w-36">
                                <InteractiveDateRangeDropdown
                                    fromDate={fromDate}
                                    toDate={toDate}
                                    onRangeChange={(from, to) => {
                                        setFromDate(from);
                                        setToDate(to);
                                        setCurrentPage(1);
                                    }}
                                    onReset={() => {
                                        setFromDate(null);
                                        setToDate(null);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </>
                    )}

                    <div className="w-full sm:w-auto min-w-44">
                        <CustomDropdown
                            variant="light"
                            options={SORT_OPTIONS}
                            value={sortBy}
                            onChange={setSortBy}
                        />
                    </div>
                </div>
            </div>

            {/* Status Summary Pills & Export Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Status Summary Pill Box */}
                <div className="flex items-center gap-2 sm:gap-4 p-1.5 bg-white border border-[#EAEAEA] rounded-xl shadow-2xs w-fit">
                    <button
                        type="button"
                        onClick={() => handleStatusTabChange("ongoing")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                            statusTab === "ongoing"
                                ? "bg-[#FAF7F2] text-[#171717]"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span className="size-2 rounded-full bg-[#D4AF37]" />
                        <span
                            className={cn(
                                statusTab === "ongoing"
                                    ? "text-[#D4AF37]"
                                    : "text-[#171717]",
                            )}
                        >
                            Ongoing
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] text-[#737373]">
                            {statusTab === "ongoing" ? totalCurrentCount : "—"}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleStatusTabChange("completed")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                            statusTab === "completed"
                                ? "bg-[#FAF7F2] text-[#171717]"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span className="size-2 rounded-full bg-[#10B981]" />
                        <span>Completed</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] text-[#737373]">
                            {statusTab === "completed"
                                ? totalCurrentCount
                                : "—"}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleStatusTabChange("failed")}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                            statusTab === "failed"
                                ? "bg-[#FAF7F2] text-[#171717]"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span className="size-2 rounded-full bg-[#EF4444]" />
                        <span>Failed</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#F5F5F5] text-[#737373]">
                            {statusTab === "failed" ? totalCurrentCount : "—"}
                        </span>
                    </button>
                </div>

                {/* Export Buttons */}
                {hasOrders && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
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
                                        Order Progress
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
                /* Empty State (Screenshot 1) */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptySadBoxIllustration />
                    <p className="text-sm font-medium text-[#737373] mt-3">
                        {debouncedSearch
                            ? "No orders found matching your search"
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
                                            Order Progress
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
                                        const customerName = order.customer
                                            ? `${order.customer.firstName} ${order.customer.lastName}`.trim()
                                            : "Customer";
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
