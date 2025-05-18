
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types";

export function useNotificationFetching() {
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

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    setNotifications,
    setUnreadCount
  };
}
