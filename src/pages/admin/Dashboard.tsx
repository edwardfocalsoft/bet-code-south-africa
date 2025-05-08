import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, Ticket, BadgeDollarSign, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeTickets: number;
  totalWithdrawals: number;
}

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if user is not admin
    if (currentUser && currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Fetch total users
        const { count: totalUsers, error: usersError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });
          
        if (usersError) throw usersError;
        
        // Fetch pending seller approvals
        const { count: pendingApprovals, error: approvalsError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role", "seller")
          .eq("approved", false)
          .eq("suspended", false);
          
        if (approvalsError) throw approvalsError;
        
        // Fetch active tickets
        const { count: activeTickets, error: ticketsError } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("is_expired", false)
          .eq("is_hidden", false);
          
        if (ticketsError) throw ticketsError;
        
        // Fetch total withdrawal amount
        const { data: withdrawalsData, error: withdrawalsError } = await supabase
          .from("withdrawals")
          .select("amount")
          .eq("status", "pending");
          
        if (withdrawalsError) throw withdrawalsError;
        
        const totalWithdrawals = withdrawalsData.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
        
        setStats({
          totalUsers: totalUsers || 0,
          pendingApprovals: pendingApprovals || 0,
          activeTickets: activeTickets || 0,
          totalWithdrawals: totalWithdrawals || 0
        });
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchDashboardStats();
    }
  }, [currentUser]);

  if (currentUser?.role !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to view this page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="betting-card p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Total Users</h3>
              <Users className="h-5 w-5 text-betting-green" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-betting-green">{stats?.totalUsers || 0}</p>
            )}
          </div>
          
          <div className="betting-card p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Pending Approvals</h3>
              <UserCheck className="h-5 w-5 text-betting-accent" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <Link to="/admin/sellers" className="text-3xl font-bold text-betting-accent hover:underline">
                {stats?.pendingApprovals || 0}
              </Link>
            )}
          </div>
          
          <div className="betting-card p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Active Tickets</h3>
              <Ticket className="h-5 w-5 text-betting-green" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <Link to="/admin/tickets" className="text-3xl font-bold text-betting-green hover:underline">
                {stats?.activeTickets || 0}
              </Link>
            )}
          </div>
          
          <div className="betting-card p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-lg">Pending Withdrawals</h3>
              <BadgeDollarSign className="h-5 w-5 text-betting-accent" />
            </div>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <Link to="/admin/withdrawals" className="text-3xl font-bold text-betting-accent hover:underline">
                R {stats?.totalWithdrawals.toFixed(2) || "0.00"}
              </Link>
            )}
          </div>
        </div>
        
        <div className="betting-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/admin/sellers" 
              className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-center gap-2"
            >
              <UserCheck className="h-5 w-5" />
              Manage Sellers
            </Link>
            <Link 
              to="/admin/tickets" 
              className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-center gap-2"
            >
              <Ticket className="h-5 w-5" />
              Manage Tickets
            </Link>
            <Link 
              to="/admin/withdrawals" 
              className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-center gap-2"
            >
              <BadgeDollarSign className="h-5 w-5" />
              Process Withdrawals
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
