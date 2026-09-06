import React, { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pen, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomConfirmModal } from "@/components/common/CustomConfirmModal";
import { cn } from "@/lib/utils";
import { useGetAdminBrands } from "@/service/queries";
import {
    useCreateBrand,
    useUpdateBrand,
    useDeleteBrand,
} from "@/service/mutations";
import type { Brand } from "@/service/types";

const SORT_OPTIONS = [
    { label: "Sort By: A-Z", value: "az" },
    { label: "Sort By: Z-A", value: "za" },
    { label: "Sort By: Newest", value: "newest" },
    { label: "Sort By: Most Products", value: "products" },
];

// Helper to format ISO date
const formatBrandDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

// Crown Icon matching screenshot design
const CrownIcon = ({ className }: { className?: string }) => (
    <svg
        className={cn("size-5 text-[#171717]", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.203a4 4 0 0 1-3.86 2.928H8.713a4 4 0 0 1-3.86-2.928L2.019 6.019a.5.5 0 0 1 .798-.519l4.277 3.664a1 1 0 0 0 1.516-.294z" />
        <path d="M5 21h14" />
    </svg>
);

// Empty State Open Box Illustration matching screenshot 1
const EmptyBoxIllustration = () => (
    <div className="relative size-40 flex items-center justify-center mx-auto mb-2">
        {/* Soft yellow blob backdrop */}
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-sm opacity-90" />

        {/* Sparkle rays */}
        <div className="absolute top-2 flex items-center justify-center gap-1.5 z-10">
            <span className="w-1 h-3.5 bg-[#D4AF37] rounded-full rotate-[-25deg]" />
            <span className="w-1 h-4 bg-[#D4AF37] rounded-full" />
            <span className="w-1 h-3.5 bg-[#D4AF37] rounded-full rotate-[25deg]" />
        </div>

        {/* 3D open box SVG */}
        <svg viewBox="0 0 120 100" className="size-28 z-10 drop-shadow-xs">
            {/* Box main front body */}
            <rect x="25" y="42" width="70" height="50" rx="3" fill="#E8C87A" />
            <rect x="25" y="42" width="35" height="50" fill="#DEC072" />
            {/* Left flap */}
            <polygon points="25,42 10,25 35,28 45,42" fill="#D3B05C" />
            {/* Right flap */}
            <polygon points="95,42 110,25 85,28 75,42" fill="#D3B05C" />
            {/* Back opening */}
            <polygon points="25,42 45,30 75,30 95,42" fill="#BE9C48" />
            {/* Front flap shadow */}
            <polygon points="25,42 35,52 60,42" fill="#E8C87A" opacity="0.3" />
        </svg>
    </div>
);

export const AdminBrands: React.FC = () => {
    // React Query API hooks
    const {
        data: brandsResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetAdminBrands();

    const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
    const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
    const { mutate: deleteBrand, isPending: isDeleting } = useDeleteBrand();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("az");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form field state
    const [brandNameInput, setBrandNameInput] = useState("");
    const [brandDescInput, setBrandDescInput] = useState("");

    // Normalized brands from API
    const brands: Brand[] = useMemo(() => {
        const raw =
            brandsResponse?.data?.brands ||
            (Array.isArray(brandsResponse?.data) ? brandsResponse.data : []);
        return raw;
    }, [brandsResponse]);

    // Filtered & Sorted brands
    const filteredBrands = useMemo(() => {
        return brands
            .filter((brand) => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                const nameMatch = brand.name?.toLowerCase().includes(term);
                const descMatch = brand.description?.toLowerCase().includes(term);
                return nameMatch || descMatch;
            })
            .sort((a, b) => {
                if (sortBy === "az") return a.name.localeCompare(b.name);
                if (sortBy === "za") return b.name.localeCompare(a.name);
                if (sortBy === "products") {
                    const countA = (a as any).productCount ?? 0;
                    const countB = (b as any).productCount ?? 0;
                    return countB - countA;
                }
                if (sortBy === "newest") {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                }
                return 0;
            });
    }, [brands, searchTerm, sortBy]);

    // Handle Create Brand
    const handleCreateBrand = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = brandNameInput.trim();
        if (!trimmed) {
            toast.error("Please enter a valid brand name");
            return;
        }

        createBrand(
            {
                name: trimmed,
                description: brandDescInput.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setBrandNameInput("");
                    setBrandDescInput("");
                },
            },
        );
    };

    // Open Edit Modal
    const handleOpenEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setBrandNameInput(brand.name);
        setBrandDescInput(brand.description || "");
    };

    // Handle Edit Brand
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = brandNameInput.trim();
        if (!trimmed || !editingBrand) {
            toast.error("Please enter a brand name");
            return;
        }

        const brandId = editingBrand.brandId || (editingBrand as any).id;
        updateBrand(
            {
                brandId,
                payload: {
                    name: trimmed,
                    description: brandDescInput.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setEditingBrand(null);
                    setBrandNameInput("");
                    setBrandDescInput("");
                },
            },
        );
    };

    // Handle Delete Brand
    const handleConfirmDelete = () => {
        if (!brandToDelete) return;
        const brandId = brandToDelete.brandId || (brandToDelete as any).id;
        deleteBrand(brandId, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setBrandToDelete(null);
            },
        });
    };

    const hasBrands = brands.length > 0;

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#171717] font-semibold">Brands</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Brands
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage your store brands
                    </p>
                </div>

                {/* Add Brand Button (Header) - shown when brands exist */}
                {hasBrands && (
                    <button
                        type="button"
                        onClick={() => {
                            setBrandNameInput("");
                            setBrandDescInput("");
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                        <span>Add Brand</span>
                        <Plus className="size-4 text-white" />
                    </button>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search brands...."
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

            {/* Main Content Area: Loading Skeleton, Error State, Empty State, or Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-xs flex items-center justify-between animate-pulse"
                        >
                            <div className="flex items-center gap-3.5 w-full">
                                <div className="size-12 rounded-full bg-[#F0EBE0]/60 shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : isError ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-red-100 rounded-2xl p-8">
                    <p className="text-sm font-semibold text-red-600 mb-1">
                        Failed to load brands
                    </p>
                    <p className="text-xs text-[#737373] mb-4 max-w-sm">
                        {(error as any)?.response?.data?.message ||
                            (error as any)?.message ||
                            "An error occurred while communicating with the server."}
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
            ) : !hasBrands || filteredBrands.length === 0 ? (
                /* Empty State */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptyBoxIllustration />
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] mt-3">
                        {searchTerm
                            ? "No brands match your search"
                            : "No brands added yet"}
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            if (searchTerm) {
                                setSearchTerm("");
                            } else {
                                setBrandNameInput("");
                                setBrandDescInput("");
                                setIsAddModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer mt-4"
                    >
                        {searchTerm ? (
                            <span>Clear Search</span>
                        ) : (
                            <>
                                <span>Add Brands</span>
                                <Plus className="size-4 text-white" />
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* Brands 3-Column Grid */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredBrands.map((brand) => {
                            const brandId =
                                brand.brandId || (brand as any).id;
                            const productCount =
                                (brand as any).productCount ??
                                (brand as any).productsCount ??
                                0;

                            return (
                                <div
                                    key={brandId}
                                    className="bg-white border border-[#EAEAEA] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all group"
                                >
                                    {/* Left Side: Crown Icon + Text info */}
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center shrink-0">
                                            <CrownIcon />
                                        </div>
                                        <div className="truncate">
                                            <h3 className="text-base font-bold text-[#171717] truncate">
                                                {brand.name}
                                            </h3>
                                            <p className="text-xs font-bold text-[#D4AF37] mt-0.5">
                                                {productCount} Products
                                            </p>
                                            <p className="text-[11px] text-[#888888] mt-0.5">
                                                Created on{" "}
                                                {formatBrandDate(brand.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Side: Edit & Delete Action Buttons */}
                                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(brand)}
                                            className="size-8 rounded-full flex items-center justify-center text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                                            title="Edit Brand"
                                        >
                                            <Pen className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setBrandToDelete(brand);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="size-8 rounded-full flex items-center justify-center text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Delete Brand"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Count Indicator */}
                    <div className="text-xs text-[#737373] font-medium pt-2">
                        Showing {filteredBrands.length} of {brands.length} Brands
                    </div>
                </div>
            )}

            {/* Add Brand Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[25rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Crown Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                            <CrownIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Add Brand
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Create a new brand for organising products in your store.
                        </p>

                        <form onSubmit={handleCreateBrand} className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={brandNameInput}
                                    onChange={(e) => setBrandNameInput(e.target.value)}
                                    placeholder="Enter Brand Name"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={brandDescInput}
                                    onChange={(e) => setBrandDescInput(e.target.value)}
                                    placeholder="Enter brand description"
                                    className="w-full px-4 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    disabled={isCreating}
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setBrandNameInput("");
                                        setBrandDescInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add Brand</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Brand Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[25rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Crown Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                            <CrownIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Edit Brand
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Edit brand details
                        </p>

                        <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Brand Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={brandNameInput}
                                    onChange={(e) => setBrandNameInput(e.target.value)}
                                    placeholder="Enter Brand Name"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={brandDescInput}
                                    onChange={(e) => setBrandDescInput(e.target.value)}
                                    placeholder="Enter brand description"
                                    className="w-full px-4 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => {
                                        setEditingBrand(null);
                                        setBrandNameInput("");
                                        setBrandDescInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>Save Changes</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Brand Modal */}
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setBrandToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Brand?"
                description={
                    <>
                        The action will remove{" "}
                        <span className="font-semibold text-[#171717]">
                            {brandToDelete?.name}
                        </span>{" "}
                        from your brands.
                    </>
                }
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminBrands;
