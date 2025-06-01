
import React from "react";
import Layout from "@/components/layout/Layout";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";

const Notifications: React.FC = () => {
  const { notifications, loading, markAsRead, markAllAsRead, cleanupOldNotifications } = useNotifications();
  const { userRole } = useAuth();

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  // Group notifications by date
  const groupedNotifications = React.useMemo(() => {
    const groups: Record<string, typeof notifications> = {};
    
    notifications.forEach((notification) => {
      const date = format(notification.createdAt, "PP");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  }, [notifications]);

  return (
    <Layout requireAuth={true}>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <div className="flex space-x-2">
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => markAllAsRead()}
              >
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-6">
          <p>Notifications older than 60 days are automatically deleted.</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="betting-card p-8 text-center">
            <p className="text-muted-foreground">You don't have any notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date}>
                <h2 className="text-md font-medium text-muted-foreground mb-2">{date}</h2>
                <div className="betting-card divide-y divide-betting-light-gray">
                  {notifs.map((notification) => {
                    // Determine the link based on notification type
                    let linkTo = "#";
                    let buttonText = "";
                    
                    if (notification.type === "ticket" && notification.relatedId) {
                      linkTo = `/tickets/${notification.relatedId}`;
                      buttonText = "View Ticket";
                    } else if (notification.type === "subscription" && notification.relatedId) {
                      linkTo = `/sellers/${notification.relatedId}`;
                      buttonText = "View Seller";
                    } else if (notification.type === "case" && notification.relatedId) {
                      // For admin, link to admin case page
                      if (userRole === 'admin') {
                        linkTo = `/admin/cases/${notification.relatedId}`;
                        buttonText = "View Case";
                      } 
                      // For users, link to user case view
                      else {
                        linkTo = `/user/cases/${notification.relatedId}`;
                        buttonText = "View Case";
                      }
                    } else if (notification.type === "seller_notification" && notification.relatedId) {
                      linkTo = `/sellers/${notification.relatedId}`;
                      buttonText = "View Seller";
                    } else if (notification.type === "admin_notification") {
                      // Admin notifications don't have specific links
                      linkTo = "#";
                      buttonText = "";
                    }
                    
                    return (
                      <div 
                        key={notification.id} 
                        className={`p-4 ${!notification.isRead ? 'bg-betting-light-gray/30' : ''}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{notification.title}</h3>
                              {!notification.isRead && (
                                <span className="h-2 w-2 rounded-full bg-betting-green"></span>
                              )}
                              {notification.type === "admin_notification" && (
                                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                                  Admin
                                </span>
                              )}
                              {notification.type === "seller_notification" && (
                                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                                  Seller
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground mt-1">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(notification.createdAt, "p")}
                            </p>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                            
                            {linkTo !== "#" && buttonText && (
                              <Button 
                                variant="outline"
                                size="sm"
                                className="whitespace-nowrap"
                                asChild
                                onClick={() => handleNotificationClick(notification.id)}
                              >
                                <Link to={linkTo}>
                                  {buttonText}
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
