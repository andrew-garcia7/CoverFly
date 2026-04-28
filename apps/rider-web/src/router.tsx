import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./state/auth";
import { PaymentCheckoutPage } from "./ui/pages/PaymentCheckoutPage";
import { Shell } from "./ui/shell/Shell";
import { HomePage } from "./ui/pages/HomePage";
import { LoginPage } from "./ui/pages/LoginPage";
import { RegisterPage } from "./ui/pages/RegisterPage";
import { ForgotPasswordPage } from "./ui/pages/ForgotPasswordPage";
import { DriversPage } from "./ui/pages/DriversPage";
import { BookingPage } from "./ui/pages/BookingPage";
import { RideHistoryPage } from "./ui/pages/RideHistoryPage";
import { PaymentHistoryPage } from "./ui/pages/PaymentHistoryPage";
import { CustomerPage } from "./ui/pages/CustomerPage";
import { ProfilePage } from "./ui/pages/ProfilePage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="mx-auto grid max-w-3xl place-items-center px-4 py-16">
        <div className="rounded-3xl border border-slate-200 bg-white/80 px-6 py-5 text-sm text-slate-700 shadow-sm">
          Loading your session…
        </div>
      </div>
    );
  }

  // DEMO MODE AUTO LOGIN
  if (!user && !accessToken) {
    localStorage.setItem("accessToken", "demo-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "demo123",
        name: "Demo User",
        email: "demo@coverfly.com"
      })
    );
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route element={<Shell />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/forgot" element={<ForgotPasswordPage />} />

      {/* PROTECTED */}
      <Route element={<Shell />}>
        <Route
          path="/book"
          element={
            <RequireAuth>
              <BookingPage />
            </RequireAuth>
          }
        />

        <Route
          path="/drivers"
          element={
            <RequireAuth>
              <DriversPage />
            </RequireAuth>
          }
        />

        <Route
          path="/history"
          element={
            <RequireAuth>
              <RideHistoryPage />
            </RequireAuth>
          }
        />

        <Route
          path="/payments"
          element={
            <RequireAuth>
              <PaymentHistoryPage />
            </RequireAuth>
          }
        />

        <Route
  path="/payments/checkout"
  element={
    <RequireAuth>
      <PaymentCheckoutPage />
    </RequireAuth>
  }
/>

        <Route
          path="/customer"
          element={
            <RequireAuth>
              <CustomerPage />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}