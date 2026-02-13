import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, setCategory, setLocation, setSortBy, resetFilters, } from '../redux/features/filtersSlice';
import { Search, MapPin, Tag, ListFilter, RotateCcw } from 'lucide-react';

function SearchFilterBar() {
    const dispatch = useDispatch();
    const filters = useSelector((state) => state.filters);

    // Dummy data for categories. Pore eta API theke ashte pare.
    const categories = ['All', 'Music', 'Tech', 'Art', 'Sports', 'Food'];

    const handleReset = () => {
        dispatch(resetFilters());
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                {/* Search Input */}
                <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for an event..."
                        value={filters.searchQuery}
                        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <select
                        value={filters.category}
                        onChange={(e) => dispatch(setCategory(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Location Filter */}
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <input
                        type="text"
                        placeholder="Location"
                        value={filters.location}
                        onChange={(e) => dispatch(setLocation(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {/* Sort By Filter */}
                <div className="relative">
                    <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                    <select
                        value={filters.sortBy}
                        onChange={(e) => dispatch(setSortBy(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>

            </div>
            {/* Reset Button */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 transition-colors"
                >
                    <RotateCcw size={16} />
                    Reset Filters
                </button>
            </div>
        </div>
    );
}

export default SearchFilterBar;
