import { motion } from "framer-motion";
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";

export function LoginPage() {
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      localStorage.setItem("coverfly_access_token", "demo-token");

      localStorage.setItem(
        "coverfly_user",
        JSON.stringify({
          _id: "demo123",
          role: "RIDER",
          name: "Demo User",
          email: emailOrPhone
        })
      );

      window.location.href = from;
    } catch {
      setErr("Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-130 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl cf-glass-light p-6"
      >
        <div className="text-xs tracking-[0.24em] text-slate-600">
          WELCOME BACK
        </div>

        <div className="mt-1 text-2xl font-semibold text-slate-950">
          Login
        </div>

        <div className="mt-2 text-sm text-slate-600">
          Use email or phone. Your session is secured by JWT.
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Email or phone</div>

            <input
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="you@email.com or +91..."
              required
            />
          </label>

          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Password</div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="••••••••"
              required
            />
          </label>

          {err && <div className="text-sm text-rose-700">{err}</div>}

          <button
            disabled={busy}
            className="w-full rounded-2xl px-4 py-3 bg-slate-950 text-white font-semibold hover:bg-black disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600 flex items-center justify-between">
          <Link className="hover:underline" to="/forgot-password">
            Forgot password?
          </Link>

          <Link className="hover:underline" to="/register">
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}