
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export const useSubscriptions = () => {
  const { currentUser } = useAuth();
  const { toast: uiToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [isCountLoading, setIsCountLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
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
  }, [currentUser?.id]);

  const fetchSubscribersCount = useCallback(async () => {
    if (!currentUser?.id) return;
    
    try {
      console.log("Fetching subscribers count for user:", currentUser.id);
      setIsCountLoading(true);
      
      // Using count with head: true to efficiently count rows
      const { count, error } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("seller_id", currentUser.id);
        
      if (error) {
        console.error("Error in fetchSubscribersCount:", error);
        throw error;
      }
      
      console.log("Subscriber count result:", count);
      setSubscribersCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching subscribers count:", error);
      toast.error("Failed to load subscriber count");
    } finally {
      setIsCountLoading(false);
    }
  }, [currentUser?.id]);

  // Separate effect for subscriptions
  useEffect(() => {
    if (currentUser?.id) {
      fetchSubscriptions();
    }
  }, [currentUser?.id, fetchSubscriptions]);

  // Dedicated effect for subscriber count to ensure it runs independently
  useEffect(() => {
    if (currentUser?.id && currentUser.role === "seller") {
      console.log("Running fetchSubscribersCount effect for:", currentUser.id);
      fetchSubscribersCount();
    }
  }, [currentUser?.id, currentUser?.role, fetchSubscribersCount]);

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
      
      // Create new subscription
      const { error } = await supabase
        .from("subscriptions")
        .insert({
          buyer_id: currentUser.id,
          seller_id: sellerId
        });
      
      if (error) throw error;
      
      toast.success("You are now subscribed to this seller");
      
      await fetchSubscriptions();
      
      // Update subscriber count for the current user if they are a seller
      if (currentUser.role === 'seller') {
        await fetchSubscribersCount();
      }
      
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
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", subscriptionId)
        .eq("buyer_id", currentUser.id);
      
      if (error) throw error;
      
      toast.success("You have unsubscribed from this seller");
      
      await fetchSubscriptions();
      
      // Update subscriber count for the current user if they are a seller
      if (currentUser.role === 'seller') {
        await fetchSubscribersCount();
      }
      
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
    isCountLoading,
    isSubscribed,
    getSubscriptionId,
    subscribeToSeller,
    unsubscribeFromSeller,
    fetchSubscriptions,
    fetchSubscribersCount
  };
};
