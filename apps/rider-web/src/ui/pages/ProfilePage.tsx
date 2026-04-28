import { motion } from "framer-motion";
import { useAuth } from "../../state/auth";

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl cf-glass-light p-6">
        <div className="text-xs tracking-[0.24em] text-slate-600">PROFILE</div>
        <div className="mt-1 text-3xl font-semibold text-slate-950">{user?.name}</div>
        <div className="mt-2 text-sm text-slate-600">
          Role: <span className="font-medium text-slate-900">{user?.role}</span>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-white border border-slate-100 p-4">
            <div className="text-slate-500 text-xs">Email</div>
            <div className="font-medium text-slate-950">{user?.email ?? "—"}</div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 p-4">
            <div className="text-slate-500 text-xs">Phone</div>
            <div className="font-medium text-slate-950">{user?.phone ?? "—"}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

