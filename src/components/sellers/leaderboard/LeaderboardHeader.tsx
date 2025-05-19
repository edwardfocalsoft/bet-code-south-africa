
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4">Seller Leaderboard</h1>
      
      <div className="flex items-center text-muted-foreground">
        <CalendarIcon className="mr-2 h-5 w-5" />
        {timeRange === 'week' ? (
          <span>
            Week of {format(weekStart, 'MMM d, yyyy')} to {format(weekEnd, 'MMM d, yyyy')}
          </span>
        ) : (
          <span>
            Past 30 days (not enough weekly data)
          </span>
        )}
      </div>
      
      <p className="mt-2 text-muted-foreground max-w-2xl">
        {timeRange === 'week' 
          ? "This leaderboard shows the top-performing sellers for the current week based on their sales volume and average customer ratings."
          : "This leaderboard shows the top-performing sellers for the past 30 days based on their sales volume and average customer ratings."}
      </p>
    </div>
  );
};

export default LeaderboardHeader;
