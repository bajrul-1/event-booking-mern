import express from 'express';
import { clerkAuth } from '../middleware/authMiddleware.js';
import { getMyOrders, getOrderByPaymentId, getOrderById } from '../controllers/order_controller.js';

const orderRouter = express.Router();

orderRouter.get('/my-orders', clerkAuth, getMyOrders);
orderRouter.get('/payment/:paymentId', clerkAuth, getOrderByPaymentId);
orderRouter.get('/:id', clerkAuth, getOrderById);   


export default orderRouter;