
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2 } from "lucide-react";

interface NotifySubscribersDialogProps {
  subscribersCount: number;
}

const NotifySubscribersDialog: React.FC<NotifySubscribersDialogProps> = ({
  subscribersCount
}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleSendNotification = async () => {
    if (!currentUser?.id) {
      toast.error("You must be logged in to send notifications");
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message");
      return;
    }

    if (subscribersCount === 0) {
      toast.error("You have no subscribers to notify");
      return;
    }

    setLoading(true);
    try {
      // Get all subscribers of this seller
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscriptions')
        .select('buyer_id')
        .eq('seller_id', currentUser.id);

      if (subscribersError) throw subscribersError;

      if (!subscribers || subscribers.length === 0) {
        toast.error("No subscribers found");
        setLoading(false);
        return;
      }

      // Create notifications for each subscriber
      const notifications = subscribers.map(subscription => ({
        user_id: subscription.buyer_id,
        title: title.trim(),
        message: message.trim(),
        type: 'seller_notification',
        related_id: currentUser.id,
        is_read: false
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      toast.success(`Notification sent to ${subscribers.length} subscriber${subscribers.length === 1 ? '' : 's'}`);
      
      // Reset form and close dialog
      setTitle("");
      setMessage("");
      setOpen(false);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notify Subscribers
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Notify All Subscribers</DialogTitle>
          <DialogDescription>
            Send a notification to all {subscribersCount} of your subscribers. They will receive this in their notifications page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="notification-title">Title</Label>
            <Input
              id="notification-title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="notification-message">Message</Label>
            <Textarea
              id="notification-message"
              placeholder="Enter your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSendNotification}
            disabled={loading || !title.trim() || !message.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              `Send to ${subscribersCount} Subscribers`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotifySubscribersDialog;
