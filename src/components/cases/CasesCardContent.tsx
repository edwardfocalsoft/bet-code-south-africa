
import React, { useState } from "react";
import { useCases } from "@/hooks/useCases";
import CasesList from "./CasesList";
import EmptyCasesState from "./EmptyCasesState";
import { Button } from "@/components/ui/button";
import { SearchIcon, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CasesCardContent: React.FC = () => {
  const { userCases, isLoading } = useCases();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter cases based on search query and status filter
  const filteredCases = userCases?.filter(caseItem => {
    const matchesSearch = 
      searchQuery === "" || 
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (caseItem.case_number && caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === "all" || 
      caseItem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <CasesList userCases={null} isLoading={true} />
    );
  }

  if (!userCases || userCases.length === 0) {
    return <EmptyCasesState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredCases && filteredCases.length > 0 ? (
        <CasesList userCases={filteredCases} isLoading={false} />
      ) : (
        <div className="text-center py-6 bg-betting-dark-gray/20 rounded-md">
          <p className="text-muted-foreground">No cases match your search criteria</p>
          <Button 
            variant="outline"
            className="mt-2"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CasesCardContent;
