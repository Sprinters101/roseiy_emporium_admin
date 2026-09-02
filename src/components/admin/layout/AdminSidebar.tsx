import React from "react";
import { NavLink, useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { logo, navItems } from "@/lib/site_data";

interface AdminSidebarProps {
    onNavigate?: () => void;
    className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
    onNavigate,
    className,
}) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.info("Logged out of Admin Portal");
        navigate("/login");
        if (onNavigate) onNavigate();
    };

    return (
        <aside
            className={cn(
                "w-64 bg-black-900  flex flex-col justify-between min-h-screen select-none shrink-0",
                className,
            )}
        >
            {/* Top Brand & Logo */}
            <div>
                <div className="p-2 px-4">
                    <NavLink
                        to="/"
                        onClick={onNavigate}
                        className="flex items-center gap-3 group focus:outline-none"
                    >
                        {/* Gold Monogram "RE" Logo */}
                        <div className="flex items-center">
                            <img src={logo} alt="logo" className="w-12" />
                        </div>
                    </NavLink>
                </div>

                {/* Main Navigation List */}
                <nav
                    className="px-3 py-6 space-y-1.5"
                    aria-label="Admin Navigation"
                >
                    {navItems?.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === "/"}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3.5 px-6 py-3 rounded-sm text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? " bg-black-600 font-semibold"
                                            : "text-[#888888] hover:text-[#e0e0e0] hover:bg-[#161616]",
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={cn(
                                                "size-4.5 shrink-0 transition-colors",
                                                isActive
                                                    ? "text-[#e5c158]"
                                                    : "text-[#737373]",
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                isActive
                                                    ? "gradient-text"
                                                    : "text-[#737373]",
                                            )}
                                        >
                                            {item.name}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Pinned Bottom Logout Button */}
            <div className="p-4 border-t border-[#1a1a1a]/60">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#f87171] bg-[#221010]/80 border border-[#441a1a]/60 hover:bg-[#2e1313] hover:border-[#662020] transition-all duration-200 cursor-pointer focus:outline-none"
                >
                    <LogOut className="size-4.5 text-[#ef4444]" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
