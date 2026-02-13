import { useEffect, useState } from 'react';
import { Calendar, Users, Banknote, Activity, EyeOff, Briefcase, TrendingUp, Clock, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const StatCard = ({ title, value, icon, change, color }) => (
    <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{change}</p>
        </div>
    </div>
);

const SectionHeader = ({ title, link, linkText }) => (
    <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
        {link && (
            <Link to={link} className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                {linkText}
            </Link>
        )}
    </div>
);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function DashboardOverview() {
    const { token } = useSelector((state) => state.organizerAuth);
    const [data, setData] = useState({
        stats: {
            totalRevenue: 0,
            activeEvents: 0,
            unlistedEvents: 0,
            totalOrganizers: 0,
            totalUsers: 0,
            ticketsSoldToday: 0
        },
        recentActivity: [],
        recentEvents: [],
        upcomingEvents: [],
        topSellingEvents: [],
        dailyRevenue: [],
        categoryStats: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    const stats = [
        { title: 'Total Revenue', value: `₹${data.stats.totalRevenue.toLocaleString()}`, icon: <Banknote size={20} />, change: 'Lifetime Earnings', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
        { title: 'Active Events', value: data.stats.activeEvents, icon: <Calendar size={20} />, change: 'Currently Published', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
        { title: 'Total Users', value: data.stats.totalUsers, icon: <Users size={20} />, change: 'Registered Attendees', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
        { title: 'Total Organizers', value: data.stats.totalOrganizers, icon: <Briefcase size={20} />, change: 'Verified Partners', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    ];

    if (loading) return <div className="p-10 text-center"><div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 rounded-full border-t-transparent"></div></div>;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                    <SectionHeader title="Revenue Trends (Last 7 Days)" />
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.dailyRevenue}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB' }}
                                    formatter={(value) => [`₹${value}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie Chart */}
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                    <SectionHeader title="Events by Category" />
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {data.categoryStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        {data.categoryStats.length === 0 && <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No category data available</div>}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Main Content Area (2 Cols) */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Recent Events Table */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <SectionHeader title="Recently Created Events" link="/organizer/dashboard/events" linkText="View All" />
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-neutral-500 uppercase border-b border-neutral-100 dark:border-neutral-700">
                                        <th className="pb-3 font-medium">Event Name</th>
                                        <th className="pb-3 font-medium">Organizer</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {data.recentEvents.map(event => (
                                        <tr key={event._id} className="group hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                            <td className="py-3 font-medium text-neutral-800 dark:text-neutral-200">{event.title}</td>
                                            <td className="py-3 text-neutral-500">{event.organizer?.name?.firstName}</td>
                                            <td className="py-3 text-neutral-500">{new Date(event.date).toLocaleDateString()}</td>
                                            <td className="py-3 text-right">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.recentEvents.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-neutral-500">No events found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Activity (Orders) */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <SectionHeader title="Recent Transactions" link="/organizer/dashboard/orders" linkText="View All" />
                        <div className="space-y-4">
                            {data.recentActivity.map((order) => (
                                <div key={order._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                            <Activity size={18} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                                                {order.buyerId?.name?.firstName} purchased a ticket
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {order.eventId?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                                            ₹{order.paymentDetails?.totalAmount}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {data.recentActivity.length === 0 && <p className="text-center py-4 text-neutral-500">No transactions yet</p>}
                        </div>
                    </div>
                </div>

                {/* Sidebar Content Area (1 Col) */}
                <div className="space-y-6">

                    {/* Top Selling Events */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <SectionHeader title="Top Selling Events" />
                        <div className="space-y-4">
                            {data.topSellingEvents.map((event, idx) => (
                                <div key={event._id} className="flex items-center gap-3">
                                    <span className="font-bold text-neutral-300 text-lg w-6">#{idx + 1}</span>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">{event.title}</h4>
                                        <p className="text-xs text-neutral-500">{event.totalsold} tickets sold</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded">
                                            ₹{event.totalRevenue.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {data.topSellingEvents.length === 0 && <p className="text-center py-4 text-neutral-500">No sales data yet</p>}
                        </div>
                    </div>

                    {/* Upcoming Events (Agenda) */}
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                        <SectionHeader title="Upcoming Events" />
                        <div className="space-y-0 relative border-l border-neutral-200 dark:border-neutral-700 ml-3">
                            {data.upcomingEvents.map((event) => (
                                <div key={event._id} className="mb-6 ml-6 relative">
                                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-neutral-800"></span>
                                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{event.title}</h4>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                        <Clock size={12} />
                                        <span>{new Date(event.date).toLocaleDateString()} • {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                                        <MapPin size={12} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            ))}
                            {data.upcomingEvents.length === 0 && <p className="text-center py-4 text-neutral-500 ml-4">No upcoming events</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default DashboardOverview;