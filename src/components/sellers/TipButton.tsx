
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import TipDialog from "./TipDialog";

interface TipButtonProps {
  sellerId: string;
  sellerName: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}

const TipButton: React.FC<TipButtonProps> = ({
  sellerId,
  sellerName,
  variant = "default",
  size = "default",
  className = ""
}) => {
  const { currentUser } = useAuth();
  const [showTipDialog, setShowTipDialog] = useState(false);

  const handleTipClick = () => {
    if (!currentUser) {
      // Could redirect to login or show a message
      return;
    }
    setShowTipDialog(true);
  };

  return (
    <>
      <Button
        onClick={handleTipClick}
        variant={variant}
        size={size}
        disabled={!currentUser}
        className={`flex items-center gap-2 ${className}`}
      >
        <Heart className="h-4 w-4" />
        Tip Tipster
      </Button>

      <TipDialog
        isOpen={showTipDialog}
        onClose={() => setShowTipDialog(false)}
        sellerId={sellerId}
        sellerName={sellerName}
      />
    </>
  );
};

export default TipButton;
