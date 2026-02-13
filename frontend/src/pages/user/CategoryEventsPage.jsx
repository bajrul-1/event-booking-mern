import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents } from './../../redux/features/events/eventsSlice.js';
import { fetchAllCategories } from './../../redux/features/categories/categoriesSlice.js';
import EventListItem from './../../components/events/EventListItem';
import Pagination from './../../components/Pagination';
import { LoaderCircle, ServerCrash, ArrowLeft } from 'lucide-react';


function CategoryEventsPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();

    // Redux store theke data ana hocche
    const { items: allEvents, status: eventStatus } = useSelector(state => state.events);
    const { items: allCategories, status: categoryStatus } = useSelector(state => state.categories);

    // Pagination-er jonno state
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5; // Proti page-e 5-ta event dekhabe

    // Component load howar shathe shathe data fetch kora hocche
    useEffect(() => {
        if (eventStatus === 'idle' || allEvents.length === 0) {
            dispatch(fetchAllEvents());
        }
        if (categoryStatus === 'idle' || allCategories.length === 0) {
            dispatch(fetchAllCategories());
        }
    }, [eventStatus, categoryStatus, dispatch, allEvents.length, allCategories.length]);

    // Loading state handle kora
    if (eventStatus === 'loading' || categoryStatus === 'loading') {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle size={48} className="animate-spin text-primary-500" /></div>;
    }

    // Current category and filtered events ber kora
    const currentCategory = allCategories.find(cat => cat.slug === slug);
    const filteredEvents = allEvents.filter(event => event.category?.slug === slug);

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const currentEventsOnPage = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const handlePageChange = (page) => setCurrentPage(page);

    return (
        <main className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center gap-2 text-primary-500 hover:underline mb-8 font-semibold">
                    <ArrowLeft size={18} /> Back to Home
                </Link>

                {currentCategory ? (
                    <div>
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold font-heading text-neutral-800 dark:text-neutral-100">
                                Events in <span className="text-primary-500">{currentCategory.name}</span>
                            </h1>
                            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">{currentCategory.description}</p>
                        </div>

                        {filteredEvents.length > 0 ? (
                            <>
                                <div className="space-y-8">
                                    {currentEventsOnPage.map(event => (
                                        <EventListItem key={event._id} event={event} />
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        ) : (
                            <div className="text-center py-20 text-neutral-500">
                                <p>No events found in this category right now.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-20"><p>Category not found.</p></div>
                )}
            </div>
        </main>
    );
}

export default CategoryEventsPage;

