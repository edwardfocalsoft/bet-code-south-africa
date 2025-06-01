
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CaseDetailsHeader from "@/components/cases/CaseDetailsHeader";
import CaseReplies from "@/components/cases/CaseReplies";
import CaseError from "@/components/cases/CaseError";
import CaseNotFound from "@/components/cases/CaseNotFound";
import LoadingState from "@/components/cases/LoadingState";
import ReplyForm from "@/components/cases/ReplyForm";
import RelatedTicketInfo from "@/components/cases/RelatedTicketInfo";
import CaseClosedAlert from "@/components/cases/CaseClosedAlert";
import AdminCaseActions from "@/components/cases/AdminCaseActions";
import { useCaseDetailsView } from "@/hooks/cases/views/useCaseDetailsView";
import RefundDialog from "@/components/cases/RefundDialog";

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>();
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
    isAdmin,
  } = useCaseDetailsView(caseId);

  const [currentPage, setCurrentPage] = useState(1);
  const repliesPerPage = 5;

  // If still loading
  if (loading) return <Layout requireAuth={true}><LoadingState /></Layout>;

  // If there was an error
  if (error) return <Layout requireAuth={true}><CaseError error={error} /></Layout>;

  // If case was not found
  if (!caseDetails) return <Layout requireAuth={true}><CaseNotFound /></Layout>;

  // Calculate pagination for replies
  const totalReplies = caseDetails?.replies?.length || 0;
  const totalPages = Math.ceil(totalReplies / repliesPerPage);
  const indexOfLastReply = currentPage * repliesPerPage;
  const indexOfFirstReply = indexOfLastReply - repliesPerPage;
  const currentReplies = caseDetails?.replies?.slice(indexOfFirstReply, indexOfLastReply) || [];
  
  // Status options for admin
  const caseStatusOptions = [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Boolean check for whether the case is closed or resolved
  const isCaseClosed = 
    caseDetails.status === "closed" || 
    caseDetails.status === "resolved";

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8">
        <CaseDetailsHeader 
          caseNumber={caseDetails.case_number} 
          title={caseDetails.title}
          status={caseDetails.status}
          createdAt={caseDetails.created_at}
        />

        <AdminCaseActions 
          isAdmin={isAdmin}
          caseDetails={caseDetails}
          handleStatusChange={handleStatusChange}
          canProcessRefund={canProcessRefund}
          setRefundDialogOpen={setRefundDialogOpen}
          caseStatusOptions={caseStatusOptions}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-betting-dark-gray rounded-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-3">Description</h3>
              <p className="whitespace-pre-line">{caseDetails.description}</p>
            </div>

            {isCaseClosed && (
              <CaseClosedAlert status={caseDetails.status} />
            )}

            <CaseReplies 
              replies={currentReplies} 
              totalReplies={totalReplies}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />

            {!isCaseClosed && (
              <ReplyForm 
                onSubmit={handleSubmitReply}
                isLoading={loading}
                caseStatus={caseDetails.status} 
              />
            )}
          </div>

          <div>
            {(ticketData || purchaseData) && (
              <RelatedTicketInfo 
                ticketData={ticketData} 
                purchaseData={purchaseData}
              />
            )}
          </div>
        </div>

        {refundDialogOpen && purchaseData && (
          <RefundDialog 
            open={refundDialogOpen}
            onOpenChange={setRefundDialogOpen}
            caseId={caseId || ''}
            purchaseId={purchaseData.id}
            buyerId={purchaseData.buyer_id}
            sellerId={purchaseData.seller_id}
            amount={purchaseData.price}
            onRefundComplete={handleRefund}
          />
        )}
      </div>
    </Layout>
  );
};

export default CaseDetails;
