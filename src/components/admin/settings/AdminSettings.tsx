import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Pen, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { CustomDropdown } from "@/components/common/CustomDropdown";
import { cn } from "@/lib/utils";

interface AdminUser {
    id: string;
    name: string;
    role: string;
    email: string;
    phone: string;
    status: "active" | "inactive";
    lastLogin: string;
    passwordLastChanged?: string;
}

const initialAdminsData: AdminUser[] = [
    {
        id: "1",
        name: "John Amadi",
        role: "Administrator",
        email: "j.amadi@gmail.com",
        phone: "091 2345 6789",
        status: "active",
        lastLogin: "25th July, 2024 at 10:30am",
        passwordLastChanged: "12 June 2026 at 10:43PM",
    },
    {
        id: "2",
        name: "John Amadi",
        role: "Administrator",
        email: "quiloxent@outlook.com",
        phone: "080 9999 1234",
        status: "active",
        lastLogin: "26th July, 2024 at 11:00am",
        passwordLastChanged: "12 June 2026 at 10:43PM",
    },
    {
        id: "3",
        name: "Sarah Patel",
        role: "Administrator",
        email: "sarahpatel@roseiyemporium.com",
        phone: "091 2345 6789",
        status: "active",
        lastLogin: "25th July, 2024 at 10:30am",
        passwordLastChanged: "12 June 2026 at 10:43PM",
    },
    {
        id: "4",
        name: "Michael Chen",
        role: "Administrator",
        email: "c.lounge01@gmail.com",
        phone: "070 3344 5566",
        status: "inactive",
        lastLogin: "27th July, 2024 at 1:15pm",
        passwordLastChanged: "12 June 2026 at 10:43PM",
    },
];

const ROLE_OPTIONS = [
    { label: "Administrator", value: "Administrator" },
    { label: "Super Administrator", value: "Super Administrator" },
    { label: "Store Manager", value: "Store Manager" },
    { label: "Customer Support", value: "Customer Support" },
];

const STATUS_OPTIONS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
];

