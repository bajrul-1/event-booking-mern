import Notification from '../models/Notification.js';

// Mark a single notification as read (Admin Only)
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ success: false, message: "Failed to mark notification as read" });
    }
};

// Get all notifications (Admin Only)
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
};

// Mark all as read (Admin Only)
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: "Notifications marked as read" });
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
    }
};

// Clear all notifications (Admin Only)
export const clearNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({});
        res.status(200).json({ success: true, message: "Notifications cleared" });
    } catch (error) {
        console.error("Error clearing notifications:", error);
        res.status(500).json({ success: false, message: "Failed to clear notifications" });
    }
};
