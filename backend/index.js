import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './utils/database.js';

import userRouter from './routers/user_routes.js';
import eventRouter from './routers/event_routes.js';
import categoryRouter from './routers/category.route.js';
import paymentRouter from './routers/payment_routes.js';
import orderRouter from './routers/order_routes.js';
import couponRouter from './routers/coupon_routes.js';

import organizerRouter from './routers/organizer.auth.route.js';
import adminRouter from './routers/admin.routes.js';
import contactRouter from './routers/contact.routes.js'; // New Contact Route



const app = express();
const PORT = process.env.PORT;

app.use(express.json());

//=================================|| CORS CONFIGURATION ||=================================>>>
const corsPolicy = {
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  methods: 'GET,POST,DELETE,PUT,PATCH,HEAD',
  credentials: true // 'credential' -> 'credentials' (plural is correct for axios/cors)
}
app.use(cors(corsPolicy));
app.use('/uploads', express.static('uploads'));



//=================================|| ROUTERS ||=================================>>>
app.use('/api/users', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/orders', orderRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/organizers', organizerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/contact', contactRouter); // New Contact Route

//=================================|| DATABASE CONNECTION ||=================================>>>
connectDB().then(() => {
  console.log('Database connected successfully');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});



