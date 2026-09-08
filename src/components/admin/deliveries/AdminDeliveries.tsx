import React, { useState, useMemo, useEffect } from "react";
import { Plus, Search, Trash2, Pen, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { CustomConfirmModal } from "@/components/common/CustomConfirmModal";
import { CustomPriceInput } from "@/components/common/CustomPriceInput";
import { cn } from "@/lib/utils";
import {
    useGetAdminDeliveryAreas,
    useGetAdminDeliverySettings,
} from "@/service/queries";
import {
    useCreateAdminDeliveryArea,
    useUpdateAdminDeliveryArea,
    useDeleteAdminDeliveryArea,
    useUpdateAdminDeliverySettings,
} from "@/service/mutations";
import type {
    DeliveryArea,
    DeliverySetting,
    GetDeliveryAreasParams,
} from "@/service/types";

export interface DeliveryAreaItem {
    id: string;
    name: string;
    fee: number;
    status: "enabled" | "disabled";
}

export interface DeliveryThreshold {
    amount: number;
    status: "enabled" | "disabled";
}

const STATUS_FILTER_OPTIONS = [
    { label: "All Status", value: "all" },
    { label: "Enabled", value: "enabled" },
    { label: "Disabled", value: "disabled" },
];

// Delivery Truck Icon matching screenshots
const DeliveryTruckIcon = ({ className }: { className?: string }) => (
    <svg
        className={cn("size-6 text-[#171717]", className)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {/* Cab and Cargo Body */}
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M14 8h4.5a2 2 0 0 1 1.6.8l2.4 3.2a2 2 0 0 1 .5 1.3V17a1 1 0 0 1-1 1h-2" />
        <line x1="2" y1="12" x2="10" y2="12" />
        {/* Wheels */}
        <circle cx="7.5" cy="18.5" r="2.5" />
        <circle cx="17.5" cy="18.5" r="2.5" />
    </svg>
);

// Empty State Sad Box Illustration matching Screenshot 1
const EmptySadBoxIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        {/* Soft warm beige blob backdrop */}
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-xs opacity-90 scale-95" />

        {/* 3D Sad Cardboard Box SVG */}
        <svg viewBox="0 0 140 140" className="size-32 z-10 drop-shadow-xs">
            {/* Box Top face */}
            <polygon points="70,25 115,50 70,75 25,50" fill="#E8C87A" />
            {/* Box Top Center Seam / Tape */}
            <polygon
                points="66,27 74,31 74,73 66,69"
                fill="#DEC072"
                opacity="0.8"
            />

            {/* Box Left face (darker isometric shade) */}
            <polygon points="25,50 70,75 70,120 25,95" fill="#D3B05C" />

            {/* Box Right face (lighter isometric shade) */}
            <polygon points="70,75 115,50 115,95 70,120" fill="#E2C172" />

            {/* Left Eye */}
            <circle cx="85" cy="85" r="2.2" fill="#4A3B18" />

            {/* Right Eye */}
            <circle cx="101" cy="76" r="2.2" fill="#4A3B18" />

            {/* Sad Mouth Curve */}
            <path
                d="M 87 97 Q 94 90 99 93"
                fill="none"
                stroke="#4A3B18"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

export const AdminDeliveries: React.FC = () => {
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // Modal states
    const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
    const [areaToDelete, setAreaToDelete] = useState<DeliveryArea | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);

    // Form inputs for Area
    const [areaNameInput, setAreaNameInput] = useState("");
    const [deliveryFeeInput, setDeliveryFeeInput] = useState("");
    const [statusInput, setStatusInput] = useState<"enabled" | "disabled">(
        "enabled",
    );

    // Form inputs for Threshold Rule
    const [thresholdAmountInput, setThresholdAmountInput] = useState("");
    const [thresholdStatusInput, setThresholdStatusInput] = useState<
        "enabled" | "disabled"
    >("enabled");

    // Search Debouncing (350ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 350);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Backend Query Params
    const queryParams: GetDeliveryAreasParams = useMemo(() => {
        const params: GetDeliveryAreasParams = {};
        if (debouncedSearch.trim()) {
            params.search = debouncedSearch.trim();
        }
        if (statusFilter === "enabled") {
            params.status = "active";
        } else if (statusFilter === "disabled") {
            params.status = "inactive";
        }
        return params;
    }, [debouncedSearch, statusFilter]);

    // Live Queries
    const {
        data: areasResponse,
        isLoading: isAreasLoading,
        isError: isAreasError,
        error: areasError,
        refetch: refetchAreas,
    } = useGetAdminDeliveryAreas(queryParams);

    const {
        data: settingsResponse,
        isLoading: isSettingsLoading,
    } = useGetAdminDeliverySettings();

    // Mutations
    const createAreaMutation = useCreateAdminDeliveryArea();
    const updateAreaMutation = useUpdateAdminDeliveryArea();
    const deleteAreaMutation = useDeleteAdminDeliveryArea();
    const updateSettingsMutation = useUpdateAdminDeliverySettings();

    // Derived State
    const deliveryAreas: DeliveryArea[] =
        areasResponse?.data?.deliveryAreas || [];
    const settings: DeliverySetting | undefined =
        settingsResponse?.data?.settings;

    const thresholdAmount = Number(settings?.freeDeliveryThreshold || 0);
    const thresholdStatus: "enabled" | "disabled" = settings?.freeDeliveryEnabled
        ? "enabled"
        : "disabled";

    // Handle Create Area
    const handleCreateArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!areaNameInput.trim()) {
            toast.error("Please enter an area name");
            return;
        }

        const rawFee = Number(deliveryFeeInput.replace(/[^0-9]/g, ""));
        if (isNaN(rawFee) || rawFee < 0) {
            toast.error("Please enter a valid delivery fee");
            return;
        }

        createAreaMutation.mutate(
            {
                name: areaNameInput.trim(),
                fee: rawFee,
                status: statusInput === "enabled" ? "active" : "inactive",
            },
            {
                onSuccess: () => {
                    setIsAddAreaModalOpen(false);
                    setAreaNameInput("");
                    setDeliveryFeeInput("");
                    setStatusInput("enabled");
                },
            },
        );
    };

    // Handle Edit Area
    const handleSaveEditArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingArea || !areaNameInput.trim()) {
            toast.error("Please enter an area name");
            return;
        }

        const rawFee = Number(deliveryFeeInput.replace(/[^0-9]/g, ""));
        if (isNaN(rawFee) || rawFee < 0) {
            toast.error("Please enter a valid delivery fee");
            return;
        }

        updateAreaMutation.mutate(
            {
                deliveryAreaId: editingArea.deliveryAreaId,
                payload: {
                    name: areaNameInput.trim(),
                    fee: rawFee,
                    status: statusInput === "enabled" ? "active" : "inactive",
                },
            },
            {
                onSuccess: () => {
                    setEditingArea(null);
                    setAreaNameInput("");
                    setDeliveryFeeInput("");
                    setStatusInput("enabled");
                },
            },
        );
    };

    // Handle Delete Area
    const handleConfirmDelete = () => {
        if (!areaToDelete) return;
        deleteAreaMutation.mutate(areaToDelete.deliveryAreaId, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setAreaToDelete(null);
            },
        });
    };

    // Handle Save Threshold Rule
    const handleSaveThreshold = (e: React.FormEvent) => {
        e.preventDefault();
        const rawAmount = Number(thresholdAmountInput.replace(/[^0-9]/g, ""));
        if (isNaN(rawAmount) || rawAmount < 0) {
            toast.error("Please enter a valid minimum order amount");
            return;
        }

        updateSettingsMutation.mutate(
            {
                freeDeliveryEnabled: thresholdStatusInput === "enabled",
                freeDeliveryThreshold: rawAmount,
            },
            {
                onSuccess: () => {
                    setIsThresholdModalOpen(false);
                },
            },
        );
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#171717] font-semibold">
                            Deliveries
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Deliveries
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage all delivery areas and rates
                    </p>
                </div>

                {/* Top Right Add Area Button */}
                <button
                    type="button"
                    onClick={() => {
                        setAreaNameInput("");
                        setDeliveryFeeInput("");
                        setStatusInput("enabled");
                        setIsAddAreaModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                >
                    <span>Add Area</span>
                    <Plus className="size-4 text-white" />
                </button>
            </div>

            {/* Free Delivery Threshold Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="size-14 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center shrink-0">
                        <DeliveryTruckIcon className="size-6 text-[#171717]" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-[#737373]">
                            Free Delivery Threshold
                        </p>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#171717] mt-0.5 font-hanken">
                            {isSettingsLoading ? (
                                <span className="inline-block h-6 w-32 bg-gray-200 rounded animate-pulse" />
                            ) : (
                                `₦${thresholdAmount.toLocaleString()}`
                            )}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span
                                className={cn(
                                    "size-2 rounded-full",
                                    thresholdStatus === "enabled"
                                        ? "bg-[#10B981]"
                                        : "bg-[#EF4444]",
                                )}
                            />
                            <span
                                className={cn(
                                    "text-xs font-semibold",
                                    thresholdStatus === "enabled"
                                        ? "text-[#10B981]"
                                        : "text-[#EF4444]",
                                )}
                            >
                                {thresholdStatus === "enabled"
                                    ? "Enabled"
                                    : "Disabled"}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setThresholdAmountInput(
                            thresholdAmount > 0
                                ? thresholdAmount.toLocaleString()
                                : "",
                        );
                        setThresholdStatusInput(thresholdStatus);
                        setIsThresholdModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer self-start sm:self-auto"
                >
                    {thresholdAmount > 0 ? (
                        <>
                            <span>Edit Rule</span>
                            <Pen className="size-3.5" />
                        </>
                    ) : (
                        <>
                            <span>Add Rule</span>
                            <Plus className="size-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by area, fee...."
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                    />
                </div>

                {/* Status Dropdown */}
                <div className="w-full sm:w-auto min-w-44">
                    <CustomDropdown
                        variant="light"
                        options={STATUS_FILTER_OPTIONS}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                </div>
            </div>

            {/* Main Content Area: Skeleton Loading OR Error OR Empty State OR Table View */}
            {isAreasLoading ? (
                /* Skeleton Loading State */
                <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs animate-pulse">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-20">
                                        S/N
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Area Name
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Delivery Fee
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i} className="h-16">
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-6 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-36 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-20 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="h-4 w-16 bg-gray-200 rounded" />
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : isAreasError && deliveryAreas.length === 0 ? (
                /* Error State with retry */
                <div className="py-16 flex flex-col items-center justify-center text-center bg-white border border-red-100 rounded-xl p-8 shadow-xs">
                    <p className="text-sm font-semibold text-red-600 mb-1">
                        Failed to load delivery areas
                    </p>
                    <p className="text-xs text-[#737373] mb-4 max-w-sm">
                        {(areasError as any)?.response?.data?.message ||
                            (areasError as any)?.message ||
                            "An error occurred while connecting to the server."}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetchAreas()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-white text-xs font-semibold hover:bg-[#C5A265] transition-colors cursor-pointer"
                    >
                        <RefreshCw className="size-3.5" />
                        <span>Retry</span>
                    </button>
                </div>
            ) : deliveryAreas.length === 0 ? (
                /* Empty State (Screenshot 1) */
                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                    <EmptySadBoxIllustration />
                    <p className="text-sm font-medium text-[#737373] mt-3">
                        {searchTerm.trim() || statusFilter !== "all"
                            ? "No delivery areas match your search"
                            : "No delivery area added"}
                    </p>
                </div>
            ) : (
                /* Delivery Areas Table (Screenshot 4) */
                <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-20">
                                        S/N
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Area Name
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Delivery Fee
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                        Status
                                    </th>
                                    <th className="py-3.5 px-6 text-xs font-bold text-[#171717] text-right">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F0F0F0]">
                                {deliveryAreas.map((area, index) => {
                                    const isAreaActive =
                                        area.status === "active" ||
                                        area.status === "enabled";
                                    return (
                                        <tr
                                            key={area.deliveryAreaId}
                                            className="hover:bg-[#FCFBF8] transition-colors group"
                                        >
                                            <td className="py-4 px-6 text-xs sm:text-sm text-[#737373] font-medium">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                {area.name}
                                            </td>
                                            <td className="py-4 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                ₦{Number(
                                                    area.fee || 0,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className={cn(
                                                            "size-2 rounded-full",
                                                            isAreaActive
                                                                ? "bg-[#10B981]"
                                                                : "bg-[#EF4444]",
                                                        )}
                                                    />
                                                    <span
                                                        className={cn(
                                                            "text-xs font-semibold",
                                                            isAreaActive
                                                                ? "text-[#10B981]"
                                                                : "text-[#EF4444]",
                                                        )}
                                                    >
                                                        {isAreaActive
                                                            ? "Enabled"
                                                            : "Disabled"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingArea(
                                                                area,
                                                            );
                                                            setAreaNameInput(
                                                                area.name,
                                                            );
                                                            setDeliveryFeeInput(
                                                                Number(
                                                                    area.fee ||
                                                                        0,
                                                                ).toLocaleString(),
                                                            );
                                                            setStatusInput(
                                                                isAreaActive
                                                                    ? "enabled"
                                                                    : "disabled",
                                                            );
                                                        }}
                                                        className="size-8 rounded-full flex items-center justify-center text-[#737373] hover:text-[#171717] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
                                                        title="Edit Area"
                                                    >
                                                        <Pen className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setAreaToDelete(
                                                                area,
                                                            );
                                                            setIsDeleteModalOpen(
                                                                true,
                                                            );
                                                        }}
                                                        className="size-8 rounded-full flex items-center justify-center text-[#EF4444] hover:bg-red-50 transition-colors cursor-pointer"
                                                        title="Delete Area"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Delivery Area Modal (Screenshot 2) */}
            {isAddAreaModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[26rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Truck Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center mx-auto mb-4">
                            <DeliveryTruckIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Add Delivery Area
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Add a new area for delivering products ordered by
                            customers
                        </p>

                        <form
                            onSubmit={handleCreateArea}
                            className="space-y-4 text-left"
                        >
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Area Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={areaNameInput}
                                    onChange={(e) =>
                                        setAreaNameInput(e.target.value)
                                    }
                                    placeholder="Enter Area Name"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <CustomPriceInput
                                label="Delivery Fee"
                                required
                                value={deliveryFeeInput}
                                onChange={(formatted) =>
                                    setDeliveryFeeInput(formatted)
                                }
                                placeholder="Enter Delivery Fee"
                            />

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="add-status"
                                            checked={statusInput === "enabled"}
                                            onChange={() =>
                                                setStatusInput("enabled")
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                statusInput === "enabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {statusInput === "enabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Enabled
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="add-status"
                                            checked={statusInput === "disabled"}
                                            onChange={() =>
                                                setStatusInput("disabled")
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                statusInput === "disabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {statusInput === "disabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Disabled
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-3">
                                <button
                                    type="button"
                                    disabled={createAreaMutation.isPending}
                                    onClick={() => {
                                        setIsAddAreaModalOpen(false);
                                        setAreaNameInput("");
                                        setDeliveryFeeInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createAreaMutation.isPending}
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {createAreaMutation.isPending
                                        ? "Adding..."
                                        : "Add Area"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Delivery Area Modal (Screenshot 5) */}
            {editingArea && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[26rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Truck Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center mx-auto mb-4">
                            <DeliveryTruckIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            Edit Delivery Area
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Edit delivery area details
                        </p>

                        <form
                            onSubmit={handleSaveEditArea}
                            className="space-y-4 text-left"
                        >
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Area Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={areaNameInput}
                                    onChange={(e) =>
                                        setAreaNameInput(e.target.value)
                                    }
                                    placeholder="Enter Area Name"
                                    className="w-full px-4 py-3 text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <CustomPriceInput
                                label="Delivery Fee"
                                required
                                value={deliveryFeeInput}
                                onChange={(formatted) =>
                                    setDeliveryFeeInput(formatted)
                                }
                                placeholder="Enter Delivery Fee"
                            />

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="edit-status"
                                            checked={statusInput === "enabled"}
                                            onChange={() =>
                                                setStatusInput("enabled")
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                statusInput === "enabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {statusInput === "enabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Enabled
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="edit-status"
                                            checked={statusInput === "disabled"}
                                            onChange={() =>
                                                setStatusInput("disabled")
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                statusInput === "disabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {statusInput === "disabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Disabled
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-3">
                                <button
                                    type="button"
                                    disabled={updateAreaMutation.isPending}
                                    onClick={() => {
                                        setEditingArea(null);
                                        setAreaNameInput("");
                                        setDeliveryFeeInput("");
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateAreaMutation.isPending}
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {updateAreaMutation.isPending
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Delivery Rule Modal (Screenshot 3) */}
            {isThresholdModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                    <div
                        className="bg-white rounded-3xl p-8 max-w-sm sm:max-w-[26rem] w-full text-center shadow-2xl animate-scaleUp relative border border-[#EAEAEA]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top Truck Icon */}
                        <div className="size-14 rounded-full bg-[#FAF7F2] border border-[#F0EBE0] flex items-center justify-center mx-auto mb-4">
                            <DeliveryTruckIcon className="size-6 text-[#171717]" />
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#171717] tracking-tight">
                            {thresholdAmount > 0
                                ? "Edit Delivery Rule"
                                : "Add Delivery Rule"}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#737373] mt-1.5 mb-5 max-w-xs mx-auto leading-relaxed">
                            Create a threshold for customers to qualify for free
                            delivery
                        </p>

                        <form
                            onSubmit={handleSaveThreshold}
                            className="space-y-4 text-left"
                        >
                            <CustomPriceInput
                                label="Minimum Order Amount"
                                required
                                value={thresholdAmountInput}
                                onChange={(formatted) =>
                                    setThresholdAmountInput(formatted)
                                }
                                placeholder="Enter Minimum Order Amount"
                            />

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-2">
                                    Status
                                </label>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="threshold-status"
                                            checked={
                                                thresholdStatusInput ===
                                                "enabled"
                                            }
                                            onChange={() =>
                                                setThresholdStatusInput(
                                                    "enabled",
                                                )
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                thresholdStatusInput ===
                                                    "enabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {thresholdStatusInput ===
                                                "enabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Enabled
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="threshold-status"
                                            checked={
                                                thresholdStatusInput ===
                                                "disabled"
                                            }
                                            onChange={() =>
                                                setThresholdStatusInput(
                                                    "disabled",
                                                )
                                            }
                                            className="hidden"
                                        />
                                        <div
                                            className={cn(
                                                "size-4 rounded-full border flex items-center justify-center transition-all",
                                                thresholdStatusInput ===
                                                    "disabled"
                                                    ? "border-[#D4AF37]"
                                                    : "border-[#D5D5D5]",
                                            )}
                                        >
                                            {thresholdStatusInput ===
                                                "disabled" && (
                                                <div className="size-2 rounded-full bg-[#D4AF37]" />
                                            )}
                                        </div>
                                        <span className="text-xs sm:text-sm text-[#171717]">
                                            Disabled
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3.5 pt-3">
                                <button
                                    type="button"
                                    disabled={updateSettingsMutation.isPending}
                                    onClick={() => {
                                        setIsThresholdModalOpen(false);
                                    }}
                                    className="w-full border border-[#D5D5D5] bg-white hover:bg-[#FAF7F2] text-[#171717] font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateSettingsMutation.isPending}
                                    className="w-full bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {updateSettingsMutation.isPending
                                        ? "Saving..."
                                        : thresholdAmount > 0
                                          ? "Save Changes"
                                          : "Add Rule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Area Confirmation Modal */}
            <CustomConfirmModal
                isOpen={isDeleteModalOpen}
                isLoading={deleteAreaMutation.isPending}
                onClose={() => {
                    if (!deleteAreaMutation.isPending) {
                        setIsDeleteModalOpen(false);
                        setAreaToDelete(null);
                    }
                }}
                onConfirm={handleConfirmDelete}
                title="Delete Delivery Area?"
                description={
                    <>
                        The action will remove{" "}
                        <span className="font-semibold text-[#171717]">
                            {areaToDelete?.name}
                        </span>{" "}
                        from your delivery areas.
                    </>
                }
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default AdminDeliveries;
