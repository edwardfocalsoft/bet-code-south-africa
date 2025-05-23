
import React, { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, BadgeDollarSign, Save } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const WithdrawalSettingsCard: React.FC = () => {
  const { settings, isLoading, isSaving, saveSettings } = useSystemSettings();
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState<string>(
    settings.min_withdrawal_amount?.toString() || "1000"
  );

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (!isLoading && settings.min_withdrawal_amount) {
      setMinWithdrawalAmount(settings.min_withdrawal_amount.toString());
    }
  }, [settings, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(minWithdrawalAmount);
    
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    await saveSettings({
      min_withdrawal_amount: amount
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BadgeDollarSign className="h-5 w-5 text-betting-green" />
          <CardTitle>Withdrawal Settings</CardTitle>
        </div>
        <CardDescription>
          Configure minimum withdrawal amount and other withdrawal-related settings
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minWithdrawalAmount">Minimum Withdrawal Amount (ZAR)</Label>
            <Input
              id="minWithdrawalAmount"
              type="number"
              min="0"
              step="100"
              value={minWithdrawalAmount}
              onChange={(e) => setMinWithdrawalAmount(e.target.value)}
              placeholder="Min. withdrawal amount"
              className="bg-betting-black border-betting-light-gray"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Sellers must have at least this amount in their balance to request a withdrawal
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button
            type="submit"
            className="bg-betting-green hover:bg-betting-green-dark"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default WithdrawalSettingsCard;
