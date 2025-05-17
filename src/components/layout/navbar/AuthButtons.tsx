
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";

const AuthButtons: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  
  // Only show credit balance if user is logged in
  const hasCredits = currentUser && creditBalance !== null && creditBalance > 0;

  return (
    <div className="flex items-center gap-3">
      {currentUser && (
        <>
          {creditBalance !== null ? (
            <div className="px-3 py-1 bg-betting-dark-gray text-betting-green rounded-md flex items-center">
              <span className="text-sm font-medium">R {creditBalance.toFixed(2)}</span>
            </div>
          ) : (
            <Skeleton className="w-20 h-8" />
          )}
        </>
      )}
      
      {!currentUser ? (
        <>
          <Button variant="outline" asChild>
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild className="bg-betting-green hover:bg-betting-green-dark">
            <Link to="/auth/register">Register</Link>
          </Button>
        </>
      ) : (
        <Link to="/user/wallet">
          <Button variant="outline" size="sm">
            Wallet
          </Button>
        </Link>
      )}
    </div>
  );
};

export default AuthButtons;
