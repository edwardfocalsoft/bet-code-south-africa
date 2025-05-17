
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressStepperProps {
  currentStep: number;
}

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  return (
    <div className="relative">
      <div className="flex justify-between">
        <div className={cn(
          "flex flex-col items-center",
          currentStep >= 1 ? "text-betting-green" : "text-muted-foreground"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
            currentStep >= 1 ? "border-betting-green bg-betting-green/10" : "border-muted-foreground"
          )}>
            {currentStep > 1 ? <Check className="h-5 w-5" /> : "1"}
          </div>
          <span className="text-xs">Ticket Info</span>
        </div>
        
        <div className={cn(
          "flex flex-col items-center",
          currentStep >= 2 ? "text-betting-green" : "text-muted-foreground"
        )}>
          <div className={cn(
            "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
            currentStep >= 2 ? "border-betting-green bg-betting-green/10" : "border-muted-foreground"
          )}>
            2
          </div>
          <span className="text-xs">Details & Pricing</span>
        </div>
      </div>
      
      <div className="absolute top-5 left-0 w-full">
        <div className={cn(
          "h-0.5 w-full bg-muted-foreground",
          currentStep >= 2 ? "bg-betting-green" : "bg-muted-foreground"
        )}></div>
      </div>
    </div>
  );
};

export default ProgressStepper;
