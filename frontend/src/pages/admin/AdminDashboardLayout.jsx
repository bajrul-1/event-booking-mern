import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

function AdminDashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        // --- THE FIX IS HERE ---
        // 'h-screen' (100% height) ebong 'overflow-hidden' add kora hoyeche
        // Er fole puro page-ta ar scroll korbe na
        <div className="flex h-screen w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">

            <AdminSidebar isSidebarOpen={isSidebarOpen} />

            <div className="flex flex-1 flex-col">
                <AdminHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                {/* --- THE FIX IS HERE --- */}
                {/* 'overflow-y-auto' shudhu ei main content area-te add kora hoyeche */}
                {/* Er fole shudhu content area-ta scroll korbe, sidebar ba header noy */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminDashboardLayout;