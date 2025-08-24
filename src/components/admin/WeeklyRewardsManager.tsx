
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, DollarSign, Users, Calendar, Play } from 'lucide-react';
import { toast } from 'sonner';
import { 
  triggerWeeklyRewards, 
  getWeeklyRewards, 
  getWeeklyRewardsStats,
  WeeklyRewardWithProfile 
} from '@/utils/weeklyRewards';

const WeeklyRewardsManager: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewards, setRewards] = useState<WeeklyRewardWithProfile[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    winnersCount: 0,
    weeksProcessed: 0,
    lastProcessedWeek: null as string | null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsData, statsData] = await Promise.all([
        getWeeklyRewards(20),
        getWeeklyRewardsStats()
      ]);
      
      setRewards(rewardsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading weekly rewards data:', error);
      toast.error('Failed to load weekly rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRewards = async () => {
    setIsProcessing(true);
    try {
      const result = await triggerWeeklyRewards();
      
      if (result.success) {
        toast.success(result.message);
        await loadData(); // Reload data to show new rewards
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process weekly rewards');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPositionBadge = (position: number) => {
    const variants = {
      1: 'bg-yellow-500 text-yellow-50',
      2: 'bg-gray-400 text-gray-50', 
      3: 'bg-orange-600 text-orange-50'
    };
    
    const labels = {
      1: '1st Place',
      2: '2nd Place', 
      3: '3rd Place'
    };

    return (
      <Badge className={variants[position as keyof typeof variants]}>
        <Trophy className="w-3 h-3 mr-1" />
        {labels[position as keyof typeof labels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-betting-green" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rewards</p>
                <p className="text-2xl font-bold">R{stats.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Winners</p>
                <p className="text-2xl font-bold">{stats.winnersCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weeks Processed</p>
                <p className="text-2xl font-bold">{stats.weeksProcessed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Processed</p>
                <p className="text-sm font-bold">
                  {stats.lastProcessedWeek 
                    ? new Date(stats.lastProcessedWeek).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Process Weekly Rewards</CardTitle>
          <CardDescription>
            Manually trigger the weekly rewards calculation for the previous week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleTriggerRewards} 
            disabled={isProcessing}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            <Play className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process Weekly Rewards'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Weekly Rewards</CardTitle>
          <CardDescription>
            Latest rewards distributed to top performing tipsters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No weekly rewards have been processed yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Tipster</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead>Reward Amount</TableHead>
                  <TableHead>Processed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      {new Date(reward.week_start_date).toLocaleDateString()} - {' '}
                      {new Date(reward.week_end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {reward.profiles?.username || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPositionBadge(reward.position)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {reward.sales_count} sales
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-betting-green">
                        R{reward.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(reward.processed_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyRewardsManager;
