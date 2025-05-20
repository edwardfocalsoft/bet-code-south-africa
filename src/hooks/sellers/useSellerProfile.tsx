
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
      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, display_whatsapp, whatsapp_number')
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
      
      // Fetch seller stats using public function
      const statsData = await getPublicSellerStats(id);
      
      if (statsData) {
        // Convert the JSON response to expected SellerStats format
        setStats({
          totalSales: statsData.sales_count || 0,
          totalRevenue: statsData.total_sales || 0,
          averageRating: statsData.average_rating || 0,
          winRate: statsData.win_rate || 0
        });
      } else {
        // Set default stats if none found
        setStats({
          totalSales: 0,
          totalRevenue: 0,
          averageRating: 0,
          winRate: 0
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
