import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action) => {
            state.items = action.payload;
            state.unreadCount = action.payload.filter(n => !n.isRead).length;
        },
        addNotification: (state, action) => {
            state.items.unshift(action.payload); // Add to top
            state.unreadCount += 1;
        },
        markAsRead: (state) => {
            state.unreadCount = 0;
            // Also mark items as read locally for immediate UI update
            state.items = state.items.map(n => ({ ...n, isRead: true }));
        },
        markOneAsRead: (state, action) => {
            const id = action.payload;
            const notification = state.items.find(n => n._id === id);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        }
    },
});

export const { setNotifications, addNotification, markAsRead, markOneAsRead, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
