import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { CaseDetails } from "@/types";

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

  const isAdmin = userRole === "admin";
  const showRefundDialog = searchParams.get("refund") === "true";

  const ticketData = caseDetails?.tickets;
  const purchaseData = caseDetails?.purchases;

  const canProcessRefund = Boolean(
    isAdmin &&
      purchaseData &&
      purchaseData.price > 0 &&
      ticketData &&
      (caseDetails?.status === "open" || caseDetails?.status === "in_progress")
  );

  const transformCaseData = (rawData: any): CaseDetails => {
    return {
      id: rawData.id,
      case_number: rawData.case_number,
      title: rawData.title,
      description: rawData.description,
      status: rawData.status,
      created_at: rawData.created_at,
      updated_at: rawData.updated_at,
      user_id: rawData.user_id,
      ticket_id: rawData.ticket_id,
      purchase_id: rawData.purchase_id,
      replies: rawData.replies || [],
      tickets: Array.isArray(rawData.tickets)
        ? rawData.tickets[0] || null
        : rawData.tickets || null,
      purchases: Array.isArray(rawData.purchases)
        ? rawData.purchases[0] || null
        : rawData.purchases || null,
      user: rawData.user || null,
    };
  };

  const loadCaseDetails = useCallback(async () => {
    if (!caseId || !currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const details = await fetchCaseDetails(caseId);
      console.log("Fetched raw case details:", details);

      if (!details) {
        setError("Case not found");
        setCaseDetails(null);
        return;
      }

      const transformed = transformCaseData(details);
      console.log("Transformed case details:", transformed);
      setCaseDetails(transformed);
    } catch (err: any) {
      console.error("Error loading case:", err);
      setError(err.message || "Failed to load case details");
      setCaseDetails(null);
    } finally {
      setLoading(false);
    }
  }, [caseId, currentUser, fetchCaseDetails]);

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
