import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav.tsx";
import { Footer } from "./Footer.tsx";

export function Shell() {
  return (
    <div className="cf-bg min-h-screen">
      <TopNav />
      <Outlet />
      <Footer />
    </div>
  );
}
