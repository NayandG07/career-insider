import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VARIANTS = {
  success: {
    icon: CheckCircle,
    bg: 'bg-white',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
    bar: 'bg-emerald-500',
    title: 'text-[#111827]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-white',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    bar: 'bg-red-500',
    title: 'text-[#111827]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-white',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    bar: 'bg-amber-500',
    title: 'text-[#111827]',
  },
  info: {
    icon: Info,
    bg: 'bg-white',
    border: 'border-indigo-200',
    iconColor: 'text-indigo-500',
    bar: 'bg-indigo-500',
    title: 'text-[#111827]',
  },
};

function ToastItem({ toast }) {
  const { removeToast } = useToast();
  const v = VARIANTS[toast.type] ?? VARIANTS.info;
  const Icon = v.icon;

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative flex items-start gap-3 w-[340px] max-w-[calc(100vw-2rem)] ${v.bg} border ${v.border} rounded-2xl px-4 py-3.5 shadow-xl shadow-black/[0.06] overflow-hidden`}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${v.bar} rounded-l-2xl`} />

      {/* Icon */}
      <Icon className={`w-4.5 h-4.5 ${v.iconColor} shrink-0 mt-0.5`} />

      {/* Message */}
      <p className={`flex-1 text-xs font-semibold ${v.title} leading-relaxed`}>
        {toast.message}
      </p>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 p-0.5 rounded-md text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/**
 * ToastContainer — fixed at top-right, renders all active toasts.
 * Mount this once near the root of the app (outside all cards/modals).
 */
export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
