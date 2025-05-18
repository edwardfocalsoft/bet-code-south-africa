
import React from 'react';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardDescription, CardTitle } from "@/components/ui/card";

interface CaseDetailsHeaderProps {
  caseDetails: any;
  getStatusColor: (status: string) => string;
}

const CaseDetailsHeader: React.FC<CaseDetailsHeaderProps> = ({
  caseDetails,
  getStatusColor
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-2xl">
          {caseDetails.title}
          {caseDetails.case_number && (
            <span className="text-sm text-muted-foreground ml-2">
              (#{caseDetails.case_number})
            </span>
          )}
        </CardTitle>
        <CardDescription className="mt-2 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {format(new Date(caseDetails.created_at), "PPP p")}
        </CardDescription>
      </div>
      <Badge
        variant="outline"
        className={getStatusColor(caseDetails.status)}
      >
        {caseDetails.status.charAt(0).toUpperCase() +
          caseDetails.status.slice(1).replace('_', ' ')}
      </Badge>
    </div>
  );
};

export default CaseDetailsHeader;
