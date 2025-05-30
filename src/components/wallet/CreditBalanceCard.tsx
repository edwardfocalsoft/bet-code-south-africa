import React, { useState } from "react";
import { TrendingUp, Loader2, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreditBalanceCardProps {
  creditBalance: number;
  isLoading: boolean;
  onTopUp: (amount: number) => Promise<boolean>;
  error?: string | null;
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  creditBalance,
  isLoading,
  onTopUp,
  error
}) => {
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  const handleTopUpClick = () => {
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      setTopUpError(null);
      setConfirmDialogOpen(true);
    } else {
      setTopUpError("Please enter a valid amount");
    }
  };

  const handleConfirmTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      setProcessing(true);
      setTopUpError(null);
      console.log("Processing top-up for amount:", amount);
      
      try {
        // This will trigger the PayFast form submission and redirect
        await onTopUp(amount);
        // Note: We won't reach code after this point due to the form submission
        // redirecting the browser, but we keep this for error cases
      } catch (error: any) {
        console.error("Top-up error:", error);
        setTopUpError(error.message || "An unexpected error occurred");
        setProcessing(false);
        setConfirmDialogOpen(false);
      }
    }
  };

  return (
    <>
      <Card className="betting-card">
        <CardHeader>
          <CardTitle>Credit Balance</CardTitle>
          <CardDescription>Your current available credits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="bg-betting-green/10 p-4 rounded-full">
              <TrendingUp className="h-8 w-8 text-betting-green" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <h3 className="text-3xl font-bold">
                R {creditBalance.toFixed(2)}
              </h3>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-sm text-muted-foreground mb-4">
            Add credits to your account to purchase tickets
          </p>
          <div className="flex items-center gap-2 w-full">
            <Input
              type="number"
              placeholder="Amount"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className="bg-betting-light-gray border-betting-light-gray"
            />
            <Button 
              onClick={handleTopUpClick} 
              disabled={isLoading || processing || !topUpAmount || parseFloat(topUpAmount) <= 0}
              className="bg-betting-green hover:bg-betting-green-dark"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Add Credits"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Credit Purchase</DialogTitle>
            <DialogDescription>
              You are about to add credits to your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You will be redirected to complete payment with PayFast.
              Credits will be added to your account once payment is successful.
            </p>
            <p className="text-lg font-bold mt-4">
              Amount: R {parseFloat(topUpAmount || "0").toFixed(2)}
            </p>

            {topUpError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{topUpError}</AlertDescription>
              </Alert>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setTopUpError(null);
              }}
              disabled={processing && !topUpError}
            >
              Cancel
            </Button>
            <Button
              className="bg-betting-green hover:bg-betting-green-dark"
              onClick={handleConfirmTopUp}
              disabled={processing && !topUpError}
            >
              {processing && !topUpError ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreditBalanceCard;
