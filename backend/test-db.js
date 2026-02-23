import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Notification from './models/Notification.js';

async function checkLatestNotification() {
    await mongoose.connect(process.env.MONGO_URI);
    const latest = await Notification.findOne().sort({ createdAt: -1 });
    console.log('--- LATEST NOTIFICATION ---');
    console.log('Title:', latest?.title);
    console.log('Link:', latest?.link);
    console.log('---------------------------');
    process.exit(0);
}

checkLatestNotification();
