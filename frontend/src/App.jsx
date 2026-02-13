import { Routes, Route, useLocation, Navigate } from 'react-router-dom'; // useLocation hook add kora holo

import { SignedIn, SignedOut, SignIn, SignUp, RedirectToSignIn } from '@clerk/clerk-react';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//=================== Page and Component Imports ===================//
import Header from './components/Navbar'; // User-er Navbar
import Footer from './components/Footer';
import Home from './pages/user/Home';
import Events from './pages/user/Events';
import About from './pages/user/About';
import Contact from './pages/user/Contact';
import EventDetails from './pages/user/events/EventDetails';
import Checkout from './pages/user/checkout/Checkout';
import MyTickets from './pages/user/MyTickets';
import MyTicketDetails from './pages/user/tickets/MyTicketDetails';
import CompleteProfile from './pages/user/onboarding/CompleteProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CategoryEventsPage from './pages/user/CategoryEventsPage';
import NotFoundPage from './pages/user/NotFoundPage';
import OrganizerLoginPage from './pages/Organizer/OrganizerLoginPage';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import DashboardOverview from './pages/admin/DashboardOverview';
import OrganizerProtectedRoute from './router/OrganizerProtectedRoute';
import ManageOrganizersPage from './pages/admin/ManageOrganizersPage';
import OrganizerProfile from './pages/admin/OrganizerProfile';

import ManageEventsPage from './pages/admin/ManageEventsPage';
import AdminRoute from './router/AdminRoute';
import CreateEventPage from './pages/Organizer/CreateEventPage';
import ManageCategoryPage from './pages/admin/ManageCategoryPage';
import BookingStatus from './pages/user/checkout/BookingStatus';

function App() {
  const location = useLocation(); // useLocation hook-ta use kora hocche

  // Checking if the current path starts with /organizer/dashboard
  const isAdminDashboardRoute = location.pathname.startsWith('/organizer/dashboard');

  return (
    <>
      {/* --- Conditional Header Rendering --- */}
      {/* Jodi admin dashboard route na hoy, tokhon shudhu user-er Header dekhao */}
      {!isAdminDashboardRoute && <Header />}


      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <main className="min-h-[calc(100vh-12rem)]">
        <Routes>
          {/* === PUBLIC ROUTES === */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events/category/:slug" element={<CategoryEventsPage />} />

          {/* === Organizer Routes === */}
          <Route path="/organizer" element={<OrganizerLoginPage />} />

          <Route element={<OrganizerProtectedRoute />}>
            <Route path="/organizer/dashboard" element={<AdminDashboardLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="events" element={<ManageEventsPage />} />

              <Route path="events" element={<ManageEventsPage />} />
              <Route path="events/create" element={<CreateEventPage />} />
              <Route path="events/edit/:eventId" element={<CreateEventPage />} />

              <Route element={<AdminRoute />}>
                <Route path="organizers" element={<ManageOrganizersPage />} />
                <Route path="organizers/:id" element={<OrganizerProfile />} />
                <Route path="categories" element={<ManageCategoryPage />} />
              </Route>
            </Route>
          </Route>

          {/* === AUTH ROUTES === */}
          <Route path="/sign-in/*" element={
            <>
              <SignedIn>
                <Navigate to={location.state?.from?.pathname || "/"} replace />
              </SignedIn>
              <SignedOut>
                <div className="flex justify-center items-center py-20"><SignIn routing="path" path="/sign-in" /></div>
              </SignedOut>
            </>
          } />
          <Route path="/sign-up/*" element={
            <>
              <SignedIn>
                <Navigate to={location.state?.from?.pathname || "/"} replace />
              </SignedIn>
              <SignedOut>
                <div className="flex justify-center items-center py-20"><SignUp routing="path" path="/sign-up" /></div>
              </SignedOut>
            </>
          } />

          {/* === ONBOARDING ROUTE === */}
          <Route path="/complete-profile" element={
            <SignedIn>
              <CompleteProfile />
            </SignedIn>
          } />

          {/* === PROTECTED ROUTES === */}
          <Route element={
            <>
              <SignedIn>
                <ProtectedRoute />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }>

            <Route path="/checkout/:eventId" element={<Checkout />} />
            <Route path="/booking-status" element={<BookingStatus />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/my-tickets/view/:ticketId" element={<MyTicketDetails />} />
          </Route>

          {/* 404 Page for any other route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Footer-o conditionally render kora holo jodi admin dashboard na hoy */}
      {!isAdminDashboardRoute && <Footer />}
    </>
  );
}

export default App;

