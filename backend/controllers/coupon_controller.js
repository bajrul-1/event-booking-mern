import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Event from '../models/Event.js';

export const getAvailableCoupons = async (req, res) => {
    try {
        const { eventId, categoryId } = req.query;

        if (!eventId || !categoryId) {
            console.error('[BACKEND] ERROR: Missing eventId or categoryId.');
            return res.status(400).json({ message: 'Event and Category IDs are required.' });
        }

        const now = new Date();
        const query = {
            isActive: true,
            validFrom: { $lte: now },
            validTo: { $gte: now },
            $or: [
                { applicableEvents: { $size: 0 }, applicableCategories: { $size: 0 } },
                { applicableEvents: { $in: [eventId] } },
                { applicableCategories: { $in: [categoryId] } }
            ]
        };

        const coupons = await Coupon.find(query);


        if (coupons.length === 0) {
            const response = {
                success: true,
                coupons: [],
                message: 'No coupons are available for this event right now.'
            };
            return res.status(200).json(response);
        }

        const response = { success: true, coupons };
        res.status(200).json(response);

    } catch (error) {
        console.error("[BACKEND] FATAL ERROR in getAvailableCoupons:", error);
        res.status(500).json({ message: 'Server error while fetching coupons.' });
    }
};



/**
 * @desc    Validate a coupon code against order details
 * @route   POST /api/coupons/validate
 * @access  Private
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal, eventId } = req.body;
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if (!user) { return res.status(404).json({ success: false, message: "User not found." }); }
        if (!eventId) { return res.status(400).json({ success: false, message: "Event ID is required." }); }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) { return res.status(404).json({ success: false, message: 'Invalid coupon code.' }); }

        const event = await Event.findById(eventId);
        if (!event) { return res.status(404).json({ success: false, message: "Event not found." }); }

        // --- All Validation Checks ---
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTo) {
            return res.status(400).json({ success: false, message: 'Coupon is expired or not yet active.' });
        }
        if (subtotal < coupon.minPurchase) {
            return res.status(400).json({ success: false, message: `Minimum purchase of ₹${coupon.minPurchase} required.` });
        }
        if (coupon.applicableEvents.length > 0 && !coupon.applicableEvents.some(id => id.equals(eventId))) {
            return res.status(400).json({ success: false, message: 'This coupon is not valid for this specific event.' });
        }
        if (coupon.applicableCategories.length > 0 && !coupon.applicableCategories.some(id => id.equals(event.category))) {
            return res.status(400).json({ success: false, message: 'This coupon is not valid for this event category.' });
        }
        if (coupon.userType === 'newUser') {
            const userCreationDate = new Date(user.createdAt);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (userCreationDate < sevenDaysAgo) {
                return res.status(400).json({ success: false, message: "This coupon is valid only for new users." });
            }
        }
        if (coupon.usageLimit === 'once_per_user') {
            const orderExists = await Order.findOne({ buyerId: user._id, couponId: coupon._id, status: 'successful' });
            if (orderExists) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon.' });
            }
        }
        if (coupon.usageLimit === 'once_per_month') {
            const oneMonthAgo = new Date(new Date().setMonth(now.getMonth() - 1));
            const orderExists = await Order.findOne({
                buyerId: user._id,
                couponId: coupon._id,
                status: 'successful',
                createdAt: { $gte: oneMonthAgo }
            });
            if (orderExists) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon this month.' });
            }
        }

        res.status(200).json({ success: true, coupon });

    } catch (error) {
        console.error("Coupon validation error:", error);
        res.status(500).json({ success: false, message: 'Coupon validation failed.' });
    }
};

