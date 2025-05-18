
import React, { useState, useEffect } from "react";
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
import { createNotification } from "@/utils/notificationUtils";

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
  const [existingRating, setExistingRating] = useState<boolean>(false);
  
  // Check if the user has already rated this ticket
  useEffect(() => {
    if (open && buyerId && ticketId) {
      const checkExistingRating = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('ratings')
            .select('id')
            .eq('buyer_id', buyerId)
            .eq('ticket_id', ticketId)
            .maybeSingle();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setExistingRating(true);
            setError("You have already rated this ticket. Ratings cannot be edited or removed.");
          } else {
            setExistingRating(false);
            setError(null);
          }
        } catch (err: any) {
          console.error("Error checking existing rating:", err);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkExistingRating();
    }
  }, [open, buyerId, ticketId]);
  
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
      
      // Check for existing rating again before submission
      const { data: existingData, error: existingError } = await supabase
        .from('ratings')
        .select('id')
        .eq('buyer_id', buyerId)
        .eq('ticket_id', ticketId)
        .maybeSingle();
        
      if (existingError) {
        throw existingError;
      }
      
      if (existingData) {
        setExistingRating(true);
        setError("You have already rated this ticket. Ratings cannot be edited or removed.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Begin transaction with both operations
      let success = true;
      
      // 1. Submit rating to the database
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
        success = false;
        throw ratingError;
      }
      
      // 2. Mark the purchase as rated and update the win/loss status
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({ 
          is_rated: true,
          is_winner: isWinner 
        })
        .eq('id', purchaseId);
        
      if (purchaseError) {
        success = false;
        throw purchaseError;
      }
      
      // If successful, create a notification for the seller
      if (success) {
        try {
          await createNotification(
            sellerId,
            "New Rating Received",
            `Your ticket received a ${rating}-star rating`,
            "ticket",
            ticketId
          );
        } catch (notifError) {
          console.error("Failed to send notification:", notifError);
          // Non-blocking error, continue with success flow
        }
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
          <Alert variant={existingRating ? "default" : "destructive"}>
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
              disabled={existingRating || isLoading}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="win" id="win" disabled={existingRating || isLoading} />
                <Label htmlFor="win" className={`font-normal cursor-pointer ${existingRating || isLoading ? "opacity-50" : ""}`}>
                  Win
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="loss" id="loss" disabled={existingRating || isLoading} />
                <Label htmlFor="loss" className={`font-normal cursor-pointer ${existingRating || isLoading ? "opacity-50" : ""}`}>
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
                  onClick={() => !existingRating && !isLoading && setRating(star)}
                  className={`focus:outline-none ${existingRating || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={existingRating || isLoading}
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
              disabled={existingRating || isLoading}
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
            disabled={isLoading || rating === 0 || isWinner === null || existingRating}
            className="bg-betting-green hover:bg-betting-green-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              existingRating ? "Already Rated" : "Submit Rating"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RateTicketDialog;
