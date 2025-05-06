
import { BettingTicket, BettingSite, User, Purchase, Rating, Withdrawal, SellerStats, UserRole } from "../types";

export const BETTING_SITES: BettingSite[] = [
  "Betway",
  "HollywoodBets",
  "Supabets",
  "Playa",
  "10bet",
  "Easybet"
];

const generateRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateFutureDate = (daysAhead: number): Date => {
  const result = new Date();
  result.setDate(result.getDate() + daysAhead);
  return result;
};

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "admin@betcode.co.za",
    role: "admin",
    username: "SuperAdmin",
    createdAt: new Date("2023-01-01"),
    approved: true,
    loyaltyPoints: 0
  },
  {
    id: "u2",
    email: "seller1@example.com",
    role: "seller",
    username: "TopPicker",
    createdAt: new Date("2023-02-15"),
    approved: true,
    bankDetails: {
      accountHolder: "John Doe",
      bankName: "Standard Bank",
      accountNumber: "1234567890",
      branchCode: "051001",
      accountType: "Savings"
    }
  },
  {
    id: "u3",
    email: "seller2@example.com",
    role: "seller",
    username: "BettingPro",
    createdAt: new Date("2023-03-10"),
    approved: true,
    bankDetails: {
      accountHolder: "Jane Smith",
      bankName: "FNB",
      accountNumber: "0987654321",
      branchCode: "250655",
      accountType: "Current"
    }
  },
  {
    id: "u4",
    email: "buyer1@example.com",
    role: "buyer",
    username: "BetFan",
    createdAt: new Date("2023-04-05"),
    loyaltyPoints: 120
  },
  {
    id: "u5",
    email: "buyer2@example.com",
    role: "buyer",
    username: "LuckyGambler",
    createdAt: new Date("2023-04-20"),
    loyaltyPoints: 45
  },
  {
    id: "u6",
    email: "pendingseller@example.com",
    role: "seller",
    createdAt: new Date("2023-05-15"),
    approved: false
  }
];

export const mockTickets: BettingTicket[] = [
  {
    id: "t1",
    title: "Weekend Special: EPL Multi",
    description: "4-fold Premier League special with guaranteed value odds. High confidence picks!",
    sellerId: "u2",
    sellerUsername: "TopPicker",
    price: 0,
    isFree: true,
    bettingSite: "Betway",
    kickoffTime: generateFutureDate(2),
    createdAt: new Date("2023-06-01"),
    odds: 3.5
  },
  {
    id: "t2",
    title: "VIP UCL Double Chance",
    description: "Premium double chance selections for Champions League matches. Consistently profitable strategy!",
    sellerId: "u2",
    sellerUsername: "TopPicker",
    price: 25,
    isFree: false,
    bettingSite: "HollywoodBets",
    kickoffTime: generateFutureDate(3),
    createdAt: new Date("2023-06-05"),
    odds: 2.8
  },
  {
    id: "t3",
    title: "Serie A Goal Rush",
    description: "Over/Under goals package for Italian league games. Based on detailed statistical analysis.",
    sellerId: "u3",
    sellerUsername: "BettingPro",
    price: 15,
    isFree: false,
    bettingSite: "10bet",
    kickoffTime: generateFutureDate(1),
    createdAt: new Date("2023-06-07"),
    odds: 4.2
  },
  {
    id: "t4",
    title: "Free Daily Pick",
    description: "Single bet of the day. Free for all members!",
    sellerId: "u3",
    sellerUsername: "BettingPro",
    price: 0,
    isFree: true,
    bettingSite: "Supabets",
    kickoffTime: generateFutureDate(0.5),
    createdAt: new Date("2023-06-10"),
    odds: 1.75
  }
];

export const mockPurchases: Purchase[] = [
  {
    id: "p1",
    ticketId: "t2",
    buyerId: "u4",
    sellerId: "u2",
    price: 25,
    purchaseDate: new Date("2023-06-06"),
    isWinner: true,
    isRated: true
  },
  {
    id: "p2",
    ticketId: "t3",
    buyerId: "u4",
    sellerId: "u3",
    price: 15,
    purchaseDate: new Date("2023-06-08"),
    isWinner: false,
    isRated: true
  },
  {
    id: "p3",
    ticketId: "t2",
    buyerId: "u5",
    sellerId: "u2",
    price: 25,
    purchaseDate: new Date("2023-06-06"),
    isWinner: true,
    isRated: true
  }
];

export const mockRatings: Rating[] = [
  {
    id: "r1",
    sellerId: "u2",
    buyerId: "u4",
    ticketId: "t2",
    score: 5,
    comment: "Excellent pick! Won with ease.",
    createdAt: new Date("2023-06-07")
  },
  {
    id: "r2",
    sellerId: "u3",
    buyerId: "u4",
    ticketId: "t3",
    score: 2,
    comment: "Not happy with this one. Analysis was off.",
    createdAt: new Date("2023-06-09")
  },
  {
    id: "r3",
    sellerId: "u2",
    buyerId: "u5",
    ticketId: "t2",
    score: 5,
    comment: "Great value, will buy again!",
    createdAt: new Date("2023-06-07")
  }
];

export const mockWithdrawals: Withdrawal[] = [
  {
    id: "w1",
    sellerId: "u2",
    amount: 225,
    status: "completed",
    requestDate: new Date("2023-06-15"),
    processedDate: new Date("2023-06-17")
  },
  {
    id: "w2",
    sellerId: "u3",
    amount: 135,
    status: "pending",
    requestDate: new Date("2023-06-20")
  }
];

export const mockSellerStats: Record<string, SellerStats> = {
  u2: {
    totalSales: 42,
    totalRevenue: 890,
    averageRating: 4.8,
    winRate: 0.76
  },
  u3: {
    totalSales: 28,
    totalRevenue: 420,
    averageRating: 3.9,
    winRate: 0.64
  }
};

export const getCurrentUser = (): User | null => {
  // For mock purposes, let's assume we're logged in as a buyer
  return mockUsers.find(user => user.id === "u4") || null;
};

export const getUserByRole = (role: UserRole): User | null => {
  return mockUsers.find(user => user.role === role) || null;
};
