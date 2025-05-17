
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  AlertCircle, 
  Users, 
  Ticket, 
  BadgeDollarSign, 
  UserCheck, 
  TrendingUp, 
  ArrowUpRight 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/admin/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalUsers: number;
  pendingApprovals: number;
  activeTickets: number;
  totalWithdrawals: number;
  recentActivity: {
    type: string;
    message: string;
    timestamp: Date;
  }[];
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
        
        // Fetch active tickets - FIXED to properly count only active tickets
        // A ticket is active if:
        // 1. It is not hidden
        // 2. It is not manually marked as expired
        // 3. Its kickoff time is in the future
        const now = new Date().toISOString();
        const { count: activeTickets, error: ticketsError } = await supabase
          .from("tickets")
          .select("*", { count: "exact", head: true })
          .eq("is_hidden", false)
          .eq("is_expired", false)
          .gt("kickoff_time", now); // Only include tickets with future kickoff times
          
        if (ticketsError) throw ticketsError;
        
        // Fetch total withdrawal amount
        const { data: withdrawalsData, error: withdrawalsError } = await supabase
          .from("withdrawals")
          .select("amount")
          .eq("status", "pending");
          
        if (withdrawalsError) throw withdrawalsError;
        
        const totalWithdrawals = withdrawalsData.reduce((sum, item) => 
          sum + parseFloat(item.amount.toString()), 0);
        
        // Fetch recent activity (combining recent sellers, tickets and withdrawals)
        const recentActivity = await fetchRecentActivity();
        
        setStats({
          totalUsers: totalUsers || 0,
          pendingApprovals: pendingApprovals || 0,
          activeTickets: activeTickets || 0,
          totalWithdrawals: totalWithdrawals || 0,
          recentActivity
        });
      } catch (error: any) {
        console.error("Error fetching dashboard stats:", error);
        setError("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
      const activity = [];
      
      // Fetch recent seller registrations
      const { data: recentSellers } = await supabase
        .from("profiles")
        .select("username, email, created_at, role")
        .eq("role", "seller")
        .order("created_at", { ascending: false })
        .limit(3);
        
      if (recentSellers) {
        for (const seller of recentSellers) {
          activity.push({
            type: "seller_registered",
            message: `New seller registered: ${seller.username || seller.email}`,
            timestamp: new Date(seller.created_at)
          });
        }
      }
      
      // Fetch recent tickets
      const { data: recentTickets } = await supabase
        .from("tickets")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(3);
        
      if (recentTickets) {
        for (const ticket of recentTickets) {
          activity.push({
            type: "ticket_created",
            message: `New ticket created: ${ticket.title}`,
            timestamp: new Date(ticket.created_at)
          });
        }
      }
      
      // Fetch recent withdrawals
      const { data: recentWithdrawals } = await supabase
        .from("withdrawals")
        .select("amount, request_date, status")
        .order("request_date", { ascending: false })
        .limit(3);
        
      if (recentWithdrawals) {
        for (const withdrawal of recentWithdrawals) {
          activity.push({
            type: "withdrawal_requested",
            message: `Withdrawal requested: R${parseFloat(withdrawal.amount.toString()).toFixed(2)} (${withdrawal.status})`,
            timestamp: new Date(withdrawal.request_date)
          });
        }
      }
      
      // Sort by timestamp, most recent first
      return activity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
    };

    if (currentUser?.role === "admin") {
      fetchDashboardStats();
      
      // Set up real-time listeners for dashboard updates
      const profilesChannel = supabase
        .channel('profiles-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => fetchDashboardStats()
        )
        .subscribe();
      
      const ticketsChannel = supabase
        .channel('tickets-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tickets' },
          () => fetchDashboardStats()
        )
        .subscribe();
        
      const withdrawalsChannel = supabase
        .channel('withdrawals-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'withdrawals' },
          () => fetchDashboardStats()
        )
        .subscribe();
      
      // Clean up the subscriptions when component unmounts
      return () => {
        supabase.removeChannel(profilesChannel);
        supabase.removeChannel(ticketsChannel);
        supabase.removeChannel(withdrawalsChannel);
      };
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
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            loading={loading}
            subtitle={
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                <span className="text-green-500">Growing</span>
              </div>
            }
          />
          
          <StatCard
            title="Pending Approvals"
            value={
              <Link to="/admin/sellers" className="hover:underline text-betting-accent">
                {stats?.pendingApprovals || 0}
              </Link>
            }
            icon={UserCheck}
            loading={loading}
            subtitle={stats?.pendingApprovals ? 
              <p className="text-xs text-amber-400">Requires attention</p> : 
              <p className="text-xs text-muted-foreground">No pending approvals</p>
            }
            valueClassName="text-betting-accent"
          />
          
          <StatCard
            title="Active Tickets"
            value={
              <Link to="/admin/tickets" className="hover:underline text-betting-green">
                {stats?.activeTickets || 0}
              </Link>
            }
            icon={Ticket}
            loading={loading}
            valueClassName="text-betting-green"
          />
          
          <StatCard
            title="Pending Withdrawals"
            value={
              <Link to="/admin/withdrawals" className="hover:underline text-betting-accent">
                R {stats?.totalWithdrawals.toFixed(2) || "0.00"}
              </Link>
            }
            icon={BadgeDollarSign}
            loading={loading}
            valueClassName="text-betting-accent"
          />
        </div>
        
        <AdminDashboardLayout 
          stats={stats}
          loading={loading}
        />
      </div>
    </Layout>
  );
};

// New component for the dashboard layout
const AdminDashboardLayout: React.FC<{
  stats: DashboardStats | null;
  loading: boolean;
}> = ({ stats, loading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <QuickActionsCard />
      <RecentActivityCard stats={stats} loading={loading} />
    </div>
  );
};

// New component for the quick actions section
const QuickActionsCard: React.FC = () => {
  return (
    <Card className="betting-card lg:col-span-1">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <Link 
            to="/admin/sellers" 
            className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              <span>Manage Sellers</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link 
            to="/admin/tickets" 
            className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              <span>Manage Tickets</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link 
            to="/admin/withdrawals" 
            className="bg-betting-dark-gray hover:bg-betting-light-gray transition-colors p-4 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5" />
              <span>Process Withdrawals</span>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// New component for the recent activity section
const RecentActivityCard: React.FC<{
  stats: DashboardStats | null;
  loading: boolean;
}> = ({ stats, loading }) => {
  return (
    <Card className="betting-card lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 px-2 py-1 rounded-md transition-colors hover:bg-betting-dark-gray">
                {activity.type.includes('seller') && <UserCheck className="h-5 w-5 text-betting-accent" />}
                {activity.type.includes('ticket') && <Ticket className="h-5 w-5 text-betting-green" />}
                {activity.type.includes('withdrawal') && <BadgeDollarSign className="h-5 w-5 text-betting-accent" />}
                <div>
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">
            No recent activity to display.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
