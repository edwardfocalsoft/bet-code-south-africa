
import { supabase } from "@/integrations/supabase/client";
import { useTickets } from "./useTickets";
import { useSellers } from "./useSellers";
import { useTicket } from "./useTicket";
import { useWallet } from "./useWallet";
import { useCases } from "./useCases";

// Export all hooks
export { useTickets, useSellers, useTicket, useWallet, useCases };

const useSupabase = () => {
  return { supabase };
};

export default useSupabase;
