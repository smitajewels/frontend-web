export type UserRole = "ADMIN" | "USER";
export type TransactionType = "PURCHASE" | "COLLECT";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type GoldKarat = "K18" | "K22" | "K24";
export type BuyGoldMode = "BY_AMOUNT" | "BY_GRAMS";
export type PaymentStatus = "CREATED" | "AUTHORIZED" | "CAPTURED" | "FAILED" | "REFUNDED";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  code?: string;
}

export interface Portfolio {
  gramsK18: number;
  gramsK22: number;
  gramsK24: number;
  investedInrK18: number;
  investedInrK22: number;
  investedInrK24: number;
  totalGoldGrams: number;
  totalInvestedInr: number;
  portfolioCurrentValue: number;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: UserRole;
  panNumber: string | null;
  panPhotoPath: string | null;
  profilePhotoPath: string | null;
  termsAccepted: boolean;
  collectionEligibleHeld: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  portfolio: Portfolio;
}

export interface CategoryGoldRates {
  k18RatePer10g: number;
  k22RatePer10g: number;
  k24RatePer10g: number;
  base24RatePer10g: number;
  updatedAt: string;
}

export interface LiveGoldRates extends CategoryGoldRates {
  liveRateMarkupPer10g: number;
  liveRateIncludesGstNote: string;
  liveRateNextUpdate: string;
  breakdownGstPercent: number;
}

export interface GoldTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  karat: GoldKarat;
  grams: number;
  amountInr: number;
  baseAmountInr: number;
  gstAmountInr: number;
  rateAtPurchasePer10g: number;
  buyMode: BuyGoldMode | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; name: string; phone: string | null };
}

export interface CollectionEligibility {
  isEligibleForPhysicalCollection: boolean;
  totalGoldGrams: number;
  collectionThresholdGrams: number;
  collectionEligibleHeld: boolean;
  message: string;
}

export interface AdminDashboard {
  adminPurchaseCount: number;
  totalCustomers: number;
  customersWithGold: number;
  todayPurchaseGrams: number;
  todayPurchaseAmountInr: number;
  currentRates: CategoryGoldRates;
  adminId: string;
}

export interface AdminCustomer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  totalGoldGrams: number;
  totalInvestedInr: number;
  portfolioCurrentValue: number;
  isEligibleForPhysicalCollection: boolean;
}

export interface SchemeInfo {
  hasScheme: boolean;
  scheme: string;
  schemeAssetPath: string;
}

export interface RazorpayPayment {
  id: string;
  userId: string;
  goldTransactionId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  amountInr: number;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  receipt: string;
  createdAt: string;
  updatedAt: string;
  goldTransaction?: GoldTransaction;
}

export interface RazorpayCheckout {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  paymentLinkUrl?: string;
}

export interface BuyGoldResult {
  breakdown: {
    karat: GoldKarat;
    grams: number;
    ratePer10Gram: number;
    adminRatePer10g?: number;
    markupPer10g?: number;
    baseAmountInr: number;
    gstAmountInr: number;
    gstPercent: number;
    amountInr: number;
    buyMode: BuyGoldMode;
  };
  transaction: GoldTransaction;
  payment: RazorpayPayment;
  razorpay: RazorpayCheckout;
}

export interface PaginatedTransactions {
  items: GoldTransaction[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface PaginatedPayments {
  items: RazorpayPayment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminPayment extends RazorpayPayment {
  user: { id: string; email: string; name: string; phone: string | null };
}

export interface PaginatedAdminPayments {
  items: AdminPayment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  panNumber: string;
  termsAccepted: boolean;
  profilePhoto?: File | null;
  panCardPhoto: File;
}
