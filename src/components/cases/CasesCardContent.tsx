
import React from "react";
import { useCases } from "@/hooks/useCases";
import CasesList from "./CasesList";
import EmptyCasesState from "./EmptyCasesState";

const CasesCardContent: React.FC = () => {
  const { userCases, isLoading } = useCases();

  if (isLoading) {
    return (
      <CasesList userCases={null} isLoading={true} />
    );
  }

  if (!userCases || userCases.length === 0) {
    return <EmptyCasesState />;
  }

  return <CasesList userCases={userCases} isLoading={false} />;
};

export default CasesCardContent;
