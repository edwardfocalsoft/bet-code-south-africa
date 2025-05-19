
import React from 'react';
import { formatDate } from "@/utils/formatting";

interface LeaderboardHeaderProps {
  weekStart: Date;
  weekEnd: Date;
  timeRange?: 'week' | 'month';
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ 
  weekStart, 
  weekEnd,
  timeRange = 'week'
}) => {
  const monthStart = new Date();
  monthStart.setDate(monthStart.getDate() - 30);
  
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Sellers Leaderboard</h1>
      <p className="text-muted-foreground mb-6">
        {timeRange === 'week' ? (
          <>Top performing sellers for the week of {formatDate(weekStart.toISOString())} to {formatDate(weekEnd.toISOString())}</>
        ) : (
          <>Top performing sellers for the last 30 days ({formatDate(monthStart.toISOString())} to {formatDate(new Date().toISOString())})</>
        )}
      </p>
    </>
  );
};

export default LeaderboardHeader;
