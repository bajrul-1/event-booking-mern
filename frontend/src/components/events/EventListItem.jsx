import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';

// Indian locale-e date and time format korar jonno helper function
const formatDateTime = (isoString) => new Date(isoString).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
});

function EventListItem({ event }) {
    if (!event) return null;

    // Ticket-er shurur daam-ta ticketTiers array theke ber kora hocche
    // 0-price er admin/VIP ticket ignore kora hocche jodi paid ticket thake
    let startingPrice = 0;
    if (event.ticketTiers?.length > 0) {
        const paidTiers = event.ticketTiers.filter(tier => tier.price > 0);
        if (paidTiers.length > 0) {
            startingPrice = Math.min(...paidTiers.map(tier => tier.price));
        } else {
            startingPrice = 0; // Shob ticket free hole 0
        }
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-primary-500 flex flex-col md:flex-row">
            {/* Left Column: Image */}
            <div className="md:w-80 md:flex-shrink-0">
                <img
                    className="w-full h-48 md:h-full object-cover"
                    src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                    alt={event.title}
                    onError={(e) => {
                        e.target.style.display = 'none'; // Hide if broken
                    }}
                />
            </div>

            {/* Right Column: ALL Content (Image chara) */}
            {/* THE FIX: Ei column-take 'flex flex-col' kora hoyeche jate bhetorer content align kora jay */}
            <div className="p-6 flex flex-col flex-grow">

                {/* Top section: Shob text details ekhane thakbe */}
                {/* 'flex-grow' ensure korbe je ei section-ta joto-khushi boro hote parbe */}
                <div className="flex-grow">
                    <span className="text-secondary-500 font-semibold text-sm">{event.category?.name}</span>
                    <h2 className="mt-1 text-2xl font-bold font-heading text-neutral-800 dark:text-neutral-100">
                        <Link to={`/events/${event._id}`} className="hover:underline">
                            {event.title}
                        </Link>
                    </h2>
                    <div className="mt-2 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDateTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                    {/* Description ekhon shobshomoy 2 line dekhabe */}
                    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {event.description}
                    </p>
                </div>

                {/* Bottom section: Price and Action */}
                {/* 'mt-auto' class-ta ei section-take shobshomoy card-er niche pathiye debe */}
                <div className="mt-auto pt-4 border-t border-dashed border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-neutral-500">Starts from</p>
                        <p className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">₹{startingPrice}</p>
                    </div>
                    <Link to={`/events/${event._id}`} className="w-auto text-center text-base font-semibold text-white bg-primary-500 px-6 py-3 rounded-lg transition-colors hover:bg-primary-600">
                        View Details
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default EventListItem;

