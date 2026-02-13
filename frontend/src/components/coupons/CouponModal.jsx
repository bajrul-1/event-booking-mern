import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailableCoupons, validateCoupon, clearValidationError } from '../../redux/features/coupons/couponsSlice';
import { X, TicketPercent, LoaderCircle } from 'lucide-react';
import { toast } from 'react-toastify';

// onApplySuccess: Coupon apply hole callback
function CouponModal({ onClose, subtotal, eventId, categoryId, onApplySuccess }) {
    const dispatch = useDispatch();

    const {
        available: availableCoupons,
        fetchStatus,
        fetchError,
        validationStatus,
        validationError,
        noCouponsMessage
    } = useSelector(state => state.coupons);

    const [couponCode, setCouponCode] = useState('');

    useEffect(() => {
        // Coupon list fetch করার আগে validation error clear করা দরকার
        dispatch(clearValidationError());

        if (eventId && categoryId) {
            // Event এবং Category ID ব্যবহার করে উপলব্ধ কুপন fetch করা হচ্ছে
            dispatch(fetchAvailableCoupons({ eventId, categoryId }));
        }
    }, [dispatch, eventId, categoryId]);

    const handleApply = (code) => {
        if (!code) return;

        // কুপন ভ্যালিডেট করার জন্য ব্যাকএন্ডে অনুরোধ পাঠানো
        dispatch(validateCoupon({ code, subtotal, eventId }))
            .unwrap()
            .then((validatedCoupon) => {
                toast.success(`Coupon "${validatedCoupon.code}" applied successfully!`);

                // ✅ FIX: Backend-এর 'discount' এবং 'type' ফিল্ডগুলিকে Checkout.jsx-এর প্রয়োজনীয় 'amount' এবং 'discountType' ফিল্ডে ম্যাপ করা হলো।
                const couponToApply = {
                    code: validatedCoupon.code,
                    amount: validatedCoupon.discount,
                    discountType: validatedCoupon.type,
                    _id: validatedCoupon._id
                };

                onApplySuccess(couponToApply);
                onClose();
            })
            .catch(() => {
                // Error Redux/useEffect-এর মাধ্যমে হ্যান্ডেল হবে
            });
    };

    const handleInputChange = (e) => {
        setCouponCode(e.target.value.toUpperCase());
        if (validationError) {
            dispatch(clearValidationError());
        }
    }

    return (
        <div className="bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold font-heading">Apply Coupon</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <label htmlFor="couponCode" className="sr-only">Coupon Code</label>
                        <input
                            id="couponCode"
                            name="couponCode"
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={handleInputChange}
                            className="grow w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                            onClick={() => handleApply(couponCode)}
                            className="px-6 py-3 bg-secondary-500 text-white font-semibold rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50"
                            disabled={!couponCode || validationStatus === 'loading'}
                        >
                            {validationStatus === 'loading' ? <LoaderCircle size={18} className="animate-spin" /> : 'Apply'}
                        </button>
                    </div>
                    {validationError && <p className="text-error-500 text-sm">{validationError}</p>}
                </div>
                <div>
                    <h3 className="font-semibold mb-4">Available Coupons</h3>
                    {fetchStatus === 'loading' && (
                        <div className="flex justify-center py-10"><LoaderCircle className="animate-spin text-primary-500" /></div>
                    )}
                    {fetchStatus === 'succeeded' && availableCoupons.length > 0 && (
                        <div className="space-y-3">
                            {availableCoupons.map(coupon => (
                                <div key={coupon._id} className="bg-primary-100 dark:bg-neutral-700 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-100"><TicketPercent size={16} /> {coupon.code}</p>
                                        {/* FIX: Backend-এ 'description' ফিল্ডটি আছে */}
                                        <p className="text-xs text-neutral-500 mt-1">{coupon.description}</p>
                                    </div>
                                    <button onClick={() => handleApply(coupon.code)} className="text-sm font-bold text-primary-500 hover:text-primary-600">
                                        Apply
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {fetchStatus === 'succeeded' && availableCoupons.length === 0 && (
                        <p className="text-center text-neutral-500 py-10">{noCouponsMessage || "No coupons found."}</p>
                    )}
                    {fetchStatus === 'failed' && (
                        <p className="text-center text-error-500 py-10">{fetchError || 'Could not load coupons. Please try again.'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CouponModal;