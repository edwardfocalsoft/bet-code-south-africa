
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award } from "lucide-react";

interface LoyaltyPointsCardProps {
  points: number;
  loading: boolean;
}

const LoyaltyPointsCard: React.FC<LoyaltyPointsCardProps> = ({ points, loading }) => {
  // Define the reward levels
  const LEVELS = [
    { threshold: 0, name: "Bronze" },
    { threshold: 100, name: "Silver" },
    { threshold: 250, name: "Gold" },
    { threshold: 500, name: "Platinum" },
    { threshold: 1000, name: "Diamond" }
  ];

  // Calculate current level and progress to next level
  const getCurrentLevel = () => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].threshold) {
        return i;
      }
    }
    return 0;
  };

  const currentLevelIndex = getCurrentLevel();
  const currentLevel = LEVELS[currentLevelIndex];
  const nextLevelIndex = currentLevelIndex < LEVELS.length - 1 ? currentLevelIndex + 1 : currentLevelIndex;
  const nextLevel = LEVELS[nextLevelIndex];
  
  // Calculate progress percentage to next level
  const calculateProgress = () => {
    if (currentLevelIndex === LEVELS.length - 1) {
      return 100; // Max level reached
    }
    
    const pointsInCurrentLevel = points - currentLevel.threshold;
    const pointsNeededForNextLevel = nextLevel.threshold - currentLevel.threshold;
    const progressPercent = Math.min(Math.round((pointsInCurrentLevel / pointsNeededForNextLevel) * 100), 100);
    
    return progressPercent;
  };

  const progressPercent = calculateProgress();

  return (
    <Card className="betting-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Loyalty Rewards</span>
          <Award className="h-5 w-5 text-purple-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">{points}</span>
                <span className="text-sm text-muted-foreground ml-1">points</span>
              </div>
              <span className="text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded">
                {currentLevel.name}
              </span>
            </div>
            
            {currentLevelIndex < LEVELS.length - 1 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{currentLevel.name}</span>
                  <span>{nextLevel.name}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {nextLevel.threshold - points} more points to reach {nextLevel.name}
                </p>
              </div>
            )}
            
            {currentLevelIndex === LEVELS.length - 1 && (
              <p className="text-sm text-center font-medium text-betting-green">
                Maximum level achieved!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyPointsCard;
