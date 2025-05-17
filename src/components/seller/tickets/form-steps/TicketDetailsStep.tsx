
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Loader2, DollarSign } from "lucide-react";
import { BettingSite } from "@/types";

interface TicketDetailsStepProps {
  ticketData: {
    price: number;
    isFree: boolean;
    odds: string;
    date: Date;
    time: string;
  };
  setTicketData: React.Dispatch<React.SetStateAction<any>>;
  errors: {
    price: string;
    odds: string;
    date: string;
    time: string;
  };
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const TicketDetailsStep: React.FC<TicketDetailsStepProps> = ({
  ticketData,
  setTicketData,
  errors,
  onPrev,
  onSubmit,
  isSubmitting
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
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
          <Label>Event Date</Label>
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
              />
            </PopoverContent>
          </Popover>
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time">Event Time</Label>
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
        
        <Button
          onClick={onSubmit}
          className="bg-betting-green hover:bg-betting-green-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Ticket"
          )}
        </Button>
      </div>
    </div>
  );
};

export default TicketDetailsStep;
