
import React, { useState } from "react";
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
import { AlertCircle, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

interface RateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  sellerId: string;
  buyerId: string;
  purchaseId: string;
  onSuccess?: () => void;
}

const RateTicketDialog: React.FC<RateTicketDialogProps> = ({ 
  open, 
  onOpenChange,
  ticketId,
  sellerId,
  buyerId,
  purchaseId,
  onSuccess
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    try {
      if (rating === 0) {
        setError("Please select a rating");
        return;
      }
      
      if (isWinner === null) {
        setError("Please select whether the ticket won or lost");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Submit rating to the database
      const { error: ratingError } = await supabase
        .from('ratings')
        .insert({
          seller_id: sellerId,
          buyer_id: buyerId,
          ticket_id: ticketId,
          score: rating,
          comment: comment || null
        });
        
      if (ratingError) {
        throw ratingError;
      }
      
      // Mark the purchase as rated and update the win/loss status
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({ 
          is_rated: true,
          is_winner: isWinner 
        })
        .eq('id', purchaseId);
        
      if (purchaseError) {
        throw purchaseError;
      }
      
      toast.success("Rating submitted successfully", {
        description: "Thank you for rating this ticket!"
      });
      
      // Close dialog
      onOpenChange(false);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      setError(error.message || "Failed to submit rating");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Ticket</DialogTitle>
          <DialogDescription>
            Rate your experience with this ticket and help other users make informed decisions
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
            <Label>Ticket Result</Label>
            <RadioGroup 
              onValueChange={(value) => setIsWinner(value === 'win')} 
              className="flex space-x-4"
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="win" id="win" />
                <Label htmlFor="win" className="font-normal cursor-pointer">
                  Win
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loss" id="loss" />
                <Label htmlFor="loss" className="font-normal cursor-pointer">
                  Loss
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comments (Optional)</Label>
            <Textarea 
              id="comment"
              placeholder="Share your experience with this ticket"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
              rows={3}
            />
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
            disabled={isLoading || rating === 0 || isWinner === null}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateTicketDialog;
