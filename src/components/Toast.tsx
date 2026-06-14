import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  key?: string;
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 mr-2 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 mr-2 shrink-0" />,
  };

  const bgClasses = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-300",
    error: "bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/30 dark:text-rose-300",
    info: "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-blue-300",
  };

  return (
    <div
      id={`toast-${toast.id}`}
      style={{ animation: "slideIn 0.3s ease-out forwards" }}
      className={`flex items-center p-3 mb-3 border rounded-xl shadow-lg transition-all max-w-sm ${bgClasses[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="text-sm font-medium pr-4 leading-snug">{toast.message}</div>
      <button
        id={`close-toast-${toast.id}`}
        onClick={() => onClose(toast.id)}
        className="ml-auto hover:opacity-75 transition-opacity focus:outline-none"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
