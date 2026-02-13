import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { LoaderCircle } from 'lucide-react';

function ProtectedRoute() {
    const { getToken, userId } = useAuth();
    const [isProfileComplete, setIsProfileComplete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        // Jodi user na thake, check korar dorkar nei
        if (!userId) {
            setIsLoading(false);
            return;
        }

        const checkProfile = async () => {
            try {
                const token = await getToken();
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Check kora hocche je phone and dob ache kina
                if (data.user && data.user.phone && data.user.dob) {
                    setIsProfileComplete(true);
                } else {
                    setIsProfileComplete(false);
                }
            } catch (error) {
                console.error("Profile check failed:", error);
                setIsProfileComplete(false); // Error holeo complete profile page-e pathano hobe
            } finally {
                setIsLoading(false);
            }
        };

        checkProfile();
    }, [userId, getToken, location.key]); // location.key change hole abar check korbe

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-neutral-50 dark:bg-neutral-950">
                <LoaderCircle size={48} className="animate-spin text-primary-500" />
            </div>
        );
    }

    if (isProfileComplete === false) {
        // Jodi profile complete na thake, user-ke ei page-e pathano hobe
        return <Navigate to="/complete-profile" state={{ from: location }} replace />;
    }

    // Jodi profile complete thake, tahole user je page-e jete cheyechilo, shekhane jabe
    return <Outlet />;
}

export default ProtectedRoute;

