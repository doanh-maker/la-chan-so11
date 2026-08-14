import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-md animate-toast ${
              isSuccess
                ? 'bg-[#E8F5E9]/95 text-[#006E00] border-[#C8E6C9]'
                : isError
                ? 'bg-[#FFE9E9]/95 text-[#BA1A1A] border-[#FFDAD6]'
                : isWarning
                ? 'bg-[#FFF3E0]/95 text-[#E65100] border-[#FFE0B2]'
                : 'bg-[#E8DEF8]/95 text-[#4F378B] border-[#D0BCFF]'
            }`}
            role="alert"
          >
            <div className="flex items-center space-x-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {isError && <XCircle className="w-5 h-5 shrink-0" />}
              {isWarning && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 shrink-0" />}
              <p className="text-xs sm:text-sm font-bold leading-tight">{toast.message}</p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1.5 rounded-full hover:bg-black/5 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
