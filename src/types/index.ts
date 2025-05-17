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
  email: string;
  role: UserRole;
  username?: string;
  createdAt: Date;
  approved?: boolean;
  suspended?: boolean;
  loyaltyPoints?: number;
  bankDetails?: BankDetails;
  avatar_url?: string;
  purchasesCount?: number; // Added property 
  lastActive?: Date;       // Added property
}

export interface BankDetails {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
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
}

export interface DashboardStats {
  ticketsCount: number;
  purchasesCount: number;
  winningTickets: number;
  pendingApprovals?: number;
  pendingWithdrawals?: number;
}
