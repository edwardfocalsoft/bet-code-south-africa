
import React, { useState } from "react";
import { CreditCard, ShoppingBag, Gift, Loader2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Purchase } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StatCardsProps {
  creditBalance: number;
  bonusCredits?: number;
  loyaltyPoints: number;
  purchases: Purchase[];
  formatCurrency: (amount: number) => string;
  buyerId?: string;
  onRefresh?: () => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  creditBalance,
  bonusCredits = 0,
  loyaltyPoints,
  purchases,
  formatCurrency,
  buyerId,
  onRefresh,
}) => {
  const [showAddBonus, setShowAddBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAddBonus = async () => {
    if (!buyerId) return;
    const amount = parseFloat(bonusAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.rpc("add_bonus_credits" as any, {
        p_user_id: buyerId,
        p_amount: amount,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      toast.success(`Added R${amount.toFixed(2)} bonus credits`);
      setBonusAmount("");
      setShowAddBonus(false);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to add bonus credits");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{formatCurrency(creditBalance || 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              Bonus Credits
              {buyerId && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddBonus(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Gift className="mr-2 h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{formatCurrency(bonusCredits || 0)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Non-withdrawable</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyaltyPoints || 0} points</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{purchases.length} tickets</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddBonus} onOpenChange={setShowAddBonus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bonus Credits</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            These credits can only be used for ticket purchases and Oracle searches. They cannot be withdrawn.
          </p>
          <Input
            type="number"
            placeholder="Amount (e.g. 50)"
            value={bonusAmount}
            onChange={(e) => setBonusAmount(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBonus(false)}>Cancel</Button>
            <Button onClick={handleAddBonus} disabled={adding}>
              {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Bonus Credits"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
