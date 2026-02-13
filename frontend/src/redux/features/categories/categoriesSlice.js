import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Thunk 1: Fetch ALL Categories (Public) ---
// Ei function-ta Home page-e use hobe
export const fetchAllCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
            return data.categories; // Shudhu 'active' category ashbe
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories.');
        }
    }
);

// --- Thunk 2: Fetch ALL Categories (Admin) ---
// Ei function-ta dashboard-e use hobe (ekhon-er jonno public route-i call korche)
export const fetchAllCategoriesForAdmin = createAsyncThunk(
    'categories/fetchAllForAdmin',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
            return data.categories;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories.');
        }
    }
);

// --- Thunk 3: Create a new category (Admin) ---
export const createNewCategory = createAsyncThunk(
    'categories/create',
    async (categoryData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/categories/create`,
                categoryData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return data.category;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category.');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoryError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All (Public)
            .addCase(fetchAllCategories.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllCategories.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllCategories.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch All (Admin)
            .addCase(fetchAllCategoriesForAdmin.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllCategoriesForAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllCategoriesForAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Create New Category
            .addCase(createNewCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createNewCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createNewCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearCategoryError } = categoriesSlice.actions;
export default categoriesSlice.reducer;