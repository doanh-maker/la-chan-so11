import React from 'react';
import { 
  Home, 
  ShieldCheck, 
  Globe, 
  Bot, 
  Users, 
  History, 
  User, 
  SlidersHorizontal, 
  UserCheck, 
  X, 
  LogIn, 
  LogOut, 
  Shield, 
  PhoneCall, 
  Type, 
  Sparkles,
  ChevronRight,
  Gamepad2
} from 'lucide-react';
import { UserProfile, UserRole, NavTab } from '../types';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenEmergency: () => void;
  isLargeFont: boolean;
  onToggleLargeFont: () => void;
  onRoleChangeDemo?: (role: 'user' | 'moderator' | 'admin') => void;
  reportCount?: number;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  user,
  onOpenAuth,
  onSignOut,
  onOpenEmergency,
  isLargeFont,
  onToggleLargeFont,
  onRoleChangeDemo,
  reportCount = 5
}) => {
  const role: UserRole = user ? ((user.role as any) || 'user') : 'guest';

  // Define tabs per role according to prompt specification
  const getTabsForRole = () => {
    const baseTabs = [
      { id: 'home' as NavTab, label: 'Trang Chủ', icon: Home },
      { id: 'simulator' as NavTab, label: 'Giả Lập Bẫy AI', icon: Gamepad2 },
      { id: 'chat' as NavTab, label: 'Trợ Lý AI', icon: Bot },
      { id: 'community' as NavTab, label: 'Cảnh Báo', icon: Users, badge: reportCount },
    ];

    if (role === 'guest') {
      return baseTabs;
    }

    const authTabs = [
      ...baseTabs,
      { id: 'history' as NavTab, label: 'Lịch Sử', icon: History },
    ];

    if (role === 'moderator') {
      authTabs.push({ id: 'moderator' as NavTab, label: 'Kiểm Duyệt', icon: UserCheck });
    }

    if (role === 'admin') {
      authTabs.push({ id: 'admin' as NavTab, label: 'Quản Trị Admin', icon: SlidersHorizontal });
    }

    authTabs.push({ id: 'profile' as NavTab, label: 'Hồ Sơ', icon: User });

    return authTabs;
  };

  const navTabs = getTabsForRole();

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'admin': return { label: 'Quản Trị Viên', bg: 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFB4AB]' };
      case 'moderator': return { label: 'Kiểm Duyệt Viên', bg: 'bg-[#E8DEF8] text-[#4F378B] border-[#D0BCFF]' };
      case 'user': return { label: 'Người Dùng', bg: 'bg-[#D1E4FF] text-[#001D36] border-[#A3C9FF]' };
      default: return { label: 'Khách Vãng Lai', bg: 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9]' };
    }
  };

  const badge = getRoleBadge(role);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-fade-in"
      />
      <div
        className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl flex flex-col justify-between overflow-y-auto md:hidden rounded-r-[28px] border-r border-[#E1E2E9] animate-slide-left"
      >
        {/* Top Header */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0061A4] flex items-center justify-center text-white shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-[#1C1B1F]">Lá Chắn Số AI</h2>
                <p className="text-[10px] text-[#44474E]">MD3 Navigation Drawer</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#44474E] hover:text-[#1C1B1F] rounded-full hover:bg-[#F3F3F7]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card or Guest Banner */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-[#F8F9FE] border border-[#E1E2E9] space-y-2">
              <div className="flex items-center space-x-3">
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                  alt={user.displayName}
                  className="w-10 h-10 rounded-full ring-2 ring-[#0061A4]/30 object-cover"
                />
                <div className="overflow-hidden">
                  <h3 className="font-extrabold text-xs text-[#1C1B1F] truncate">{user.displayName}</h3>
                  <p className="text-[11px] text-[#74777F] truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#E1E2E9]">
                <span className="text-[11px] text-[#44474E]">Vai trò:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#D1E4FF]/40 border border-[#A3C9FF] space-y-2">
              <div className="flex items-center space-x-2 text-[#001D36]">
                <User className="w-4 h-4 text-[#0061A4]" />
                <span className="font-extrabold text-xs">Chưa Đăng Nhập (Guest)</span>
              </div>
              <p className="text-[11px] text-[#44474E] leading-tight">
                Đăng nhập để xem lịch sử quét cá nhân, tạo báo cáo và truy cập đầy đủ các tính năng.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-2 rounded-full bg-[#0061A4] text-white font-bold text-xs transition shadow-2xs flex items-center justify-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng Nhập Ngay</span>
              </button>
            </div>
          )}

          {/* Navigation Menu List */}
          <div className="space-y-1 pt-2">
            <p className="text-[11px] font-bold text-[#74777F] px-3 uppercase tracking-wider">
              Menu Điều Hướng ({badge.label})
            </p>

            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab(tab.id);
                    onClose();
                  }}
                  className={`w-full px-3.5 py-3 rounded-full text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#D1E4FF] text-[#001D36] shadow-2xs'
                      : 'text-[#44474E] hover:bg-[#F3F3F7] hover:text-[#1C1B1F]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#001D36]' : 'text-[#44474E]'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge ? (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-[#0061A4] text-white' : 'bg-[#FFDAD6] text-[#BA1A1A]'
                    }`}>
                      {tab.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#74777F]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-[#E1E2E9] space-y-2 bg-[#F8F9FE]">
          <button
            onClick={() => {
              onToggleLargeFont();
            }}
            className="w-full py-2.5 px-3 rounded-full bg-white border border-[#E1E2E9] text-[#1C1B1F] text-xs font-bold transition flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-[#0061A4]" />
              <span>Chế độ chữ lớn</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isLargeFont ? 'bg-[#0061A4] text-white' : 'bg-[#F3F3F7] text-[#44474E]'}`}>
              {isLargeFont ? 'BẬT' : 'TẮT'}
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEmergency();
            }}
            className="w-full py-2.5 px-3 rounded-full bg-[#BA1A1A] text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-xs"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Đường Dây Nóng Khẩn Cấp</span>
          </button>

          {user && (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="w-full py-2 px-3 rounded-full bg-[#FFE9E9] text-[#BA1A1A] hover:bg-[#FFDAD6] text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng Xuất</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
