import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Eye, EyeOff, Pen, Search, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
    useGetAdminMe,
    useGetBusinessSettings,
    useGetAdminUsers,
    useGetAdminUser,
} from "@/service/queries";
import {
    useUpdateAdminProfile,
    useChangeAdminPassword,
    useUpdateBusinessSettings,
    useCreateAdminUser,
    useUpdateAdminUser,
    useResetAdminPassword,
} from "@/service/mutations";
import type { AdminUser, AdminRole } from "@/service/types";

const ROLE_OPTIONS = [
    { label: "Administrator", value: "administrator" },
    { label: "Super Administrator", value: "super_admin" },
    { label: "Store Manager", value: "store_manager" },
    { label: "Order Manager", value: "order_manager" },
    { label: "Product Manager", value: "product_manager" },
];

const STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

// Helper to format role names cleanly
const formatRole = (r?: string) => {
    if (!r) return "Administrator";
    const found = ROLE_OPTIONS.find(
        (o) =>
            o.value.toLowerCase() === r.toLowerCase() ||
            o.label.toLowerCase() === r.toLowerCase(),
    );
    if (found) return found.label;
    return r
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

// Helper to map UI role selection back to API role enum
const toApiRole = (r?: string): AdminRole => {
    if (!r) return "administrator";
    const found = ROLE_OPTIONS.find(
        (o) =>
            o.label.toLowerCase() === r.toLowerCase() ||
            o.value.toLowerCase() === r.toLowerCase(),
    );
    return (found ? found.value : r.toLowerCase().replace(/\s+/g, "_")) as AdminRole;
};

// Helper to format date strings
const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "Never";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
              ? "nd"
              : day % 10 === 3 && day !== 13
                ? "rd"
                : "th";
    const month = d.toLocaleString("en-US", { month: "long" });
    const year = d.getFullYear();
    const time = d
        .toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();
    return `${day}${suffix} ${month}, ${year} at ${time}`;
};

// Stylized Admin Empty State Illustration matching screenshots
const AdminEmptyIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-xs opacity-90 scale-95" />
        <svg viewBox="0 0 120 120" className="size-32 z-10 drop-shadow-xs">
            {/* Hair Back */}
            <path
                d="M40 38 C40 18, 80 18, 80 38 C80 48, 76 52, 76 52 C76 52, 40 52, 40 38 Z"
                fill="#DEC072"
            />
            {/* Head / Face */}
            <path
                d="M48 38 C48 30, 72 30, 72 38 L72 58 C72 68, 48 68, 48 58 Z"
                fill="#FBF0DE"
            />
            {/* Hair Front / Top */}
            <path
                d="M46 36 C48 24, 72 24, 74 34 C68 30, 52 32, 46 36 Z"
                fill="#DEC072"
            />
            <path d="M44 38 C44 48, 48 42, 48 38 Z" fill="#DEC072" />
            <path d="M72 38 C72 45, 76 45, 76 38 Z" fill="#DEC072" />
            {/* Neck */}
            <rect x="54" y="58" width="12" height="10" fill="#F2E2C8" />
            {/* Shoulders / Shirt */}
            <path
                d="M32 88 C32 70, 88 70, 88 88 L88 95 L32 95 Z"
                fill="#C59F35"
            />
            {/* Glasses */}
            <circle
                cx="53"
                cy="48"
                r="6"
                fill="none"
                stroke="#B8860B"
                strokeWidth="1.8"
            />
            <circle
                cx="67"
                cy="48"
                r="6"
                fill="none"
                stroke="#B8860B"
                strokeWidth="1.8"
            />
            <path d="M59 48 L61 48" stroke="#B8860B" strokeWidth="1.8" />
            {/* Plus Badge on bottom right */}
            <circle cx="86" cy="86" r="13" fill="#FFFFFF" />
            <circle cx="86" cy="86" r="10.5" fill="#D4AF37" />
            <path
                d="M86 81 L86 91 M81 86 L91 86"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
        </svg>
    </div>
);

