
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RelatedTicketInfoProps {
  ticketData: any;
  purchaseData: any;
}

const RelatedTicketInfo: React.FC<RelatedTicketInfoProps> = ({ 
  ticketData, 
  purchaseData 
}) => {
  const navigate = useNavigate();

  if (!ticketData) return null;

  return (
    <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
      <h3 className="font-bold mb-2">Related Ticket</h3>
      <p>
        <strong>Title:</strong> {ticketData.title}
      </p>
      {purchaseData && (
        <p className="mt-1">
          <strong>Price:</strong> R{Number(purchaseData.price).toFixed(2)}
        </p>
      )}
      <Button
        variant="outline"
        className="mt-2"
        onClick={() => navigate(`/tickets/${ticketData.id}`)}
      >
        View Ticket
      </Button>
    </div>
  );
};

export default RelatedTicketInfo;
