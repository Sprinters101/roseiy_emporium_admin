import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import {
    Search,
    X,
    Boxes,
    Users,
    Package,
    ShoppingBasket,
    Crown,
    ArrowRight,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminSearch } from "@/service/queries";
import type {
    UniversalSearchResultItem,
    UniversalSearchType,
} from "@/service/types";

interface AdminSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery?: string;
}

type FilterType = "all" | UniversalSearchType;

const FILTER_TABS: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Orders", value: "order" },
    { label: "Customers", value: "customer" },
    { label: "Products", value: "product" },
    { label: "Categories", value: "category" },
    { label: "Brands", value: "brand" },
];

export const AdminSearchModal: React.FC<AdminSearchModalProps> = ({
    isOpen,
    onClose,
    initialQuery = "",
}) => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const [query, setQuery] = useState(initialQuery);
    const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    // Synchronize initial query when opened
    useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery);
            setDebouncedQuery(initialQuery);
            setSelectedIndex(-1);
            // Autofocus input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, initialQuery]);

    // Lock body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    // Debounce search query (250ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
            setSelectedIndex(-1);
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    // Query admin search endpoint
    const { data: searchResponse, isLoading, isFetching } = useAdminSearch(
        {
            q: debouncedQuery,
            type: activeFilter === "all" ? undefined : activeFilter,
            limit: 12,
        },
        {
            enabled: isOpen && debouncedQuery.length >= 2,
        },
    );

    const searchResults: UniversalSearchResultItem[] = useMemo(() => {
        const list = searchResponse?.data?.results || [];
        if (activeFilter === "all") return list;
        return list.filter((item) => item.searchType === activeFilter);
    }, [searchResponse, activeFilter]);

    // Keyboard navigation (ArrowUp, ArrowDown, Enter, Escape)
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    searchResults.length === 0
                        ? -1
                        : prev < searchResults.length - 1
                          ? prev + 1
                          : 0,
                );
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    searchResults.length === 0
                        ? -1
                        : prev > 0
                          ? prev - 1
                          : searchResults.length - 1,
                );
            } else if (e.key === "Enter") {
                if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                    e.preventDefault();
                    handleSelect(searchResults[selectedIndex]);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, searchResults, selectedIndex]);

    const handleSelect = (item: UniversalSearchResultItem) => {
        onClose();
        if (item.url) {
            navigate(item.url);
        }
    };

    if (!isOpen) return null;

    // Helper badge style & icon based on searchType
    const renderTypeDetails = (type: UniversalSearchType) => {
        switch (type) {
            case "order":
                return {
                    label: "ORDER",
                    badgeClass:
                        "bg-[#1E3A8A]/30 text-[#93C5FD] border border-[#1E3A8A]",
                    icon: <Boxes className="size-4.5 text-[#93C5FD]" />,
                };
            case "customer":
                return {
                    label: "CUSTOMER",
                    badgeClass:
                        "bg-[#065F46]/30 text-[#A7F3D0] border border-[#065F46]",
                    icon: <Users className="size-4.5 text-[#A7F3D0]" />,
                };
            case "product":
                return {
                    label: "PRODUCT",
                    badgeClass:
                        "bg-[#78350F]/30 text-[#FDE68A] border border-[#78350F]",
                    icon: <Package className="size-4.5 text-[#FDE68A]" />,
                };
            case "category":
                return {
                    label: "CATEGORY",
                    badgeClass:
                        "bg-[#581C87]/30 text-[#E9D5FF] border border-[#581C87]",
                    icon: (
                        <ShoppingBasket className="size-4.5 text-[#E9D5FF]" />
                    ),
                };
            case "brand":
                return {
                    label: "BRAND",
                    badgeClass:
                        "bg-[#374151]/50 text-[#D1D5DB] border border-[#4B5563]",
                    icon: <Crown className="size-4.5 text-[#D1D5DB]" />,
                };
            default:
                return {
                    label: "ITEM",
                    badgeClass: "bg-gray-800 text-gray-300 border border-gray-700",
                    icon: <Search className="size-4.5 text-gray-400" />,
                };
        }
    };

    const isSearching = (isLoading || isFetching) && debouncedQuery.length >= 2;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 animate-fadeIn">
            {/* Dark Backdrop */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog Card */}
            <div
                className="relative w-full max-w-2xl bg-[#141414] border border-[#2B2B2B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] z-10 animate-scaleUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input Bar */}
                <div className="flex items-center px-4 py-3.5 border-b border-[#262626] gap-3">
                    <Search className="size-5 text-[#D4AF37] shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search products, orders, customers, categories, brands..."
                        className="flex-1 bg-transparent text-[#F5F5F5] placeholder-[#737373] text-sm sm:text-base focus:outline-none"
                    />
                    {isSearching ? (
                        <Loader2 className="size-4.5 text-[#D4AF37] animate-spin shrink-0" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                inputRef.current?.focus();
                            }}
                            className="p-1 rounded-md text-[#737373] hover:text-[#E5E5E5] transition-colors cursor-pointer shrink-0"
                            aria-label="Clear search input"
                        >
                            <X className="size-4" />
                        </button>
                    ) : null}

                    {/* ESC Close Key Hint */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="hidden sm:inline-flex items-center text-[11px] font-semibold text-[#888888] bg-[#222222] border border-[#333333] px-2 py-0.5 rounded cursor-pointer hover:text-white hover:border-[#555] transition-colors"
                    >
                        ESC
                    </button>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#1F1F1F] bg-[#181818]/60 overflow-x-auto scrollbar-none">
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActiveFilter(tab.value)}
                                className={cn(
                                    "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                                    isActive
                                        ? "bg-[#D4AF37] text-white shadow-2xs"
                                        : "bg-[#202020] text-[#888888] hover:text-[#E5E5E5] hover:bg-[#2A2A2A]",
                                )}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Results List Area */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto divide-y divide-[#1F1F1F] p-2 space-y-1 max-h-[50vh]"
                >
                    {/* State 1: Typing Hint when query is too short */}
                    {debouncedQuery.length < 2 && (
                        <div className="py-12 px-6 text-center space-y-2">
                            <div className="size-11 rounded-full bg-[#1C1C1C] border border-[#2B2B2B] flex items-center justify-center mx-auto text-[#D4AF37]">
                                <Search className="size-5" />
                            </div>
                            <h3 className="text-sm font-semibold text-[#E5E5E5]">
                                Quick Universal Search
                            </h3>
                            <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
                                Type at least 2 characters to search across all orders,
                                customers, products, categories, and brands.
                            </p>
                        </div>
                    )}

                    {/* State 2: Loading State */}
                    {isSearching && searchResults.length === 0 && (
                        <div className="py-8 px-4 space-y-2.5">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A]/80 animate-pulse"
                                >
                                    <div className="size-10 rounded-lg bg-[#262626]" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-4 w-48 bg-[#2A2A2A] rounded" />
                                        <div className="h-3 w-64 bg-[#202020] rounded" />
                                    </div>
                                    <div className="h-5 w-16 bg-[#262626] rounded-md" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* State 3: Empty Results */}
                    {!isSearching &&
                        debouncedQuery.length >= 2 &&
                        searchResults.length === 0 && (
                            <div className="py-12 px-6 text-center space-y-2">
                                <div className="size-11 rounded-full bg-[#201515] border border-[#3D2020] flex items-center justify-center mx-auto text-[#EF4444]">
                                    <X className="size-5" />
                                </div>
                                <h3 className="text-sm font-semibold text-[#E5E5E5]">
                                    No results found for "{debouncedQuery}"
                                </h3>
                                <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
                                    Check your spelling or try searching by order
                                    number, customer email, product name, or phone number.
                                </p>
                            </div>
                        )}

                    {/* State 4: Results Rendered */}
                    {searchResults.map((item, idx) => {
                        const { label, badgeClass, icon } = renderTypeDetails(
                            item.searchType,
                        );
                        const isSelected = selectedIndex === idx;

                        return (
                            <button
                                key={`${item.searchType}-${item.id}-${idx}`}
                                type="button"
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={cn(
                                    "w-full flex items-center gap-3.5 p-3 rounded-xl transition-all text-left cursor-pointer group",
                                    isSelected
                                        ? "bg-[#252525] border border-[#D4AF37]/40 shadow-xs"
                                        : "hover:bg-[#1D1D1D] border border-transparent",
                                )}
                            >
                                {/* Thumbnail or Entity Icon */}
                                <div className="size-10 rounded-lg bg-[#1F1F1F] border border-[#2C2C2C] flex items-center justify-center overflow-hidden shrink-0">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="size-full object-cover"
                                            onError={(e) => {
                                                // Fallback to icon on broken image
                                                (e.target as HTMLElement).style.display =
                                                    "none";
                                            }}
                                        />
                                    ) : (
                                        icon
                                    )}
                                </div>

                                {/* Title & Subtitle */}
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-semibold text-[#F5F5F5] truncate group-hover:text-white">
                                            {item.title}
                                        </span>
                                    </div>
                                    {item.subtitle && (
                                        <p className="text-[11px] sm:text-xs text-[#888888] truncate mt-0.5">
                                            {item.subtitle}
                                        </p>
                                    )}
                                </div>

                                {/* Right Side: Entity Badge & Arrow */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span
                                        className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                                            badgeClass,
                                        )}
                                    >
                                        {label}
                                    </span>
                                    <ArrowRight
                                        className={cn(
                                            "size-3.5 transition-transform",
                                            isSelected
                                                ? "text-[#D4AF37] translate-x-0.5"
                                                : "text-[#555555] group-hover:text-[#888888]",
                                        )}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Modal Footer with Keyboard Shortcuts */}
                <div className="px-4 py-2.5 border-t border-[#222222] bg-[#161616] flex items-center justify-between text-[11px] text-[#737373]">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-[#222222] border border-[#333] text-[10px] font-mono text-[#AAA]">
                                ↑↓
                            </kbd>{" "}
                            navigate
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-[#222222] border border-[#333] text-[10px] font-mono text-[#AAA]">
                                ↵
                            </kbd>{" "}
                            open
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <span>Press</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[#222222] border border-[#333] text-[10px] font-mono text-[#AAA]">
                            ESC
                        </kbd>
                        <span>to close</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSearchModal;
