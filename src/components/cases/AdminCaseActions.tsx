
import React from 'react';
import { RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AdminCaseActionsProps {
  isAdmin: boolean;
  caseDetails: any;
  handleStatusChange: (newStatus: string) => void;
  canProcessRefund: boolean;
  setRefundDialogOpen: (open: boolean) => void;
  caseStatusOptions: { value: string; label: string }[];
}

const AdminCaseActions: React.FC<AdminCaseActionsProps> = ({
  isAdmin,
  caseDetails,
  handleStatusChange,
  canProcessRefund,
  setRefundDialogOpen,
  caseStatusOptions
}) => {
  if (!isAdmin) return null;
  
  return (
    <div className="bg-betting-dark-gray/50 p-4 rounded-md mb-6">
      <h3 className="font-bold mb-2">Admin Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Select
          value={caseDetails.status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            {caseStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canProcessRefund && (
          <Button
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20"
            onClick={() => setRefundDialogOpen(true)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Process Refund
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminCaseActions;
