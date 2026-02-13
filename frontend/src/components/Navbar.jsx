import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/features/themeSlice"; // Adjust path if needed
import { Sun, Moon, Menu, X, Ticket, User, LogOut } from "lucide-react";
import { SignedIn, SignedOut, useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { toast } from 'react-toastify';


// === Custom User Button with Dropdown (Notun and Sothik Version) ===
const CustomUserButton = () => {
    const { user } = useUser();
    const { signOut, openUserProfile } = useClerk();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Dropdown-er baire click korle sheta bondho hoye jabe
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            {/* User Profile Image Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <img src={user.imageUrl} alt={user.fullName || 'User avatar'} className="w-9 h-9 rounded-full object-cover" />
            </button>

            {/* Custom Dropdown Menu */}
            {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 origin-top-right bg-white dark:bg-neutral-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                        <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Signed in as</p>
                            <p className="font-semibold text-neutral-800 dark:text-neutral-100 truncate">{user.fullName}</p>
                        </div>

                        <button
                            onClick={() => { openUserProfile(); setIsMenuOpen(false); }}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <User size={16} />
                            Manage Account
                        </button>

                        <NavLink
                            to="/my-tickets"
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            <Ticket size={16} />
                            My Tickets
                        </NavLink>

                        <div className="border-t border-neutral-200 dark:border-neutral-700 my-1"></div>

                        <button
                            onClick={() => signOut({ redirectUrl: '/' })}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// === Main Header Component ===
function Header() {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.theme);
    const [isOpen, setIsOpen] = useState(false);

    const handleThemeToggle = () => dispatch(toggleTheme());
    const handleMenuToggle = () => setIsOpen(!isOpen);



    const { getToken } = useAuth();
    const { isSignedIn, user, isLoaded } = useUser();
    
    useEffect(() => {
        const syncUserData = async () => {
            if (isSignedIn && isLoaded && !sessionStorage.getItem('userSynced')) {
                try {
                    const token = await getToken();
                    await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    toast.success(`Welcome back ${user.fullName}`);

                    sessionStorage.setItem('userSynced', 'true');
                } catch (error) {
                    console.error('Error syncing user data:', error);
                    toast.error("Could not verify your profile. Please try refreshing.");
                }
            }
        };
        syncUserData();
    }, [isSignedIn, user, getToken]);


    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const linkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md font-medium transition-colors duration-200 ${isActive
            ? "text-primary-500"
            : "text-neutral-600 dark:text-neutral-300 hover:text-primary-500"
        }`;

    const mobileLinkClass = "block px-3 py-2 rounded-md text-base font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700";

    return (
        <header className="bg-white dark:bg-neutral-900 shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 relative">
                {/* Left Section: Logo */}
                <div className="flex-shrink-0">
                    <NavLink to="/" className="text-2xl font-bold text-primary-500 font-heading">EventBooking</NavLink>
                </div>

                {/* Middle Section: Desktop Nav (Centered) */}
                <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 space-x-4 font-body">
                    <NavLink to="/" className={linkClass}>Home</NavLink>
                    <NavLink to="/events" className={linkClass}>Events</NavLink>
                    <NavLink to="/about" className={linkClass}>About</NavLink>
                    <NavLink to="/contact" className={linkClass}>Contact</NavLink>
                </nav>

                {/* Right Section: Auth, Theme Toggle, Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <CustomUserButton />
                    </SignedIn>
                    <SignedOut>
                        <NavLink to="/sign-in" className="px-4 py-2 bg-primary-500 text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-all">
                            Sign In
                        </NavLink>
                    </SignedOut>

                    {/* THE FIX: Icon-er color thik kora hoyeche */}
                    <button
                        onClick={handleThemeToggle}
                        className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                    >
                        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    {/* THE FIX: Icon-er color thik kora hoyeche */}
                    <button
                        className="md:hidden p-2 text-neutral-600 dark:text-neutral-300"
                        onClick={handleMenuToggle}
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to="/" className={mobileLinkClass} onClick={handleMenuToggle}>Home</NavLink>
                        <NavLink to="/events" className={mobileLinkClass} onClick={handleMenuToggle}>Events</NavLink>
                        <NavLink to="/about" className={mobileLinkClass} onClick={handleMenuToggle}>About</NavLink>
                        <NavLink to="/contact" className={mobileLinkClass} onClick={handleMenuToggle}>Contact</NavLink>
                    </div>
                </div>
            )}
        </header>
    );
}

export default Header;

