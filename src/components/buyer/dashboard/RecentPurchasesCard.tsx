
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type RecentPurchase = {
  id: string;
  ticketId: string;
  title: string;
  purchaseDate: string;
  status: "win" | "loss" | "pending";
};

const RecentPurchasesCard: React.FC = () => {
  const { currentUser } = useAuth();
  const [recentPurchases, setRecentPurchases] = useState<RecentPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentPurchases = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('purchases')
          .select(`
            id,
            purchase_date,
            is_winner,
            ticket_id,
            tickets:ticket_id (title)
          `)
          .eq('buyer_id', currentUser.id)
          .order('purchase_date', { ascending: false })
          .limit(3);

        if (error) {
          console.error("Error fetching recent purchases:", error);
          return;
        }

        if (data) {
          const purchaseData: RecentPurchase[] = data.map(item => ({
            id: item.id,
            ticketId: item.ticket_id,
            title: item.tickets?.title || "Unknown Ticket",
            purchaseDate: item.purchase_date,
            status: item.is_winner === null ? "pending" : item.is_winner ? "win" : "loss"
          }));
          
          setRecentPurchases(purchaseData);
        }
      } catch (error) {
        console.error("Exception fetching recent purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPurchases();
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "win":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "loss":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

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
        ) : recentPurchases.length > 0 ? (
          <div className="space-y-4">
            {recentPurchases.map(purchase => (
              <div key={purchase.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[200px]">{purchase.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(purchase.purchaseDate), "PPP")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={getStatusColor(purchase.status)}
                  >
                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="sm" asChild className="px-2">
                    <Link to={`/tickets/${purchase.ticketId}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex justify-center mt-4">
              <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
                <Link to="/buyer/purchases">View All Purchases</Link>
              </Button>
            </div>
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
