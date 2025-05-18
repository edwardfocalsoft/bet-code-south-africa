
import React from "react";

interface BettingSiteLogoProps {
  site: string;
}

const BettingSiteLogo = ({ site }: BettingSiteLogoProps) => {
  // In a real app, we would fetch these from Supabase storage
  // But for now, we'll use a placeholder with the name
  return (
    <div className="betting-card flex items-center justify-center py-6 font-medium text-center">
      <div className="bg-betting-dark-gray p-2 rounded-lg flex items-center justify-center h-16">
        <span className="font-bold text-betting-green">{site}</span>
      </div>
    </div>
  );
};

export default BettingSiteLogo;
