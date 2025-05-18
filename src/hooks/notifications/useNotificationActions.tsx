
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { deleteOldNotifications } from "@/utils/sqlFunctions";

export function useNotificationActions() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!currentUser) return;

      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId) as {
            error: any;
          };

        if (error) throw error;
        
        return true;
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to update notification.",
          variant: "destructive",
        });
        return false;
      }
    },
    [currentUser, toast]
  );

  const markAllAsRead = useCallback(
    async () => {
      if (!currentUser) return false;

      try {
        setLoading(true);
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', currentUser.id)
          .eq('is_read', false) as {
            error: any;
          };

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "All notifications marked as read.",
        });
        
        return true;
      } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        toast({
          title: "Error",
          description: "Failed to update notifications.",
          variant: "destructive",
        });
        return false;
      } finally {
        setLoading(false);
      }
    }, 
    [currentUser, toast]
  );

  const cleanupOldNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      // Call the utility function to delete old notifications for the current user
      const deletedCount = await deleteOldNotifications(currentUser.id);
      
      if (deletedCount && deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old notifications`);
        
        toast({
          title: "Success",
          description: `Deleted ${deletedCount} old notifications.`,
        });
      } else if (deletedCount === 0) {
        toast({
          title: "Info",
          description: "No old notifications to clean up.",
        });
      }
      
      return deletedCount;
    } catch (error: any) {
      console.error("Error cleaning up old notifications:", error);
      toast({
        title: "Error",
        description: "Failed to clean up old notifications.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  return {
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications,
    loading,
  };
}
