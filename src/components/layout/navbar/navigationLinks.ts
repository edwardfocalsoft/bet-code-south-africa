import {
  Home,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Settings,
  ShoppingBag,
  User,
  Users,
  Trophy,
  Wallet,
  Contact2,
  Coins,
  PercentCircle,
  CreditCard,
} from "lucide-react";

interface NavigationLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

export const getLinksForRole = (userRole: string | null): NavigationLink[] => {
  if (userRole === "admin") {
    return [
      { href: "/", label: "Home" },
      { href: "/tickets", label: "All Tickets" },
      { href: "/sellers", label: "All Sellers" },
      { href: "/sellers/leaderboard", label: "Leaderboard" },
      { href: "/admin/dashboard", label: "Admin Dashboard" },
      { href: "/admin/sellers", label: "Manage Sellers" },
      { href: "/admin/buyers", label: "Manage Buyers" },
      { href: "/admin/tickets", label: "Manage Tickets" },
      { href: "/admin/cases", label: "Manage Cases" },
      { href: "/admin/withdrawals", label: "Withdrawals" },
      { href: "/admin/weekly-rewards", label: "Weekly Rewards" },
      { href: "/admin/payment-settings", label: "Payment Settings" },
    ];
  }

  if (userRole === "seller") {
    return [
      { href: "/", label: "Home" },
      { href: "/tickets", label: "All Tickets" },
      { href: "/sellers", label: "All Sellers" },
      { href: "/sellers/leaderboard", label: "Leaderboard" },
      { href: "/sellers/me", label: "My Profile" },
      { href: "/tickets/create", label: "Create Ticket" },
      { href: "/user/wallet", label: "My Wallet" },
      { href: "/user/cases", label: "My Cases" },
      { href: "/user/notifications", label: "Notifications" },
      { href: "/contact", label: "Contact Support" },
    ];
  }

  return [
    { href: "/", label: "Home" },
    { href: "/tickets", label: "All Tickets" },
    { href: "/sellers", label: "All Sellers" },
    { href: "/sellers/leaderboard", label: "Leaderboard" },
    { href: "/user/wallet", label: "My Wallet" },
    { href: "/user/purchases", label: "My Purchases" },
    { href: "/user/subscriptions", label: "Subscriptions" },
    { href: "/user/cases", label: "My Cases" },
    { href: "/user/notifications", label: "Notifications" },
    { href: "/contact", label: "Contact Support" },
  ];
};

export const navigationLinks = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/tickets",
    label: "Tickets",
    icon: ListChecks,
  },
  {
    href: "/sellers",
    label: "Sellers",
    icon: Users,
  },
  {
    href: "/sellers/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: Contact2,
  },
];

export const profileLinks = [
  {
    href: "/user/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/user/wallet",
    label: "Wallet",
    icon: Wallet,
  },
  {
    href: "/user/purchases",
    label: "Purchases",
    icon: ShoppingBag,
  },
  {
    href: "/user/subscriptions",
    label: "Subscriptions",
    icon: Users,
  },
  {
    href: "/user/cases",
    label: "Cases",
    icon: Contact2,
  },
  {
    href: "/user/notifications",
    label: "Notifications",
    icon: Settings,
  },
];

export const adminLinks = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/sellers",
    label: "Sellers",
    icon: Users,
  },
  {
    href: "/admin/buyers",
    label: "Buyers",
    icon: Users,
  },
  {
    href: "/admin/tickets",
    label: "Tickets",
    icon: ListChecks,
  },
  {
    href: "/admin/cases",
    label: "Cases",
    icon: Contact2,
  },
  {
    href: "/admin/withdrawals",
    label: "Withdrawals",
    icon: Coins,
  },
  {
    href: "/admin/weekly-rewards",
    label: "Weekly Rewards",
    icon: Trophy,
  },
  {
    href: "/admin/payment-settings",
    label: "Payment Settings",
    icon: CreditCard,
  },
  {
    href: "/admin/promo-codes",
    label: "Promo Codes",
    icon: PercentCircle,
  },
];
