import express from 'express';
import { getSettings, updateSettings } from '../controllers/setting.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings (used for frontend footer/header)
router.get('/', getSettings);

// Admin only route to update settings
router.put('/', protect, isAdmin, updateSettings);

export default router;
