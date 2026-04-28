import { CheckCircle2, CircleAlert, Info } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; message: string; kind: ToastKind };

const ToastCtx = createContext<{ push: (message: string, kind?: ToastKind) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev, { id, message, kind }]);
    window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 2800);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-120 flex w-[min(90vw,360px)] flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={
              item.kind === "success"
                ? "rounded-xl border border-emerald-300/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-50 shadow-lg backdrop-blur"
                : item.kind === "error"
                  ? "rounded-xl border border-rose-300/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-50 shadow-lg backdrop-blur"
                  : "rounded-xl border border-sky-300/40 bg-sky-500/15 px-3 py-2 text-sm text-sky-50 shadow-lg backdrop-blur"
            }
          >
            <div className="inline-flex items-center gap-2">
              {item.kind === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : item.kind === "error" ? (
                <CircleAlert className="h-4 w-4" />
              ) : (
                <Info className="h-4 w-4" />
              )}
              {item.message}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}

