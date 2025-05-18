
import { useCaseList } from "./data/useCaseList";
import { useCaseDetails } from "./data/useCaseDetails";

export const useCaseFetching = () => {
  const { 
    userCases, 
    refetchCases, 
    isCasesLoading, 
    isLoading: isListLoading 
  } = useCaseList();
  
  const {
    fetchCaseDetails,
    isLoading: isDetailsLoading,
    safeProfileData
  } = useCaseDetails();

  const isLoading = isListLoading || isDetailsLoading;

  return {
    userCases,
    fetchCaseDetails,
    isLoading,
    isCasesLoading,
    refetchCases,
    safeProfileData
  };
};
