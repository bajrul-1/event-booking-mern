import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import { Ticket, LoaderCircle, FilterX } from 'lucide-react';
import { fetchMyOrders } from '../../redux/features/ordersSlice.js';
import OrderFilterSidebar from '../../components/tickets/OrderFilterSidebar';
import OrderListItem from '../../components/tickets/OrderListItem';

function MyTickets() {
    const dispatch = useDispatch();
    const { getToken } = useAuth();

    const { items: orders, status, error } = useSelector((state) => state.orders);

    const [filters, setFilters] = useState({
        status: { successful: false, failed: false, pending: false },
        time: 'anytime',
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                // --- FIX: '{ template: 'standard' }' sorano hoyeche ---
                const token = await getToken();
                if (token) {
                    dispatch(fetchMyOrders(token));
                }
            } catch (err) {
                console.error("Token error:", err);
            }
        };
        loadData();
    }, [dispatch, getToken]);


    const filteredOrders = orders.filter(order => {
        const statusFilter = filters.status;
        const isAnyStatusSelected = statusFilter.successful || statusFilter.failed || statusFilter.pending;
        const statusMatch = !isAnyStatusSelected || statusFilter[order.status];

        const now = new Date();
        const orderDate = new Date(order.createdAt);
        let timeMatch = true;

        if (filters.time === '30days') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            timeMatch = orderDate >= thirtyDaysAgo;
        } else if (filters.time === '6months') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);
            timeMatch = orderDate >= sixMonthsAgo;
        }

        return statusMatch && timeMatch;
    });

    return (
        <div className="bg-neutral-50 dark:bg-neutral-950 font-body min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                <h1 className="text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-8 flex items-center gap-3">
                    <Ticket className="text-primary-500" /> My Tickets
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1">
                        <OrderFilterSidebar filters={filters} setFilters={setFilters} />
                    </aside>

                    <main className="lg:col-span-3">
                        {status === 'loading' ? (
                            <div className="flex justify-center py-20">
                                <LoaderCircle size={48} className="animate-spin text-primary-500" />
                            </div>
                        ) : status === 'failed' ? (
                            <div className="text-center py-20 text-error-500">
                                <p>Error loading tickets: {error}</p>
                                <p className="text-sm mt-2 text-neutral-500">Please try refreshing the page.</p>
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <div className="space-y-4">
                                {filteredOrders.map(order => (
                                    <OrderListItem key={order._id} order={order} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 px-6 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-4">
                                    <FilterX size={32} className="text-neutral-400" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">No Tickets Found</h2>
                                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                                    We couldn't find any bookings matching your filters.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default MyTickets;