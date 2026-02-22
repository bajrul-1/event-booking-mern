import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['contact_message', 'new_user', 'new_organizer', 'system_alert'] // Future-proofing
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    link: {
        type: String,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
