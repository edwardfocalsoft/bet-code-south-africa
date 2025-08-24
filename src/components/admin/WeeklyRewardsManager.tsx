
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Calendar, DollarSign, Users, PlayCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  triggerWeeklyRewards, 
  getAllWeeklyRewards, 
  getWeeklyRewardsStats,
  WeeklyReward 
} from '@/utils/weeklyRewards';
import { format } from 'date-fns';

const WeeklyRewardsManager: React.FC = () => {
  const [rewards, setRewards] = useState<WeeklyReward[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalRewards: 0,
    currentWeekStart: ''
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rewardsData, statsData] = await Promise.all([
        getAllWeeklyRewards(20),
        getWeeklyRewardsStats()
      ]);
      
      setRewards(rewardsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching weekly rewards data:', error);
      toast.error('Failed to load weekly rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRewards = async () => {
    setProcessing(true);
    try {
      const result = await triggerWeeklyRewards();
      
      if (result.success) {
        toast.success(result.message);
        await fetchData(); // Refresh data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to process weekly rewards');
    } finally {
      setProcessing(false);
    }
  };

  const getPositionBadge = (position: number) => {
    const colors = {
      1: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      2: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      3: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };

    const icons = { 1: '🥇', 2: '🥈', 3: '🥉' };

    return (
      <Badge variant="outline" className={colors[position as keyof typeof colors]}>
        {icons[position as keyof typeof icons]} Position {position}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Distributed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-betting-green">
              R{stats.totalAmount.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Given</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewards}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              Week of {format(new Date(stats.currentWeekStart), 'MMM dd, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Trigger */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Manual Rewards Processing
          </CardTitle>
          <CardDescription>
            Manually trigger the weekly rewards calculation for the previous week. 
            This is normally done automatically every Monday.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleTriggerRewards}
            disabled={processing}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-4 w-4" />
                Process Weekly Rewards
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Weekly Rewards</CardTitle>
          <CardDescription>
            History of weekly reward distributions to top tipsters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No weekly rewards processed yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week Period</TableHead>
                  <TableHead>Tipster</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Sales Count</TableHead>
                  <TableHead className="text-right">Reward Amount</TableHead>
                  <TableHead>Processed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell className="font-medium">
                      {format(new Date(reward.week_start_date), 'MMM dd')} - {format(new Date(reward.week_end_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {(reward as any).profiles?.username || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {getPositionBadge(reward.position)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{reward.sales_count} sales</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-betting-green">
                      R{reward.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(reward.processed_at), 'MMM dd, yyyy HH:mm')}
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
