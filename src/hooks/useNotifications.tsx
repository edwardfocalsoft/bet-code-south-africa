import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: "subscription" | "ticket" | "system" | "free_ticket";
  relatedId?: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use generic type as the notifications table isn't in the generated types yet
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false }) as {
          data: any[];
          error: any;
        };

      if (fetchError) throw fetchError;

      const mappedNotifications = data.map((notification: any) => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        type: notification.type,
        relatedId: notification.related_id,
      }));

      setNotifications(mappedNotifications);
      const unread = mappedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      setError(error.message || "Failed to fetch notifications");
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const cleanupOldNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Call the database function to delete old notifications
      const { data, error } = await supabase
        .rpc('delete_old_notifications') as {
          data: number;
          error: any;
        };

      if (error) throw error;
      
      if (data > 0) {
        console.log(`Cleaned up ${data} old notifications`);
        // Refresh the notifications list
        fetchNotifications();
      }
    } catch (error: any) {
      console.error("Error cleaning up old notifications:", error);
    }
  }, [currentUser, fetchNotifications]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!currentUser) return;

      try {
        // Use generic type as the notifications table isn't in the generated types yet
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId) as {
            error: any;
          };

        if (error) throw error;

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        
        // Decrement unread count
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (error: any) {
        console.error("Error marking notification as read:", error);
        toast({
          title: "Error",
          description: "Failed to update notification.",
          variant: "destructive",
        });
      }
    },
    [currentUser, toast]
  );

  const markAllAsRead = useCallback(
    async () => {
      if (!currentUser || notifications.length === 0) return;

      try {
        // Use generic type as the notifications table isn't in the generated types yet
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', currentUser.id)
          .eq('is_read', false) as {
            error: any;
          };

        if (error) throw error;

        // Update all notifications to read in local state
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        
        // Reset unread count
        setUnreadCount(0);
        
        toast({
          title: "Success",
          description: "All notifications marked as read.",
        });
      } catch (error: any) {
        console.error("Error marking all notifications as read:", error);
        toast({
          title: "Error",
          description: "Failed to update notifications.",
          variant: "destructive",
        });
      }
    }, 
    [currentUser, notifications, toast]
  );

  // Set up a realtime subscription to listen for new notifications
  useEffect(() => {
    if (!currentUser) return;
    
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        }, 
        (payload) => {
          const newNotification = {
            id: payload.new.id,
            userId: payload.new.user_id,
            title: payload.new.title,
            message: payload.new.message,
            isRead: payload.new.is_read,
            createdAt: new Date(payload.new.created_at),
            type: payload.new.type,
            relatedId: payload.new.related_id,
          };
          
          // Add to state
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.isRead) {
            setUnreadCount((count) => count + 1);
          }
          
          // Show a toast for the new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser, toast]);

  // Initial fetch of notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Run cleanup on initial load and periodically
  useEffect(() => {
    // Initial cleanup
    cleanupOldNotifications();

    // Set up periodic cleanup (once per day)
    const cleanupInterval = setInterval(() => {
      cleanupOldNotifications();
    }, 24 * 60 * 60 * 1000); // 24 hours

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [cleanupOldNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications,
  };
}
