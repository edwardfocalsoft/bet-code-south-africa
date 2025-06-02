
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Wallet, Loader2, AlertCircle } from "lucide-react";

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Ticket</DialogTitle>
          <DialogDescription>
            Choose your payment method to purchase this ticket for {formatCurrency(ticket.price)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value="credit" 
                id="credit" 
                disabled={!canAffordWithCredit}
              />
              <Label 
                htmlFor="credit" 
                className={`flex items-center gap-2 ${!canAffordWithCredit ? 'opacity-50' : ''}`}
              >
                <Wallet className="w-4 h-4" />
                Credit Balance ({formatCurrency(creditBalance)})
                {!canAffordWithCredit && (
                  <span className="text-red-500 text-sm">(Insufficient funds)</span>
                )}
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="payfast" id="payfast" />
              <Label htmlFor="payfast" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                PayFast (Card/EFT)
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "credit" && canAffordWithCredit && (
            <Alert>
              <AlertDescription>
                {formatCurrency(ticket.price)} will be deducted from your credit balance.
                Remaining balance: {formatCurrency(creditBalance - ticket.price)}
              </AlertDescription>
            </Alert>
          )}

          {paymentMethod === "payfast" && (
            <Alert>
              <AlertDescription>
                You will be redirected to PayFast to complete your payment securely.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={processingPurchase}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={processingPurchase || (paymentMethod === "credit" && !canAffordWithCredit)}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPurchaseDialog;
