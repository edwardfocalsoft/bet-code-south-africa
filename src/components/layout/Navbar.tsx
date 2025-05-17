
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Navbar() {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "seller") return "/seller/dashboard";
    if (userRole === "buyer") return "/buyer/dashboard";
    return "/";
  };

  return (
    <header className="bg-betting-black border-b border-betting-light-gray">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Logo />
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-6 mr-6">
            {!currentUser ? (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                >
                  Home
                </Link>
                <Link
                  to="/tickets"
                  className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                >
                  Tickets
                </Link>
                <Link
                  to="/sellers"
                  className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                >
                  Sellers
                </Link>
              </>
            ) : (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                >
                  Dashboard
                </Link>
                
                {userRole === "buyer" && (
                  <>
                    <Link
                      to="/tickets"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Browse Tickets
                    </Link>
                    <Link
                      to="/sellers"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Find Sellers
                    </Link>
                    <Link
                      to="/buyer/purchases"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      My Purchases
                    </Link>
                  </>
                )}
                
                {userRole === "seller" && (
                  <>
                    <Link
                      to="/seller/tickets"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      My Tickets
                    </Link>
                    <Link
                      to="/seller/tickets/create"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Create Ticket
                    </Link>
                    <Link
                      to="/seller/withdrawals"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Withdrawals
                    </Link>
                  </>
                )}
                
                {userRole === "admin" && (
                  <>
                    <Link
                      to="/admin/tickets"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Tickets
                    </Link>
                    <Link
                      to="/admin/sellers"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Sellers
                    </Link>
                    <Link
                      to="/admin/buyers"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Buyers
                    </Link>
                    <Link
                      to="/admin/withdrawals"
                      className="text-sm font-medium text-gray-200 transition-colors hover:text-white"
                    >
                      Withdrawals
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
          
          {currentUser ? (
            <>
              <NotificationDropdown />
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
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-betting-green hover:bg-betting-green-dark">
                <Link to="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
