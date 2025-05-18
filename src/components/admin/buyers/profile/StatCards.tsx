
import React from "react";
import { CreditCard, ShoppingBag } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Purchase } from "@/types";

interface StatCardsProps {
  creditBalance: number;
  loyaltyPoints: number;
  purchases: Purchase[];
  formatCurrency: (amount: number) => string;
}

export const StatCards: React.FC<StatCardsProps> = ({
  creditBalance,
  loyaltyPoints,
  purchases,
  formatCurrency,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{formatCurrency(creditBalance || 0)}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loyaltyPoints || 0} points</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{purchases.length} tickets</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
