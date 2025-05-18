
import React from 'react';
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleRefund: () => void;
  isLoading: boolean;
  purchaseData: any;
  ticketData: any;
  caseNumber: string;
}

const RefundDialog: React.FC<RefundDialogProps> = ({
  open,
  onOpenChange,
  handleRefund,
  isLoading,
  purchaseData,
  ticketData,
  caseNumber
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            This will refund the customer and deduct the amount from the
            seller's account.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="font-medium">Refund Details:</p>
          <ul className="mt-2 space-y-1">
            <li>
              <span className="text-muted-foreground">Amount: </span>
              <span className="font-medium">
                R{Number(purchaseData?.price).toFixed(2)}
              </span>
            </li>
            <li>
              <span className="text-muted-foreground">Ticket: </span>
              <span className="font-medium">{ticketData?.title}</span>
            </li>
            <li>
              <span className="text-muted-foreground">Case #: </span>
              <span className="font-medium">{caseNumber}</span>
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleRefund}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Refund"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefundDialog;
