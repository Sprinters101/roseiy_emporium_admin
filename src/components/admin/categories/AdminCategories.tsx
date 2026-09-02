import React, { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomConfirmModal } from "@/components/common/CustomConfirmModal";
import { cn } from "@/lib/utils";

export interface CategoryItem {
    id: string;
    name: string;
    productCount: number;
    createdAt: string;
}

const initialCategoriesData: CategoryItem[] = [
    { id: "1", name: "Champagne", productCount: 48, createdAt: "27 July 2026" },
    { id: "2", name: "Sweetwine", productCount: 48, createdAt: "27 July 2026" },
    { id: "3", name: "Whiskey", productCount: 48, createdAt: "27 July 2026" },
    { id: "4", name: "Cognac", productCount: 48, createdAt: "27 July 2026" },
    { id: "5", name: "Tequila", productCount: 48, createdAt: "27 July 2026" },
    { id: "6", name: "Rum", productCount: 48, createdAt: "27 July 2026" },
    { id: "7", name: "Gin", productCount: 48, createdAt: "27 July 2026" },
    { id: "8", name: "Drink Accessories", productCount: 48, createdAt: "27 July 2026" },
];

const SORT_OPTIONS = [
    { label: "Sort By: A-Z", value: "az" },
    { label: "Sort By: Z-A", value: "za" },
    { label: "Sort By: Newest", value: "newest" },
    { label: "Sort By: Most Products", value: "products" },
];

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
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategoriesData);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("az");

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form field state
    const [categoryNameInput, setCategoryNameInput] = useState("");

    // Filtered & Sorted categories
    const filteredCategories = useMemo(() => {
        return categories
            .filter((cat) =>
                cat.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
            )
            .sort((a, b) => {
                if (sortBy === "az") return a.name.localeCompare(b.name);
                if (sortBy === "za") return b.name.localeCompare(a.name);
                if (sortBy === "products") return b.productCount - a.productCount;
                if (sortBy === "newest") return Number(b.id) - Number(a.id);
                return 0;
            });
    }, [categories, searchTerm, sortBy]);

    // Handle Create Category
    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryNameInput.trim()) {
            toast.error("Please enter a valid category name");
            return;
        }

        const newCategory: CategoryItem = {
            id: String(Date.now()),
            name: categoryNameInput.trim(),
            productCount: 0,
            createdAt: `${new Date().getDate()} ${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getFullYear()}`,
        };

        setCategories((prev) => [...prev, newCategory]);
        toast.success(`Category "${newCategory.name}" created`);
        setIsAddModalOpen(false);
        setCategoryNameInput("");
    };

    // Handle Edit Category
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoryNameInput.trim() || !editingCategory) {
            toast.error("Please enter a category name");
            return;
        }

        setCategories((prev) =>
            prev.map((cat) =>
                cat.id === editingCategory.id
                    ? { ...cat, name: categoryNameInput.trim() }
                    : cat,
            ),
        );

        toast.success(`Category updated to "${categoryNameInput.trim()}"`);
        setEditingCategory(null);
        setCategoryNameInput("");
    };

    // Handle Delete Category
    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
        toast.success(`Category "${categoryToDelete.name}" deleted`);
        setIsDeleteModalOpen(false);
        setCategoryToDelete(null);
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
                        <span className="text-[#171717] font-semibold">Categories</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Categories
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage your product category
                    </p>
                </div>

                {/* Add Category Button (Header) - shown when categories exist */}
                {hasCategories && (
                    <button
                        type="button"
                        onClick={() => {
                            setCategoryNameInput("");
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

            {/* Main Content Area: Categories Grid OR Empty State */}
            {!hasCategories || filteredCategories.length === 0 ? (
                /* Empty State (Screenshot 1) */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptyBoxIllustration />
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] mt-3">
                        No categories added yet
                    </h3>
                    <button
                        type="button"
                        onClick={() => {
                            setCategoryNameInput("");
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer mt-4"
                    >
                        <span>Add Category</span>
                        <Plus className="size-4 text-white" />
                    </button>
                </div>
            ) : (
                /* Categories 3-Column Grid (Screenshot 2) */
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredCategories.map((category) => (
                            <div
                                key={category.id}
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
                                            {category.productCount} Products
                                        </p>
                                        <p className="text-[11px] text-[#888888] mt-0.5">
                                            Created on {category.createdAt}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Side: Edit & Delete Action Buttons */}
                                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setCategoryNameInput(category.name);
                                        }}
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
                        ))}
                    </div>

                    {/* Bottom Count Indicator */}
                    <div className="text-xs text-[#737373] font-medium pt-2">
                        Showing {filteredCategories.length} of {categories.length} Categories
                    </div>
                </div>
            )}

            {/* Add Category Modal (Screenshot 3) */}
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
                            Create a new category for organising products in your store.
                        </p>

                        <form onSubmit={handleCreateCategory} className="space-y-5 text-left">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={categoryNameInput}
                                    onChange={(e) => setCategoryNameInput(e.target.value)}
                                    placeholder="Enter Category Name"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setCategoryNameInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                                >
                                    Add Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal (Screenshot 4) */}
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

                        <form onSubmit={handleSaveEdit} className="space-y-5 text-left">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={categoryNameInput}
                                    onChange={(e) => setCategoryNameInput(e.target.value)}
                                    placeholder="Enter Category Name"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setCategoryNameInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Category Modal (Screenshot 5) */}
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
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
