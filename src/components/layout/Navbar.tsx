
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogIn, Menu, Bell, Star, CircleUser } from "lucide-react";

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getLoyaltyBadge = (points: number) => {
    if (points >= 500) return "🏆 Elite";
    if (points >= 200) return "⭐ Gold";
    if (points >= 100) return "🥈 Silver";
    return "🥉 Bronze";
  };

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    
    if (currentUser.role === "admin") return "/admin/dashboard";
    if (currentUser.role === "seller") return "/seller/dashboard";
    return "/buyer/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-betting-black border-b border-betting-light-gray">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-betting-green text-xl font-bold flex items-center">
            <span className="text-betting-accent">Bet</span>Code<span className="text-xs text-muted-foreground ml-1">ZA</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/tickets" className="text-muted-foreground hover:text-white transition-colors">
              Tickets
            </Link>
            <Link to="/sellers" className="text-muted-foreground hover:text-white transition-colors">
              Top Sellers
            </Link>
            <Link to="/how-it-works" className="text-muted-foreground hover:text-white transition-colors">
              How It Works
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <Link to="/notifications" className="mr-2 relative">
                <Bell className="h-5 w-5 text-muted-foreground hover:text-white transition-colors" />
                <span className="absolute -top-1 -right-1 bg-betting-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <CircleUser className="h-5 w-5" />
                    <span className="hidden md:inline">{currentUser.username || currentUser.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-betting-dark-gray border-betting-light-gray">
                  <DropdownMenuLabel>
                    <div className="font-normal text-xs text-muted-foreground">Signed in as</div>
                    <div className="font-medium">{currentUser.email}</div>
                  </DropdownMenuLabel>
                  
                  {currentUser.role === "buyer" && currentUser.loyaltyPoints !== undefined && (
                    <>
                      <DropdownMenuSeparator className="bg-betting-light-gray" />
                      <DropdownMenuItem className="flex justify-between cursor-default">
                        <span>Loyalty Points</span>
                        <span className="font-medium">{currentUser.loyaltyPoints}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex justify-between cursor-default">
                        <span>Status</span>
                        <span className="font-medium">{getLoyaltyBadge(currentUser.loyaltyPoints)}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-betting-light-gray" />
                  
                  <Link to={getDashboardLink()}>
                    <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  </Link>
                  <Link to="/profile">
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  </Link>
                  <Link to="/purchases">
                    <DropdownMenuItem>My Purchases</DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator className="bg-betting-light-gray" />
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogIn className="h-4 w-4 mr-2 rotate-180" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>Login</span>
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-betting-green hover:bg-betting-green-dark">Sign up</Button>
              </Link>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="ml-1">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-betting-dark-gray border-betting-light-gray md:hidden">
              <Link to="/">
                <DropdownMenuItem>Home</DropdownMenuItem>
              </Link>
              <Link to="/tickets">
                <DropdownMenuItem>Tickets</DropdownMenuItem>
              </Link>
              <Link to="/sellers">
                <DropdownMenuItem>Top Sellers</DropdownMenuItem>
              </Link>
              <Link to="/how-it-works">
                <DropdownMenuItem>How It Works</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
