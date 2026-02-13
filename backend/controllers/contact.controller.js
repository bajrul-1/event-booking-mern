import Contact from '../models/Contact.js';

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

        // Rate Limiting Logic: Check for last message from this IP or User ID
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        let query = {
            createdAt: { $gte: fiveMinutesAgo },
            $or: [{ ipAddress }]
        };

        if (userId) {
            query.$or.push({ userId });
        }

        const lastMessage = await Contact.findOne(query).sort({ createdAt: -1 });

        if (lastMessage) {
            const timeDiff = Date.now() - new Date(lastMessage.createdAt).getTime();
            const remainingTime = Math.ceil((5 * 60 * 1000 - timeDiff) / 1000); // In seconds

            return res.status(429).json({
                message: 'Rate limit exceeded. Please wait before sending another message.',
                remainingTime: remainingTime
            });
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

        res.status(201).json({
            message: 'Message sent successfully!',
            success: true
        });

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};
