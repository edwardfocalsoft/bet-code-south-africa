
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { LayoutDashboard, Wallet, Ticket, ShoppingBag, CreditCard, BellRing, UserCircle, Menu, ChevronDown, Receipt, Gift } from 'lucide-react';
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
  ];

  const sellerLinks = [
    { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/seller/profile", label: "Profile", icon: UserCircle },
    { to: "/seller/tickets", label: "My Tickets", icon: Ticket },
    { to: "/seller/transactions", label: "Transactions", icon: Receipt },
    { to: "/seller/withdrawals", label: "Withdrawals", icon: Wallet },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
    { to: "/notifications", label: "Notifications", icon: BellRing },
  ];

  const buyerLinks = [
    { to: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/user/wallet", label: "Wallet", icon: Wallet },
    { to: "/tickets", label: "Browse Tickets", icon: Ticket },
    { to: "/buyer/purchases", label: "My Purchases", icon: ShoppingBag },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
    { to: "/notifications", label: "Notifications", icon: BellRing },
  ];

  const publicLinks = [
    { to: "/tickets", label: "Browse Tickets", icon: Ticket },
    { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
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
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-betting-black"
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
      {userRole === 'admin' && (
        <>
          <NavLink to="/admin/dashboard" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Dashboard
          </NavLink>
          <NavLink to="/admin/tickets" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Tickets
          </NavLink>
          <NavLink to="/admin/sellers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Sellers
          </NavLink>
          <NavLink to="/admin/buyers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Buyers
          </NavLink>
          <NavLink to="/admin/withdrawals" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Withdrawals
          </NavLink>
          <NavLink to="/admin/cases" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Cases
          </NavLink>
          <NavLink to="/admin/payment-settings" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <CreditCard className="h-4 w-4 inline mr-1" />
            Payment
          </NavLink>
        </>
      )}

      {userRole === 'seller' && (
        <>
          <NavLink to="/seller/dashboard" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Dashboard
          </NavLink>
          <NavLink to="/seller/profile" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <UserCircle className="h-4 w-4 inline mr-1" />
            Profile
          </NavLink>
          <NavLink to="/seller/tickets" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            My Tickets
          </NavLink>
          <NavLink to="/seller/transactions" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Receipt className="h-4 w-4 inline mr-1" />
            Transactions
          </NavLink>
          <NavLink to="/seller/withdrawals" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Withdrawals
          </NavLink>
          <NavLink to="/vouchers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Gift className="h-4 w-4 inline mr-1" />
            Daily Vouchers
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <BellRing className="h-4 w-4 inline mr-1" />
            Notifications
          </NavLink>
        </>
      )}

      {userRole === 'buyer' && (
        <>
          <NavLink to="/buyer/dashboard" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/user/wallet" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Wallet className="h-4 w-4" />
            Wallet
          </NavLink>
          <NavLink to="/tickets" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Ticket className="h-4 w-4" />
            Browse Tickets
          </NavLink>
          <NavLink to="/buyer/purchases" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <ShoppingBag className="h-4 w-4" />
            My Purchases
          </NavLink>
          <NavLink to="/vouchers" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Gift className="h-4 w-4" />
            Daily Vouchers
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) =>
            isActive ? 'flex items-center gap-1.5 text-white border-b-2 border-betting-green pb-1' : 'flex items-center gap-1.5 text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <BellRing className="h-4 w-4" />
            Notifications
          </NavLink>
        </>
      )}

      {!userRole && (
        <>
          <NavLink to="/tickets" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            Browse Tickets
          </NavLink>
          <NavLink to="/vouchers" className={({ isActive }) =>
            isActive ? 'text-white border-b-2 border-betting-green pb-1' : 'text-gray-300 hover:text-white pb-1 hover:border-b-2 hover:border-betting-green/50'
          }>
            <Gift className="h-4 w-4 inline mr-1" />
            Daily Vouchers
          </NavLink>
        </>
      )}
    </div>
  );
};

export default NavLinks;
