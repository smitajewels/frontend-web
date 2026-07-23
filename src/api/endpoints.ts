import { apiRequest } from "./client";
import type {
  AdminCustomer,
  AdminDashboard,
  AppUser,
  BuyGoldMode,
  BuyGoldResult,
  CategoryGoldRates,
  CollectionEligibility,
  GoldKarat,
  GoldTransaction,
  LiveGoldRates,
  PaginatedAdminPayments,
  PaginatedPayments,
  PaginatedTransactions,
  RegisterPayload,
  SchemeInfo,
} from "../types/api";

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{
      user: AppUser;
      tokens: { accessToken: string; refreshToken: string; expiresIn: string };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: RegisterPayload) => {
    const form = new FormData();
    form.append("email", payload.email);
    form.append("password", payload.password);
    form.append("confirmPassword", payload.confirmPassword);
    form.append("name", payload.name);
    if (payload.phone) form.append("phone", payload.phone);
    form.append("panNumber", payload.panNumber);
    form.append("termsAccepted", String(payload.termsAccepted));
    form.append("panCardPhoto", payload.panCardPhoto);
    if (payload.profilePhoto) form.append("profilePhoto", payload.profilePhoto);

    return apiRequest<{
      user: AppUser;
      tokens: { accessToken: string; refreshToken: string };
    }>("/api/auth/register", { method: "POST", body: form });
  },

  me: () => apiRequest<AppUser>("/api/auth/me"),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string; resetToken?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string, confirmPassword: string) =>
    apiRequest<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiRequest<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    }),

  logout: (refreshToken: string) =>
    apiRequest<{ message: string }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

export const goldApi = {
  getLiveRates: () => apiRequest<LiveGoldRates>("/api/gold/rates/live"),
  getRates: () => apiRequest<CategoryGoldRates>("/api/gold/rates"),

  createBuyOrder: (karat: GoldKarat, mode: BuyGoldMode, amountInr?: number, grams?: number) =>
    apiRequest<BuyGoldResult>("/api/gold/buy", {
      method: "POST",
      body: JSON.stringify({ karat, mode, amountInr, grams }),
    }),

  verifyBuyPayment: (body: {
    razorpayOrderId?: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    razorpayPaymentLinkId?: string;
    razorpayPaymentLinkReferenceId?: string;
    razorpayPaymentLinkStatus?: string;
  }) =>
    apiRequest<BuyGoldResult>("/api/gold/buy/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  transactions: (page = 1, type?: string) => {
    const q = new URLSearchParams({ page: String(page), limit: "20" });
    if (type) q.set("type", type);
    return apiRequest<PaginatedTransactions>(`/api/gold/transactions?${q}`);
  },

  payments: (page = 1, status?: string) => {
    const q = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) q.set("status", status);
    return apiRequest<PaginatedPayments>(`/api/gold/payments?${q}`);
  },
};

export const userApi = {
  updateProfile: (body: { name?: string; phone?: string; panNumber?: string }) =>
    apiRequest<AppUser>("/api/users/me", { method: "PUT", body: JSON.stringify(body) }),

  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("profilePhoto", file);
    return apiRequest<AppUser>("/api/users/me/profile-photo", { method: "POST", body: form });
  },

  uploadPanCardPhoto: (file: File) => {
    const form = new FormData();
    form.append("panCardPhoto", file);
    return apiRequest<AppUser>("/api/users/me/pan-card-photo", { method: "POST", body: form });
  },

  collectionEligibility: () =>
    apiRequest<CollectionEligibility>("/api/users/me/collection-eligibility"),
};

export const adminApi = {
  dashboard: () => apiRequest<AdminDashboard>("/api/admin/dashboard"),

  customers: (search = "") => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiRequest<AdminCustomer[]>(`/api/admin/customers${q}`);
  },

  customersWithGold: () => apiRequest<AdminCustomer[]>("/api/admin/customers/with-gold"),

  userDetail: (userId: string) => apiRequest<AppUser>(`/api/admin/users/${userId}`),

  updateRates: (k18RatePer10g: number, k22RatePer10g: number, k24RatePer10g: number) =>
    apiRequest<CategoryGoldRates>("/api/admin/gold-rates", {
      method: "PUT",
      body: JSON.stringify({ k18RatePer10g, k22RatePer10g, k24RatePer10g }),
    }),

  todayPurchases: (period: "today" | "week" | "month" = "today") =>
    apiRequest<GoldTransaction[]>(`/api/admin/today-purchases?period=${period}`),

  allTransactions: (page = 1) =>
    apiRequest<PaginatedTransactions>(`/api/admin/transactions?page=${page}&limit=20`),

  payments: (page = 1, status?: string, userId?: string) => {
    const q = new URLSearchParams({ page: String(page), limit: "20" });
    if (status) q.set("status", status);
    if (userId) q.set("userId", userId);
    return apiRequest<PaginatedAdminPayments>(`/api/admin/payments?${q}`);
  },

  collectGold: (
    userId: string,
    body: { karat: GoldKarat; grams: number; collectAllPortfolio?: boolean; notes?: string }
  ) =>
    apiRequest<GoldTransaction>(`/api/admin/collect-gold/${userId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  currentScheme: () => apiRequest<SchemeInfo>("/api/admin/current-scheme"),
};
