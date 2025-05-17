
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useCases = () => {
  const { currentUser, userRole } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = userRole === 'admin';

  // Get user cases
  const { data: userCases, refetch: refetchCases } = useQuery({
    queryKey: ['user-cases', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      
      let query = supabase
        .from('cases')
        .select(`
          *,
          purchases(*),
          tickets(*)
        `)
        .order('created_at', { ascending: false });
      
      // If admin, get all cases, otherwise filter by user_id
      if (!isAdmin) {
        query = query.eq('user_id', currentUser.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching cases:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!currentUser,
  });

  // Get case details including replies
  const fetchCaseDetails = async (caseId: string) => {
    if (!currentUser) return null;
    
    // Get the case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select(`
        *,
        purchases(*),
        tickets(*)
      `)
      .eq('id', caseId)
      .single();
    
    if (caseError) {
      console.error("Error fetching case:", caseError);
      return null;
    }
    
    // Get case replies
    const { data: repliesData, error: repliesError } = await supabase
      .from('case_replies')
      .select(`
        *,
        profiles:user_id(username, role, avatar_url)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    
    if (repliesError) {
      console.error("Error fetching case replies:", repliesError);
      return { ...caseData, replies: [] };
    }
    
    return { ...caseData, replies: repliesData || [] };
  };

  // Create a new case
  const createCase = async (data: {
    ticketId: string,
    purchaseId: string,
    title: string,
    description: string
  }) => {
    if (!currentUser) {
      toast.error("You must be logged in to report an issue");
      return null;
    }

    setIsLoading(true);

    try {
      const { data: newCase, error } = await supabase
        .from('cases')
        .insert({
          user_id: currentUser.id,
          ticket_id: data.ticketId,
          purchase_id: data.purchaseId,
          title: data.title,
          description: data.description
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Issue reported successfully");
      queryClient.invalidateQueries({ queryKey: ['user-cases', currentUser.id] });
      
      return newCase;
    } catch (error: any) {
      console.error("Error creating case:", error);
      toast.error("Failed to report issue: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add a reply to a case
  const addReply = async (caseId: string, content: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to add a reply");
      return null;
    }

    setIsLoading(true);

    try {
      const { data: newReply, error } = await supabase
        .from('case_replies')
        .insert({
          case_id: caseId,
          user_id: currentUser.id,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Update the case's updated_at timestamp
      await supabase
        .from('cases')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', caseId);

      toast.success("Reply added successfully");
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      return newReply;
    } catch (error: any) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply: " + (error.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update case status
  const updateCaseStatus = async (caseId: string, status: string) => {
    if (!currentUser || !isAdmin) {
      toast.error("You don't have permission to update case status");
      return false;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('cases')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (error) throw error;

      toast.success(`Case status updated to ${status}`);
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      return true;
    } catch (error: any) {
      console.error("Error updating case status:", error);
      toast.error("Failed to update status: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Process a refund
  const processRefund = async (
    caseId: string, 
    purchaseId: string, 
    buyerId: string, 
    sellerId: string, 
    amount: number
  ) => {
    if (!currentUser || !isAdmin) {
      toast.error("You don't have permission to process refunds");
      return false;
    }

    setIsLoading(true);

    try {
      // 1. Add credit to buyer
      const { error: buyerError } = await supabase.rpc('add_credits', { 
        user_id: buyerId, 
        amount_to_add: amount 
      });

      if (buyerError) throw buyerError;

      // 2. Deduct credit from seller
      const { error: sellerError } = await supabase.rpc('add_credits', { 
        user_id: sellerId, 
        amount_to_add: -amount 
      });

      if (sellerError) throw sellerError;

      // 3. Create wallet transaction for buyer
      const { error: buyerTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: buyerId,
          amount,
          type: 'refund',
          reference_id: purchaseId,
          description: 'Refund from case #' + caseId
        });

      if (buyerTxError) throw buyerTxError;

      // 4. Create wallet transaction for seller
      const { error: sellerTxError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: sellerId,
          amount: -amount,
          type: 'refund',
          reference_id: purchaseId,
          description: 'Refund deduction from case #' + caseId
        });

      if (sellerTxError) throw sellerTxError;

      // 5. Update case status to 'refunded'
      const { error: caseError } = await supabase
        .from('cases')
        .update({ 
          status: 'refunded', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', caseId);

      if (caseError) throw caseError;

      toast.success(`Refund processed successfully: R${amount.toFixed(2)}`);
      queryClient.invalidateQueries({ queryKey: ['user-cases'] });
      queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
      
      return true;
    } catch (error: any) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund: " + (error.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userCases,
    fetchCaseDetails,
    createCase,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading,
    refetchCases
  };
};
