import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Mail, Trash2, LoaderCircle, Eye } from 'lucide-react'; // Eye icon
import { Link } from 'react-router-dom'; // Link component

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-neutral-700">
                <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-50">User Messages</h1>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 p-6 border-b dark:border-neutral-700">
                    <Mail size={24} />
                    <h2 className="text-xl font-semibold">Inbox ({messages.length})</h2>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoaderCircle size={48} className="animate-spin text-primary-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-neutral-500">
                        <Mail size={48} className="mx-auto mb-3" />
                        <p>No messages found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                            <thead className="bg-neutral-50 dark:bg-neutral-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Name/Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Message</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                                {messages.map((msg) => (
                                    <tr key={msg._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{msg.name}</div>
                                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{msg.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 font-medium">
                                            <Link to={`/organizer/dashboard/messages/${msg._id}`} className="hover:text-primary-500 hover:underline">
                                                {msg.subject}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                                            {msg.message}
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
