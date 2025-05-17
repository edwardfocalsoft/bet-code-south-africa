
import React, { useState } from "react";
import { Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
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
              <div className="grid gap-1">
                <Label htmlFor="date">Joined Between</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                        disabled={!startDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP")
                        ) : (
                          <span>Start Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate || undefined}
                        onSelect={(date) => setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className="w-full justify-start text-left font-normal"
                        disabled={!endDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP")
                        ) : (
                          <span>End Date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate || undefined}
                        onSelect={(date) => setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as any)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor="purchases">Purchases</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      id="minPurchases"
                      type="number"
                      placeholder="Min"
                      value={minPurchases}
                      onChange={(e) => setMinPurchases(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Input
                      id="maxPurchases"
                      type="number" 
                      placeholder="Max"
                      value={maxPurchases}
                      onChange={(e) => setMaxPurchases(e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                className="w-full" 
                onClick={() => {
                  handleApplyFilters();
                  setIsCalendarOpen(false);
                }}
              >
                Apply Filters
              </Button>
              {isFiltersApplied && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleResetFilters}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {isFiltersApplied && (
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
            onClick={handleResetFilters}
          >
            <X className="h-3 w-3" /> Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};
