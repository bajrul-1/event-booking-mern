import express from 'express';
import { clerkAuth } from '../middleware/authMiddleware.js';
import { getMyProfile, completeProfile, getPublicStats } from './../controllers/user_controller.js';

const router = express.Router();

// Public route for stats
router.get('/stats', getPublicStats);

// Notun route-gulo ekhane add kora holo
router.get('/me', clerkAuth, getMyProfile);
router.post('/complete-profile', clerkAuth, completeProfile);

export default router;
