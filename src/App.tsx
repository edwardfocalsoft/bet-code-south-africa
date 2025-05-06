
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RegisterConfirmation from "./pages/auth/RegisterConfirmation";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSellers from "./pages/admin/Sellers";
import AdminTickets from "./pages/admin/Tickets";
import AdminWithdrawals from "./pages/admin/Withdrawals";

// Seller Pages
import SellerDashboard from "./pages/seller/Dashboard";
import SellerTickets from "./pages/seller/Tickets";
import SellerCreateTicket from "./pages/seller/CreateTicket";
import SellerWithdrawals from "./pages/seller/Withdrawals";
import SellerProfile from "./pages/seller/Profile";

// Buyer Pages
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerPurchases from "./pages/buyer/Purchases";
import BuyerProfile from "./pages/buyer/Profile";

// Shared Pages
import TicketDetails from "./pages/tickets/TicketDetails";
import AllTickets from "./pages/tickets/AllTickets";
import AllSellers from "./pages/sellers/AllSellers";
import SellerPublicProfile from "./pages/sellers/SellerPublicProfile";
import UserSettings from "./pages/user/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/confirmation" element={<RegisterConfirmation />} />
            <Route path="/tickets" element={<AllTickets />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/sellers" element={<AllSellers />} />
            <Route path="/sellers/:id" element={<SellerPublicProfile />} />

            {/* Buyer Routes */}
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/purchases" element={<BuyerPurchases />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />

            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/tickets" element={<SellerTickets />} />
            <Route path="/seller/tickets/create" element={<SellerCreateTicket />} />
            <Route path="/seller/withdrawals" element={<SellerWithdrawals />} />
            <Route path="/seller/profile" element={<SellerProfile />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />

            {/* Shared Authenticated Routes */}
            <Route path="/settings" element={<UserSettings />} />

            {/* Catch-all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
