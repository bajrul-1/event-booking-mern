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
