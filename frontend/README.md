# Event Booking Platform

A full-stack MERN application for booking and managing events.  
Frontend is built with **React + Vite + TailwindCSS 4.x + Redux + Formik + Yup**.  
Backend is built with **Node.js + Express + MongoDB**.

---

## 👤 Author
**Bajrul Middya**

---

## 📂 Project Structure

event-booking-platform/
│── backend/ # Express + MongoDB
│ ├── routes/ # user, event, booking, category, payment routers
│ └── controllers/
│
│── frontend/ # React + Vite + TailwindCSS
│ ├── src/
│ ├── index.css
│ └── App.jsx
│
└── README.md

<========================================================>

# Frontend Setup

<===|| Install ||===>
cd frontend
npm install

<===|| Development ||===>
npm run dev

<===|| TailwindCSS (v4.1.x) Setup ||===>

npm install tailwindcss @tailwindcss/vite


✔ React + Tailwind 4.x (no custom CSS)
✔ Formik + Yup ফর্ম ভ্যালিডেশনের জন্য
✔ Clerk Auth লগইন সিস্টেমের জন্য
✔ Stripe পেমেন্ট
✔ MongoDB + Express ব্যাকএন্ড
✔ File Upload → Local/S3
✔ Lucide Icons (no deprecated icons)
✔ Responsive UI (Header, Footer, Filter, Search)


1. Search & Filter Bar:

    Purpose: User-der-ke tader pochonder event khuje ber korar jonno ekta powerful tool deya.

    Features:

Search Input: Event-er naam diye search korar jonno.

Category Filter: Dropdown ba button theke category (Music, Tech, etc.) select korar jonno.

Location Filter: City ba area diye filter korar jonno.

Date Filter: Ekta date range select kore event khujar jonno.

Sort By: Price (Low to High) ba Date (Newest First) onujayi sort korar jonno.




