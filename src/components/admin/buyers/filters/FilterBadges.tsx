
import React from "react";
import { format } from "date-fns";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FilterBadgesProps {
  isFiltersApplied: boolean;
  startDate: Date | null;
  endDate: Date | null;
  status: "verified" | "unverified" | "all";
  minPurchases: string;
  maxPurchases: string;
  onResetFilters: () => void;
}

export const FilterBadges: React.FC<FilterBadgesProps> = ({
  isFiltersApplied,
  startDate,
  endDate,
  status,
  minPurchases,
  maxPurchases,
  onResetFilters,
}) => {
  if (!isFiltersApplied) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {(startDate || endDate) && (
        <Badge variant="secondary">
          Date: {startDate ? format(startDate, "MMM d, yyyy") : "Any"} - {endDate ? format(endDate, "MMM d, yyyy") : "Any"}
        </Badge>
      )}
      {status !== "all" && (
        <Badge variant="secondary">
          Status: {status === "verified" ? "Verified" : "Unverified"}
        </Badge>
      )}
      {minPurchases && (
        <Badge variant="secondary">
          Min Purchases: {minPurchases}
        </Badge>
      )}
      {maxPurchases && (
        <Badge variant="secondary">
          Max Purchases: {maxPurchases}
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 px-2 text-xs"
        onClick={onResetFilters}
      >
        <X className="h-3 w-3" /> Clear filters
      </Button>
    </div>
  );
};
