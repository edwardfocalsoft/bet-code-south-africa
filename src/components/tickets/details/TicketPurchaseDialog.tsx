
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

interface TicketPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  processingPurchase: boolean;
  paymentMethod: 'credit';
  setPaymentMethod: (method: 'credit') => void;
  canAffordWithCredit: boolean;
  creditBalance: number;
  onConfirm: () => void;
  error?: string | null;
}

const TicketPurchaseDialog: React.FC<TicketPurchaseDialogProps> = ({
  open,
  onOpenChange,
  ticket,
  processingPurchase,
  canAffordWithCredit,
  creditBalance,
  onConfirm,
  error
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  
  const handleConfirm = () => {
    setLocalError(null);
    console.log("TicketPurchaseDialog - Confirming purchase with credits");
    // Call onConfirm directly, the parent component will handle the payment flow
    onConfirm();
  };
  
  return (
    <Dialog open={open} onOpenChange={processingPurchase && !error && !localError ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            You are about to purchase the following ticket:
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="font-medium">{ticket?.title}</h3>
          <p className="text-sm text-muted-foreground">Seller: {ticket?.profiles?.username || "Unknown Seller"}</p>
          <p className="text-lg font-bold mt-4">
            Price: R {Number(ticket?.price || 0).toFixed(2)}
          </p>
          
          {/* Credit balance information */}
          <div className="mt-6 border-t border-betting-light-gray pt-4">
            <div className="flex items-center justify-between">
              <span>Your credit balance:</span>
              <span className={`${canAffordWithCredit ? 'text-green-500' : 'text-red-500'} font-medium`}>
                R {creditBalance.toFixed(2)}
              </span>
            </div>
            
            {!canAffordWithCredit && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have enough credits to purchase this ticket.
                  Please top up your wallet before making this purchase.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Display errors */}
          {(error || localError) && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setLocalError(null);
              onOpenChange(false);
            }}
            disabled={processingPurchase && !error && !localError}
          >
            Cancel
          </Button>
          <Button
            className="bg-betting-green hover:bg-betting-green-dark"
            onClick={handleConfirm}
            disabled={processingPurchase && !error && !localError || !canAffordWithCredit}
          >
            {processingPurchase && !error && !localError ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Purchase"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPurchaseDialog;
