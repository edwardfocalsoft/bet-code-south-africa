
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet, Loader2, AlertCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface TicketPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
  processingPurchase: boolean;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  canAffordWithCredit: boolean;
  creditBalance: number;
  onConfirm: () => Promise<void>;
  error: string;
}

const TicketPurchaseDialog: React.FC<TicketPurchaseDialogProps> = ({
  isOpen,
  onClose,
  ticket,
  processingPurchase,
  paymentMethod,
  setPaymentMethod,
  canAffordWithCredit,
  creditBalance,
  onConfirm,
  error
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const handleTopUpRedirect = () => {
    onClose();
    navigate('/user/wallet');
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Ticket</DialogTitle>
          <DialogDescription>
            Purchase this ticket for {formatCurrency(ticket.price)} using your credit balance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Credit Balance Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-betting-green" />
              <span className="font-medium">Your Credit Balance</span>
            </div>
            <div className="text-2xl font-bold text-betting-green">
              {formatCurrency(creditBalance)}
            </div>
          </div>

          {/* Purchase Info */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Ticket Price:</span>
              <span className="font-medium">{formatCurrency(ticket.price)}</span>
            </div>
            {canAffordWithCredit && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Remaining Balance:</span>
                <span>{formatCurrency(creditBalance - ticket.price)}</span>
              </div>
            )}
          </div>

          {/* Insufficient Funds Alert */}
          {!canAffordWithCredit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient credit balance. You need {formatCurrency(ticket.price - creditBalance)} more to purchase this ticket.
              </AlertDescription>
            </Alert>
          )}

          {/* Success message for sufficient funds */}
          {canAffordWithCredit && (
            <Alert>
              <AlertDescription>
                {formatCurrency(ticket.price)} will be deducted from your credit balance.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={processingPurchase}>
            Cancel
          </Button>
          
          {canAffordWithCredit ? (
            <Button 
              onClick={onConfirm}
              disabled={processingPurchase}
              className="bg-betting-green hover:bg-betting-green-dark"
            >
              {processingPurchase ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase for ${formatCurrency(ticket.price)}`
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleTopUpRedirect}
              className="bg-betting-green hover:bg-betting-green-dark"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Top Up Wallet
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPurchaseDialog;
