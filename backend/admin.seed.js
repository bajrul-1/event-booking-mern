import mongoose from 'mongoose';
import Organizer from './models/Organizer.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected...');

        const adminEmail = 'admin@eventbooking.com';

        const existingAdmin = await Organizer.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('Admin user already exists.');
            mongoose.connection.close();
            return;
        }

        const newAdmin = new Organizer({
            name: {
                firstName: 'Admin',
                lastName: 'Bajrul',
            },
            email: adminEmail,
            password: 'AdminPassword123',
            role: 'admin',
        });

        await newAdmin.save(); 
        console.log('Admin user created successfully!');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: AdminPassword123');

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
};

seedAdmin();

