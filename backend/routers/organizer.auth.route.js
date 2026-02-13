import express from 'express';
import { loginOrganizer, createOrganizer, getOrganizerProfile, getAllOrganizers, deleteOrganizer, updateOrganizerStatus, updateOrganizer } from '../controllers/organizer.auth.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import createUpload from '../middleware/uploadMiddleware.js';


const organizerAuthRouter = express.Router();
const upload = createUpload('organizers');

organizerAuthRouter.post('/login', loginOrganizer);
organizerAuthRouter.get('/', protect, isAdmin, getAllOrganizers);

organizerAuthRouter.get('/profile', protect, getOrganizerProfile);
organizerAuthRouter.post('/create', protect, isAdmin, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), createOrganizer);
organizerAuthRouter.delete('/:id', protect, isAdmin, deleteOrganizer);
organizerAuthRouter.patch('/:id/status', protect, isAdmin, updateOrganizerStatus);
organizerAuthRouter.put('/:id', protect, isAdmin, upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
]), updateOrganizer);

export default organizerAuthRouter;

