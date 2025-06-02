
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatting";
import { CreditCard, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface TicketPurchaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: {
    id: string;
    title: string;
    price: number;
    isFree: boolean;
    sellerUsername: string;
  };
  onPurchase: () => Promise<void>;
  isPurchasing: boolean;
}

const TicketPurchaseDialog: React.FC<TicketPurchaseDialogProps> = ({
  isOpen,
  onOpenChange,
  ticket,
  onPurchase,
  isPurchasing,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      if (ticket.isFree) {
        toast.loading("Processing free ticket...");
      } else {
        toast.loading("Processing payment...");
      }
      
      await onPurchase();
      
      // The success toast is already shown in the parent component
      // but we'll ensure it's dismissed here
      toast.dismiss();
      
      if (ticket.isFree) {
        toast.success("Free ticket added to your purchases!");
      } else {
        toast.success(`Successfully purchased "${ticket.title}" for ${formatCurrency(ticket.price)}`);
      }
      
      onOpenChange(false);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Purchase failed: ${error.message || "Please try again"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {ticket.isFree ? (
              <>
                <Check className="h-5 w-5 text-green-500" />
                Get Free Ticket
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Purchase Ticket
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {ticket.isFree 
              ? "This ticket is available for free. Click confirm to add it to your purchases."
              : "Review your purchase details below and confirm to proceed with payment."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{ticket.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">
              by {ticket.sellerUsername}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm">Price:</span>
              {ticket.isFree ? (
                <Badge className="bg-green-600">FREE</Badge>
              ) : (
                <span className="font-bold text-lg">{formatCurrency(ticket.price)}</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPurchasing || isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              className="flex-1"
              disabled={isPurchasing || isProcessing}
            >
              {(isPurchasing || isProcessing) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {ticket.isFree ? "Adding..." : "Processing..."}
                </>
              ) : (
                <>
                  {ticket.isFree ? "Get Free Ticket" : `Pay ${formatCurrency(ticket.price)}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPurchaseDialog;
