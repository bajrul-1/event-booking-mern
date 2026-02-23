import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch global settings
export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`);
            if (response.data.success) {
                return response.data.settings;
            } else {
                return rejectWithValue('Failed to fetch settings');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error fetching settings');
        }
    }
);

const initialState = {
    data: {
        siteName: 'Event Booking',
        contactEmail: '',
        contactPhone: '',
        contactAddress: 'Bankura, West Bengal, India',
        currency: 'INR',
        socialLinks: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        },
        seoDescription: ''
    },
    loading: false,
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        // Reducer to manually update settings in state after save in Admin panel
        updateSettingsLocally: (state, action) => {
            state.data = { ...state.data, ...action.payload };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { updateSettingsLocally } = settingsSlice.actions;
export default settingsSlice.reducer;
