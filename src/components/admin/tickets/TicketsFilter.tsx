
import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup, 
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TicketsFilterProps {
  searchTerm: string;
  bettingSite: string | null;
  onSearchChange: (value: string) => void;
  onBettingSiteChange: (site: string | null) => void;
  uniqueBettingSites: string[];
}

const TicketsFilter: React.FC<TicketsFilterProps> = ({
  searchTerm,
  bettingSite,
  onSearchChange,
  onBettingSiteChange,
  uniqueBettingSites
}) => {
  return (
    <div className="bg-betting-dark-gray p-4 rounded-lg mb-4">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              className="pl-8"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onBettingSiteChange(null)}>
                  All Betting Sites
                </DropdownMenuItem>
                {uniqueBettingSites.map((site, idx) => (
                  <DropdownMenuItem 
                    key={idx} 
                    onClick={() => onBettingSiteChange(site)}
                  >
                    {site}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {bettingSite && (
        <div className="flex gap-2 items-center mb-2">
          <Badge className="bg-betting-accent">
            Site: {bettingSite}
            <button 
              className="ml-2" 
              onClick={() => onBettingSiteChange(null)}
            >
              ×
            </button>
          </Badge>
        </div>
      )}
    </div>
  );
};

export default TicketsFilter;
