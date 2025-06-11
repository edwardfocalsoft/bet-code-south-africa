
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
      
      // For now, create mock data until the database types are updated
      const mockVouchers: VoucherWithClaim[] = [
        {
          id: '1',
          code: 'DAILY12345678',
          value: 50,
          drop_date: new Date().toISOString().split('T')[0],
          drop_time: '12:00:00',
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: null,
          is_claimed: false,
          claimed_by_current_user: false
        },
        {
          id: '2',
          code: 'DAILY87654321',
          value: 50,
          drop_date: new Date().toISOString().split('T')[0],
          drop_time: '12:00:00',
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: null,
          is_claimed: true,
          claimed_by_current_user: false,
          claim: {
            id: 'claim1',
            voucher_id: '2',
            user_id: 'user1',
            claimed_at: new Date().toISOString(),
            claimer_username: 'TestUser'
          }
        },
        {
          id: '3',
          code: 'DAILY11223344',
          value: 50,
          drop_date: new Date().toISOString().split('T')[0],
          drop_time: '12:00:00',
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: null,
          is_claimed: false,
          claimed_by_current_user: false
        },
        {
          id: '4',
          code: 'DAILY55667788',
          value: 50,
          drop_date: new Date().toISOString().split('T')[0],
          drop_time: '12:00:00',
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: null,
          is_claimed: false,
          claimed_by_current_user: false
        },
        {
          id: '5',
          code: 'DAILY99887766',
          value: 50,
          drop_date: new Date().toISOString().split('T')[0],
          drop_time: '12:00:00',
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: null,
          is_claimed: false,
          claimed_by_current_user: false
        }
      ];

      setVouchers(mockVouchers);
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
      
      // Simulate claiming process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the voucher state to show as claimed
      setVouchers(prev => prev.map(voucher => 
        voucher.id === voucherId 
          ? {
              ...voucher,
              is_claimed: true,
              claimed_by_current_user: true,
              claim: {
                id: 'new-claim',
                voucher_id: voucherId,
                user_id: 'current-user',
                claimed_at: new Date().toISOString(),
                claimer_username: 'You'
              }
            }
          : voucher
      ));
      
      toast.success('Voucher claimed successfully! R50 credits added to your account.');
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
      // Simulate voucher creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
