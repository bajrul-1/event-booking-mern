import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/Event.js';

dotenv.config();

const debugEvents = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const events = await Event.find({});
        console.log(`Total Events: ${events.length}`);

        console.log("\n--- Event Details ---");
        events.forEach(e => {
            console.log(`Title: ${e.title}`);
            console.log(`Status: ${e.status}`);
            console.log(`Date: ${e.date}`);
            console.log(`Is Future? ${new Date(e.date) >= new Date()}`);
            console.log("-------------------");
        });

        const publishedCount = await Event.countDocuments({ status: 'published' });
        const futurePublishedCount = await Event.countDocuments({
            status: 'published',
            date: { $gte: new Date() }
        });

        console.log(`\nTotal 'published' events: ${publishedCount}`);
        console.log(`Total 'published' AND 'future' events: ${futurePublishedCount}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugEvents();
