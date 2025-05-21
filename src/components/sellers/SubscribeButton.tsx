
import React from "react";
import { Button } from "@/components/ui/button";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscribeButtonProps {
  sellerId: string;
  variant?: "default" | "outline" | "secondary";
  sellerUsername?: string; // Added optional seller username
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ 
  sellerId,
  variant = "default",
  sellerUsername
}) => {
  const { isSubscribed, subscribeToSeller, unsubscribeFromSeller, getSubscriptionId } = useSubscriptions();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  
  const subscribed = isSubscribed(sellerId);
  const subscriptionId = getSubscriptionId(sellerId);
  const isSelfProfile = currentUser?.id === sellerId;
  
  const handleSubscribe = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to subscribe to sellers",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    if (subscribed && subscriptionId) {
      const success = await unsubscribeFromSeller(subscriptionId);
      if (success) {
        toast({
          title: "Unsubscribed",
          description: `You are no longer subscribed to ${sellerUsername || 'this seller'}.`
        });
      }
    } else {
      const success = await subscribeToSeller(sellerId);
      if (success) {
        toast({
          title: "Subscribed",
          description: `You are now subscribed to ${sellerUsername || 'this seller'}. You'll be notified when they publish new tickets.`
        });
      }
    }
    
    setLoading(false);
  };
  
  // If viewing own profile, show disabled button
  if (isSelfProfile) {
    return (
      <Button
        variant="outline"
        disabled={true}
        className="opacity-70"
      >
        Cannot Subscribe to Yourself
      </Button>
    );
  }
  
  return (
    <Button
      onClick={handleSubscribe}
      variant={subscribed ? "outline" : variant}
      disabled={loading || !currentUser}
      className={subscribed ? "" : "bg-betting-green hover:bg-betting-green-dark"}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {subscribed ? "Unsubscribing..." : "Subscribing..."}
        </>
      ) : subscribed ? (
        "Unsubscribe"
      ) : (
        "Subscribe"
      )}
    </Button>
  );
};

export default SubscribeButton;
