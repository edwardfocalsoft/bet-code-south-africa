
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
    if (!currentUser) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use generic type as the subscription table isn't in the generated types yet
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          id,
          seller_id,
          buyer_id,
          created_at,
          profiles:seller_id (username)
        `)
        .eq("buyer_id", currentUser.id) as {
          data: any[];
          error: any;
        };

      if (fetchError) throw fetchError;

      const mappedSubscriptions = data.map((sub: any) => ({
        id: sub.id,
        sellerId: sub.seller_id,
        buyerId: sub.buyer_id,
        createdAt: new Date(sub.created_at),
        sellerUsername: sub.profiles?.username || "Unknown Seller",
      }));

      setSubscriptions(mappedSubscriptions);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      setError(error.message || "Failed to fetch subscriptions");
      toast({
        title: "Error",
        description: "Failed to load subscriptions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

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

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .insert({
            seller_id: sellerId,
            buyer_id: currentUser.id,
          })
          .select() as {
            data: any[];
            error: any;
          };

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
          .eq("id", subscriptionId) as {
            error: any;
          };

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
