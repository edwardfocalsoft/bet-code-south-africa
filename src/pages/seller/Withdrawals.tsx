
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { useWallet } from "@/hooks/useWallet";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { AlertCircle, Loader2, Wallet, CreditCard, Info } from "lucide-react";
import { formatCurrency } from "@/utils/formatting";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TransactionHistoryCard from "@/components/wallet/TransactionHistoryCard";
import { supabase } from "@/integrations/supabase/client";

const SellerWithdrawals: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    creditBalance, 
    transactions, 
    currentTransactions, 
    isLoading: walletLoading, 
    currentPage, 
    totalPages, 
    setCurrentPage 
  } = useWallet();
  const { settings, isLoading: settingsLoading } = useSystemSettings();
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const WITHDRAWAL_FEE_PERCENTAGE = 10;

  // Use system settings for minimum withdrawal amount
  const minWithdrawalAmount = settings?.min_withdrawal_amount || 100;

  const handleWithdrawRequest = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to request a withdrawal");
      return;
    }

    setProcessing(true);
    try {
      // Validate amount
      const withdrawAmount = parseFloat(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      if (withdrawAmount < minWithdrawalAmount) {
        toast.error(`Minimum withdrawal amount is ${formatCurrency(minWithdrawalAmount)}`);
        return;
      }

      if (withdrawAmount > (creditBalance || 0)) {
        toast.error("Insufficient balance for this withdrawal");
        return;
      }

      // Calculate net amount after fee
      const feeAmount = calculateFee(withdrawAmount);
      const netAmount = calculateNetAmount(withdrawAmount);

      // Create withdrawal record in database
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          seller_id: currentUser.id,
          amount: netAmount, // Store the net amount they'll receive
          status: 'pending'
        });

      if (withdrawalError) {
        console.error("Error creating withdrawal record:", withdrawalError);
        toast.error("Failed to create withdrawal request");
        return;
      }

      // Deduct the full withdrawal amount from seller's balance
      const { error: balanceError } = await supabase.rpc('add_credits', {
        user_id: currentUser.id,
        amount_to_add: -withdrawAmount // Negative amount to deduct
      });

      if (balanceError) {
        console.error("Error updating balance:", balanceError);
        toast.error("Failed to process withdrawal");
        return;
      }

      // Create wallet transaction record
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: currentUser.id,
          amount: -withdrawAmount, // Negative for withdrawal
          type: 'withdrawal',
          description: `Withdrawal request - Fee: ${formatCurrency(feeAmount)}, Net: ${formatCurrency(netAmount)}`
        });

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        // Don't fail the whole process for transaction logging
      }

      toast.success("Withdrawal request submitted successfully!", {
        description: `You will receive ${formatCurrency(netAmount)} after processing`,
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

  const calculateFee = (amount: number) => {
    return (amount * WITHDRAWAL_FEE_PERCENTAGE) / 100;
  };

  const calculateNetAmount = (amount: number) => {
    return amount - calculateFee(amount);
  };

  const isEligible = (creditBalance || 0) >= minWithdrawalAmount;
  const inputAmount = parseFloat(amount) || 0;
  const feeAmount = calculateFee(inputAmount);
  const netAmount = calculateNetAmount(inputAmount);

  // Show loading state while either wallet or settings are loading
  if (settingsLoading || walletLoading) {
    return (
      <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
        <div className="container mx-auto py-8">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true} allowedRoles={["seller", "admin"]}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Withdrawals</h1>
        
        <Alert className="mb-6 border-betting-green/20 bg-betting-green/10">
          <Info className="h-4 w-4 text-betting-green" />
          <AlertDescription>
            A {WITHDRAWAL_FEE_PERCENTAGE}% fee is charged on all withdrawals. The fee covers transaction costs and platform maintenance.
          </AlertDescription>
        </Alert>
        
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
                  You need at least {formatCurrency(minWithdrawalAmount)} to request a withdrawal
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
                  <p>You need at least {formatCurrency(minWithdrawalAmount)} to request a withdrawal.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="amount">Withdrawal Amount (min {formatCurrency(minWithdrawalAmount)})</Label>
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
                        disabled={processing || !amount || parseFloat(amount) < minWithdrawalAmount || parseFloat(amount) > (creditBalance || 0)}
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
                  
                  {inputAmount > 0 && (
                    <div className="p-4 border border-betting-light-gray/10 rounded-md bg-betting-light-gray/5">
                      <h4 className="font-medium mb-2">Withdrawal Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Withdrawal Amount:</span>
                          <span>{formatCurrency(inputAmount)}</span>
                        </div>
                        <div className="flex justify-between text-yellow-500">
                          <span>Platform Fee ({WITHDRAWAL_FEE_PERCENTAGE}%):</span>
                          <span>-{formatCurrency(feeAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t border-betting-light-gray/10 mt-1">
                          <span>You'll Receive:</span>
                          <span>{formatCurrency(netAmount)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      <li className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5" />
                        <span>A {WITHDRAWAL_FEE_PERCENTAGE}% fee is charged on all withdrawals.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-2xl font-bold mt-8 mb-4">Transaction History</h2>
        <TransactionHistoryCard 
          transactions={transactions}
          currentTransactions={currentTransactions}
          isLoading={walletLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </Layout>
  );
};

export default SellerWithdrawals;
