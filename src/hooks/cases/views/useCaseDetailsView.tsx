import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

// Type definitions
interface User {
  id: string;
  email: string;
  name?: string;
}

interface Ticket {
  id: string;
  event_id: string;
  ticket_type: string;
  price: number;
  status: 'available' | 'sold' | 'refunded';
  created_at: string;
}

interface Purchase {
  id: string;
  buyer_id: string;
  seller_id: string;
  ticket_id: string;
  price: number;
  payment_status: 'pending' | 'completed' | 'refunded';
  transaction_date: string;
}

interface Reply {
  id: string;
  case_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

interface CaseDetails {
  id: string;
  user_id: string;
  ticket_id: string;
  purchase_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed' | 'resolved';
  created_at: string;
  updated_at: string;
  case_number: string;
  user: User;
  ticket: Ticket;
  purchase: Purchase;
  replies: Reply[];
}

interface UseCaseDetailsViewReturn {
  caseDetails: CaseDetails | null;
  loading: boolean;
  error: string | null;
  refundDialogOpen: boolean;
  setRefundDialogOpen: (open: boolean) => void;
  ticketData: Ticket | undefined;
  purchaseData: Purchase | undefined;
  canProcessRefund: boolean;
  handleSubmitReply: (content: string) => Promise<void>;
  handleStatusChange: (newStatus: string) => Promise<void>;
  handleRefund: () => Promise<void>;
  showRefundDialog: boolean;
  isAdmin: boolean;
  refreshCaseDetails: () => Promise<void>;
}

export function useCaseDetailsView(caseId: string): UseCaseDetailsViewReturn {
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

  // Memoized data extraction
  const ticketData = caseDetails?.ticket;
  const purchaseData = caseDetails?.purchase;

  // Check refund eligibility
  const canProcessRefund = Boolean(
    isAdmin &&
    purchaseData &&
    purchaseData.price > 0 &&
    ticketData &&
    (caseDetails?.status === "open" || caseDetails?.status === "in_progress") &&
    purchaseData.payment_status === 'completed'
  );

  // Refresh case details
  const refreshCaseDetails = useCallback(async () => {
    if (!caseId) return;

    try {
      const details = await fetchCaseDetails(caseId);
      if (details) {
        setCaseDetails(details);
      }
    } catch (err) {
      console.error("Failed to refresh case details:", err);
    }
  }, [caseId, fetchCaseDetails]);

  // Load initial case details
  useEffect(() => {
    const loadCaseDetails = async () => {
      if (!caseId) {
        handleError("No case ID provided", "/user/cases");
        return;
      }

      if (!currentUser) {
        handleError("You must be logged in to view case details", "/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const details = await fetchCaseDetails(caseId);
        
        if (!details) {
          handleError("Case not found or you don't have permission to view it", "/user/cases");
        } else {
          setCaseDetails(details);
          if (showRefundDialog) {
            setRefundDialogOpen(true);
          }
        }
      } catch (err: any) {
        handleError(err.message || "Failed to load case details", "/user/cases");
      } finally {
        setLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, currentUser, fetchCaseDetails, showRefundDialog]);

  const handleError = (message: string, redirectPath?: string) => {
    console.error("[case-details-view]", message);
    setError(message);
    toast.error(message);
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  const handleSubmitReply = async (content: string) => {
    if (!content.trim()) {
      toast.error("Reply content cannot be empty");
      return;
    }

    try {
      const result = await addReply(caseId, content);
      if (result) {
        toast.success("Reply added successfully!");
        await refreshCaseDetails();
      }
    } catch (err: any) {
      handleError(err.message || "Failed to add reply");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!newStatus) {
      toast.error("No status provided");
      return;
    }

    try {
      const success = await updateCaseStatus(caseId, newStatus);
      if (success) {
        toast.success(`Case status updated to ${newStatus}`);
        await refreshCaseDetails();
      }
    } catch (err: any) {
      handleError(err.message || "Failed to update case status");
    }
  };

  const handleRefund = async () => {
    if (!purchaseData || !ticketData) {
      toast.error("Missing purchase or ticket data for refund");
      return;
    }

    try {
      const success = await processRefund(
        caseId,
        purchaseData.id,
        purchaseData.buyer_id,
        purchaseData.seller_id,
        purchaseData.price
      );
      
      if (success) {
        toast.success("Refund processed successfully!");
        setRefundDialogOpen(false);
        await refreshCaseDetails();
        
        if (showRefundDialog) {
          navigate(`/user/cases/${caseId}`, { replace: true });
        }
      }
    } catch (err: any) {
      handleError(err.message || "Failed to process refund");
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
    refreshCaseDetails,
  };
}