import React, { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "@/components/ui/sonner";
import { CustomTable, type Column } from "@/components/common/CustomTable";

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
    {
        id: "2",
        sn: "02",
        name: "Quilox Ent",
        totalSpent: 3125000,
        totalOrders: 22,
        phone: "090 987 65432",
        email: "quiloxent@outlook.com",
        dateJoined: "26th July, 2024",
        lastOrder: "1 Day Ago",
    },
    {
        id: "3",
        sn: "03",
        name: "Castiel Dean",
        totalSpent: 120000,
        totalOrders: 11,
        phone: "090 555 12345",
        email: "dean01@yahoo.com",
        dateJoined: "27th July, 2024",
        lastOrder: "3 Days Ago",
    },
    {
        id: "4",
        sn: "04",
        name: "Castle Lounge",
        totalSpent: 5000000,
        totalOrders: 7,
        phone: "090 123 45678",
        email: "c.lounge01@gmail.com",
        dateJoined: "25th July, 2024",
        lastOrder: "5 Days Ago",
    },
    {
        id: "5",
        sn: "05",
        name: "Sunflower Bar",
        totalSpent: 1225000,
        totalOrders: 5,
        phone: "090 444 67890",
        email: "sunflower@hotmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "4 Days Ago",
    },
    {
        id: "6",
        sn: "06",
        name: "Daisy Dine",
        totalSpent: 0,
        totalOrders: 0,
        phone: "094 888 01234",
        email: "daisy.dine@hotmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "-",
        addresses: [],
    },
    {
        id: "7",
        sn: "07",
        name: "Sunflower Bar",
        totalSpent: 1600000,
        totalOrders: 12,
        phone: "090 444 67890",
        email: "sunflower@hotmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "1 Week Ago",
    },
    {
        id: "8",
        sn: "08",
        name: "Rosemary Bistro",
        totalSpent: 1300000,
        totalOrders: 14,
        phone: "093 777 90123",
        email: "Rosemary@hotmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "2 Weeks Ago",
    },
    {
        id: "9",
        sn: "09",
        name: "Lavender Lounge",
        totalSpent: 1475000,
        totalOrders: 11,
        phone: "091 555 78901",
        email: "lavenderlounges@gmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "3 Weeks Ago",
    },
    {
        id: "10",
        sn: "10",
        name: "Club DNA",
        totalSpent: 1800000,
        totalOrders: 15,
        phone: "092 666 89012",
        email: "clubdna@hotmail.com",
        dateJoined: "28th July, 2024",
        lastOrder: "1 Month Ago",
    },
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

// Empty Customer Vector Illustration matching screenshot 1
const EmptyCustomerIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        {/* Soft yellow organic background */}
        <div className="absolute inset-0 bg-[#FAF3E0] rounded-full filter blur-sm opacity-90 scale-95" />

        <svg viewBox="0 0 120 120" className="size-32 z-10 drop-shadow-xs" fill="none">
            {/* Person avatar */}
            <circle cx="60" cy="50" r="16" fill="#F9D7B5" />
            {/* Hair */}
            <path
                d="M44 48 C44 34, 52 30, 60 30 C68 30, 76 34, 76 48 C76 46, 73 40, 68 40 C63 40, 61 44, 60 44 C59 44, 57 40, 52 40 C47 40, 44 46, 44 48 Z"
                fill="#D4AF37"
            />
            {/* Glasses */}
            <circle cx="53" cy="50" r="4" stroke="#8C6D1F" strokeWidth="1.5" fill="none" />
            <circle cx="67" cy="50" r="4" stroke="#8C6D1F" strokeWidth="1.5" fill="none" />
            <path d="M57 50 h6" stroke="#8C6D1F" strokeWidth="1.5" />
            {/* Body / Shirt */}
            <path
                d="M38 95 C38 78, 48 70, 60 70 C72 70, 82 78, 82 95 Z"
                fill="#B8860B"
            />
            {/* White Add Badge in bottom right */}
            <circle cx="85" cy="88" r="12" fill="white" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))" />
            <circle cx="85" cy="88" r="9" stroke="#D4AF37" strokeWidth="1.8" fill="none" />
            <path d="M85 83.5 v9 M80.5 88 h9" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    </div>
);

