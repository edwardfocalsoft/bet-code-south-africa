
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface DailyVoucher {
  id: string;
  code: string;
  value: number;
  drop_date: string;
  drop_time: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
}

interface VoucherClaim {
  id: string;
  voucher_id: string;
  user_id: string;
  claimed_at: string;
  claimer_username?: string;
}

interface VoucherWithClaim extends DailyVoucher {
  claim?: VoucherClaim;
  is_claimed: boolean;
  claimed_by_current_user: boolean;
}

export function useDailyVouchers() {
  const { currentUser } = useAuth();
  const [vouchers, setVouchers] = useState<VoucherWithClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchTodaysVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('daily_vouchers')
        .select('*')
        .eq('drop_date', today)
        .eq('is_active', true)
        .order('created_at');

      if (vouchersError) throw vouchersError;

      // Fetch claims for today's vouchers
      const { data: claimsData, error: claimsError } = await supabase
        .from('voucher_claims')
        .select(`
          *,
          profiles!voucher_claims_user_id_fkey(username)
        `)
        .in('voucher_id', vouchersData?.map(v => v.id) || []);

      if (claimsError) throw claimsError;

      // Combine vouchers with their claims
      const vouchersWithClaims: VoucherWithClaim[] = (vouchersData || []).map(voucher => {
        const claim = claimsData?.find(c => c.voucher_id === voucher.id);
        return {
          ...voucher,
          claim: claim ? {
            id: claim.id,
            voucher_id: claim.voucher_id,
            user_id: claim.user_id,
            claimed_at: claim.claimed_at,
            claimer_username: claim.profiles?.username || 'Unknown'
          } : undefined,
          is_claimed: !!claim,
          claimed_by_current_user: claim?.user_id === currentUser?.id
        };
      });

      setVouchers(vouchersWithClaims);
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const claimVoucher = async (voucherId: string) => {
    if (!currentUser) {
      toast.error('Please log in to claim vouchers');
      return;
    }

    try {
      setClaiming(voucherId);
      
      const { data, error } = await supabase.rpc('claim_daily_voucher', {
        p_voucher_id: voucherId,
        p_user_id: currentUser.id
      });

      if (error) throw error;

      toast.success('Voucher claimed successfully! Check your claimed vouchers below for the code.');
      await fetchTodaysVouchers(); // Refresh the list
    } catch (error: any) {
      console.error('Error claiming voucher:', error);
      toast.error(error.message || 'Failed to claim voucher');
    } finally {
      setClaiming(null);
    }
  };

  const createVoucher = async (voucherData: {
    code: string;
    value: number;
    drop_date: string;
    drop_time: string;
  }) => {
    if (!currentUser) {
      toast.error('You must be logged in to create vouchers');
      return;
    }

    try {
      const { error } = await supabase
        .from('daily_vouchers')
        .insert({
          code: voucherData.code,
          value: voucherData.value,
          drop_date: voucherData.drop_date,
          drop_time: voucherData.drop_time,
          created_by: currentUser.id,
          is_active: true
        });

      if (error) throw error;

      toast.success('Voucher created successfully');
      await fetchTodaysVouchers();
    } catch (error: any) {
      console.error('Error creating voucher:', error);
      toast.error(error.message || 'Failed to create voucher');
      throw error;
    }
  };

  useEffect(() => {
    fetchTodaysVouchers();
  }, [fetchTodaysVouchers]);

  return {
    vouchers,
    loading,
    claiming,
    claimVoucher,
    createVoucher,
    refetch: fetchTodaysVouchers
  };
}
