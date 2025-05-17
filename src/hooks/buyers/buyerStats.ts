
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { BuyerStats } from "./types";

export async function fetchBuyerStats(): Promise<BuyerStats> {
  // Get total count first for pagination - only buyers with role "buyer"
  const { count, error: countError } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "buyer");

  if (countError) throw countError;
  
  // Calculate new buyers in the last 30 days - only buyers with role "buyer"
  const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
  const { count: newBuyersCount, error: newBuyersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .eq("role", "buyer")
    .gte("created_at", thirtyDaysAgo);
  
  if (newBuyersError) throw newBuyersError;

  // Calculate total processed amount from purchases
  const { data: purchasesData, error: purchasesError } = await supabase
    .from("purchases")
    .select("price");
  
  if (purchasesError) throw purchasesError;
  
  const totalAmount = purchasesData?.reduce((sum, purchase) => sum + Number(purchase.price), 0) || 0;
  
  return {
    totalBuyers: count || 0,
    newBuyersLast30Days: newBuyersCount || 0,
    totalProcessedAmount: totalAmount
  };
}