export const AdminCustomers: React.FC = () => {
    const navigate = useNavigate();
    const [customers] = useState<CustomerData[]>(initialCustomersList);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const query = searchTerm.toLowerCase().trim();
            return (
                query === "" ||
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query) ||
                c.phone.toLowerCase().includes(query)
            );
        });
    }, [customers, searchTerm]);

    // Batch Export Handlers
    const handleExportCSV = () => {
        if (filteredCustomers.length === 0) {
            toast.error("No customers to export");
            return;
        }

        const headers = ["S/N", "Customer Name", "Total Spent (NGN)", "Total Orders", "Phone Number", "Email Address", "Date Joined"];
        const rows = filteredCustomers.map((c) => [
            `"${c.sn}"`,
            `"${c.name}"`,
            c.totalSpent,
            c.totalOrders,
            `"${c.phone}"`,
            `"${c.email}"`,
            `"${c.dateJoined}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\ufeff" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${filteredCustomers.length} customers to CSV`);
    };

    const handleExportDOC = () => {
        if (filteredCustomers.length === 0) {
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
                            <th>S/N</th><th>Customer Name</th><th>Total Spent</th><th>Total Orders</th><th>Phone</th><th>Email</th><th>Date Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredCustomers
                            .map(
                                (c) => `
                            <tr>
                                <td>${c.sn}</td><td><strong>${c.name}</strong></td><td>₦${c.totalSpent.toLocaleString("en-NG")}</td>
                                <td>${c.totalOrders}</td><td>${c.phone}</td><td>${c.email}</td><td>${c.dateJoined}</td>
                            </tr>
                        `,
                            )
                            .join("")}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        const blob = new Blob(["\ufeff" + htmlContent], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `customers_report_${new Date().toISOString().slice(0, 10)}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`Exported ${filteredCustomers.length} customers to DOC`);
    };

    const handleExportPDF = () => {
        if (filteredCustomers.length === 0) {
            toast.error("No customers to export");
            return;
        }
        window.print();
        toast.info(`Preparing print / PDF for ${filteredCustomers.length} customers`);
    };

    // Columns matching screenshot 2
    const columns: Column<CustomerData>[] = [
        {
            key: "sn",
            header: "S/N",
            className: "w-14 text-sm text-[#171717]",
            render: (_, item) => <span>{item.sn}</span>,
        },
        {
            key: "name",
            header: "Customer Name",
            className: "font-normal text-sm text-[#171717]",
            render: (_, item) => (
                <button
                    type="button"
                    onClick={() => navigate(`/customers/${item.id}`)}
                    className="hover:text-[#D4AF37] font-medium transition-colors text-left cursor-pointer"
                >
                    {item.name}
                </button>
            ),
        },
        {
            key: "totalSpent",
            header: "Total Spent",
            className: "text-sm text-[#171717]",
            render: (_, item) => (
                <span>₦{item.totalSpent.toLocaleString("en-NG")}</span>
            ),
        },
        {
            key: "totalOrders",
            header: "Total Orders",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{item.totalOrders}</span>,
        },
        {
            key: "phone",
            header: "Phone Number",
            className: "text-sm text-[#171717]",
            render: (_, item) => <span>{item.phone}</span>,
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
            render: (_, item) => <span>{item.dateJoined}</span>,
        },
        {
            key: "action",
            header: "Action",
            className: "text-right",
            headerClassName: "text-right",
            render: (_, item) => (
                <button
                    type="button"
                    onClick={() => navigate(`/customers/${item.id}`)}
                    className="text-sm font-medium text-[#171717] hover:text-[#D4AF37] transition-colors cursor-pointer underline"
                >
                    View
                </button>
            ),
        },
    ];

    const hasCustomers = customers.length > 0;

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div>
                <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-[#171717] font-semibold">Customers</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                    Customers
                </h1>
                <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                    Manage all customer information
                </p>
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
                {hasCustomers && (
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

            {/* Table or Empty State */}
            {!hasCustomers || filteredCustomers.length === 0 ? (
                /* Empty State (Screenshot 1) */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptyCustomerIllustration />
                    <h3 className="text-sm sm:text-base font-semibold text-[#171717] mt-3">
                        No customers available yet
                    </h3>
                </div>
            ) : (
                /* Table (Screenshot 2) */
                <div className="space-y-4">
                    <CustomTable
                        data={filteredCustomers}
                        columns={columns}
                        pagination={true}
                        pageSize={10}
                        itemLabel="Customers"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminCustomers;
