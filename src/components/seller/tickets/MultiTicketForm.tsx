
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScanText, Plus, Trash2 } from "lucide-react";
import { BettingSite } from "@/types";
import OCRTicketScanner from "./OCRTicketScanner";

interface SingleTicketData {
  id: string;
  title: string;
  description: string;
  bettingSite: BettingSite;
  price: number;
  isFree: boolean;
  odds: string;
  date: Date;
  time: string;
  ticketCode: string;
  numberOfLegs: number;
}

interface MultiTicketFormProps {
  tickets: SingleTicketData[];
  onAddTicket: () => void;
  onRemoveTicket: (ticketId: string) => void;
  onUpdateTicket: (ticketId: string, updates: Partial<SingleTicketData>) => void;
  onCodeScanned: (code: string) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const BETTING_SITES: BettingSite[] = [
  "Betway", "Supabets", "HollywoodBets", "Playa", "10bet", "Easybet"
];

const MultiTicketForm: React.FC<MultiTicketFormProps> = ({
  tickets,
  onAddTicket,
  onRemoveTicket,
  onUpdateTicket,
  onCodeScanned,
  isScanning,
  setIsScanning,
  startCamera,
  stopCamera,
  videoRef,
}) => {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (ticketId: string, dateString: string) => {
    const newDate = new Date(dateString);
    onUpdateTicket(ticketId, { date: newDate });
  };

  const handleScanClick = () => {
    setIsScanning(true);
  };

  const handleScanClose = () => {
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (isScanning) {
        stopCamera?.();
      }
    };
  }, [isScanning]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2">
        <h3 className="text-lg font-semibold">Multiple Tickets</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={handleScanClick}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <ScanText className="h-4 w-4" />
            Scan Ticket Codes
          </Button>
          <Button
            type="button"
            onClick={onAddTicket}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Ticket
          </Button>
        </div>
      </div>

      <OCRTicketScanner
        isOpen={isScanning}
        onClose={handleScanClose}
        onCodeScanned={onCodeScanned}
      />

      {tickets.length === 0 && !isScanning && (
        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardContent className="pt-6 px-0 sm:px-6">
            <p className="text-center text-muted-foreground text-sm">
              No tickets added yet. Click "Add Ticket" or "Scan Ticket Codes" to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {tickets.map((ticket, index) => (
        <Card key={ticket.id} className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4 px-0 sm:px-6 pt-0 sm:pt-6">
            <CardTitle className="text-base">Ticket {index + 1}</CardTitle>
            {tickets.length > 1 && (
              <Button
                type="button"
                onClick={() => onRemoveTicket(ticket.id)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Remove Ticket</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 px-0 sm:px-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`legs-${ticket.id}`}>Number of Legs *</Label>
                <Input
                  id={`legs-${ticket.id}`}
                  type="number"
                  min="2"
                  value={ticket.numberOfLegs || ""}
                  onChange={(e) => onUpdateTicket(ticket.id, { numberOfLegs: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`title-${ticket.id}`}>Ticket Type *</Label>
                <Input
                  id={`title-${ticket.id}`}
                  value={ticket.title}
                  onChange={(e) => onUpdateTicket(ticket.id, { title: e.target.value })}
                  placeholder="e.g., Daily Multi-Bet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${ticket.id}`}>Description *</Label>
                <Textarea
                  id={`description-${ticket.id}`}
                  value={ticket.description}
                  onChange={(e) => onUpdateTicket(ticket.id, { description: e.target.value })}
                  placeholder="Describe your betting strategy and why this ticket is valuable..."
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`betting-site-${ticket.id}`}>Betting Site *</Label>
                <Select
                  value={ticket.bettingSite}
                  onValueChange={(value: BettingSite) => onUpdateTicket(ticket.id, { bettingSite: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select betting site" />
                  </SelectTrigger>
                  <SelectContent>
                    {BETTING_SITES.map(site => (
                      <SelectItem key={site} value={site}>
                        {site}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`ticket-code-${ticket.id}`}>Ticket Code *</Label>
                <Input
                  id={`ticket-code-${ticket.id}`}
                  value={ticket.ticketCode}
                  onChange={(e) => onUpdateTicket(ticket.id, { ticketCode: e.target.value })}
                  placeholder="Enter or scan ticket code"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`odds-${ticket.id}`}>Total Odds *</Label>
                <Input
                  id={`odds-${ticket.id}`}
                  value={ticket.odds}
                  onChange={(e) => onUpdateTicket(ticket.id, { odds: e.target.value })}
                  placeholder="e.g., 15.50"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`free-${ticket.id}`}
                    checked={ticket.isFree}
                    onCheckedChange={(checked) => onUpdateTicket(ticket.id, { isFree: checked })}
                  />
                  <Label htmlFor={`free-${ticket.id}`}>Free Ticket</Label>
                </div>
                {!ticket.isFree && (
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticket.price || ""}
                    onChange={(e) => onUpdateTicket(ticket.id, { price: parseFloat(e.target.value) || 0 })}
                    placeholder="Price in ZAR"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`date-${ticket.id}`}>Event Date *</Label>
                <Input
                  id={`date-${ticket.id}`}
                  type="date"
                  value={formatDate(ticket.date)}
                  onChange={(e) => handleDateChange(ticket.id, e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`time-${ticket.id}`}>Kickoff Time *</Label>
                <Input
                  id={`time-${ticket.id}`}
                  type="time"
                  value={ticket.time}
                  onChange={(e) => onUpdateTicket(ticket.id, { time: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiTicketForm;
