import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload); // Add to top
            state.unreadCount += 1;
        },
        markAsRead: (state) => {
            state.unreadCount = 0;
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        }
    },
});

export const { addNotification, markAsRead, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
