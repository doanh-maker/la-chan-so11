import React, { useState, useEffect } from 'react';
import { Home, ShieldCheck, Globe, Bot, Users, History, SlidersHorizontal, UserCheck, User as UserIcon, Gamepad2 } from 'lucide-react';
import { NavTab, UserRole } from '../types';

export { type NavTab };

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  userRole?: UserRole;
  reportCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  userRole = 'guest',
  reportCount = 5
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDir = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 60) {
        setIsScrolled(false);
        setIsVisible(true);
      } else {
        setIsScrolled(true);
        const diff = currentScrollY - lastScrollY;
        if (diff > 5) {
          // Scrolling Down -> Hide Navigation
          setIsVisible(false);
        } else if (diff < -5) {
          // Scrolling Up ("Kéo trang web cuộn từ dưới lên") -> Show Navigation
          setIsVisible(true);
        }
      }

      lastScrollY = currentScrollY > 0 ? currentScrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getTabsForRole = () => {
    const allTabs = [
      { id: 'home' as NavTab, label: 'Trang Chủ', icon: Home, roles: ['guest', 'user', 'moderator', 'admin'] },
      { id: 'simulator' as NavTab, label: 'Giả Lập Bẫy AI', icon: Gamepad2, roles: ['guest', 'user', 'moderator', 'admin'] },
      { id: 'chat' as NavTab, label: 'Trợ Lý AI', icon: Bot, roles: ['guest', 'user', 'moderator', 'admin'] },
      { id: 'community' as NavTab, label: 'Cảnh Báo', icon: Users, badge: reportCount, roles: ['guest', 'user', 'moderator', 'admin'] },
      { id: 'history' as NavTab, label: 'Lịch Sử', icon: History, roles: ['user', 'moderator', 'admin'] },
      { id: 'moderator' as NavTab, label: 'Kiểm Duyệt', icon: UserCheck, roles: ['moderator'] },
      { id: 'admin' as NavTab, label: 'Quản Trị', icon: SlidersHorizontal, roles: ['admin'] },
      { id: 'profile' as NavTab, label: 'Hồ Sơ', icon: UserIcon, roles: ['user', 'moderator', 'admin'] },
    ];

    return allTabs.filter(tab => tab.roles.includes(userRole));
  };

  const visibleTabs = getTabsForRole();

  // Desktop styles depending on scroll direction
  const desktopNavbarClasses = !isScrolled
    ? 'hidden md:block bg-white border-b border-[#E1E2E9] text-[#44474E] relative z-40 transition-all duration-300'
    : isVisible
    ? 'hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E2E9] text-[#44474E] shadow-md transition-all duration-300 ease-in-out translate-y-0 opacity-100'
    : 'hidden md:block fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E2E9] text-[#44474E] shadow-md transition-all duration-300 ease-in-out -translate-y-full opacity-0 pointer-events-none';

  // Mobile styles depending on scroll direction
  const mobileNavbarClasses = !isScrolled || isVisible
    ? 'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E1E2E9] py-2 px-2 shadow-lg transition-all duration-300 ease-in-out translate-y-0 opacity-100'
    : 'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E1E2E9] py-2 px-2 shadow-lg transition-all duration-300 ease-in-out translate-y-full opacity-0 pointer-events-none';

  return (
    <>
      {/* Desktop Navigation Header Bar */}
      <nav className={desktopNavbarClasses}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1.5 py-2.5 overflow-x-auto no-scrollbar">
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id)}
                    className={`px-4.5 py-2 rounded-full text-sm font-medium transition flex items-center space-x-2 shrink-0 relative cursor-pointer ${
                      isActive
                        ? 'bg-[#D1E4FF] text-[#001D36] font-bold shadow-xs'
                        : 'hover:bg-[#F3F3F7] text-[#44474E] hover:text-[#1C1B1F]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#001D36]' : 'text-[#44474E]'}`} />
                    <span>{tab.label}</span>
                    {tab.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-[#0061A4] text-white' : 'bg-[#FFDAD6] text-[#BA1A1A]'
                      }`}>
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* When fixed on scroll up, show subtle indicator */}
            {isScrolled && isVisible && (
              <div className="hidden lg:flex items-center space-x-2 text-xs font-bold text-[#0061A4] bg-[#D1E4FF]/40 px-3 py-1 rounded-full border border-[#0061A4]/20 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Lá Chắn Số AI</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Responsive Bottom Navigation Bar */}
      <div className={mobileNavbarClasses}>
        <div className="flex items-center justify-between overflow-x-auto gap-1 max-w-md mx-auto no-scrollbar">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition text-center shrink-0 min-w-[50px] cursor-pointer ${
                  isActive
                    ? 'text-[#001D36] font-bold bg-[#D1E4FF]'
                    : 'text-[#44474E] hover:text-[#1C1B1F]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#001D36]' : 'text-[#44474E]'}`} />
                  {tab.badge ? (
                    <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 rounded-full bg-[#BA1A1A] text-white text-[9px] font-bold flex items-center justify-center">
                      {tab.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[9px] mt-1 truncate max-w-[56px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
