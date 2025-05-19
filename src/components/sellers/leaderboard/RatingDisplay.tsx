
import React from 'react';
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ rating }) => {
  return (
    <div className="flex items-center justify-center">
      <span className="mr-1 font-semibold">{rating.toFixed(1)}</span>
      <Star className="h-4 w-4 text-yellow-500" fill="#eab308" />
    </div>
  );
};

export default RatingDisplay;
