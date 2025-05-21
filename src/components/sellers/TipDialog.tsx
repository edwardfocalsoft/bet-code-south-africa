
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
  onConfirm: (amount: number) => Promise<void>;
  userBalance: number;
}

const TipDialog: React.FC<TipDialogProps> = ({
  open,
  onOpenChange,
  sellerName,
  onConfirm,
  userBalance,
}) => {
  const [amount, setAmount] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, "");
    // Ensure only one decimal point
    const parts = value.split(".");
    if (parts.length > 2) {
      return;
    }
    // Limit to 2 decimal places
    if (parts.length > 1 && parts[1].length > 2) {
      return;
    }
    setAmount(value);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    const tipAmount = parseFloat(amount);
    
    if (tipAmount > userBalance) {
      setError("You don't have enough balance for this tip");
      return;
    }
    
    if (tipAmount < 5) {
      setError("Minimum tip amount is R5");
      return;
    }
    
    try {
      setProcessing(true);
      await onConfirm(tipAmount);
      setAmount("");
      onOpenChange(false);
    } catch (error: any) {
      setError(error.message || "Failed to process tip");
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setAmount("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-betting-black border-betting-light-gray">
        <DialogHeader>
          <DialogTitle>Tip {sellerName}</DialogTitle>
          <DialogDescription>
            Show your appreciation by sending a tip to {sellerName}. Tips are deducted from your credit balance.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                R
              </span>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="pl-8 bg-betting-dark-gray"
                placeholder="0.00"
                disabled={processing}
              />
            </div>
          </div>
          <div className="col-span-3 text-sm text-muted-foreground text-right">
            Your balance: R{userBalance.toFixed(2)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={processing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > userBalance}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Send Tip"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TipDialog;
