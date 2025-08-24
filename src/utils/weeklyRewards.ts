
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

/**
 * Manually trigger weekly rewards processing (admin only)
 */
export const triggerWeeklyRewards = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-weekly-rewards', {
      method: 'POST'
    });

    if (error) {
      console.error('Error triggering weekly rewards:', error);
      return { 
        success: false, 
        message: error.message || 'Failed to trigger weekly rewards' 
      };
    }

    return {
      success: true,
      message: data?.message || 'Weekly rewards processed successfully',
      data: data
    };
  } catch (error: any) {
    console.error('Exception triggering weekly rewards:', error);
    return {
      success: false,
      message: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Get weekly rewards for a specific seller
 */
export const getSellerWeeklyRewards = async (sellerId: string, limit = 10): Promise<WeeklyReward[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_rewards')
      .select('*')
      .eq('seller_id', sellerId)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching seller weekly rewards:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching seller weekly rewards:', error);
    return [];
  }
};

/**
 * Get all weekly rewards (admin only)
 */
export const getAllWeeklyRewards = async (limit = 50): Promise<WeeklyReward[]> => {
  try {
    const { data, error } = await supabase
      .from('weekly_rewards')
      .select(`
        *,
        profiles:seller_id (username)
      `)
      .order('week_start_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching all weekly rewards:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching all weekly rewards:', error);
    return [];
  }
};

/**
 * Get weekly rewards statistics
 */
export const getWeeklyRewardsStats = async () => {
  try {
    // Get total rewards distributed
    const { data: totalData, error: totalError } = await supabase
      .from('weekly_rewards')
      .select('amount');

    if (totalError) throw totalError;

    const totalAmount = totalData?.reduce((sum, reward) => sum + Number(reward.amount), 0) || 0;
    const totalRewards = totalData?.length || 0;

    // Get current week's potential rewards (if any)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - daysToSubtract);
    weekStartDate.setHours(0, 0, 0, 0);

    return {
      totalAmount,
      totalRewards,
      currentWeekStart: weekStartDate.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error fetching weekly rewards stats:', error);
    return {
      totalAmount: 0,
      totalRewards: 0,
      currentWeekStart: new Date().toISOString().split('T')[0]
    };
  }
};
