
import React, { useState } from "react";
import { FilterPopover } from "./filters/FilterPopover";
import { FilterBadges } from "./filters/FilterBadges";

interface BuyersFilterProps {
  onFilterChange: (filters: {
    joinDateRange?: { start: Date | null; end: Date | null };
    minPurchases?: number;
    maxPurchases?: number;
    status?: "verified" | "unverified" | "all";
  }) => void;
}

export const BuyersFilter: React.FC<BuyersFilterProps> = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [minPurchases, setMinPurchases] = useState<string>("");
  const [maxPurchases, setMaxPurchases] = useState<string>("");
  const [status, setStatus] = useState<"verified" | "unverified" | "all">("all");
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleApplyFilters = () => {
    const filters = {
      joinDateRange: { start: startDate, end: endDate },
      minPurchases: minPurchases ? Number(minPurchases) : undefined,
      maxPurchases: maxPurchases ? Number(maxPurchases) : undefined,
      status: status !== "all" ? status : undefined,
    };

    // Count active filters
    let count = 0;
    if (startDate || endDate) count++;
    if (minPurchases) count++;
    if (maxPurchases) count++;
    if (status !== "all") count++;
    
    setActiveFiltersCount(count);
    setIsFiltersApplied(count > 0);
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setMinPurchases("");
    setMaxPurchases("");
    setStatus("all");
    setIsFiltersApplied(false);
    setActiveFiltersCount(0);
    onFilterChange({});
  };

  return (
    <div className="mb-6">
      <FilterPopover
        startDate={startDate}
        endDate={endDate}
        minPurchases={minPurchases}
        maxPurchases={maxPurchases}
        status={status}
        isFiltersApplied={isFiltersApplied}
        activeFiltersCount={activeFiltersCount}
        isOpen={isCalendarOpen}
        onOpenChange={setIsCalendarOpen}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onMinPurchasesChange={setMinPurchases}
        onMaxPurchasesChange={setMaxPurchases}
        onStatusChange={setStatus}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />
      
      <FilterBadges
        isFiltersApplied={isFiltersApplied}
        startDate={startDate}
        endDate={endDate}
        status={status}
        minPurchases={minPurchases}
        maxPurchases={maxPurchases}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};
