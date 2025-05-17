
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentPurchasesCardProps {
  loading: boolean;
  hasPurchases: boolean;
}

const RecentPurchasesCard: React.FC<RecentPurchasesCardProps> = ({ loading, hasPurchases }) => {
  return (
    <Card className="betting-card lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Purchases</CardTitle>
          <Link to="/buyer/purchases" className="text-betting-green hover:underline text-sm">
            View all
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
        ) : hasPurchases ? (
          <div className="text-center py-6">
            <Link to="/buyer/purchases">
              <Button className="bg-betting-green hover:bg-betting-green-dark">
                View Purchase History
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet</p>
            <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
              <Link to="/tickets">Browse Tickets</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPurchasesCard;
