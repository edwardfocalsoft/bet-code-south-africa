
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [vouchers, setVouchers] = useState<VoucherWithClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const fetchTodaysVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's vouchers
      const { data: vouchersData, error: vouchersError } = await supabase
        .from('daily_vouchers')
        .select('*')
        .eq('drop_date', today)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (vouchersError) throw vouchersError;

      // Get claims for today's vouchers
      const { data: claimsData, error: claimsError } = await supabase
        .from('voucher_claims')
        .select(`
          *,
          profiles!inner(username)
        `)
        .in('voucher_id', vouchersData?.map(v => v.id) || []);

      if (claimsError) throw claimsError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Combine vouchers with claims
      const vouchersWithClaims: VoucherWithClaim[] = vouchersData?.map(voucher => {
        const claim = claimsData?.find(c => c.voucher_id === voucher.id);
        return {
          ...voucher,
          claim: claim ? {
            ...claim,
            claimer_username: (claim as any).profiles?.username || 'Anonymous'
          } : undefined,
          is_claimed: !!claim,
          claimed_by_current_user: claim?.user_id === user?.id
        };
      }) || [];

      setVouchers(vouchersWithClaims);
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  }, []);

  const claimVoucher = async (voucherId: string) => {
    try {
      setClaiming(voucherId);
      
      const { data, error } = await supabase.rpc('claim_daily_voucher', {
        p_voucher_id: voucherId
      });

      if (error) throw error;

      if (data) {
        toast.success('Voucher claimed successfully! R50 credits added to your account.');
        await fetchTodaysVouchers(); // Refresh the vouchers
      } else {
        toast.error('Failed to claim voucher');
      }
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
    try {
      const { error } = await supabase
        .from('daily_vouchers')
        .insert({
          ...voucherData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      toast.success('Voucher created successfully');
      await fetchTodaysVouchers();
    } catch (error: any) {
      console.error('Error creating voucher:', error);
      toast.error('Failed to create voucher');
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
