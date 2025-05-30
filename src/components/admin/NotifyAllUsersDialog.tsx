
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Loader2, Users } from "lucide-react";

const NotifyAllUsersDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [userType, setUserType] = useState("all");
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

    setLoading(true);
    try {
      let query = supabase.from('profiles').select('id');
      
      // Filter by user type if not "all"
      if (userType === "buyers") {
        query = query.eq('role', 'buyer');
      } else if (userType === "sellers") {
        query = query.eq('role', 'seller').eq('approved', true).eq('suspended', false);
      }

      const { data: users, error: usersError } = await query;

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast.error("No users found to notify");
        setLoading(false);
        return;
      }

      // Create notifications for each user
      const notifications = users.map(user => ({
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        type: 'admin_notification',
        related_id: currentUser.id,
        is_read: false
      }));

      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      toast.success(`Notification sent to ${users.length} user${users.length === 1 ? '' : 's'}`);
      
      // Reset form and close dialog
      setTitle("");
      setMessage("");
      setUserType("all");
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
          <Users className="h-4 w-4" />
          Notify All Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Notification to Users</DialogTitle>
          <DialogDescription>
            Send a system-wide notification to users. They will receive this in their notifications page.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user-type">Send to</Label>
            <Select value={userType} onValueChange={setUserType}>
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="buyers">Buyers Only</SelectItem>
                <SelectItem value="sellers">Sellers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-notification-title">Title</Label>
            <Input
              id="admin-notification-title"
              placeholder="Enter notification title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-notification-message">Message</Label>
            <Textarea
              id="admin-notification-message"
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
              "Send Notification"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotifyAllUsersDialog;
