
import { supabase } from "@/integrations/supabase/client";

export async function updateBuyerStatus(
  buyerId: string,
  updates: { approved?: boolean; suspended?: boolean }
) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", buyerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating buyer status:", error);
    return false;
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) throw error;    
    return true;
  } catch (error) {
    console.error("Error resending verification email:", error);
    return false;
  }
}
