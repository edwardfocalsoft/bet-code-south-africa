export type UserRole = "buyer" | "seller" | "admin";

export type BettingSite = 
  | "Betway"
  | "HollywoodBets"
  | "Supabets"
  | "Playa"
  | "10bet"
  | "Easybet";

export interface User {
  id: string;
  email?: string;
  role: "buyer" | "seller" | "admin";
  username?: string;
  createdAt?: Date;
  approved?: boolean;
  suspended?: boolean;
  loyaltyPoints?: number;
  bankDetails?: BankDetails;
  avatar_url?: string;
  credit_balance?: number;
  sales_count?: number;
  average_rating?: number;
  ranking?: number;
  lastActive?: Date;
  purchasesCount?: number;
  creditBalance?: number;
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
}

export interface ProfileData {
  username: string;
  avatarUrl: string;
  displayWhatsapp: boolean;
  whatsappNumber: string;
}

export interface BettingTicket {
  id: string;
  title: string;
  description: string;
  sellerId: string;
  sellerUsername: string;
  price: number;
  isFree: boolean;
  bettingSite: BettingSite;
  kickoffTime: Date;
  createdAt: Date;
  odds?: number;
  isHidden?: boolean;
  isExpired?: boolean;
  eventResults?: string;
  ticketCode?: string; // Added the ticketCode property
}

export interface Purchase {
  id: string;
  ticketId: string;
  buyerId: string;
  sellerId: string;
  price: number;
  purchaseDate: Date;
  isWinner?: boolean;
  isRated?: boolean;
}

export interface Rating {
  id: string;
  sellerId: string;
  buyerId: string;
  ticketId: string;
  score: number;
  comment?: string;
  createdAt: Date;
}

export interface Withdrawal {
  id: string;
  sellerId: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  requestDate: Date;
  processedDate?: Date;
}

export interface SellerStats {
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
  winRate: number;
  // Additional fields needed by the SellerProfileHeader and SellerStatsTab components
  ticketsSold: number;
  followers: number;  // This represents subscriber count
  satisfaction: number;
  totalRatings: number;
}

export interface DashboardStats {
  ticketsCount: number;
  purchasesCount: number;
  winningTickets: number;
  pendingApprovals?: number;
  pendingWithdrawals?: number;
}

// Added a specific interface for case reply profiles to handle error cases
export interface CaseReplyProfile {
  username?: string;
  role?: string;
  avatar_url?: string;
  error?: boolean;
}

// Define types for case details
export interface CaseDetail {
  id: string;
  case_number?: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  ticket_id: string;
  purchase_id: string;
  replies: CaseReply[];
  purchases?: any;
  tickets?: any;
}

export interface CaseReply {
  id: string;
  case_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: CaseReplyProfile;
}

// Add the Notification interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  type: "subscription" | "ticket" | "system" | "free_ticket" | "case";
  relatedId?: string;
}
