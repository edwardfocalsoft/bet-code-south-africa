
import React, { useState } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
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

interface CreditBalanceCardProps {
  creditBalance: number;
  isLoading: boolean;
  onTopUp: (amount: number) => Promise<boolean>;
}

const CreditBalanceCard: React.FC<CreditBalanceCardProps> = ({
  creditBalance,
  isLoading,
  onTopUp,
}) => {
  const [topUpAmount, setTopUpAmount] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const handleTopUp = async () => {
    setProcessing(true);
    const amount = parseFloat(topUpAmount);
    if (!isNaN(amount) && amount > 0) {
      await onTopUp(amount);
      setTopUpAmount("");
    }
    setProcessing(false);
  };

  return (
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
            onClick={handleTopUp} 
            disabled={isLoading || processing || !topUpAmount || parseFloat(topUpAmount) <= 0}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              "Add Credits"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CreditBalanceCard;
