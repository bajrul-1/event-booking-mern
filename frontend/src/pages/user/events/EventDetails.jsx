import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById } from '../../../redux/features/events/eventsSlice.js';
import { useUser } from '@clerk/clerk-react';
import { LoaderCircle, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

function EventDetails() {
    const { eventId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // --- THE FIX IS HERE (Part 1) ---
    // 'user' er shathe 'isLoaded' state-ta-o ana hocche
    const { user, isLoaded, isSignedIn } = useUser();

    const { currentEvent: event, status, error } = useSelector((state) => state.events);

    useEffect(() => {
        if (eventId) {
            dispatch(fetchEventById(eventId));
        }
    }, [dispatch, eventId]);

    // Check if the event is in the past
    const isExpired = event ? new Date(event.date) < new Date() : false;

    const handleBookNow = (tier) => {
        if (!isLoaded) return;

        // --- Step 1: Check if user is logged in ---
        if (!isSignedIn) {
            toast.error("Please login first to book tickets!");
            navigate('/sign-in', { state: { from: location } });
            return;
        }

        // --- Step 2: Check User Data ---
        if (!user) {
            toast.error("User data not found. Please log in again.");
            return;
        }

        // --- Step 3: Check Profile Completion ---
        if (!user.publicMetadata || user.publicMetadata.profileComplete !== true) {
            toast.warn('Please complete your profile before booking.');
            navigate('/complete-profile', { state: { from: location } });
            return;
        }

        // --- Step 4: Proceed to Checkout ---
        navigate(`/checkout/${eventId}`, { state: { tierId: tier._id } });
    };

    // --- THE FIX IS HERE (Part 3) ---
    // Ekhon Redux 'status' ebong Clerk 'isLoaded' dutoi check kora hocche
    if (status === 'loading' || !isLoaded || (status === 'idle' && eventId)) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle size={48} className="animate-spin text-primary-500" /></div>;
    }

    if (status === 'failed' || !event) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center">
                <AlertTriangle size={64} className="text-error-500 mb-4" />
                <h2 className="text-3xl font-bold mb-2">Event Not Found</h2>
                <p className="text-neutral-600">{error || "The event you are looking for does not exist or is no longer available."}</p>
            </div>
        );
    }

    const publicTiers = event.ticketTiers.filter(tier => tier.access === 'public');

    return (
        <div className="bg-white dark:bg-neutral-900">
            {/* Dynamic SEO Tags */}
            <title>{event.title} - EventTickets | EventBooking</title>
            <meta name="description" content={`Book tickets for ${event.title} at ${event.location}. ${event.description?.substring(0, 150) || 'Join this amazing event'}...`} />
            <meta name="keywords" content={`${event.title}, ${event.category?.name || 'event'}, tickets, ${event.location}`} />

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <img
                            src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                            alt={event.title}
                            className="w-full h-[450px] object-cover rounded-2xl shadow-lg"
                            onError={(e) => {
                                e.target.style.display = 'none'; // Hide if broken
                            }}
                        />
                        <div className="mt-8">
                            <span className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full text-sm font-semibold">
                                {event.category?.name || 'Category'}
                            </span>
                            {isExpired && (
                                <span className="ml-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-sm font-semibold border border-red-200 dark:border-red-800">
                                    Event Ended
                                </span>
                            )}
                            <h1 className="text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mt-4">
                                {event.title}
                            </h1>
                            <div className="mt-6">
                                <h2 className="text-2xl font-semibold mb-3">About this event</h2>
                                <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl shadow-lg border dark:border-neutral-700">
                            <div className="pb-4 border-b dark:border-neutral-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <Calendar className="text-primary-500" size={20} />
                                    <span className="font-semibold">Date & Time</span>
                                </div>
                                <p className="text-neutral-700 dark:text-neutral-300">{formatDate(event.date)}</p>
                            </div>
                            <div className="py-4 border-b dark:border-neutral-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <MapPin className="text-primary-500" size={20} />
                                    <span className="font-semibold">Location</span>
                                </div>
                                <p className="text-neutral-700 dark:text-neutral-300">{event.location}</p>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-lg font-semibold mb-4">Select Your Ticket</h3>
                                <div className="space-y-4">
                                    {publicTiers.map(tier => (
                                        <div key={tier._id} className="flex justify-between items-center p-4 bg-white dark:bg-neutral-700 rounded-lg shadow-sm border dark:border-neutral-600">
                                            <div>
                                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{tier.name}</h4>
                                                <p className="text-primary-500 font-bold">₹{tier.price}</p>
                                            </div>
                                            <button
                                                onClick={() => handleBookNow(tier)}
                                                disabled={isExpired}
                                                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${isExpired
                                                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed dark:bg-neutral-600 dark:text-neutral-400'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                                    }`}
                                            >
                                                {isExpired ? 'Event Ended' : 'Book Now'}
                                            </button>
                                        </div>
                                    ))}

                                    {event.ticketTiers.filter(tier => tier.access !== 'public').map(tier => (
                                        <div key={tier._id} className="flex justify-between items-center p-4 bg-neutral-100 dark:bg-neutral-700/50 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-600 opacity-60">
                                            <div>
                                                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">{tier.name}</h4>
                                                <p className="text-primary-500 font-bold">₹{tier.price}</p>
                                            </div>
                                            <span className="text-xs font-medium text-neutral-500">Organizer Only</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventDetails;