
// Assuming this component exists in the given path, we'll update it
// to use our new refund functionality
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCaseRefund } from "@/hooks/cases/operations/useCaseRefund";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  purchaseId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  onRefundComplete: () => void;
}

const RefundDialog: React.FC<RefundDialogProps> = ({
  open,
  onOpenChange,
  caseId,
  purchaseId,
  buyerId,
  sellerId,
  amount,
  onRefundComplete
}) => {
  const { processRefund, isProcessing } = useCaseRefund();

  const handleRefund = async () => {
    const success = await processRefund(caseId, purchaseId, buyerId, sellerId, amount);
    if (success) {
      onOpenChange(false);
      onRefundComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            This will refund R{amount.toFixed(2)} to the buyer and deduct the same amount from the seller's balance.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to process this refund? This action cannot be undone.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRefund}
            className="bg-red-600 hover:bg-red-700"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Refund"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundDialog;
