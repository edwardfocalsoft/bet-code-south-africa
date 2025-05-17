
import { Route, Routes, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import RegisterConfirmation from "./pages/auth/RegisterConfirmation";
import NotFound from "./pages/NotFound";

import AllTickets from "./pages/tickets/AllTickets";
import TicketDetails from "./pages/tickets/TicketDetails";

import AllSellers from "./pages/sellers/AllSellers";
import SellersLeaderboard from "./pages/sellers/SellersLeaderboard";
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
import AdminBuyers from "./pages/admin/Buyers";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import SeedDatabase from "./pages/admin/SeedDatabase";

import UserSettings from "./pages/user/Settings";
import Notifications from "./pages/user/Notifications";

import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from "./contexts/auth";
import ProfileSetup from "./pages/auth/ProfileSetup";

// Create a wrapper component for route redirection
const HomeRedirect = () => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Index />;
  }
  
  // Redirect based on user role
  if (userRole === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (userRole === "seller") {
    return <Navigate to="/seller/dashboard" replace />;
  } else {
    return <Navigate to="/buyer/dashboard" replace />;
  }
};

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="betting-theme">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          
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
          <Route path="/sellers/leaderboard" element={<SellersLeaderboard />} />
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
          <Route path="/admin/buyers" element={<AdminBuyers />} />
          <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
          <Route path="/admin/seed-database" element={<SeedDatabase />} />
          
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
