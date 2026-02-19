import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Trash2, Reply, Calendar, User, Mail, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminMessageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessage = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contact/${id}`);
                if (response.data.success) {
                    setMessage(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching message details:", error);
                toast.error("Failed to load message.");
                navigate('/organizer/dashboard/messages');
            } finally {
                setLoading(false);
            }
        };
        fetchMessage();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/contact/${id}`);
            toast.success("Message deleted.");
            navigate('/organizer/dashboard/messages');
        } catch (error) {
            toast.error("Failed to delete message.");
        }
    };

    const handleReply = () => {
        if (!message) return;

        // Subject: Re: [User's Subject]
        const subject = `Re: ${message.subject}`;

        // Formatted Body
        const greeting = `Dear ${message.name},\n\nThank you for reaching out to us. We have received your message regarding "${message.subject}".`;
        const replyPlaceholder = `\n\n[ ... WRITE YOUR REPLY HERE ... ]\n\n`;
        const closing = `Best Regards,\nEventBooking Support Team`;

        const originalMessageDivider = `\n\n--------------------------------------------------\nOriginal Message:\nFrom: ${message.name} <${message.email}>\nSent: ${new Date(message.createdAt).toLocaleString()}\n\n${message.message}`;

        const body = `${greeting}${replyPlaceholder}${closing}${originalMessageDivider}`;

        window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!message) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <button
                onClick={() => navigate('/organizer/dashboard/messages')}
                className="mb-6 flex items-center text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors"
            >
                <ArrowLeft size={18} className="mr-2" /> Back to Inbox
            </button>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-100 dark:border-neutral-700">
                {/* Header Section */}
                <div className="bg-neutral-50 dark:bg-neutral-700/50 p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="space-y-3 flex-1">
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-heading">
                                {message.subject}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                    <User size={14} className="text-primary-500" />
                                    <span className="font-medium text-neutral-900 dark:text-neutral-200">{message.name}</span>
                                </span>
                                <span className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                    <Mail size={14} className="text-primary-500" />
                                    <span>{message.email}</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
                                <Calendar size={12} />
                                {new Date(message.createdAt).toLocaleDateString()}
                                <span className="mx-1">•</span>
                                <Clock size={12} />
                                {new Date(message.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 sticky top-0 z-10">
                    <button
                        onClick={handleReply}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-primary-500/20"
                    >
                        <Reply size={18} /> Reply via Email
                    </button>
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} /> Delete
                    </button>
                </div>

                {/* Message Body */}
                <div className="p-8 min-h-[300px] bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans text-base">
                    {message.message}
                </div>
            </div>
        </div>
    );
};

export default AdminMessageDetails;
