import express from 'express';
import { clerkAuth } from '../middleware/authMiddleware.js';
import { getAvailableCoupons, validateCoupon } from '../controllers/coupon_controller.js';

const couponRouter = express.Router();

couponRouter.get('/available', clerkAuth, getAvailableCoupons);
couponRouter.post('/validate', clerkAuth, validateCoupon);

export default couponRouter;