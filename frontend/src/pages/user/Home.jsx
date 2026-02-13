import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents } from '../../redux/features/events/eventsSlice.js';
import HomeHeroSection from "../../components/HomeHeroSection.jsx";
import FeaturedEvents from "../../components/FeaturedEvents.jsx";
import CategorySection from "../../components/CategorySection.jsx";
import HowItWorksSection from "../../components/HowItWorksSection.jsx";
import TestimonialsSection from "../../components/TestimonialsSection.jsx";
import { LoaderCircle, ServerCrash } from 'lucide-react';

function Home() {
    const dispatch = useDispatch();

    const { items: allEvents, status, error } = useSelector((state) => state.events);

    useEffect(() => {
        if (status === 'idle' || (status !== 'loading' && allEvents.length === 0)) {
            dispatch(fetchAllEvents());
        }
    }, [status, dispatch, allEvents.length]);


    // Upcoming event-gulo-ke filter kora hocche
    const upcomingEvents = Array.isArray(allEvents)
        ? allEvents
            .filter(event => new Date(event.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
        : [];

    const featuredEvents = upcomingEvents.slice(0, 3);

    return (
        <>
            <HomeHeroSection
                backgroundImage="https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=2070&auto-format&fit-crop"
                eventImage="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto-format&fit-crop"
            />

            {/* Loading State */}
            {status === 'loading' && (
                <div className="flex justify-center items-center py-20">
                    <LoaderCircle size={48} className="animate-spin text-primary-500" />
                </div>
            )}

            {/* Error State */}
            {status === 'failed' && (
                <div className="text-center py-20 text-error-500">
                    <ServerCrash size={48} className="mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Failed to load events</h2>
                    <p>{error}</p>
                </div>
            )}

            {/* Success State */}
            {status === 'succeeded' && (
                <>
                    <FeaturedEvents events={featuredEvents} />
                    <CategorySection />
                    <HowItWorksSection />
                    <TestimonialsSection />
                </>
            )}
        </>
    );
};

export default Home;

