import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./state/auth.tsx";
import { AppRouter } from "./router.tsx";
import { CarLoadingAnimation } from "./ui/shell/CarLoadingAnimation.tsx";
import { ToastProvider } from "./ui/shell/ToastProvider.tsx";

const BOOT_KEY = "coverfly-boot-once";

export function AppRoot() {
  const [showBoot, setShowBoot] = useState(() => {
    try {
      return !sessionStorage.getItem(BOOT_KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!showBoot) return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(BOOT_KEY, "1");
      } catch {
        /* ignore */
      }
      setShowBoot(false);
    }, 1100);
    return () => window.clearTimeout(id);
  }, [showBoot]);

  if (showBoot) {
    return <CarLoadingAnimation fullScreen />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRouter />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
