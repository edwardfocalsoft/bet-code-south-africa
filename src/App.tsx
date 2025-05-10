
import { Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import RegisterConfirmation from "./pages/auth/RegisterConfirmation";
import NotFound from "./pages/NotFound";

import AllTickets from "./pages/tickets/AllTickets";
import TicketDetails from "./pages/tickets/TicketDetails";

import AllSellers from "./pages/sellers/AllSellers";
import SellerPublicProfile from "./pages/sellers/SellerPublicProfile";

import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerPurchases from "./pages/buyer/Purchases";
import BuyerProfile from "./pages/buyer/Profile";

import SellerDashboard from "./pages/seller/Dashboard";
import SellerTickets from "./pages/seller/Tickets";
import SellerCreateTicket from "./pages/seller/CreateTicket";
import SellerProfile from "./pages/seller/Profile";
import SellerWithdrawals from "./pages/seller/Withdrawals";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminTickets from "./pages/admin/Tickets";
import AdminSellers from "./pages/admin/Sellers";
import AdminWithdrawals from "./pages/admin/Withdrawals";

import UserSettings from "./pages/user/Settings";
import Notifications from "./pages/user/Notifications";

import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { AuthProvider } from "./contexts/auth";
import ProfileSetup from "./pages/auth/ProfileSetup";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="betting-theme">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Auth Routes */}
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/register/confirmation" element={<RegisterConfirmation />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/profile-setup" element={<ProfileSetup />} />
          
          {/* Ticket Routes */}
          <Route path="/tickets" element={<AllTickets />} />
          <Route path="/tickets/:id" element={<TicketDetails />} />
          
          {/* Seller Routes - Public */}
          <Route path="/sellers" element={<AllSellers />} />
          <Route path="/sellers/:id" element={<SellerPublicProfile />} />
          
          {/* Buyer Routes */}
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
          <Route path="/buyer/purchases" element={<BuyerPurchases />} />
          <Route path="/buyer/profile" element={<BuyerProfile />} />
          
          {/* Seller Routes - Private */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/tickets" element={<SellerTickets />} />
          <Route path="/seller/tickets/create" element={<SellerCreateTicket />} />
          <Route path="/seller/profile" element={<SellerProfile />} />
          <Route path="/seller/withdrawals" element={<SellerWithdrawals />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<AdminTickets />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          
          {/* User Routes */}
          <Route path="/user/settings" element={<UserSettings />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Toaster />
        <SonnerToaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
