
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface Subscription {
  id: string;
  sellerId: string;
  buyerId: string;
  createdAt: Date;
  sellerUsername?: string;
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchSubscriptions = useCallback(async () => {
    // Don't attempt to fetch or show errors if no user is logged in
    if (!currentUser) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Modified query to correctly join with profiles table
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          seller_id,
          buyer_id,
          created_at,
          profiles!subscriptions_seller_id_fkey (username)
        `)
        .eq("buyer_id", currentUser.id);

      if (fetchError) throw fetchError;

      const mappedSubscriptions = data ? data.map((sub: any) => ({
        id: sub.id,
        sellerId: sub.seller_id,
        buyerId: sub.buyer_id,
        createdAt: new Date(sub.created_at),
        sellerUsername: sub.profiles?.username || "Unknown Seller",
      })) : [];

      setSubscriptions(mappedSubscriptions);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      setError(error.message || "Failed to fetch subscriptions");
      // Only show toast for actual errors when user is logged in and trying to view subscriptions
      // This prevents showing errors on initial load or when not relevant
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const subscribeToSeller = useCallback(
    async (sellerId: string) => {
      if (!currentUser) {
        toast({
          title: "Login Required",
          description: "Please log in to subscribe to sellers.",
          variant: "destructive",
        });
        return false;
      }
      
      // Prevent subscribing to yourself
      if (sellerId === currentUser.id) {
        toast({
          title: "Cannot Subscribe",
          description: "You cannot subscribe to yourself.",
          variant: "destructive",
        });
        return false;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            seller_id: sellerId,
            buyer_id: currentUser.id,
          })
          .select();

        if (error) throw error;

        toast({
          title: "Subscribed",
          description: "You have successfully subscribed to this seller.",
        });

        fetchSubscriptions();
        return true;
      } catch (error: any) {
        console.error("Error subscribing to seller:", error);
        toast({
          title: "Error",
          description: "Failed to subscribe. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUser, toast, fetchSubscriptions]
  );

  const unsubscribeFromSeller = useCallback(
    async (subscriptionId: string) => {
      if (!currentUser) return false;

      try {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq("id", subscriptionId);

        if (error) throw error;

        toast({
          title: "Unsubscribed",
          description: "You have successfully unsubscribed from this seller.",
        });

        fetchSubscriptions();
        return true;
      } catch (error: any) {
        console.error("Error unsubscribing from seller:", error);
        toast({
          title: "Error",
          description: "Failed to unsubscribe. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUser, toast, fetchSubscriptions]
  );

  const isSubscribed = useCallback(
    (sellerId: string) => {
      return subscriptions.some((sub) => sub.sellerId === sellerId);
    },
    [subscriptions]
  );

  const getSubscriptionId = useCallback(
    (sellerId: string) => {
      const subscription = subscriptions.find((sub) => sub.sellerId === sellerId);
      return subscription?.id;
    },
    [subscriptions]
  );

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return {
    subscriptions,
    loading,
    error,
    fetchSubscriptions,
    subscribeToSeller,
    unsubscribeFromSeller,
    isSubscribed,
    getSubscriptionId,
  };
}
