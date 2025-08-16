
import { LayoutDashboard, Wallet, Ticket, ShoppingBag, CreditCard, UserCircle, Receipt, Gift, Trophy } from 'lucide-react';
import { UserRole } from '@/types';

export interface NavigationLink {
  to: string;
  label: string;
  icon: any;
}

export const adminLinks: NavigationLink[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/tickets", label: "Tickets", icon: Ticket },
  { to: "/admin/sellers", label: "Tipsters", icon: UserCircle },
  { to: "/admin/buyers", label: "Tipsters", icon: UserCircle },
  { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/admin/cases", label: "Cases", icon: Ticket },
  { to: "/admin/payment-settings", label: "Payment", icon: CreditCard },
  { to: "/live-scores", label: "Live Scores", icon: Trophy },
];

export const sellerLinks: NavigationLink[] = [
  { to: "/seller/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/seller/profile", label: "Profile", icon: UserCircle },
  { to: "/seller/tickets", label: "My Tickets", icon: Ticket },
  { to: "/seller/transactions", label: "Transactions", icon: Receipt },
  { to: "/seller/withdrawals", label: "Withdrawals", icon: Wallet },
  { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
  { to: "/live-scores", label: "Live Scores", icon: Trophy },
];

export const buyerLinks: NavigationLink[] = [
  { to: "/buyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/user/wallet", label: "Wallet", icon: Wallet },
  { to: "/tickets", label: "Browse Tickets", icon: Ticket },
  { to: "/buyer/purchases", label: "My Purchases", icon: ShoppingBag },
  { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
  { to: "/live-scores", label: "Live Scores", icon: Trophy },
];

export const publicLinks: NavigationLink[] = [
  { to: "/tickets", label: "Browse Tickets", icon: Ticket },
  { to: "/vouchers", label: "Daily Vouchers", icon: Gift },
  { to: "/live-scores", label: "Live Scores", icon: Trophy },
];

export const getLinksForRole = (userRole: UserRole | null): NavigationLink[] => {
  switch (userRole) {
    case 'admin': return adminLinks;
    case 'seller': return sellerLinks;
    case 'buyer': return buyerLinks;
    default: return publicLinks;
  }
};
