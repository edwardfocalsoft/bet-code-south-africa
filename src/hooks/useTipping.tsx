
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useTipping = () => {
  const { currentUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const sendTip = async (sellerId: string, amount: number, sellerName: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to send a tip");
      return;
    }
    
    if (currentUser.id === sellerId) {
      toast.error("You cannot tip yourself");
      return;
    }
    
    if (amount <= 0) {
      toast.error("Tip amount must be greater than zero");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Get current user's balance
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('id', currentUser.id)
        .single();
      
      if (userError) throw userError;
      
      const currentBalance = Number(userData?.credit_balance || 0);
      
      if (currentBalance < amount) {
        throw new Error("Insufficient balance to send this tip");
      }
      
      // Use RPC to process the tip
      const { data, error } = await supabase.rpc(
        'process_tip',
        { 
          p_sender_id: currentUser.id,
          p_receiver_id: sellerId,
          p_amount: amount
        }
      );
      
      if (error) throw error;
      
      // Create notification for the seller
      await supabase.from('notifications').insert({
        user_id: sellerId,
        title: "You received a tip!",
        message: `${currentUser.username || "A user"} sent you a R${amount.toFixed(2)} tip!`,
        type: "tip",
        related_id: currentUser.id
      });
      
      toast.success(`Tip of R${amount.toFixed(2)} sent to ${sellerName}`, {
        description: "Your tip has been successfully processed."
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending tip:', error);
      toast.error(error.message || "Failed to send tip");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { sendTip, isProcessing };
};

export default useTipping;
