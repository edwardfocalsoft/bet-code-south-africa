
import React from "react";

interface BettingSiteLogoProps {
  site: string;
}

const BettingSiteLogo = ({ site }: BettingSiteLogoProps) => {
  return (
    <div className="betting-site-logo transition-all duration-200 hover:scale-105">
      <div className="bg-betting-dark-gray rounded-lg p-4 h-[90px] flex items-center justify-center shadow-md">
        <div className="text-center">
          <span className="font-bold text-xl text-betting-green">{site}</span>
          <div className="mt-1 w-12 h-1 bg-betting-accent mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BettingSiteLogo;
