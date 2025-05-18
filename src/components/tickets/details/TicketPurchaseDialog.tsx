
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TicketPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  processingPurchase: boolean;
  paymentMethod: 'credit' | 'payfast';
  setPaymentMethod: (method: 'credit' | 'payfast') => void;
  canAffordWithCredit: boolean;
  creditBalance: number;
  onConfirm: () => void;
}

const TicketPurchaseDialog: React.FC<TicketPurchaseDialogProps> = ({
  open,
  onOpenChange,
  ticket,
  processingPurchase,
  paymentMethod,
  setPaymentMethod,
  canAffordWithCredit,
  creditBalance,
  onConfirm
}) => {
  const handleConfirm = () => {
    // Call onConfirm directly, the parent component will handle the payment flow
    onConfirm();
  };
  
  return (
    <Dialog open={open} onOpenChange={processingPurchase ? undefined : onOpenChange}>
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
          
          {/* Payment method selection */}
          {!ticket?.is_free && (
            <div className="mt-6 border-t border-betting-light-gray pt-4">
              <h4 className="text-sm font-medium mb-3">Payment Method</h4>
              
              <div className="space-y-3">
                {/* Credit balance option */}
                <div 
                  className={`p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === 'credit' 
                      ? 'border-betting-green bg-betting-green/10' 
                      : 'border-betting-light-gray'
                  }`}
                  onClick={() => canAffordWithCredit && setPaymentMethod('credit')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full flex items-center justify-center border border-gray-400">
                        {paymentMethod === 'credit' && (
                          <div className="h-2 w-2 rounded-full bg-betting-green" />
                        )}
                      </div>
                      <span>Wallet Credit</span>
                    </div>
                    <span className={`text-sm ${canAffordWithCredit ? 'text-green-400' : 'text-red-400'}`}>
                      R {creditBalance.toFixed(2)} available
                    </span>
                  </div>
                  
                  {!canAffordWithCredit && (
                    <p className="text-xs text-red-400 mt-1">
                      Insufficient credit balance
                    </p>
                  )}
                </div>
                
                {/* PayFast option */}
                <div 
                  className={`p-3 border rounded-lg cursor-pointer ${
                    paymentMethod === 'payfast' 
                      ? 'border-betting-green bg-betting-green/10' 
                      : 'border-betting-light-gray'
                  }`}
                  onClick={() => setPaymentMethod('payfast')}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full flex items-center justify-center border border-gray-400">
                      {paymentMethod === 'payfast' && (
                        <div className="h-2 w-2 rounded-full bg-betting-green" />
                      )}
                    </div>
                    <span>PayFast</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={processingPurchase}
          >
            Cancel
          </Button>
          <Button
            className="bg-betting-green hover:bg-betting-green-dark"
            onClick={handleConfirm}
            disabled={processingPurchase || (!canAffordWithCredit && paymentMethod === 'credit')}
          >
            {processingPurchase ? (
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
