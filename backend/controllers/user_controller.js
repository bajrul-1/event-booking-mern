import { clerkClient } from '@clerk/clerk-sdk-node';
import User from './../models/User.js';

export const getMyProfile = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        let user = await User.findOne({ clerkId });

        if (!user) {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            user = await User.create({
                clerkId: clerkUser.id,
                email: clerkUser.emailAddresses[0].emailAddress,
                name: {
                    firstName: clerkUser.firstName || 'New',
                    lastName: clerkUser.lastName || 'User',
                },
                imageUrl: clerkUser.imageUrl,
            });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error in getMyProfile:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export const completeProfile = async (req, res) => {
    try {
        // 1. Clerk 'auth' middleware theke user ID-ta neya hocche
        const clerkUserId = req.auth.userId;
        const { phone, dob } = req.body;

        // 2. Amader nijeder database-e (MongoDB) data update kora hocche
        const updatedUser = await User.findOneAndUpdate(
            { clerkId: clerkUserId },
            {
                phone: phone,
                dob: dob,
                profileComplete: true // <-- Nijer database-e-o status update
            },
            { new: true, upsert: true } // 'upsert: true' add kora hocche jodi user na thake
        );

        // --- THE FINAL FIX IS HERE ---
        // 3. Clerk-er backend-e 'publicMetadata' update kora hocche
        await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
                profileComplete: true
            }
        });

        res.status(200).json({ success: true, message: 'Profile completed successfully.' });

    } catch (error) {
        console.error("Error completing profile:", error);
        res.status(500).json({ message: 'Server error while completing profile.' });
    }
};

// --- New Function for Public Stats ---
import Event from './../models/Event.js';
import Order from './../models/Order.js';
import Category from './../models/Category.model.js';

export const getPublicStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();

        let trendingCategory = "Music"; // Default

        // 1. Calculate Trending based on Orders (Real Data)
        const aggregated = await Order.aggregate([
            { $unwind: "$tickets" },
            { $group: { _id: "$eventId", totalSold: { $sum: "$tickets.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 } // Top 5 events
        ]);

        if (aggregated.length > 0) {
            // Find category of the top selling event
            // Note: This is a simplified approach; ideally we'd aggregate by category directly
            const topEvent = await Event.findById(aggregated[0]._id).populate('category');
            if (topEvent && topEvent.category) {
                trendingCategory = topEvent.category.name;
            }
        }

        // 2. Fallback / Tie-breaker: Rotate Daily if no real data or to keep it fresh
        // If we want "Real Data OR Daily Rotation", we check if we found a strong trend. 
        // For now, if no orders, we use Daily Rotation.
        if (aggregated.length === 0) {
            const categories = await Category.find({ status: 'active' });
            if (categories.length > 0) {
                // Day of Year calculation
                const now = new Date();
                const start = new Date(now.getFullYear(), 0, 0);
                const diff = now - start;
                const oneDay = 1000 * 60 * 60 * 24;
                const day = Math.floor(diff / oneDay);

                // Pick index based on day
                const index = day % categories.length;
                trendingCategory = categories[index].name;
            }
        }

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                trendingCategory
            }
        });
    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ success: false, message: "Failed to fetch stats" });
    }
};
