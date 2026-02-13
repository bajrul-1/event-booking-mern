import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Ticket } from 'lucide-react';

const formatDate = (isoString) => new Date(isoString).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
const formatCurrency = (amount) => `₹${(Number(amount) || 0).toFixed(2)}`;

function OrderListItem({ order }) {
    const navigate = useNavigate();
    const event = order.eventId;

    if (!event) return null;

    const handleCardClick = () => {
        navigate(`/booking-status?orderId=${order._id}`);
    };

    const handleTicketClick = (e) => {
        e.stopPropagation();
        navigate(`/my-tickets/view/${order._id}`);
    };

    const StatusIndicator = () => {
        const isPast = new Date(event.date) < new Date();
        const status = order.status;

        if (status === 'successful') {
            return (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full w-fit">
                    <CheckCircle size={16} />
                    <span className="font-bold text-sm">{isPast ? 'Ended' : 'Confirmed'}</span>
                </div>
            );
        }
        if (status === 'failed') {
            return (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full w-fit">
                    <XCircle size={16} />
                    <span className="font-bold text-sm">Failed</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full w-fit">
                <Clock size={16} />
                <span className="font-bold text-sm">Processing</span>
            </div>
        );
    };

    return (
        <div
            onClick={handleCardClick}
            className="group bg-white dark:bg-neutral-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            {/* Main Wrapper: Use FLEX to manage vertical/horizontal stacking */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">

                {/* LEFT SECTION (Image + Details) */}
                <div className="flex gap-4 items-start md:items-center grow min-w-0">

                    {/* Image */}
                    <div className="shrink-0">
                        <img
                            src={event.imageUrl?.startsWith('http') ? event.imageUrl : `${import.meta.env.VITE_API_URL}${event.imageUrl?.startsWith('/') ? '' : '/'}${event.imageUrl}`}
                            alt={event.title}
                            className="w-24 h-16 object-cover rounded-xl shadow-sm transition-transform duration-300"
                            onError={(e) => {
                                e.target.style.display = 'none'; // Hide if broken
                            }}
                        />
                    </div>

                    {/* Title and Status */}
                    <div className="space-y-1 min-w-0 grow">
                        <div className="flex items-center gap-3">
                            <StatusIndicator />
                        </div>

                        <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {event.title}
                        </h3>

                        {/* Date and Location */}
                        <div className="flex flex-wrap items-center gap-x-2 text-sm text-neutral-500 dark:text-neutral-400">
                            <span className="bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide">
                                {event.category?.name || 'Event'}
                            </span>
                            <span className="truncate">• {formatDate(event.date)}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT SECTION (Price and Button) - Conditionally use flex for wrapping */}
                <div className="flex justify-between items-center w-full md:w-auto md:flex-col md:items-end md:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-200 dark:border-neutral-700">

                    {/* Total Price */}
                    <div className="text-left md:text-right flex items-center md:flex-col gap-2">
                        <p className="font-bold text-xl text-neutral-900 dark:text-neutral-100">
                            {formatCurrency(order.paymentDetails?.totalAmount)}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {order.tickets?.reduce((acc, t) => acc + t.quantity, 0)} Ticket(s)
                        </p>
                    </div>

                    {/* View Ticket Button (Conditional) */}
                    {order.status === 'successful' && (
                        <button
                            onClick={handleTicketClick}
                            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Ticket size={16} />
                            View Ticket
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OrderListItem;