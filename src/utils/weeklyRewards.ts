
import { supabase } from "@/integrations/supabase/client";

export interface WeeklyReward {
  id: string;
  week_start_date: string;
  week_end_date: string;
  seller_id: string;
  position: number;
  amount: number;
  sales_count: number;
  created_at: string;
  processed_at: string;
}

export interface WeeklyRewardWithProfile extends WeeklyReward {
  profiles: {
    username: string;
    avatar_url: string;
  } | null;
}

export const triggerWeeklyRewards = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-weekly-rewards');
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      message: data.message || 'Weekly rewards processed successfully'
    };
  } catch (error: any) {
    console.error('Error triggering weekly rewards:', error);
    return {
      success: false,
      message: error.message || 'Failed to process weekly rewards'
    };
  }
};

export const getWeeklyRewards = async (limit = 50): Promise<WeeklyRewardWithProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_rewards')
      .select(`
        *,
        profiles:seller_id (
          username,
          avatar_url
        )
      `)
      .order('week_start_date', { ascending: false })
      .order('position', { ascending: true })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching weekly rewards:', error);
    return [];
  }
};

export const getUserWeeklyRewards = async (userId: string, limit = 20): Promise<WeeklyReward[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_rewards')
      .select('*')
      .eq('seller_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user weekly rewards:', error);
    return [];
  }
};

export const getWeeklyRewardsStats = async () => {
  try {
    // Get total rewards distributed
    const { data: totalRewards, error: totalError } = await supabase
      .from('weekly_rewards')
      .select('amount');

    if (totalError) throw totalError;

    const totalAmount = totalRewards?.reduce((sum, reward) => sum + Number(reward.amount), 0) || 0;

    // Get recent winners count
    const { count: winnersCount, error: countError } = await supabase
      .from('weekly_rewards')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get weeks processed
    const { data: weeksData, error: weeksError } = await supabase
      .from('weekly_rewards')
      .select('week_start_date')
      .order('week_start_date', { ascending: false })
      .limit(1);

    if (weeksError) throw weeksError;

    const uniqueWeeks = new Set();
    const { data: allWeeks } = await supabase
      .from('weekly_rewards')
      .select('week_start_date');

    allWeeks?.forEach(week => uniqueWeeks.add(week.week_start_date));

    return {
      totalAmount,
      winnersCount: winnersCount || 0,
      weeksProcessed: uniqueWeeks.size,
      lastProcessedWeek: weeksData?.[0]?.week_start_date || null
    };
  } catch (error) {
    console.error('Error fetching weekly rewards stats:', error);
    return {
      totalAmount: 0,
      winnersCount: 0,
      weeksProcessed: 0,
      lastProcessedWeek: null
    };
  }
};
