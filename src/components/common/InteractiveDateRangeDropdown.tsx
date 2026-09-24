import React, { useState, useMemo, useEffect } from "react";
import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Format date into "07 February 2025"
export const formatDateDisplay = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
};

export const isSameDay = (d1: Date, d2: Date) => {
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

export const isBetween = (date: Date, start: Date, end: Date) => {
    return date > start && date < end;
};

export interface InteractiveDateRangeDropdownProps {
    fromDate: Date | null;
    toDate: Date | null;
    onRangeChange: (from: Date, to: Date) => void;
    onReset?: () => void;
    placeholder?: string;
    className?: string;
}

export const InteractiveDateRangeDropdown: React.FC<InteractiveDateRangeDropdownProps> = ({
    fromDate,
    toDate,
    onRangeChange,
    onReset,
    placeholder = "Date Range",
    className,
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
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center justify-between gap-2.5 px-4 py-2.5 bg-white border border-[#E5E5E5] hover:border-[#D4AF37] focus:border-[#D4AF37] data-[state=open]:border-[#D4AF37] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs w-full min-w-44 outline-none",
                    className,
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    <Calendar className="size-4 text-[#737373] shrink-0" />
                    <span className="truncate">
                        {fromDate && toDate
                            ? `${formatDateDisplay(fromDate)} - ${formatDateDisplay(toDate)}`
                            : placeholder}
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
