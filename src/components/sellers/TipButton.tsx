
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import TipDialog from "./TipDialog";
import { useTipping } from "@/hooks/useTipping";
import { useWallet } from "@/hooks/useWallet";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface TipButtonProps {
  sellerId: string;
  sellerName: string;
  variant?: "default" | "outline" | "link" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const TipButton: React.FC<TipButtonProps> = ({
  sellerId,
  sellerName,
  variant = "outline",
  size = "sm",
  className = "",
}) => {
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const { sendTip } = useTipping();
  const { creditBalance } = useWallet();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleOpenTipDialog = () => {
    if (!currentUser) {
      toast.error("Please log in to tip sellers", {
        description: "You need to be logged in to send tips."
      });
      navigate("/auth/login");
      return;
    }
    
    if (currentUser.id === sellerId) {
      toast.error("You cannot tip yourself");
      return;
    }
    
    setTipDialogOpen(true);
  };
  
  const handleConfirmTip = async (amount: number) => {
    await sendTip(sellerId, amount, sellerName);
  };
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenTipDialog}
        className={`flex items-center gap-1 ${className}`}
      >
        <Gift className="h-4 w-4" />
        <span>Tip Seller</span>
      </Button>
      
      <TipDialog
        open={tipDialogOpen}
        onOpenChange={setTipDialogOpen}
        sellerName={sellerName}
        onConfirm={handleConfirmTip}
        userBalance={creditBalance}
      />
    </>
  );
};

export default TipButton;
