
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Wallet, Star } from "lucide-react";

const SupportCard: React.FC = () => {
  return (
    <Card className="betting-card">
      <CardHeader>
        <CardTitle>Support</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Link to="/user/wallet" className="block">
            <Button variant="outline" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Manage Wallet
            </Button>
          </Link>
          <Link to="/user/cases" className="block">
            <Button variant="outline" className="w-full justify-start">
              <Star className="mr-2 h-4 w-4" />
              View Support Cases
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportCard;
