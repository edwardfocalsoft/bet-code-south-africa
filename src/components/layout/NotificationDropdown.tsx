
import React, { useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Bell, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth";
import { testNotificationCreation } from "@/utils/notificationUtils";

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, error } = useNotifications();
  const { currentUser, userRole } = useAuth();
  
  // Debug effect to log notifications and test creation
  useEffect(() => {
    console.log("NotificationDropdown - Current user:", currentUser?.id);
    console.log("NotificationDropdown - Notifications count:", notifications.length);
    console.log("NotificationDropdown - Unread count:", unreadCount);
    
    if (error) {
      console.error("NotificationDropdown - Error:", error);
    }
    
    // Test notification creation on component mount
    if (currentUser) {
      const testCreation = async () => {
        const result = await testNotificationCreation();
        console.log("Notification creation test result:", result ? "Success" : "Failed");
      };
      
      setTimeout(() => {
        testCreation();
      }, 2000); // Delay to ensure auth is fully loaded
    }
  }, [currentUser, notifications.length, unreadCount, error]);
  
  const handleNotificationClick = (notificationId: string, relatedId?: string, type?: string) => {
    console.log(`Marking notification ${notificationId} as read`);
    markAsRead(notificationId);
  };

  // Only show the last 5 notifications in the dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-betting-green text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading notifications...
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          recentNotifications.map((notification) => {
            // Determine the link based on notification type
            let linkTo = "#";
            if (notification.type === "ticket" && notification.relatedId) {
              linkTo = `/tickets/${notification.relatedId}`;
            } else if (notification.type === "subscription" && notification.relatedId) {
              linkTo = `/sellers/${notification.relatedId}`;
            } else if (notification.type === "case" && notification.relatedId) {
              // For admin, link to admin case page
              if (userRole === 'admin') {
                linkTo = `/admin/cases/${notification.relatedId}`;
              } 
              // For users, link to user case view
              else {
                linkTo = `/user/cases/${notification.relatedId}`;
              }
            }
            
            return (
              <DropdownMenuItem key={notification.id} className="block p-0">
                <Link 
                  to={linkTo}
                  className={`p-3 block w-full text-left cursor-pointer ${!notification.isRead ? 'bg-betting-light-gray/30' : ''}`}
                  onClick={() => handleNotificationClick(notification.id, notification.relatedId, notification.type)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    {!notification.isRead && (
                      <span className="h-2 w-2 rounded-full bg-betting-green mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(notification.createdAt, "PPp")}
                  </p>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        
        <DropdownMenuSeparator />
        
        <div className="p-2 text-xs text-muted-foreground flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 mr-1 inline-block" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications older than 60 days are automatically deleted</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span>Notifications are kept for 60 days</span>
        </div>
        
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="block p-0">
              <Link to="/notifications" className="p-3 block w-full text-center text-betting-green hover:underline">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
