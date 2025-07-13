
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const PlayabetsPopupAd: React.FC = () => {
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    // Check if user has already seen the ad in this session
    const hasSeenAd = sessionStorage.getItem('playabets-popup-seen');
    
    if (!hasSeenAd) {
      // Show popup after a random delay between 10-30 seconds
      const randomDelay = Math.random() * 20000 + 10000; // 10-30 seconds
      
      const timer = setTimeout(() => {
        setShowAd(true);
      }, randomDelay);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseAd = () => {
    // Mark as seen for this session
    sessionStorage.setItem('playabets-popup-seen', 'true');
    setShowAd(false);
  };

  const handleAdClick = () => {
    // Track the click and close the popup
    handleCloseAd();
  };

  if (!showAd) {
    return null;
  }

  return (
    <>
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
              className="cursor-pointer"
              onClick={handleAdClick}
            >
              <a href="https://playabets.click/o/WLL41K?r_id=333&lpage=4xHcpu" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://raven1-playabets-uploads-bucket.s3.eu-west-1.amazonaws.com/campaign-public/resources/banner/images/img_333.gif"
                  id="amp-res-raven-333-1752392516410"
                  alt="Playabets Advertisement"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    console.error("Error loading popup ad image:", e);
                    handleCloseAd(); // Close popup if image fails to load
                  }}
                />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Playabets Tracking Script */}
      {showAd && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(v){
                var r=v.document;
                var n="https://playabets.click/i/WLL41K?r_id=333";
                var e="#amp-res-raven-333-1752392516410";
                var t=r.querySelector(e);
                var i=function(e){
                  var r=e.offsetTop;
                  var n=r+e.clientHeight;
                  var t=v.scrollY;
                  var i=t+v.innerHeight;
                  return n>t&&r<i
                };
                var o=function(){
                  if(i(t)){
                    var e=r.createElement("iframe");
                    e.style.display="none";
                    e.src=n;
                    r.body.appendChild(e);
                    v.removeEventListener("touchmove",o);
                    v.removeEventListener("resize",o);
                    v.removeEventListener("scroll",o)
                  }
                };
                if(t){
                  v.addEventListener("touchmove",o);
                  v.addEventListener("resize",o);
                  v.addEventListener("scroll",o);
                  o()
                }
              })(window);
            `
          }}
        />
      )}
    </>
  );
};

export default PlayabetsPopupAd;
