
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { LayoutDashboard, Wallet, Ticket, ShoppingBag, CreditCard, BellRing, UserCircle, Menu, ChevronDown, Receipt, Gift, Trophy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const NavLinks: React.FC = () => {
  const { userRole } = useAuth();
  const isMobile = useIsMobile();
  
  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/tickets", label: "Tickets", icon: Ticket },
    { to: "/admin/sellers", label: "Sellers", icon: UserCircle },
    { to: "/admin/buyers", label: "Buyers", icon: UserCircle },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
    { to: "/admin/cases", label: "Cases", icon: Ticket },
    { to: "/admin/payment-settings", label: "Payment", icon: CreditCard },
    { to: "/live-scores", label: "Live Scores", icon: Trophy },
  ];

  const sellerLinks = [
    { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/seller/profile", label: "Profile", icon: UserCircle },
    { to: "/seller/tickets", label: "My Tickets", icon: Ticket },
    { to: "/seller/transactions", label: "Transactions", icon: Receipt },
    { to: "/seller/withdrawals", label: "Withdrawals", icon: Wallet },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
    { to: "/live-scores", label: "Live Scores", icon: Trophy },
  ];

  const buyerLinks = [
    { to: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/user/wallet", label: "Wallet", icon: Wallet },
    { to: "/tickets", label: "Browse Tickets", icon: Ticket },
    { to: "/buyer/purchases", label: "My Purchases", icon: ShoppingBag },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
    { to: "/live-scores", label: "Live Scores", icon: Trophy },
  ];

  const publicLinks = [
    { to: "/tickets", label: "Browse Tickets", icon: Ticket },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
    { to: "/live-scores", label: "Live Scores", icon: Trophy },
  ];

  const getLinksForRole = () => {
    switch (userRole) {
      case 'admin': return adminLinks;
      case 'seller': return sellerLinks;
      case 'buyer': return buyerLinks;
      default: return publicLinks;
    }
  };

  const links = getLinksForRole();

  // Mobile dropdown
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
            <Menu className="h-5 w-5 mr-2" />
            Menu
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-betting-dark-gray border-betting-light-gray"
        >
          {links.map((link) => (
            <DropdownMenuItem key={link.to} asChild>
              <NavLink 
                to={link.to}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-betting-black w-full"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Desktop navigation
  return (
    <div className="hidden md:flex space-x-6">
      {links.map((link) => (
        <NavLink 
          key={link.to}
          to={link.to} 
          className={({ isActive }) =>
            isActive 
              ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' 
              : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </NavLink>
      ))}
    </div>
  );
};

export default NavLinks;
