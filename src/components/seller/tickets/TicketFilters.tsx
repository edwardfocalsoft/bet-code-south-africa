
import React from "react";
import { Button } from "@/components/ui/button";

interface TicketFiltersProps {
  activeFilter: 'all' | 'active' | 'expired';
  setActiveFilter: (filter: 'all' | 'active' | 'expired') => void;
}

const TicketFilters: React.FC<TicketFiltersProps> = ({ 
  activeFilter, 
  setActiveFilter 
}) => {
  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <Button 
          variant={activeFilter === 'all' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={activeFilter === 'active' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('active')}
        >
          Active
        </Button>
        <Button 
          variant={activeFilter === 'expired' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('expired')}
        >
          Expired
        </Button>
      </div>
    </div>
  );
};

export default TicketFilters;
