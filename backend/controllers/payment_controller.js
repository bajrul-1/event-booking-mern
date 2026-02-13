import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from './../models/Order.js';
import User from './../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
    try {
        const { eventId, tickets, paymentDetails, appliedCoupon } = req.body;
        const clerkUserId = req.auth.userId;

        const user = await User.findOne({ clerkId: clerkUserId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found in database.' });
        }

        const formattedTickets = tickets.map(ticket => ({
            tierName: ticket.tierName,
            quantity: ticket.quantity,
            pricePerTicket: ticket.price || ticket.pricePerTicket
        }));

        const options = {
            amount: Math.round(paymentDetails.totalAmount * 100),
            currency: 'INR',
            receipt: `rcpt_${crypto.randomBytes(8).toString('hex')}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        const newOrder = await Order.create({
            eventId,
            buyerId: user._id,
            tickets: formattedTickets,
            paymentDetails,
            couponId: appliedCoupon ? appliedCoupon._id : null,
            status: 'pending',
            // Payment ID ekhon null thakbe
            razorpay: { orderId: razorpayOrder.id, paymentId: null, signature: null }
        });

        res.status(200).json({
            success: true,
            razorpayOrder,
            databaseOrder: newOrder,
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Could not initiate payment.' });
    }
};

// --- THE FIX IS HERE ---
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, databaseOrderId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment Successful hole Payment ID update kora hocche
            const updatedOrder = await Order.findByIdAndUpdate(databaseOrderId, {
                status: 'successful',
                $set: {
                    'razorpay.paymentId': razorpay_payment_id, // <-- Set Payment ID clearly
                    'razorpay.signature': razorpay_signature
                }
            }, { new: true });

            res.status(200).json({
                success: true,
                message: "Payment verified successfully.",
                orderId: updatedOrder._id
            });
        } else {
            await Order.findByIdAndUpdate(databaseOrderId, { status: 'failed' });
            res.status(400).json({ success: false, message: 'Payment verification failed.' });
        }
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ success: false, message: 'Could not verify payment.' });
    }
};

export const handlePaymentFailure = async (req, res) => {
    try {
        const { databaseOrderId } = req.body;
        await Order.findByIdAndUpdate(databaseOrderId, { status: 'failed' });
        res.status(200).json({ success: true, message: 'Failed payment logged.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not log failed payment.' });
    }
};

export const handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    try {
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest === signature) {
            const event = req.body;
            if (event.event === 'order.paid') {
                const orderId = event.payload.order.entity.id;
                const paymentId = event.payload.payment.entity.id; // Webhook theke payment ID

                await Order.findOneAndUpdate(
                    { 'razorpay.orderId': orderId },
                    {
                        status: 'successful',
                        'razorpay.paymentId': paymentId
                    }
                );
            }
        } else {
            return res.status(400).send('Invalid Signature');
        }
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
};