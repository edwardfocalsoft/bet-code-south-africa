
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
      if (!caseId || !currentUser || initialLoadComplete) return;

      try {
        setLoading(true);
        setError(null);
        
        const details = await fetchCaseDetails(caseId);
        
        if (!details) {
          setError("Case not found or you don't have permission to view it");
        } else {
          setCaseDetails(details);
        }
        
        setInitialLoadComplete(true);
      } catch (err: any) {
        console.error("Error loading case details:", err);
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, fetchCaseDetails, currentUser, initialLoadComplete]);

  const handleSubmitReply = async (content: string) => {
    if (!caseId || !content.trim()) return;
    
    try {
      const result = await addReply(caseId, content);
      if (result) {
        // Refresh case details to show the new reply
        setInitialLoadComplete(false);
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
        }
      }
    } catch (err: any) {
      console.error("Error submitting reply:", err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId || !newStatus) return;
    
    try {
      const success = await updateCaseStatus(caseId, newStatus);
      
      if (success) {
        // Refresh case details to show the new status
        setInitialLoadComplete(false);
        const updatedDetails = await fetchCaseDetails(caseId);
        
        if (updatedDetails) {
          setCaseDetails(updatedDetails);
        }
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
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
        // Reload case details
        setInitialLoadComplete(false);
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
