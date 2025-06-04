
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
    // Show ads to all authenticated users (buyers, sellers, and even admins)
    if (currentUser && userRole) {
      console.log("SystemAdPopup: Checking for active ad for user:", currentUser.id, "role:", userRole);
      checkForActiveAd();
    }
  }, [currentUser, userRole]);

  const checkForActiveAd = async () => {
    try {
      console.log("SystemAdPopup: Fetching active ads...");
      
      // Get the active ad
      const { data: activeAd, error: adError } = await supabase
        .from("system_ads")
        .select("id, title, image_url, ad_redirect")
        .eq("is_active", true)
        .single();

      if (adError) {
        console.log("SystemAdPopup: No active ad found or error:", adError);
        return;
      }

      if (!activeAd) {
        console.log("SystemAdPopup: No active ad available");
        return;
      }

      console.log("SystemAdPopup: Found active ad:", activeAd);

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      console.log("SystemAdPopup: Checking ad views for date:", today);

      // Check if user has already seen this ad today
      const { data: viewData, error: viewError } = await supabase
        .from("ad_views")
        .select("id")
        .eq("user_id", currentUser?.id)
        .eq("ad_id", activeAd.id)
        .eq("viewed_date", today)
        .maybeSingle();

      if (viewError) {
        console.error("SystemAdPopup: Error checking ad views:", viewError);
        // Show ad anyway if we can't check views
        setAd(activeAd);
        setShowAd(true);
        return;
      }

      console.log("SystemAdPopup: Existing view data:", viewData);

      // If user hasn't seen this ad today, show it
      if (!viewData) {
        console.log("SystemAdPopup: User hasn't seen ad today, showing it");
        setAd(activeAd);
        setShowAd(true);
      } else {
        console.log("SystemAdPopup: User has already seen ad today");
      }
    } catch (error) {
      console.error("SystemAdPopup: Error checking for active ad:", error);
      // Don't show ad if there's an error
    }
  };

  const handleCloseAd = async () => {
    console.log("SystemAdPopup: Closing ad and recording view");
    
    if (ad && currentUser) {
      try {
        // Record that user has viewed this ad today
        const { error } = await supabase
          .from("ad_views")
          .insert({
            user_id: currentUser.id,
            ad_id: ad.id,
            viewed_date: new Date().toISOString().split('T')[0]
          });
          
        if (error) {
          console.error("SystemAdPopup: Error recording ad view:", error);
        } else {
          console.log("SystemAdPopup: Ad view recorded successfully");
        }
      } catch (error) {
        console.error("SystemAdPopup: Error recording ad view:", error);
      }
    }
    
    setShowAd(false);
    setAd(null);
  };

  const handleAdClick = () => {
    console.log("SystemAdPopup: Ad clicked, redirecting to:", ad?.ad_redirect);
    if (ad?.ad_redirect) {
      window.open(ad.ad_redirect, '_blank');
    }
    handleCloseAd();
  };

  // Add a small delay to ensure the component is properly mounted
  useEffect(() => {
    if (ad && showAd) {
      console.log("SystemAdPopup: Rendering ad popup:", ad);
    }
  }, [ad, showAd]);

  if (!ad || !showAd) {
    return null;
  }

  return (
    <Dialog open={showAd} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
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
                console.error("SystemAdPopup: Error loading ad image:", e);
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
