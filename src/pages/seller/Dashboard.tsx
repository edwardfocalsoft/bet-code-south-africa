
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Ticket, CreditCard, Award, AlertCircle } from "lucide-react";

const SellerDashboard: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Link to="/seller/tickets/create">
            <Button className="bg-betting-green hover:bg-betting-green-dark flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New Ticket
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">R 5,230</p>
                  <p className="text-xs text-green-500">+12% from last month</p>
                </div>
                <Ticket className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tickets Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">42</p>
                  <p className="text-xs text-green-500">+5 this week</p>
                </div>
                <CreditCard className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">68%</p>
                  <p className="text-xs text-green-500">+3% from last month</p>
                </div>
                <Award className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">R 1,250</p>
                  <p className="text-xs">Ready to withdraw</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/seller/withdrawals">Withdraw</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Account Status Alert */}
        <Card className="betting-card mb-8 border-yellow-500/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="bg-yellow-500/20 p-2 rounded-full h-fit">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Complete Your Profile</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add your bank details to receive payments from your ticket sales.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/seller/profile">Complete Profile</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Sales Section */}
        <Card className="betting-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sales</CardTitle>
              <Link to="/seller/tickets" className="text-betting-green hover:underline text-sm">
                View all tickets
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Seller dashboard functionality will be implemented in the next phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SellerDashboard;
