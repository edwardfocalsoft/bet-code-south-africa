
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Loader2, TicketIcon } from "lucide-react";
import { BettingSite } from "@/types";

interface TicketDetailsStepProps {
  ticketData: {
    price: number;
    isFree: boolean;
    odds: string;
    date: Date;
    time: string;
    ticketCode: string;
  };
  setTicketData: React.Dispatch<React.SetStateAction<any>>;
  errors: {
    price: string;
    odds: string;
    date: string;
    time: string;
    ticketCode: string;
  };
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  showPreview: () => void;
}

const TicketDetailsStep: React.FC<TicketDetailsStepProps> = ({
  ticketData,
  setTicketData,
  errors,
  onPrev,
  onSubmit,
  isSubmitting,
  showPreview
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="free-ticket">Free Ticket</Label>
          <p className="text-xs text-muted-foreground">Offer this ticket for free</p>
        </div>
        <Switch 
          id="free-ticket" 
          checked={ticketData.isFree}
          onCheckedChange={(checked) => setTicketData({...ticketData, isFree: checked})}
        />
      </div>
      
      {!ticketData.isFree && (
        <div className="space-y-2">
          <Label htmlFor="price">
            Ticket Price (ZAR)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-3 h-4 w-4 text-muted-foreground">R</span>
            <Input
              id="price"
              type="number"
              min="0"
              step="5"
              placeholder="50"
              value={ticketData.price}
              onChange={(e) => setTicketData({...ticketData, price: parseFloat(e.target.value)})}
              className="bg-betting-black border-betting-light-gray pl-10"
            />
          </div>
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="ticketCode">
          Ticket Code
        </Label>
        <div className="relative">
          <TicketIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="ticketCode"
            placeholder="Enter unique ticket code"
            value={ticketData.ticketCode}
            onChange={(e) => setTicketData({...ticketData, ticketCode: e.target.value})}
            className="bg-betting-black border-betting-light-gray pl-10"
          />
        </div>
        {errors.ticketCode && <p className="text-red-500 text-xs mt-1">{errors.ticketCode}</p>}
        <p className="text-xs text-muted-foreground">
          This code will be partially hidden from public view. Only buyers will see the full code.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="odds">
          Total Odds
        </Label>
        <Input 
          id="odds"
          placeholder="e.g. 2.5"
          value={ticketData.odds}
          onChange={(e) => setTicketData({...ticketData, odds: e.target.value})}
          className="bg-betting-black border-betting-light-gray"
        />
        {errors.odds && <p className="text-red-500 text-xs mt-1">{errors.odds}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kick-Off Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-betting-black border-betting-light-gray",
                  !ticketData.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {ticketData.date ? format(ticketData.date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={ticketData.date}
                onSelect={(date) => date && setTicketData({...ticketData, date})}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Kick-Off Time</Label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="time"
              type="time"
              value={ticketData.time}
              onChange={(e) => setTicketData({...ticketData, time: e.target.value})}
              className="bg-betting-black border-betting-light-gray pl-10"
            />
          </div>
          {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
        >
          Back
        </Button>

        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={showPreview}
            className="bg-betting-dark-gray border-betting-light-gray"
          >
            Preview
          </Button>
          
          <Button
            onClick={onSubmit}
            className="bg-betting-green hover:bg-betting-green-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Ticket"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsStep;
