import Order from '../models/Order.js';
import User from '../models/User.js'; // <-- User model-টা অবশ্যই ইমপোর্ট করতে হবে

// --- 1. Get My Orders ---
export const getMyOrders = async (req, res) => {
    try {
        const clerkId = req.auth.userId;

        // ১. প্রথমে Clerk ID দিয়ে লোকাল ইউজার খুঁজে বের করা
        const user = await User.findOne({ clerkId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ২. এরপর সেই ইউজারের MongoDB _id দিয়ে অর্ডার সার্চ করা
        const orders = await Order.find({ buyerId: user._id })
            .populate('eventId')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: 'Server error fetching orders' });
    }
};

// --- 2. Get Order by Payment ID ---
export const getOrderByPaymentId = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const order = await Order.findOne({ 'razorpay.paymentId': paymentId })
            .populate('eventId');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Error fetching order by payment ID:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// --- 3. Get Order by Database ID (Optional, for direct links) ---
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('eventId');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};