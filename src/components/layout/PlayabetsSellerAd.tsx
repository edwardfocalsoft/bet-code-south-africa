import React, { useEffect } from "react";

const PlayabetsSellerAd: React.FC = () => {
  useEffect(() => {
    // Load the tracking script after component mounts
    const script = document.createElement('script');
    script.innerHTML = `
      (function(v){
        var r=v.document;
        var n="https://playabets.click/i/WLL41K?r_id=333";
        var e="#amp-res-raven-333-1752425559874";
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
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="mt-6">
      <a href="https://playabets.click/o/WLL41K?r_id=333&lpage=4xHcpu" target="_blank" rel="noopener noreferrer">
        <img
          src="https://raven1-playabets-uploads-bucket.s3.eu-west-1.amazonaws.com/campaign-public/resources/banner/images/img_333.gif"
          id="amp-res-raven-333-1752425559874"
          alt="Playabets Advertisement"
          className="w-full h-auto object-cover rounded-lg"
          onError={(e) => {
            console.error("Error loading seller page ad image:", e);
          }}
        />
      </a>
    </div>
  );
};

export default PlayabetsSellerAd;