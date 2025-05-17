
// Enhancing the existing useSubscriptions hook
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";

export const useSubscriptions = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
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
        .select("*")
        .eq("buyer_id", currentUser.id);
        
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
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
      setSubscribersCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching subscribers count:", error);
    }
  };

  const subscribeToSeller = async (sellerId: string) => {
    if (!currentUser?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to sellers",
        variant: "destructive",
      });
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
        toast({
          title: "Already Subscribed",
          description: "You are already subscribed to this seller",
        });
        return true;
      }
      
      // Create new subscription
      const { error } = await supabase
        .from("subscriptions")
        .insert({
          buyer_id: currentUser.id,
          seller_id: sellerId
        });
      
      if (error) throw error;
      
      toast({
        title: "Subscription Successful",
        description: "You are now subscribed to this seller",
      });
      
      await fetchSubscriptions();
      return true;
    } catch (error: any) {
      console.error("Error subscribing to seller:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Failed to subscribe to seller",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromSeller = async (subscriptionId: string) => {
    if (!currentUser?.id) return false;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionId)
        .eq("buyer_id", currentUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Unsubscribed Successfully",
        description: "You have unsubscribed from this seller",
      });
      
      await fetchSubscriptions();
      return true;
    } catch (error: any) {
      console.error("Error unsubscribing from seller:", error);
      toast({
        title: "Unsubscribe Failed",
        description: error.message || "Failed to unsubscribe from seller",
        variant: "destructive",
      });
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
