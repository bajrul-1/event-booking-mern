import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Maximize, Bell, ChevronDown, UserCog, LockKeyhole } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { markAsRead } from '../../redux/features/notifications/notificationsSlice.js';
import axios from 'axios';

function AdminHeader({ isSidebarOpen, setIsSidebarOpen }) {

    // Redux store theke data anchi
    const { items: notifs, unreadCount } = useSelector((state) => state.notifications) || { items: [], unreadCount: 0 };
    const { organizer } = useSelector((state) => state.organizerAuth) || {};
    // Theme state (Redux theke)
    const { isDarkMode } = useSelector((state) => state.theme) || { isDarkMode: false };
    const dispatch = useDispatch();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const handleNotifToggle = async () => {
        setIsNotifOpen(!isNotifOpen);
        setIsProfileOpen(false);
        if (!isNotifOpen && unreadCount > 0) {
            try {
                const token = localStorage.getItem('organizerToken');
                await axios.put(`${import.meta.env.VITE_API_URL}/api/notifications/mark-read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                dispatch(markAsRead());
            } catch (error) {
                console.error("Failed to mark notifications as read on server:", error);
            }
        }
    };

    const handleProfileToggle = () => {
        setIsProfileOpen(!isProfileOpen);
        setIsNotifOpen(false);
    };

    const handleToggleTheme = () => {
        // dispatch(toggleTheme()); // Redux action dispatch kora hobe
        document.documentElement.classList.toggle('dark');
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);


    const handleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const iconButtonClass = "cursor-pointer rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800";

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

            {/* Left Side: Sidebar Toggle Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={iconButtonClass}
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Right Side: Icons & User Info */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Dark/Light Mode Button */}
                <button
                    onClick={handleToggleTheme}
                    className={iconButtonClass}
                >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Full Screen Button */}
                <button
                    onClick={handleFullScreen}
                    className={iconButtonClass}
                >
                    <Maximize className="h-5 w-5" />
                </button>

                {/* Notification Dropdown */}
                <div className="relative">
                    <button
                        onClick={handleNotifToggle}
                        className={`${iconButtonClass} relative`}
                    >
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isNotifOpen && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={dropdownVariants}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-14 w-80 rounded-lg bg-white dark:bg-neutral-800 shadow-xl border dark:border-neutral-700 z-40 overflow-hidden"
                                onMouseLeave={() => setIsNotifOpen(false)}
                            >
                                <div className="p-3 border-b dark:border-neutral-700 flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50">
                                    <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Notifications</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifs.length === 0 ? (
                                        <div className="p-6 text-center text-neutral-500 text-sm">No new notifications</div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {notifs.map((n, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={n.link || "#"}
                                                    className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 border-b dark:border-neutral-700 last:border-0 transition-colors"
                                                    onClick={() => setIsNotifOpen(false)}
                                                >
                                                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{n.name}</p>
                                                    <p className="text-xs text-neutral-500 mt-1 truncate">{n.subject || "New Message"}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={handleProfileToggle}
                        className="flex items-center gap-2 cursor-pointer rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white font-bold overflow-hidden shrink-0">
                            {organizer?.profileImage ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${organizer.profileImage.startsWith('/') ? '' : '/'}${organizer.profileImage}`}
                                    alt={organizer.name?.firstName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                organizer ? `${organizer.name.firstName[0]}` : 'A'
                            )}
                        </div>
                        <div className="text-sm text-left hidden sm:block">
                            <p className="font-semibold text-neutral-900 dark:text-neutral-50">
                                {organizer ? `${organizer.name.firstName} ${organizer.name.lastName}` : 'Admin'}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                                {organizer ? organizer.role : 'Loading...'}
                            </p>
                        </div>
                        <ChevronDown size={18} className="text-neutral-500 hidden sm:block" />
                    </button>

                    <AnimatePresence>
                        {isProfileOpen && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={dropdownVariants}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-14 w-60 rounded-lg bg-white dark:bg-neutral-800 shadow-xl border dark:border-neutral-700 z-40"
                                onMouseLeave={() => setIsProfileOpen(false)}
                            >
                                <div className="p-2">
                                    <div className="px-3 py-2">
                                        <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                            {organizer ? `${organizer.name.firstName} ${organizer.name.lastName}` : 'Admin'}
                                        </p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            {organizer ? organizer.email : 'admin@email.com'}
                                        </p>
                                    </div>
                                    <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>
                                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                        <UserCog size={16} />
                                        Manage Profile
                                    </a>
                                    <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                                        <LockKeyhole size={16} />
                                        Change Password
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}

export default AdminHeader;