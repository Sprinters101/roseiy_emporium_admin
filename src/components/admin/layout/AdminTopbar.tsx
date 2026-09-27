import React, { useState, useEffect } from "react";
import { Search, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/config/permissions";
import type { AdminRole } from "@/service/types";
import { AdminSearchModal } from "./AdminSearchModal";

interface AdminTopbarProps {
    onOpenMobileSidebar?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
    onOpenMobileSidebar,
    searchQuery = "",
    onSearchChange: _onSearchChange,
}) => {
    const { user } = useAuth();
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Global keyboard shortcut to open search modal (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setIsSearchModalOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const adminName = user?.firstName
        ? `${user.firstName} ${user.lastName || ""}`.trim()
        : "Roseiy Bolanle";

    const formatRole = (role?: string) => {
        if (!role) return "Administrator";
        const normalized = role.toLowerCase() as AdminRole;
        return ROLE_LABELS[normalized] || role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const adminRole = formatRole(user?.role);

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
                {/* Global Search Bar Trigger */}
                <div className="flex-1 max-w-90.75 mx-auto lg:mx-0">
                    <button
                        type="button"
                        onClick={() => setIsSearchModalOpen(true)}
                        className="w-full flex items-center justify-between bg-[#181818] hover:bg-[#1F1F1F] text-[#737373] hover:text-[#A3A3A3] text-sm pl-4 pr-3 py-2.5 rounded-lg border border-[#262626] hover:border-[#383838] transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <Search className="size-4.5 text-white/80 group-hover:text-gold-500 transition-colors shrink-0" />
                            <span className="truncate text-xs sm:text-sm text-black-300">
                                Search products, orders, customers...
                            </span>
                        </div>
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[#888888] bg-[#222222] border border-[#333333] rounded">
                            <span className="text-[12px]">⌘</span>K
                        </kbd>
                    </button>
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

            {/* Universal Search Modal */}
            <AdminSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                initialQuery={searchQuery}
            />
        </header>
    );
};

export default AdminTopbar;
