
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Ticket, Star, Trophy, Gift } from "lucide-react";

const BuyerDashboard: React.FC = () => {
  return (
    <Layout requireAuth={true} allowedRoles={["buyer", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Buyer Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Tickets Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">12</p>
                  <p className="text-xs">Last purchase 2 days ago</p>
                </div>
                <Ticket className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Winning Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-xs text-green-500">66% win rate</p>
                </div>
                <Trophy className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Pending Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">3</p>
                  <p className="text-xs">Rate seller performance</p>
                </div>
                <Star className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="betting-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Loyalty Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">250</p>
                  <p className="text-xs">Earn rewards with purchases</p>
                </div>
                <Gift className="h-8 w-8 text-betting-green opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Purchases Section */}
        <Card className="betting-card mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Purchases</CardTitle>
              <Link to="/buyer/purchases" className="text-betting-green hover:underline text-sm">
                View all purchases
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center py-8 text-muted-foreground">
              Buyer dashboard functionality will be implemented in the next phase.
            </p>
          </CardContent>
        </Card>
        
        {/* Recommended Tickets Section */}
        <Card className="betting-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recommended Tickets</CardTitle>
              <Link to="/tickets" className="text-betting-green hover:underline text-sm">
                Browse all tickets
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                <Link to="/tickets">Browse Tickets</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;
