import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AllTickets from './pages/tickets/AllTickets';
import TicketDetails from './pages/tickets/TicketDetails';
import UserSettings from './pages/user/Settings';
import UserWallet from './pages/user/Wallet';
import BuyerPurchases from './pages/buyer/Purchases';
import BuyerDashboard from './pages/buyer/Dashboard'; 
import SellerDashboard from './pages/seller/Dashboard';
import SellerProfile from './pages/seller/Profile';
import CreateTicket from './pages/seller/CreateTicket';
import SellerTickets from './pages/seller/Tickets';
import AdminDashboard from './pages/admin/Dashboard';
import AdminBuyers from './pages/admin/Buyers';
import AdminSellers from './pages/admin/Sellers';
import AdminTickets from './pages/admin/Tickets';
import Cases from './pages/admin/Cases';
import PaymentSuccess from "./pages/payment/Success";
import PaymentCancel from "./pages/payment/Cancel";
import PaymentSettings from "./pages/admin/PaymentSettings";
import { AuthProvider } from './contexts/auth';
import NotFound from './pages/NotFound';

// Import statements with corrected paths
import Home from './pages/Index'; 
import Login from './pages/auth/Login'; 
import Register from './pages/auth/Register'; 
import SellerPublicProfile from './pages/sellers/SellerPublicProfile';
import SellersLeaderboard from './pages/sellers/SellersLeaderboard';
import Users from './pages/admin/Buyers';
import Notifications from './pages/user/Notifications';
import SellerWithdrawals from './pages/seller/Withdrawals';
import AdminWithdrawals from './pages/admin/Withdrawals';
import UserCasesPage from './pages/user/Cases';
import CaseDetailsPage from './pages/user/CaseDetails';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/tickets" element={<AllTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          <Route path="/sellers/:id" element={<SellerPublicProfile />} />
          <Route path="/sellers/leaderboard" element={<SellersLeaderboard />} />

          {/* User Routes */}
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/user/wallet" element={<UserWallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user/cases" element={<UserCasesPage />} />
          <Route path="/user/cases/:id" element={<CaseDetailsPage />} />
          <Route path="/cases" element={<UserCasesPage />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/purchases" element={<BuyerPurchases />} />

          {/* Seller Routes */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
          <Route path="/seller/tickets/create" element={<CreateTicket />} />
          <Route path="/seller/tickets" element={<SellerTickets />} />
          <Route path="/seller/withdrawals" element={<SellerWithdrawals />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/buyers" element={<AdminBuyers />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/cases" element={<Cases />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          
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
