
import React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { DateRangeFilter } from "./DateRangeFilter";
import { StatusFilter } from "./StatusFilter";
import { PurchasesRangeFilter } from "./PurchasesRangeFilter";

interface FilterPopoverProps {
  startDate: Date | null;
  endDate: Date | null;
  minPurchases: string;
  maxPurchases: string;
  status: "verified" | "unverified" | "all";
  isFiltersApplied: boolean;
  activeFiltersCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onMinPurchasesChange: (value: string) => void;
  onMaxPurchasesChange: (value: string) => void;
  onStatusChange: (status: "verified" | "unverified" | "all") => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  startDate,
  endDate,
  minPurchases,
  maxPurchases,
  status,
  isFiltersApplied,
  activeFiltersCount,
  isOpen,
  onOpenChange,
  onStartDateChange,
  onEndDateChange,
  onMinPurchasesChange,
  onMaxPurchasesChange,
  onStatusChange,
  onApplyFilters,
  onResetFilters,
}) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 border-dashed"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 rounded-sm px-1 font-normal lg:hidden"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={onStartDateChange}
              onEndDateChange={onEndDateChange}
            />
            
            <StatusFilter 
              value={status}
              onChange={onStatusChange}
            />
            
            <PurchasesRangeFilter
              minPurchases={minPurchases}
              maxPurchases={maxPurchases}
              onMinPurchasesChange={onMinPurchasesChange}
              onMaxPurchasesChange={onMaxPurchasesChange}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              className="w-full" 
              onClick={() => {
                onApplyFilters();
                onOpenChange(false);
              }}
            >
              Apply Filters
            </Button>
            {isFiltersApplied && (
              <Button
                variant="outline"
                size="icon"
                onClick={onResetFilters}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
