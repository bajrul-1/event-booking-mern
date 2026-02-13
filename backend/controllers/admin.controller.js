import Order from '../models/Order.js';
import Event from '../models/Event.js';
import Organizer from '../models/Organizer.js';
import User from '../models/User.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (Sum of collected payments from successful orders)
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: 'successful' } },
            { $group: { _id: null, total: { $sum: '$paymentDetails.totalAmount' } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // 2. Active Events (All published events)
        const activeEvents = await Event.countDocuments({
            status: 'published'
        });

        // 2.1 Unlisted Events (Events that are unleashed/draft)
        const unlistedEvents = await Event.countDocuments({
            status: 'unleashed'
        });

        // 3. Total Organizers
        const totalOrganizers = await Organizer.countDocuments();

        // 3.1 Total Users (Attendees)
        const totalUsers = await User.countDocuments();

        // 4. Tickets Sold (Today)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const ticketsSoldTodayResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: 'successful'
                }
            },
            { $unwind: '$tickets' },
            { $group: { _id: null, totalTickets: { $sum: '$tickets.quantity' } } }
        ]);
        const ticketsSoldToday = ticketsSoldTodayResult.length > 0 ? ticketsSoldTodayResult[0].totalTickets : 0;

        // 5. Recent Activity (Last 5 orders)
        const recentActivity = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyerId', 'name email')
            .populate('eventId', 'title');

        // 6. Recent Events (Last 5 created events)
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('organizer', 'name');

        // 7. Upcoming Events (Next 5 events)
        const upcomingEvents = await Event.find({
            status: 'published',
            date: { $gte: new Date() }
        })
            .sort({ date: 1 })
            .limit(5);

        // 8. Top Selling Events
        const topSellingEventsResult = await Order.aggregate([
            { $match: { status: 'successful' } },
            { $unwind: '$tickets' },
            {
                $group: {
                    _id: '$eventId',
                    totalsold: { $sum: '$tickets.quantity' },
                    totalRevenue: { $sum: '$paymentDetails.totalAmount' }
                }
            },
            { $sort: { totalsold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'events',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'eventDetails'
                }
            },
            { $unwind: '$eventDetails' },
            {
                $project: {
                    _id: 1,
                    totalsold: 1,
                    totalRevenue: 1,
                    title: '$eventDetails.title',
                    date: '$eventDetails.date',
                    imageUrl: '$eventDetails.imageUrl'
                }
            }
        ]);
        const topSellingEvents = topSellingEventsResult;

        // 9. Daily Revenue (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenueResult = await Order.aggregate([
            {
                $match: {
                    status: 'successful',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: '$paymentDetails.totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0 revenue
        const dailyRevenue = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyRevenueResult.find(r => r._id === dateStr);
            dailyRevenue.push({
                date: dateStr,
                revenue: found ? found.total : 0
            });
        }
        dailyRevenue.reverse();

        // 10. Category Statistics (Events per Category)
        const categoryStatsResult = await Event.aggregate([
            { $match: { status: 'published' } }, // Only published events
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },
            {
                $project: {
                    name: '$categoryDetails.name',
                    count: 1
                }
            }
        ]);
        const categoryStats = categoryStatsResult;

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue,
                activeEvents,
                unlistedEvents,
                totalOrganizers,
                totalUsers,
                ticketsSoldToday
            },
            recentActivity,
            recentEvents,
            upcomingEvents,
            topSellingEvents,
            dailyRevenue,
            categoryStats
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
