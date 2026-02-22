import express from 'express';
import { getDashboardStats, getRevenueDetails, getUserDetails } from '../controllers/admin.controller.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, isAdmin, getDashboardStats);
router.get('/revenue-details', protect, isAdmin, getRevenueDetails);
router.get('/user-details', protect, isAdmin, getUserDetails);

export default router;
