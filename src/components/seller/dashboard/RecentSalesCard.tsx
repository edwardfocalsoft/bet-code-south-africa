
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentSalesCardProps {
  loading: boolean;
  ticketsSold: number;
}

const RecentSalesCard: React.FC<RecentSalesCardProps> = ({ loading, ticketsSold }) => {
  return (
    <Card className="betting-card lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Sales</CardTitle>
          <Link to="/seller/tickets" className="text-betting-green hover:underline text-sm">
            View all tickets
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : ticketsSold === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't sold any tickets yet</p>
            <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
              <Link to="/seller/tickets/create">Create Your First Ticket</Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Link to="/seller/tickets">
              <Button className="bg-betting-green hover:bg-betting-green-dark">
                View Sales History
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSalesCard;
