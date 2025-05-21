
import React from "react";
import TicketsTable from "@/components/tickets/TicketsTable";
import { LoadingState } from "@/components/purchases/LoadingState";

interface SellerTicketsTabProps {
  sellerName: string;
  tickets: any[];
  loading: boolean;
}

const SellerTicketsTab: React.FC<SellerTicketsTabProps> = ({ 
  sellerName, 
  tickets, 
  loading 
}) => {
  return (
    <div className="betting-card p-6">
      <h2 className="text-xl font-bold mb-4">
        {sellerName || "Seller"}'s Tickets
      </h2>
      
      {loading ? (
        <LoadingState />
      ) : tickets.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No active tickets available from this seller.
        </p>
      ) : (
        <TicketsTable 
          tickets={tickets} 
          emptyMessage={`No active tickets available from ${sellerName}.`}
          hideSeller={true}
        />
      )}
    </div>
  );
};

export default SellerTicketsTab;
