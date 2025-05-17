
import { useCallback } from "react";
import { BettingSite } from "@/types";

interface FilterOptions {
  bettingSite?: BettingSite | "all";
  isFree?: boolean;
  maxPrice?: number;
  showExpired?: boolean;
  sellerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showHidden?: boolean;
}

export const useTicketFilters = () => {
  // Apply betting site filter to the query
  const applyBettingSiteFilter = useCallback((query: any, filter: BettingSite | "all" | undefined) => {
    if (filter && filter !== "all") {
      return query.eq("betting_site", filter);
    }
    return query;
  }, []);

  // Apply free ticket filter to the query
  const applyFreeTicketFilter = useCallback((query: any, isFree: boolean | undefined) => {
    if (isFree !== undefined) {
      return query.eq("is_free", isFree);
    }
    return query;
  }, []);

  // Apply maximum price filter to the query
  const applyMaxPriceFilter = useCallback((query: any, maxPrice: number | undefined) => {
    if (maxPrice !== undefined) {
      const maxPriceStr = String(maxPrice);
      return query.lte("price", maxPriceStr);
    }
    return query;
  }, []);

  // Apply expired tickets filter based on role
  const applyExpiredFilter = useCallback((query: any, mergedFilters: FilterOptions, role: string) => {
    // Critical fix: For buyers, NEVER show expired tickets regardless of other filters
    if (role === "buyer") {
      return query.eq("is_expired", false);
    } else if (role === "seller" || role === "admin") {
      // For sellers and admins, respect the showExpired filter if provided
      if (mergedFilters?.showExpired !== undefined) {
        return query.eq("is_expired", mergedFilters.showExpired);
      }
      // Default behavior for sellers/admins if no explicit filter is provided
      return query.eq("is_expired", false);
    }
    return query;
  }, []);

  // Apply seller ID filter (for sellers viewing their own tickets)
  const applySellerFilter = useCallback((query: any, sellerId: string | undefined) => {
    if (sellerId) {
      return query.eq("seller_id", sellerId);
    }
    return query;
  }, []);

  // Apply hidden tickets filter
  const applyHiddenFilter = useCallback((query: any, showHidden: boolean | undefined) => {
    if (showHidden !== true) {
      return query.eq("is_hidden", false);
    }
    return query;
  }, []);

  // Apply sorting to the query
  const applySorting = useCallback((query: any, sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => {
    if (sortBy) {
      const sortByValue = typeof sortBy === 'number' ? String(sortBy) : sortBy;
      return query.order(sortByValue, { 
        ascending: sortOrder !== "desc" 
      });
    }
    return query.order("created_at", { ascending: false });
  }, []);

  return {
    applyBettingSiteFilter,
    applyFreeTicketFilter, 
    applyMaxPriceFilter,
    applyExpiredFilter,
    applySellerFilter,
    applyHiddenFilter,
    applySorting
  };
};
