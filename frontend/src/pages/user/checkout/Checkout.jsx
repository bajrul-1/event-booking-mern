import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useUser, useAuth } from '@clerk/clerk-react';
import { fetchEventById } from '../../../redux/features/events/eventsSlice.js';
import { LoaderCircle, Calendar, MapPin, User, Mail, Info, X, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CouponModal from '../../../components/coupons/CouponModal.jsx';
import { clearValidationError } from '../../../redux/features/coupons/couponsSlice.js';
import { toast } from 'react-toastify';

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { eventId } = useParams();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const { currentEvent: event, status } = useSelector((state) => state.events);

    // States
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [tier, setTier] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [ticketPrice, setTicketPrice] = useState(0);
    const [processingFee, setProcessingFee] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Payment processing state

    // 1. Fetch Event Data
    useEffect(() => {
        if (eventId) {
            dispatch(fetchEventById(eventId));
        }
        dispatch(clearValidationError());
    }, [dispatch, eventId]);

    // 2. Set Selected Tier
    useEffect(() => {
        if (event && location.state?.tierId) {
            const selectedTier = event.ticketTiers.find(t => t._id === location.state.tierId);
            if (selectedTier) {
                setTier(selectedTier);
            } else {
                navigate(`/events/${eventId}`);
            }
        }
    }, [event, location.state, navigate, eventId]);

    // 3. Price Calculation Logic (Robust)
    useEffect(() => {
        if (tier) {
            const basePrice = tier.price * quantity;
            let calculatedDiscount = 0;

            if (appliedCoupon) {
                if (appliedCoupon.discountType === 'percentage') {
                    calculatedDiscount = (basePrice * appliedCoupon.amount) / 100;
                } else {
                    calculatedDiscount = appliedCoupon.amount;
                }
            }

            // Discount validation
            if (calculatedDiscount > basePrice) calculatedDiscount = basePrice;

            const fee = basePrice * 0.02; // 2% fee
            const total = basePrice + fee - calculatedDiscount;

            setTicketPrice(basePrice);
            setProcessingFee(fee);
            setDiscount(calculatedDiscount);
            setTotalPrice(total < 0 ? 0 : total);
        }
    }, [tier, quantity, appliedCoupon]);

    // --- Razorpay Logic ---
    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!user) {
            toast.error("Please login to continue.");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Load Script
            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Check internet.");
                setIsProcessing(false);
                return;
            }

            const token = await getToken();

            // 2. Create Order on Backend
            const orderRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    eventId: eventId,
                    tickets: [{
                        tierName: tier.name,
                        quantity: quantity,
                        price: tier.price
                    }],
                    paymentDetails: {
                        subtotal: ticketPrice,
                        processingFee: processingFee,
                        discountAmount: discount,
                        totalAmount: totalPrice
                    },
                    couponCode: appliedCoupon ? appliedCoupon.code : null
                })
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.message || "Order creation failed");

            // 3. Open Razorpay Options
            const options = {
                key: orderData.key_id,
                amount: orderData.razorpayOrder.amount,
                currency: orderData.razorpayOrder.currency,
                name: "EventBooking",
                description: `Booking for ${event.title}`,
                order_id: orderData.razorpayOrder.id,
                handler: async function (response) {
                    try {
                        // --- 1. Backup: Save IDs to LocalStorage ---
                        localStorage.setItem('lastPaymentId', response.razorpay_payment_id);
                        localStorage.setItem('lastOrderId', orderData.databaseOrder._id);

                        const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/verify-payment`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                databaseOrderId: orderData.databaseOrder._id
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyRes.ok && verifyData.success) {
                            toast.success("Payment Successful!");
                            // --- 2. Redirect with Query Params ---
                            navigate(`/booking-status?paymentId=${response.razorpay_payment_id}`);
                        } else {
                            toast.error("Payment Verification Failed");
                            navigate(`/booking-status?orderId=${orderData.databaseOrder._id}`);
                        }
                    } catch (err) {
                        console.error(err);
                        toast.error("Verification Error");
                        navigate(`/booking-status?orderId=${orderData.databaseOrder._id}`);
                    } finally {
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.primaryEmailAddress.emailAddress,
                },
                theme: { color: "#3b82f6" },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.info("Payment cancelled.");
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error(error.message || "Payment failed");
            setIsProcessing(false);
        }
    };

    // --- Helper Functions ---
    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
        dispatch(clearValidationError());
        toast.info("Coupon removed.");
    };

    const availableTickets = tier ? tier.totalQuantity - tier.soldQuantity : 0;
    const increaseQuantity = () => { if (quantity < availableTickets) setQuantity(q => q + 1); };
    const decreaseQuantity = () => { if (quantity > 1) setQuantity(q => q - 1); };

    const formatCurrency = (val) => `₹${(val || 0).toFixed(2)}`;

    if (status === 'loading' || !tier || !isLoaded || !user) {
        return <div className="flex justify-center items-center h-screen"><LoaderCircle size={48} className="animate-spin text-primary-500" /></div>;
    }

    if (status === 'failed' || !event) {
        return <div className="text-center py-20 text-error-500">Event details could not be loaded.</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12 md:py-20">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-8 text-center">Complete Your Booking</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Details */}
                        <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-neutral-700">
                            <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Event Details</h2>
                            <div className="flex items-center gap-6">
                                <img
                                    src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                                    alt={event.title}
                                    className="w-32 h-32 object-cover rounded-lg hidden md:block"
                                    onError={(e) => {
                                        e.target.style.display = 'none'; // Hide if broken
                                    }}
                                />
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{event.title}</h3>
                                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                                        <Calendar size={18} />
                                        <span>{new Date(event.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400">
                                        <MapPin size={18} />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Details */}
                        <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-neutral-700">
                            <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Your Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3"><User size={18} className="text-neutral-500" /><span className="text-neutral-700 dark:text-neutral-300">{user.firstName} {user.lastName}</span></div>
                                <div className="flex items-center gap-3"><Mail size={18} className="text-neutral-500" /><span className="text-neutral-700 dark:text-neutral-300">{user.primaryEmailAddress.emailAddress}</span></div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-neutral-700">
                            <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Terms & Conditions</h2>
                            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <p className="flex gap-2"><Info size={16} className="shrink-0 mt-1" /><span>Tickets are non-refundable.</span></p>
                                <p className="flex gap-2"><Info size={16} className="shrink-0 mt-1" /><span>Processing fee (2%) is non-refundable.</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-neutral-800 p-6 md:p-8 rounded-2xl shadow-lg border dark:border-neutral-700 sticky top-24">
                            <h2 className="text-2xl font-semibold mb-6 text-neutral-900 dark:text-neutral-100">Booking Summary</h2>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Quantity ({tier.name})</label>
                                <div className="flex items-center gap-4">
                                    <button onClick={decreaseQuantity} disabled={quantity <= 1} className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700 disabled:opacity-50"><Minus size={16} /></button>
                                    <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                                    <button onClick={increaseQuantity} disabled={quantity >= availableTickets} className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-700 disabled:opacity-50"><Plus size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 border-b dark:border-neutral-700 pb-4 mb-4">
                                <div className="flex justify-between">
                                    <p>Ticket Price ({quantity} x {formatCurrency(tier.price)})</p>
                                    <p className="font-medium">{formatCurrency(ticketPrice)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p>Processing Fee (2%)</p>
                                    <p className="font-medium">{formatCurrency(processingFee)}</p>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <p>Coupon ({appliedCoupon.code})</p>
                                        <button onClick={handleRemoveCoupon} className="font-medium flex items-center gap-1 hover:text-error-500">
                                            <span>- {formatCurrency(discount)}</span>
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                {discount === 0 && (
                                    <div className="flex justify-between">
                                        <button onClick={() => setIsCouponModalOpen(true)} className="text-primary-500 font-semibold text-sm hover:underline">
                                            Apply Coupon
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                                <p>Total Amount</p>
                                <p>{formatCurrency(totalPrice)}</p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full bg-primary-500 text-white font-bold py-3 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalPrice)}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isCouponModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsCouponModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white dark:bg-neutral-800 w-full max-w-md rounded-2xl shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CouponModal
                                onClose={() => setIsCouponModalOpen(false)}
                                onApplySuccess={(coupon) => {
                                    setAppliedCoupon(coupon);
                                    setIsCouponModalOpen(false);
                                }}
                                subtotal={ticketPrice}
                                eventId={eventId}
                                categoryId={event.category?._id || event.category}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Checkout;