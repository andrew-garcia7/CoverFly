import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiBase, parseApiError } from "../../lib/api.ts";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase}/api/auth/v1/auth/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        await parseApiError(res, `${apiBase}/api/auth/v1/auth/forgot`);
        throw new Error("failed");
      }
      // For dev/demo, backend returns a resetToken. In production, this would be emailed.
      setStatus(data.resetToken ? `Reset token (dev): ${data.resetToken}` : "Check your email for reset instructions.");
    } catch {
      setStatus("Could not start reset. Verify email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[520px] px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl cf-glass-light p-6">
        <div className="text-xs tracking-[0.24em] text-slate-600">ACCOUNT RECOVERY</div>
        <div className="mt-1 text-2xl font-semibold text-slate-950">Forgot password</div>
        <div className="mt-2 text-sm text-slate-600">
          Enter your email to receive reset instructions. (Dev mode shows token.)
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="text-sm block">
            <div className="text-slate-600 mb-1">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600/20"
              placeholder="you@email.com"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-2xl px-4 py-3 bg-slate-950 text-white font-semibold hover:bg-black disabled:opacity-60"
          >
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {status && <div className="mt-4 text-sm text-slate-700">{status}</div>}

        <div className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="hover:underline">
            Back to login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

