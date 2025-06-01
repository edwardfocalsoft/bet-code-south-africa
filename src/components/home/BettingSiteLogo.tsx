
import React from "react";
import { BettingSite } from "@/types";

interface BettingSiteLogoProps {
  site: BettingSite;
}

const BettingSiteLogo = ({ site }: BettingSiteLogoProps) => {
  return (
    <div className="betting-site-logo transition-all duration-200 hover:scale-105 w-full">
      <div className="bg-gradient-to-br from-betting-green to-green-700 rounded-lg p-4 h-[90px] flex items-center justify-center shadow-md w-full">
        <div className="text-center">
          <span className="font-bold text-xl text-white">{site}</span>
          <div className="mt-1 w-12 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BettingSiteLogo;
