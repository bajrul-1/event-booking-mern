import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// --- Thunk 1: Fetch ALL (Public) events ---
export const fetchAllEvents = createAsyncThunk(
    'events/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events`);
            return data.events;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to fetch events.');
        }
    }
);

// --- Thunk 2: Fetch SINGLE (Public) event ---
export const fetchEventById = createAsyncThunk(
    'events/fetchById',
    async (eventId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/events/${eventId}`);
            return data.event;
        } catch (error) {
            return rejectWithValue(error.response.data.message || 'Failed to fetch event details.');
        }
    }
);

// --- Thunk 3: Create NEW event (Organizer) ---
export const createNewEvent = createAsyncThunk(
    'events/create',
    async (eventData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const isFormData = eventData instanceof FormData;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            };
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/events/create`,
                eventData,
                config
            );
            return data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create event.');
        }
    }
);

// --- Thunk 7: Update Event (Organizer) ---
export const updateEvent = createAsyncThunk(
    'events/update',
    async ({ eventId, eventData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const isFormData = eventData instanceof FormData;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            };
            const { data } = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
                eventData,
                config
            );
            return data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update event.');
        }
    }
);

// --- Thunk 8: Delete Event (Organizer) ---
export const deleteEvent = createAsyncThunk(
    'events/delete',
    async (eventId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.delete(
                `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return eventId; // Return ID to remove from state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete event.');
        }
    }
);

// --- Thunk 4: Fetch Organizer's Events (Organizer) ---
export const fetchOrganizerEvents = createAsyncThunk(
    'events/fetchOrganizerEvents',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/events/my-events`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.events;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch your events.');
        }
    }
);

// --- Thunk 9: Fetch Single Event for Organizer (Edit Mode) ---
export const fetchOrganizerEventById = createAsyncThunk(
    'events/fetchOrganizerEventById',
    async (eventId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/events/${eventId}/organizer`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch event details.');
        }
    }
);

// --- Thunk 5: Fetch ALL Events (Admin) ---
export const fetchAllEventsForAdmin = createAsyncThunk(
    'events/fetchAllForAdmin',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/events/all`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.events;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch all events.');
        }
    }
);

// --- Thunk 6: Update Event Status (Organizer) ---
export const updateEventStatus = createAsyncThunk(
    'events/updateStatus',
    async ({ eventId, status }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().organizerAuth;
            const { data } = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/events/${eventId}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data.event;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status.');
        }
    }
);


const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        items: [],
        currentEvent: null,
        status: 'idle', // <-- Apnar original 'status' field
        createStatus: 'idle', // <-- Shudhu create-er jonno alada status
        error: null,
    },
    reducers: {
        clearEventError: (state) => {
            state.error = null;
            state.createStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // --- THE FIX IS HERE ---
            // Shob fetch logic ekhon 'status' field-take update korche
            .addCase(fetchAllEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchEventById.pending, (state) => {
                state.status = 'loading';
                state.currentEvent = null;
            })
            .addCase(fetchEventById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentEvent = action.payload;
            })
            .addCase(fetchEventById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchOrganizerEvents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchOrganizerEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // --- Fetch Single Event (Organizer) ---
            .addCase(fetchOrganizerEventById.pending, (state) => {
                state.status = 'loading';
                state.currentEvent = null;
            })
            .addCase(fetchOrganizerEventById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentEvent = action.payload;
            })
            .addCase(fetchOrganizerEventById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchAllEventsForAdmin.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllEventsForAdmin.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchAllEventsForAdmin.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // --- Create logic 'createStatus' use korche ---
            .addCase(createNewEvent.pending, (state) => {
                state.createStatus = 'loading';
                state.error = null;
            })
            .addCase(createNewEvent.fulfilled, (state, action) => {
                state.createStatus = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createNewEvent.rejected, (state, action) => {
                state.createStatus = 'failed';
                state.error = action.payload;
            })

            // --- Update logic kono status change korche na, shudhu error set korche ---
            .addCase(updateEventStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(event => event._id === action.payload._id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateEventStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearEventError, resetEvents } = eventsSlice.actions;
export default eventsSlice.reducer;