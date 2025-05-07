
import { supabase } from "@/integrations/supabase/client";
import { useTickets } from "./useTickets";
import { useSellers } from "./useSellers";
import { useTicket } from "./useTicket";

// Export all hooks
export { useTickets, useSellers, useTicket };

export default function useSupabase() {
  return { supabase, useTickets, useSellers, useTicket };
}
