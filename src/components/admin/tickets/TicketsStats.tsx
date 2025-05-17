
import React from "react";
import { 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface StatsData {
  totalTickets: number;
  activeTickets: number;
  expiredTickets: number;
  hiddenTickets: number;
  averagePrice: number;
  freeTickets: number;
  bySite: Record<string, number>;
}

interface TicketsStatsProps {
  stats: StatsData | null;
  loading: boolean;
}

const TicketsStats: React.FC<TicketsStatsProps> = ({ stats, loading }) => {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Ticket Statistics</DialogTitle>
        <DialogDescription>
          Overview of all tickets in the system
        </DialogDescription>
      </DialogHeader>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
        </div>
      ) : stats ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{stats.totalTickets}</p>
            </div>
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Active Tickets</p>
              <p className="text-2xl font-bold text-green-500">{stats.activeTickets}</p>
            </div>
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-bold">R {stats.averagePrice.toFixed(2)}</p>
            </div>
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Free Tickets</p>
              <p className="text-2xl font-bold text-green-500">{stats.freeTickets}</p>
            </div>
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold text-amber-500">{stats.expiredTickets}</p>
            </div>
            <div className="bg-betting-dark-gray rounded-md p-4">
              <p className="text-sm text-muted-foreground">Hidden</p>
              <p className="text-2xl font-bold text-red-500">{stats.hiddenTickets}</p>
            </div>
          </div>
          
          <div className="bg-betting-dark-gray rounded-md p-4">
            <p className="text-sm font-medium mb-2">Distribution by Betting Site</p>
            <div className="space-y-2">
              {Object.entries(stats.bySite).map(([site, count]) => (
                <div key={site} className="flex justify-between text-sm">
                  <span>{site}</span>
                  <span>{count} tickets</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center py-4 text-muted-foreground">No data available</p>
      )}
    </DialogContent>
  );
};

export default TicketsStats;
