import React, { useState } from "react";
import { Outlet } from "react-router";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar } from "@/components/admin/layout/AdminTopbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export const AdminLayout: React.FC = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-[#0d0d0d] flex antialiased text-[#171717]">
            {/* Desktop Left Sidebar */}
            <div className="hidden lg:block shrink-0 sticky top-0 h-screen overflow-y-auto">
                <AdminSidebar />
            </div>

            {/* Mobile Left Sidebar Drawer */}
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetContent
                    side="left"
                    className="p-0 w-64 bg-[#0d0d0d] border-r border-[#1a1a1a] text-white"
                    showCloseButton={false}
                >
                    <AdminSidebar
                        onNavigate={() => setMobileSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            {/* Right Main Column (Topbar + Content Outlet) */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#fcfcfb]">
                {/* Topbar */}
                <AdminTopbar
                    onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Dynamic Content Body Canvas */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                    <Outlet context={{ searchQuery }} />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
