import { LoaderCircle, SearchX } from 'lucide-react';
import EventCard from './EventCard'; // Make sure this path is correct

// EventGrid is now a "dumb" component. It just displays what it's given.
function EventGrid({ events, isLoading }) {
    // Loading State
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle size={48} className="animate-spin text-primary-500" />
                <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">Loading Events...</p>
            </div>
        );
    }

    // No Results State
    if (!events || events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
                <SearchX size={64} className="text-secondary-500" />
                <h3 className="mt-6 text-2xl font-bold text-neutral-800 dark:text-neutral-100">No Events Found</h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Try adjusting your search or filter criteria.</p>
            </div>
        );
    }

    // Render the grid of events
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
                <EventCard key={event.id} event={event} />
            ))}
        </div>
    );
}

export default EventGrid;