
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { UseBuyersOptions } from "./types";

// Build query based on filters
export function buildBuyersQuery(options: UseBuyersOptions) {
  // Build the query for buyers with filters - only buyers with role "buyer"
  let query = supabase
    .from("profiles")
    .select("*")
    .eq("role", "buyer");
  
  // Apply filters if they exist
  if (options.filters) {
    // Join date filter
    if (options.filters.joinDateRange?.start) {
      query = query.gte("created_at", options.filters.joinDateRange.start.toISOString());
    }
    if (options.filters.joinDateRange?.end) {
      query = query.lte("created_at", options.filters.joinDateRange.end.toISOString());
    }
    
    // Status filter
    if (options.filters.status === "verified") {
      query = query.not("username", "is", null).not("username", "eq", "Anonymous");
    } else if (options.filters.status === "unverified") {
      query = query.or("username.is.null,username.eq.Anonymous");
    }
  }
  
  return query;
}

// Fetch buyers with pagination
export async function fetchBuyersData(options: UseBuyersOptions): Promise<User[]> {
  const from = (options.page || 1) * (options.pageSize || 10) - (options.pageSize || 10);
  const to = from + (options.pageSize || 10) - 1;
  
  const query = buildBuyersQuery(options);
  
  // Execute the query with range
  const { data, error: fetchError } = await query.range(from, to);

  if (fetchError) throw fetchError;

  if (!data || data.length === 0) {
    return [];
  }

  // Get purchase counts for each buyer
  const buyerIds = data.map((buyer: any) => buyer.id);
  
  // Get purchases for all buyers in one query
  const { data: buyerPurchasesData, error: buyerPurchasesError } = await supabase
    .from("purchases")
    .select("buyer_id, price")
    .in("buyer_id", buyerIds);
      
  if (buyerPurchasesError) throw buyerPurchasesError;
  
  // Count purchases by buyer_id
  const purchaseCounts: Record<string, number> = {};
  if (buyerPurchasesData) {
    buyerPurchasesData.forEach((purchase: { buyer_id: string }) => {
      purchaseCounts[purchase.buyer_id] = (purchaseCounts[purchase.buyer_id] || 0) + 1;
    });
  }
  
  // Apply purchase count filter if set
  let filteredData = [...data];
  if (options.filters?.minPurchases !== undefined || options.filters?.maxPurchases !== undefined) {
    filteredData = data.filter((buyer: any) => {
      const count = purchaseCounts[buyer.id] || 0;
      const passesMin = options.filters?.minPurchases === undefined || count >= options.filters.minPurchases;
      const passesMax = options.filters?.maxPurchases === undefined || count <= options.filters.maxPurchases;
      return passesMin && passesMax;
    });
  }

  // Map the buyers with verification status determined by username presence
  return filteredData.map((buyer: any) => {
    // Consider a buyer verified if they have a username that is not "Anonymous"
    const isVerified = buyer.username && buyer.username !== "Anonymous";
    
    return {
      id: buyer.id,
      email: buyer.email,
      role: buyer.role,
      username: buyer.username || "Anonymous",
      createdAt: new Date(buyer.created_at),
      approved: isVerified,
      suspended: buyer.suspended || false,
      lastActive: buyer.updated_at ? new Date(buyer.updated_at) : new Date(buyer.created_at),
      purchasesCount: purchaseCounts[buyer.id] || 0,
      loyaltyPoints: buyer.loyalty_points || 0,
      creditBalance: buyer.credit_balance || 0,
    };
  });
}
