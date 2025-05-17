
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllTickets from './pages/tickets/AllTickets';
import TicketDetails from './pages/tickets/TicketDetails';
import UserSettings from './pages/user/Settings';
import UserWallet from './pages/user/Wallet';
import BuyerPurchases from './pages/buyer/Purchases';
import BuyerDashboard from './pages/buyer/Dashboard'; // Added import for BuyerDashboard
import SellerDashboard from './pages/seller/Dashboard';
import CreateTicket from './pages/seller/CreateTicket';
import SellerTickets from './pages/seller/Tickets';
import AdminDashboard from './pages/admin/Dashboard';
import Cases from './pages/admin/Cases';
import PaymentSuccess from "./pages/payment/Success";
import PaymentCancel from "./pages/payment/Cancel";
import PaymentSettings from "./pages/admin/PaymentSettings";
import { AuthProvider } from './contexts/auth';
import NotFound from './pages/NotFound';

// Import statements that need correction
import Home from './pages/Index'; // Changed from './pages/Home'
import Login from './pages/Login'; // Changed from './pages/Login'
import Register from './pages/Register'; // Changed from './pages/Register'
import SellerProfile from './pages/sellers/SellerPublicProfile'; // Changed from './pages/sellers/SellerProfile'
import Users from './pages/admin/Buyers'; // Changed from './pages/admin/Users'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tickets" element={<AllTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/sellers/:id" element={<SellerProfile />} />

          {/* User Routes */}
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/user/wallet" element={<UserWallet />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/purchases" element={<BuyerPurchases />} />

          {/* Seller Routes */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/tickets/create" element={<CreateTicket />} />
          <Route path="/seller/tickets" element={<SellerTickets />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cases" element={<Cases />} />
          <Route path="/admin/users" element={<Users />} />
          
          {/* Payment routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          
          {/* Admin payment settings route */}
          <Route path="/admin/payment-settings" element={<PaymentSettings />} />

          {/* 404 Route - always keep it last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
