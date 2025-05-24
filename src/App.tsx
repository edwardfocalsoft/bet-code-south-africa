
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { HelmetProvider } from 'react-helmet-async';

// Public pages
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import RegisterConfirmation from "@/pages/auth/RegisterConfirmation";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import Maintenance from "@/pages/Maintenance";
import AllTickets from "@/pages/tickets/AllTickets";
import TicketDetails from "@/pages/tickets/TicketDetails";
import AllSellers from "@/pages/sellers/AllSellers";
import SellerPublicProfile from "@/pages/sellers/SellerPublicProfile";
import SellersLeaderboard from "@/pages/sellers/SellersLeaderboard";

// Success and Cancel pages
import Success from "@/pages/payment/Success";
import Cancel from "@/pages/payment/Cancel";

// Buyer pages
import Dashboard from "@/pages/buyer/Dashboard";
import BuyerPurchases from "@/pages/buyer/Purchases";
import BuyerProfile from "@/pages/buyer/Profile";

// Seller pages
import SellerDashboard from "@/pages/seller/Dashboard";
import CreateTicket from "@/pages/seller/CreateTicket";
import EditTicket from "@/pages/seller/EditTicket";
import SellerTickets from "@/pages/seller/Tickets";
import SellerProfile from "@/pages/seller/Profile";
import SellerWithdrawals from "@/pages/seller/Withdrawals";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminTickets from "@/pages/admin/Tickets";
import AdminSellers from "@/pages/admin/Sellers";
import AdminBuyers from "@/pages/admin/Buyers";
import SeedDatabase from "@/pages/admin/SeedDatabase";
import AdminCases from "@/pages/admin/Cases";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import PaymentSettings from "@/pages/admin/PaymentSettings";

// User (shared) pages
import UserWallet from "@/pages/user/Wallet";
import UserSettings from "@/pages/user/Settings";
import UserNotifications from "@/pages/user/Notifications";
import ReportIssue from "@/pages/user/ReportIssue";
import Cases from "@/pages/user/Cases";
import CaseDetails from "@/pages/user/CaseDetails";

// Context providers
import { AuthProvider } from "./contexts/auth/AuthProvider";
import MaintenanceMiddleware from "@/components/layout/MaintenanceMiddleware";
import "./App.css";

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark" storageKey="bettickets-theme">
        <Router>
          <AuthProvider>
            <MaintenanceMiddleware>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/register/confirmation" element={<RegisterConfirmation />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/profile-setup" element={<ProfileSetup />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/tickets" element={<AllTickets />} />
                <Route path="/ticket/:id" element={<TicketDetails />} />
                <Route path="/sellers" element={<AllSellers />} />
                <Route path="/seller/:id" element={<SellerPublicProfile />} />
                <Route path="/leaderboard" element={<SellersLeaderboard />} />
                
                {/* Payment success and cancel routes */}
                <Route path="/payment/success" element={<Success />} />
                <Route path="/payment/cancel" element={<Cancel />} />

                {/* Buyer routes */}
                <Route path="/buyer/dashboard" element={<Dashboard />} />
                <Route path="/buyer/purchases" element={<BuyerPurchases />} />
                <Route path="/buyer/profile" element={<BuyerProfile />} />

                {/* Seller routes */}
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/create-ticket" element={<CreateTicket />} />
                <Route path="/seller/edit-ticket/:id" element={<EditTicket />} />
                <Route path="/seller/tickets" element={<SellerTickets />} />
                <Route path="/seller/profile" element={<SellerProfile />} />
                <Route path="/seller/withdrawals" element={<SellerWithdrawals />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/tickets" element={<AdminTickets />} />
                <Route path="/admin/sellers" element={<AdminSellers />} />
                <Route path="/admin/buyers" element={<AdminBuyers />} />
                <Route path="/admin/seed" element={<SeedDatabase />} />
                <Route path="/admin/cases" element={<AdminCases />} />
                <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                <Route path="/admin/settings" element={<PaymentSettings />} />

                {/* User (shared) routes */}
                <Route path="/user/wallet" element={<UserWallet />} />
                <Route path="/user/settings" element={<UserSettings />} />
                <Route path="/user/notifications" element={<UserNotifications />} />
                <Route path="/user/report" element={<ReportIssue />} />
                <Route path="/user/cases" element={<Cases />} />
                <Route path="/user/case/:id" element={<CaseDetails />} />

                {/* Redirects */}
                <Route path="/dashboard" element={<Navigate to="/buyer/dashboard" replace />} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MaintenanceMiddleware>
            <Toaster position="top-right" />
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
