import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastCtx = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, options = {}) => {
    const id = nextId++;
    const toast = {
      id,
      message,
      variant: options.variant || 'success',
      duration: options.duration ?? 3500,
    };
    setToasts((cur) => [...cur, toast]);
    if (toast.duration > 0) {
      setTimeout(() => dismiss(id), toast.duration);
    }
    return id;
  }, [dismiss]);

  const api = {
    show,
    success: (m, o) => show(m, { ...o, variant: 'success' }),
    error: (m, o) => show(m, { ...o, variant: 'error', duration: 6000 }),
    info: (m, o) => show(m, { ...o, variant: 'info' }),
    dismiss,
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Safe fallback so non-provider trees don't crash — log only
    return {
      show: (m) => console.log('[toast]', m),
      success: (m) => console.log('[toast/success]', m),
      error: (m) => console.error('[toast/error]', m),
      info: (m) => console.log('[toast/info]', m),
      dismiss: () => {},
    };
  }
  return ctx;
}

const VARIANT_STYLES = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-600',
    text: 'text-white',
    iconColor: 'text-white',
    role: 'status',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-rose-600',
    text: 'text-white',
    iconColor: 'text-white',
    role: 'alert',
  },
  info: {
    icon: Info,
    bg: 'bg-zinc-800',
    text: 'text-white',
    iconColor: 'text-zinc-300',
    role: 'status',
  },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[min(92vw,380px)] pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const style = VARIANT_STYLES[toast.variant] || VARIANT_STYLES.info;
  const Icon = style.icon;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      role={style.role}
      className={`pointer-events-auto ${style.bg} ${style.text} rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 transition-all duration-200 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Icon size={18} className={`${style.iconColor} flex-shrink-0`} />
      <p className="font-bold text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="p-0.5 rounded hover:bg-white/20 transition-colors flex-shrink-0"
        aria-label="Fermer la notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
