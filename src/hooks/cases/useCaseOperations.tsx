
import { useState } from "react";
import { useCaseCreate } from "./operations/useCaseCreate";
import { useCaseReply } from "./operations/useCaseReply";
import { useCaseStatus } from "./operations/useCaseStatus";
import { useCaseRefund } from "./operations/useCaseRefund";

export const useCaseOperations = () => {
  const { createCase, isLoading: isCreateLoading } = useCaseCreate();
  const { addReply, isLoading: isReplyLoading } = useCaseReply();
  const { updateCaseStatus, isLoading: isStatusLoading } = useCaseStatus();
  const { processRefund, isLoading: isRefundLoading } = useCaseRefund();
  
  // Combined loading state
  const isLoading = isCreateLoading || isReplyLoading || isStatusLoading || isRefundLoading;

  return {
    createCase,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading
  };
};
