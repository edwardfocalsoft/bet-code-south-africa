
import React from 'react';
import { Award } from "lucide-react";

interface SellerRankBadgeProps {
  rank: number;
}

const SellerRankBadge: React.FC<SellerRankBadgeProps> = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="flex items-center">
        <Award className="h-5 w-5 text-yellow-500 mr-1" fill="#eab308" />
        <span className="font-bold">{rank}</span>
      </div>
    );
  } else if (rank === 2) {
    return (
      <div className="flex items-center">
        <Award className="h-5 w-5 text-gray-300 mr-1" fill="#d1d5db" />
        <span className="font-bold">{rank}</span>
      </div>
    );
  } else if (rank === 3) {
    return (
      <div className="flex items-center">
        <Award className="h-5 w-5 text-amber-700 mr-1" fill="#b45309" />
        <span className="font-bold">{rank}</span>
      </div>
    );
  } else {
    return <span className="font-bold">{rank}</span>;
  }
};

export default SellerRankBadge;
