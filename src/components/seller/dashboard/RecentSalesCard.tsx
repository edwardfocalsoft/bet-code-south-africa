
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, User } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentSalesCardProps {
  loading: boolean;
  sales: any[];
}

const RecentSalesCard: React.FC<RecentSalesCardProps> = ({ loading, sales }) => {
  if (loading) {
    return (
      <Card className="betting-card">
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No sales yet</p>
            <p className="text-sm mt-1">Your recent ticket sales will appear here</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={sale.profiles?.avatar_url} 
                    alt={sale.profiles?.username || "User"} 
                  />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{sale.profiles?.username || "Anonymous User"}</p>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <span>{sale.tickets?.title || "Ticket"}</span>
                    <span>•</span>
                    <span>{format(new Date(sale.purchase_date), "MMM d, yyyy")}</span>
                    {sale.is_winner !== null && (
                      <>
                        <span>•</span>
                        {sale.is_winner ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Won
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Lost
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(sale.price)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSalesCard;
