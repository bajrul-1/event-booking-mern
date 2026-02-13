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

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <Link to={`/events/${event._id}`}>
                <div className="relative">
                    <img
                        src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                        alt={event.title}
                        className="w-full h-56 object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none'; // Hide if broken, or could set a placeholder
                            // e.target.src = 'placeholder_url'; 
                        }}
                    />
                    {/* ✅ FIX: Category name-এর জন্য optional chaining ব্যবহার করা হয়েছে */}
                    <div className="absolute top-4 left-4 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {event.category?.name || 'Category'}
                    </div>
                </div>
            </Link>

            <div className="p-6">
                <h3 className="text-xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-2 truncate">
                    {event.title}
                </h3>

                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm mb-2">
                    <Calendar size={16} />
                    <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm mb-4">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-primary-500">
                        {startingPrice}
                    </span>
                    <Link
                        to={`/events/${event._id}`}
                        className="bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                    >
                        Book Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default EventCard;