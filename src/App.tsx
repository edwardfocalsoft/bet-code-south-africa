import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth";
import { useAuth } from "@/contexts/auth";

// Public pages
import Home from "@/pages/Index";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AllSellers from "@/pages/sellers/AllSellers";
import SellerPublicProfile from "@/pages/sellers/SellerPublicProfile";
import SellersLeaderboard from "@/pages/sellers/SellersLeaderboard";
import AllTickets from "@/pages/tickets/AllTickets";
import TicketDetails from "@/pages/tickets/TicketDetails";
import Contact from "@/pages/Contact";

// User pages
import Settings from "@/pages/user/Settings";
import UserWallet from "@/pages/user/Wallet";
import Cases from "@/pages/user/Cases";
import CaseDetails from "@/pages/user/CaseDetails";

// Seller pages
import CreateTicket from "@/pages/seller/CreateTicket";
import SellerTickets from "@/pages/seller/Tickets";
import EditTicket from "@/pages/seller/EditTicket";
import SellerTransactions from "@/pages/seller/Transactions";
import SellerDashboard from "@/pages/seller/Dashboard";

// Buyer pages
import BuyerDashboard from "@/pages/buyer/Dashboard";
import BuyerPurchases from "@/pages/buyer/Purchases";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSellers from "@/pages/admin/Sellers";
import AdminBuyers from "@/pages/admin/Buyers";
import AdminTickets from "@/pages/admin/Tickets";
import AdminCases from "@/pages/admin/Cases";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminWeeklyRewards from "@/pages/admin/WeeklyRewards";
import AdminPaymentSettings from "@/pages/admin/PaymentSettings";

const queryClient = new QueryClient();

function ApplicationWrapper({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ApplicationWrapper>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              {/* Keep legacy aliases just in case other parts link to them */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />

              {/* Sellers (public) */}
              <Route path="/sellers" element={<AllSellers />} />
              <Route path="/sellers/leaderboard" element={<SellersLeaderboard />} />
              <Route path="/sellers/:sellerId" element={<SellerPublicProfile />} />

              {/* Tickets (public) */}
              <Route path="/tickets" element={<AllTickets />} />
              <Route path="/tickets/:ticketId" element={<TicketDetails />} />
              
              {/* User Routes */}
              <Route path="/user/settings" element={<Settings />} />
              <Route path="/user/wallet" element={<UserWallet />} />
              <Route path="/user/cases" element={<Cases />} />
              <Route path="/user/cases/:caseId" element={<CaseDetails />} />

              {/* Buyer Routes */}
              <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
              <Route path="/buyer/purchases" element={<BuyerPurchases />} />

              {/* Seller Routes */}
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/tickets/create" element={<CreateTicket />} />
              <Route path="/seller/tickets" element={<SellerTickets />} />
              <Route path="/seller/tickets/edit/:ticketId" element={<EditTicket />} />
              <Route path="/seller/transactions" element={<SellerTransactions />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="/admin/buyers" element={<AdminBuyers />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/cases" element={<AdminCases />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              <Route path="/admin/weekly-rewards" element={<AdminWeeklyRewards />} />
              <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
            </Routes>
          </ApplicationWrapper>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
