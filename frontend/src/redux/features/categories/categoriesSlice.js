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
            const { token } = getState().organizerAuth;
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

// --- Thunk 4: Update a category (Admin) ---
export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, categoryData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
                categoryData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.category;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category.');
        }
    }
);

// --- Thunk 5: Delete a category (Admin) ---
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category.');
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
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.items.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = state.items.filter(item => item._id !== action.payload);
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearCategoryError } = categoriesSlice.actions;
export default categoriesSlice.reducer;