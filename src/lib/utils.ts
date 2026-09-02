import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Returns the ordinal suffix for a given day (st, nd, rd, th)
 */
export function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

/**
 * Returns a time-based greeting (Good Morning, Good Afternoon, Good Evening)
 */
export function getGreeting(date: Date = new Date()): string {
    const hour = date.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

/**
 * Format date string matching design: "Wednesday, 29th June 2026 | 10:34 AM"
 */
export function formatLiveDateTime(date: Date = new Date()): string {
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const suffix = getOrdinalSuffix(day);

    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return `${weekday}, ${day}${suffix} ${month} ${year} | ${timeStr}`;
}

