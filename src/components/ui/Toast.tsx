'use client';

// ============================================================
// FILE: components/ui/Toast.tsx
//
// FIX: Error 2614 — "Module has no exported member 'useToast'"
//
// Root cause: original file was a plain component with only a
// default export. LoginClient and SignupClient both import:
//   import { useToast } from '@/components/ui/Toast'
// which requires a NAMED export.
//
// Solution: full context-based toast system with:
//   • ToastProvider  — wraps _app / layout
//   • useToast       — named hook → { success, error, info }
//   • Toast          — default export (rendered by provider)
//
// Usage in layout.tsx:
//   import { ToastProvider } from '@/components/ui/Toast';
//   <ToastProvider><App /></ToastProvider>
//
// Usage in components:
//   import { useToast } from '@/components/ui/Toast';
//   const { success, error } = useToast();
//   success('Booking confirmed! 🌸');
// ============================================================

import React, {
  createContext, useContext, useCallback,
  useState, useEffect, ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id:      string;
  message: string;
  type:    ToastType;
}

interface ToastContextValue {
  success: (message: string) => void;
  error:   (message: string) => void;
  info:    (message: string) => void;
}

// ── Context ──────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 3.5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — fixed bottom-right, stacks upward */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ── Named hook (what LoginClient / SignupClient import) ──────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback if ToastProvider is missing — logs to console
    return {
      success: (msg) => console.log('[Toast success]', msg),
      error:   (msg) => console.error('[Toast error]', msg),
      info:    (msg) => console.info('[Toast info]', msg),
    };
  }
  return ctx;
}

// ── Internal ToastItem component ─────────────────────────────
const TOAST_STYLES: Record<ToastType, {
  bg: string; border: string; text: string; icon: React.ReactNode;
}> = {
  success: {
    bg:     'bg-[#F0FFF8]',
    border: 'border-[rgba(45,122,79,0.25)]',
    text:   'text-[#1a5c3a]',
    icon:   <CheckCircle className="w-4 h-4 text-[#2D7A4F] flex-shrink-0 mt-0.5" />,
  },
  error: {
    bg:     'bg-[#FFF0F3]',
    border: 'border-[rgba(155,35,53,0.25)]',
    text:   'text-[#9B2335]',
    icon:   <AlertCircle className="w-4 h-4 text-[#9B2335] flex-shrink-0 mt-0.5" />,
  },
  info: {
    bg:     'bg-[#F5F0FF]',
    border: 'border-[rgba(108,63,170,0.2)]',
    text:   'text-plum',
    icon:   <Info className="w-4 h-4 text-plum flex-shrink-0 mt-0.5" />,
  },
};

function ToastItem({
  toast, onDismiss,
}: { toast: ToastItem; onDismiss: () => void }) {
  const styles = TOAST_STYLES[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`
        pointer-events-auto flex items-start gap-2.5
        px-4 py-3 rounded-2xl shadow-lg
        border ${styles.bg} ${styles.border}
        max-w-[320px] w-full
      `}
    >
      {styles.icon}
      <p className={`text-[13px] font-medium flex-1 leading-relaxed ${styles.text}`}>
        {toast.message}
      </p>
      <button
        onClick={onDismiss}
        className={`${styles.text} opacity-50 hover:opacity-100
          transition-opacity flex-shrink-0 mt-0.5`}
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── Default export (plain Toast for direct use if needed) ────
export default function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?:   ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = TOAST_STYLES[type];

  return (
    <div className={`
      fixed bottom-4 right-4 z-50 flex items-center gap-2.5
      px-4 py-3 rounded-2xl shadow-lg border max-w-[300px]
      ${styles.bg} ${styles.border}
    `}>
      {styles.icon}
      <p className={`text-[13px] font-medium ${styles.text}`}>{message}</p>
    </div>
  );
}