import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Banknote, TrendingUp, DollarSign, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, subtitle, color }) => (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{title}</h3>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <div className="mt-4">
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">{value}</p>
            {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
        </div>
    </div>
);

function RevenueDetailsPage() {
    const { token } = useSelector((state) => state.organizerAuth);
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState({
        overallStats: { totalGross: 0, totalFees: 0, totalNet: 0 },
        monthlyRevenue: [],
        earningsByEvent: []
    });

    useEffect(() => {
        const fetchRevenueDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/revenue-details`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setRevenueData(response.data);
                } else {
                    toast.error("Failed to load revenue data.");
                }
            } catch (error) {
                console.error("Error fetching revenue:", error);
                toast.error(error.response?.data?.message || "Server Error fetching revenue.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchRevenueDetails();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { overallStats, monthlyRevenue, earningsByEvent } = revenueData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 mb-4 transition-colors font-medium">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50">Revenue Details</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Detailed financial performance and event-wise earnings.</p>
                    </div>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Gross Booking Value"
                    value={`₹${overallStats.totalGross?.toLocaleString() || 0}`}
                    subtitle="Total value of tickets sold"
                    icon={<Banknote size={24} />}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <StatCard
                    title="Platform Fees Deducted"
                    value={`-₹${overallStats.totalFees?.toLocaleString() || 0}`}
                    subtitle="Service charges and processing fees"
                    icon={<TrendingUp size={24} />}
                    color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                />
                <StatCard
                    title="Net Revenue (Your Earning)"
                    value={`₹${overallStats.totalNet?.toLocaleString() || 0}`}
                    subtitle="Actual amount credited to you"
                    icon={<DollarSign size={24} />}
                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
            </div>

            {/* Chart: Monthly Revenue */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                    <CalendarIcon size={20} className="text-primary-500" /> Monthly Revenue Trend ({new Date().getFullYear()})
                </h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} dx={-10} />
                            <Tooltip
                                cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => `₹${value?.toLocaleString()}`}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="revenue" name="Gross Revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey="fees" name="Platform Fees Deducted" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table: Earnings By Event */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Earnings Breakdown by Event</h3>
                    <p className="text-sm text-neutral-500 mt-1">Detailed view of tickets sold and revenue share for each published event.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Event Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-center">Tickets Sold</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Gross Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Processing Fees</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Net Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                            {earningsByEvent.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">
                                        No revenue data available yet.
                                    </td>
                                </tr>
                            ) : (
                                earningsByEvent.map((event) => (
                                    <tr key={event._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-neutral-900 dark:text-neutral-100">{event.title}</div>
                                            <div className="text-xs text-neutral-500 mt-1">{new Date(event.date).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-neutral-700 dark:text-neutral-300">
                                            {event.ticketsSold}
                                        </td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-400">
                                            ₹{(event.grossRevenue || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-500 font-medium">
                                            -₹{(event.totalFees || 0).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                            ₹{(event.netRevenue || 0).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RevenueDetailsPage;
