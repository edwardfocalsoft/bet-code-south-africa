import { useState, useCallback } from "react";

export const useTicketFilters = () => {
  // Apply betting site filter
  const applyBettingSiteFilter = useCallback((query: any, bettingSite: string | "all" | undefined) => {
    if (bettingSite && bettingSite !== "all") {
      return query.eq("betting_site", bettingSite);
    }
    return query;
  }, []);

  // Apply free tickets filter
  const applyFreeTicketFilter = useCallback((query: any, isFree: boolean | undefined) => {
    if (isFree !== undefined) {
      return query.eq("is_free", isFree);
    }
    return query;
  }, []);

  // Apply max price filter
  const applyMaxPriceFilter = useCallback((query: any, maxPrice: number | undefined) => {
    if (maxPrice !== undefined && maxPrice > 0) {
      return query.lte("price", maxPrice);
    }
    return query;
  }, []);

  // Apply filter for tickets to show - expired vs non-expired
  const applyExpiredFilter = useCallback((query: any, filters: any, role = "buyer") => {
    // For sellers we handle expired filter based on the filters
    if (role === "seller") {
      if (filters.showExpired === true) {
        // No filter, show all tickets
        return query;
      }
      
      // By default only show non-expired tickets to sellers
      return query.eq("is_expired", false);
    }
    
    // For buyers always hide expired tickets
    return query.eq("is_expired", false);
  }, []);

  // Apply seller filter
  const applySellerFilter = useCallback((query: any, sellerId: string | undefined) => {
    if (sellerId) {
      return query.eq("seller_id", sellerId);
    }
    return query;
  }, []);
  
  // Apply hidden filter (show hidden tickets or not)
  const applyHiddenFilter = useCallback((query: any, showHidden?: boolean) => {
    // By default, don't show hidden tickets
    if (!showHidden) {
      return query.eq("is_hidden", false);
    }
    return query;
  }, []);

  // Apply random order filter
  const applyRandomOrder = useCallback((query: any, randomize?: boolean) => {
    if (randomize) {
      return query.order('created_at', { ascending: false }).limit(6);
    }
    return query;
  }, []);
  
  // Apply sorting
  const applySorting = useCallback((query: any, sortBy?: string, sortOrder: "asc" | "desc" = "desc") => {
    if (sortBy) {
      return query.order(sortBy, { ascending: sortOrder === "asc" });
    }
    
    // Default sorting by creation date (newest first)
    return query.order("created_at", { ascending: false });
  }, []);

  return {
    applyBettingSiteFilter,
    applyFreeTicketFilter,
    applyMaxPriceFilter,
    applyExpiredFilter,
    applySellerFilter,
    applyHiddenFilter,
    applyRandomOrder,
    applySorting
  };
};
