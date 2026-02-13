import express from 'express';
import { clerkAuth } from './../middleware/authMiddleware.js'; 
import { createOrder, handlePaymentFailure, handleWebhook, verifyPayment } from './../controllers/payment_controller.js';

const paymentRouter = express.Router();

paymentRouter.post('/create-order', clerkAuth, createOrder);
paymentRouter.post('/verify-payment', clerkAuth, verifyPayment);
paymentRouter.post('/payment-failure', clerkAuth, handlePaymentFailure);
paymentRouter.post('/razorpay-webhook', handleWebhook);



export default paymentRouter;