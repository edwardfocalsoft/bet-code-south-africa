
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { createNotification } from "@/utils/notificationUtils";

export const useSubscriptions = () => {
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    if (currentUser?.id) {
      fetchSubscriptions();
      if (currentUser.role === "seller") {
        fetchSubscribersCount();
      }
    }
  }, [currentUser]);

  const fetchSubscriptions = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, profiles!subscriptions_seller_id_fkey(username)") // Get seller username as well
        .eq("buyer_id", currentUser.id);
        
      if (error) throw error;
      console.log("Fetched subscriptions:", data);
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribersCount = async () => {
    if (!currentUser?.id) return;
    
    try {
      const { count, error } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", currentUser.id);
        
      if (error) throw error;
      console.log("Subscriber count:", count);
      setSubscribersCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching subscribers count:", error);
      toast.error("Failed to load subscriber count");
    }
  };

  const subscribeToSeller = async (sellerId: string) => {
    if (!currentUser?.id) {
      toast.error("Please log in to subscribe to sellers");
      return false;
    }
    
    if (currentUser.id === sellerId) {
      toast.error("You cannot subscribe to yourself");
      return false;
    }
    
    try {
      setLoading(true);
      
      // Check if already subscribed
      const { data: existingSubscription, error: checkError } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("buyer_id", currentUser.id)
        .eq("seller_id", sellerId)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingSubscription) {
        toast.info("You are already subscribed to this seller");
        return true;
      }
      
      // Get the seller's username for the notification
      const { data: sellerData, error: sellerError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", sellerId)
        .single();
        
      if (sellerError) throw sellerError;
      
      const sellerUsername = sellerData?.username || 'Seller';
      
      // Create new subscription
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          buyer_id: currentUser.id,
          seller_id: sellerId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("You are now subscribed to this seller");
      
      // Notify the seller that they have a new subscriber
      try {
        await createNotification(
          sellerId,
          "New Subscriber",
          `${currentUser.username || 'A user'} has subscribed to your profile`,
          "subscription",
          currentUser.id
        );
      } catch (notifyError) {
        console.error("Failed to notify seller about new subscription:", notifyError);
        // Continue even if notification fails
      }
      
      await fetchSubscriptions();
      return true;
    } catch (error: any) {
      console.error("Error subscribing to seller:", error);
      toast.error(error.message || "Failed to subscribe to seller");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromSeller = async (subscriptionId: string) => {
    if (!currentUser?.id) return false;
    
    try {
      setLoading(true);
      
      // Get subscription details before deleting
      const { data: subscription, error: fetchError } = await supabase
        .from("subscriptions")
        .select("seller_id, profiles!subscriptions_seller_id_fkey(username)")
        .eq("id", subscriptionId)
        .eq("buyer_id", currentUser.id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete the subscription
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionId)
        .eq("buyer_id", currentUser.id);
      
      if (error) throw error;
      
      toast.success("You have unsubscribed from this seller");
      
      // Notify the seller that a user has unsubscribed
      try {
        await createNotification(
          subscription.seller_id,
          "Subscriber Update",
          `${currentUser.username || 'A user'} has unsubscribed from your profile`,
          "subscription",
          currentUser.id
        );
      } catch (notifyError) {
        console.error("Failed to notify seller about unsubscription:", notifyError);
        // Continue even if notification fails
      }
      
      await fetchSubscriptions();
      return true;
    } catch (error: any) {
      console.error("Error unsubscribing from seller:", error);
      toast.error(error.message || "Failed to unsubscribe from seller");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (sellerId: string) => {
    return subscriptions.some(sub => sub.seller_id === sellerId);
  };

  const getSubscriptionId = (sellerId: string) => {
    const subscription = subscriptions.find(sub => sub.seller_id === sellerId);
    return subscription ? subscription.id : null;
  };

  return {
    subscriptions,
    subscribersCount,
    loading,
    isSubscribed,
    getSubscriptionId,
    subscribeToSeller,
    unsubscribeFromSeller,
    fetchSubscriptions,
    fetchSubscribersCount
  };
};
