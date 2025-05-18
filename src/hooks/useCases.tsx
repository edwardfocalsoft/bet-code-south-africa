
import { useCaseFetching } from "./cases/useCaseFetching";
import { useCaseOperations } from "./cases/useCaseOperations";

export const useCases = () => {
  const { 
    userCases, 
    fetchCaseDetails, 
    isLoading: isFetchingLoading, 
    isCasesLoading, 
    refetchCases 
  } = useCaseFetching();
  
  const {
    createCase,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading: isOperationLoading
  } = useCaseOperations();

  // Combined loading state
  const isLoading = isFetchingLoading || isOperationLoading;

  return {
    userCases,
    fetchCaseDetails,
    createCase,
    addReply,
    updateCaseStatus,
    processRefund,
    isLoading,
    isCasesLoading,
    refetchCases
  };
};
