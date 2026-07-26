/**
 * Lightweight toast notification system.
 *
 * Why not a library?
 *  - The whole feature is ~50 lines, so a library is overkill.
 *  - Rolling our own makes the demo more impressive: you can explain
 *    every line.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastKind = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: string;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  push: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastKind, ReactElement> = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <XCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-sky-500" />,
  warning: <TriangleAlert size={18} className="text-amber-500" />,
};

const STYLES: Record<ToastKind, string> = {
  success: 'ring-emerald-200 dark:ring-emerald-500/30 bg-white dark:bg-slate-800',
  error: 'ring-rose-200 dark:ring-rose-500/30 bg-white dark:bg-slate-800',
  info: 'ring-sky-200 dark:ring-sky-500/30 bg-white dark:bg-slate-800',
  warning: 'ring-amber-200 dark:ring-amber-500/30 bg-white dark:bg-slate-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, message, kind }]);
      setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
      warning: (m) => push(m, 'warning'),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 ${STYLES[t.kind]}`}
            >
              {ICONS[t.kind]}
              <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
