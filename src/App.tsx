import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ApplicationWrapper from "@/components/layout/ApplicationWrapper";
import HomePage from "@/pages/HomePage";
import TicketsPage from "@/pages/TicketsPage";
import SellersPage from "@/pages/SellersPage";
import SellerProfilePage from "@/pages/SellerProfilePage";
import TicketDetailsPage from "@/pages/TicketDetailsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import UserSettingsPage from "@/pages/UserSettingsPage";
import UserWallet from "@/pages/user/Wallet";
import SellersLeaderboard from "@/pages/sellers/SellersLeaderboard";
import ContactPage from "@/pages/ContactPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSellers from "@/pages/admin/AdminSellers";
import AdminBuyers from "@/pages/admin/AdminBuyers";
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminCases from "@/pages/admin/AdminCases";
import AdminWithdrawals from "@/pages/admin/AdminWithdrawals";
import AdminPaymentSettings from "@/pages/admin/AdminPaymentSettings";
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
