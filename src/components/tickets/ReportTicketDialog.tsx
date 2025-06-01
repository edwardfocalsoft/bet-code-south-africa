
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCases } from "@/hooks/useCases";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReportTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  purchaseId: string;
}

// Define report reasons
const reportReasons = [
  { id: "incorrect_info", title: "Incorrect Information" },
  { id: "misleading", title: "Misleading Description" },
  { id: "fraud", title: "Potential Fraud" },
  { id: "wrong_odds", title: "Incorrect Odds" },
  { id: "wrong_result", title: "Wrong Result" },
  { id: "other", title: "Other Issue" }
];

const ReportTicketDialog: React.FC<ReportTicketDialogProps> = ({ 
  open, 
  onOpenChange,
  ticketId,
  purchaseId
}) => {
  const navigate = useNavigate();
  const { createCase, isLoading } = useCases();
  const [reportReason, setReportReason] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!reportReason) {
        setError("Please select a reason for your report");
        return;
      }
      
      if (!description || description.length < 5) {
        setError("Please provide a description of at least 5 characters");
        return;
      }
      
      if (description.length > 50) {
        setError("Description must be 50 characters or less");
        return;
      }
      
      // Get the title from the selected reason
      const selectedReason = reportReasons.find(reason => reason.id === reportReason);
      const title = selectedReason ? selectedReason.title : reportReason;
      
      // Create case - using ticket_id instead of ticketId
      const result = await createCase({
        ticket_id: ticketId,
        purchase_id: purchaseId,
        title: `Report: ${title}`,
        description
      });
      
      if (result) {
        toast.success("Report submitted successfully", {
          description: "Your report has been submitted and we will review it shortly."
        });
        
        // Close dialog and navigate to cases page
        onOpenChange(false);
        navigate("/user/cases");
      }
    } catch (error: any) {
      setError(error.message || "Failed to submit report");
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Ticket Issue</DialogTitle>
          <DialogDescription>
            Let us know if you've experienced any issues with this ticket
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="reason">Issue Type</Label>
            <Select value={reportReason} onValueChange={setReportReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map(reason => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Brief Description</Label>
            <Textarea 
              id="description"
              placeholder="Briefly describe your issue (50 characters max)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={50}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/50 characters
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={isLoading || !reportReason || !description}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportTicketDialog;
