
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface SystemAd {
  id: string;
  title: string;
  image_url: string;
  ad_redirect: string | null;
}

const SystemAdPopup: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [ad, setAd] = useState<SystemAd | null>(null);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Only show ads to buyers and sellers, not admins or logged out users
    if (currentUser && userRole && (userRole === 'buyer' || userRole === 'seller')) {
      checkForActiveAd();
    }
  }, [currentUser, userRole]);

  const checkForActiveAd = async () => {
    try {
      // Get the active ad
      const { data: activeAd, error: adError } = await supabase
        .from("system_ads")
        .select("id, title, image_url, ad_redirect")
        .eq("is_active", true)
        .single();

      if (adError || !activeAd) return;

      // Check if user has already seen this ad today
      const { data: viewData, error: viewError } = await supabase
        .from("ad_views")
        .select("id")
        .eq("user_id", currentUser?.id)
        .eq("ad_id", activeAd.id)
        .eq("viewed_date", new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (viewError) {
        console.error("Error checking ad views:", viewError);
        return;
      }

      // If user hasn't seen this ad today, show it
      if (!viewData) {
        setAd(activeAd);
        setShowAd(true);
      }
    } catch (error) {
      console.error("Error checking for active ad:", error);
    }
  };

  const handleCloseAd = async () => {
    if (ad && currentUser) {
      try {
        // Record that user has viewed this ad today
        await supabase
          .from("ad_views")
          .insert({
            user_id: currentUser.id,
            ad_id: ad.id,
          });
      } catch (error) {
        console.error("Error recording ad view:", error);
      }
    }
    
    setShowAd(false);
    setAd(null);
  };

  const handleAdClick = () => {
    if (ad?.ad_redirect) {
      window.open(ad.ad_redirect, '_blank');
    }
    handleCloseAd();
  };

  if (!ad) return null;

  return (
    <Dialog open={showAd} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
            onClick={handleCloseAd}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div 
            className={`aspect-square ${ad.ad_redirect ? 'cursor-pointer' : ''}`}
            onClick={ad.ad_redirect ? handleAdClick : undefined}
          >
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {ad.title && (
            <div className="p-4 bg-betting-dark-gray">
              <h3 className="text-lg font-medium text-center text-white">
                {ad.title}
              </h3>
              {ad.ad_redirect && (
                <p className="text-sm text-center text-gray-300 mt-1">
                  Click to learn more
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemAdPopup;
