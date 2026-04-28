import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../state/auth";
import { Logo3D } from "./Logo3D";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          "group relative px-1 py-2 text-base font-medium tracking-wide transition-colors",
          isActive ? "text-blue-600" : "text-slate-700 hover:text-blue-600",
          "after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-blue-600",
          "after:scale-x-0 after:origin-left after:transition-transform after:duration-200 group-hover:after:scale-x-100",
          isActive && "after:scale-x-100"
        )
      }
    >
      <span className="inline-flex items-center transition-transform duration-200 group-hover:-translate-y-px">
        {label}
      </span>
    </NavLink>
  );
}

export function TopNav() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = useMemo(
    () => [
      { to: "/", label: "Home", show: true },
      { to: "/book", label: "Book", show: true },
      { to: "/drivers", label: "Drivers", show: true },
      { to: "/history", label: "History", show: true },
      { to: "/payments", label: "Payment", show: true },
      { to: "/customer", label: "Customer", show: true },
      { to: "/profile", label: "Profile", show: Boolean(user) }
    ],
    [user]
  );

  return (
    <div
      className={cx(
        "sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-black/5",
        "transition-shadow duration-200",
        scrolled ? "shadow-[0_10px_30px_rgba(2,6,23,0.10)]" : "shadow-[0_6px_18px_rgba(2,6,23,0.06)]"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-6">
        <motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  className="flex items-center shrink-0"
>
  <Logo3D variant="nav" />
</motion.div>

        <div className="hidden md:flex items-center gap-8">
          {navItems
            .filter((i) => i.show)
            .map((i) => (
              <NavItem key={i.to} to={i.to} label={i.label} />
            ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            className="md:hidden rounded-2xl px-3 py-2 border border-slate-200 bg-white/70 hover:bg-white transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <div className="h-5 w-5 grid content-center gap-1">
              <span className="block h-0.5 w-5 bg-slate-900 rounded-full" />
              <span className="block h-0.5 w-5 bg-slate-900 rounded-full opacity-80" />
              <span className="block h-0.5 w-5 bg-slate-900 rounded-full opacity-60" />
            </div>
          </button>
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 rounded-2xl px-3 py-2 cf-glass text-white"
              >
                <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
                  {user.name
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="text-sm font-medium">{user.name}</div>
              </Link>
              <button
                onClick={logout}
                className="rounded-2xl px-4 py-2.5 border border-slate-200 bg-white/80 text-slate-900 hover:bg-white text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-2xl px-4 py-2.5 border border-slate-200 bg-white/80 text-slate-900 hover:bg-white text-sm font-medium transition"
              >
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.99 }}>
                <Link
                  to="/register"
                  className={cx(
                    "rounded-2xl px-4 py-2.5 text-sm font-semibold text-white",
                    "bg-linear-to-r from-blue-600 via-indigo-600 to-slate-950",
                    "shadow-[0_14px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_18px_55px_rgba(37,99,235,0.32)]",
                    "transition-shadow"
                  )}
                >
                  Create account
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-[86vw] max-w-95 bg-white/85 backdrop-blur-md border-l border-black/5 shadow-[0_20px_80px_rgba(2,6,23,0.25)]"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-950">Menu</div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-sm"
                >
                  Close
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="rounded-3xl bg-white border border-slate-200 p-3">
                  <div className="flex flex-col gap-2">
                    {navItems
                      .filter((i) => i.show)
                      .map((i) => (
                        <NavItem
                          key={i.to}
                          to={i.to}
                          label={i.label}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl px-4 py-3 cf-glass text-white font-medium"
                      >
                        {user.name}
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                        }}
                        className="rounded-2xl px-4 py-3 border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl px-4 py-3 border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 font-medium"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileOpen(false)}
                        className="rounded-2xl px-4 py-3 text-white font-semibold bg-linear-to-r from-blue-600 via-indigo-600 to-slate-950 shadow-[0_14px_40px_rgba(37,99,235,0.25)]"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

