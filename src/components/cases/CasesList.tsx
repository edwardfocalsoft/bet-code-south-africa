
import React from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Loader2 } from "lucide-react";

interface Case {
  id: string;
  case_number: string;
  title: string;
  created_at: string;
  status: string;
  [key: string]: any;
}

interface CasesListProps {
  userCases: Case[] | null;
  isLoading: boolean;
}

const CasesList: React.FC<CasesListProps> = ({ userCases, isLoading }) => {
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-betting-green" />
      </div>
    );
  }

  if (!userCases || userCases.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableCaption>Your support case history</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Case #</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userCases.map((caseItem) => (
          <TableRow
            key={caseItem.id}
            className="cursor-pointer hover:bg-betting-light-gray/10"
            onClick={() => navigate(`/user/cases/${caseItem.id}`)}
          >
            <TableCell className="font-medium">{caseItem.case_number}</TableCell>
            <TableCell>{caseItem.title}</TableCell>
            <TableCell>
              {format(new Date(caseItem.created_at), "PPP")}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={getStatusColor(caseItem.status)}>
                {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/user/cases/${caseItem.id}`);
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CasesList;
