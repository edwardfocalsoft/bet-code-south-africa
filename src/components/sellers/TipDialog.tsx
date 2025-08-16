
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface TipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  sellerName: string;
}

const TipDialog: React.FC<TipDialogProps> = ({
  isOpen,
  onClose,
  sellerId,
  sellerName,
}) => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please log in to send a tip");
      return;
    }

    const tipAmount = parseFloat(amount);
    if (isNaN(tipAmount) || tipAmount <= 0) {
      toast.error("Please enter a valid tip amount");
      return;
    }

    setLoading(true);
    
    try {
      // Check if user has sufficient credit balance
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', currentUser.id)
        .single();

      if (profileError) throw profileError;

      if (!userProfile || userProfile.credit_balance < tipAmount) {
        toast.error("Insufficient credit balance to send this tip");
        setLoading(false);
        return;
      }

      // Create the tip transaction
      const { error: tipError } = await supabase
        .from('tips')
        .insert({
          tipper_id: currentUser.id,
          seller_id: sellerId,
          amount: tipAmount,
          message: message.trim() || null,
        });

      if (tipError) throw tipError;

      // Update tipper's balance (deduct tip amount)
      const { error: tipperUpdateError } = await supabase
        .from('profiles')
        .update({ 
          credit_balance: userProfile.credit_balance - tipAmount 
        })
        .eq('id', currentUser.id);

      if (tipperUpdateError) throw tipperUpdateError;

      // Update seller's balance (add tip amount)
      const { error: sellerUpdateError } = await supabase
        .rpc('increment_credit_balance', {
          user_id: sellerId,
          amount: tipAmount
        });

      if (sellerUpdateError) throw sellerUpdateError;

      toast.success(`Tip sent successfully to ${sellerName}!`);
      setAmount("");
      setMessage("");
      onClose();
    } catch (error: any) {
      console.error("Error sending tip:", error);
      toast.error(`Failed to send tip: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Tip {sellerName}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for {sellerName}'s excellent tipster service by sending a tip.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Tip Amount (R)</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter tip amount"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personal message..."
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-betting-green hover:bg-betting-green-dark"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Send Tip
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TipDialog;
