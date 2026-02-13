import express from 'express';
import {
    createEvent,
    getAllEvents,
    getEventById,
    getOrganizerEvents,
    getEventByIdForOrganizer,
    updateEventStatus,
    getAllEventsForAdmin,
    updateEvent, // Notun
    deleteEvent  // Notun
} from '../controllers/event_controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import createUpload from '../middleware/uploadMiddleware.js'; // Notun

const eventRouter = express.Router();
const upload = createUpload('events'); // Events folder-e upload hobe

// --- Organizer Protected Routes (Specific) ---
eventRouter.post('/create', protect, upload.single('eventImage'), createEvent); // Image upload middleware add kora holo
eventRouter.get('/my-events', protect, getOrganizerEvents);
eventRouter.get('/:id/organizer', protect, getEventByIdForOrganizer);
eventRouter.patch('/:id/status', protect, updateEventStatus);
eventRouter.put('/:id', protect, upload.single('eventImage'), updateEvent); // Update route
eventRouter.delete('/:id', protect, deleteEvent); // Delete route

// --- Admin Protected Route (Specific) ---
eventRouter.get('/all', protect, isAdmin, getAllEventsForAdmin);

// --- Public Routes (Dynamic route '/:id' shobar sheshe) ---
eventRouter.get('/', getAllEvents);
eventRouter.get('/:id', getEventById);

export default eventRouter;