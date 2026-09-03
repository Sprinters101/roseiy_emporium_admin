import React from "react";
import { Search, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminTopbarProps {
    onOpenMobileSidebar?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
    onOpenMobileSidebar,
    searchQuery = "",
    onSearchChange,
}) => {
    const { user } = useAuth();
    const adminName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Roseiy Bolanle";
    const adminRole = user?.role || "Super Administrator";

    // Initials e.g. "RB"
    const initials =
        adminName
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase() || "RB";

    return (
        <header className="h-20 bg-black-900  px-4 sm:px-8 flex items-center justify-between lg:justify-end gap-4 sticky top-0 z-30">
            {/* Mobile Hamburger Menu Toggle */}
            <div className="flex items-center gap-3 lg:hidden">
                <button
                    type="button"
                    onClick={onOpenMobileSidebar}
                    className="p-2 rounded-lg bg-[#161616] text-[#a3a3a3] hover:text-white border border-[#262626] transition-colors cursor-pointer"
                    aria-label="Open sidebar"
                >
                    <Menu className="size-5" />
                </button>
            </div>

            <div className="flex w-full items-center justify-between lg:max-w-142.25">
                {/* Global Search Bar */}
                <div className="flex-1 max-w-90.75 mx-auto lg:mx-0">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search products, orders, customers......"
                            className="w-full bg-[#181818] text-[#e5e5e5] placeholder-black-300 text-sm pl-11 pr-4 py-2.5 rounded-lg border border-[#262626] focus:border-[#d4af37]/60 focus:bg-[#1f1f1f] focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Super Administrator Profile Pill */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3  rounded-full  ">
                        <div className="size-9 rounded-full bg-black-700 border border-gold-500 flex items-center justify-center gradient-text font-semibold text-xs tracking-wider">
                            {initials}
                        </div>
                        <div className="hidden sm:flex flex-col text-left pr-2">
                            <span className="text-xs sm:text-sm font-semibold text-[#f5f5f5] leading-tight">
                                {adminName}
                            </span>
                            <span className="text-[11px] text-[#9ca3af] leading-tight font-medium">
                                {adminRole === "admin"
                                    ? "Super Administrator"
                                    : adminRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminTopbar;
