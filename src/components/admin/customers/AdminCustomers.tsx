import React, { useState, useMemo, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomTable, type Column } from "@/components/common/CustomTable";
import { cn } from "@/lib/utils";
import {
    useGetAdminCustomers,
    useGetAdminCustomerStatistics,
} from "@/service/queries";
import type { CustomerItem, GetCustomersParams } from "@/service/types";

export interface CustomerData {
    id: string;
    sn: string;
    name: string;
    totalSpent: number;
    totalOrders: number;
    phone: string;
    email: string;
    dateJoined: string;
    lastOrder?: string;
    addresses?: {
        id: string;
        title: string;
        address: string;
        isDefault?: boolean;
    }[];
}

export const initialCustomersList: CustomerData[] = [
    {
        id: "1",
        sn: "01",
        name: "John Amadi",
        totalSpent: 75000,
        totalOrders: 12,
        phone: "090 123 45678",
        email: "j.amadi@gmail.com",
        dateJoined: "25th July, 2024",
        lastOrder: "2 Days Ago",
        addresses: [
            {
                id: "addr-1",
                title: "Shipping Address 1",
                address: "Plot 8 Augustus Alakiya Close, Ogombo, Lekki Lagos",
                isDefault: true,
            },
            {
                id: "addr-2",
                title: "Shipping Address 2",
                address: "Plot 8 Augustus Alakiya Close, Ogombo, Lekki Lagos",
                isDefault: false,
            },
            {
                id: "addr-3",
                title: "Shipping Address 3",
                address: "Plot 8 Augustus Alakiya Close, Ogombo, Lekki Lagos",
                isDefault: false,
            },
        ],
    },
];

// Document Format Badges / Icons matching theme
const CsvIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#EAF7EE" />
        <path
            d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
            fill="#34A853"
        />
        <path d="M11.5 4v3.5H15" fill="#A8DAB5" />
        <rect
            x="6.5"
            y="10"
            width="7"
            height="4.5"
            rx="0.5"
            fill="white"
            fillOpacity="0.9"
        />
        <path d="M6.5 12.2h7M10 10v4.5" stroke="#34A853" strokeWidth="0.8" />
    </svg>
);

const DocIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#EBF3FD" />
        <path
            d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
            fill="#2563EB"
        />
        <path d="M11.5 4v3.5H15" fill="#93C5FD" />
        <path
            d="M7 10.5h6M7 13h4"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
        />
    </svg>
);

const PdfIcon = () => (
    <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
        <rect width="20" height="20" rx="4" fill="#FDF0F0" />
        <path
            d="M5 4h6.5L15 7.5V16a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
            fill="#DC2626"
        />
        <path d="M11.5 4v3.5H15" fill="#FCA5A5" />
        <text
            x="6"
            y="13.5"
            fill="white"
            fontSize="4.5"
            fontWeight="bold"
            fontFamily="sans-serif"
        >
            PDF
        </text>
    </svg>
);

// Empty Customer Vector Illustration matching UI design
const EmptyCustomerIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        {/* Soft yellow organic background */}
        <div className="absolute inset-0 bg-[#FAF3E0] rounded-full filter blur-sm opacity-90 scale-95" />

        <svg
            viewBox="0 0 120 120"
            className="size-32 z-10 drop-shadow-xs"
            fill="none"
        >
            {/* Person avatar */}
            <circle cx="60" cy="50" r="16" fill="#F9D7B5" />
            {/* Hair */}
            <path
                d="M44 48 C44 34, 52 30, 60 30 C68 30, 76 34, 76 48 C76 46, 73 40, 68 40 C63 40, 61 44, 60 44 C59 44, 57 40, 52 40 C47 40, 44 46, 44 48 Z"
                fill="#D4AF37"
            />
            {/* Glasses */}
            <circle
                cx="53"
                cy="50"
                r="4"
                stroke="#8C6D1F"
                strokeWidth="1.5"
                fill="none"
            />
            <circle
                cx="67"
                cy="50"
                r="4"
                stroke="#8C6D1F"
                strokeWidth="1.5"
                fill="none"
            />
            <path d="M57 50 h6" stroke="#8C6D1F" strokeWidth="1.5" />
            {/* Body / Shirt */}
            <path
                d="M38 95 C38 78, 48 70, 60 70 C72 70, 82 78, 82 95 Z"
                fill="#B8860B"
            />
            {/* White Add Badge in bottom right */}
            <circle
                cx="85"
                cy="88"
                r="12"
                fill="white"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <circle
                cx="85"
                cy="88"
                r="9"
                stroke="#D4AF37"
                strokeWidth="1.8"
                fill="none"
            />
            <path
                d="M85 83.5 v9 M80.5 88 h9"
                stroke="#D4AF37"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return isoString;
        return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return isoString;
    }
};

