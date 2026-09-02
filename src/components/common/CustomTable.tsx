import React, { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
    key: string;
    header: React.ReactNode;
    accessor?: keyof T | ((item: T, index: number) => React.ReactNode);
    render?: (value: any, item: T, index: number) => React.ReactNode;
    className?: string;
    headerClassName?: string;
    align?: "left" | "center" | "right";
}

export interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    itemLabel?: string;
    showItemCount?: boolean;
    className?: string;
}

export interface CustomTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor?: (item: T, index: number) => string | number;

    // Pagination controls
    pagination?: boolean;
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    itemLabel?: string;
    showItemCount?: boolean;

    // Loading & Empty states
    isLoading?: boolean;
    loadingMessage?: React.ReactNode;
    emptyMessage?: React.ReactNode;
    emptyIllustration?: React.ReactNode;

    // Styling & Callbacks
    className?: string;
    tableClassName?: string;
    headerClassName?: string;
    rowClassName?: string | ((item: T, index: number) => string);
    onRowClick?: (item: T, index: number) => void;
}

/**
 * Generates an array of page numbers and ellipsis strings for pagination controls.
 */
function getPaginationRange(
    currentPage: number,
    totalPages: number,
): (number | string)[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, 6, 7, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
        return [
            1,
            "...",
            totalPages - 6,
            totalPages - 5,
            totalPages - 4,
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        "...",
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2,
        "...",
        totalPages,
    ];
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    itemLabel = "Orders",
    showItemCount = true,
    className,
}) => {
    if (totalPages <= 1 && totalItems <= pageSize) {
        return null;
    }

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);
    const showingCount = endItem - startItem + (totalItems > 0 ? 1 : 0);

    const paginationRange = getPaginationRange(currentPage, totalPages);

    return (
        <div
            className={cn(
                "flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 px-1 select-none",
                className,
            )}
        >
            {/* Left Count Information */}
            {showItemCount && (
                <p className="text-xs sm:text-sm font-medium text-[#737373] text-center sm:text-left">
                    Showing {showingCount} of {totalItems} {itemLabel}
                </p>
            )}

            {/* Right Pagination Pill */}
            <div className="flex items-center gap-1 border border-[#E5E5E5] rounded-full p-1.5 px-2 bg-white shadow-2xs">
                {/* Previous Arrow */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="size-8.5 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37]/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label="Previous page"
                >
                    <ArrowLeft className="size-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {paginationRange.map((page, idx) => {
                        if (page === "...") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="size-8.5 flex items-center justify-center text-xs sm:text-sm text-[#999999]"
                                >
                                    ...
                                </span>
                            );
                        }

                        const pageNumber = page as number;
                        const isActive = pageNumber === currentPage;

                        return (
                            <button
                                key={`page-${pageNumber}`}
                                type="button"
                                onClick={() => onPageChange(pageNumber)}
                                className={cn(
                                    "size-8.5 rounded-full text-xs sm:text-sm font-medium flex items-center justify-center transition-all cursor-pointer",
                                    isActive
                                        ? "bg-[#D4AF37] text-white shadow-xs"
                                        : "text-[#737373] hover:text-[#171717] hover:bg-neutral-100",
                                )}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                </div>

                {/* Next Arrow */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="size-8.5 rounded-full border border-[#D4AF37] text-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37]/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label="Next page"
                >
                    <ArrowRight className="size-4" />
                </button>
            </div>
        </div>
    );
};

