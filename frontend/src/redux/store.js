import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './features/themeSlice.js'
import organizerAuthReducer from './features/organizer/organizerAuthSlice.js';
import filtersSlice from './features/filtersSlice.js'
import ordersReducer from './features/ordersSlice.js';
import eventsReducer from './features/events/eventsSlice.js';
import couponsReducer from './features/coupons/couponsSlice.js';
import categoriesReducer from './features/categories/categoriesSlice.js';
import organizersReducer from './features/organizer/organizerSlice.js';
import notificationsReducer from './features/notifications/notificationsSlice.js';


export const store = configureStore({
    reducer: {
        theme: themeReducer,
        filters: filtersSlice,
        orders: ordersReducer,
        events: eventsReducer,
        coupons: couponsReducer,
        categories: categoriesReducer,
        organizerAuth: organizerAuthReducer,
        organizers: organizersReducer,
        notifications: notificationsReducer,
    },
})

export default store;