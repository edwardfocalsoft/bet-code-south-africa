
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PurchasesRangeFilterProps {
  minPurchases: string;
  maxPurchases: string;
  onMinPurchasesChange: (value: string) => void;
  onMaxPurchasesChange: (value: string) => void;
}

export const PurchasesRangeFilter: React.FC<PurchasesRangeFilterProps> = ({
  minPurchases,
  maxPurchases,
  onMinPurchasesChange,
  onMaxPurchasesChange,
}) => {
  return (
    <div className="grid gap-1">
      <Label htmlFor="purchases">Purchases</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Input
            id="minPurchases"
            type="number"
            placeholder="Min"
            value={minPurchases}
            onChange={(e) => onMinPurchasesChange(e.target.value)}
            className="h-8"
          />
        </div>
        <div>
          <Input
            id="maxPurchases"
            type="number" 
            placeholder="Max"
            value={maxPurchases}
            onChange={(e) => onMaxPurchasesChange(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};