// Stylized Admin Empty State Illustration matching Screenshot 3
const AdminEmptyIllustration = () => (
    <div className="relative size-44 flex items-center justify-center mx-auto mb-2">
        {/* Soft yellow blob backdrop */}
        <div className="absolute inset-0 bg-[#FBF5E6] rounded-full filter blur-xs opacity-90 scale-95" />

        {/* Stylized Avatar SVG */}
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
    const [activeTab, setActiveTab] = useState<"general" | "admins" | "roles">(
        "general",
    );
    const [isAddingAdmin, setIsAddingAdmin] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

    // General Profile state
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: "Roseiy Bolanle",
        role: "Super Administrator",
        phoneNumber: "091 2345 6789",
        emailAddress: "hello@roseiyemporium.com",
    });

    // General Business state
    const [isEditingBusiness, setIsEditingBusiness] = useState(false);
    const [businessData, setBusinessData] = useState({
        businessName: "Roseiy Emporium",
        phoneNumber: "091 2345 6789",
        emailAddress: "support@roseiyemporium.com",
        storeAddress: "16 Pinnock Beach Rd, Lekki Phase 1, Lagos",
    });

    // General Password & Security state
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        newPassword: "Azulisfinished",
        confirmPassword: "Azulisfinished",
        lastChanged: "12 June 2026 at 10:43PM",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Selected Admin Details specific edit states
    const [isAdminEditingProfile, setIsAdminEditingProfile] = useState(false);
    const [isAdminEditingPassword, setIsAdminEditingPassword] = useState(false);
    const [adminPasswordForm, setAdminPasswordForm] = useState({
        newPassword: "Azulisfinished",
        confirmPassword: "Azulisfinished",
    });
    const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);
    const [showAdminConfirmPassword, setShowAdminConfirmPassword] =
        useState(false);

    // Admins list state
    const [admins, setAdmins] = useState<AdminUser[]>(initialAdminsData);
    const [adminSearch, setAdminSearch] = useState("");

    // New admin form state
    const [newAdminForm, setNewAdminForm] = useState({
        fullName: "",
        role: "Administrator",
        phoneNumber: "",
        emailAddress: "",
        password: "Azulisfinished",
        confirmPassword: "Azulisfinished",
    });
    const [showNewAdminPass, setShowNewAdminPass] = useState(false);
    const [showNewAdminConfirmPass, setShowNewAdminConfirmPass] =
        useState(false);

    // Filtered admins
    const filteredAdmins = admins.filter(
        (a) =>
            a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
            a.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
            a.role.toLowerCase().includes(adminSearch.toLowerCase()),
    );

    // Handle Save General Profile
    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditingProfile(false);
        toast.success("Profile information updated successfully");
    };

    // Handle Save General Business
    const handleSaveBusiness = (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditingBusiness(false);
        toast.success("Business information updated successfully");
    };

    // Handle Update General Password
    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setIsEditingPassword(false);
        setPasswordData((prev) => ({
            ...prev,
            lastChanged: `${new Date().getDate()} ${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getFullYear()} at 10:43PM`,
        }));
        toast.success("Password updated successfully");
    };

    // Handle Update Selected Admin Profile
    const handleSaveAdminProfile = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setAdmins((prev) =>
            prev.map((a) => (a.id === selectedAdmin.id ? selectedAdmin : a)),
        );
        setIsAdminEditingProfile(false);
        toast.success(`Admin profile updated for ${selectedAdmin.name}`);
    };

    // Handle Update Selected Admin Password
    const handleSaveAdminPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword
        ) {
            toast.error("Passwords do not match");
            return;
        }
        if (selectedAdmin) {
            const updated = {
                ...selectedAdmin,
                passwordLastChanged: `${new Date().getDate()} ${new Date().toLocaleString("en-US", { month: "long" })} ${new Date().getFullYear()} at 10:43PM`,
            };
            setSelectedAdmin(updated);
            setAdmins((prev) =>
                prev.map((a) => (a.id === selectedAdmin.id ? updated : a)),
            );
        }
        setIsAdminEditingPassword(false);
        toast.success("Admin password updated successfully");
    };

    // Handle Change Selected Admin Status
    const handleChangeAdminStatus = (statusVal: string) => {
        if (!selectedAdmin) return;
        const newStatus = statusVal as "active" | "inactive";
        const updated = { ...selectedAdmin, status: newStatus };
        setSelectedAdmin(updated);
        setAdmins((prev) =>
            prev.map((a) => (a.id === selectedAdmin.id ? updated : a)),
        );
        toast.success(
            `Admin status set to ${newStatus === "active" ? "Active" : "Inactive"}`,
        );
    };

    // Handle Create New Admin
    const handleCreateAdmin = (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !newAdminForm.fullName.trim() ||
            !newAdminForm.emailAddress.trim()
        ) {
            toast.error("Please fill all required profile fields");
            return;
        }
        if (newAdminForm.password !== newAdminForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const newAdmin: AdminUser = {
            id: String(Date.now()),
            name: newAdminForm.fullName.trim(),
            role: newAdminForm.role,
            email: newAdminForm.emailAddress.trim(),
            phone: newAdminForm.phoneNumber.trim() || "091 2345 6789",
            status: "active",
            lastLogin: `${new Date().getDate()}th ${new Date().toLocaleString("en-US", { month: "long" })}, ${new Date().getFullYear()} at 10:30am`,
            passwordLastChanged: "12 June 2026 at 10:43PM",
        };

        setAdmins((prev) => [newAdmin, ...prev]);
        toast.success(`Admin "${newAdmin.name}" added successfully`);
        setIsAddingAdmin(false);
        setNewAdminForm({
            fullName: "",
            role: "Administrator",
            phoneNumber: "",
            emailAddress: "",
            password: "Azulisfinished",
            confirmPassword: "Azulisfinished",
        });
    };

    // VIEW 1: "Admin Details" Screen (Screenshots 1, 2, 3 of latest set)
    if (selectedAdmin) {
        return (
            <div className="space-y-6 animate-fadeIn pb-12">
                {/* Top Header with Back Arrow and Status Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedAdmin(null);
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

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (isAdminEditingProfile) {
                                        handleSaveAdminProfile(e);
                                    } else {
                                        setIsAdminEditingProfile(true);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                            >
                                <span>
                                    {isAdminEditingProfile
                                        ? "Save Changes"
                                        : "Edit"}
                                </span>
                                <Pen className="size-3.5" />
                            </button>
                        </div>

                        {!isAdminEditingProfile ? (
                            /* View Mode (Screenshot 1) */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {selectedAdmin.name}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Role
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {selectedAdmin.role}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {selectedAdmin.phone}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {selectedAdmin.email}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode (Screenshots 2 & 3) */
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
                                        value={selectedAdmin.name}
                                        onChange={(e) =>
                                            setSelectedAdmin({
                                                ...selectedAdmin,
                                                name: e.target.value,
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
                                        value={selectedAdmin.role}
                                        onChange={(val) =>
                                            setSelectedAdmin({
                                                ...selectedAdmin,
                                                role: val,
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
                                        value={selectedAdmin.phone}
                                        onChange={(e) =>
                                            setSelectedAdmin({
                                                ...selectedAdmin,
                                                phone: e.target.value,
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
                                        value={selectedAdmin.email}
                                        onChange={(e) =>
                                            setSelectedAdmin({
                                                ...selectedAdmin,
                                                email: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
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

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (isAdminEditingPassword) {
                                        handleSaveAdminPassword(e);
                                    } else {
                                        setIsAdminEditingPassword(true);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                            >
                                <span>
                                    {isAdminEditingPassword
                                        ? "Update Password"
                                        : "Change Password"}
                                </span>
                                <Pen className="size-3.5" />
                            </button>
                        </div>

                        {!isAdminEditingPassword ? (
                            /* View Mode (Screenshot 1) */
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
                                        {selectedAdmin.passwordLastChanged ||
                                            "12 June 2026 at 10:43PM"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode (Screenshots 2 & 3) */
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

    // VIEW 2: "Add Admin" Screen (Screenshot 4 from previous set)
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
                            Manage your store and account settings
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateAdmin}
                        className="px-8 py-2.5 bg-[#D4AF37] hover:bg-[#C5A265] text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    >
                        Save
                    </button>
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
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newAdminForm.fullName}
                                    onChange={(e) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            fullName: e.target.value,
                                        })
                                    }
                                    placeholder="Enter Full Name"
                                    className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] placeholder:text-[#AAAAAA] text-[#171717] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Role
                                </label>
                                <CustomDropdown
                                    variant="light"
                                    options={ROLE_OPTIONS}
                                    value={newAdminForm.role}
                                    onChange={(val) =>
                                        setNewAdminForm({
                                            ...newAdminForm,
                                            role: val,
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

                            <div>
                                <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                    Email Address
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
                                    Password
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
                                        placeholder="Enter Password"
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
                                    Confirm Password
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
                {activeTab === "admins" && admins.length > 0 && (
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

            {/* Navigation Tabs (General | Admin Management | Roles & Permissions) */}
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

                {/* <button
                    type="button"
                    onClick={() => setActiveTab("roles")}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer",
                        activeTab === "roles"
                            ? "bg-[#FAF7F2] text-[#D4AF37]"
                            : "text-[#737373] hover:text-[#171717]",
                    )}
                >
                    Roles & Permissions
                </button> */}
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

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (isEditingProfile) {
                                        handleSaveProfile(e);
                                    } else {
                                        setIsEditingProfile(true);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                            >
                                <span>
                                    {isEditingProfile ? "Save Changes" : "Edit"}
                                </span>
                                <Pen className="size-3.5" />
                            </button>
                        </div>

                        {!isEditingProfile ? (
                            /* View Mode (Screenshot 1) */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.fullName}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Role
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.role}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.phoneNumber}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {profileData.emailAddress}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode (Screenshot 2) */
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
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#171717] block mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.emailAddress}
                                        onChange={(e) =>
                                            setProfileData({
                                                ...profileData,
                                                emailAddress: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 text-xs sm:text-sm bg-white border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#D4AF37] text-[#171717] transition-colors"
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

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (isEditingBusiness) {
                                        handleSaveBusiness(e);
                                    } else {
                                        setIsEditingBusiness(true);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                            >
                                <span>
                                    {isEditingBusiness
                                        ? "Save Changes"
                                        : "Edit"}
                                </span>
                                <Pen className="size-3.5" />
                            </button>
                        </div>

                        {!isEditingBusiness ? (
                            /* View Mode (Screenshot 1) */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Business Name
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.businessName}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Phone Number
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.phoneNumber}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Email Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.emailAddress}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-xs text-[#737373] block font-medium">
                                        Store Address
                                    </span>
                                    <span className="text-sm font-bold text-[#171717] block mt-1">
                                        {businessData.storeAddress}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode (Screenshot 2) */
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

                            <button
                                type="button"
                                onClick={(e) => {
                                    if (isEditingPassword) {
                                        handleUpdatePassword(e);
                                    } else {
                                        setIsEditingPassword(true);
                                    }
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl border border-[#171717] hover:bg-[#FAF7F2] text-[#171717] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                            >
                                <span>
                                    {isEditingPassword
                                        ? "Update Password"
                                        : "Change Password"}
                                </span>
                                <Pen className="size-3.5" />
                            </button>
                        </div>

                        {!isEditingPassword ? (
                            /* View Mode (Screenshot 1) */
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
                                        {passwordData.lastChanged}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode (Screenshot 2) */
                            <form
                                onSubmit={handleUpdatePassword}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                            >
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
                    {admins.length === 0 ? (
                        /* Empty State (Screenshot 3) */
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
                                            {filteredAdmins.map(
                                                (admin, index) => (
                                                    <tr
                                                        key={admin.id}
                                                        className="hover:bg-[#FCFBF8] transition-colors"
                                                    >
                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373] font-medium">
                                                            {String(
                                                                index + 1,
                                                            ).padStart(2, "0")}
                                                        </td>
                                                        <td className="py-4.5 px-6 text-xs sm:text-sm font-semibold text-[#171717]">
                                                            {admin.name}
                                                        </td>
                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                            {admin.role}
                                                        </td>
                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                            {admin.email}
                                                        </td>
                                                        <td className="py-4.5 px-6">
                                                            <div className="flex items-center gap-1.5">
                                                                <span
                                                                    className={cn(
                                                                        "size-2 rounded-full",
                                                                        admin.status ===
                                                                            "active"
                                                                            ? "bg-[#10B981]"
                                                                            : "bg-[#EF4444]",
                                                                    )}
                                                                />
                                                                <span
                                                                    className={cn(
                                                                        "text-xs font-semibold",
                                                                        admin.status ===
                                                                            "active"
                                                                            ? "text-[#10B981]"
                                                                            : "text-[#EF4444]",
                                                                    )}
                                                                >
                                                                    {admin.status ===
                                                                    "active"
                                                                        ? "Active"
                                                                        : "Inactive"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4.5 px-6 text-xs sm:text-sm text-[#737373]">
                                                            {admin.lastLogin}
                                                        </td>
                                                        <td className="py-4.5 px-6 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedAdmin(
                                                                        admin,
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
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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
