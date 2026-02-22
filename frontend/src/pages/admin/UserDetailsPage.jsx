import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, UserPlus, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
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

function UserDetailsPage() {
    const { token } = useSelector((state) => state.organizerAuth);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        overallStats: { totalUsers: 0, usersThisMonth: 0 },
        monthlyGrowth: [],
        userList: []
    });

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/user-details`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setUserData(response.data);
                } else {
                    toast.error("Failed to load user data.");
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error(error.response?.data?.message || "Server Error fetching users.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchUserDetails();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const { overallStats, monthlyGrowth, userList } = userData;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <Link to="/organizer/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-600 mb-4 transition-colors font-medium">
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50">Users Details</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Platform user growth and registered attendees list.</p>
                    </div>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard
                    title="Total Registered Users"
                    value={overallStats.totalUsers?.toLocaleString() || 0}
                    subtitle="Includes both attendees and organizers"
                    icon={<Users size={24} />}
                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                />
                <StatCard
                    title="New Signups This Month"
                    value={`+${overallStats.usersThisMonth?.toLocaleString() || 0}`}
                    subtitle="Users who joined since the 1st day of the month"
                    icon={<UserPlus size={24} />}
                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
            </div>

            {/* Chart: Monthly User Growth */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 flex items-center gap-2">
                    <CalendarIcon size={20} className="text-primary-500" /> New User Signups ({new Date().getFullYear()})
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer>
                        <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} allowDecimals={false} />
                            <Tooltip
                                cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`${value} Users`, 'Signups']}
                            />
                            <Area type="monotone" dataKey="signups" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSignups)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table: User List */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">All Registered Users</h3>
                    <p className="text-sm text-neutral-500 mt-1">Complete chronological list of attendees.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-neutral-50 dark:bg-neutral-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Email Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Join Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 text-sm">
                            {userList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-neutral-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                userList.map((user) => (
                                    <tr key={user._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.imageUrl ? (
                                                    <img src={user.imageUrl} alt={user.name?.firstName} className="h-8 w-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs uppercase">
                                                        {user.name?.firstName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                    {user.name?.firstName} {user.name?.lastName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                                    user.role === 'organizer' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-neutral-500 dark:text-neutral-400">
                                            <div className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</div>
                                            <div className="text-xs mt-0.5">{new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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

export default UserDetailsPage;
