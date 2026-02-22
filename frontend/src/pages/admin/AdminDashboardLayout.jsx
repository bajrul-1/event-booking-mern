import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../redux/features/notifications/notificationsSlice.js';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';

function AdminDashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        // Request Notification permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Initialize Socket connection
        const socket = io(import.meta.env.VITE_API_URL);

        // Listen for new messages
        socket.on('new_message', (messageData) => {

            // Dispatch to Redux store
            dispatch(addNotification({
                ...messageData,
                type: 'contact_message',
                link: '/organizer/dashboard/messages' // Fixed route targeting the actual mounted path
            }));

            // Show Browser Notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Contact Message', {
                    body: `${messageData.name} said: ${messageData.message.substring(0, 50)}...`,
                    icon: '/favicon.ico' // Or any app icon you have
                });
            } else if ('Notification' in window && Notification.permission !== 'denied') {
                // Try requesting permission again just in case
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('New Contact Message', {
                            body: `${messageData.name} said: ${messageData.message.substring(0, 50)}...`,
                            icon: '/favicon.ico'
                        });
                    }
                });
            }
        });

        // Cleanup on unmount
        return () => {
            socket.off('new_message');
            socket.disconnect();
        };
    }, []);

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