
import { useEffect } from "react";
import { Notification } from "@/types";
import { useNotificationFetching } from "./notifications/useNotificationFetching";
import { useNotificationActions } from "./notifications/useNotificationActions";
import { useRealtimeNotifications } from "./notifications/useRealtimeNotifications";

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    setNotifications,
    setUnreadCount
  } = useNotificationFetching();

  const {
    markAsRead,
    markAllAsRead,
    cleanupOldNotifications,
    loading: actionLoading
  } = useNotificationActions();

  // Set up realtime notifications
  useRealtimeNotifications(setNotifications, setUnreadCount);

  // Effect for marking notifications as read
  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId);
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  };

  // Effect for marking all notifications as read
  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    }
  };

  // Effect for periodic cleanup
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

  // Initial fetch of notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading: loading || actionLoading,
    error,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    cleanupOldNotifications,
  };
}
