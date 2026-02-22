import Contact from '../models/Contact.js';
import Notification from '../models/Notification.js';
import { io } from '../index.js';

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message, userId } = req.body;


        // Robust IP Extraction
        let ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

        // If x-forwarded-for contains multiple IPs, take the first one (real client IP)
        if (ipAddress && ipAddress.includes(',')) {
            ipAddress = ipAddress.split(',')[0].trim();
        }

        // Fallback if IP is still not found or is strictly IPv6 localhost
        if (!ipAddress || ipAddress === '::1') {
            ipAddress = '127.0.0.1';
        }

        // Rate Limiting Logic: Only for non-logged-in users
        if (!userId) {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            const lastMessage = await Contact.findOne({
                createdAt: { $gte: fiveMinutesAgo },
                ipAddress: ipAddress
            }).sort({ createdAt: -1 });

            if (lastMessage) {
                const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
                const remainingTime = Math.ceil((5 * 60 * 1000 - timeDiff) / 1000); // In seconds

                return res.status(429).json({
                    message: 'Rate limit exceeded. Please wait before sending another message.',
                    remainingTime: remainingTime
                });
            }
        }

        // Save new message
        const newContact = new Contact({
            name,
            email,
            subject,
            message,
            ipAddress,
            userId: userId || null
        });

        await newContact.save();

        // Create persistent Notification
        const persistentNotification = new Notification({
            type: 'contact_message',
            title: `New Message from ${newContact.name}`,
            message: newContact.subject || newContact.message.substring(0, 50),
            link: '/organizer/dashboard/messages'
        });
        await persistentNotification.save();

        // Emit real-time socket event to connected clients (admin dashboard)
        io.emit('new_message', {
            _id: persistentNotification._id,
            name: newContact.name, // Keep for toast/browser payload
            subject: newContact.subject,
            message: newContact.message,

            // Notification payload matching DB
            type: persistentNotification.type,
            title: persistentNotification.title,
            link: persistentNotification.link,
            isRead: persistentNotification.isRead,
            createdAt: persistentNotification.createdAt
        });

        res.status(201).json({
            message: 'Message sent successfully!',
            success: true
        });

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// --- Admin: Get All Messages ---
export const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
};

// --- Admin: Delete Message ---
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await Contact.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ success: false, message: "Failed to delete message" });
    }
};

// --- Admin: Get Single Message ---
export const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        const message = await Contact.findById(id);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }
        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error("Error fetching message:", error);
        res.status(500).json({ success: false, message: "Failed to fetch message" });
    }
};
