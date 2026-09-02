import React, { useState, useMemo } from "react";
import { Plus, Search, Trash2, Pen, RotateCcw, X, Check, Minus } from "lucide-react";
import { useNavigate } from "react-router";
import { products as initialProducts } from "@/lib/site_data";
import type { Product } from "@/config/types";
import { toast } from "@/components/ui/sonner";
import { CustomTable, type Column } from "@/components/common/CustomTable";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomConfirmModal } from "@/components/common/CustomConfirmModal";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
    { label: "All Categories", value: "all" },
    { label: "Whiskey", value: "Whiskey" },
    { label: "Cognac", value: "Cognac" },
    { label: "Tequila", value: "Tequila" },
    { label: "Champagne", value: "Champagne" },
    { label: "Bottled Water", value: "Bottled Water" },
    { label: "Gin", value: "Gin" },
    { label: "Sweetwine", value: "Sweetwine" },
];

const BRAND_OPTIONS = [
    { label: "All Brands", value: "all" },
    { label: "Don Julio", value: "Don Julio" },
    { label: "Bacardi", value: "Bacardi" },
    { label: "Moet & Chandon", value: "Moet & Chandon" },
    { label: "Hennessy", value: "Hennessy" },
    { label: "Azul", value: "Azul" },
    { label: "Glenfiddich", value: "Glenfiddich" },
    { label: "Voss", value: "Voss" },
    { label: "Bombay", value: "Bombay" },
    { label: "Four Cousins", value: "Four Cousins" },
];

const SORT_OPTIONS = [
    { label: "Sort By: Newest", value: "newest" },
    { label: "Sort By: Default", value: "default" },
    { label: "Arrivals", value: "arrivals" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
];

// Document Format Badges / Icons matching screenshot
const CsvIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#EAF7EE" />
        <path d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" fill="#34A853" />
        <path d="M11.5 4v3.5H15" fill="#A8DAB5" />
        <rect x="6.5" y="10" width="7" height="4.5" rx="0.5" fill="white" fillOpacity="0.9" />
        <path d="M6.5 12.2h7M10 10v4.5" stroke="#34A853" strokeWidth="0.8" />
    </svg>
);

const DocIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#EBF3FD" />
        <path d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" fill="#2563EB" />
        <path d="M11.5 4v3.5H15" fill="#93C5FD" />
        <path d="M7 10.5h6M7 13h4" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
);

const PdfIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#FDF0F0" />
        <path d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" fill="#DC2626" />
        <path d="M11.5 4v3.5H15" fill="#FCA5A5" />
        <text x="6" y="13.5" fill="white" fontSize="4.5" fontWeight="bold" fontFamily="sans-serif">
            PDF
        </text>
    </svg>
);

