import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'Event Booking',
        trim: true
    },
    contactEmail: {
        type: String,
        default: '',
        trim: true,
        lowercase: true
    },
    contactPhone: {
        type: String,
        default: '',
        trim: true
    },
    contactAddress: {
        type: String,
        default: '',
        trim: true
    },
    currency: {
        type: String,
        default: 'INR',
        trim: true
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    seoDescription: {
        type: String,
        default: '',
        trim: true
    }
}, { timestamps: true });

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
