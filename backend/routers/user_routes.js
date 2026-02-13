import express from 'express';
import { clerkAuth } from '../middleware/authMiddleware.js';
import { getMyProfile, completeProfile } from './../controllers/user_controller.js';

const router = express.Router();

// Notun route-gulo ekhane add kora holo
router.get('/me', clerkAuth, getMyProfile);
router.post('/complete-profile', clerkAuth, completeProfile);

export default router;
