
import React from "react";

interface EventResultsProps {
  eventResults: string;
  isPastKickoff: boolean;
}

const EventResults: React.FC<EventResultsProps> = ({ 
  eventResults, 
  isPastKickoff 
}) => {
  if (!isPastKickoff || !eventResults) return null;
  
  return (
    <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
      <h3 className="font-bold mb-2">Event Results</h3>
      <p>{eventResults}</p>
    </div>
  );
};

export default EventResults;
