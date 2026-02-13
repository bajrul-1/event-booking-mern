import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Thunks remain the same ---

export const fetchAvailableCoupons = createAsyncThunk(
    'coupons/fetchAvailable',
    async ({ eventId, categoryId }, { rejectWithValue }) => {
        try {
            const token = await window.Clerk.session.getToken();
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons/available?eventId=${eventId}&categoryId=${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Could not fetch coupons.');
        }
    }
);

export const validateCoupon = createAsyncThunk(
    'coupons/validate',
    async ({ code, subtotal, eventId }, { rejectWithValue }) => {
        try {
            const token = await window.Clerk.session.getToken();
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/coupons/validate`,
                { code, subtotal, eventId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.coupon;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Coupon validation failed.');
        }
    }
);


const couponsSlice = createSlice({
    name: 'coupons',
    initialState: {
        available: [],
        applied: null,
        // --- THE FIX IS HERE: Separate states for fetching and validating ---
        fetchStatus: 'idle',      // For the list of coupons
        fetchError: null,
        validationStatus: 'idle', // For applying a single coupon
        validationError: null,
        noCouponsMessage: ''
    },
    reducers: {
        removeAppliedCoupon: (state) => {
            state.applied = null;
            state.validationError = null;
        },
        // Notun reducer ja shudhu validation error clear korbe
        clearValidationError: (state) => {
            state.validationError = null;
            state.validationStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // === Cases for fetching available coupons ===
            .addCase(fetchAvailableCoupons.pending, (state) => {
                state.fetchStatus = 'loading';
                state.fetchError = null;
            })
            .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
                state.fetchStatus = 'succeeded';
                state.available = action.payload.coupons;
                state.noCouponsMessage = action.payload.message || '';
            })
            .addCase(fetchAvailableCoupons.rejected, (state, action) => {
                state.fetchStatus = 'failed';
                state.fetchError = action.payload;
            })
            // === Cases for validating a single coupon ===
            .addCase(validateCoupon.pending, (state) => {
                state.validationStatus = 'loading';
                state.validationError = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.validationStatus = 'succeeded';
                state.applied = action.payload;
                state.validationError = null;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.validationStatus = 'failed';
                state.applied = null;
                state.validationError = action.payload;
            });
    },
});

export const { removeAppliedCoupon, clearValidationError } = couponsSlice.actions;
export default couponsSlice.reducer;

