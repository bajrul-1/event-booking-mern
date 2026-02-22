import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

// --- Helper Function: Minimum Price calculation (VIP BAD DEYA) ---
const getStartingPrice = (ticketTiers) => {
    if (!ticketTiers || ticketTiers.length === 0) {
        return 'Free';
    }

    // ✅ FIX: শুধুমাত্র 'public' access থাকা টিয়ারগুলি বিবেচনা করা হলো 
    const publicTiers = ticketTiers.filter(tier => tier.access === 'public');

    if (publicTiers.length === 0) {
        return 'N/A'; // যদি কোনো public ticket না থাকে
    }

    // Public tier-gulo theke shobcheye kom price-ta ber kora hocche
    const prices = publicTiers.map(tier => tier.price);
    const minPrice = Math.min(...prices);

    if (minPrice === 0) {
        return 'Free';
    }

    return `Starting from ₹${minPrice}`;
};

// Date format korar helper function
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

function EventCard({ event }) {
    const startingPrice = getStartingPrice(event.ticketTiers);
    const isExpired = new Date(event.date) < new Date();

    return (
        <div className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl ${isExpired ? 'opacity-75' : ''}`}>
            <Link to={`/events/${event._id}`} className={isExpired ? 'cursor-default' : ''}>
                <div className="relative">
                    <img
                        src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                        alt={event.title}
                        className={`w-full h-56 object-cover ${isExpired ? 'grayscale' : ''}`}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                    <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-semibold ${isExpired ? 'bg-neutral-500' : 'bg-primary-500'}`}>
                        {event.category?.name || 'Category'}
                    </div>
                    {isExpired && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Expired
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-6">
                <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-2 truncate">
                    {event.title}
                </h3>

                <div className={`flex items-center gap-2 text-sm mb-2 ${isExpired ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                </div>

                <div className={`flex items-center gap-2 text-sm mb-4 ${isExpired ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    <MapPin size={16} />
                    <span>{event.location}</span>
                </div>

                <div className="flex justify-between items-center">
                    {isExpired ? (
                        <span className="text-red-500 font-semibold w-full text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
                            This event has ended
                        </span>
                    ) : (
                        <>
                            <span className="text-xl font-bold text-primary-500">
                                {startingPrice}
                            </span>
                            <Link
                                to={`/events/${event._id}`}
                                className="bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                            >
                                Book Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EventCard;