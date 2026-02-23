import { NavLink } from "react-router-dom";
// FIX: Corrected the import path for react-icons
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa6";
import { Send } from "lucide-react"; // Using lucide-react as per your package.json
import { useSelector } from 'react-redux';

function Footer() {
    const { data: settings } = useSelector((state) => state.settings);
    const linkClass = "font-body text-neutral-700 dark:text-neutral-300 hover:text-primary-500 transition-colors duration-300";
    const socialIconClass = "w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-800 dark:text-neutral-200 hover:bg-primary-500 hover:text-white transition-all duration-300 transform hover:scale-110";

    return (
        <footer className="bg-neutral-100 dark:bg-neutral-900 py-12 border-t border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* Left: Logo, Description, Copyright */}
                    <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
                        <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-primary-500 to-secondary-500 text-transparent bg-clip-text">
                            {settings?.siteName || 'EventBooking'}
                        </h2>
                        <p className="mt-4 text-neutral-700 dark:text-neutral-300 max-w-xs">
                            {settings?.seoDescription || "The ultimate platform to discover, book, and host unforgettable events."}
                        </p>
                        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
                            &copy; {new Date().getFullYear()} {settings?.siteName || 'EventBooking'}. All rights reserved.
                        </p>
                    </div>

                    {/* Center: Quick Links */}
                    <div className="md:col-span-4 flex flex-col items-center">
                        <h3 className="text-xl font-semibold font-heading text-neutral-800 dark:text-neutral-200 mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 text-center">
                            <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
                            <li><NavLink to="/events" className={linkClass}>All Events</NavLink></li>
                            <li><NavLink to="/organizer" className={linkClass}>Become an Organizer</NavLink></li>
                            <li><NavLink to="/contact" className={linkClass}>Contact Us</NavLink></li>
                        </ul>
                    </div>

                    {/* Right: Newsletter & Social */}
                    <div className="md:col-span-4 flex flex-col items-center md:items-end">
                        <h3 className="text-xl font-semibold font-heading text-neutral-800 dark:text-neutral-200 mb-4">
                            Stay Updated
                        </h3>
                        <form className="w-full max-w-sm">
                            <div className="relative flex items-center">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full pl-4 pr-12 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button type="submit" className="absolute right-2 p-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors" aria-label="Subscribe">
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                        <div className="flex space-x-4 mt-6">
                            {settings?.socialLinks?.facebook && <a href={settings.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="Facebook"><FaFacebookF /></a>}
                            {settings?.socialLinks?.twitter && <a href={settings.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="Twitter"><FaTwitter /></a>}
                            {settings?.socialLinks?.instagram && <a href={settings.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="Instagram"><FaInstagram /></a>}
                            {settings?.socialLinks?.linkedin && <a href={settings.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="LinkedIn"><FaLinkedinIn /></a>}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
