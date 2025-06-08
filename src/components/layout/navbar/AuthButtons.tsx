
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth";

const AuthButtons: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  
  // Only show credit balance if user is logged in
  const hasCredits = currentUser && creditBalance !== null && creditBalance !== undefined;

  return (
    <div className="flex items-center gap-3">
      {currentUser && (
        <>
          {creditBalance !== null && creditBalance !== undefined ? (
            <div className="px-3 py-1 bg-betting-dark-gray text-betting-green rounded-md flex items-center">
              <span className="text-sm font-medium">R {creditBalance.toFixed(2)}</span>
            </div>
          ) : (
            <Skeleton className="w-20 h-8" />
          )}
          
          {/* Show verified badge for current user if they are verified */}
          {currentUser.verified && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Verified</span>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
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
