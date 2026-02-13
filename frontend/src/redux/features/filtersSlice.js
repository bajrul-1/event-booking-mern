import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    searchQuery: '',
    category: 'all',
    location: '',
    sortBy: 'date-desc',
    currentPage: 1,
};

export const filtersSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        // Combined action to set search query and reset page to 1
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.currentPage = 1; // Reset page on new search
        },
        // Combined action to set category and reset page to 1
        setCategory: (state, action) => {
            state.category = action.payload;
            state.currentPage = 1; // Reset page on new category
        },
        // Combined action to set location and reset page to 1
        setLocation: (state, action) => {
            state.location = action.payload;
            state.currentPage = 1; // Reset page on new location
        },
        // Action to set the sorting option (doesn't reset page)
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        // Action to set the current page directly
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        // Action to reset all filters to their initial state
        resetFilters: (state) => {
            state.searchQuery = '';
            state.category = 'all';
            state.location = '';
            state.sortBy = 'date-desc';
            state.currentPage = 1; // Also reset page here
        },
    },
});

// Export the actions for use in components
export const {
    setSearchQuery,
    setCategory,
    setLocation,
    setSortBy,
    resetFilters,
    setCurrentPage,
} = filtersSlice.actions;

// Export the reducer to be added to the store
export default filtersSlice.reducer;