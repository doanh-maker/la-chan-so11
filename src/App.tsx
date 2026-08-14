/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HomePage } from './components/HomePage';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { CardSkeleton } from './components/UIStateComponents';
import { ScamAnalysisResult, CommunityReport, UserProfile, UserRole, NavTab } from './types';
import { INITIAL_REPORTS } from './data/mockReports';
import { ShieldCheck, PhoneCall, Sparkles, CheckCircle2, AlertOctagon, Heart } from 'lucide-react';
import { 
  auth, 
  signOutUser, 
  subscribeToCommunityReports, 
  addFirestoreCommunityReport,
  deleteFirestoreCommunityReport,
  updateFirestoreReportStatus,
  subscribeToScanHistory,
  addFirestoreScanHistory,
  fetchUserProfile,
  saveUserProfile,
  updateUserRoleInFirestore
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { ScamScanner } from './components/ScamScanner';
import { WebsiteScanner } from './components/WebsiteScanner';
import { ScamSimulator } from './components/ScamSimulator';
import { ChatAssistant, FloatingChatWidget } from './components/ChatAssistant';
import { CommunityReports } from './components/CommunityReports';
import { ScanHistory } from './components/ScanHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { ModeratorDashboard } from './components/ModeratorDashboard';
import { Forbidden403 } from './components/Forbidden403';
import { MobileNavDrawer } from './components/MobileNavDrawer';
import { EmergencyModal } from './components/EmergencyModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Firebase Auth state & Firestore user document
  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Single Source of Truth: Fetch user profile directly from Firestore
          let profile = await fetchUserProfile(firebaseUser.uid);
          if (!profile) {
            // First time Google sign-in: Create new profile with default role = 'user' and status = 'active'
            profile = await saveUserProfile({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'Người dùng Google',
              email: firebaseUser.email || '',
              photoURL: firebaseUser.photoURL || undefined
            });
          } else {
            // Returning user: Update lastLogin and info without mutating role or status
            profile = await saveUserProfile({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || profile.displayName,
              email: firebaseUser.email || profile.email,
              photoURL: firebaseUser.photoURL || profile.photoURL
            });
          }
          // Set user state strictly based on Firestore data
          setUser(profile);
        } else {
          setUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    if (activeTab === 'admin' || activeTab === 'moderator' || activeTab === 'history' || activeTab === 'profile') {
      setActiveTab('home');
    }
    addToast('Đã đăng xuất tài khoản', 'info');
  };

  // Compute Current User Role
  const currentUserRole: UserRole = user ? ((user.role as any) || 'user') : 'guest';

  // Role Based Access Control Matrix
  const isTabAllowed = (tab: NavTab, role: UserRole): boolean => {
    switch (role) {
      case 'guest':
        return ['home', 'scanner', 'website', 'simulator', 'chat', 'community'].includes(tab);
      case 'user':
        return ['home', 'scanner', 'website', 'simulator', 'chat', 'community', 'history', 'profile'].includes(tab);
      case 'moderator':
        return ['home', 'scanner', 'website', 'simulator', 'chat', 'community', 'history', 'moderator', 'profile'].includes(tab);
      case 'admin':
        return ['home', 'scanner', 'website', 'simulator', 'chat', 'community', 'history', 'moderator', 'admin', 'profile'].includes(tab);
      default:
        return false;
    }
  };

  const getRequiredRoleForTab = (tab: NavTab): 'user' | 'moderator' | 'admin' => {
    if (tab === 'admin') return 'admin';
    if (tab === 'moderator') return 'moderator';
    return 'user';
  };

  // Persistence for scan history & community reports
  const [deletedReportIds, setDeletedReportIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lachanso_deleted_reports');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [scanHistory, setScanHistory] = useState<ScamAnalysisResult[]>(() => {
    try {
      const saved = localStorage.getItem('lachanso_scan_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [communityReports, setCommunityReports] = useState<CommunityReport[]>(() => {
    try {
      const savedDeleted = localStorage.getItem('lachanso_deleted_reports');
      const deletedSet = new Set<string>(savedDeleted ? JSON.parse(savedDeleted) : []);
      const saved = localStorage.getItem('lachanso_community_reports');
      const baseReports = saved ? JSON.parse(saved) : INITIAL_REPORTS;
      return (baseReports as CommunityReport[]).filter(r => !deletedSet.has(r.id));
    } catch (e) {
      return INITIAL_REPORTS;
    }
  });

  // Subscribe to real-time Firestore community reports
  useEffect(() => {
    const unsubscribe = subscribeToCommunityReports((firestoreReports) => {
      const deletedSet = new Set(deletedReportIds);
      if (firestoreReports.length > 0) {
        const existingIds = new Set(firestoreReports.map(r => r.id));
        const merged = [
          ...firestoreReports,
          ...INITIAL_REPORTS.filter(r => !existingIds.has(r.id))
        ].filter(r => !deletedSet.has(r.id));
        setCommunityReports(merged);
      } else {
        setCommunityReports(INITIAL_REPORTS.filter(r => !deletedSet.has(r.id)));
      }
    });
    return () => unsubscribe();
  }, [deletedReportIds]);

  // Subscribe to real-time Firestore scan history
  useEffect(() => {
    const unsubscribe = subscribeToScanHistory(user?.uid, (firestoreScans) => {
      if (firestoreScans.length > 0) {
        setScanHistory((prev) => {
          const firestoreIds = new Set(firestoreScans.map(s => s.id));
          const localOnly = prev.filter(s => !firestoreIds.has(s.id));
          return [...firestoreScans, ...localOnly];
        });
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    localStorage.setItem('lachanso_scan_history', JSON.stringify(scanHistory));
  }, [scanHistory]);

  useEffect(() => {
    localStorage.setItem('lachanso_community_reports', JSON.stringify(communityReports));
  }, [communityReports]);

  const handleScanCompleted = async (result: ScamAnalysisResult) => {
    setScanHistory((prev) => [result, ...prev]);
    addToast('Đã phân tích xong và lưu vào nhật ký', 'success');
    await addFirestoreScanHistory(result);
  };

  const handleAddNewReport = async (report: CommunityReport) => {
    setCommunityReports((prev) => [report, ...prev]);
    addToast('Gửi báo cáo lừa đảo thành công!', 'success');
    await addFirestoreCommunityReport(report);
  };

  const handleDeleteReport = async (reportId: string) => {
    // 1. Remove from active local state
    setCommunityReports((prev) => prev.filter(r => r.id !== reportId));
    // 2. Mark as permanently deleted so F5 doesn't restore mock/cache
    setDeletedReportIds((prev) => {
      const next = Array.from(new Set([...prev, reportId]));
      localStorage.setItem('lachanso_deleted_reports', JSON.stringify(next));
      return next;
    });
    // 3. Delete from Firestore if exists
    await deleteFirestoreCommunityReport(reportId);
    addToast('Đã xóa vĩnh viễn báo cáo khỏi hệ thống', 'info');
  };

  const handleUpdateReportStatus = async (
    reportId: string, 
    status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED'
  ) => {
    setCommunityReports((prev) => 
      prev.map(r => r.id === reportId ? { ...r, verifiedStatus: status } : r)
    );
    await updateFirestoreReportStatus(reportId, status);
  };

  const handleClearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('lachanso_scan_history');
    addToast('Đã xóa toàn bộ nhật ký lịch sử quét', 'info');
  };

  const isCurrentTabPermitted = isTabAllowed(activeTab, currentUserRole);

  return (
    <div className={`min-h-screen bg-[#F3F4F9] text-[#1C1B1F] font-sans selection:bg-[#0061A4] selection:text-white pb-20 md:pb-10 ${
      isLargeFont ? 'text-lg' : 'text-base'
    }`}>
      {/* Top Application Header */}
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        isLargeFont={isLargeFont}
        onToggleLargeFont={() => setIsLargeFont(!isLargeFont)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        userRole={currentUserRole}
        reportCount={communityReports.length}
      />

      {/* Mobile Responsive Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        isLargeFont={isLargeFont}
        onToggleLargeFont={() => setIsLargeFont(!isLargeFont)}
        reportCount={communityReports.length}
      />

      {/* Primary Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-8">
        <div key={activeTab + '-' + currentUserRole} className="transition-all duration-200">
          {/* RBAC Route Protection Verification */}
          {!isCurrentTabPermitted ? (
            <Forbidden403
              requiredRole={getRequiredRoleForTab(activeTab)}
              userRole={currentUserRole}
              onGoHome={() => setActiveTab('home')}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          ) : (activeTab === 'home' || activeTab === 'scanner' || activeTab === 'website') ? (
            <HomePage
              onSelectTab={(tab) => setActiveTab(tab)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              isLargeFont={isLargeFont}
              onScanCompleted={handleScanCompleted}
              onNavigateToHistory={() => setActiveTab('history')}
              initialToolTab={activeTab === 'website' ? 'website' : 'scanner'}
            />
          ) : (
            <>
              {/* Statistics Callout Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-5 rounded-[24px] bg-white border border-[#E1E2E9] shadow-xs flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#D1E4FF] text-[#001D36] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-[#0061A4]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#44474E] font-medium">Lượt quét an toàn</p>
                    <p className="text-lg font-extrabold text-[#1C1B1F]">{scanHistory.length + 1280} lượt</p>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-white border border-[#E1E2E9] shadow-xs flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#44474E] font-medium">Báo cáo lừa đảo</p>
                    <p className="text-lg font-extrabold text-[#1C1B1F]">{communityReports.length} vụ việc</p>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-white border border-[#E1E2E9] shadow-xs flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#E8DEF8] text-[#1D192B] flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-[#4F378B]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#44474E] font-medium">Mô hình AI</p>
                    <p className="text-lg font-extrabold text-[#1C1B1F]">Gemini 3.6 Flash</p>
                  </div>
                </div>

                <div className="p-5 rounded-[24px] bg-white border border-[#E1E2E9] shadow-xs flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#C8E6C9] text-[#006E00] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#44474E] font-medium">Trạng thái RBAC</p>
                    <p className="text-sm font-bold text-[#006E00] capitalize">{currentUserRole.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              {/* Tab Content Panels */}
              {activeTab === 'simulator' && (
                <ScamSimulator
                  isLargeFont={isLargeFont}
                  onOpenEmergency={() => setIsEmergencyOpen(true)}
                  onNavigateToScanner={() => setActiveTab('scanner')}
                />
              )}

              {activeTab === 'chat' && (
                <ChatAssistant
                  user={user}
                  isLargeFont={isLargeFont}
                  onOpenEmergency={() => setIsEmergencyOpen(true)}
                />
              )}

              {activeTab === 'community' && (
                <CommunityReports
                  reports={communityReports}
                  onAddNewReport={handleAddNewReport}
                  isLargeFont={isLargeFont}
                  onOpenEmergency={() => setIsEmergencyOpen(true)}
                />
              )}

              {activeTab === 'history' && (
                <ScanHistory
                  historyItems={scanHistory}
                  onClearHistory={handleClearHistory}
                  isLargeFont={isLargeFont}
                  onNavigateToScanner={() => setActiveTab('scanner')}
                />
              )}

              {activeTab === 'moderator' && (
                <ModeratorDashboard
                  reports={communityReports}
                  onUpdateReports={(updated) => setCommunityReports(updated)}
                  onDeleteReport={handleDeleteReport}
                  onUpdateReportStatus={handleUpdateReportStatus}
                  isLargeFont={isLargeFont}
                />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard
                  reports={communityReports}
                  onUpdateReports={(updated) => setCommunityReports(updated)}
                  onDeleteReport={handleDeleteReport}
                  onUpdateReportStatus={handleUpdateReportStatus}
                  isLargeFont={isLargeFont}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Footer Notice */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 py-8 border-t border-[#E1E2E9] bg-white text-[#44474E] text-xs space-y-3 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 rounded-t-[28px] shadow-xs">
        <div>
          <p className="font-bold text-[#1C1B1F]">
            Lá Chắn Số AI — Hệ thống Phòng Chống Lừa Đảo Trực Tuyến Việt Nam
          </p>
          <p className="text-[#44474E] mt-0.5">
            Phát triển trên nền tảng Google Gemini AI và Google Cloud Run. Giúp bảo vệ cộng đồng khỏi các chiêu trò lừa đảo tài chính.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-[#44474E]">
          <button
            onClick={() => setIsEmergencyOpen(true)}
            className="text-[#BA1A1A] hover:underline font-bold flex items-center gap-1 bg-[#FFDAD6] px-3 py-1.5 rounded-full"
          >
            <PhoneCall className="w-3.5 h-3.5" /> Hotline 113 / 156
          </button>
        </div>
      </footer>

      {/* Emergency & Auth Dialog Modals */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* UserProfileModal when activeTab === 'profile' or isProfileOpen */}
      {(isProfileOpen || activeTab === 'profile') && (
        <UserProfileModal
          isOpen={isProfileOpen || activeTab === 'profile'}
          onClose={() => {
            setIsProfileOpen(false);
            if (activeTab === 'profile') setActiveTab('home');
          }}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSignOut={handleSignOut}
          scanHistory={scanHistory}
          communityReports={communityReports}
          isLargeFont={isLargeFont}
          onToggleLargeFont={() => setIsLargeFont(!isLargeFont)}
        />
      )}

      {/* Floating AI Assistant Chat Bubble Widget */}
      {activeTab !== 'chat' && (
        <FloatingChatWidget
          user={user}
          isLargeFont={isLargeFont}
          onOpenEmergency={() => setIsEmergencyOpen(true)}
          onNavigateToFullChat={() => setActiveTab('chat')}
        />
      )}
    </div>
  );
}
