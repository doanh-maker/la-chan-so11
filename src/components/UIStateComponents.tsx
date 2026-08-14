import React from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  SearchX, 
  Inbox, 
  MessageSquareX, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

// ======================== SKELETON LOADERS ======================== //

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3 w-full animate-pulse" aria-busy="true" aria-label="Đang tải dữ liệu...">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E1E2E9] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-[#E1E2E9] rounded-full w-1/4"></div>
            <div className="h-3 bg-[#E1E2E9] rounded-full w-1/6"></div>
          </div>
          <div className="h-5 bg-[#E1E2E9] rounded-lg w-3/4"></div>
          <div className="space-y-1.5">
            <div className="h-3.5 bg-[#E1E2E9] rounded-full w-full"></div>
            <div className="h-3.5 bg-[#E1E2E9] rounded-full w-5/6"></div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-[#F3F3F7]">
            <div className="h-3 bg-[#E1E2E9] rounded-full w-1/5"></div>
            <div className="h-8 bg-[#E1E2E9] rounded-xl w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const AnalysisSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 space-y-6 animate-pulse" aria-busy="true" aria-label="AI đang phân tích...">
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 bg-[#E1E2E9] rounded-2xl"></div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-[#E1E2E9] rounded-lg w-1/3"></div>
          <div className="h-4 bg-[#E1E2E9] rounded-full w-1/2"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="h-20 bg-[#F3F3F7] rounded-2xl"></div>
        <div className="h-20 bg-[#F3F3F7] rounded-2xl"></div>
        <div className="h-20 bg-[#F3F3F7] rounded-2xl"></div>
      </div>

      <div className="space-y-2">
        <div className="h-4 bg-[#E1E2E9] rounded-full w-1/4"></div>
        <div className="h-16 bg-[#F3F3F7] rounded-2xl"></div>
      </div>

      <div className="space-y-3">
        <div className="h-4 bg-[#E1E2E9] rounded-full w-1/3"></div>
        <div className="h-12 bg-[#F3F3F7] rounded-xl"></div>
        <div className="h-12 bg-[#F3F3F7] rounded-xl"></div>
      </div>
    </div>
  );
};

export const ChatMessageSkeleton: React.FC = () => {
  return (
    <div className="flex items-start space-x-3 animate-pulse" aria-busy="true">
      <div className="w-9 h-9 rounded-2xl bg-[#D1E4FF] shrink-0"></div>
      <div className="bg-white border border-[#E1E2E9] rounded-2xl p-4 max-w-lg space-y-2 flex-1">
        <div className="h-3.5 bg-[#E1E2E9] rounded-full w-3/4"></div>
        <div className="h-3.5 bg-[#E1E2E9] rounded-full w-full"></div>
        <div className="h-3.5 bg-[#E1E2E9] rounded-full w-2/3"></div>
      </div>
    </div>
  );
};

// ======================== EMPTY STATES ======================== //

interface EmptyStateProps {
  icon?: 'search' | 'inbox' | 'chat' | 'history';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-[#E1E2E9] rounded-[28px] p-8 sm:p-12 text-center space-y-4 my-4 max-w-xl mx-auto shadow-xs"
    >
      <div className="w-16 h-16 rounded-3xl bg-[#F3F3F7] border border-[#E1E2E9] text-[#0061A4] mx-auto flex items-center justify-center shadow-2xs">
        {icon === 'search' && <SearchX className="w-8 h-8 text-[#44474E]" />}
        {icon === 'inbox' && <Inbox className="w-8 h-8 text-[#0061A4]" />}
        {icon === 'chat' && <MessageSquareX className="w-8 h-8 text-[#4F378B]" />}
        {icon === 'history' && <ShieldAlert className="w-8 h-8 text-[#E65100]" />}
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg font-black text-[#1C1B1F] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-5 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold transition shadow-xs focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer flex items-center space-x-1.5"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E1E2E9] text-[#1C1B1F] text-xs font-bold transition border border-[#E1E2E9] focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:ring-offset-2 focus-visible:outline-none cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ======================== ERROR STATE CARD ======================== //

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onOpenEmergency?: () => void;
}

export const ErrorStateCard: React.FC<ErrorStateProps> = ({
  title = 'Đã Xảy Ra Lỗi Kiểm Tra',
  message,
  onRetry,
  onOpenEmergency
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#FFE9E9] border border-[#FFDAD6] rounded-[28px] p-6 sm:p-8 space-y-4 my-4 max-w-xl mx-auto shadow-xs"
      role="alert"
    >
      <div className="flex items-center space-x-3 text-[#BA1A1A]">
        <div className="w-10 h-10 rounded-2xl bg-[#FFDAD6] flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-black">{title}</h3>
      </div>

      <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed bg-white/70 p-4 rounded-2xl border border-[#FFDAD6]">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#BA1A1A] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại kiểm tra</span>
          </button>
        )}

        {onOpenEmergency && (
          <button
            onClick={onOpenEmergency}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#E65100] focus-visible:outline-none"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Cần trợ giúp khẩn cấp?</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ======================== SUCCESS ANIMATION BADGE ======================== //

export const SuccessBadgeAnimation: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#006E00] text-xs sm:text-sm font-extrabold shadow-2xs"
    >
      <motion.div
        initial={{ rotate: -45, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        <CheckCircle2 className="w-5 h-5 text-[#006E00]" />
      </motion.div>
      <span>{message}</span>
    </motion.div>
  );
};
