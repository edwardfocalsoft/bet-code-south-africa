
import React from "react";
import { BettingSite } from "@/types";

interface BettingSiteLogoProps {
  site: BettingSite;
}

const BettingSiteLogo = ({ site }: BettingSiteLogoProps) => {
  // Calculate the background and text colors based on the betting site name
  // This ensures consistent but different colors for each site
  const getColor = (name: string) => {
    const colors = [
      { bg: "bg-blue-600", text: "text-white" },
      { bg: "bg-red-600", text: "text-white" },
      { bg: "bg-green-600", text: "text-white" },
      { bg: "bg-purple-600", text: "text-white" },
      { bg: "bg-orange-500", text: "text-white" },
      { bg: "bg-indigo-600", text: "text-white" },
      { bg: "bg-pink-600", text: "text-white" },
      { bg: "bg-yellow-500", text: "text-black" },
      { bg: "bg-teal-600", text: "text-white" },
      { bg: "bg-cyan-600", text: "text-white" },
    ];
    
    // Use the name string to determine a consistent index
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = sum % colors.length;
    
    return colors[index];
  };
  
  const { bg, text } = getColor(site);

  return (
    <div className="betting-site-logo transition-all duration-200 hover:scale-105">
      <div className={`${bg} rounded-lg p-4 h-[90px] flex items-center justify-center shadow-md`}>
        <div className="text-center">
          <span className={`font-bold text-xl ${text}`}>{site}</span>
          <div className="mt-1 w-12 h-1 bg-white/50 mx-auto rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BettingSiteLogo;
