import mongoose from 'mongoose';

// Ekta order-er moddhe kon dhoroner ticket kotogulo ache, shetar jonno ekta sub-schema
const orderedTicketSchema = new mongoose.Schema({
    tierName: {
        type: String,
        required: true,
        enum: ['General', 'Premium', 'VIP', 'Early Bird']
    },
    quantity: {
        type: Number,
        required: true
    },
    pricePerTicket: { // Booking korar shomoy ticket-er daam koto chilo
        type: Number,
        required: true
    }
}, { _id: false }); // Eke alada ID deyar dorkar nei

const orderSchema = new mongoose.Schema({
    // --- Relational Data ---
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon' // Optional, shob order-e coupon thakbe na
    },

    // --- Ticket Details ---
    // Ekhon ekta order-e multiple type-er ticket thakte parbe
    tickets: [orderedTicketSchema],

    // --- Financial Details ---
    paymentDetails: {
        subtotal: { type: Number, required: true },
        processingFee: { type: Number, required: true },
        discountAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
    },

    // --- Status ---
    status: {
        type: String,
        enum: ['pending', 'successful', 'failed'],
        default: 'pending',
    },

    // --- Payment Gateway Info ---
    razorpay: {
        orderId: { type: String, required: true },
        paymentId: { type: String },
        signature: { type: String },
    },
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
