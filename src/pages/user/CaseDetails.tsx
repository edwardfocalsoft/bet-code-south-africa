
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useCaseDetailsView } from "@/hooks/cases/views/useCaseDetailsView";

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
  const {
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
  } = useCaseDetailsView(caseId);

  // Case status options
  const caseStatusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "refunded", label: "Refunded" },
    { value: "closed", label: "Closed" },
  ];

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
          <CardContent className="pt-6">
            <CaseDetailsHeader 
              caseDetails={caseDetails} 
              getStatusColor={getStatusColor} 
            />

            <div className="bg-betting-light-gray p-4 rounded-md mb-6 mt-4 whitespace-pre-line">
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
                  isLoading={loading}
                />
              ) : (
                <CaseClosedAlert />
              )}
            </div>
          </CardContent>
        </Card>

        {canProcessRefund && (
          <RefundDialog
            open={refundDialogOpen}
            onOpenChange={setRefundDialogOpen}
            handleRefund={handleRefund}
            isLoading={loading}
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
