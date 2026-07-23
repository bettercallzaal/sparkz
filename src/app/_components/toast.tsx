"use client";

import { createContext, useCallback, useContext, useState } from "react";

// Lightweight toast system (the sonner/shadcn pattern, zero-dependency). A single
// provider at the app root exposes useToast(); toasts auto-dismiss and stack.
type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  msg: string;
  kind: Kind;
}

const ToastCtx = createContext<(msg: string, kind?: Kind) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

const ACCENT: Record<Kind, string> = {
  success: "border-accent/50",
  error: "border-red-500/50",
  info: "border-border",
};
const DOT: Record<Kind, string> = {
  success: "bg-accent",
  error: "bg-red-500",
  info: "bg-muted",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((msg: string, kind: Kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`toast-in glass pointer-events-auto flex max-w-sm items-center gap-2.5 border px-4 py-2.5 text-sm ${ACCENT[t.kind]}`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[t.kind]}`} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
