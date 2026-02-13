import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

// --- THE FINAL FIX IS HERE ---
// Path '/organizer/' theke '/organizerAuth/' kora hoyeche
import { loadOrganizer } from '../redux/features/organizer/organizerAuthSlice.js';

function OrganizerProtectedRoute() {
    const dispatch = useDispatch();
    const { token, initialStatus, organizer } = useSelector((state) => state.organizerAuth) || {};

    useEffect(() => {
        if (token && !organizer && initialStatus === 'idle') {
            dispatch(loadOrganizer());
        }
    }, [token, organizer, initialStatus, dispatch]);

    if ((initialStatus === 'loading' || initialStatus === 'idle') && token) {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoaderCircle size={48} className="animate-spin text-primary-500" />
            </div>
        );
    }

    if (token && organizer) {
        return <Outlet />;
    }

    return <Navigate to="/organizer" replace />;
}

export default OrganizerProtectedRoute;