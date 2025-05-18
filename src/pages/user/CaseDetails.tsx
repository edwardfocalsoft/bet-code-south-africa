
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { useAuth } from "@/contexts/auth";

// Import refactored components
import CaseDetailsHeader from "@/components/cases/CaseDetailsHeader";
import AdminCaseActions from "@/components/cases/AdminCaseActions";
import RelatedTicketInfo from "@/components/cases/RelatedTicketInfo";
import CaseReplies from "@/components/cases/CaseReplies";
import ReplyForm from "@/components/cases/ReplyForm";
import RefundDialog from "@/components/cases/RefundDialog";
import CaseError from "@/components/cases/CaseError";
import CaseNotFound from "@/components/cases/CaseNotFound";
import LoadingState from "@/components/cases/LoadingState";

// Case status options
const caseStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "refunded", label: "Refunded" },
  { value: "closed", label: "Closed" },
];

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "in_progress":
    case "in progress":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "resolved":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "refunded":
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "closed":
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
};

const CaseDetailsPage: React.FC = () => {
  const { id: caseId } = useParams();
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

  if (loading && !caseDetails) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <LoadingState />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <CaseError errorMessage={error} />
        </div>
      </Layout>
    );
  }

  if (!caseDetails) {
    return (
      <Layout requireAuth={true}>
        <div className="container mx-auto py-8 px-4">
          <CaseNotFound />
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => navigate("/user/cases")}
        >
          Back to Cases
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CaseDetailsHeader 
              caseDetails={caseDetails} 
              getStatusColor={getStatusColor} 
            />
          </CardHeader>
          <CardContent>
            <div className="bg-betting-light-gray p-4 rounded-md mb-6 whitespace-pre-line">
              {caseDetails.description}
            </div>

            <AdminCaseActions
              isAdmin={isAdmin}
              caseDetails={caseDetails}
              handleStatusChange={handleStatusChange}
              canProcessRefund={canProcessRefund}
              setRefundDialogOpen={setRefundDialogOpen}
              caseStatusOptions={caseStatusOptions}
            />

            <RelatedTicketInfo 
              ticketData={ticketData} 
              purchaseData={purchaseData} 
            />

            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Case Discussion</h3>

              <CaseReplies replies={caseDetails.replies || []} />

              {caseDetails.status !== "closed" ? (
                <ReplyForm 
                  caseStatus={caseDetails.status}
                  onSubmit={handleSubmitReply}
                  isLoading={isLoading}
                />
              ) : (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This case is closed. No further replies can be added.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {canProcessRefund && (
          <RefundDialog
            open={refundDialogOpen}
            onOpenChange={setRefundDialogOpen}
            handleRefund={handleRefund}
            isLoading={isLoading}
            purchaseData={purchaseData}
            ticketData={ticketData}
            caseNumber={caseDetails.case_number}
          />
        )}
      </div>
    </Layout>
  );
};

export default CaseDetailsPage;