export const AdminSettings: React.FC = () => {
    const { user, updateUser } = useAuth();

    // 1. Current Authenticated Admin Profile Queries & Mutations
    const { data: adminMeData, isLoading: isMeLoading } = useGetAdminMe();
    const updateProfileMutation = useUpdateAdminProfile();
    const changePasswordMutation = useChangeAdminPassword();

    // 2. Business Settings Queries & Mutations
    const { data: businessSettingsData, isLoading: isBusinessLoading } =
        useGetBusinessSettings();
    const updateBusinessSettingsMutation = useUpdateBusinessSettings();

    // 3. Admin Users Management Queries & Mutations
    const currentAdminUser = adminMeData?.data?.admin || (user as any);
    const isSuperAdmin = currentAdminUser?.role === "super_admin";

    const [activeTab, setActiveTab] = useState<"general" | "admins" | "roles">(
        "general",
    );
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    const [adminSearch, setAdminSearch] = useState("");
    const {
        data: adminsData,
        isLoading: isAdminsLoading,
    } = useGetAdminUsers(
        { search: adminSearch ? adminSearch.trim() : undefined, limit: 100 },
        { enabled: activeTab === "admins" },
    );

    const { data: singleAdminData } = useGetAdminUser(
        selectedAdminId || undefined,
    );

    const createAdminMutation = useCreateAdminUser();
    const updateAdminMutation = useUpdateAdminUser();
    const resetAdminPasswordMutation = useResetAdminPassword();

    // Sync selectedAdmin if singleAdminData changes
    useEffect(() => {
        if (singleAdminData?.data?.admin) {
            setSelectedAdmin(singleAdminData.data.admin);
        }
    }, [singleAdminData]);

    // General Profile state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: "",
        role: "",
        phoneNumber: "",
        emailAddress: "",
    });

    const getInitialProfileData = () => {
        const current = adminMeData?.data?.admin || (user as any);
        if (current) {
            const first = current.firstName || "";
            const last = current.lastName || "";
            const full =
                current.fullName || `${first} ${last}`.trim();
            return {
                fullName: full,
                role: formatRole(current.role),
                phoneNumber:
                    current.phoneNumber || current.phone || "",
                emailAddress: current.email || "",
            };
        }
        return {
            fullName: "",
            role: "Administrator",
            phoneNumber: "",
            emailAddress: "",
        };
    };

    useEffect(() => {
        const data = getInitialProfileData();
        setProfileData(data);
    }, [adminMeData, user]);

    // General Business state
    const [isEditingBusiness, setIsEditingBusiness] = useState(false);
    const [businessData, setBusinessData] = useState({
        businessName: "",
        phoneNumber: "",
        emailAddress: "",
        storeAddress: "",
    });

    const getInitialBusinessData = () => {
        const settings =
            businessSettingsData?.data?.settings ||
            (businessSettingsData?.data as any);
        if (settings) {
            return {
                businessName: settings.businessName || "Roseiy Emporium",
                phoneNumber: settings.phoneNumber || "",
                emailAddress: settings.email || "",
                storeAddress: settings.storeAddress || "",
            };
        }
        return {
            businessName: "Roseiy Emporium",
            phoneNumber: "",
            emailAddress: "",
            storeAddress: "",
        };
    };

    useEffect(() => {
        setBusinessData(getInitialBusinessData());
    }, [businessSettingsData]);

    // General Password & Security state
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Selected Admin Details specific edit states
    const [isAdminEditingProfile, setIsAdminEditingProfile] = useState(false);
    const [adminProfileForm, setAdminProfileForm] = useState({
        fullName: "",
        role: "administrator" as AdminRole,
        phoneNumber: "",
    });

    const [isAdminEditingPassword, setIsAdminEditingPassword] = useState(false);
    const [adminPasswordForm, setAdminPasswordForm] = useState({
        newPassword: "",
        confirmPassword: "",
    });
    const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);
    const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
        useState(false);

    // Initialize adminProfileForm when selectedAdmin is chosen
    useEffect(() => {
        if (selectedAdmin) {
            setAdminProfileForm({
                fullName:
                    selectedAdmin.fullName ||
                    `${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim(),
                role: toApiRole(selectedAdmin.role),
                phoneNumber:
                    selectedAdmin.phoneNumber ||
                    (selectedAdmin as any).phone ||
                    "",
            });
        }
    }, [selectedAdmin]);

    // New admin form state
    const [newAdminForm, setNewAdminForm] = useState({
        firstName: "",
        lastName: "",
        role: "administrator" as AdminRole,
        phoneNumber: "",
        emailAddress: "",
        password: "",
        confirmPassword: "",
    });
    const [showNewAdminPass, setShowNewAdminPass] = useState(false);
    const [showNewAdminConfirmPass, setShowNewAdminConfirmPass] =
        useState(false);

    // Admin users list from API
    const adminsList: AdminUser[] = useMemo(() => {
        return adminsData?.data?.admins || [];
    }, [adminsData]);

    // Filtered admins for table
    const filteredAdmins = useMemo(() => {
        if (!adminSearch.trim()) return adminsList;
        const q = adminSearch.toLowerCase();
        return adminsList.filter((a) => {
            const name = (
                a.fullName || `${a.firstName || ""} ${a.lastName || ""}`
            ).toLowerCase();
            const email = (a.email || "").toLowerCase();
            const role = formatRole(a.role).toLowerCase();
            return (
                name.includes(q) || email.includes(q) || role.includes(q)
            );
        });
    }, [adminsList, adminSearch]);

    // Handle Save General Profile
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const parts = profileData.fullName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        try {
            const res = await updateProfileMutation.mutateAsync({
                firstName,
                lastName,
                fullName: profileData.fullName.trim(),
                phoneNumber: profileData.phoneNumber.trim(),
            });
            if (res?.data?.admin) {
                updateUser?.(res.data.admin);
            }
            setIsEditingProfile(false);
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Cancel General Profile
    const handleCancelProfile = () => {
        setProfileData(getInitialProfileData());
        setIsEditingProfile(false);
    };

    // Handle Save General Business
    const handleSaveBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateBusinessSettingsMutation.mutateAsync({
                businessName: businessData.businessName.trim(),
                phoneNumber: businessData.phoneNumber.trim(),
                email: businessData.emailAddress.trim(),
                storeAddress: businessData.storeAddress.trim(),
            });
            setIsEditingBusiness(false);
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Cancel General Business
    const handleCancelBusiness = () => {
        setBusinessData(getInitialBusinessData());
        setIsEditingBusiness(false);
    };

    // Handle Update General Password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordData.currentPassword) {
            toast.error("Please enter your current password");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("New password must be at least 8 characters long");
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New password and confirmation password do not match");
            return;
        }

        try {
            await changePasswordMutation.mutateAsync({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                confirmPassword: passwordData.confirmPassword,
            });
            setIsEditingPassword(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Cancel General Password
    const handleCancelPassword = () => {
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setIsEditingPassword(false);
    };

    // Handle Update Selected Admin Profile
    const handleSaveAdminProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;

        const parts = adminProfileForm.fullName.trim().split(/\s+/);
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ") || "";

        try {
            const res = await updateAdminMutation.mutateAsync({
                adminId: selectedAdmin.adminId,
                payload: {
                    firstName,
                    lastName,
                    fullName: adminProfileForm.fullName.trim(),
                    role: adminProfileForm.role,
                    phoneNumber: adminProfileForm.phoneNumber.trim(),
                },
            });
            if (res?.data?.admin) {
                setSelectedAdmin(res.data.admin);
            }
            setIsAdminEditingProfile(false);
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Cancel Selected Admin Profile
    const handleCancelAdminProfile = () => {
        if (selectedAdmin) {
            setAdminProfileForm({
                fullName:
                    selectedAdmin.fullName ||
                    `${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim(),
                role: toApiRole(selectedAdmin.role),
                phoneNumber:
                    selectedAdmin.phoneNumber ||
                    (selectedAdmin as any).phone ||
                    "",
            });
        }
        setIsAdminEditingProfile(false);
    };

    // Handle Update Selected Admin Password (Super Admin reset)
    const handleSaveAdminPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;

        if (adminPasswordForm.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (
            adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword
        ) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await resetAdminPasswordMutation.mutateAsync({
                adminId: selectedAdmin.adminId,
                payload: {
                    password: adminPasswordForm.newPassword,
                },
            });
            setIsAdminEditingPassword(false);
            setAdminPasswordForm({
                newPassword: "",
                confirmPassword: "",
            });
            setShowAdminNewPassword(false);
            setShowAdminConfirmPassword(false);
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Cancel Selected Admin Password
    const handleCancelAdminPassword = () => {
        setAdminPasswordForm({
            newPassword: "",
            confirmPassword: "",
        });
        setShowAdminNewPassword(false);
        setShowAdminConfirmPassword(false);
        setIsAdminEditingPassword(false);
    };

    // Handle Change Selected Admin Status
    const handleChangeAdminStatus = async (statusVal: string) => {
        if (!selectedAdmin) return;
        const newStatus = statusVal as "active" | "inactive";

        try {
            const res = await updateAdminMutation.mutateAsync({
                adminId: selectedAdmin.adminId,
                payload: {
                    status: newStatus,
                },
            });
            if (res?.data?.admin) {
                setSelectedAdmin(res.data.admin);
            }
        } catch {
            // error handled by mutation onError toast
        }
    };

    // Handle Create New Admin
    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !newAdminForm.firstName.trim() ||
            !newAdminForm.lastName.trim() ||
            !newAdminForm.emailAddress.trim()
        ) {
            toast.error("Please fill all required profile fields");
            return;
        }

        if (newAdminForm.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (newAdminForm.password !== newAdminForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const firstName = newAdminForm.firstName.trim();
        const lastName = newAdminForm.lastName.trim();
        const fullName = `${firstName} ${lastName}`.trim();

        try {
            await createAdminMutation.mutateAsync({
                firstName,
                lastName,
                fullName,
                email: newAdminForm.emailAddress.trim(),
                password: newAdminForm.password,
                phoneNumber: newAdminForm.phoneNumber.trim() || undefined,
                role: newAdminForm.role,
                status: "active",
            });

            setIsAddingAdmin(false);
            setNewAdminForm({
                firstName: "",
                lastName: "",
                role: "administrator",
                phoneNumber: "",
                emailAddress: "",
                password: "",
                confirmPassword: "",
            });
        } catch {
            // error handled by mutation onError toast
        }
    };

    // VIEW 1: "Admin Details" Screen
    if (selectedAdmin) {
        const adminDisplayName =
            selectedAdmin.fullName ||
            `${selectedAdmin.firstName || ""} ${selectedAdmin.lastName || ""}`.trim() ||
            "Admin User";
        const adminDisplayRole = formatRole(selectedAdmin.role);
        const adminDisplayPhone =
            selectedAdmin.phoneNumber || (selectedAdmin as any).phone || "—";
        const adminDisplayEmail = selectedAdmin.email;
        const adminDisplayLastChanged = formatDateTime(
            selectedAdmin.passwordChangedAt,
        );

        return (
            <div className="space-y-6 animate-fadeIn pb-12">
                {/* Top Header with Back Arrow and Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedAdmin(null);
                                setSelectedAdminId(null);
                                setIsAdminEditingProfile(false);
                                setIsAdminEditingPassword(false);
                            }}
                            className="p-1 rounded-md text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer mb-2 inline-flex items-center"
                            aria-label="Go back to Admin Management"
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                            Admin Details
                        </h1>
                        <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                            Manage administrators roles and information
                        </p>
                    </div>

                    {/* Status Dropdown on top right */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-semibold text-[#171717]">
                            Status:
                        </span>
                        <div className="w-32">
                            <CustomDropdown
                                variant="light"
                                options={STATUS_OPTIONS}
                                value={selectedAdmin.status}
                                onChange={handleChangeAdminStatus}
                                disabled={updateAdminMutation.isPending}
                                triggerClassName="py-2 px-3 rounded-xl border-[#E5E5E5] font-semibold text-xs sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 1. Profile Information Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-5">
                            <div className="flex items-center gap-2.5">
                                <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                    1
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                    Profile Information
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isAdminEditingProfile && (
                                    <button
                                        type="button"
                                        disabled={updateAdminMutation.isPending}
                                        onClick={handleCancelAdminProfile}
                                        className="px-4 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={updateAdminMutation.isPending}
                                    onClick={(e) => {
                                        if (isAdminEditingProfile) {
                                            handleSaveAdminProfile(e);
                                        } else {
                                            setIsAdminEditingProfile(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {isAdminEditingProfile
                                            ? updateAdminMutation.isPending
                                                ? "Saving..."
                                                : "Save Changes"
                                            : "Edit"}
                                    </span>
                                    <Pen className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {!isAdminEditingProfile ? (
                            /* View Mode */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {adminDisplayName}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Role
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {adminDisplayRole}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {adminDisplayPhone}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {adminDisplayEmail}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form
                                onSubmit={handleSaveAdminProfile}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={adminProfileForm.fullName}
                                        onChange={(e) =>
                                            setAdminProfileForm({
                                                ...adminProfileForm,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Role
                                    </label>
                                    <CustomDropdown
                                        variant="light"
                                        options={ROLE_OPTIONS}
                                        value={adminProfileForm.role}
                                        onChange={(val) =>
                                            setAdminProfileForm({
                                                ...adminProfileForm,
                                                role: val as AdminRole,
                                            })
                                        }
                                        triggerClassName="py-3 rounded-xl border-[#E5E5E5]"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={adminProfileForm.phoneNumber}
                                        onChange={(e) =>
                                            setAdminProfileForm({
                                                ...adminProfileForm,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={selectedAdmin.email}
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-[#888888] cursor-not-allowed"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 2. Password & Security Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-5">
                            <div className="flex items-center gap-2.5">
                                <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                    2
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                    Password & Security
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isAdminEditingPassword && (
                                    <button
                                        type="button"
                                        disabled={
                                            resetAdminPasswordMutation.isPending
                                        }
                                        onClick={handleCancelAdminPassword}
                                        className="px-4 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={
                                        resetAdminPasswordMutation.isPending
                                    }
                                    onClick={(e) => {
                                        if (isAdminEditingPassword) {
                                            handleSaveAdminPassword(e);
                                        } else {
                                            setIsAdminEditingPassword(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {isAdminEditingPassword
                                            ? resetAdminPasswordMutation.isPending
                                                ? "Updating..."
                                                : "Update Password"
                                            : "Change Password"}
                                    </span>
                                    <Pen className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {!isAdminEditingPassword ? (
                            /* View Mode */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Password
                                    </span>
                                    <span className="text-base font-bold text-[#171717] tracking-widest block mt-1">
                                        ••••••••
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Last Changed
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {adminDisplayLastChanged}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form
                                onSubmit={handleSaveAdminPassword}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showAdminNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                adminPasswordForm.newPassword
                                            }
                                            onChange={(e) =>
                                                setAdminPasswordForm({
                                                    ...adminPasswordForm,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Minimum 8 characters"
                                            className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAdminNewPassword(
                                                    !showAdminNewPassword,
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                        >
                                            {showAdminNewPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showAdminConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                adminPasswordForm.confirmPassword
                                            }
                                            onChange={(e) =>
                                                setAdminPasswordForm({
                                                    ...adminPasswordForm,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Confirm password"
                                            className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowAdminConfirmPassword(
                                                    !showAdminConfirmPassword,
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                        >
                                            {showAdminConfirmPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // VIEW 2: "Add Admin" Screen
    if (isAddingAdmin) {
        return (
            <div className="space-y-6 animate-fadeIn pb-12">
                {/* Header with Back Button and Save Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsAddingAdmin(false)}
                            className="p-1 rounded-md text-[#171717] hover:bg-[#EAEAEA] transition-colors cursor-pointer mb-2 inline-flex items-center"
                            aria-label="Go back to Admin Management"
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                            Add Admin
                        </h1>
                        <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                            Create a new administrator account
                        </p>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <button
                            type="button"
                            disabled={createAdminMutation.isPending}
                            onClick={() => {
                                setIsAddingAdmin(false);
                                setNewAdminForm({
                                    firstName: "",
                                    lastName: "",
                                    role: "administrator",
                                    phoneNumber: "",
                                    emailAddress: "",
                                    password: "",
                                    confirmPassword: "",
                                });
                            }}
                            className="px-5 py-2.5 rounded-lg border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={createAdminMutation.isPending}
                            onClick={handleCreateAdmin}
                            className="px-8 py-2.5 bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
                        >
                            {createAdminMutation.isPending && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            <span>
                                {createAdminMutation.isPending
                                    ? "Saving..."
                                    : "Save"}
                            </span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-6">
                    {/* 1. Profile Information */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5">
                            <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                1
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                Profile Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminForm.firstName}
                                    onChange={(e) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            firstName: e.target.value,
                                        })
                                    }
                                    placeholder="Enter First Name"
                                    className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminForm.lastName}
                                    onChange={(e) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            lastName: e.target.value,
                                        })
                                    }
                                    placeholder="Enter Last Name"
                                    className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <CustomDropdown
                                    variant="light"
                                    options={ROLE_OPTIONS}
                                    value={newAdminForm.role}
                                    onChange={(val) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            role: val as AdminRole,
                                        })
                                    }
                                    triggerClassName="py-3 rounded-xl border-[#E5E5E5]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={newAdminForm.phoneNumber}
                                    onChange={(e) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            phoneNumber: e.target.value,
                                        })
                                    }
                                    placeholder="Enter Phone Number"
                                    className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={newAdminForm.emailAddress}
                                    onChange={(e) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            emailAddress: e.target.value,
                                        })
                                    }
                                    placeholder="Enter Email"
                                    className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Password & Security */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center gap-2.5">
                            <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                2
                            </span>
                            <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                Password & Security
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showNewAdminPass
                                                ? "text"
                                                : "password"
                                        }
                                        required
                                        value={newAdminForm.password}
                                        onChange={(e) =>
                                            setNewAdminForm({
                                                ...newAdminForm,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Minimum 8 characters"
                                        className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewAdminPass(
                                                !showNewAdminPass,
                                            )
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                    >
                                        {showNewAdminPass ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showNewAdminConfirmPass
                                                ? "text"
                                                : "password"
                                        }
                                        required
                                        value={newAdminForm.confirmPassword}
                                        onChange={(e) =>
                                            setNewAdminForm({
                                                ...newAdminForm,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        placeholder="Confirm Password"
                                        className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewAdminConfirmPass(
                                                !showNewAdminConfirmPass,
                                            )
                                        }
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                    >
                                        {showNewAdminConfirmPass ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            {/* Top Breadcrumb & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#737373] font-hanken mb-1">
                        <span>Dashboard</span>
                        <span>/</span>
                        <span className="text-[#171717] font-semibold">
                            Settings
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-[#171717]">
                        Settings
                    </h1>
                    <p className="text-xs sm:text-sm text-[#737373] font-hanken mt-1">
                        Manage your store and account settings
                    </p>
                </div>

                {/* Top Right Add Admin Button (shown in Admin Management tab when admins exist) */}
                {activeTab === "admins" &&
                    isSuperAdmin &&
                    adminsList.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsAddingAdmin(true)}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                        >
                            <span>Add Admin</span>
                            <span className="text-base font-bold leading-none">
                                +
                            </span>
                        </button>
                    )}
            </div>

            {/* Navigation Tabs (General | Admin Management) */}
            <div className="flex items-center p-1 bg-white border border-[#EAEAEA] rounded-xl shadow-2xs w-fit">
                <button
                    type="button"
                    onClick={() => setActiveTab("general")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                        activeTab === "general"
                            ? "bg-[#FAF7F2] text-[#D4AF37]"
                            : "text-[#737373] hover:text-[#171717]",
                    )}
                >
                    General
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("admins")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                        activeTab === "admins"
                            ? "bg-[#FAF7F2] text-[#D4AF37]"
                            : "text-[#737373] hover:text-[#171717]",
                    )}
                >
                    Admin Management
                </button>
            </div>

            {/* TAB 1: GENERAL SETTINGS */}
            {activeTab === "general" && (
                <div className="space-y-6">
                    {/* 1. Profile Information Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-5">
                            <div className="flex items-center gap-2.5">
                                <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                    1
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                    Profile Information
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isEditingProfile && (
                                    <button
                                        type="button"
                                        disabled={
                                            updateProfileMutation.isPending
                                        }
                                        onClick={handleCancelProfile}
                                        className="px-4 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={
                                        updateProfileMutation.isPending ||
                                        isMeLoading
                                    }
                                    onClick={(e) => {
                                        if (isEditingProfile) {
                                            handleSaveProfile(e);
                                        } else {
                                            setIsEditingProfile(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {isEditingProfile
                                            ? updateProfileMutation.isPending
                                                ? "Saving..."
                                                : "Save Changes"
                                            : "Edit"}
                                    </span>
                                    <Pen className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {isMeLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-200 rounded" />
                                        <div className="h-4 w-32 bg-gray-300 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : !isEditingProfile ? (
                            /* View Mode */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.fullName || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Role
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.role || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.phoneNumber || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.emailAddress || "—"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form
                                onSubmit={handleSaveProfile}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.fullName}
                                        onChange={(e) =>
                                            setProfileData({
                                                ...profileData,
                                                fullName: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profileData.role}
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-[#888888] cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.phoneNumber}
                                        onChange={(e) =>
                                            setProfileData({
                                                ...profileData,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 091 2345 6789"
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        disabled
                                        value={profileData.emailAddress}
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl text-[#888888] cursor-not-allowed"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 2. Business Information Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-5">
                            <div className="flex items-center gap-2.5">
                                <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                    2
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                    Business Information
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isEditingBusiness && (
                                    <button
                                        type="button"
                                        disabled={
                                            updateBusinessSettingsMutation.isPending
                                        }
                                        onClick={handleCancelBusiness}
                                        className="px-4 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={
                                        updateBusinessSettingsMutation.isPending ||
                                        isBusinessLoading
                                    }
                                    onClick={(e) => {
                                        if (isEditingBusiness) {
                                            handleSaveBusiness(e);
                                        } else {
                                            setIsEditingBusiness(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {isEditingBusiness
                                            ? updateBusinessSettingsMutation.isPending
                                                ? "Saving..."
                                                : "Save Changes"
                                            : "Edit"}
                                    </span>
                                    <Pen className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {isBusinessLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                        <div className="h-4 w-32 bg-gray-300 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : !isEditingBusiness ? (
                            /* View Mode */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Business Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.businessName || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.phoneNumber || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.emailAddress || "—"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Store Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.storeAddress || "—"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form
                                onSubmit={handleSaveBusiness}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Business Name
                                    </label>
                                    <input
                                        type="text"
                                        value={businessData.businessName}
                                        onChange={(e) =>
                                            setBusinessData({
                                                ...businessData,
                                                businessName: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Roseiy Emporium"
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={businessData.phoneNumber}
                                        onChange={(e) =>
                                            setBusinessData({
                                                ...businessData,
                                                phoneNumber: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 091 2345 6789"
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={businessData.emailAddress}
                                        onChange={(e) =>
                                            setBusinessData({
                                                ...businessData,
                                                emailAddress: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. support@roseiyemporium.com"
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Store Address
                                    </label>
                                    <input
                                        type="text"
                                        value={businessData.storeAddress}
                                        onChange={(e) =>
                                            setBusinessData({
                                                ...businessData,
                                                storeAddress: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. 16 Pinnock Beach Rd, Lekki Phase 1, Lagos"
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 3. Password & Security Card */}
                    <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-5">
                            <div className="flex items-center gap-2.5">
                                <span className="size-5 rounded-full bg-[#D4AF37] text-white flex items-center justify-center text-xs font-bold shrink-0 select-none">
                                    3
                                </span>
                                <h2 className="text-sm sm:text-base font-bold text-[#171717]">
                                    Password & Security
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {isEditingPassword && (
                                    <button
                                        type="button"
                                        disabled={
                                            changePasswordMutation.isPending
                                        }
                                        onClick={handleCancelPassword}
                                        className="px-4 py-1.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F5F5F5] text-[#737373] hover:text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="button"
                                    disabled={
                                        changePasswordMutation.isPending
                                    }
                                    onClick={(e) => {
                                        if (isEditingPassword) {
                                            handleUpdatePassword(e);
                                        } else {
                                            setIsEditingPassword(true);
                                        }
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-60"
                                >
                                    <span>
                                        {isEditingPassword
                                            ? changePasswordMutation.isPending
                                                ? "Updating..."
                                                : "Update Password"
                                            : "Change Password"}
                                    </span>
                                    <Pen className="size-3.5" />
                                </button>
                            </div>
                        </div>

                        {!isEditingPassword ? (
                            /* View Mode */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Password
                                    </span>
                                    <span className="text-base font-bold text-[#171717] tracking-widest block mt-1">
                                        ••••••••
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Last Changed
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {formatDateTime(
                                            adminMeData?.data?.admin
                                                ?.passwordChangedAt,
                                        )}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form
                                onSubmit={handleUpdatePassword}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showCurrentPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={
                                                passwordData.currentPassword
                                            }
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    currentPassword:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Enter your current password"
                                            className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCurrentPassword(
                                                    !showCurrentPassword,
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showNewPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordData.newPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    newPassword: e.target.value,
                                                })
                                            }
                                            placeholder="Minimum 8 characters"
                                            className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewPassword(
                                                    !showNewPassword,
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={
                                                showConfirmPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={passwordData.confirmPassword}
                                            onChange={(e) =>
                                                setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Confirm new password"
                                            className="w-full pl-4 pr-10 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword,
                                                )
                                            }
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] transition-colors cursor-pointer"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="size-4" />
                                            ) : (
                                                <Eye className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: ADMIN MANAGEMENT */}
            {activeTab === "admins" && (
                <div className="space-y-6">
                    {/* Non-super-admin restriction notice if 403 or role check fails */}
                    {!isSuperAdmin && (
                        <div className="bg-[#FAF8F3] border border-[#EAEAEA] rounded-2xl p-8 text-center max-w-md mx-auto my-12">
                            <div className="size-12 rounded-full bg-[#FAF5E6] text-[#D4AF37] flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                                !
                            </div>
                            <h3 className="text-base font-bold text-[#171717] mb-1 font-playfair">
                                Restricted Access
                            </h3>
                            <p className="text-xs sm:text-sm text-[#737373]">
                                Administrator management is only available to
                                Super Administrators. Please contact a Super
                                Administrator if you require changes.
                            </p>
                        </div>
                    )}

                    {isSuperAdmin && (
                        <>
                            {isAdminsLoading ? (
                                <div className="space-y-4">
                                    <div className="h-10 w-72 bg-gray-200 rounded-lg animate-pulse" />
                                    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs p-6 space-y-4">
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-10 bg-gray-100 rounded-lg animate-pulse"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : adminsList.length === 0 ? (
                                /* Empty State */
                                <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center">
                                    <AdminEmptyIllustration />
                                    <p className="text-sm font-medium text-[#737373] mt-3 mb-4">
                                        No admins added yet
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingAdmin(true)}
                                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#D4AF37] text-white font-semibold text-xs sm:text-sm hover:bg-[#C5A265] transition-all shadow-xs cursor-pointer"
                                    >
                                        <span>Add Admin</span>
                                        <span className="text-base font-bold leading-none">
                                            +
                                        </span>
                                    </button>
                                </div>
                            ) : (
                                /* Admins Table View */
                                <div className="space-y-4">
                                    {/* Search bar */}
                                    <div className="relative max-w-sm">
                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#888888] pointer-events-none" />
                                        <input
                                            type="text"
                                            value={adminSearch}
                                            onChange={(e) =>
                                                setAdminSearch(e.target.value)
                                            }
                                            placeholder="Search administrator...."
                                            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#D4AF37] placeholder:text-[#888888] transition-colors"
                                        />
                                    </div>

                                    {/* Admins Table */}
                                    <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden shadow-xs">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-[#FAF8F3] border-b border-[#EAEAEA]">
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717] w-16">
                                                            S/N
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                                            Admin Name
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                                            Role
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                                            Email Address
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                                            Status
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717]">
                                                            Last Login
                                                        </th>
                                                        <th className="py-3.5 px-6 text-xs font-bold text-[#171717] text-right">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#F0F0F0]">
                                                    {filteredAdmins.length ===
                                                    0 ? (
                                                        <tr>
                                                            <td
                                                                colSpan={7}
                                                                className="py-12 text-center text-xs sm:text-sm text-[#737373]"
                                                            >
                                                                No administrators
                                                                found matching "
                                                                {adminSearch}"
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredAdmins.map(
                                                            (admin, index) => {
                                                                const name =
                                                                    admin.fullName ||
                                                                    `${admin.firstName || ""} ${admin.lastName || ""}`.trim() ||
                                                                    "Admin User";
                                                                const role =
                                                                    formatRole(
                                                                        admin.role,
                                                                    );
                                                                const status =
                                                                    admin.status ===
                                                                    "active"
                                                                        ? "active"
                                                                        : "inactive";
                                                                const lastLogin =
                                                                    formatDateTime(
                                                                        admin.lastLoginAt,
                                                                    );

                                                                return (
                                                                    <tr
                                                                        key={
                                                                            admin.adminId ||
                                                                            (admin as any)
                                                                                .id ||
                                                                            index
                                                                        }
                                                                        className="hover:bg-[#FCFBF8] transition-colors"
                                                                    >
                                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373] font-medium">
                                                                            {String(
                                                                                index +
                                                                                    1,
                                                                            ).padStart(
                                                                                2,
                                                                                "0",
                                                                            )}
                                                                        </td>
                                                                        <td className="py-4.5 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                                            {
                                                                                name
                                                                            }
                                                                        </td>
                                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                                            {
                                                                                role
                                                                            }
                                                                        </td>
                                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                                            {
                                                                                admin.email
                                                                            }
                                                                        </td>
                                                                        <td className="py-4.5 px-6">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span
                                                                                    className={cn(
                                                                                        "size-2 rounded-full",
                                                                                        status ===
                                                                                            "active"
                                                                                            ? "bg-[#10B981]"
                                                                                            : "bg-[#EF4444]",
                                                                                    )}
                                                                                />
                                                                                <span
                                                                                    className={cn(
                                                                                        "text-xs font-semibold",
                                                                                        status ===
                                                                                            "active"
                                                                                            ? "text-[#10B981]"
                                                                                            : "text-[#EF4444]",
                                                                                    )}
                                                                                >
                                                                                    {status ===
                                                                                    "active"
                                                                                        ? "Active"
                                                                                        : "Inactive"}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                                            {
                                                                                lastLogin
                                                                            }
                                                                        </td>
                                                                        <td className="py-4.5 px-6 text-right">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setSelectedAdmin(
                                                                                        admin,
                                                                                    );
                                                                                    setSelectedAdminId(
                                                                                        admin.adminId,
                                                                                    );
                                                                                    setIsAdminEditingProfile(
                                                                                        false,
                                                                                    );
                                                                                    setIsAdminEditingPassword(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="text-xs sm:text-sm font-medium text-[#171717] hover:text-[#D4AF37] underline underline-offset-2 transition-colors cursor-pointer"
                                                                            >
                                                                                View
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            },
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* TAB 3: ROLES & PERMISSIONS */}
            {activeTab === "roles" && (
                <div className="bg-white border border-[#EAEAEA] rounded-2xl p-8 shadow-xs text-center py-16">
                    <h3 className="text-lg font-bold text-[#171717] mb-2 font-playfair">
                        Roles & Permissions
                    </h3>
                    <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
                        Configure role-based access control and granular
                        permission sets for administrative team members.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
