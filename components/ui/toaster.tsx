"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Toast = { id: number; text: string; tone: "ok" | "error" };
const ToastContext = createContext<(text: string, tone?: "ok" | "error") => void>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useMemo(
    () => (text: string, tone: "ok" | "error" = "ok") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, text, tone }]);
      setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600);
    },
    [],
  );
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-24 right-4 z-[70] flex w-[min(92vw,320px)] flex-col gap-2 md:bottom-6">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-card ${toast.tone === "error" ? "bg-white text-danger" : "bg-ink text-white"}`}>
            {toast.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
