import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const organizerToken = localStorage.getItem('organizerToken');

const initialState = {
    organizer: null,
    token: organizerToken || null,
    initialStatus: 'idle', 
    status: 'idle',
    error: null,
};

export const loadOrganizer = createAsyncThunk(
    'organizerAuth/load',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().organizerAuth.token;

        if (!token) return rejectWithValue('No token found');
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/organizers/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Session expired.');
        }
    }
);

export const loginOrganizer = createAsyncThunk(
    'organizerAuth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/organizers/login`, credentials);
            localStorage.setItem('organizerToken', data.token);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed.');
        }
    }
);

const organizerAuthSlice = createSlice({
    name: 'organizerAuth',
    initialState,
    reducers: {
        logoutOrganizer: (state) => {
            localStorage.removeItem('organizerToken');
            state.organizer = null;
            state.token = null;
            state.status = 'idle';
            state.initialStatus = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginOrganizer.pending, (state) => { 
                state.status = 'loading'; 
                state.error = null;
            })
            .addCase(loginOrganizer.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.token;
                state.organizer = action.payload.user;
                state.initialStatus = 'succeeded';
            })
            .addCase(loginOrganizer.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(loadOrganizer.pending, (state) => { 
                state.initialStatus = 'loading'; 
            })
            .addCase(loadOrganizer.fulfilled, (state, action) => {
                state.initialStatus = 'succeeded';
                state.organizer = action.payload;
            })
            .addCase(loadOrganizer.rejected, (state, action) => {
                state.initialStatus = 'failed';
                state.token = null; 
                state.organizer = null;
                state.error = action.payload;
                localStorage.removeItem('organizerToken');
            });
    },
});

export const { logoutOrganizer } = organizerAuthSlice.actions;
export default organizerAuthSlice.reducer;