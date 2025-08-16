
import React from 'react';

interface EmptyLeaderboardProps {
  message?: string;
}

const EmptyLeaderboard: React.FC<EmptyLeaderboardProps> = ({ 
  message = "No tipsters found for this period" 
}) => {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">{message}</p>
      <p className="text-sm text-muted-foreground">
        The leaderboard resets every Monday at midnight.
      </p>
    </div>
  );
};

export default EmptyLeaderboard;
