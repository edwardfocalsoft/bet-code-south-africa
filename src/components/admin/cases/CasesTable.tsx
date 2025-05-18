
import React from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CaseActionButtons from "./CaseActionButtons";
import LoadingState from "@/components/cases/LoadingState";

interface CasesTableProps {
  filteredCases: any[];
  userCases: any[] | null;
  isLoading: boolean;
  isCasesLoading: boolean;
  handleStatusChange: (caseId: string, newStatus: string) => Promise<void>;
  getStatusColor: (status: string) => string;
}

const CasesTable: React.FC<CasesTableProps> = ({
  filteredCases,
  userCases,
  isLoading,
  isCasesLoading,
  handleStatusChange,
  getStatusColor,
}) => {
  const navigate = useNavigate();

  // Helper function to safely get profile name
  const getProfileName = (profile: any): string => {
    if (!profile) return 'Unknown User';
    if (profile.error) return 'Unknown User';
    return profile.username || profile.email || 'Unknown User';
  };

  if (isLoading || isCasesLoading) {
    return <LoadingState />;
  }

  if (!filteredCases || filteredCases.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg font-medium mb-2">No cases found</p>
        <p className="text-muted-foreground">
          {userCases && userCases.length > 0
            ? "No cases match your search criteria. Try adjusting your filters."
            : "There are no support cases in the system."}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>
        Support case list {filteredCases.length < (userCases?.length || 0) ? `(${filteredCases.length} of ${userCases?.length})` : ''}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Case #</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredCases.map((caseItem: any) => (
          <TableRow 
            key={caseItem.id} 
            className="cursor-pointer hover:bg-betting-light-gray/10" 
            onClick={() => navigate(`/user/cases/${caseItem.id}`)}
          >
            <TableCell className="font-medium">{caseItem.case_number || 'N/A'}</TableCell>
            <TableCell>{caseItem.title || 'No title'}</TableCell>
            <TableCell>{getProfileName(caseItem.profiles)}</TableCell>
            <TableCell>{caseItem.created_at ? format(new Date(caseItem.created_at), "PPP") : 'Unknown date'}</TableCell>
            <TableCell>
              <Badge 
                variant="outline" 
                className={getStatusColor(caseItem.status)}
              >
                {caseItem.status ? caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1).replace('_', ' ') : 'Unknown'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <CaseActionButtons
                caseItem={caseItem}
                handleStatusChange={handleStatusChange}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CasesTable;
