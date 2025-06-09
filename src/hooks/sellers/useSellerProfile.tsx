
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SellerStats } from '@/types';
import { getPublicSellerStats } from '@/utils/sqlFunctions';

export const useSellerProfile = (id: string | undefined) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [seller, setSeller] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSeller = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch seller profile including WhatsApp information and verified status
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, created_at, display_whatsapp, whatsapp_number, verified')
        .eq('id', id)
        .single();
        
      if (sellerError) {
        throw sellerError;
      }
      
      if (!sellerData) {
        setError('Seller not found');
        setLoading(false);
        return;
      }
      
      setSeller(sellerData);
      
      // Get subscriber count
      const { count: subscribersCount, error: subscribersError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', id);
      
      if (subscribersError) {
        console.error('Error fetching subscribers count:', subscribersError);
      }
      
      // Fetch seller stats using public function
      const statsData = await getPublicSellerStats(id);
      
      if (statsData) {
        // Parse the response and ensure we're working with the right types
        const statsObj = typeof statsData === 'string' ? JSON.parse(statsData) : statsData;
        
        // Convert the JSON response to expected SellerStats format
        setStats({
          totalSales: Number(statsObj.sales_count) || 0,
          totalRevenue: Number(statsObj.total_sales) || 0,
          averageRating: Number(statsObj.average_rating) || 0,
          winRate: Number(statsObj.win_rate) || 0,
          // Add additional properties needed by the components
          ticketsSold: Number(statsObj.sales_count) || 0,
          followers: subscribersCount || 0, // Update this to use the actual subscribers count
          satisfaction: statsObj.average_rating ? Math.min(Number(statsObj.average_rating) * 20, 100) : 0, // Convert rating to percentage
          totalRatings: Number(statsObj.total_ratings) || 0
        });
      } else {
        // Set default stats if none found
        setStats({
          totalSales: 0,
          totalRevenue: 0,
          averageRating: 0,
          winRate: 0,
          ticketsSold: 0,
          followers: subscribersCount || 0, // Set default with actual subscribers count
          satisfaction: 0,
          totalRatings: 0
        });
      }
      
      // Fetch seller reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('ratings')
        .select(`
          id, 
          score, 
          comment, 
          created_at,
          ticket_id,
          buyer_id,
          profiles:buyer_id (username, avatar_url)
        `)
        .eq('seller_id', id)
        .order('created_at', { ascending: false });
        
      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        // Don't throw here, we still want to show the profile
      } else {
        setReviews(reviewsData || []);
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching seller profile:', error);
      setError('Failed to load seller profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [id]);

  return { loading, seller, reviews, stats, error };
};

export default useSellerProfile;
