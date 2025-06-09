import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SystemAd {
  id: string;
  title: string;
  image_url: string;
  ad_redirect: string | null;
}

const SystemAdPopup: React.FC = () => {
  const [ad, setAd] = useState<SystemAd | null>(null);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    checkForActiveAd();
  }, []);

  const checkForActiveAd = async () => {
    try {
      // Check localStorage to see if user has already seen an ad today
      const lastAdDate = localStorage.getItem('lastAdDate');
      const today = new Date().toISOString().split('T')[0];
      
      if (lastAdDate === today) {
        console.log("User has already seen an ad today");
        return;
      }

      console.log("Fetching active ads...");
      
      // Get the active ad
      const { data: activeAd, error: adError } = await supabase
        .from("system_ads")
        .select("id, title, image_url, ad_redirect")
        .eq("is_active", true)
        .single();

      if (adError || !activeAd) {
        console.log("No active ad found or error:", adError);
        return;
      }

      console.log("Found active ad:", activeAd);
      setAd(activeAd);
      setShowAd(true);
      
    } catch (error) {
      console.error("Error checking for active ad:", error);
    }
  };

  const handleCloseAd = () => {
    // Record today's date in localStorage
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastAdDate', today);
    
    setShowAd(false);
    setAd(null);
  };

  const handleAdClick = () => {
    console.log("Ad clicked, redirecting to:", ad?.ad_redirect);
    if (ad?.ad_redirect) {
      window.open(ad.ad_redirect, '_blank');
    }
    handleCloseAd();
  };

  if (!ad || !showAd) {
    return null;
  }

  return (
    <Dialog open={showAd} onOpenChange={setShowAd}>
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
              onError={(e) => {
                console.error("Error loading ad image:", e);
                // Optionally set a fallback image
                e.currentTarget.src = '/fallback-ad-image.jpg';
              }}
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