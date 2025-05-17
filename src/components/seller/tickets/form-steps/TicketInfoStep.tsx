
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { BettingSite } from "@/types";

// Constants for select options
const bettingSites: BettingSite[] = [
  "Betway",
  "HollywoodBets",
  "Supabets",
  "Playa",
  "10bet",
  "Easybet",
];

const ticketTypes = [
  "Standard Ticket",
  "High Stake Ticket",
  "Long Ticket",
];

interface TicketInfoStepProps {
  ticketData: {
    title: string;
    description: string;
    bettingSite: BettingSite;
  };
  setTicketData: React.Dispatch<React.SetStateAction<any>>;
  errors: {
    title: string;
    description: string;
    bettingSite: string;
  };
  onNext: () => void;
}

const TicketInfoStep: React.FC<TicketInfoStepProps> = ({
  ticketData,
  setTicketData,
  errors,
  onNext
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Ticket Type
        </Label>
        <Select
          value={ticketData.title}
          onValueChange={(value) => setTicketData({...ticketData, title: value})}
        >
          <SelectTrigger id="title" className="bg-betting-black border-betting-light-gray">
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            {ticketTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">
          Description
        </Label>
        <Textarea 
          id="description"
          placeholder="Describe your ticket strategy: BTS, straight wins, corners, 10 minute draws, etc."
          value={ticketData.description}
          onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
          className="bg-betting-black border-betting-light-gray min-h-[120px]"
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="betting-site">
          Betting Site
        </Label>
        <Select
          value={ticketData.bettingSite}
          onValueChange={(value) => setTicketData({...ticketData, bettingSite: value as BettingSite})}
        >
          <SelectTrigger id="betting-site" className="bg-betting-black border-betting-light-gray">
            <SelectValue placeholder="Select betting site" />
          </SelectTrigger>
          <SelectContent>
            {bettingSites.map((site) => (
              <SelectItem key={site} value={site}>
                {site}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.bettingSite && <p className="text-red-500 text-xs mt-1">{errors.bettingSite}</p>}
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button
          onClick={onNext}
          className="bg-betting-green hover:bg-betting-green-dark"
        >
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TicketInfoStep;
