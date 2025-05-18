
import React from "react";

interface TicketDescriptionProps {
  description: string;
}

const TicketDescription: React.FC<TicketDescriptionProps> = ({ 
  description 
}) => {
  return (
    <div className="bg-betting-light-gray p-4 rounded-md mb-6 whitespace-pre-line">
      {description}
    </div>
  );
};

export default TicketDescription;
