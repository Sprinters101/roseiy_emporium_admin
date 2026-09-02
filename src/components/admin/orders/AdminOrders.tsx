import React, { useState, useMemo, useEffect } from "react";
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ChevronDown,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    getOrders,
    subscribeOrders,
    type OrderRecord,
    type OrderCategory,
} from "@/lib/orders_data";
import { cn } from "@/lib/utils";

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
const formatDateDisplay = (date: Date) => {
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
}: {
    fromDate: Date;
    toDate: Date;
    onRangeChange: (from: Date, to: Date) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTarget, setActiveTarget] = useState<"from" | "to">("from");
    const [tempFrom, setTempFrom] = useState<Date>(fromDate);
    const [tempTo, setTempTo] = useState<Date>(toDate);
    const [viewMonth, setViewMonth] = useState<Date>(
        new Date(fromDate.getFullYear(), fromDate.getMonth(), 1),
    );

    // Sync when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTempFrom(fromDate);
            setTempTo(toDate);
            setViewMonth(new Date(fromDate.getFullYear(), fromDate.getMonth(), 1));
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
            // If new from is after tempTo, adjust tempTo
            if (selectedDate > tempTo) {
                setTempTo(new Date(selectedDate.getTime() + 86400000 * 365));
            }
            setActiveTarget("to");
        } else {
            if (selectedDate < tempFrom) {
                setTempFrom(selectedDate);
            } else {
                setTempTo(selectedDate);
            }
        }
    };

    const handleApply = () => {
        onRangeChange(tempFrom, tempTo);
        setIsOpen(false);
        toast.success(
            `Date range applied: ${formatDateDisplay(tempFrom)} - ${formatDateDisplay(tempTo)}`,
        );
    };

    const handleReset = () => {
        const defaultFrom = new Date(2025, 1, 7); // 07 Feb 2025
        const defaultTo = new Date(2026, 1, 7); // 07 Feb 2026
        setTempFrom(defaultFrom);
        setTempTo(defaultTo);
        onRangeChange(defaultFrom, defaultTo);
        setViewMonth(new Date(2025, 1, 1));
        toast.info("Date range reset");
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger className="group relative flex w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-hanken outline-none cursor-pointer transition-colors border border-[#E5E5E5] bg-white text-[#171717] hover:border-[#D4AF37] focus:border-[#D4AF37] data-[state=open]:border-[#D4AF37]">
                <span className="truncate">Date Range</span>
                <ChevronDown className="size-4 shrink-0 transition-transform duration-200 pointer-events-none group-data-[state=open]:rotate-180 text-[#171717]" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="z-50 w-72 sm:w-80 rounded-2xl p-4 shadow-2xl font-hanken border border-[#EAEAEA] bg-white text-[#171717] animate-scaleUp"
            >
                {/* From & To Cards Matching Screenshot 5 */}
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="text-xs font-semibold text-[#171717] block mb-1">
                            From
                        </label>
                        <div
                            onClick={() => {
                                setActiveTarget("from");
                                setViewMonth(
                                    new Date(
                                        tempFrom.getFullYear(),
                                        tempFrom.getMonth(),
                                        1,
                                    ),
                                );
                            }}
                            className={cn(
                                "flex items-center border rounded-lg px-3 py-2 bg-white transition-all cursor-pointer",
                                activeTarget === "from"
                                    ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/30 bg-[#FAF7F2]/40"
                                    : "border-[#E5E5E5] hover:border-[#D5D5D5]",
                            )}
                        >
                            <Calendar className="size-4 text-[#888888] shrink-0" />
                            <span className="text-[#D5D5D5] mx-2 select-none">|</span>
                            <span className="text-xs font-semibold text-[#171717]">
                                {formatDateDisplay(tempFrom)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#171717] block mb-1">
                            To
                        </label>
                        <div
                            onClick={() => {
                                setActiveTarget("to");
                                setViewMonth(
                                    new Date(
                                        tempTo.getFullYear(),
                                        tempTo.getMonth(),
                                        1,
                                    ),
                                );
                            }}
                            className={cn(
                                "flex items-center border rounded-lg px-3 py-2 bg-white transition-all cursor-pointer",
                                activeTarget === "to"
                                    ? "border-[#D4AF37] ring-1 ring-[#D4AF37]/30 bg-[#FAF7F2]/40"
                                    : "border-[#E5E5E5] hover:border-[#D5D5D5]",
                            )}
                        >
                            <Calendar className="size-4 text-[#888888] shrink-0" />
                            <span className="text-[#D5D5D5] mx-2 select-none">|</span>
                            <span className="text-xs font-semibold text-[#171717]">
                                {formatDateDisplay(tempTo)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Calendar View Area */}
                <div className="pt-3 border-t border-[#F0F0F0]">
                    {/* Month / Year Navigator */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#171717]">
                            {viewMonth.toLocaleString("en-US", {
                                month: "long",
                                year: "numeric",
                            })}
                        </span>
                        <div className="flex items-center gap-1">
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
                                className="p-1 rounded-md hover:bg-[#FAF7F2] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                                aria-label="Previous Month"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
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
                                className="p-1 rounded-md hover:bg-[#FAF7F2] text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                                aria-label="Next Month"
                            >
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <span
                                key={day}
                                className="text-[11px] font-semibold text-[#888888]"
                            >
                                {day}
                            </span>
                        ))}
                    </div>

                    {/* Date Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((item, idx) => {
                            const isSelectedFrom = isSameDay(item.date, tempFrom);
                            const isSelectedTo = isSameDay(item.date, tempTo);
                            const inRange = isBetween(
                                item.date,
                                tempFrom,
                                tempTo,
                            );

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleDateSelect(item.date)}
                                    className={cn(
                                        "size-8 rounded-full text-xs flex items-center justify-center transition-all cursor-pointer font-medium",
                                        !item.currentMonth && "text-[#CCCCCC]",
                                        item.currentMonth && "text-[#171717]",
                                        (isSelectedFrom || isSelectedTo) &&
                                            "bg-[#D4AF37] text-white font-bold shadow-xs hover:bg-[#C5A265]",
                                        inRange &&
                                            !isSelectedFrom &&
                                            !isSelectedTo &&
                                            "bg-[#FAF7F2] text-[#D4AF37] font-semibold",
                                        !isSelectedFrom &&
                                            !isSelectedTo &&
                                            !inRange &&
                                            "hover:bg-[#FAF7F2] hover:text-[#D4AF37]",
                                    )}
                                >
                                    {item.date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0F0F0]">
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
    const [orders, setOrders] = useState<OrderRecord[]>(getOrders());
    const [searchTerm, setSearchTerm] = useState("");
    const [progressFilter, setProgressFilter] = useState("all");
    const [fromDate, setFromDate] = useState<Date>(new Date(2025, 1, 7)); // 07 Feb 2025
    const [toDate, setToDate] = useState<Date>(new Date(2026, 1, 7)); // 07 Feb 2026
    const [sortBy, setSortBy] = useState("newest");
    const [statusTab, setStatusTab] = useState<OrderCategory>("ongoing");
    const [currentPage, setCurrentPage] = useState(1);

    // Sync with central orders data store
    useEffect(() => {
        const unsubscribe = subscribeOrders(() => {
            setOrders([...getOrders()]);
        });
        return unsubscribe;
    }, []);

    // Summary counts matching screenshots
    const counts = useMemo(() => {
        return {
            ongoing: 92,
            completed: 286,
            failed: 12,
        };
    }, []);

    // Filtered & Sorted orders
    const filteredOrders = useMemo(() => {
        return orders
            .filter((order) => {
                const matchesTab = order.category === statusTab;
                const matchesProgress =
                    progressFilter === "all" ||
                    order.progress === progressFilter ||
                    (progressFilter === "Order Confirmed" &&
                        order.progress === "Order Confirmed") ||
                    (progressFilter === "InTransit" &&
                        order.progress === "InTransit");
                const matchesSearch =
                    order.orderNumber
                        .toLowerCase()
                        .includes(searchTerm.trim().toLowerCase()) ||
                    order.customerName
                        .toLowerCase()
                        .includes(searchTerm.trim().toLowerCase()) ||
                    order.amount
                        .toString()
                        .includes(searchTerm.trim().replace(/[^0-9]/g, ""));
                return matchesTab && matchesProgress && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "az")
                    return a.customerName.localeCompare(b.customerName);
                if (sortBy === "most") return b.items.length - a.items.length;
                if (sortBy === "least") return a.items.length - b.items.length;
                if (sortBy === "newest")
                    return (
                        Number(b.id.replace(/[^0-9]/g, "") || 0) -
                        Number(a.id.replace(/[^0-9]/g, "") || 0)
                    );
                return 0;
            });
    }, [orders, statusTab, progressFilter, searchTerm, sortBy]);

    // Total count for current tab
    const totalCurrentCount = useMemo(() => {
        if (statusTab === "ongoing") return counts.ongoing;
        if (statusTab === "completed") return counts.completed;
        if (statusTab === "failed") return filteredOrders.length;
        return filteredOrders.length;
    }, [statusTab, counts, filteredOrders.length]);

    // Export handlers
    const handleExport = (type: "csv" | "doc" | "pdf") => {
        if (type === "csv") {
            const headers = "S/N,Order ID,Customer Name,Amount,Status,Date\n";
            const rows = filteredOrders
                .map(
                    (o, idx) =>
                        `"${idx + 1}","Order #${o.orderNumber}","${o.customerName}","₦${o.amount.toLocaleString()}","${o.progress}","${o.date}"`,
                )
                .join("\n");
            const blob = new Blob([headers + rows], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `roseiy_orders_${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("Orders exported as CSV successfully");
        } else {
            toast.success(`Orders exported as ${type.toUpperCase()} successfully`);
        }
    };

    const renderProgressBadge = (
        progress: OrderRecord["progress"],
        category: OrderCategory,
    ) => {
        if (category === "completed" || progress === "Delivered") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#10B981]" />
                    <span className="text-xs font-semibold text-[#10B981]">
                        Completed
                    </span>
                </div>
            );
        }
        if (category === "failed" || progress === "Failed") {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-[#EF4444]" />
                    <span className="text-xs font-semibold text-[#EF4444]">
                        Failed
                    </span>
                </div>
            );
        }
        if (progress === "InTransit") {
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

    const hasOrders = orders.length > 0;

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
                        onClick={() => setStatusTab("ongoing")}
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
                            {counts.ongoing}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab("completed")}
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
                            {counts.completed}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab("failed")}
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
                            {counts.failed}
                        </span>
                    </button>
                </div>

                {/* Export Buttons */}
                {hasOrders && filteredOrders.length > 0 && (
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

            {/* Main Content Area: Orders Table OR Empty State */}
            {!hasOrders || filteredOrders.length === 0 ? (
                /* Empty State (Screenshot 1) */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptySadBoxIllustration />
                    <p className="text-sm font-medium text-[#737373] mt-3">
                        {!hasOrders
                            ? "No orders available yet"
                            : "No orders found matching your search"}
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
                                    {filteredOrders.map((order, index) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-[#FCFBF8] transition-colors group"
                                        >
                                            <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373] font-medium">
                                                {String(index + 1).padStart(2, "0")}
                                            </td>
                                            <td className="py-4.5 px-6 text-xs sm:text-sm font-medium text-[#171717]">
                                                Order #{order.orderNumber}
                                            </td>
                                            <td className="py-4.5 px-6 text-xs sm:text-sm font-medium text-[#171717]">
                                                {order.customerName}
                                            </td>
                                            <td className="py-4.5 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                ₦{order.amount.toLocaleString()}
                                            </td>
                                            <td className="py-4.5 px-6">
                                                {renderProgressBadge(
                                                    order.progress,
                                                    order.category,
                                                )}
                                            </td>
                                            <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                {order.date}
                                            </td>
                                            <td className="py-4.5 px-6 text-right">
                                                <Link
                                                    to={`/orders/${order.id}`}
                                                    className="text-xs sm:text-sm font-medium text-[#171717] hover:text-[#D4AF37] underline underline-offset-2 transition-colors cursor-pointer"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Pagination & Showing Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <span className="text-xs text-[#737373] font-medium">
                            Showing {filteredOrders.length} of {totalCurrentCount} Orders
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

                            {/* Page 1 (Active) */}
                            <button
                                type="button"
                                onClick={() => setCurrentPage(1)}
                                className={cn(
                                    "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                    currentPage === 1
                                        ? "bg-[#D4AF37] text-white"
                                        : "hover:bg-[#FAF7F2] text-[#737373]",
                                )}
                            >
                                1
                            </button>

                            {/* Page 2 */}
                            <button
                                type="button"
                                onClick={() => setCurrentPage(2)}
                                className={cn(
                                    "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                    currentPage === 2
                                        ? "bg-[#D4AF37] text-white"
                                        : "hover:bg-[#FAF7F2] text-[#737373]",
                                )}
                            >
                                2
                            </button>

                            {statusTab !== "failed" && (
                                <>
                                    {/* Page 3 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(3)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 3
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        3
                                    </button>

                                    {/* Page 4 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(4)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 4
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        4
                                    </button>

                                    {/* Page 5 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(5)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 5
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        5
                                    </button>

                                    {/* Page 6 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(6)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 6
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        6
                                    </button>

                                    {/* Page 7 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(7)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 7
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        7
                                    </button>

                                    <span className="text-xs text-[#737373] px-1 select-none">
                                        ...
                                    </span>

                                    {/* Page 12 */}
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(12)}
                                        className={cn(
                                            "size-8 rounded-full text-xs font-bold transition-all cursor-pointer",
                                            currentPage === 12
                                                ? "bg-[#D4AF37] text-white"
                                                : "hover:bg-[#FAF7F2] text-[#737373]",
                                        )}
                                    >
                                        12
                                    </button>
                                </>
                            )}

                            {/* Next button */}
                            <button
                                type="button"
                                disabled={
                                    statusTab === "failed"
                                        ? currentPage === 2
                                        : currentPage === 12
                                }
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(
                                            statusTab === "failed" ? 2 : 12,
                                            p + 1,
                                        ),
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
