
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if user is not admin
    if (currentUser && currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="betting-card p-6">
            <h3 className="font-medium text-lg mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-betting-green">250</p>
          </div>
          
          <div className="betting-card p-6">
            <h3 className="font-medium text-lg mb-2">Pending Approvals</h3>
            <p className="text-3xl font-bold text-betting-accent">5</p>
          </div>
          
          <div className="betting-card p-6">
            <h3 className="font-medium text-lg mb-2">Active Tickets</h3>
            <p className="text-3xl font-bold text-betting-green">128</p>
          </div>
          
          <div className="betting-card p-6">
            <h3 className="font-medium text-lg mb-2">Withdrawals</h3>
            <p className="text-3xl font-bold text-betting-accent">R 15,250</p>
          </div>
        </div>
        
        <div className="betting-card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">Admin dashboard will be implemented in the next phase.</p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
