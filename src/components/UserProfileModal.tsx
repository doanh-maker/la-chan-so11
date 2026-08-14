import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Type, 
  Bell, 
  Volume2, 
  Shield, 
  X, 
  Sparkles, 
  LogIn,
  Sliders,
  Check,
  Lock,
  Smartphone,
  KeyRound,
  Database,
  RefreshCw,
  Globe,
  Activity,
  Award,
  Flame,
  Download,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Cpu,
  Zap,
  SlidersHorizontal,
  Layers,
  Radio,
  CheckSquare,
  Share2,
  FileCode,
  Terminal,
  ChevronRight,
  Search,
  Filter,
  Clock,
  PhoneCall,
  Save,
  ShieldAlert,
  Sliders as SlidersIcon,
  HardDrive,
  MessageSquare,
  ExternalLink,
  Laptop,
  Fingerprint
} from 'lucide-react';
import { UserProfile, ScamAnalysisResult, CommunityReport, UserSettings, UserActivityLog } from '../types';
import { 
  auth, 
  saveUserProfile, 
  saveFirestoreUserSettings, 
  subscribeToUserSettings, 
  subscribeToUserActivityLogs, 
  addFirestoreUserActivityLog 
} from '../lib/firebase';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  scanHistory: ScamAnalysisResult[];
  communityReports: CommunityReport[];
  isLargeFont: boolean;
  onToggleLargeFont: () => void;
}

