
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Ticket, TrendingUp, Award } from "lucide-react";

const SalesTipsCard: React.FC = () => {
  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Tips to Increase Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <div className="mt-1 bg-betting-green/20 rounded-full p-1">
              <Ticket className="h-4 w-4 text-betting-green" />
            </div>
            <span className="text-sm">Create tickets with detailed analysis to increase buyer confidence</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 bg-betting-green/20 rounded-full p-1">
              <TrendingUp className="h-4 w-4 text-betting-green" />
            </div>
            <span className="text-sm">Track your performance and focus on sports where you have the highest win rate</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 bg-betting-green/20 rounded-full p-1">
              <Award className="h-4 w-4 text-betting-green" />
            </div>
            <span className="text-sm">Maintain a high win rate to attract more subscribers and repeat customers</span>
          </li>
        </ul>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link to="/seller/profile">Complete Your Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default SalesTipsCard;
