import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Calendar, List, LoaderCircle, Edit, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
// --- NOTUN IMPORT ---
import { fetchOrganizerEvents, fetchAllEvents, fetchAllEventsForAdmin, updateEventStatus, deleteEvent } from '../../redux/features/events/eventsSlice.js';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react'; // Import Trash2 for delete icon

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function ManageEventsPage() {
    const dispatch = useDispatch();

    const { items: events, status, error } = useSelector((state) => state.events);
    const { organizer } = useSelector((state) => state.organizerAuth) || {};
    const isAdmin = organizer?.role === 'admin';

    const [activeTab, setActiveTab] = useState(isAdmin ? 'allEvents' : 'myEvents');

    useEffect(() => {
        // --- THE FIX IS HERE ---
        if (activeTab === 'myEvents') {
            dispatch(fetchOrganizerEvents());
        } else {
            // Jodi Admin hoy, tahole 'fetchAllEventsForAdmin' call korbe
            if (isAdmin) {
                dispatch(fetchAllEventsForAdmin());
            } else {
                // Jodi Organizer hoy, tahole public 'fetchAllEvents' call korbe
                dispatch(fetchAllEvents());
            }
        }
    }, [dispatch, activeTab, isAdmin]); // 'isAdmin'-ke dependency-te add kora holo

    useEffect(() => {
        if (error && (status === 'failed')) {
            toast.error(error);
        }
    }, [error, status]);

    const handleStatusToggle = (eventId, currentStatus) => {
        const newStatus = currentStatus === 'published' ? 'unleashed' : 'published';

        // Confirmation prompt before changing status
        if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
            dispatch(updateEventStatus({ eventId, status: newStatus }))
                .unwrap()
                .then(() => toast.success(`Event status updated to ${newStatus}`))
                .catch((err) => toast.error(err));
        }
    };

    const handleDelete = (eventId) => {
        if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            dispatch(deleteEvent(eventId))
                .unwrap()
                .then(() => toast.success("Event deleted successfully"))
                .catch((err) => toast.error(err));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-neutral-700">
                <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50">Manage Events</h1>
                <Link
                    to="/organizer/dashboard/events/create"
                    className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <Plus size={20} />
                    Create New Event
                </Link>
            </div>

            <div className="flex border-b border-gray-300 dark:border-neutral-700 mb-6">
                {!isAdmin && (
                    <button
                        onClick={() => setActiveTab('myEvents')}
                        className={`flex items-center gap-2 px-4 py-3 font-semibold ${activeTab === 'myEvents'
                            ? 'border-b-2 border-primary-500 text-primary-500'
                            : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                            }`}
                    >
                        <List className="h-5 w-5" />
                        <span>My Events</span>
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('allEvents')}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold ${activeTab === 'allEvents'
                        ? 'border-b-2 border-primary-500 text-primary-500'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                >
                    <Calendar className="h-5 w-5" />
                    <span>All Events</span>
                </button>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 p-6 border-b dark:border-neutral-700">
                    <h2 className="text-xl font-semibold">
                        {activeTab === 'myEvents' ? 'Your Current Events' : 'All Events in System'} ({events.length})
                    </h2>
                </div>

                {status === 'loading' && (
                    <div className="flex justify-center items-center h-64">
                        <LoaderCircle size={48} className="animate-spin text-primary-500" />
                    </div>
                )}

                {status === 'succeeded' && events.length === 0 && (
                    <div className="text-center py-20 text-neutral-500">
                        <Calendar size={48} className="mx-auto mb-3" />
                        <p>No events found in this view.</p>
                    </div>
                )}

                {status === 'succeeded' && events.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date & Time</th>

                                    {/* --- THE FIX IS HERE --- */}
                                    {/* "All Events" tab-e "Organizer" column dekhabe */}
                                    {activeTab === 'allEvents' && (
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Organizer</th>
                                    )}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {events.map((event) => {
                                    const isExpired = new Date(event.date) < new Date();
                                    return (
                                        <tr key={event._id} className={isExpired ? 'opacity-80' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12 relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                                                        {event.imageUrl ? (
                                                            <>
                                                                <img
                                                                    src={event.imageUrl.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                                                                    alt={event.title}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'flex';
                                                                    }}
                                                                />
                                                                <div className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 items-center justify-center font-bold text-lg hidden">
                                                                    {event.title?.[0] || 'E'}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-lg">
                                                                {event.title?.[0] || 'E'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{event.title}</div>
                                                        <div className="text-sm text-neutral-500 dark:text-neutral-400">{event.location}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{formatDate(event.date)}</td>

                                            {activeTab === 'allEvents' && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                                                    {event.organizer?.name?.firstName || 'N/A'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isExpired ? (
                                                    <div className="flex items-center gap-1 text-sm font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-flex">
                                                        <span>Expired</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStatusToggle(event._id, event.status)}
                                                        className={`flex items-center gap-1 text-sm font-medium ${event.status === 'published' ? 'text-green-500' : 'text-neutral-400'}`}
                                                    >
                                                        {event.status === 'published' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                        <span className="capitalize">{event.status === 'unleashed' ? 'Unleashed' : event.status}</span>
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/events/${event._id}`} className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors" title="View Event">
                                                        <Eye size={18} />
                                                    </Link>
                                                    {!isExpired && (
                                                        <Link to={`/organizer/dashboard/events/edit/${event._id}`} className="text-primary-500 hover:text-primary-600 p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-colors" title="Edit Event">
                                                            <Edit size={18} />
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(event._id)}
                                                        className="text-error-500 hover:text-error-600 p-2 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-full transition-colors"
                                                        title="Delete Event"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ManageEventsPage;