
import { supabase } from "@/integrations/supabase/client";
import { useTickets } from "./useTickets";
import { useSellers } from "./useSellers";
import { useTicket } from "./useTicket";

// Export all hooks
export { useTickets, useSellers, useTicket };

const useSupabase = () => {
  return { supabase };
};

export default useSupabase;
