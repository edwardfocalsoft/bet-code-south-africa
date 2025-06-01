
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function useCaseDetailsView(caseId?: string) {
  const navigate = useNavigate();
  const { userRole, currentUser } = useAuth();
  const {
    fetchCaseDetails,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading,
  } = useCases();

  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const isAdmin = userRole === 'admin';
  
  // Check if the refund parameter is in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const showRefundDialog = urlParams.get('refund') === 'true';

  useEffect(() => {
    if (showRefundDialog && caseDetails) {
      setRefundDialogOpen(true);
    }
  }, [showRefundDialog, caseDetails]);

  // Extract ticket and purchase data
  const ticketData = caseDetails?.tickets && caseDetails.tickets[0];
  const purchaseData = caseDetails?.purchases && caseDetails.purchases[0];

  // Check if this is a refund situation with necessary data
  const canProcessRefund =
    isAdmin &&
    purchaseData &&
    purchaseData.price > 0 &&
    ticketData &&
    (caseDetails?.status === "open" || caseDetails?.status === "in_progress");

  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!caseId) {
        console.log("[case-details-view] No case ID provided");
        setError("No case ID provided");
        setLoading(false);
        return;
      }

      if (!currentUser) {
        console.log("[case-details-view] No current user");
        setError("You must be logged in to view case details");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`[case-details-view] Loading case details for case ${caseId}`);
        const details = await fetchCaseDetails(caseId);
        
        if (!details) {
          console.log(`[case-details-view] No case details returned for case ${caseId}`);
          setError("Case not found or you don't have permission to view it");
        } else {
          console.log(`[case-details-view] Successfully loaded case details:`, details);
          setCaseDetails(details);
        }
      } catch (err: any) {
        console.error("[case-details-view] Error loading case details:", err);
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, fetchCaseDetails, currentUser]);

  const handleSubmitReply = async (content: string) => {
    if (!caseId || !content.trim()) return;
    
    try {
      const result = await addReply(caseId, content);
      if (result) {
        toast.success("Reply added successfully!");
        // Refresh case details to show the new reply
        const updatedDetails = await fetchCaseDetails(caseId);
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
        }
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
      toast.error("Failed to add reply. Please try again.");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId || !newStatus) return;
    
    try {
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        toast.success(`Case status updated to ${newStatus}`);
        // Refresh case details to show the new status
        const updatedDetails = await fetchCaseDetails(caseId);
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
        }
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error("Failed to update case status. Please try again.");
    }
  };

  const handleRefund = async () => {
    if (!caseId || !purchaseData || !ticketData) return;
    
    try {
      const success = await processRefund(
        caseId,
        purchaseData.id,
        purchaseData.buyer_id,
        purchaseData.seller_id,
        Number(purchaseData.price)
      );
      
      if (success) {
        toast.success("Refund processed successfully!");
        // Reload case details
        const updatedDetails = await fetchCaseDetails(caseId);
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
          setRefundDialogOpen(false);
          
          // Remove the refund param from URL
          if (showRefundDialog) {
            navigate(`/user/cases/${caseId}`, { replace: true });
          }
        }
      }
    } catch (err: any) {
      console.error("Error processing refund:", err);
      toast.error("Failed to process refund. Please try again.");
    }
  };
  
  return {
    caseDetails,
    loading,
    error,
    refundDialogOpen,
    setRefundDialogOpen,
    ticketData,
    purchaseData,
    canProcessRefund,
    handleSubmitReply,
    handleStatusChange,
    handleRefund,
    showRefundDialog,
    isAdmin
  };
}
