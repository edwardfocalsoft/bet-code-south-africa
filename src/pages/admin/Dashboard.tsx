
import React from "react";
import Layout from "@/components/layout/Layout";
import StatCard from "@/components/admin/StatCard";
import NotifyAllUsersDialog from "@/components/admin/NotifyAllUsersDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Ticket, DollarSign, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";

const AdminDashboard: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <NotifyAllUsersDialog />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="1,234"
            icon={Users}
          />
          <StatCard
            title="Total Tickets"
            value="567"
            icon={Ticket}
          />
          <StatCard
            title="Revenue"
            value="R89,456"
            icon={DollarSign}
          />
          <StatCard
            title="Growth"
            value="23.4%"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="betting-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Pending Actions
              </CardTitle>
              <CardDescription>
                Items that require your attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Pending Seller Approvals</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-medium">5</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/sellers">
                      Review
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Open Support Cases</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-medium">12</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/cases">
                      Review
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Withdrawal Requests</span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-medium">3</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/withdrawals">
                      Review
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="betting-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/sellers">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Sellers
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/buyers">
                  <Users className="h-4 w-4 mr-2" />
                  View Buyers
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/tickets">
                  <Ticket className="h-4 w-4 mr-2" />
                  Monitor Tickets
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/admin/payment-settings">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
