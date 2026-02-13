import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Download, Calendar, MapPin, User, QrCode, ArrowLeft, Ticket, LoaderCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image'; // --- NEW IMPORT ---
import { toast } from 'react-toastify';

// --- Custom Hook to Fetch Ticket ---
const useTicketDetails = (ticketId) => {
  const { getToken } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) {
      setError('Ticket ID missing');
      setIsLoading(false);
      return;
    }

    const fetchTicket = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
          setTicket(data.order);
        } else {
          setError(data.message || 'Ticket not found');
        }
      } catch (err) {
        console.error('Fetch ticket error:', err);
        setError('Failed to load ticket details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [ticketId, getToken]);

  return { ticket, isLoading, error };
};

// --- Format Helpers ---
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatDateTime = (iso) => {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const formatCurrency = (amount) => `₹${(Number(amount) || 0).toFixed(2)}`;

// --- Main Component ---
function MyTicketDetails() {
  const { ticketId } = useParams();
  const { user } = useUser();
  const { ticket, isLoading, error } = useTicketDetails(ticketId);
  const ticketRef = useRef(null);

  // --- NEW DOWNLOAD LOGIC (Fixes Cut-off Issue) ---
  const handleDownload = async () => {
    if (ticketRef.current === null) return;

    try {
      toast.info("Generating PDF...");

      // 1. Convert DOM to Image
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff', // Force white background
        pixelRatio: 2 // High quality
      });

      // 2. Get dimensions of the ticket element
      const imgWidth = ticketRef.current.offsetWidth;
      const imgHeight = ticketRef.current.offsetHeight;

      // 3. Create PDF with exact matching dimensions
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      // 4. Add image to PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Ticket-${ticket._id.slice(-8)}.pdf`);

      toast.dismiss(); // Clear info toast
      toast.success("Ticket downloaded successfully!");

    } catch (err) {
      console.error("Download failed:", err);
      toast.error("Failed to generate ticket. Please try again.");
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-neutral-50 dark:bg-neutral-950"><LoaderCircle size={50} className="animate-spin text-primary-500" /></div>;

  if (error || !ticket) return <div className="flex flex-col items-center justify-center h-screen text-center bg-neutral-50 dark:bg-neutral-950 p-4"><AlertCircle size={60} className="text-error-500 mb-4" /><h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Ticket Not Found</h2><Link to="/my-tickets" className="mt-6 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">Back to My Tickets</Link></div>;

  // --- SECURITY CHECK ---
  if (ticket.status !== 'successful') {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center bg-neutral-50 dark:bg-neutral-950 p-4">
        {ticket.status === 'failed' ? <XCircle size={64} className="text-error-500 mb-4" /> : <Clock size={64} className="text-warning-500 mb-4 animate-pulse" />}
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">{ticket.status === 'failed' ? 'Payment Failed' : 'Payment Processing'}</h2>
        <div className="flex gap-4 mt-6">
          <Link to="/my-tickets" className="px-6 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg font-bold">Back to My Tickets</Link>
          <Link to={`/booking-status?orderId=${ticket._id}`} className="px-6 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors">Check Status</Link>
        </div>
      </div>
    );
  }

  const bookingId = ticket._id;
  const event = ticket.eventId || {};
  const ticketQuantity = ticket.tickets?.reduce((acc, t) => acc + t.quantity, 0) || 0;
  const { subtotal, processingFee, discountAmount, totalAmount } = ticket.paymentDetails || {};
  const isEventEnded = new Date(event.date) < new Date();

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen font-body">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/my-tickets" className="inline-flex items-center gap-2 text-primary-500 hover:underline mb-8 font-semibold">
          <ArrowLeft size={18} /> Back to All My Tickets
        </Link>

        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Left Column: Downloadable Ticket */}
          <div className="lg:col-span-3">
            {/* --- TICKET REFERENCE DIV (This part gets downloaded) --- */}
            <div className="w-full">
              <div ref={ticketRef} className={`bg-white p-6 rounded-xl shadow-sm ${isEventEnded ? 'grayscale opacity-90' : ''}`}>
                <div className="border-2 border-primary-500 rounded-xl overflow-hidden relative">
                  {/* Header */}
                  <div className={`p-6 ${isEventEnded ? 'bg-neutral-500' : 'bg-primary-500'} text-white`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold opacity-80 tracking-widest">EVENT TICKET</p>
                        <h3 className="text-2xl md:text-3xl font-bold font-heading mt-1">{event.title}</h3>
                      </div>
                      {isEventEnded && <span className="bg-white text-neutral-800 text-xs font-bold px-2 py-1 rounded">COMPLETED</span>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 grid grid-cols-3 gap-6 bg-white">
                    <div className="col-span-2 space-y-5">
                      <InfoItem icon={User} label="BOOKED BY" value={user?.fullName || 'Guest'} />
                      <InfoItem icon={Calendar} label="DATE & TIME" value={formatDateTime(event.date)} />
                      <InfoItem icon={MapPin} label="LOCATION" value={event.location} />
                    </div>

                    {/* QR Code */}
                    <div className="col-span-1 flex flex-col items-center justify-center border-l-2 border-dashed border-neutral-300 pl-4">
                      {isEventEnded ? (
                        <div className="text-center opacity-50">
                          <CalendarX size={60} className="text-neutral-400 mx-auto" />
                          <p className="mt-2 text-[10px] font-bold text-neutral-500 uppercase">Event Ended</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-2 bg-white">
                            <QRCodeCanvas value={bookingId} size={100} level="H" />
                          </div>
                          <p className="mt-2 text-[10px] font-mono text-neutral-600 font-bold tracking-tight">#{bookingId.slice(-8).toUpperCase()}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t-2 border-dashed border-neutral-300 p-4 bg-neutral-50 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <Ticket size={20} className="text-secondary-500" />
                      <p className="font-bold text-lg text-neutral-800">
                        {ticketQuantity} {ticketQuantity > 1 ? 'Tickets' : 'Ticket'}
                      </p>
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide">Admit One</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Summary & Download */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg sticky top-24 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-xl font-bold font-heading mb-4 text-neutral-800 dark:text-neutral-100">Booking Summary</h3>
              <div className="space-y-2">
                <SummaryRow label={`Subtotal (${ticketQuantity} tickets)`} value={formatCurrency(subtotal)} />
                <SummaryRow label="Processing Fee" value={`+ ${formatCurrency(processingFee)}`} />
                {discountAmount > 0 && <SummaryRow label="Discount Applied" value={`- ${formatCurrency(discountAmount)}`} isSuccess={true} />}
                <div className="pt-2 mt-2 border-t border-dashed border-neutral-300 dark:border-neutral-700">
                  <SummaryRow label="Total Paid" value={formatCurrency(totalAmount)} isTotal={true} />
                </div>
              </div>
              <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <p><span className="font-semibold">Booked On:</span> {formatDate(ticket.createdAt)}</p>
                <p><span className="font-semibold">Payment ID:</span> {ticket.razorpay?.paymentId || 'N/A'}</p>
              </div>

              {isEventEnded ? (
                <button disabled className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 font-bold rounded-lg cursor-not-allowed">
                  Event Completed
                </button>
              ) : (
                <button onClick={handleDownload} className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-success-500 text-white font-bold rounded-lg hover:bg-success-600 transition-colors shadow-lg shadow-success-500/20">
                  <Download size={18} /> Download Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-secondary-50 rounded-lg">
      <Icon size={16} className="text-secondary-600" />
    </div>
    <div>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{label}</p>
      <p className="font-bold text-sm text-neutral-800 wrap-break-word leading-tight">{value}</p>
    </div>
  </div>
);

const SummaryRow = ({ label, value, isSuccess, isTotal }) => (
  <div className={`flex justify-between items-center ${isTotal ? 'text-xl font-bold' : 'text-sm'} ${isSuccess ? 'text-success-500 font-semibold' : 'text-neutral-600 dark:text-neutral-300'}`}>
    <span>{label}</span> <span>{value}</span>
  </div>
);

export default MyTicketDetails;