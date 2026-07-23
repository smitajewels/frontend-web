import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { GuestRoute, ProtectedRoute, RootRedirect } from "./components/ProtectedRoute";
import { AdminLayout, UserLayout } from "./layouts/AppLayouts";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import HomePage from "./pages/user/HomePage";
import BuyGoldPage from "./pages/user/BuyGoldPage";
import HistoryPage from "./pages/user/HistoryPage";
import CollectPage from "./pages/user/CollectPage";
import ProfilePage from "./pages/user/ProfilePage";
import ChangePasswordPage from "./pages/user/ChangePasswordPage";

import AdminDashboardPage from "./pages/admin/DashboardPage";
import AddRatePage from "./pages/admin/AddRatePage";
import CollectGoldPage from "./pages/admin/CollectGoldPage";
import CollectGoldUserPage from "./pages/admin/CollectGoldUserPage";
import CustomersPage from "./pages/admin/CustomersPage";
import UserDetailPage from "./pages/admin/UserDetailPage";
import TodayPurchasesPage from "./pages/admin/TodayPurchasesPage";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage";
import SchemePage from "./pages/admin/SchemePage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />

          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute role="USER" />}>
            <Route path="/app" element={<UserLayout />}>
              <Route index element={<HomePage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="collect" element={<CollectPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="/app/buy" element={<BuyGoldPage />} />
            <Route path="/app/change-password" element={<ChangePasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="rates" element={<AddRatePage />} />
              <Route path="collect" element={<CollectGoldPage />} />
              <Route path="collect/:userId" element={<CollectGoldUserPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/:userId" element={<UserDetailPage />} />
              <Route path="purchases" element={<TodayPurchasesPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="scheme" element={<SchemePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            border: "1px solid #E8DFD0",
            color: "#2C2416",
          },
        }}
      />
    </AuthProvider>
  );
}
