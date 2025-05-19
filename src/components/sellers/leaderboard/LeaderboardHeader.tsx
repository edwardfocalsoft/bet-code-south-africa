
import React from 'react';
import { formatDate } from "@/utils/formatting";

interface LeaderboardHeaderProps {
  weekStart: Date;
  weekEnd: Date;
  dataSource?: 'week' | 'month';
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ 
  weekStart, 
  weekEnd,
  dataSource = 'week'
}) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Sellers Leaderboard</h1>
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
