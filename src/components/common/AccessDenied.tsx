import React from "react";
import { Link } from "react-router";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABELS } from "@/config/permissions";
import type { AdminRole } from "@/service/types";

interface AccessDeniedProps {
    moduleName?: string;
    requiredRoles?: AdminRole[];
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
    moduleName,
}) => {
    const { role } = useAuth();
    const normalizedRole = (role || "").toLowerCase() as AdminRole;
    const formattedRole =
        ROLE_LABELS[normalizedRole] ||
        (role ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "User");

    return (
        <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center animate-fadeIn">
            <div className="size-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-5 text-[#EF4444] shadow-xs">
                <ShieldAlert className="size-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-playfair text-[#171717] mb-2">
                Access Restricted
            </h1>

            <p className="text-xs sm:text-sm text-[#737373] max-w-md mb-6 font-hanken leading-relaxed">
                Your account role <span className="font-semibold text-[#171717]">"{formattedRole}"</span> does not have permission to access {moduleName ? `the ${moduleName} module` : "this page"}. If you require access, please contact a Super Administrator.
            </p>

            <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-[#333333] transition-colors shadow-xs"
            >
                <ArrowLeft className="size-4" />
                <span>Back to Dashboard</span>
            </Link>
        </div>
    );
};

export default AccessDenied;
