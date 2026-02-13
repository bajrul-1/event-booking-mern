import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true },
    type: { type: String, required: true, enum: ['percentage', 'fixed'] },
    description: { type: String },
    minPurchase: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },

    // --- Advanced Fields ---
    applicableEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    // THE CHANGE: Notun field ja shudhu specific category-r jonno kaaj korbe
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    usageLimit: {
        type: String,
        enum: ['unlimited', 'once_per_user', 'once_per_month'],
        default: 'unlimited'
    },
    userType: {
        type: String,
        enum: ['all', 'newUser'],
        default: 'all'
    }
}, {
    timestamps: true
});

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;

