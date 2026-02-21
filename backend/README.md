# Event Booking Platform - Backend

This is the backend API for the Event Booking Platform using the MERN stack.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or higher)
-   [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Installation

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### ⚙️ Environment Variables

Create a `.env` file in the `backend` directory and add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

# --- Razorpay ---
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# --- Clerk (Authentication) ---
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# --- JWT ---
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# --- Cloudinary (Images) ---
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 🗄️ Database Seeding (Admin User)

To create an initial Admin user, run the seed script:

```bash
npm run seed
```
This will create an admin with:
-   **Email:** `admin@eventbooking.com`
-   **Password:** `AdminPassword123`

### 🏃‍♂️ Running the Server

Start the development server:

```bash
npm start
```
The server will run on `http://localhost:5000` (or your defined PORT).

## 🛠️ Tech Stack

-   **Runtime:** Node.js
-   **Framework:** Express.js
-   **Database:** MongoDB & Mongoose
-   **Authentication:** Clerk & JWT
-   **Payments:** Razorpay & Stripe
-   **File Uploads:** Multer & Cloudinary
