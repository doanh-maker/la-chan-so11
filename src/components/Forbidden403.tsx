import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, UserCheck, KeyRound, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface Forbidden403Props {
  requiredRole: 'user' | 'moderator' | 'admin';
  userRole: UserRole;
  onGoHome: () => void;
  onOpenAuth?: () => void;
  onSwitchRoleDemo?: (newRole: 'user' | 'moderator' | 'admin') => void;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  requiredRole,
  userRole,
  onGoHome,
  onOpenAuth,
  onSwitchRoleDemo
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản Trị Viên (Admin)';
      case 'moderator': return 'Kiểm Duyệt Viên (Moderator)';
      case 'user': return 'Người Dùng (User)';
      default: return 'Khách Truy Cập (Guest)';
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-[#FFDAD6] text-[#410002] border-[#FFB4AB]';
      case 'moderator': return 'bg-[#E8DEF8] text-[#1D192B] border-[#D0BCFF]';
      case 'user': return 'bg-[#D1E4FF] text-[#001D36] border-[#A3C9FF]';
      default: return 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9]';
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-[#FFDAD6] rounded-[28px] max-w-lg w-full p-8 text-center space-y-6 shadow-xl relative overflow-hidden"
      >
        {/* Top Decorative Alert Banner */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#BA1A1A] via-[#E65100] to-[#BA1A1A]" />

        {/* Big Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center shadow-md border border-[#FFB4AB]">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FFDAD6] text-[#410002] text-xs font-black tracking-wider uppercase border border-[#FFB4AB]">
            <Lock className="w-3.5 h-3.5" />
            <span>403 FORBIDDEN - BẢO MẬT HỆ THỐNG</span>
          </span>
          <h2 className="text-2xl font-black text-[#1C1B1F]">
            Không Có Quyền Truy Cập
          </h2>
          <p className="text-sm text-[#44474E] leading-relaxed">
            Khu vực này yêu cầu cấp quyền từ hệ thống phân quyền (RBAC).
          </p>
        </div>

        {/* Roles Details Box */}
        <div className="bg-[#F3F3F7] p-4 rounded-2xl border border-[#E1E2E9] text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#44474E] font-medium">Quyền hiện tại của bạn:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getRoleBadgeStyle(userRole)}`}>
              {getRoleLabel(userRole)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#E1E2E9]">
            <span className="text-[#44474E] font-medium">Mức quyền tối thiểu cần có:</span>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${getRoleBadgeStyle(requiredRole)}`}>
              {getRoleLabel(requiredRole)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-sm transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay Về Trang Chủ</span>
          </button>

          {userRole === 'guest' && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] font-bold text-sm border border-[#E1E2E9] transition flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-[#0061A4]" />
              <span>Đăng Nhập Ngay</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
