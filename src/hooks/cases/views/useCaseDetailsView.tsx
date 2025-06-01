import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

interface CaseDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  case_number?: string;
  tickets?: any[];
  purchases?: any[];
  replies?: any[];
  user?: {
    id: string;
    email: string;
  };
}

export function useCaseDetailsView() {
  const { id: caseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userRole, currentUser } = useAuth();
  const {
    fetchCaseDetails,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading: isCasesLoading,
  } = useCases();

  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  const isAdmin = userRole === 'admin';
  const showRefundDialog = searchParams.get('refund') === 'true';

  const ticketData = caseDetails?.tickets?.[0];
  const purchaseData = caseDetails?.purchases?.[0];

  const canProcessRefund = Boolean(
    isAdmin &&
    purchaseData &&
    purchaseData.price > 0 &&
    ticketData &&
    (caseDetails?.status === "open" || caseDetails?.status === "in_progress")
  );

  const loadCaseDetails = useCallback(async () => {
    try {
      // Don't load if no caseId or user
      if (!caseId || !currentUser) return;

      setLoading(true);
      setError(null);
      
      const details = await fetchCaseDetails(caseId);
      
      if (!details) {
        setError("Case not found");
      } else {
        setCaseDetails(details);
      }
    } catch (err: any) {
      console.error("Case details error:", err);
      setError(err.message || "Failed to load case details");
    } finally {
      setLoading(false);
    }
  }, [caseId, currentUser, fetchCaseDetails]);

  // Initial load and auth check
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!caseId) {
      setError("No case ID provided");
      setLoading(false);
      navigate("/cases");
      return;
    }

    loadCaseDetails();
  }, [caseId, currentUser, navigate, loadCaseDetails]);

  // Handle refund dialog from URL param
  useEffect(() => {
    if (showRefundDialog && caseDetails) {
      setRefundDialogOpen(true);
    }
  }, [showRefundDialog, caseDetails]);

  const handleSubmitReply = async (content: string) => {
    if (!caseId || !content.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    
    try {
      await addReply(caseId, content);
      toast.success("Reply added successfully!");
      await loadCaseDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to add reply");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!caseId) return;
    
    try {
      await updateCaseStatus(caseId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      await loadCaseDetails();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleRefund = async () => {
    if (!caseId || !purchaseData || !ticketData) return;
    
    try {
      await processRefund(
        caseId,
        purchaseData.id,
        purchaseData.buyer_id,
        purchaseData.seller_id,
        purchaseData.price
      );
      toast.success("Refund processed successfully!");
      setRefundDialogOpen(false);
      await loadCaseDetails();
      
      if (showRefundDialog) {
        navigate(`/cases/${caseId}`, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to process refund");
    }
  };

  return {
    caseDetails,
    loading: loading || isCasesLoading,
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
    isAdmin,
    refreshCaseDetails: loadCaseDetails,
  };
}