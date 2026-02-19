import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import Event from './backend/models/Event.js';

dotenv.config({ path: './backend/.env' });

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const users = await User.countDocuments();
        const events = await Event.countDocuments();
        console.log(`Users: ${users}, Events: ${events}`);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkStats();
