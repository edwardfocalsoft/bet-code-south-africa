
import {
  Home as HomeIcon,
  LayoutDashboard,
  Users,
  Ticket,
  Contact2,
  Settings,
  Coins,
  Trophy,
  BadgeDollarSign,
  Scale,
  LucideIcon,
} from "lucide-react";
import { UserRole } from "@/types";

/**
 * Existing nav definitions kept for reference or other consumers
 */
interface NavLink {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export const mainNavigation: NavLink[] = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Tipsters", href: "/sellers", icon: Users },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Contact", href: "/contact", icon: Contact2 },
];

export const sellerNavigation: NavLink[] = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "My Tickets", href: "/seller/tickets", icon: Ticket },
  { name: "Transactions", href: "/seller/transactions", icon: Coins },
];

export const buyerNavigation: NavLink[] = [
  { name: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
  { name: "Purchases", href: "/buyer/purchases", icon: Ticket },
  { name: "Wallet", href: "/user/wallet", icon: Coins },
  { name: "Settings", href: "/user/settings", icon: Settings },
];

export const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Tipsters", href: "/admin/sellers" },
  { name: "Punters", href: "/admin/buyers" },
  { name: "Tickets", href: "/admin/tickets" },
  { name: "Cases", href: "/admin/cases" },
  { name: "Withdrawals", href: "/admin/withdrawals" },
  { name: "Weekly Rewards", href: "/admin/weekly-rewards" },
  { name: "Payment Settings", href: "/admin/payment-settings" },
];

/**
 * What navbar components expect
 */
export type NavigationLink = {
  to: string;
  label: string;
  icon: LucideIcon;
};

/**
 * Returns links formatted for navbar based on role
 */
export const getLinksForRole = (role: UserRole | null): NavigationLink[] => {
  if (role === "admin") {
    return [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/sellers", label: "Tipsters", icon: Users },
      { to: "/admin/buyers", label: "Punters", icon: Users },
      { to: "/admin/tickets", label: "Tickets", icon: Ticket },
      { to: "/admin/cases", label: "Cases", icon: Scale },
      { to: "/admin/withdrawals", label: "Withdrawals", icon: BadgeDollarSign },
      { to: "/admin/weekly-rewards", label: "Weekly Rewards", icon: Trophy },
      { to: "/admin/payment-settings", label: "Payment Settings", icon: Settings },
    ];
  }

  if (role === "seller") {
    return sellerNavigation.map((l) => ({
      to: l.href,
      label: l.name,
      icon: l.icon || LayoutDashboard,
    }));
  }

  if (role === "buyer") {
    return buyerNavigation.map((l) => ({
      to: l.href,
      label: l.name,
      icon: l.icon || LayoutDashboard,
    }));
  }

  // Default (guest): show main navigation
  return mainNavigation.map((l) => ({
    to: l.href,
    label: l.name,
    icon: l.icon || HomeIcon,
  }));
};

