import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/auth";
import { useAuth } from "@/contexts/auth";
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Profile from "@/pages/user/Profile";
import Settings from "@/pages/user/Settings";
import Sellers from "@/pages/Sellers";
import SellerProfile from "@/pages/SellerProfile";
import Tickets from "@/pages/Tickets";
import TicketDetails from "@/pages/TicketDetails";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminSellers from "@/pages/admin/Sellers";
import AdminBuyers from "@/pages/admin/Buyers";
import AdminTickets from "@/pages/admin/Tickets";
import AdminCases from "@/pages/admin/Cases";
import AdminWithdrawals from "@/pages/admin/Withdrawals";
import AdminPaymentSettings from "@/pages/admin/PaymentSettings";
import Cases from "@/pages/Cases";
import CaseDetails from "@/pages/CaseDetails";
import CreateTicket from "@/pages/seller/CreateTicket";
import MyTickets from "@/pages/seller/MyTickets";
import EditTicket from "@/pages/seller/EditTicket";
import SellerTransactions from "@/pages/seller/Transactions";
import UserWallet from "@/pages/user/Wallet";
import AdminWeeklyRewards from "@/pages/admin/WeeklyRewards";

const queryClient = new QueryClient();

function ApplicationWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/sellers" element={<Sellers />} />
              <Route path="/sellers/:sellerId" element={<SellerProfile />} />
              <Route path="/tickets" element={<Tickets />} />
              <Route path="/tickets/:ticketId" element={<TicketDetails />} />
              
              {/* User Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/wallet" element={<UserWallet />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/:caseId" element={<CaseDetails />} />

              {/* Seller Routes */}
              <Route path="/seller/tickets/create" element={<CreateTicket />} />
              <Route path="/seller/tickets/me" element={<MyTickets />} />
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
