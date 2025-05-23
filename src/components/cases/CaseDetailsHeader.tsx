
import React from 'react';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CardDescription, CardTitle } from "@/components/ui/card";

interface CaseDetailsHeaderProps {
  caseNumber: string;
  title: string;
  status: string;
  createdAt: string;
}

const CaseDetailsHeader: React.FC<CaseDetailsHeaderProps> = ({
  caseNumber,
  title,
  status,
  createdAt
}) => {
  // Function to determine status color based on status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "open":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "resolved":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "closed":
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-2xl">
          {title}
          {caseNumber && (
            <span className="text-sm text-muted-foreground ml-2">
              (#{caseNumber})
            </span>
          )}
        </CardTitle>
        <CardDescription className="mt-2 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {format(new Date(createdAt), "PPP p")}
        </CardDescription>
      </div>
      <Badge
        variant="outline"
        className={getStatusColor(status)}
      >
        {status.charAt(0).toUpperCase() +
          status.slice(1).replace('_', ' ')}
      </Badge>
    </div>
  );
};

export default CaseDetailsHeader;
