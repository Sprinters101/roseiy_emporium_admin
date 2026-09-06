import React, { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pen, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomConfirmModal } from "@/components/common/CustomConfirmModal";
import { cn } from "@/lib/utils";
import { useGetAdminCategories } from "@/service/queries";
import {
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
} from "@/service/mutations";
import type { Category } from "@/service/types";

const SORT_OPTIONS = [
    { label: "Sort By: A-Z", value: "az" },
    { label: "Sort By: Z-A", value: "za" },
    { label: "Sort By: Newest", value: "newest" },
    { label: "Sort By: Most Products", value: "products" },
];

// Helper to format ISO date
const formatCategoryDate = (dateStr?: string) => {
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

// Shopping Basket Icon matching screenshot design
const BasketIcon = ({ className }: { className?: string }) => (
    <svg
        className={cn("size-5 text-[#171717]", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m5 11 4-7" />
        <path d="m19 11-4-7" />
        <path d="M2 11h20" />
        <path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.6-7.4" />
        <path d="M9 11v9" />
        <path d="M15 11v9" />
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

export const AdminCategories: React.FC = () => {
    // React Query API hooks
    const {
        data: categoriesResponse,
        isLoading,
        isError,
        error,
        refetch,
    } = useGetAdminCategories();

    const { mutate: createCategory, isPending: isCreating } =
        useCreateCategory();
    const { mutate: updateCategory, isPending: isUpdating } =
        useUpdateCategory();
    const { mutate: deleteCategory, isPending: isDeleting } =
        useDeleteCategory();

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("az");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
        null,
    );
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form field state
    const [categoryNameInput, setCategoryNameInput] = useState("");
    const [categoryDescInput, setCategoryDescInput] = useState("");

    // Normalized categories from API
    const categories: Category[] = useMemo(() => {
        const raw =
            categoriesResponse?.data?.categories ||
            (Array.isArray(categoriesResponse?.data)
                ? categoriesResponse.data
                : []);
        return raw;
    }, [categoriesResponse]);

    // Filtered & Sorted categories
    const filteredCategories = useMemo(() => {
        return categories
            .filter((cat) => {
                const term = searchTerm.trim().toLowerCase();
                if (!term) return true;
                const nameMatch = cat.name?.toLowerCase().includes(term);
                const descMatch = cat.description?.toLowerCase().includes(term);
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
                    const timeA = a.createdAt
                        ? new Date(a.createdAt).getTime()
                        : 0;
                    const timeB = b.createdAt
                        ? new Date(b.createdAt).getTime()
                        : 0;
                    return timeB - timeA;
                }
                return 0;
            });
    }, [categories, searchTerm, sortBy]);

    // Handle Create Category
    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = categoryNameInput.trim();
        if (!trimmed) {
            toast.error("Please enter a valid category name");
            return;
        }

        createCategory(
            {
                name: trimmed,
                description: categoryDescInput.trim() || undefined,
            },
            {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setCategoryNameInput("");
                    setCategoryDescInput("");
                },
            },
        );
    };

    // Open Edit Modal
    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setCategoryNameInput(category.name);
        setCategoryDescInput(category.description || "");
    };

    // Handle Edit Category
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = categoryNameInput.trim();
        if (!trimmed || !editingCategory) {
            toast.error("Please enter a category name");
            return;
        }

        const categoryId =
            editingCategory.categoryId || (editingCategory as any).id;
        updateCategory(
            {
                categoryId,
                payload: {
                    name: trimmed,
                    description: categoryDescInput.trim() || undefined,
                },
            },
            {
                onSuccess: () => {
                    setEditingCategory(null);
                    setCategoryNameInput("");
                    setCategoryDescInput("");
                },
            },
        );
    };

    // Handle Delete Category
    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        const categoryId =
            categoryToDelete.categoryId || (categoryToDelete as any).id;
        deleteCategory(categoryId, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
            },
        });
    };

    const hasCategories = categories.length > 0;

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#171717] font-semibold">
                            Categories
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Categories
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage your product categories
                    </p>
                </div>

                {/* Add Category Button (Header) - shown when categories exist */}
                {hasCategories && (
                    <button
                        type="button"
                        onClick={() => {
                            setCategoryNameInput("");
                            setCategoryDescInput("");
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                        <span>Add Category</span>
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
                        placeholder="Search category...."
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
                        Failed to load categories
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
            ) : !hasCategories || filteredCategories.length === 0 ? (
                /* Empty State */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptyBoxIllustration />
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] mt-3">
                        {searchTerm
                            ? "No categories match your search"
                            : "No categories added yet"}
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            if (searchTerm) {
                                setSearchTerm("");
                            } else {
                                setCategoryNameInput("");
                                setCategoryDescInput("");
                                setIsAddModalOpen(true);
                            }
                        }}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer mt-4"
                    >
                        {searchTerm ? (
                            <span>Clear Search</span>
                        ) : (
                            <>
                                <span>Add Category</span>
                                <Plus className="size-4 text-white" />
                            </>
                        )}
                    </button>
                </div>
            ) : (
                /* Categories 3-Column Grid */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCategories.map((category) => {
                            const categoryId =
                                category.categoryId || (category as any).id;
                            const productCount =
                                (category as any).productCount ??
                                (category as any).productsCount ??
                                0;

                            return (
                                <div
                                    key={categoryId}
                                    className="bg-white border border-[#EAEAEA] hover:border-[#D4AF37]/50 rounded-2xl p-5 shadow-xs flex items-center justify-between transition-all group"
                                >
                                    {/* Left Side: Basket Icon + Text info */}
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="size-12 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center shrink-0">
                                            <BasketIcon />
                                        </div>
                                        <div className="truncate">
                                            <h3 className="text-base font-bold text-[#171717] truncate">
                                                {category.name}
                                            </h3>
                                            <p className="text-xs font-bold text-[#D4AF37] mt-0.5">
                                                {productCount} Products
                                            </p>
                                            <p className="text-[11px] text-[#888888] mt-0.5">
                                                Created on{" "}
                                                {formatCategoryDate(
                                                    category.createdAt,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Side: Edit & Delete Action Buttons */}
                                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenEdit(category)
                                            }
                                            className="size-8 rounded-full flex items-center justify-center text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                                            title="Edit Category"
                                        >
                                            <Pen className="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCategoryToDelete(category);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="size-8 rounded-full flex items-center justify-center text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
                                            title="Delete Category"
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
                        Showing {filteredCategories.length} of{" "}
                        {categories.length} Categories
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[25rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Basket Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                            <BasketIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Add Category
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Create a new category for organising products in
                            your store.
                        </p>

                        <form
                            onSubmit={handleCreateCategory}
                            className="space-y-4 text-left"
                        >
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={categoryNameInput}
                                    onChange={(e) =>
                                        setCategoryNameInput(e.target.value)
                                    }
                                    placeholder="Enter Category Name"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={categoryDescInput}
                                    onChange={(e) =>
                                        setCategoryDescInput(e.target.value)
                                    }
                                    placeholder="Enter category description"
                                    className="w-full px-4 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    disabled={isCreating}
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setCategoryNameInput("");
                                        setCategoryDescInput("");
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
                                        <span>Add Category</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[25rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Basket Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] flex items-center justify-center mx-auto mb-4">
                            <BasketIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Edit Category
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Edit category details
                        </p>

                        <form
                            onSubmit={handleSaveEdit}
                            className="space-y-4 text-left"
                        >
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={categoryNameInput}
                                    onChange={(e) =>
                                        setCategoryNameInput(e.target.value)
                                    }
                                    placeholder="Enter Category Name"
                                    className="w-full px-4 py-2.5 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={categoryDescInput}
                                    onChange={(e) =>
                                        setCategoryDescInput(e.target.value)
                                    }
                                    placeholder="Enter category description"
                                    className="w-full px-4 py-2 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setCategoryNameInput("");
                                        setCategoryDescInput("");
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

            {/* Delete Category Modal */}
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
                isLoading={isDeleting}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Category?"
                description={
                    <>
                        The action will remove{" "}
                        <span className="font-semibold text-[#171717]">
                            {categoryToDelete?.name}
                        </span>{" "}
                        from your categories.
                    </>
                }
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminCategories;
