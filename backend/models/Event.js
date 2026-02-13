import mongoose from 'mongoose';

const ticketTierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    totalQuantity: {
        type: Number,
        required: true,
        min: 1,
    },
    soldQuantity: {
        type: Number,
        default: 0,
    },
    access: {
        type: String,
        enum: ['public', 'admin_only', 'admin_organizer_only'],
        default: 'public',
    },
});

const guestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
    },
});

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organizer',
            required: true,
        },
        guests: [guestSchema],
        ticketTiers: [ticketTierSchema],
        status: {
            type: String,
            // --- THE FIX IS HERE ---
            enum: ['unleashed', 'published', 'cancelled'],
            default: 'unleashed',
        },
    },
    {
        timestamps: true,
    }
);

const Event = mongoose.model('Event', eventSchema);

export default Event;