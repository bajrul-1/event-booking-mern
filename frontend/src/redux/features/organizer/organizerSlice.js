import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch ALL organizers
export const fetchAllOrganizers = createAsyncThunk(
    'organizers/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/organizers`, // Assuming this is the GET endpoint
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return data.organizers; // Assuming backend returns { organizers: [...] }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch organizers.');
        }
    }
);

// Thunk to create a new organizer
export const createNewOrganizer = createAsyncThunk(
    'organizers/create',
    async (organizerData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/organizers/create`,
                organizerData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': organizerData instanceof FormData ? 'multipart/form-data' : 'application/json'
                    }
                }
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create organizer.');
        }
    }
);

// Thunk to update organizer details
export const updateOrganizer = createAsyncThunk(
    'organizers/update',
    async ({ id, organizerData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/organizers/${id}`,
                organizerData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': organizerData instanceof FormData ? 'multipart/form-data' : 'application/json'
                    }
                }
            );
            return data.organizer;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update organizer.');
        }
    }
);

// Thunk to update organizer status
export const updateOrganizerStatus = createAsyncThunk(
    'organizers/updateStatus',
    async ({ id, status }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/organizers/${id}/status`,
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return data.organizer;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status.');
        }
    }
);

// Thunk to delete an organizer
export const deleteOrganizer = createAsyncThunk(
    'organizers/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/organizers/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete organizer.');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const organizerSlice = createSlice({
    name: 'organizers',
    initialState,
    reducers: {
        clearOrganizerError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create new organizer cases
            .addCase(createNewOrganizer.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createNewOrganizer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload.organizer);
            })
            .addCase(createNewOrganizer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Fetch all organizers cases
            .addCase(fetchAllOrganizers.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllOrganizers.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllOrganizers.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Update status cases
            .addCase(updateOrganizerStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(org => org._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Update details cases
            .addCase(updateOrganizer.fulfilled, (state, action) => {
                const index = state.items.findIndex(org => org._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            // Delete cases
            .addCase(deleteOrganizer.fulfilled, (state, action) => {
                state.items = state.items.filter(org => org._id !== action.payload);
            });
    },
});

export const { clearOrganizerError } = organizerSlice.actions;
export default organizerSlice.reducer;