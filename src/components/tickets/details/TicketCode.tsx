
import React from "react";
import CopyTicketCode from "./CopyTicketCode";

interface TicketCodeProps {
  ticketCode: string;
  alreadyPurchased: boolean;
}

const TicketCode: React.FC<TicketCodeProps> = ({ 
  ticketCode, 
  alreadyPurchased 
}) => {
  return (
    <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
      <h3 className="font-bold mb-2">Ticket Code</h3>
      {alreadyPurchased ? (
        <div className="flex items-center">
          <div className="font-mono bg-betting-dark-gray p-3 rounded-md text-green-400 flex-1">
            {ticketCode}
          </div>
          <CopyTicketCode ticketCode={ticketCode} />
        </div>
      ) : (
        <div className="blur-sm bg-betting-dark-gray p-3 rounded-md text-gray-300 select-none">
          ** Purchase to reveal ticket code **
        </div>
      )}
    </div>
  );
};

export default TicketCode;
