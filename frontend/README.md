# Event Booking Platform - Frontend

This is the frontend client for the Event Booking Platform within the MERN stack.

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or higher)

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### ⚙️ Environment Variables

Create a `.env` file in the `frontend` directory and add the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Backend API URL
VITE_API_URL=http://localhost:5000

# Razorpay
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 🏃‍♂️ Running the Application

Start the development server:

```bash
npm run dev
```
The application will run on `http://localhost:5173` (default Vite port).

### 🏗️ Building for Production

To build the application for production:

```bash
npm run build
```

## 🛠️ Tech Stack

-   **Framework:** React (Vite)
-   **Styling:** Tailwind CSS
-   **State Management:** Redux Toolkit
-   **Routing:** React Router DOM
-   **HTTP Client:** Axios
-   **UI Libraries:** Framer Motion, React Icons, React Toastify
