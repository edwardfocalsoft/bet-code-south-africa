
import React from 'react';
import { formatDate } from "@/utils/formatting";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface LeaderboardHeaderProps {
  weekStart: Date;
  weekEnd: Date;
  dataSource?: 'week' | 'month';
  onRefresh?: () => void;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ 
  weekStart, 
  weekEnd,
  dataSource = 'week',
  onRefresh
}) => {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-3xl font-bold">Sellers Leaderboard</h1>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        )}
      </div>
      {dataSource === 'week' ? (
        <p className="text-muted-foreground mb-6">
          Top performing sellers for the week of {formatDate(weekStart.toISOString())} to {formatDate(weekEnd.toISOString())}
        </p>
      ) : (
        <p className="text-muted-foreground mb-6">
          Top performing sellers for the last 30 days
        </p>
      )}
    </>
  );
};

export default LeaderboardHeader;
