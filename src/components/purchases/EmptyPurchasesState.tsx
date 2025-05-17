
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const EmptyPurchasesState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet</p>
      <Button className="bg-betting-green hover:bg-betting-green-dark" asChild>
        <Link to="/tickets">Browse Tickets</Link>
      </Button>
    </div>
  );
};
