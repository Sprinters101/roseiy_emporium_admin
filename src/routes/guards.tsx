import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { isRoleAuthorized } from "@/config/permissions";
import { AccessDenied } from "@/components/common/AccessDenied";
import type { AdminRole } from "@/service/types";

/**
 * Protects routes from unauthenticated users.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

/**
 * Redirects authenticated users away from public auth pages (e.g. /login).
 */
export const PublicAuthRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

/**
 * Protects specific routes based on allowed admin roles.
 * Displays <AccessDenied /> if the logged-in admin lacks required permissions.
 */
export const RoleRoute: React.FC<{
    allowedRoles: AdminRole[];
    moduleName?: string;
    children: React.ReactNode;
}> = ({ allowedRoles, moduleName, children }) => {
    const { role } = useAuth();

    if (!isRoleAuthorized(role, allowedRoles)) {
        return (
            <AccessDenied
                moduleName={moduleName}
                requiredRoles={allowedRoles}
            />
        );
    }

    return <>{children}</>;
};