const formatCurrency = (amount?: string | number) => {
    const num = Number(amount || 0);
    return `₦${num.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const AdminCustomers: React.FC = () => {
    const navigate = useNavigate();

    // Query states
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | undefined>(
        undefined,
    );
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Status filter switcher
    const handleStatusFilter = (status?: string) => {
        setStatusFilter(status);
        setPage(1);
    };

    // Query Params
    const queryParams: GetCustomersParams = useMemo(() => {
        const p: GetCustomersParams = {
            page,
            limit: pageSize,
        };
        if (debouncedSearch.trim()) {
            p.search = debouncedSearch.trim();
        }
        if (statusFilter) {
            p.status = statusFilter;
        }
        return p;
    }, [page, pageSize, debouncedSearch, statusFilter]);

    // Data fetching
    const {
        data: customersResponse,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useGetAdminCustomers(queryParams);

    const { data: statisticsResponse } = useGetAdminCustomerStatistics();
    const statistics = statisticsResponse?.data?.statistics;

    const customersList: CustomerItem[] =
        customersResponse?.data?.customers || [];
    const pagination = customersResponse?.data?.pagination;
    const totalCustomersCount = pagination?.total ?? customersList.length;

    // Batch Export Handlers
    const handleExportCSV = () => {
        if (customersList.length === 0) {
            toast.error("No customers to export");
            return;
        }

        const headers = [
            "S/N",
            "Customer Name",
            "Verification Status",
            "Total Spent (NGN)",
            "Total Orders",
            "Phone Number",
            "Email Address",
            "Date Joined",
        ];
        const rows = customersList.map((c, idx) => [
            `"${String((page - 1) * pageSize + idx + 1).padStart(2, "0")}"`,
            `"${c.firstName} ${c.lastName}"`,
            `"${c.status}"`,
            Number(c.totalSpent || 0),
            c.orderCount ?? 0,
            `"${c.phoneNumber || ""}"`,
            `"${c.email}"`,
            `"${formatDate(c.createdAt)}"`,
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,\ufeff" +
            [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute(
            "download",
            `customers_export_${new Date().toISOString().slice(0, 10)}.csv`,
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${customersList.length} customers to CSV`);
    };

    const handleExportDOC = () => {
        if (customersList.length === 0) {
            toast.error("No customers to export");
            return;
        }

        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Customers Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th { background-color: #FAF7F2; color: #171717; font-weight: bold; padding: 10px; border: 1px solid #E5E5E5; text-align: left; }
                td { padding: 8px 10px; border: 1px solid #E5E5E5; }
            </style>
            </head>
            <body>
                <h2>Roseiy Emporium - Customer Directory</h2>
                <p>Export Date: ${new Date().toLocaleDateString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>S/N</th><th>Customer Name</th><th>Status</th><th>Total Spent</th><th>Total Orders</th><th>Phone</th><th>Email</th><th>Date Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customersList
                            .map(
                                (c, idx) => `
                            <tr>
                                <td>${String((page - 1) * pageSize + idx + 1).padStart(2, "0")}</td>
                                <td><strong>${c.firstName} ${c.lastName}</strong></td>
                                <td>${c.status}</td>
                                <td>${formatCurrency(c.totalSpent)}</td>
                                <td>${c.orderCount ?? 0}</td>
                                <td>${c.phoneNumber || "-"}</td>
                                <td>${c.email}</td>
                                <td>${formatDate(c.createdAt)}</td>
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
        link.download = `customers_report_${new Date().toISOString().slice(0, 10)}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${customersList.length} customers to DOC`);
    };

    const handleExportPDF = () => {
        if (customersList.length === 0) {
            toast.error("No customers to export");
            return;
        }
        window.print();
        toast.info(
            `Preparing print / PDF for ${customersList.length} customers`,
        );
    };

    // Columns Definition
    const columns: Column<CustomerItem>[] = [
        {
            key: "sn",
            header: "S/N",
            className: "w-14 text-sm text-[#171717]",
            render: (_, __, index) => (
                <span>
                    {String((page - 1) * pageSize + index + 1).padStart(2, "0")}
                </span>
            ),
        },
        {
            key: "name",
            header: "Customer Name",
            className: "font-normal text-sm text-[#171717]",
            render: (_, item) => (
                <button
                    type="button"
                    onClick={() => navigate(`/customers/${item.customerId}`)}
                    className="hover:text-[#D4AF37] font-medium transition-colors text-left cursor-pointer"
                >
                    {item.firstName} {item.lastName}
                </button>
            ),
        },
        {
            key: "status",
            header: "Status",
            className: "text-xs text-[#171717]",
            render: (_, item) => {
                const isVerified = item.status === "verified";
                return (
                    <span
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize",
                            isVerified
                                ? "bg-[#EAF7EE] text-[#1E7E34] border border-[#C3E6CB]"
                                : "bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]",
                        )}
                    >
                        <span
                            className={cn(
                                "size-1.5 rounded-full",
                                isVerified ? "bg-[#1E7E34]" : "bg-[#D97706]",
                            )}
                        />
                        {isVerified ? "Verified" : "Pending Verification"}
                    </span>
                );
            },
        },
        {
            key: "totalSpent",
            header: "Total Spent",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{formatCurrency(item.totalSpent)}</span>,
        },
        {
            key: "orderCount",
            header: "Total Orders",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{item.orderCount ?? 0}</span>,
        },
        {
            key: "phone",
            header: "Phone Number",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{item.phoneNumber || "-"}</span>,
        },
        {
            key: "email",
            header: "Email Address",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{item.email}</span>,
        },
        {
            key: "dateJoined",
            header: "Date Joined",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{formatDate(item.createdAt)}</span>,
        },
        {
            key: "action",
            header: "Action",
            className: "text-right",
            headerClassName: "text-right",
            render: (_, item) => (
                <button
                    type="button"
                    onClick={() => navigate(`/customers/${item.customerId}`)}
                    className="text-sm font-medium text-[#171717] hover:text-[#D4AF37] transition-colors cursor-pointer underline"
                >
                    View
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-[#171717] font-semibold">
                        Customers
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Customers
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    Manage all customer accounts and information
                </p>
            </div>

            {/* Status Tabs Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                    type="button"
                    onClick={() => handleStatusFilter(undefined)}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                        statusFilter === undefined
                            ? "bg-[#171717] text-white shadow-xs"
                            : "bg-white border border-[#E5E5E5] text-[#737373] hover:bg-[#FAF7F2] hover:text-[#171717]",
                    )}
                >
                    <span>All Customers</span>
                    {statistics?.totalCustomers !== undefined && (
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                statusFilter === undefined
                                    ? "bg-white/20 text-white"
                                    : "bg-[#F0EBE0] text-[#171717]",
                            )}
                        >
                            {statistics.totalCustomers}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleStatusFilter("verified")}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                        statusFilter === "verified"
                            ? "bg-[#171717] text-white shadow-xs"
                            : "bg-white border border-[#E5E5E5] text-[#737373] hover:bg-[#FAF7F2] hover:text-[#171717]",
                    )}
                >
                    <span>Verified</span>
                    {statistics?.verifiedCustomers !== undefined && (
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                statusFilter === "verified"
                                    ? "bg-white/20 text-white"
                                    : "bg-[#EAF7EE] text-[#1E7E34]",
                            )}
                        >
                            {statistics.verifiedCustomers}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => handleStatusFilter("pending_verification")}
                    className={cn(
                        "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer",
                        statusFilter === "pending_verification"
                            ? "bg-[#171717] text-white shadow-xs"
                            : "bg-white border border-[#E5E5E5] text-[#737373] hover:bg-[#FAF7F2] hover:text-[#171717]",
                    )}
                >
                    <span>Pending Verification</span>
                    {statistics?.pendingCustomers !== undefined && (
                        <span
                            className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                statusFilter === "pending_verification"
                                    ? "bg-white/20 text-white"
                                    : "bg-[#FEF3C7] text-[#D97706]",
                            )}
                        >
                            {statistics.pendingCustomers}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter & Export Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, phone number...."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                    />
                </div>

                {/* Export Buttons */}
                {customersList.length > 0 && (
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs sm:text-sm font-medium text-[#171717] mr-1">
                            Export As:
                        </span>

                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        >
                            <span>CSV</span>
                            <CsvIcon />
                        </button>

                        <button
                            type="button"
                            onClick={handleExportDOC}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        >
                            <span>DOC</span>
                            <DocIcon />
                        </button>

                        <button
                            type="button"
                            onClick={handleExportPDF}
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5E5] hover:border-[#CCCCCC] hover:bg-[#FAF7F2] rounded-lg text-xs sm:text-sm font-semibold text-[#171717] transition-all cursor-pointer shadow-2xs"
                        >
                            <span>PDF</span>
                            <PdfIcon />
                        </button>
                    </div>
                )}
            </div>

            {/* Table or Empty / Loading / Error State */}
            {isLoading && customersList.length === 0 ? (
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 shadow-xs">
                    <div className="space-y-4 animate-pulse">
                        <div className="h-8 bg-gray-100 rounded w-1/4" />
                        <div className="h-12 bg-gray-100 rounded" />
                        <div className="h-12 bg-gray-50 rounded" />
                        <div className="h-12 bg-gray-100 rounded" />
                        <div className="h-12 bg-gray-50 rounded" />
                    </div>
                </div>
            ) : isError && customersList.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-red-100 rounded-2xl p-8">
                    <p className="text-sm font-semibold text-red-600 mb-1">
                        Failed to load customers
                    </p>
                    <p className="text-xs text-[#737373] mb-4 max-w-sm">
                        {(error as any)?.response?.data?.message ||
                            (error as any)?.message ||
                            "An error occurred while connecting to the server."}
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
            ) : customersList.length === 0 ? (
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center bg-white border border-[#EAEAEA] rounded-2xl">
                    <EmptyCustomerIllustration />
                    <h3 className="text-sm sm:text-base font-semibold text-[#171717] mt-3">
                        {debouncedSearch || statusFilter
                            ? "No matching customers found"
                            : "No customers available yet"}
                    </h3>
                    <p className="text-xs text-[#737373] mt-1 max-w-sm">
                        {debouncedSearch || statusFilter
                            ? "Try adjusting your search criteria or clearing selected status filters."
                            : "Registered customers will appear here once they create accounts."}
                    </p>
                    {(debouncedSearch || statusFilter) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter(undefined);
                                setPage(1);
                            }}
                            className="mt-4 px-4 py-2 bg-[#FAF7F2] border border-[#E5E5E5] text-xs font-semibold text-[#171717] rounded-lg hover:bg-[#F0EBE0] transition-colors cursor-pointer"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative space-y-4">
                    {isFetching && (
                        <div className="absolute top-2 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-[#EAEAEA] shadow-2xs text-[11px] text-[#737373]">
                            <RefreshCw className="size-3 animate-spin text-[#D4AF37]" />
                            <span>Updating...</span>
                        </div>
                    )}
                    <CustomTable
                        data={customersList}
                        columns={columns}
                        pagination={true}
                        pageSize={pageSize}
                        currentPage={pagination?.page || page}
                        totalItems={totalCustomersCount}
                        onPageChange={(newPage) => setPage(newPage)}
                        itemLabel="Customers"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
