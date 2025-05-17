
import React from "react";
import { Button } from "@/components/ui/button";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useAuth } from "@/contexts/auth";
import { Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  sellerId: string;
  variant?: "default" | "outline" | "secondary";
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ 
  sellerId,
  variant = "default" 
}) => {
  const { isSubscribed, subscribeToSeller, unsubscribeFromSeller, getSubscriptionId } = useSubscriptions();
  const { currentUser } = useAuth();
  const [loading, setLoading] = React.useState(false);
  
  const subscribed = isSubscribed(sellerId);
  const subscriptionId = getSubscriptionId(sellerId);
  const isSelfProfile = currentUser?.id === sellerId;
  
  const handleSubscribe = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    
    if (subscribed && subscriptionId) {
      await unsubscribeFromSeller(subscriptionId);
    } else {
      await subscribeToSeller(sellerId);
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
