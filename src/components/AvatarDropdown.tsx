import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ChevronDown, 
  KeyRound, 
  UserCheck, 
  Sliders, 
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';
import { UserProfile, UserRole, NavTab } from '../types';

interface AvatarDropdownProps {
  user: UserProfile;
  onNavigateTab: (tab: NavTab) => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  onRoleChangeDemo?: (role: 'user' | 'moderator' | 'admin') => void;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  user,
  onNavigateTab,
  onOpenProfile,
  onSignOut,
  onRoleChangeDemo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const role: 'user' | 'moderator' | 'admin' = (user.role as any) || 'user';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin':
        return { label: 'Quản Trị Viên', bg: 'bg-[#FFDAD6]', text: 'text-[#BA1A1A]', border: 'border-[#FFB4AB]' };
      case 'moderator':
        return { label: 'Kiểm Duyệt Viên', bg: 'bg-[#E8DEF8]', text: 'text-[#4F378B]', border: 'border-[#D0BCFF]' };
      default:
        return { label: 'Người Dùng', bg: 'bg-[#D1E4FF]', text: 'text-[#001D36]', border: 'border-[#A3C9FF]' };
    }
  };

  const badge = getRoleBadge(role);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] border border-[#E1E2E9] transition cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
      >
        <img
          src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
          alt={user.displayName}
          className="w-8 h-8 rounded-full ring-2 ring-[#0061A4]/30 object-cover group-hover:scale-105 transition"
        />
        <span className="text-xs font-bold text-[#1C1B1F] hidden sm:inline max-w-[120px] truncate">
          {user.displayName}
        </span>
        <span className={`hidden lg:inline px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}>
          {badge.label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#44474E] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* MD3 Animated Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-[24px] border border-[#E1E2E9] shadow-xl py-2 z-50 divide-y divide-[#E1E2E9] overflow-hidden animate-dropdown"
        >
          {/* Header User Details */}
          <div className="p-4 bg-[#F8F9FE] space-y-2">
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                alt={user.displayName}
                className="w-10 h-10 rounded-full ring-2 ring-[#0061A4]/20 object-cover"
              />
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-sm text-[#1C1B1F] truncate">{user.displayName}</h4>
                <p className="text-xs text-[#74777F] truncate">{user.email || 'Google User'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-[#44474E] font-medium">Vai trò hệ thống:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Main Navigation Links */}
          <div className="py-1">
            <button
              onClick={() => {
                onNavigateTab('profile');
                onOpenProfile();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-xs font-semibold text-[#1C1B1F] hover:bg-[#D1E4FF]/40 hover:text-[#0061A4] transition flex items-center space-x-3 text-left cursor-pointer"
            >
              <User className="w-4 h-4 text-[#0061A4]" />
              <span>Thông tin cá nhân</span>
            </button>

            <button
              onClick={() => {
                onNavigateTab('history');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-xs font-semibold text-[#1C1B1F] hover:bg-[#D1E4FF]/40 hover:text-[#0061A4] transition flex items-center space-x-3 text-left cursor-pointer"
            >
              <History className="w-4 h-4 text-[#0061A4]" />
              <span>Lịch sử phân tích</span>
            </button>

            {role === 'admin' && (
              <button
                onClick={() => {
                  onNavigateTab('admin');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-xs font-bold text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition flex items-center space-x-3 text-left cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#BA1A1A]" />
                <span>Quản trị Admin Dashboard</span>
              </button>
            )}

            {role === 'moderator' && (
              <button
                onClick={() => {
                  onNavigateTab('moderator');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2.5 text-xs font-bold text-[#4F378B] hover:bg-[#E8DEF8]/50 transition flex items-center space-x-3 text-left cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#4F378B]" />
                <span>Trang Kiểm Duyệt Moderator</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenProfile();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-xs font-semibold text-[#1C1B1F] hover:bg-[#D1E4FF]/40 hover:text-[#0061A4] transition flex items-center space-x-3 text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#44474E]" />
              <span>Cài đặt hệ thống</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition flex items-center space-x-3 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#BA1A1A]" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
