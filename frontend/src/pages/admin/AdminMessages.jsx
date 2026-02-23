import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, Trash2, LoaderCircle, Eye, Search, Filter } from 'lucide-react'; // Added Search icon
import { Link } from 'react-router-dom';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact`);
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/${id}`);
            if (response.data.success) {
                toast.success("Message deleted successfully.");
                setMessages(messages.filter(msg => msg._id !== id));
            }
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message.");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredMessages = messages.filter(msg => {
        // Search by Name or Email
        const searchLower = searchTerm.toLowerCase();
        const searchMatch = msg.name.toLowerCase().includes(searchLower) || msg.email.toLowerCase().includes(searchLower);

        // Status Match
        const statusMatch = statusFilter === 'All'
            ? true
            : statusFilter === 'Read'
                ? msg.isRead
                : !msg.isRead;

        // Date Match
        let dateMatch = true;
        if (dateFilter) {
            const msgDate = new Date(msg.createdAt).toISOString().split('T')[0];
            dateMatch = msgDate === dateFilter;
        }

        return searchMatch && statusMatch && dateMatch;
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-neutral-700">
                <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50">User Messages</h1>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b dark:border-neutral-700">
                    <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                        <Mail size={24} />
                        <h2 className="text-xl font-semibold">Inbox ({filteredMessages.length})</h2>
                    </div>
                </div>

                {/* Filters Toolbar */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-b dark:border-neutral-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm placeholder:text-neutral-400 dark:text-neutral-100"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-neutral-600 dark:text-neutral-200 cursor-pointer"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-neutral-600 dark:text-neutral-200 cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Unread">Unread</option>
                            <option value="Read">Read</option>
                        </select>
                        {(searchTerm || dateFilter || statusFilter !== 'All') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setDateFilter('');
                                    setStatusFilter('All');
                                }}
                                className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1 transition-colors"
                            >
                                <Filter size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoaderCircle size={48} className="animate-spin text-primary-500" />
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        <Mail size={48} className="mx-auto mb-3" />
                        <p>No messages found matching your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name/Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {filteredMessages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{msg.name}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{msg.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                                            <Link to={`/organizer/dashboard/messages/${msg._id}`} className="hover:text-primary-500 hover:underline">
                                                {msg.subject || 'No Subject'}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {msg.isRead ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    Read
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    Unread
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            {formatDate(msg.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/organizer/dashboard/messages/${msg._id}`}
                                                    className="text-blue-500 hover:text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                    title="View Message"
                                                >
                                                    <Eye size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(msg._id)}
                                                    className="text-error-500 hover:text-error-600 p-2 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-full transition-colors"
                                                    title="Delete Message"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
