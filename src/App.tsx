
import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider } from "@/contexts/auth";
import ApplicationWrapper from "@/components/layout/ApplicationWrapper";
import MaintenanceMiddleware from "@/components/layout/MaintenanceMiddleware";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import RegisterConfirmation from "@/pages/auth/RegisterConfirmation";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import Maintenance from "@/pages/Maintenance";
import LiveScores from "@/pages/LiveScores";
import Feed from "@/pages/Feed";

// User pages
import Wallet from "@/pages/user/Wallet";
import Notifications from "@/pages/user/Notifications";
import Settings from "@/pages/user/Settings";
import Cases from "@/pages/user/Cases";
import CaseDetails from "@/pages/user/CaseDetails";
import ReportIssue from "@/pages/user/ReportIssue";

// Buyer pages
import BuyerDashboard from "@/pages/buyer/Dashboard";
import BuyerProfile from "@/pages/buyer/Profile";
import BuyerPurchases from "@/pages/buyer/Purchases";

// Seller pages
import SellerDashboard from "@/pages/seller/Dashboard";
import SellerProfile from "@/pages/seller/Profile";
import SellerTickets from "@/pages/seller/Tickets";
import CreateTicket from "@/pages/seller/CreateTicket";
import EditTicket from "@/pages/seller/EditTicket";
import SellerWithdrawals from "@/pages/seller/Withdrawals";
import SellerTransactions from "@/pages/seller/Transactions";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSellers from "@/pages/admin/Sellers";
import AdminBuyers from "@/pages/admin/Buyers";
import AdminTickets from "@/pages/admin/Tickets";
import AdminCases from "@/pages/admin/Cases";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminPaymentSettings from "@/pages/admin/PaymentSettings";
import SeedDatabase from "@/pages/admin/SeedDatabase";

// Tickets pages
import AllTickets from "@/pages/tickets/AllTickets";
import TicketDetails from "@/pages/tickets/TicketDetails";

// Sellers pages
import AllSellers from "@/pages/sellers/AllSellers";
import SellersLeaderboard from "@/pages/sellers/SellersLeaderboard";
import SellerPublicProfile from "@/pages/sellers/SellerPublicProfile";

// Vouchers pages
import DailyVouchers from "@/pages/vouchers/DailyVouchers";

// Payment pages
import PaymentSuccess from "@/pages/payment/Success";
import PaymentCancel from "@/pages/payment/Cancel";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <AuthProvider>
            <MaintenanceMiddleware>
              <ApplicationWrapper>
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/auth/register" element={<Register />} />
                    <Route path="/auth/register/confirmation" element={<RegisterConfirmation />} />
                    <Route path="/auth/profile-setup" element={<ProfileSetup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/live-scores" element={<LiveScores />} />
                    <Route path="/feed" element={<Feed />} />

                    {/* User routes */}
                    <Route path="/user/wallet" element={<Wallet />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/user/settings" element={<Settings />} />
                    <Route path="/user/cases" element={<Cases />} />
                    <Route path="/user/cases/:id" element={<CaseDetails />} />
                    <Route path="/report-issue" element={<ReportIssue />} />

                    {/* Buyer routes */}
                    <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                    <Route path="/buyer/profile" element={<BuyerProfile />} />
                    <Route path="/buyer/purchases" element={<BuyerPurchases />} />

                    {/* Seller routes */}
                    <Route path="/seller/dashboard" element={<SellerDashboard />} />
                    <Route path="/seller/profile" element={<SellerProfile />} />
                    <Route path="/seller/tickets" element={<SellerTickets />} />
                    <Route path="/seller/tickets/create" element={<CreateTicket />} />
                    <Route path="/seller/tickets/edit/:id" element={<EditTicket />} />
                    <Route path="/seller/withdrawals" element={<SellerWithdrawals />} />
                    <Route path="/seller/transactions" element={<SellerTransactions />} />

                    {/* Admin routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/sellers" element={<AdminSellers />} />
                    <Route path="/admin/buyers" element={<AdminBuyers />} />
                    <Route path="/admin/tickets" element={<AdminTickets />} />
                    <Route path="/admin/cases" element={<AdminCases />} />
                    <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
                    <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
                    <Route path="/admin/seed" element={<SeedDatabase />} />

                    {/* Tickets routes */}
                    <Route path="/tickets" element={<AllTickets />} />
                    <Route path="/tickets/:id" element={<TicketDetails />} />

                    {/* Sellers routes */}
                    <Route path="/sellers" element={<AllSellers />} />
                    <Route path="/sellers/leaderboard" element={<SellersLeaderboard />} />
                    <Route path="/sellers/:username" element={<SellerPublicProfile />} />

                    {/* Vouchers routes */}
                    <Route path="/vouchers" element={<DailyVouchers />} />

                    {/* Payment routes */}
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<PaymentCancel />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ApplicationWrapper>
            </MaintenanceMiddleware>
          </AuthProvider>
        </Router>
        <Toaster 
          position="bottom-right"
          richColors
          theme="dark"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1a1a1a',
              border: '1px solid #333',
              color: '#fff',
            },
          }}
        />
        <ShadcnToaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
