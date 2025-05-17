
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";

const AuthButtons: React.FC = () => {
  const { creditBalance } = useWallet();
  
  const hasCredits = creditBalance !== null && creditBalance > 0;

  return (
    <div className="flex items-center gap-3">
      {hasCredits && (
        <div className="px-3 py-1 bg-betting-dark-gray text-betting-green rounded-md flex items-center">
          <span className="text-sm font-medium">R {creditBalance.toFixed(2)}</span>
        </div>
      )}
      <Button variant="outline" asChild>
        <Link to="/auth/login">Login</Link>
      </Button>
      <Button asChild className="bg-betting-green hover:bg-betting-green-dark">
        <Link to="/auth/register">Register</Link>
      </Button>
    </div>
  );
};

export default AuthButtons;