export function CustomTable<T>({
    data = [],
    columns,
    keyExtractor,
    pagination = true,
    pageSize = 10,
    currentPage: controlledPage,
    totalItems: controlledTotalItems,
    onPageChange: controlledOnPageChange,
    itemLabel = "Orders",
    showItemCount = true,
    isLoading = false,
    loadingMessage = "Loading data...",
    emptyMessage = "No data available",
    emptyIllustration,
    className,
    tableClassName,
    headerClassName,
    rowClassName,
    onRowClick,
}: CustomTableProps<T>) {
    const [internalPage, setInternalPage] = useState(1);

    const isControlled = controlledPage !== undefined;
    const currentPage = isControlled ? controlledPage : internalPage;

    const totalItems =
        controlledTotalItems !== undefined ? controlledTotalItems : data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        if (controlledOnPageChange) {
            controlledOnPageChange(newPage);
        }
        if (!isControlled) {
            setInternalPage(newPage);
        }
    };

    // Slice data on client-side if not controlled from server
    const displayData = useMemo(() => {
        if (!pagination || controlledTotalItems !== undefined) {
            return data;
        }
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, pagination, controlledTotalItems, currentPage, pageSize]);

    return (
        <div className={cn("w-full flex flex-col", className)}>
            {/* Table Container */}
            <div className="w-full overflow-x-auto bg-white border border-[#EAEAEA] rounded-xl  shadow-xs">
                <table
                    className={cn(
                        "w-full text-left border-collapse text-sm",
                        tableClassName,
                    )}
                >
                    {/* Table Header */}
                    <thead>
                        <tr
                            className={cn(
                                "bg-[#FAF7F2] text-xs font-semibold text-[#171717]",
                                headerClassName,
                            )}
                        >
                            {columns.map((column, idx) => (
                                <th
                                    key={column.key || idx}
                                    className={cn(
                                        "py-3.5 px-4 font-medium",
                                        column.align === "center" &&
                                            "text-center",
                                        column.align === "right" &&
                                            "text-right",
                                        column.headerClassName,
                                    )}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-[#f5f5f5]">
                        {isLoading ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 px-4 text-center text-sm font-medium text-[#737373]"
                                >
                                    {loadingMessage}
                                </td>
                            </tr>
                        ) : displayData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="py-12 px-4 text-center text-sm font-medium text-[#737373]"
                                >
                                    {emptyIllustration && (
                                        <div className="flex justify-center mb-3">
                                            {emptyIllustration}
                                        </div>
                                    )}
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            displayData.map((item, index) => {
                                const key = keyExtractor
                                    ? keyExtractor(item, index)
                                    : (item as any)?.id ||
                                      (item as any)?._id ||
                                      index;

                                const customRowClass =
                                    typeof rowClassName === "function"
                                        ? rowClassName(item, index)
                                        : rowClassName;

                                return (
                                    <tr
                                        key={key}
                                        onClick={() =>
                                            onRowClick?.(item, index)
                                        }
                                        className={cn(
                                            "hover:bg-[#fafafa] transition-colors",
                                            onRowClick && "cursor-pointer",
                                            customRowClass,
                                        )}
                                    >
                                        {columns.map((column, colIdx) => {
                                            let cellContent: React.ReactNode;

                                            if (column.render) {
                                                const value =
                                                    typeof column.accessor ===
                                                    "string"
                                                        ? (item as any)[
                                                              column.accessor
                                                          ]
                                                        : undefined;
                                                cellContent = column.render(
                                                    value,
                                                    item,
                                                    index,
                                                );
                                            } else if (
                                                typeof column.accessor ===
                                                "function"
                                            ) {
                                                cellContent = column.accessor(
                                                    item,
                                                    index,
                                                );
                                            } else if (column.accessor) {
                                                cellContent = (item as any)[
                                                    column.accessor
                                                ];
                                            } else {
                                                cellContent = (item as any)[
                                                    column.key
                                                ];
                                            }

                                            return (
                                                <td
                                                    key={column.key || colIdx}
                                                    className={cn(
                                                        "py-4.5 px-4 text-sm text-[#171717]",
                                                        column.align ===
                                                            "center" &&
                                                            "text-center",
                                                        column.align ===
                                                            "right" &&
                                                            "text-right",
                                                        column.className,
                                                    )}
                                                >
                                                    {cellContent}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="">
                {/* Pagination Controls */}
                {pagination && !isLoading && displayData.length > 0 && (
                    <CustomPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        itemLabel={itemLabel}
                        showItemCount={showItemCount}
                    />
                )}
            </div>
        </div>
    );
}

export default CustomTable;