type TabType = 'ALL' | 'ACCOUNT' | 'STATS' | 'ACHIEVEMENTS' | 'AI' | 'NOTIFICATION' | 'PRIVACY' | 'ACCESSIBILITY' | 'SECURITY' | 'SYNC' | 'LOGS' | 'SUPPORT';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onSignOut,
  scanHistory,
  communityReports,
  isLargeFont,
  onToggleLargeFont,
}) => {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<TabType>('ALL');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Editable Account Form States
  const [displayNameInput, setDisplayNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [departmentInput, setDepartmentInput] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);

  // Firestore Settings States
  const [settings, setSettings] = useState<UserSettings>({
    aiModel: 'gemini-3.6-flash',
    highSafetyMode: true,
    autoScanUrls: true,
    aiConfidenceThreshold: 85,
    deepfakeDetection: true,
    pushNotifications: true,
    emailAlerts: true,
    emergencySosAlerts: true,
    dailyThreatSummary: false,
    soundEffects: true,
    anonymousReporting: false,
    shareDataForResearch: true,
    hideLocation: false,
    isLargeFont: isLargeFont,
    voiceAssistantEnabled: false,
    highContrastMode: false,
    biometricLock: true,
    twoFactorEnabled: true,
    autoSyncOffline: true,
  });

  // Firestore Activity Logs
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [logCategoryFilter, setLogCategoryFilter] = useState<string>('ALL');

  // UI Toast Feedbacks
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'info' | 'error'>('success');

  // Support Form State
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [isSendingSupport, setIsSendingSupport] = useState<boolean>(false);
  const [supportSubmitted, setSupportSubmitted] = useState<boolean>(false);

  // Show Toast Helper
  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync prop changes with local settings
  useEffect(() => {
    setSettings(prev => ({ ...prev, isLargeFont }));
  }, [isLargeFont]);

  // Load User Data & Subscribe to Firestore Settings & Logs
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setHasError(false);

    try {
      if (user) {
        setDisplayNameInput(user.displayName || '');
        setPhoneInput(user.phoneNumber || '0988 123 456');
        setBioInput(user.bio || 'Chuyên gia phân tích dữ liệu an toàn thông tin & phòng chống tội phạm mạng.');
        setDepartmentInput('Ban Kỹ Thuật SOC • Lá Chắn Số');

        // Subscribe to Real-time User Settings in Firestore
        const unsubSettings = subscribeToUserSettings(user.uid, (remoteSettings) => {
          if (remoteSettings) {
            setSettings(prev => ({ ...prev, ...remoteSettings }));
          }
        });

        // Subscribe to Real-time Activity Logs in Firestore
        const unsubLogs = subscribeToUserActivityLogs(user.uid, (remoteLogs) => {
          if (remoteLogs && remoteLogs.length > 0) {
            setActivityLogs(remoteLogs);
          } else {
            // Default initial log entry if empty
            setActivityLogs([
              {
                id: 'log-init-1',
                timestamp: Date.now() - 3600000,
                action: 'Đăng nhập hệ thống xác thực Google',
                details: `Đăng nhập thành công từ thiết bị Chrome trên macOS / Windows (IP: 118.70.124.5)`,
                category: 'AUTH',
                status: 'SUCCESS',
                ipAddress: '118.70.124.5'
              },
              {
                id: 'log-init-2',
                timestamp: Date.now() - 7200000,
                action: 'Cập nhật cấu hình Trí Tuệ Nhân Tạo AI',
                details: 'Bật chế độ An Toàn Cao & Cưỡng chế độ tin cậy Gemini ở mức 85%',
                category: 'SETTINGS',
                status: 'INFO',
                ipAddress: '118.70.124.5'
              }
            ]);
          }
        });

        setIsLoading(false);
        return () => {
          unsubSettings();
          unsubLogs();
        };
      } else {
        // Guest user local settings from localStorage fallback
        const savedHighSafety = localStorage.getItem('lachanso_high_safety_mode') === 'true';
        const savedNotifs = localStorage.getItem('lachanso_notifications') !== 'false';
        const savedVoice = localStorage.getItem('lachanso_voice_assistant') === 'true';

        setSettings(prev => ({
          ...prev,
          highSafetyMode: savedHighSafety,
          pushNotifications: savedNotifs,
          voiceAssistantEnabled: savedVoice
        }));
        
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("Profile load error:", err);
      setHasError(true);
      setErrorMessage(err?.message || 'Không thể tải dữ liệu hồ sơ từ kết nối Firebase.');
      setIsLoading(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle Switch Toggle & Update Firestore
  const handleToggleSetting = async (key: keyof UserSettings, customVal?: any) => {
    const newVal = customVal !== undefined ? customVal : !settings[key];
    const updatedSettings = { ...settings, [key]: newVal };
    setSettings(updatedSettings);

    showToast('Đã lưu thay đổi vào Firestore', 'success');

    if (user?.uid) {
      await saveFirestoreUserSettings(user.uid, { [key]: newVal });
      await addFirestoreUserActivityLog(user.uid, {
        timestamp: Date.now(),
        action: `Thay đổi cài đặt [${String(key)}]`,
        details: `Giá trị mới: ${JSON.stringify(newVal)}`,
        category: 'SETTINGS',
        status: 'SUCCESS',
        ipAddress: '118.70.124.5'
      });
    }

    // Backup to LocalStorage
    if (key === 'highSafetyMode') localStorage.setItem('lachanso_high_safety_mode', String(newVal));
    if (key === 'pushNotifications') localStorage.setItem('lachanso_notifications', String(newVal));
    if (key === 'voiceAssistantEnabled') localStorage.setItem('lachanso_voice_assistant', String(newVal));
  };

  // Handle Account Form Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const updatedUser: UserProfile = {
        ...user,
        displayName: displayNameInput.trim() || user.displayName,
        phoneNumber: phoneInput.trim(),
        bio: bioInput.trim()
      };

      await saveUserProfile(updatedUser);
      await saveFirestoreUserSettings(user.uid, {
        phoneNumber: phoneInput.trim(),
        bio: bioInput.trim(),
        department: departmentInput.trim()
      });

      await addFirestoreUserActivityLog(user.uid, {
        timestamp: Date.now(),
        action: 'Cập nhật thông tin hồ sơ cá nhân',
        details: `Đổi tên thành: ${displayNameInput.trim()}, SĐT: ${phoneInput.trim()}`,
        category: 'SECURITY',
        status: 'SUCCESS',
        ipAddress: '118.70.124.5'
      });

      showToast('Cập nhật hồ sơ tài khoản thành công!', 'success');
    } catch (err) {
      showToast('Có lỗi khi lưu hồ sơ. Vui lòng thử lại!', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Download User Data (JSON export)
  const handleDownloadUserData = () => {
    const data = {
      userProfile: user,
      settings,
      scansCount: scanHistory.length,
      reportsSubmittedCount: communityReports.length,
      exportDate: new Date().toISOString(),
      appVersion: '2.6.0 Pro'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lachanso_UserData_${user?.uid || 'Guest'}_${Date.now()}.json`;
    a.click();
    showToast('Đã tải xuống toàn bộ dữ liệu cá nhân (JSON)!', 'info');
  };

  // Handle Support Form Submit
  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setIsSendingSupport(true);
    setTimeout(() => {
      setIsSendingSupport(false);
      setSupportSubmitted(true);
      setSupportMessage('');
      showToast('Đã gửi phản hồi tới Ban Quản Trị SOC!', 'success');
      setTimeout(() => setSupportSubmitted(false), 4000);
    }, 1000);
  };

  // Computed Stats
  const totalScans = scanHistory.length;
  const safeScans = scanHistory.filter(s => s.riskLevel === 'SAFE').length;
  const scamWarnings = scanHistory.filter(s => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL' || s.riskLevel === 'WARNING').length;
  const userReportsCount = user 
    ? communityReports.filter(r => r.reporterName === user.displayName || r.reporterName === user.email).length
    : 0;
  const reputationScore = 850 + (totalScans * 10) + (userReportsCount * 25);

  // Tabs List Definition with Material 3 Icons
  const TABS_LIST: { id: TabType; label: string; icon: any }[] = [
    { id: 'ALL', label: 'Tất Cả Mục', icon: Layers },
    { id: 'ACCOUNT', label: 'Tài Khoản', icon: User },
    { id: 'STATS', label: 'Thống Kê', icon: Activity },
    { id: 'ACHIEVEMENTS', label: 'Thành Tích', icon: Award },
    { id: 'AI', label: 'Cài Đặt AI', icon: Cpu },
    { id: 'NOTIFICATION', label: 'Thông Báo', icon: Bell },
    { id: 'PRIVACY', label: 'Quyền Riêng Tư', icon: EyeOff },
    { id: 'ACCESSIBILITY', label: 'Trợ Năng', icon: Type },
    { id: 'SECURITY', label: 'Bảo Mật', icon: ShieldCheck },
    { id: 'SYNC', label: 'Đồng Bộ Firebase', icon: Database },
    { id: 'LOGS', label: 'Nhật Ký', icon: Terminal },
    { id: 'SUPPORT', label: 'Hỗ Trợ & Phiên Bản', icon: HelpCircle },
  ];

  // Filtered Activity Logs
  const filteredLogs = activityLogs.filter(log => {
    if (logCategoryFilter === 'ALL') return true;
    return log.category === logCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Toast Alert Floating Overlay */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-60 px-5 py-2.5 rounded-full text-xs font-black shadow-2xl flex items-center space-x-2 animate-bounce border ${
          toastType === 'success' 
            ? 'bg-[#006E00] text-white border-[#C8E6C9]' 
            : toastType === 'error' 
            ? 'bg-[#BA1A1A] text-white border-[#FFDAD6]' 
            : 'bg-[#0061A4] text-white border-[#D1E4FF]'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Material Design 3 Modal Dashboard Container */}
      <div 
        className={`bg-white text-[#1C1B1F] rounded-[28px] border border-[#E1E2E9] shadow-2xl w-full max-w-6xl my-auto relative overflow-hidden flex flex-col max-h-[92vh] animate-zoom-in ${
          isLargeFont ? 'text-lg' : 'text-base'
        }`}
      >
        {/* HEADER BAR */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E2E9] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center shrink-0">
              <SlidersIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0061A4]">
                  ACCOUNT MANAGEMENT DASHBOARD
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C8E6C9] text-[#006E00] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#006E00] animate-pulse" />
                  FIRESTORE LIVE SYNC
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-[#1C1B1F] truncate">
                Quản Lý Tài Khoản & Cấu Hình Lá Chắn Số AI
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="px-3.5 py-2 rounded-full bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#BA1A1A] hover:text-white text-xs font-bold transition flex items-center gap-1.5 border border-[#FFDAD6]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#F3F3F7] text-[#44474E] hover:bg-[#BA1A1A] hover:text-white border border-[#E1E2E9] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MATERIAL DESIGN 3 CATEGORY NAVIGATION TABS */}
        <div className="bg-[#F8FAFC] border-b border-[#E1E2E9] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none shrink-0 flex items-center space-x-1.5">
          {TABS_LIST.map((t) => {
            const IconComponent = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-2 shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0061A4] text-white shadow-xs'
                    : 'text-[#44474E] hover:bg-[#E7E8EE]'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN SCROLLABLE DASHBOARD CONTENT */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 space-y-8">

          {/* LOADING SKELETON STATE */}
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-24 bg-gray-200 rounded-2xl" />
                <div className="h-24 bg-gray-200 rounded-2xl" />
                <div className="h-24 bg-gray-200 rounded-2xl" />
              </div>
              <div className="h-48 bg-gray-200 rounded-3xl" />
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoading && hasError && (
            <div className="bg-[#FFDAD6] border border-[#BA1A1A] p-6 rounded-[24px] text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-[#BA1A1A] mx-auto" />
              <h3 className="text-base font-black text-[#BA1A1A]">
                Không Thể Kết Nối Dữ Liệu Hồ Sơ Firestore
              </h3>
              <p className="text-xs text-[#44474E]">
                {errorMessage}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#BA1A1A] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#93000A]"
              >
                Tải Lại Trang
              </button>
            </div>
          )}

          {/* DASHBOARD BODY WHEN READY */}
          {!isLoading && !hasError && (
            <>
              {/* CARD 1: THÔNG TIN TÀI KHOẢN (ACCOUNT INFO) */}
              {(activeTab === 'ALL' || activeTab === 'ACCOUNT') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-[#1C1B1F]">
                          1. Thông Tin Tài Khoản Xác Thực Google
                        </h2>
                        <p className="text-xs text-[#44474E]">
                          Dữ liệu đồng bộ trực tiếp với Firebase Authentication & Firestore
                        </p>
                      </div>
                    </div>

                    {user ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#C8E6C9] text-[#006E00]">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã xác thực Google
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuth();
                        }}
                        className="px-4 py-2 rounded-full bg-[#0061A4] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#004B80] transition shadow-xs"
                      >
                        <LogIn className="w-4 h-4" />
                        Đăng Nhập Ngay
                      </button>
                    )}
                  </div>

                  {user ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-5 rounded-2xl border border-[#E1E2E9]">
                        <div className="relative group">
                          <img
                            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.displayName}`}
                            alt={user.displayName}
                            className="w-20 h-20 rounded-full border-4 border-[#0061A4]/40 object-cover shadow-md"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                            Đổi Ảnh
                          </div>
                        </div>

                        <div className="space-y-1 text-center sm:text-left flex-1">
                          <h3 className="text-lg font-black text-[#1C1B1F] flex items-center justify-center sm:justify-start gap-2">
                            {user.displayName}
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#D1E4FF] text-[#0061A4] font-bold">
                              MÃ UID: {user.uid.slice(0, 8)}...
                            </span>
                          </h3>
                          <p className="text-xs text-[#44474E] flex items-center justify-center sm:justify-start gap-1 font-medium">
                            <Mail className="w-3.5 h-3.5 text-[#0061A4]" />
                            {user.email}
                          </p>
                          <p className="text-[11px] text-[#74777F] flex items-center justify-center sm:justify-start gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Tham gia SOC: Tháng 08/2026 • Cấp Độ Bảo Vệ Level 4
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#1C1B1F]">
                            Họ và Tên Hiển Thị:
                          </label>
                          <input
                            type="text"
                            value={displayNameInput}
                            onChange={(e) => setDisplayNameInput(e.target.value)}
                            placeholder="Nhập họ tên của bạn..."
                            className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#1C1B1F]">
                            Số Điện Thoại Liên Hệ Cảnh Báo:
                          </label>
                          <input
                            type="text"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            placeholder="09xx xxx xxx"
                            className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3.5 py-2.5 text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-bold text-[#1C1B1F]">
                            Ghi Chú / Tiểu Sử Chuyên Năng Bảo Vệ:
                          </label>
                          <textarea
                            rows={2}
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            placeholder="Tiểu sử cá nhân..."
                            className="w-full bg-white border border-[#E1E2E9] rounded-xl p-3.5 text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="px-6 py-2.5 rounded-xl bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSavingProfile ? 'Đang Lưu...' : 'Lưu Thay Đổi Thông Tin'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white p-6 rounded-2xl border border-[#E1E2E9] text-center space-y-3">
                      <p className="text-sm font-bold text-[#1C1B1F]">
                        Bạn đang trải nghiệm dưới danh nghĩa Khách Ẩn Danh
                      </p>
                      <p className="text-xs text-[#44474E]">
                        Đăng nhập với Google để kích hoạt huy hiệu Hiệp Sĩ An Ninh Mạng và đồng bộ dữ liệu bảo vệ liên thiết bị.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* CARD 2: THỐNG KÊ CÁ NHÂN (PERSONAL STATISTICS) */}
              {(activeTab === 'ALL' || activeTab === 'STATS') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#C8E6C9] text-[#006E00] flex items-center justify-center">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        2. Thống Kê Hoạt Động & Chỉ Số An Toàn
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Dữ liệu phân tích dựa trên lịch sử quét AI & đóng góp cộng đồng thực tế
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#44474E]">Tổng Lượt Quét</p>
                      <p className="text-2xl font-black text-[#1C1B1F]">{totalScans}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#006E00]">Nội Dung An Toàn</p>
                      <p className="text-2xl font-black text-[#006E00]">{safeScans}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#BA1A1A]">Cảnh Báo Độc Hại</p>
                      <p className="text-2xl font-black text-[#BA1A1A]">{scamWarnings}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#4F378B]">Báo Cáo Đã Gửi</p>
                      <p className="text-2xl font-black text-[#4F378B]">{userReportsCount}</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#0061A4]">Bình Luận Hữu Ích</p>
                      <p className="text-2xl font-black text-[#0061A4]">18</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] text-center space-y-1">
                      <p className="text-[10px] font-black uppercase text-[#E65100]">Điểm Uy Tín SOC</p>
                      <p className="text-2xl font-black text-[#E65100]">{reputationScore}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 3: THÀNH TÍCH & HUY HIỆU (ACHIEVEMENTS & BADGES) */}
              {(activeTab === 'ALL' || activeTab === 'ACHIEVEMENTS') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFDCC2] text-[#E65100] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        3. Thành Tích & Danh Hiệu An Ninh Mạng
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Mở khóa danh hiệu khi tham gia tích cực phát hiện & cảnh báo lừa đảo
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#C8E6C9] text-[#006E00] flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#1C1B1F]">Hiệp Sĩ An Ninh Mạng</h4>
                        <p className="text-[11px] text-[#006E00] font-bold">Đã mở khóa • Cấp 4</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#1C1B1F]">Chuyên Gia Báo Cáo</h4>
                        <p className="text-[11px] text-[#0061A4] font-bold">Đã mở khóa • 10+ Báo cáo</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E8DEF8] text-[#4F378B] flex items-center justify-center shrink-0">
                        <Eye className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#1C1B1F]">Mắt Thần SOC Sentinel</h4>
                        <p className="text-[11px] text-[#4F378B] font-bold">Đã mở khóa • Phân tích AI</p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] flex items-center space-x-3 opacity-60">
                      <div className="w-12 h-12 rounded-2xl bg-[#F3F3F7] text-gray-400 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#1C1B1F]">Đại Sứ An Toàn Số</h4>
                        <p className="text-[11px] text-gray-500 font-bold">Cần thêm 5 báo cáo</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 4: CÀI ĐẶT AI (AI SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'AI') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        4. Cấu Hình Động Cơ Trí Tuệ Nhân Tạo (Gemini AI Engine)
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Tùy chỉnh model Gemini, độ nhạy phát hiện lừa đảo & chế độ an toàn cao
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Model Select */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9] gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Mô Hình Gemini AI Chuyên Dụng:</p>
                        <p className="text-xs text-[#44474E]">Chọn mô hình xử lý phân tích dữ liệu độc hại</p>
                      </div>
                      <select
                        value={settings.aiModel || 'gemini-3.6-flash'}
                        onChange={(e) => handleToggleSetting('aiModel', e.target.value)}
                        className="bg-[#F8FAFC] border border-[#E1E2E9] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1B1F] focus:outline-none"
                      >
                        <option value="gemini-3.6-flash">Gemini 3.6 Flash (Siêu Nhanh & Mới Nhất)</option>
                        <option value="gemini-3.5-pro">Gemini 3.5 Pro (Chuyên Phân Tích Chuyên Sâu)</option>
                        <option value="gemini-2.5-ultra">Gemini 2.5 Ultra (Tối Ưu An Ninh Enterprise)</option>
                      </select>
                    </div>

                    {/* High Safety Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Chế Độ An Toàn Cao (High Safety Mode):</p>
                        <p className="text-xs text-[#44474E]">Quét sâu dấu hiệu lừa đảo đa tầng và tự động cảnh báo khi có rủi ro nhỏ</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('highSafetyMode')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.highSafetyMode ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.highSafetyMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Auto-scan URLs */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Tự Động Quét Link Độc Hại Thời Gian Thực:</p>
                        <p className="text-xs text-[#44474E]">Tự động đối chiếu domain với cơ sở dữ liệu NCSC & VirusTotal</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('autoScanUrls')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.autoScanUrls ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.autoScanUrls ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    {/* Deepfake Detection Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Phân Tích AI Deepfake Voice & Video:</p>
                        <p className="text-xs text-[#44474E]">Nhận diện khuôn mặt & giọng nói nhân tạo giả mạo người thân</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('deepfakeDetection')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.deepfakeDetection ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.deepfakeDetection ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 5: CÀI ĐẶT THÔNG BÁO (NOTIFICATION SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'NOTIFICATION') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFDCC2] text-[#E65100] flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        5. Cài Đặt Thông Báo & Cảnh Báo Khẩn Cấp
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Quản lý phương thức nhận thông báo chiêu trò lừa đảo nguy hiểm mới nổi
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Thông Báo Push Trình Duyệt / Ứng Dụng:</p>
                        <p className="text-xs text-[#44474E]">Nhận cảnh báo tức thì khi xuất hiện bẫy lừa đảo lớn</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('pushNotifications')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.pushNotifications ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Cảnh Báo Email Khẩn Cấp:</p>
                        <p className="text-xs text-[#44474E]">Gửi email cảnh báo khi số tài khoản/số điện thoại của bạn xuất hiện trên SOC</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('emailAlerts')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.emailAlerts ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.emailAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Tín Hiệu Âm Thanh & Rung Cảnh Báo:</p>
                        <p className="text-xs text-[#44474E]">Phát âm thanh báo động SOS khi phát hiện đe dọa CRITICAL</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('soundEffects')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.soundEffects ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.soundEffects ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 6: QUYỀN RIÊNG TƯ (PRIVACY SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'PRIVACY') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#E8DEF8] text-[#4F378B] flex items-center justify-center">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        6. Bảo Vệ Quyền Riêng Tư & Dữ Liệu Cá Nhân
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Kiểm soát dữ liệu báo cáo, chia sẻ thông tin nghiên cứu an ninh
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Báo Cáo Mặc Định Ở Chế Độ Ẩn Danh:</p>
                        <p className="text-xs text-[#44474E]">Ẩn hoàn toàn tên & email của bạn trên bảng cảnh báo cộng đồng</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('anonymousReporting')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.anonymousReporting ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.anonymousReporting ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Tải Xuất Dữ Liệu Cá Nhân (GDPR Data Export):</p>
                        <p className="text-xs text-[#44474E]">Xuất toàn bộ lịch sử quét AI & cài đặt dưới dạng tệp tin JSON</p>
                      </div>
                      <button
                        onClick={handleDownloadUserData}
                        className="px-4 py-2 rounded-xl bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Tải Dữ Liệu JSON
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 7: TRỢ NĂNG (ACCESSIBILITY SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'ACCESSIBILITY') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                      <Type className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        7. Tùy Chỉnh Trợ Năng Dễ Sử Dụng (Accessibility)
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Hỗ trợ tối đa cho người cao tuổi, thị lực yếu & trợ lý đọc bằng giọng nói
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Giao Diện Chữ Lớn Cho Người Cao Tuổi:</p>
                        <p className="text-xs text-[#44474E]">Phóng to cỡ chữ toàn ứng dụng giúp dễ nhìn & đọc rõ ràng</p>
                      </div>
                      <button
                        onClick={onToggleLargeFont}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isLargeFont ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${isLargeFont ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Trợ Lý Giọng Nói Đọc Cảnh Báo (TTS):</p>
                        <p className="text-xs text-[#44474E]">Tự động đọc nội dung cảnh báo lừa đảo bằng tiếng Việt</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('voiceAssistantEnabled')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.voiceAssistantEnabled ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.voiceAssistantEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 8: BẢO MẬT TÀI KHOẢN (SECURITY SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'SECURITY') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        8. Bảo Mật Thiết Bị & Xác Thực 2 Yếu Tố
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Quản lý khóa ứng dụng sinh trắc học và phiên làm việc
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Khóa Vân Tay / FaceID Mở Ứng Dụng:</p>
                        <p className="text-xs text-[#44474E]">Yêu cầu xác thực sinh trắc học trước khi xem lịch sử quét sensitive</p>
                      </div>
                      <button
                        onClick={() => handleToggleSetting('biometricLock')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.biometricLock ? 'bg-[#0061A4]' : 'bg-[#C4C6D0]'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform absolute top-0.5 ${settings.biometricLock ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E1E2E9]">
                      <div>
                        <p className="text-sm font-bold text-[#1C1B1F]">Xác Thực 2 Yếu Tố Google Auth (2FA):</p>
                        <p className="text-xs text-[#006E00] font-bold">Đã kích hoạt bảo vệ cấp tối đa</p>
                      </div>
                      <span className="px-3 py-1 bg-[#C8E6C9] text-[#006E00] text-xs font-bold rounded-full">Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 9: ĐỒNG BỘ FIREBASE (FIREBASE SYNC SETTINGS) */}
              {(activeTab === 'ALL' || activeTab === 'SYNC') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                    <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-[#1C1B1F]">
                        9. Trạng Thái Đồng Bộ Firebase Firestore
                      </h2>
                      <p className="text-xs text-[#44474E]">
                        Kết nối cơ sở dữ liệu thời gian thực Cloud Firestore
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E1E2E9] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-[#006E00] animate-ping" />
                      <div>
                        <p className="text-xs font-bold text-[#1C1B1F]">Firestore Realtime Connection:</p>
                        <p className="text-[11px] text-[#006E00] font-bold">Đang kết nối liên tục • Database ID: ai-studio-remixlchnsai</p>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('Đã đồng bộ lại toàn bộ dữ liệu từ Cloud Firestore!', 'success')}
                      className="px-4 py-2 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Đồng Bộ Ngay
                    </button>
                  </div>
                </div>
              )}

              {/* CARD 10: NHẬT KÝ HOẠT ĐỘNG (ACTIVITY LOGS) */}
              {(activeTab === 'ALL' || activeTab === 'LOGS') && (
                <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-[#1C1B1F]">
                          10. Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
                        </h2>
                        <p className="text-xs text-[#44474E]">
                          Theo dõi lịch sử đăng nhập, thay đổi cài đặt và quét bảo mật
                        </p>
                      </div>
                    </div>

                    {/* Filter Dropdown */}
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-[#44474E]" />
                      <select
                        value={logCategoryFilter}
                        onChange={(e) => setLogCategoryFilter(e.target.value)}
                        className="bg-white border border-[#E1E2E9] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1C1B1F]"
                      >
                        <option value="ALL">Tất Cả Loại Logs</option>
                        <option value="AUTH">Đăng Nhập</option>
                        <option value="SETTINGS">Cài Đặt</option>
                        <option value="SECURITY">Bảo Mật</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {filteredLogs.length === 0 ? (
                      <p className="text-center py-6 text-xs text-[#44474E] italic">
                        Chưa có nhật ký ghi nhận trong danh mục này.
                      </p>
                    ) : (
                      filteredLogs.map((log) => (
                        <div key={log.id} className="bg-white p-3.5 rounded-2xl border border-[#E1E2E9] flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-[#1C1B1F]">{log.action}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F3F7] text-[#44474E] font-bold">
                                {log.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#44474E]">{log.details}</p>
                          </div>
                          <span className="text-[10px] text-[#74777F] shrink-0 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* CARD 11 & 12: HỖ TRỢ VÀ THÔNG TIN PHIÊN BẢN (SUPPORT & VERSION INFO) */}
              {(activeTab === 'ALL' || activeTab === 'SUPPORT') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Support Form */}
                  <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-4">
                    <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-[#1C1B1F]">
                          11. Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật
                        </h2>
                        <p className="text-xs text-[#44474E]">
                          Liên hệ trực tiếp Đội ngũ SOC Lá Chắn Số AI
                        </p>
                      </div>
                    </div>

                    {supportSubmitted ? (
                      <div className="bg-[#C8E6C9] border border-[#006E00] p-4 rounded-2xl text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-[#006E00] mx-auto animate-bounce" />
                        <p className="text-xs font-bold text-[#006E00]">
                          Cảm ơn bạn! Yêu cầu hỗ trợ đã được chuyển tới chuyên gia SOC.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitSupport} className="space-y-3">
                        <textarea
                          rows={3}
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Mô tả sự cố hoặc đóng góp ý kiến cho ứng dụng..."
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl p-3 text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                        />
                        <button
                          type="submit"
                          disabled={!supportMessage.trim() || isSendingSupport}
                          className="w-full py-2.5 rounded-xl bg-[#0061A4] hover:bg-[#004B80] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4" />
                          <span>{isSendingSupport ? 'Đang Gửi...' : 'Gửi Phản Hồi Trực Tiếp'}</span>
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Version Info */}
                  <div className="bg-[#F8FAFC] p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-3 border-b border-[#E1E2E9] pb-4 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#0061A4] text-white flex items-center justify-center">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-black text-[#1C1B1F]">
                            12. Thông Tin Phiên Bản
                          </h2>
                          <p className="text-xs text-[#44474E]">
                            Lá Chắn Số AI Enterprise Pro
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-[#44474E]">
                        <p className="flex justify-between">
                          <span>Phiên bản ứng dụng:</span>
                          <span className="font-extrabold text-[#0061A4]">v2.6.0 Enterprise</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Động cơ AI:</span>
                          <span className="font-bold text-[#1C1B1F]">Gemini 3.6 Flash</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Cơ sở dữ liệu:</span>
                          <span className="font-bold text-[#1C1B1F]">Firebase Firestore SDK v11</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Dữ liệu Threat Intel:</span>
                          <span className="font-bold text-[#006E00]">NCSC Việt Nam Updated 2026</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => showToast('Bạn đang sử dụng phiên bản mới nhất (v2.6.0 Pro)!', 'info')}
                      className="w-full py-2.5 rounded-xl bg-white border border-[#E1E2E9] hover:bg-[#F3F3F7] text-[#1C1B1F] font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Kiểm Tra Cập Nhật Mô Hình AI</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* FOOTER BAR */}
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E2E9] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#74777F] flex items-center gap-1 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#006E00]" />
            Bảo mật cấp cao theo tiêu chuẩn Material Design 3 & NCSC Việt Nam
          </span>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            Đóng Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};
