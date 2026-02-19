import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Settings, LogOut, Ticket, Layers, Mail } from 'lucide-react'; // Layers, Mail icon add kora holo
import { useDispatch, useSelector } from 'react-redux';
import { logoutOrganizer } from '../../redux/features/organizer/organizerAuthSlice.js';
import { motion } from 'framer-motion';

const handleLogout = (dispatch, navigate) => {
    dispatch(logoutOrganizer());
    navigate('/organizer');
};

const sidebarVariants = {
    open: { width: '16rem' },
    closed: { width: '4.5rem' }
};

const linkTextVariants = {
    open: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1 } },
    closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } }
};

const iconVariants = {
    open: { paddingLeft: '1rem', paddingRight: '0.75rem' },
    closed: { paddingLeft: '1.25rem', paddingRight: '0' }
};

const logoTextVariants = {
    open: { opacity: 1, x: 0, display: 'block', transition: { delay: 0.1 } },
    closed: { opacity: 0, x: -10, transitionEnd: { display: 'none' } }
}

const customStyle = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

function AdminSidebar({ isSidebarOpen }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { organizer } = useSelector((state) => state.organizerAuth) || {};
    const isAdmin = organizer?.role === 'admin';

    const iconClass = "h-5 w-5 shrink-0";
    const textClass = "whitespace-nowrap";

    const getLinkClasses = (isActive) => {
        const base = "flex items-center rounded-lg py-3 text-neutral-300 transition-colors duration-200 cursor-pointer";
        const hover = "hover:bg-primary-500 hover:text-white";
        const active = "bg-primary-500 text-white";
        const padding = isSidebarOpen ? 'px-4' : 'px-0 justify-center';
        return `${base} ${padding} ${isActive ? active : hover}`;
    };

    return (
        <motion.aside
            variants={sidebarVariants}
            animate={isSidebarOpen ? "open" : "closed"}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="hidden h-screen flex-col border-r border-neutral-700 bg-neutral-900 text-white md:flex overflow-hidden"
        >
            <style>{customStyle}</style>
            <div className={`flex h-16 items-center border-b border-neutral-700 ${isSidebarOpen ? 'justify-start px-4' : 'justify-center px-0'}`}>
                <Ticket size={28} className="text-primary-500 shrink-0" />
                <motion.span
                    variants={logoTextVariants}
                    animate={isSidebarOpen ? "open" : "closed"}
                    className="ml-2 text-2xl font-bold font-heading whitespace-nowrap"
                >
                    EventBooking
                </motion.span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <nav className={`grid items-start gap-2 text-sm font-medium ${isSidebarOpen ? 'px-0' : 'px-2'}`}>
                    <NavLink
                        to="/organizer/dashboard"
                        end
                        className={({ isActive }) => getLinkClasses(isActive)}
                    >
                        <LayoutDashboard className={iconClass} />
                        <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Dashboard</motion.span>
                    </NavLink>
                    <NavLink
                        to="/organizer/dashboard/events"
                        className={({ isActive }) => getLinkClasses(isActive)}
                    >
                        <Calendar className={iconClass} />
                        <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Manage Events</motion.span>
                    </NavLink>

                    {/* Shudhu Admin-ra ei link-gulo dekhbe */}
                    {isAdmin && (
                        <>
                            <NavLink
                                to="/organizer/dashboard/organizers"
                                className={({ isActive }) => getLinkClasses(isActive)}
                            >
                                <Users className={iconClass} />
                                <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Manage Organizers</motion.span>
                            </NavLink>

                            {/* --- THE FIX IS HERE --- */}
                            <NavLink
                                to="/organizer/dashboard/categories"
                                className={({ isActive }) => getLinkClasses(isActive)}
                            >
                                <Layers className={iconClass} />
                                <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Manage Categories</motion.span>
                            </NavLink>

                            <NavLink
                                to="/organizer/dashboard/messages"
                                className={({ isActive }) => getLinkClasses(isActive)}
                            >
                                <Mail className={iconClass} />
                                <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Messages</motion.span>
                            </NavLink>
                        </>
                    )}
                </nav>
            </div>

            <div className={`mt-auto border-t border-neutral-700 p-4 ${!isSidebarOpen && 'p-2'}`}>
                <nav className="grid items-start gap-2 text-sm font-medium">

                    <NavLink
                        to="/organizer/dashboard/settings"
                        className={({ isActive }) => getLinkClasses(isActive)}
                    >
                        <Settings className={iconClass} />
                        <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Settings</motion.span>
                    </NavLink>
                    <button
                        onClick={() => handleLogout(dispatch, navigate)}
                        className={`flex w-full items-center rounded-lg py-3 text-error-500 transition-all cursor-pointer ${isSidebarOpen ? 'px-4 justify-start' : 'px-0 justify-center'} hover:bg-error-500/20 hover:text-error-500`}
                    >
                        <LogOut className={iconClass} />
                        <motion.span variants={linkTextVariants} animate={isSidebarOpen ? "open" : "closed"} className={`ml-3 ${textClass}`}>Logout</motion.span>
                    </button>
                </nav>
            </div>
        </motion.aside>
    );
}

export default AdminSidebar;