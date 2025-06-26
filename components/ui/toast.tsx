"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastVariants = {
  initial: { 
    opacity: 0, 
    y: 50, 
    scale: 0.3,
    x: "100%"
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    opacity: 0, 
    y: -50, 
    scale: 0.3,
    x: "100%",
    transition: {
      duration: 0.2
    }
  }
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle
};

const colors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-yellow-500"
};

export function Toast({ id, type, title, message, duration = 4000, onClose }: ToastProps) {
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-sm w-full",
        colors[type]
      )}
    >
      <div className="flex-shrink-0">
        <Icon className={cn("w-5 h-5", iconColors[type])} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        {message && (
          <p className="text-sm mt-1 opacity-90">{message}</p>
        )}
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-lg"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[], onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook para manejar toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id, onClose: removeToast };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string) => {
    addToast({ type: "success", title, message });
  };

  const error = (title: string, message?: string) => {
    addToast({ type: "error", title, message });
  };

  const info = (title: string, message?: string) => {
    addToast({ type: "info", title, message });
  };

  const warning = (title: string, message?: string) => {
    addToast({ type: "warning", title, message });
  };

  return {
    toasts,
    success,
    error,
    info,
    warning,
    removeToast
  };
} 