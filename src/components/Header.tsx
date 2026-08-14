import React from 'react';
import { Shield, Sparkles, PhoneCall, Type, User, LogIn, Menu } from 'lucide-react';
import { UserProfile, NavTab } from '../types';
import { AvatarDropdown } from './AvatarDropdown';

interface HeaderProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
  onOpenEmergency: () => void;
  isLargeFont: boolean;
  onToggleLargeFont: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenMobileDrawer: () => void;
  onRoleChangeDemo?: (role: 'user' | 'moderator' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onOpenProfile,
  onSignOut,
  onOpenEmergency,
  isLargeFont,
  onToggleLargeFont,
  onNavigateTab,
  onOpenMobileDrawer,
  onRoleChangeDemo
}) => {
  return (
    <header className="relative z-30 bg-white border-b border-[#E1E2E9] text-[#1C1B1F] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Mobile Navigation Drawer Toggle + Brand Logo & Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <button
            onClick={onOpenMobileDrawer}
            className="md:hidden p-1.5 sm:p-2 rounded-full text-[#44474E] hover:text-[#1C1B1F] hover:bg-[#F3F3F7] transition cursor-pointer shrink-0"
            aria-label="Mở menu điều hướng mobile"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigateTab('home')}
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0061A4] flex items-center justify-center shadow-md text-white group-hover:scale-105 transition shrink-0">
              <Shield className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <h1 className="font-bold text-base sm:text-xl tracking-tight text-[#1C1B1F] whitespace-nowrap flex items-center gap-1">
                  Lá Chắn Số <span className="text-[#0061A4] font-black">AI</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D1E4FF] text-[#001D36] border border-[#B0C6FF] whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 text-[#0061A4]" />
                  Gemini AI 3.6
                </span>
              </div>
              <p className="text-xs text-[#44474E] hidden md:block font-normal truncate">
                Phòng chống lừa đảo trực tuyến với Gemini AI
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Font Size Toggle for Elderly Users */}
          <button
            onClick={onToggleLargeFont}
            title="Bật/Tắt Chế độ Chữ lớn cho người cao tuổi"
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium transition flex items-center space-x-1 border cursor-pointer ${
              isLargeFont
                ? 'bg-[#FEF7FF] text-[#0061A4] border-[#0061A4] font-bold'
                : 'bg-[#F3F3F7] text-[#44474E] border-[#C4C6D0] hover:bg-[#E7E8EE]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="hidden md:inline">Chữ Lớn</span>
          </button>

          {/* Emergency Hotline Button */}
          <button
            onClick={onOpenEmergency}
            className="p-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#BA1A1A] hover:bg-[#93000A] text-white transition flex items-center space-x-1 shadow-xs cursor-pointer"
            title="Đường dây nóng khẩn cấp 113 / 156"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden sm:inline">Hotline 113/156</span>
          </button>

          {/* User Auth / Avatar Section */}
          {user ? (
            <AvatarDropdown
              user={user}
              onNavigateTab={onNavigateTab}
              onOpenProfile={onOpenProfile}
              onSignOut={onSignOut}
              onRoleChangeDemo={onRoleChangeDemo}
            />
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-[#0061A4] hover:bg-[#004B80] text-white transition flex items-center space-x-1 shadow-xs cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden xs:inline">Đăng Nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
