import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Coins } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";

interface LoyaltyPointsCardProps {
  loyaltyPoints: number;
  onPointsClaimed?: () => void;
}

const LoyaltyPointsCard = ({ loyaltyPoints, onPointsClaimed }: LoyaltyPointsCardProps) => {
  const { currentUser } = useAuth();
  const [isClaiming, setIsClaiming] = useState(false);
  
  const cashValue = (loyaltyPoints * 0.20).toFixed(2);
  const canClaim = loyaltyPoints >= 2500;
  
  const handleClaimPoints = async () => {
    if (!currentUser || !canClaim) return;
    
    setIsClaiming(true);
    try {
      const { error } = await supabase.rpc('claim_bc_points', {
        p_user_id: currentUser.id,
        p_points_to_claim: loyaltyPoints
      });
      
      if (error) throw error;
      
      toast.success("BC Points claimed successfully!", {
        description: `R${cashValue} has been added to your wallet`
      });
      
      onPointsClaimed?.();
    } catch (error: any) {
      console.error("Error claiming BC points:", error);
      toast.error(error.message || "Failed to claim BC points");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">BC Points</CardTitle>
        <Gift className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold">{loyaltyPoints.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="h-3 w-3" />
            Worth R{cashValue}
          </p>
        </div>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">
            {canClaim 
              ? "You can claim your BC points now!" 
              : `Need ${(2500 - loyaltyPoints).toLocaleString()} more points to claim (min: 2500)`}
          </p>
          <Button 
            onClick={handleClaimPoints}
            disabled={!canClaim || isClaiming}
            className="w-full"
            size="sm"
          >
            {isClaiming ? "Claiming..." : "Claim as Cash"}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Earn 1 BC point per ticket purchase • 1 BC = R0.20
        </p>
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
