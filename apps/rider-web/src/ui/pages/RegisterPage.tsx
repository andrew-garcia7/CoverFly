import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
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
          name: name || "Demo User",
          email: email || "demo@coverfly.com",
          phone: phone || ""
        })
      );

      window.location.href = "/";
    } catch {
      setErr("Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[520px] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl cf-glass-light p-6"
      >
        <div className="text-xs tracking-[0.24em] text-slate-600">
          CREATE YOUR ACCOUNT
        </div>

        <div className="mt-1 text-2xl font-semibold text-slate-950">
          Register
        </div>

        <div className="mt-2 text-sm text-slate-600">
          Premium rides with safety + split fare + live tracking.
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Full name</div>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="Your name"
            />
          </label>

          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Email (optional)</div>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="you@email.com"
            />
          </label>

          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Phone (optional)</div>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="+91..."
            />
          </label>

          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Password</div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="Minimum 6 characters"
            />
          </label>

          {err && <div className="text-sm text-rose-700">{err}</div>}

          <button
            disabled={busy}
            className="w-full rounded-2xl px-4 py-3 bg-blue-700 text-white font-semibold hover:bg-blue-800 disabled:opacity-60"
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600 flex items-center justify-between">
          <Link className="hover:underline" to="/login">
            Already have an account?
          </Link>
        </div>
      </motion.div>
    </div>
  );
}