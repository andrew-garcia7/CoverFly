import { motion } from "framer-motion";

export function SavedAddressesPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl cf-glass-light p-6">
        <div className="text-xs tracking-[0.24em] text-slate-600">SAVED</div>
        <div className="mt-1 text-3xl font-semibold text-slate-950">Saved addresses</div>
        <div className="mt-2 text-sm text-slate-600">
          This page will be fully backed by the user profile API next (create/list/delete addresses).
        </div>
      </motion.div>
    </div>
  );
}

