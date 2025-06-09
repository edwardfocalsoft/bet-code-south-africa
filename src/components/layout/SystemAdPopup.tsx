
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
  const { currentUser } = useAuth();
  const [ad, setAd] = useState<SystemAd | null>(null);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Show ads to all visitors (authenticated or not)
    console.log("Checking for active ad for visitor");
    checkForActiveAd();
  }, []);

  const checkForActiveAd = async () => {
    try {
      console.log("Fetching active ads...");
      
      // Get the active ad
      const { data: activeAd, error: adError } = await supabase
        .from("system_ads")
        .select("id, title, image_url, ad_redirect")
        .eq("is_active", true)
        .single();

      if (adError) {
        console.log("No active ad found or error:", adError);
        return;
      }

      if (!activeAd) {
        console.log("No active ad available");
        return;
      }

      console.log("Found active ad:", activeAd);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log("Checking ad views for date:", today);

      // Check localStorage for ad view today
      const viewKey = `ad_viewed_${activeAd.id}_${today}`;
      const hasViewedToday = localStorage.getItem(viewKey);

      console.log("Has viewed ad today:", !!hasViewedToday);

      // If user hasn't seen this ad today, show it
      if (!hasViewedToday) {
        console.log("User hasn't seen ad today, showing it");
        setAd(activeAd);
        setShowAd(true);
      } else {
        console.log("User has already seen ad today");
      }

      // If user is authenticated, also record in database
      if (currentUser) {
        const { data: viewData, error: viewError } = await supabase
          .from("ad_views")
          .select("id")
          .eq("user_id", currentUser.id)
          .eq("ad_id", activeAd.id)
          .eq("viewed_date", today)
          .maybeSingle();

        if (viewError) {
          console.error("Error checking database ad views:", viewError);
        }

        // If not recorded in database and we're showing the ad, we'll record it when closed
        console.log("Database view data:", viewData);
      }
    } catch (error) {
      console.error("Error checking for active ad:", error);
      // Don't show ad if there's an error
    }
  };

  const handleCloseAd = async () => {
    console.log("Closing ad and recording view");
    
    if (ad) {
      try {
        // Always record in localStorage
        const today = new Date().toISOString().split('T')[0];
        const viewKey = `ad_viewed_${ad.id}_${today}`;
        localStorage.setItem(viewKey, 'true');
        console.log("Ad view recorded in localStorage");

        // If user is authenticated, also record in database
        if (currentUser) {
          const { error } = await supabase
            .from("ad_views")
            .insert({
              user_id: currentUser.id,
              ad_id: ad.id,
              viewed_date: today
            });
            
          if (error) {
            console.error("Error recording ad view in database:", error);
          } else {
            console.log("Ad view recorded in database successfully");
          }
        }
      } catch (error) {
        console.error("Error recording ad view:", error);
      }
    }
    
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

  console.log("Rendering ad popup:", ad);

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
              onError={(e) => {
                console.error("Error loading ad image:", e);
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
