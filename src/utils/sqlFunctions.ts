import { supabase } from "@/integrations/supabase/client";

/**
 * Execute the add_credits SQL function to update a user's credit balance
 * @param userId The user ID to update credits for
 * @param amount The amount to add (positive) or subtract (negative)
 * @returns The updated balance or null if there was an error
 */
export const addCredits = async (userId: string, amount: number): Promise<number | null> => {
  try {
    // Convert userId to string if it's not already (fixes the type error)
    const userIdStr = String(userId);
    
    const { data, error } = await supabase.rpc(
      'add_credits', 
      { 
        user_id: userIdStr, 
        amount_to_add: amount 
      }
    );
    
    if (error) {
      console.error('Error executing add_credits function:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception when executing add_credits function:', error);
    return null;
  }
};

/**
 * Delete notifications older than 60 days for all users or a specific user
 * @param userId Optional user ID to delete notifications only for that user
 * @returns Number of deleted notifications or null if there was an error
 */
export const deleteOldNotifications = async (userId?: string): Promise<number | null> => {
  try {
    let query = supabase
      .from('notifications')
      .delete()
      .lt('created_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString());
    
    // If userId is provided, only delete notifications for that user
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { error, count } = await query.select('id');
    
    if (error) {
      console.error('Error deleting old notifications:', error);
      return null;
    }
    
    return count;
  } catch (error) {
    console.error('Exception when deleting old notifications:', error);
    return null;
  }
};

/**
 * Get seller statistics including win rate, total sales, etc.
 * @param sellerId The seller ID to get statistics for
 * @returns An object with the seller statistics or null if there was an error
 */
export const getSellerStats = async (sellerId: string) => {
  try {
    // Get total sales count
    const { count: totalSales, error: salesError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed');
      
    if (salesError) throw salesError;

    // Get total revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('purchases')
      .select('price')
      .eq('seller_id', sellerId)
      .eq('payment_status', 'completed');
      
    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum, item) => 
      sum + parseFloat(String(item.price || 0)), 0) || 0;

    // Get winning tickets count
    const { count: winningCount, error: winningError } = await supabase
      .from('purchases')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', sellerId)
      .eq('is_winner', true)
      .eq('payment_status', 'completed');
    
    if (winningError) throw winningError;
    
    // Calculate win rate
    let winRate = 0;
    if (totalSales && totalSales > 0 && winningCount !== null) {
      winRate = Math.round((winningCount / totalSales) * 100);
    }
    
    // Get average rating
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('score')
      .eq('seller_id', sellerId);
      
    if (ratingsError) throw ratingsError;
    
    const totalRatings = ratingsData?.length || 0;
    const sumRatings = ratingsData?.reduce((sum, item) => sum + item.score, 0) || 0;
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
    
    return {
      totalSales: totalSales || 0,
      totalRevenue,
      winningCount: winningCount || 0,
      winRate,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalRatings
    };
  } catch (error) {
    console.error('Error getting seller stats:', error);
    return null;
  }
};

/**
 * Get monthly sales performance data for a seller
 * @param sellerId The seller ID to get performance data for
 * @param months Number of months to include (default: 6)
 * @returns An array of monthly sales data or null if there was an error
 */
export const getSellerPerformanceData = async (sellerId: string, months = 6) => {
  try {
    // Calculate date for the start of the requested months ago
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months, 1);
    const startDateIso = startDate.toISOString();
    
    // Get all sales within the date range
    const { data, error } = await supabase
      .from('purchases')
      .select('price, purchase_date')
      .eq('seller_id', sellerId)
      .gte('purchase_date', startDateIso)
      .order('purchase_date');
      
    if (error) throw error;
    
    // Group sales by month
    const monthlyData: Record<string, number> = {};
    
    // Initialize all months with zero
    for (let i = 0; i < months; i++) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = monthDate.toLocaleString('default', { month: 'short' });
      monthlyData[monthKey] = 0;
    }
    
    // Populate with actual data
    data?.forEach(purchase => {
      const purchaseDate = new Date(purchase.purchase_date);
      const monthKey = purchaseDate.toLocaleString('default', { month: 'short' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += parseFloat(String(purchase.price || 0));
      }
    });
    
    // Convert to array format for chart
    const performanceData = Object.entries(monthlyData)
      .map(([name, sales]) => ({ name, sales }))
      .reverse(); // To show oldest month first
    
    // Calculate month-over-month growth
    let monthlyGrowth = 0;
    if (performanceData.length >= 2) {
      const currentMonth = performanceData[performanceData.length - 1].sales;
      const prevMonth = performanceData[performanceData.length - 2].sales;
      
      if (prevMonth > 0) {
        monthlyGrowth = ((currentMonth - prevMonth) / prevMonth) * 100;
      } else if (currentMonth > 0) {
        monthlyGrowth = 100;
      }
    }
    
    return { performanceData, monthlyGrowth };
  } catch (error) {
    console.error('Error getting seller performance data:', error);
    return null;
  }
};

/**
 * Get recent sales for a seller
 * @param sellerId The seller ID to get recent sales for
 * @param limit Number of recent sales to return (default: 5)
 * @returns An array of recent sales or null if there was an error
 */
export const getRecentSales = async (sellerId: string, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id, 
        price, 
        purchase_date, 
        is_winner,
        buyer_id,
        ticket_id,
        profiles:buyer_id (username, avatar_url),
        tickets:ticket_id (title)
      `)
      .eq('seller_id', sellerId)
      .order('purchase_date', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error getting recent sales:', error);
    return null;
  }
};

/**
 * Get leaderboard for top sellers based on sales in a given time period
 * @param startDate Start date for leaderboard calculation
 * @param endDate End date for leaderboard calculation
 * @returns Array of seller statistics or null if there was an error
 */
export const getSellerLeaderboard = async (startDate: Date, endDate: Date) => {
  try {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // Using the stored function with all parameters to prevent SQL injection
    const { data, error } = await supabase.rpc(
      'get_seller_leaderboard',
      { start_date: startStr, end_date: endStr }
    );

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting seller leaderboard:', error);
    return null;
  }
};

/**
 * Get leaderboard for top sellers based on consistent sales metrics
 * Uses the new public_leaderboard function for public access
 * @param startDate Start date for leaderboard calculation
 * @param endDate End date for leaderboard calculation
 * @param limit Maximum number of sellers to return (default: 10)
 * @returns Array of seller statistics or null if there was an error
 */
export const fetchSellerLeaderboard = async (startDate: Date, endDate: Date, limit = 10) => {
  try {
    // Using the new public function that allows anonymous access
    const { data, error } = await supabase.rpc(
      'get_public_leaderboard',
      { 
        start_date: startDate.toISOString(), 
        end_date: endDate.toISOString(),
        result_limit: limit 
      }
    );
    
    if (error) {
      console.error('Error fetching public seller leaderboard:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchSellerLeaderboard:', error);
    return null;
  }
};

/**
 * Get public seller statistics that are accessible to all users
 * @param sellerId The seller ID to get statistics for
 * @returns An object with public seller statistics or null if there was an error
 */
export const getPublicSellerStats = async (sellerId: string) => {
  try {
    const { data, error } = await supabase.rpc(
      'get_public_seller_stats',
      { seller_id: sellerId }
    );
    
    if (error) {
      console.error('Error getting public seller stats:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPublicSellerStats:', error);
    return null;
  }
};
