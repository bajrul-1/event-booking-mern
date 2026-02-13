import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

function AdminRoute() {
    const { organizer, initialStatus } = useSelector((state) => state.organizerAuth) || {};

    if (initialStatus === 'loading' || initialStatus === 'idle') {
        return (
            <div className="flex justify-center items-center h-screen">
                <LoaderCircle size={48} className="animate-spin text-primary-500" />
            </div>
        );
    }

    if (organizer && organizer.role === 'admin') {
        return <Outlet />;
    }

    return <Navigate to="/organizer/dashboard" replace />;
}

export default AdminRoute;