
import { User } from "@/types";

export interface BuyerStats {
  totalBuyers: number;
  newBuyersLast30Days: number;
  totalProcessedAmount: number;
}

export interface UseBuyersOptions {
  fetchOnMount?: boolean;
  page?: number;
  pageSize?: number;
  filters?: {
    joinDateRange?: { start: Date | null; end: Date | null };
    minPurchases?: number;
    maxPurchases?: number;
    status?: "verified" | "unverified" | "all";
  };
}

export interface UseBuyersResult {
  buyers: User[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  stats: BuyerStats;
  fetchBuyers: () => Promise<void>;
  updateBuyerStatus: (
    buyerId: string,
    updates: { approved?: boolean; suspended?: boolean }
  ) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}
