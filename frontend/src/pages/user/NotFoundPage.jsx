import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

// A simple, fun SVG illustration for the 404 page
const LostIllustration = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-8 text-primary-500">
        <path d="M100 25C141.421 25 175 58.5786 175 100C175 141.421 141.421 175 100 175C58.5786 175 25 141.421 25 100C25 58.5786 58.5786 25 100 25Z" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 75V100" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M100 137.5C103.452 137.5 106.25 134.702 106.25 131.25C106.25 127.798 103.452 125 100 125C96.5482 125 93.75 127.798 93.75 131.25C93.75 134.702 96.5482 137.5 100 137.5Z" fill="currentColor" />
        <path d="M62.5 75C62.5 75 75 62.5 100 62.5C125 62.5 137.5 75 137.5 75" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


function NotFoundPage() {
    return (
        <main className="bg-neutral-50 dark:bg-neutral-950 min-h-screen flex items-center justify-center text-center px-4">
            <div className="max-w-md">
                <LostIllustration />
                <h1 className="text-6xl md:text-8xl font-bold font-heading text-neutral-800 dark:text-neutral-100">
                    404
                </h1>
                <h2 className="mt-4 text-2xl md:text-3xl font-semibold font-alt text-neutral-700 dark:text-neutral-300">
                    Oops! Page Not Found
                </h2>
                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/"
                    className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-lg"
                >
                    <Home size={18} />
                    Go to Homepage
                </Link>
            </div>
        </main>
    );
}

export default NotFoundPage;

