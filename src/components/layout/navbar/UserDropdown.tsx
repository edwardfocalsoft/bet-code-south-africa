
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
import { getLinksForRole } from "./navigationLinks";

const UserDropdown: React.FC = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  if (!currentUser) return null;

  const navigationLinks = getLinksForRole(userRole);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full p-0 min-w-[40px]"
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
        
        {navigationLinks.map((link) => (
          <DropdownMenuItem key={link.to}>
            <Link to={link.to} className="flex items-center gap-2 w-full">
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to="/user/settings" className="w-full">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link to="/notifications" className="w-full">Notifications</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
