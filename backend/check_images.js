
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Organizer from './models/Organizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

const checkOrganizerImages = async () => {
    await connectDB();
    const organizers = await Organizer.find({ role: 'organizer' });
    console.log('--- Organizer Images ---');
    organizers.forEach(org => {
        console.log(`Name: ${org.name.firstName} ${org.name.lastName}`);
        console.log(`Profile Image: '${org.profileImage}'`);
        console.log(`Cover Image: '${org.coverImage}'`);
        console.log('---');
    });
    process.exit();
};

checkOrganizerImages();
