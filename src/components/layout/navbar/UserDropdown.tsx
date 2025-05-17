
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth";

const UserDropdown: React.FC = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  if (!currentUser) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="User menu"
        >
          <User className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {currentUser.email}
          <div className="text-xs font-normal text-muted-foreground">
            {userRole && userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {userRole === "buyer" && (
          <>
            <DropdownMenuItem>
              <Link to="/buyer/dashboard" className="w-full">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/buyer/purchases" className="w-full">My Purchases</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/buyer/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/notifications" className="w-full">Notifications</Link>
            </DropdownMenuItem>
          </>
        )}
        
        {userRole === "seller" && (
          <>
            <DropdownMenuItem>
              <Link to="/seller/dashboard" className="w-full">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/seller/tickets" className="w-full">My Tickets</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/seller/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/seller/withdrawals" className="w-full">Withdrawals</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/notifications" className="w-full">Notifications</Link>
            </DropdownMenuItem>
          </>
        )}
        
        {userRole === "admin" && (
          <>
            <DropdownMenuItem>
              <Link to="/admin/dashboard" className="w-full">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/admin/tickets" className="w-full">Manage Tickets</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/admin/sellers" className="w-full">Manage Sellers</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/admin/buyers" className="w-full">Manage Buyers</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/admin/withdrawals" className="w-full">Withdrawals</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/admin/payment-settings" className="w-full">Payment Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link to="/notifications" className="w-full">Notifications</Link>
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to="/user/settings" className="w-full">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
