
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw } from "lucide-react";

interface CaseActionButtonsProps {
  caseItem: any;
  handleStatusChange: (caseId: string, newStatus: string) => Promise<void>;
}

const CaseActionButtons: React.FC<CaseActionButtonsProps> = ({
  caseItem,
  handleStatusChange,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-2">
      {caseItem.status === "open" && (
        <Button
          variant="outline"
          size="sm"
          className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
          onClick={(e) => {
            e.stopPropagation();
            handleStatusChange(caseItem.id, "in_progress");
          }}
        >
          Process
        </Button>
      )}
      
      {(caseItem.status === "open" || caseItem.status === "in_progress") && (
        <Button
          variant="outline"
          size="sm"
          className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/user/cases/${caseItem.id}?refund=true`);
          }}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refund
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/user/cases/${caseItem.id}`);
        }}
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        View
      </Button>
    </div>
  );
};

export default CaseActionButtons;
