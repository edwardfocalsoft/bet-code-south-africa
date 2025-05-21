
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Notification } from "@/types";
import { useEffect } from "react";

export function useNotificationFetching() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log(`[notifications] Fetching notifications for user: ${currentUser.id}`);

      // Get notifications from Supabase
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(50); // Limit to most recent 50

      if (error) throw error;

      // Count unread notifications
      const unreadNotifications = data.filter(n => !n.is_read).length;
      setUnreadCount(unreadNotifications);
      
      // Map to our notification type - with type assertion to handle the extended notification types
      const mappedNotifications: Notification[] = data.map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        isRead: notification.is_read,
        createdAt: new Date(notification.created_at),
        type: notification.type as Notification["type"],
        relatedId: notification.related_id || undefined
      }));

      setNotifications(mappedNotifications);
      console.log(`[notifications] Fetched ${mappedNotifications.length} notifications, ${unreadNotifications} unread`);
    } catch (err: any) {
      console.error("[notifications] Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser, fetchNotifications]);

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
