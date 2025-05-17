
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { AlertCircle, Loader2, Wallet, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { toast } from "sonner";

const SellerWithdrawals: React.FC = () => {
  const { currentUser } = useAuth();
  const { creditBalance } = useWallet();
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleWithdrawRequest = async () => {
    setProcessing(true);
    try {
      // Validate amount
      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (withdrawAmount < 1000) {
        toast.error("Minimum withdrawal amount is R1,000");
        return;
      }

      if (withdrawAmount > creditBalance) {
        toast.error("Insufficient balance for this withdrawal");
        return;
      }

      // Here we would process the withdrawal request
      toast.success("Your withdrawal request has been submitted for processing", {
        description: "You will be notified when it has been processed",
        duration: 5000
      });

      // Clear the form
      setAmount("");

    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast.error("Failed to process withdrawal request");
    } finally {
      setProcessing(false);
    }
  };

  const isEligible = (creditBalance || 0) >= 1000;

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Withdrawals</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="betting-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-betting-green" />
                Available Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {formatCurrency(creditBalance || 0)}
              </div>
              
              {!isEligible && (
                <p className="text-sm text-muted-foreground">
                  You need at least R1,000 to request a withdrawal
                </p>
              )}
              
              {isEligible && (
                <p className="text-sm text-green-500">
                  You're eligible to withdraw funds
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card className="betting-card md:col-span-2">
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Withdrawals are processed within 3-5 business days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEligible ? (
                <div className="flex items-center p-4 gap-3 bg-betting-light-gray/10 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <p>You need at least R1,000 to request a withdrawal.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="amount">Withdrawal Amount (min R1,000)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-betting-black border-betting-light-gray"
                        disabled={processing}
                      />
                      <Button 
                        onClick={handleWithdrawRequest} 
                        className="bg-betting-green hover:bg-betting-green-dark"
                        disabled={processing || !amount || parseFloat(amount) < 1000 || parseFloat(amount) > (creditBalance || 0)}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Processing
                          </>
                        ) : (
                          "Request Withdrawal"
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-betting-light-gray/20">
                    <h3 className="text-sm font-medium mb-2">Withdrawal Information</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 mt-0.5" />
                        <span>Funds will be sent to the bank account in your profile.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CreditCard className="h-4 w-4 mt-0.5" />
                        <span>Make sure your banking details are correct before requesting a withdrawal.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SellerWithdrawals;
