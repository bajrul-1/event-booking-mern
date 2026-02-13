# Event Booking Platform (MERN)

A comprehensive Event Booking Platform built with the MERN stack (MongoDB, Express, React, Node.js).

## 📂 Project Structure

-   **[frontend](./frontend)**: React application (Vite)
-   **[backend](./backend)**: Express API server

## 🚀 Quick Start

To run the entire project, you will need to set up both the backend and frontend.

### 1. Backend Setup
Navigate to the `backend` folder and follow the instructions in [backend/README.md](./backend/README.md).
```bash
cd backend
npm install
# Setup .env
npm run seed # (Optional: to create admin user)
npm start
```

### 2. Frontend Setup
Navigate to the `frontend` folder and follow the instructions in [frontend/README.md](./frontend/README.md).
```bash
cd frontend
npm install
# Setup .env
npm run dev
```

## ✨ Features
-   User Authentication (Clerk)
-   Event Booking & Management
-   Admin Dashboard
-   Payment Integration (Razorpay/Stripe)
