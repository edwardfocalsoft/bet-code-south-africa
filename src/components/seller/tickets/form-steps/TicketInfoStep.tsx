
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { BettingSite } from "@/types";

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
  onNext,
}) => {
  const ticketTypes = [
    "Standard Ticket",
    "High Stake Ticket",
    "Long Ticket"
  ];
  
  // Using only the values defined in the BettingSite type
  const bettingSites: BettingSite[] = [
    "Betway",
    "HollywoodBets",
    "Supabets",
    "Playa",
    "10bet",
    "Easybet",
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Ticket Type</Label>
        <Select
          value={ticketData.title}
          onValueChange={(value) => setTicketData({...ticketData, title: value})}
        >
          <SelectTrigger 
            id="title" 
            className="bg-betting-black border-betting-light-gray"
          >
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent className="bg-betting-dark-gray text-white border-betting-light-gray">
            {ticketTypes.map(type => (
              <SelectItem key={type} value={type} className="hover:bg-betting-black">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your ticket strategy (BTS, straight wins, corners, 10 minute draws, etc.)"
          className="h-32 bg-betting-black border-betting-light-gray"
          value={ticketData.description}
          onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bettingSite">Betting Site</Label>
        <Select
          value={ticketData.bettingSite}
          onValueChange={(value) => setTicketData({...ticketData, bettingSite: value as BettingSite})}
        >
          <SelectTrigger 
            id="bettingSite" 
            className="bg-betting-black border-betting-light-gray"
          >
            <SelectValue placeholder="Select betting site" />
          </SelectTrigger>
          <SelectContent className="bg-betting-dark-gray text-white border-betting-light-gray">
            {bettingSites.map(site => (
              <SelectItem key={site} value={site} className="hover:bg-betting-black">
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
          Next Step
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TicketInfoStep;
