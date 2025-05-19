
import React from 'react';
import { formatDate } from "@/utils/formatting";

interface LeaderboardHeaderProps {
  weekStart: Date;
  weekEnd: Date;
}

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({ weekStart, weekEnd }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Sellers Leaderboard</h1>
      <p className="text-muted-foreground mb-6">
        Top performing sellers for the period of {formatDate(weekStart.toISOString())} to {formatDate(weekEnd.toISOString())}
        <br />
        <span className="text-sm">Rankings based on number of sales. Showing paid tickets only.</span>
      </p>
    </>
  );
};

export default LeaderboardHeader;
