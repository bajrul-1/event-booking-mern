import express from 'express';
import { getNotifications, markAllAsRead, clearNotifications } from '../controllers/notification.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin Only Routes
router.get('/', protect, isAdmin, getNotifications);
router.put('/mark-read', protect, isAdmin, markAllAsRead);
router.delete('/clear', protect, isAdmin, clearNotifications);

export default router;
