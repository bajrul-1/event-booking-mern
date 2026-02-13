import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllEvents } from '../../redux/features/events/eventsSlice.js';
import { useSearchParams } from 'react-router-dom';
import { setSearchQuery, setCategory } from '../../redux/features/filtersSlice.js';
import SearchFilterBar from '../../components/SearchFilterBar.jsx';
import EventListItem from '../../components/events/EventListItem.jsx';
import { LoaderCircle, Ticket, ServerCrash } from 'lucide-react';


// Helper function to get the starting price of an event (ignoring 0-price internal/admin tickets)
const getStartingPrice = (event) => {
  if (!event.ticketTiers || event.ticketTiers.length === 0) return 0;

  const paidTiers = event.ticketTiers.filter(tier => tier.price > 0);

  if (paidTiers.length > 0) {
    return Math.min(...paidTiers.map(tier => tier.price));
  }

  return 0; // If all tickets are free, return 0
};

function Events() {
  const dispatch = useDispatch();
  const { items: allEvents, status, error } = useSelector((state) => state.events);
  const filters = useSelector((state) => state.filters);

  // Infinite Scroll State
  const [displayedCount, setDisplayedCount] = useState(6);
  const LOAD_MORE_COUNT = 6;

  // Observer ref for infinite scrolling
  const observer = useRef();

  useEffect(() => {
    if (status === 'idle' || (status !== 'loading' && allEvents.length === 0)) {
      dispatch(fetchAllEvents());
    }
  }, [status, dispatch, allEvents.length]);

  // Sync URL Params with Redux
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('search');
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (queryParam) {
      dispatch(setSearchQuery(queryParam));
    }
    if (categoryParam) {
      dispatch(setCategory(categoryParam));
    }
  }, [queryParam, categoryParam, dispatch]);


  // --- Dynamic Filtering and Sorting Logic ---
  const processedEvents = (allEvents || [])
    .filter(event => {
      if (!event || !event.title || !event.location) return false;
      const searchMatch = event.title.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const categoryMatch = filters.category === 'all' || event.category?.slug === filters.category;
      const locationMatch = event.location.toLowerCase().includes(filters.location.toLowerCase());
      return searchMatch && categoryMatch && locationMatch;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return getStartingPrice(a) - getStartingPrice(b);
        case 'price-desc':
          return getStartingPrice(b) - getStartingPrice(a);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(LOAD_MORE_COUNT);
  }, [filters]);

  const currentEvents = processedEvents.slice(0, displayedCount);
  const hasMore = displayedCount < processedEvents.length;

  // Last Element Reference for Intersection Observer
  const lastEventElementRef = useCallback(node => {
    if (status === 'loading') return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setDisplayedCount(prevCount => prevCount + LOAD_MORE_COUNT);
      }
    });

    if (node) observer.current.observe(node);
  }, [status, hasMore]);


  return (
    <main className="bg-neutral-100 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar Section */}
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-lg mb-12 border border-neutral-200 dark:border-neutral-700">
          <h1 className="text-3xl font-bold font-heading text-neutral-800 dark:text-gray-100 mb-4">Find Your Next Experience</h1>
          <SearchFilterBar />
        </div>

        {/* Events List Section */}
        <div>
          {status === 'loading' && <LoadingState />}
          {status === 'failed' && <ErrorState message={error} />}
          {status === 'succeeded' && (
            currentEvents.length > 0 ? (
              <div className="space-y-8">
                {currentEvents.map((event, index) => {
                  if (currentEvents.length === index + 1) {
                    return (
                      <div ref={lastEventElementRef} key={event._id}>
                        <EventListItem event={event} />
                      </div>
                    );
                  } else {
                    return <EventListItem key={event._id} event={event} />;
                  }
                })}

                {/* Loading More Indicator */}
                {hasMore ? (
                  <div className="flex justify-center py-8">
                    <LoaderCircle size={32} className="animate-spin text-primary-500" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-neutral-500 dark:text-neutral-400 opacity-60">
                    <div className="w-12 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-full mb-3"></div>
                    <p className="text-sm font-medium tracking-wide">You've reached the end of the list</p>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState />
            )
          )}
        </div>
      </div>
    </main>
  );
}

// Helper Components
const LoadingState = () => <div className="flex justify-center py-20"><LoaderCircle size={48} className="animate-spin text-primary-500" /></div>;
const ErrorState = ({ message }) => (
  <div className="text-center py-24 px-6 bg-white dark:bg-neutral-800 rounded-xl">
    <ServerCrash size={56} className="mx-auto text-error-500" />
    <h2 className="mt-6 text-2xl font-bold text-neutral-800 dark:text-neutral-100">Failed to Load Events</h2>
    <p className="mt-2 text-neutral-500 dark:text-neutral-400">{message}</p>
  </div>
);
const EmptyState = () => (
  <div className="text-center py-24 px-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
    <Ticket size={56} className="mx-auto text-neutral-400" />
    <h2 className="mt-6 text-2xl font-bold text-neutral-800 dark:text-neutral-100">No Events Found</h2>
    <p className="mt-2 text-neutral-500 dark:text-neutral-400">No events matched your filter criteria. Try adjusting your search.</p>
  </div>
);

export default Events;

