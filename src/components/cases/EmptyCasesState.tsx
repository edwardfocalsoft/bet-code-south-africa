
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyCasesState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <p className="text-lg font-medium mb-2">No cases found</p>
      <p className="text-muted-foreground mb-6">You haven't reported any issues yet</p>
      <Link to="/buyer/purchases">
        <Button className="bg-betting-green hover:bg-betting-green-dark">
          View My Purchases
        </Button>
      </Link>
    </div>
  );
};

export default EmptyCasesState;