export const AdminProducts: React.FC = () => {
    const navigate = useNavigate();
    const [productList, setProductList] = useState<Product[]>(initialProducts);
    const [deletedProducts, setDeletedProducts] = useState<Product[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedBrand, setSelectedBrand] = useState("all");
    const [selectedSort, setSelectedSort] = useState("newest");
    const [statusTab, setStatusTab] = useState<"all" | "available" | "outofstock">("all");

    // Modals
    const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

    // Counts for status pills
    const totalCount = productList.length;
    const availableCount = productList.filter((p) => {
        if (p.status) return p.status === "Available";
        return (p.piecesLeft ?? 0) > 0 || (p.casesLeft ?? 0) > 0;
    }).length;
    const outOfStockCount = productList.filter((p) => {
        if (p.status) return p.status === "Out of Stock";
        return (p.piecesLeft ?? 0) <= 0 && (p.casesLeft ?? 0) <= 0;
    }).length;

    // Filter & Sort logic
    const filteredProducts = useMemo(() => {
        return productList
            .filter((product) => {
                // Search
                const matchesSearch =
                    searchTerm.trim() === "" ||
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase());

                // Category dropdown
                const matchesCategory =
                    selectedCategory === "all" ||
                    product.category.toLowerCase() === selectedCategory.toLowerCase();

                // Brand dropdown
                const matchesBrand =
                    selectedBrand === "all" ||
                    product.brand?.toLowerCase() === selectedBrand.toLowerCase();

                // Status logic from status pill tab
                const isAvailable =
                    product.status === "Available" ||
                    (!product.status &&
                        ((product.piecesLeft ?? 0) > 0 || (product.casesLeft ?? 0) > 0));

                let matchesStatus = true;
                if (statusTab === "available") {
                    matchesStatus = isAvailable;
                } else if (statusTab === "outofstock") {
                    matchesStatus = !isAvailable;
                }

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesBrand &&
                    matchesStatus
                );
            })
            .sort((a, b) => {
                if (selectedSort === "price_asc") return a.price - b.price;
                if (selectedSort === "price_desc") return b.price - a.price;
                if (selectedSort === "newest" || selectedSort === "arrivals") {
                    return Number(b.id) - Number(a.id);
                }
                return 0;
            });
    }, [
        productList,
        searchTerm,
        selectedCategory,
        selectedBrand,
        statusTab,
        selectedSort,
    ]);

    // Selection handlers
    const allSelected =
        filteredProducts.length > 0 &&
        filteredProducts.every((p) => selectedIds.includes(p.id));
    const someSelected =
        filteredProducts.some((p) => selectedIds.includes(p.id)) && !allSelected;

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map((p) => p.id));
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    // Selected items collection for batch operations
    const selectedProducts = useMemo(() => {
        return productList.filter((p) => selectedIds.includes(p.id));
    }, [productList, selectedIds]);

    // Single item delete
    const handleConfirmSingleDelete = () => {
        if (!productToDelete) return;
        const target = productToDelete;
        setProductList((prev) => prev.filter((p) => p.id !== target.id));
        setDeletedProducts((prev) => [target, ...prev]);
        setSelectedIds((prev) => prev.filter((id) => id !== target.id));
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        toast.success(`"${target.name}" moved to Recycle Bin`);
    };

    // Batch delete
    const handleConfirmBatchDelete = () => {
        if (selectedIds.length === 0) return;
        const targets = productList.filter((p) => selectedIds.includes(p.id));
        setProductList((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
        setDeletedProducts((prev) => [...targets, ...prev]);
        setSelectedIds([]);
        setIsBatchDeleteModalOpen(false);
        toast.success(`${targets.length} products moved to Recycle Bin`);
    };

    // Batch Export: CSV
    const handleExportCSV = () => {
        const itemsToExport =
            selectedProducts.length > 0 ? selectedProducts : filteredProducts;

        if (itemsToExport.length === 0) {
            toast.error("No products available to export");
            return;
        }

        const headers = [
            "Product Name",
            "Category",
            "Brand",
            "Price (NGN)",
            "Pieces Stock",
            "Cases Stock",
            "Status",
        ];
        const rows = itemsToExport.map((p) => [
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category}"`,
            `"${p.brand || ""}"`,
            p.price,
            p.piecesLeft ?? 0,
            p.casesLeft ?? 0,
            `"${p.status || "Available"}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,\ufeff" +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `products_export_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${itemsToExport.length} products to CSV`);
    };

    // Batch Export: DOC
    const handleExportDOC = () => {
        const itemsToExport =
            selectedProducts.length > 0 ? selectedProducts : filteredProducts;

        if (itemsToExport.length === 0) {
            toast.error("No products available to export");
            return;
        }

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Products Catalogue</title>
            <style>
                body { font-family: Calibri, Arial, sans-serif; margin: 20px; }
                h1 { color: #171717; font-size: 20pt; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th { background-color: #FAF7F2; color: #171717; font-weight: bold; padding: 10px; border: 1px solid #E5E5E5; text-align: left; }
                td { padding: 8px 10px; border: 1px solid #E5E5E5; font-size: 10.5pt; }
                .status-avail { color: #16A34A; font-weight: bold; }
                .status-out { color: #EF4444; font-weight: bold; }
            </style>
            </head>
            <body>
                <h1>Roseiy Emporium - Products Catalogue</h1>
                <p>Export Date: ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsToExport
                            .map(
                                (p) => `
                            <tr>
                                <td><strong>${p.name}</strong></td>
                                <td>${p.category}</td>
                                <td>${p.brand || "—"}</td>
                                <td>₦${p.price.toLocaleString("en-NG")}</td>
                                <td>${p.piecesLeft ?? 0} Pieces • ${p.casesLeft ?? 0} Cases</td>
                                <td class="${(p.status || "Available") === "Available" ? "status-avail" : "status-out"}">
                                    ${p.status || "Available"}
                                </td>
                            </tr>
                        `,
                            )
                            .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob(["\ufeff" + htmlContent], {
            type: "application/msword",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `products_catalogue_${new Date().toISOString().slice(0, 10)}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${itemsToExport.length} products to DOC`);
    };

    // Batch Export: PDF
    const handleExportPDF = () => {
        const itemsToExport =
            selectedProducts.length > 0 ? selectedProducts : filteredProducts;

        if (itemsToExport.length === 0) {
            toast.error("No products available to export");
            return;
        }

        window.print();
        toast.info(`Preparing print / PDF for ${itemsToExport.length} products`);
    };

    // Restore from Recycle Bin
    const handleRestore = (product: Product) => {
        setDeletedProducts((prev) => prev.filter((p) => p.id !== product.id));
        setProductList((prev) => [product, ...prev]);
        toast.success(`"${product.name}" restored to catalog`);
    };

    // Permanently remove from Recycle Bin
    const handlePermanentDelete = (id: string) => {
        setDeletedProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Product permanently deleted");
    };

    // Columns Definition for CustomTable
    const columns: Column<Product>[] = [
        {
            key: "selection",
            header: (
                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className={cn(
                            "size-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer",
                            allSelected
                                ? "bg-[#171717] border-[#171717] text-white"
                                : someSelected
                                ? "bg-[#171717] border-[#171717] text-white"
                                : "bg-white border-[#D5D5D5] hover:border-[#999999]",
                        )}
                        aria-label="Select all"
                    >
                        {allSelected && (
                            <Check className="size-3 text-white" strokeWidth={3} />
                        )}
                        {someSelected && (
                            <Minus className="size-3 text-white" strokeWidth={3} />
                        )}
                    </button>
                </div>
            ),
            className: "w-12 text-center",
            headerClassName: "w-12 text-center",
            render: (_, product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSelect(product.id);
                            }}
                            className={cn(
                                "size-4.5 rounded-md border flex items-center justify-center transition-colors cursor-pointer",
                                isSelected
                                    ? "bg-[#171717] border-[#171717] text-white"
                                    : "bg-white border-[#D5D5D5] hover:border-[#999999]",
                            )}
                            aria-label={`Select ${product.name}`}
                        >
                            {isSelected && (
                                <Check className="size-3 text-white" strokeWidth={3} />
                            )}
                        </button>
                    </div>
                );
            },
        },
        {
            key: "productName",
            header: "Product Name",
            render: (_, product) => (
                <div className="flex items-center gap-3.5 min-w-48">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="size-11 sm:size-12 rounded-lg object-contain bg-[#FAF7F2] border border-[#F0F0F0] p-1 shrink-0"
                    />
                    <span className="text-sm font-normal text-[#171717] truncate">
                        {product.name}
                    </span>
                </div>
            ),
        },
        {
            key: "category",
            header: "Category",
            render: (_, product) => (
                <span className="text-sm text-[#171717]">
                    {product.category}
                </span>
            ),
        },
        {
            key: "brand",
            header: "Brand",
            render: (_, product) => (
                <span className="text-sm text-[#171717]">
                    {product.brand || "—"}
                </span>
            ),
        },
        {
            key: "price",
            header: "Price",
            render: (_, product) => (
                <span className="text-sm text-[#171717]">
                    ₦{product.price.toLocaleString("en-NG")}
                </span>
            ),
        },
        {
            key: "stock",
            header: "Stock",
            render: (_, product) => {
                const pieces = product.piecesLeft ?? 0;
                const cases = product.casesLeft ?? 0;

                if (pieces > 0 && cases > 0) {
                    return (
                        <div className="flex items-center gap-1.5 text-sm text-[#171717]">
                            <span>{pieces} Pieces</span>
                            <span className="text-[#D4AF37] text-xs">●</span>
                            <span>{cases} Cases</span>
                        </div>
                    );
                }
                if (cases > 0 && pieces === 0) {
                    return (
                        <div className="flex items-center gap-1.5 text-sm text-[#171717]">
                            <span>0 Pieces</span>
                            <span className="text-[#D4AF37] text-xs">●</span>
                            <span>{cases} Cases</span>
                        </div>
                    );
                }
                if (pieces === 0 && cases === 0) {
                    return (
                        <div className="flex items-center gap-1.5 text-sm text-[#171717]">
                            <span>0 Pieces</span>
                            <span className="text-[#D4AF37] text-xs">●</span>
                            <span>0 Cases</span>
                        </div>
                    );
                }
                if (pieces > 0 && cases === 0) {
                    return (
                        <span className="text-sm text-[#171717]">
                            {pieces} {pieces === 1 ? "Piece" : "Pieces"}
                        </span>
                    );
                }
                return (
                    <span className="text-sm text-[#171717]">
                        0 Pieces
                    </span>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            render: (_, product) => {
                const isAvailable =
                    product.status === "Available" ||
                    (!product.status &&
                        ((product.piecesLeft ?? 0) > 0 ||
                            (product.casesLeft ?? 0) > 0));

                return (
                    <span
                        className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold text-center inline-block",
                            isAvailable
                                ? "bg-[#EAF7EE] text-[#16A34A]"
                                : "bg-[#FDF0F0] text-[#EF4444]",
                        )}
                    >
                        {isAvailable ? "Available" : "Out of Stock"}
                    </span>
                );
            },
        },
        {
            key: "action",
            header: "Action",
            className: "text-right",
            headerClassName: "text-right",
            render: (_, product) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                        className="text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                        title="Edit product"
                    >
                        <Pen className="size-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setProductToDelete(product);
                            setIsDeleteModalOpen(true);
                        }}
                        className="text-[#EF4444] hover:text-red-700 transition-colors cursor-pointer"
                        title="Delete product"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Top Breadcrumb & Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#171717] font-semibold">
                            Products
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Products
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage all products in your store
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Recycle Bin Button */}
                    <button
                        type="button"
                        onClick={() => setIsRecycleBinOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#D5D5D5] bg-white text-[#171717] hover:bg-[#FAF7F2] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        <span>Recycle Bin</span>
                        <Trash2 className="size-4 text-[#171717]" />
                        {deletedProducts.length > 0 && (
                            <span className="size-2 rounded-full bg-[#EF4444]" />
                        )}
                    </button>

                    {/* Add Product Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/products/new")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer"
                    >
                        <span>Add Product</span>
                        <Plus className="size-4 text-white" />
                    </button>
                </div>
            </div>

            {/* Filter & Search Controls Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search products */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search products...."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <CustomDropdown
                        variant="light"
                        options={CATEGORY_OPTIONS}
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        className="w-full sm:w-auto min-w-36"
                    />
                    <CustomDropdown
                        variant="light"
                        options={BRAND_OPTIONS}
                        value={selectedBrand}
                        onChange={setSelectedBrand}
                        className="w-full sm:w-auto min-w-36"
                    />
                    <CustomDropdown
                        variant="light"
                        options={SORT_OPTIONS}
                        value={selectedSort}
                        onChange={setSelectedSort}
                        className="w-full sm:w-auto min-w-40"
                    />
                </div>
            </div>

            {/* Row 2: Status Tabs (Left) + Batch Action Toolbar (Right) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Status Tabs with Count Badges */}
                <div className="flex items-center gap-1.5 p-1 border border-[#EBEBEB] rounded-lg w-fit bg-white shadow-2xs">
                    <button
                        type="button"
                        onClick={() => setStatusTab("all")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                            statusTab === "all"
                                ? "bg-[#FEF9EE] text-[#171717] font-semibold"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span>All</span>
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full text-[11px] font-semibold",
                                statusTab === "all"
                                    ? "bg-[#FDF2D9] text-[#B8860B]"
                                    : "bg-[#EEEEEE] text-[#555555]",
                            )}
                        >
                            {totalCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab("available")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                            statusTab === "available"
                                ? "bg-[#FEF9EE] text-[#171717] font-semibold"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span className="size-2 rounded-full bg-[#10B981]" />
                        <span>Available</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#EBF7EE] text-[11px] font-semibold text-[#10B981]">
                            {availableCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setStatusTab("outofstock")}
                        className={cn(
                            "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                            statusTab === "outofstock"
                                ? "bg-[#FEF9EE] text-[#171717] font-semibold"
                                : "text-[#737373] hover:text-[#171717]",
                        )}
                    >
                        <span className="size-2 rounded-full bg-[#EF4444]" />
                        <span>Out of Stock</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#FDF2F2] text-[11px] font-semibold text-[#EF4444]">
                            {outOfStockCount}
                        </span>
                    </button>
                </div>

                {/* Batch Actions Bar (Right) */}
                <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
                    <span className="text-xs sm:text-sm font-medium text-[#171717] mr-1">
                        Export As:
                    </span>

                    {/* Export CSV */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        title="Export selected or all products as CSV"
                    >
                        <span>CSV</span>
                        <CsvIcon />
                    </button>

                    {/* Export DOC */}
                    <button
                        type="button"
                        onClick={handleExportDOC}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        title="Export selected or all products as Word Document"
                    >
                        <span>DOC</span>
                        <DocIcon />
                    </button>

                    {/* Export PDF */}
                    <button
                        type="button"
                        onClick={handleExportPDF}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        title="Export / Print selected products as PDF"
                    >
                        <span>PDF</span>
                        <PdfIcon />
                    </button>

                    {/* Batch Delete */}
                    <button
                        type="button"
                        disabled={selectedIds.length === 0}
                        onClick={() => setIsBatchDeleteModalOpen(true)}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs",
                            selectedIds.length > 0
                                ? "bg-white border border-[#F87171] text-[#DC2626] hover:bg-red-50"
                                : "bg-[#F9F9F9] border border-[#EAEAEA] text-[#AAAAAA] cursor-not-allowed",
                        )}
                        title={
                            selectedIds.length > 0
                                ? `Delete ${selectedIds.length} selected products`
                                : "Select items to delete"
                        }
                    >
                        <span>Delete</span>
                        <Trash2 className="size-3.5 text-[#DC2626]" />
                    </button>
                </div>
            </div>

            {/* Main Products Table Container */}
            <div className="">
                <CustomTable
                    data={filteredProducts}
                    columns={columns}
                    pagination={true}
                    pageSize={10}
                    itemLabel="Products"
                    emptyMessage="No products match your selected filters."
                    rowClassName={(product) =>
                        selectedIds.includes(product.id) ? "bg-[#FAF8F5]" : ""
                    }
                />
            </div>

            {/* Single Product Delete Modal */}
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setProductToDelete(null);
                }}
                onConfirm={handleConfirmSingleDelete}
                title="Delete Product?"
                itemName={productToDelete?.name}
                disclaimer="Deleted products won't be shown to customers"
            />

            {/* Batch Products Delete Modal */}
            <CustomConfirmModal
                isOpen={isBatchDeleteModalOpen}
                onClose={() => setIsBatchDeleteModalOpen(false)}
                onConfirm={handleConfirmBatchDelete}
                title="Delete Selected Products?"
                description={
                    <>
                        You're about to permanently delete{" "}
                        <span className="font-semibold text-[#171717]">
                            {selectedIds.length} selected products
                        </span>
                        . This action cannot be undone.
                    </>
                }
                confirmText={`Delete (${selectedIds.length})`}
                disclaimer="Deleted products won't be shown to customers"
            />

            {/* Recycle Bin Drawer / Modal */}
            {isRecycleBinOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl animate-scaleUp">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0]">
                            <div className="flex items-center gap-2">
                                <Trash2 className="size-5 text-[#D4AF37]" />
                                <h2 className="text-xl font-bold font-playfair text-[#171717]">
                                    Recycle Bin
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-[#EEEEEE] text-xs font-semibold text-[#555555]">
                                    {deletedProducts.length}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsRecycleBinOpen(false)}
                                className="size-8 rounded-full flex items-center justify-center text-[#888888] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        <div className="py-4 max-h-96 overflow-y-auto divide-y divide-[#F5F5F5]">
                            {deletedProducts.length === 0 ? (
                                <div className="py-12 text-center text-sm text-[#737373]">
                                    Recycle Bin is empty. No deleted products.
                                </div>
                            ) : (
                                deletedProducts.map((item) => (
                                    <div
                                        key={item.id}
                                        className="py-3 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="size-10 rounded-lg object-contain bg-[#FAF7F2] p-1 border border-[#EEEEEE] shrink-0"
                                            />
                                            <div className="truncate">
                                                <h4 className="text-sm font-semibold text-[#171717] truncate">
                                                    {item.name}
                                                </h4>
                                                <p className="text-xs text-[#737373]">
                                                    {item.category} • ₦{item.price.toLocaleString("en-NG")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleRestore(item)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D5D5D5] text-xs font-semibold text-[#171717] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                                            >
                                                <RotateCcw className="size-3.5 text-[#10B981]" />
                                                <span>Restore</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handlePermanentDelete(item.id)}
                                                className="p-1.5 rounded-lg text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Permanently Delete"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#F0F0F0]">
                            <button
                                type="button"
                                onClick={() => setIsRecycleBinOpen(false)}
                                className="px-5 py-2 text-sm bg-[#171717] text-white font-semibold rounded-lg hover:bg-[#262626] transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
