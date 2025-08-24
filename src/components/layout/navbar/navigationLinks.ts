import {
  Home,
  LayoutDashboard,
  Users,
  Ticket,
  Contact2,
  Settings,
  Coins,
  Percent,
  Scale,
  LucideIcon,
  Trophy,
  BadgeDollarSign,
} from "lucide-react";

interface NavLink {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export const mainNavigation: NavLink[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tipsters", href: "/sellers", icon: Users },
  { name: "Tickets", href: "/tickets", icon: Ticket },
  { name: "Contact", href: "/contact", icon: Contact2 },
];

export const sellerNavigation: NavLink[] = [
  { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { name: "My Tickets", href: "/seller/tickets", icon: Ticket },
  { name: "Transactions", href: "/seller/transactions", icon: Coins },
  { name: "Subscription Plans", href: "/seller/subscription-plans", icon: Percent },
  { name: "Settings", href: "/seller/settings", icon: Settings },
];

export const buyerNavigation: NavLink[] = [
  { name: "My Tickets", href: "/user/tickets", icon: Ticket },
  { name: "Wallet", href: "/user/wallet", icon: Coins },
  { name: "Subscriptions", href: "/user/subscriptions", icon: Users },
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

export const settingsNavigation: NavLink[] = [
  { name: "Profile", href: "/user/settings", icon: Users },
  { name: "Account", href: "/account", icon: Settings },
  { name: "Appearance", href: "/appearance", icon: Scale },
];
