import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import {
    CheckCircle, XCircle, Clock, Home, Calendar, MapPin, Download, Share2,
    LoaderCircle, Ticket, AlertCircle, QrCode, User as UserIcon, Copy
} from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';


// Helper Components (Same as before)
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3"> <Icon size={18} className="mt-1 text-secondary-500" /> <div> <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{label}</p> <p className="font-semibold text-neutral-800 dark:text-neutral-100">{value}</p> </div> </div>
);

const SummaryRow = ({ label, value, isSuccess, isTotal }) => (
    <div className={`flex justify-between items-center ${isTotal ? 'text-xl font-bold' : 'text-sm'} ${isSuccess ? 'text-success-500 font-semibold' : 'text-neutral-600 dark:text-neutral-300'}`}>
        <span>{label}</span> <span>{value}</span>
    </div>
);


function BookingStatus() {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('paymentId');
    const orderId = searchParams.get('orderId');

    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const ticketRef = useRef(null);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Order Data
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!paymentId && !orderId) {
                setError("No tracking information found.");
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();
                let url = paymentId
                    ? `${import.meta.env.VITE_API_URL}/api/orders/payment/${paymentId}`
                    : `${import.meta.env.VITE_API_URL}/api/orders/${orderId}`;

                const { data } = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError("Order details not found.");
                }
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load booking status.");
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) fetchOrderDetails();
    }, [paymentId, orderId, isLoaded, getToken]);

    // Download PDF Logic
    const handleDownload = () => {
        const ticketElement = ticketRef.current;
        if (ticketElement) {
            html2canvas(ticketElement, { scale: 2, useCORS: true, backgroundColor: null }).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
                pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                pdf.save(`ticket-${order._id.slice(-8)}.pdf`);
            });
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => `₹${(Number(amount) || 0).toFixed(2)}`;

    // --- Status Checks (Fixed Logic) ---
    if (!order && !loading) return null; // Only show null if loading finishes without data

    const status = order?.status;
    const isSuccess = status === 'successful';
    const isFailed = status === 'failed';
    const isPending = status === 'pending';

    const theme = isSuccess
        ? { color: 'green', icon: CheckCircle, title: 'Booking Confirmed!', actionBg: 'bg-success-600', text: 'text-success-600' }
        : isFailed
            ? { color: 'red', icon: XCircle, title: 'Payment Failed', actionBg: 'bg-error-600', text: 'text-error-600' }
            : { color: 'yellow', icon: Clock, title: 'Payment Processing', actionBg: 'bg-yellow-600', text: 'text-yellow-600' };

    // use dynamic icon component
    const ThemeIcon = theme.icon;


    // --- Loading/Error States ---
    if (loading || !isLoaded) return <div className="h-screen flex justify-center items-center bg-neutral-50 dark:bg-neutral-950"><LoaderCircle size={50} className="animate-spin text-primary-500 mb-4" /></div>;

    if (error) return <div className="h-screen flex flex-col justify-center items-center text-center bg-neutral-50 dark:bg-neutral-950"><AlertCircle size={60} className="text-error-500 mb-4" /><h2 className="text-2xl font-bold">Something went wrong</h2><p className="text-neutral-500 mb-6">{error}</p><Link to="/" className="px-6 py-2 bg-primary-500 text-white rounded-lg">Go Home</Link></div>;

    // --- Main Render ---
    return (
        <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen font-body">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Status Header */}
                <div className="text-center mb-12">
                    <div className="flex flex-col items-center">
                        <ThemeIcon size={64} className={`${theme.text} mb-4 ${isPending ? 'animate-pulse' : ''}`} />
                        <h1 className={`text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 ${theme.text}`}>{theme.title}</h1>
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                            {isSuccess ? `Hi ${user?.firstName}, your ticket is ready.` :
                                isFailed ? "Unfortunately, your payment could not be processed." :
                                    "We are verifying your payment. Check 'My Tickets' for final status."}
                        </p>
                    </div>
                </div>

                {/* Ticket/Order Card (Only show if necessary data exists) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 relative"
                >

                    {/* Event Header Image */}
                    <div className="relative h-48 md:h-64">
                        <img
                            src={order.eventId?.imageUrl || 'https://via.placeholder.com/800x400'}
                            alt="Event Cover"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">
                            <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase tracking-wider shadow-sm">
                                {order.eventId?.category?.name || 'Event'}
                            </span>
                            <h2 className="text-3xl font-bold text-white leading-tight drop-shadow-md">
                                {order.eventId?.title}
                            </h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                            <InfoItem icon={Calendar} label="Date & Time" value={formatDate(order.eventId?.date)} />
                            <InfoItem icon={MapPin} label="Location" value={order.eventId?.location} />
                        </div>

                        <div className="border-t-2 border-dashed border-neutral-200 dark:border-neutral-700 my-8"></div>

                        {/* Ticket & Summary Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Left: Ticket Details (Only show if SUCCESS) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Ticket Details</h3>
                                {isSuccess ? (
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                                        {order.tickets?.map((ticket, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-800 last:border-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center shadow-sm text-primary-600 dark:text-primary-400 font-bold">
                                                        {ticket.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{ticket.tierName}</p>
                                                        <p className="text-xs text-neutral-500">Ticket Type</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-neutral-900 dark:text-white">
                                                    {formatCurrency(ticket.pricePerTicket * ticket.quantity)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl text-neutral-500">
                                        <p>Ticket details will be visible upon confirmation.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right: Payment Breakdown */}
                            <div>
                                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">Payment Summary</h3>
                                <div className="space-y-3 text-sm">
                                    <SummaryRow label="Subtotal" value={formatCurrency(order.paymentDetails?.subtotal)} />
                                    <SummaryRow label="Processing Fee" value={`+ ${formatCurrency(order.paymentDetails?.processingFee)}`} />
                                    {order.paymentDetails?.discountAmount > 0 && (
                                        <SummaryRow label={`Discount Applied`} value={`- ${formatCurrency(order.paymentDetails?.discountAmount)}`} isSuccess={true} />
                                    )}
                                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 mt-2">
                                        <SummaryRow label="Total Paid" value={formatCurrency(order.paymentDetails?.totalAmount)} isTotal={true} />
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                                    <p><span className="font-semibold">Payment ID:</span> {order.razorpay?.paymentId || 'N/A'}</p>
                                    <p><span className="font-semibold">Order ID:</span> {order._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 px-8 py-6 flex flex-col sm:flex-row gap-4 border-t border-neutral-200 dark:border-neutral-700">
                        <Link to="/my-tickets" className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3.5 px-6 rounded-xl font-bold shadow-lg transition-all whitespace-nowrap">
                            <Ticket size={20} /> <span>Go To My Tickets</span>
                        </Link>

                        <div className="flex flex-1 gap-3">
                            {isSuccess && (
                                <Link to={`/my-tickets/view/${order._id}`} className="flex-1 flex items-center justify-center gap-2 bg-success-500 hover:bg-success-600 text-white py-3.5 rounded-xl font-bold transition-all">
                                    <Ticket size={20} /> View Ticket
                                </Link>
                            )}
                            {isFailed && (
                                <Link to={`/events/${order.eventId?._id}`} className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-bold transition-all">
                                    Try Again
                                </Link>
                            )}
                            <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 py-3.5 rounded-xl font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                                <Home size={20} /> Home
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default BookingStatus;