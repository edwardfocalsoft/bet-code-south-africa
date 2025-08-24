
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ApplicationWrapper from "@/components/layout/ApplicationWrapper";
import HomePage from "@/pages/Index";
import TicketsPage from "@/pages/tickets/AllTickets";
import SellersPage from "@/pages/sellers/AllSellers";
import SellerProfilePage from "@/pages/sellers/SellerPublicProfile";
import TicketDetailsPage from "@/pages/tickets/TicketDetails";
import UserProfilePage from "@/pages/buyer/Profile";
import UserSettingsPage from "@/pages/user/Settings";
import UserWallet from "@/pages/user/Wallet";
import SellersLeaderboard from "@/pages/sellers/SellersLeaderboard";
import ContactPage from "@/pages/Contact";
import TermsOfServicePage from "@/pages/Terms";
import PrivacyPolicyPage from "@/pages/Privacy";
import NotFoundPage from "@/pages/NotFound";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSellers from "@/pages/admin/Sellers";
import AdminBuyers from "@/pages/admin/Buyers";
import AdminTickets from "@/pages/admin/Tickets";
import AdminCases from "@/pages/admin/Cases";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminPaymentSettings from "@/pages/admin/PaymentSettings";
import SeedDatabase from "@/pages/admin/SeedDatabase";
import AdminWeeklyRewards from "@/pages/admin/WeeklyRewards";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <ApplicationWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/sellers" element={<SellersPage />} />
              <Route path="/sellers/:sellerId" element={<SellerProfilePage />} />
              <Route path="/tickets/:ticketId" element={<TicketDetailsPage />} />
              <Route path="/sellers/leaderboard" element={<SellersLeaderboard />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="*" element={<NotFoundPage />} />

              {/* User Routes */}
              <Route path="/user/profile" element={<UserProfilePage />} />
              <Route path="/user/settings" element={<UserSettingsPage />} />
              <Route path="/user/wallet" element={<UserWallet />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="/admin/buyers" element={<AdminBuyers />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/cases" element={<AdminCases />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
              <Route path="/admin/weekly-rewards" element={<AdminWeeklyRewards />} />
              <Route path="/admin/seed" element={<SeedDatabase />} />
            </Routes>
          </ApplicationWrapper>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
