import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  MapPin, 
  Phone, 
  CreditCard, 
  Globe, 
  Sliders, 
  RefreshCw, 
  Activity, 
  Lock, 
  ShieldAlert,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { CommunityReport, ManagedUser, ScamCategory } from '../types';
import { updateUserRoleInFirestore } from '../lib/firebase';

interface AdminDashboardProps {
  reports: CommunityReport[];
  onUpdateReports: (updatedReports: CommunityReport[]) => void;
  onDeleteReport?: (reportId: string) => void;
  onUpdateReportStatus?: (reportId: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED') => void;
  isLargeFont: boolean;
}

// Initial Mock Users List for Admin User Management
const INITIAL_USERS: ManagedUser[] = [
  {
    uid: 'u-101',
    displayName: 'Trần Văn Hoàng',
    email: 'tranhoang.vcb@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
    role: 'ADMIN',
    status: 'ACTIVE',
    joinedDate: '15/01/2026',
    scansCount: 42,
    reportsSubmitted: 8,
  },
  {
    uid: 'u-102',
    displayName: 'Nguyễn Thị Mai',
    email: 'nguyenmai.shopee@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mai',
    role: 'MODERATOR',
    status: 'ACTIVE',
    joinedDate: '20/02/2026',
    scansCount: 28,
    reportsSubmitted: 5,
  },
  {
    uid: 'u-103',
    displayName: 'Lê Minh Tuấn',
    email: 'tuan.le.danang@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan',
    role: 'USER',
    status: 'ACTIVE',
    joinedDate: '02/03/2026',
    scansCount: 19,
    reportsSubmitted: 3,
  },
  {
    uid: 'u-104',
    displayName: 'Phạm Thu Hà',
    email: 'ha.pham.cantho@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ha',
    role: 'USER',
    status: 'SUSPENDED',
    joinedDate: '18/04/2026',
    scansCount: 6,
    reportsSubmitted: 1,
  },
  {
    uid: 'u-105',
    displayName: 'Đỗ Đức Hải',
    email: 'haido.haiphong@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hai',
    role: 'USER',
    status: 'BANNED',
    joinedDate: '10/05/2026',
    scansCount: 2,
    reportsSubmitted: 0,
  }
];

// Mock Trend Data for Charts
const WEEKLY_TREND_DATA = [
  { day: 'Thứ 2', scans: 142, reports: 18, highRisk: 45 },
  { day: 'Thứ 3', scans: 198, reports: 24, highRisk: 62 },
  { day: 'Thứ 4', scans: 230, reports: 31, highRisk: 88 },
  { day: 'Thứ 5', scans: 310, reports: 42, highRisk: 110 },
  { day: 'Thứ 6', scans: 285, reports: 39, highRisk: 95 },
  { day: 'Thứ 7', scans: 380, reports: 56, highRisk: 145 },
  { day: 'Chủ Nhật', scans: 420, reports: 68, highRisk: 172 },
];

const CATEGORY_CHART_COLORS = ['#BA1A1A', '#0061A4', '#E65100', '#4F378B', '#006E00', '#74777F'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reports,
  onUpdateReports,
  onDeleteReport,
  onUpdateReportStatus,
  isLargeFont
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'REPORTS' | 'USERS' | 'LOGS'>('OVERVIEW');
  const [usersList, setUsersList] = useState<ManagedUser[]>(() => {
    const saved = localStorage.getItem('lachanso_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Filter States for Reports
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatusFilter, setReportStatusFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED'>('ALL');
  const [selectedReportDetail, setSelectedReportDetail] = useState<CommunityReport | null>(null);

  // Filter States for Users
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'ADMIN' | 'MODERATOR' | 'USER'>('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'>('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'ADMIN' | 'MODERATOR' | 'USER'>('MODERATOR');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; action: string; type: 'SUCCESS' | 'WARNING' | 'INFO' }>>([
    { id: 'l-1', time: '10 phút trước', action: 'Hệ thống AI tự động xác minh 12 báo cáo mạo danh ngân hàng VCB', type: 'SUCCESS' },
    { id: 'l-2', time: '25 phút trước', action: 'Quản trị viên đã phê duyệt báo cáo lừa đảo tuyển dụng Shopee #rep-002', type: 'SUCCESS' },
    { id: 'l-3', time: '1 giờ trước', action: 'Phát hiện số điện thoại rủi ro cao 0901234567 xuất hiện trong 8 lượt quét mới', type: 'WARNING' },
    { id: 'l-4', time: '3 giờ trước', action: 'Cập nhật danh sách chặn 14 tên miền lừa đảo cập nhật VNeID giả mạo', type: 'INFO' },
  ]);

  useEffect(() => {
    localStorage.setItem('lachanso_admin_users', JSON.stringify(usersList));
  }, [usersList]);

  // Statistics calculation
  const totalReportsCount = reports.length;
  const pendingReportsCount = reports.filter(r => r.verifiedStatus === 'PENDING').length;
  const approvedReportsCount = reports.filter(r => r.verifiedStatus === 'VERIFIED').length;
  const rejectedReportsCount = reports.filter(r => r.verifiedStatus === 'REJECTED').length;
  const flaggedReportsCount = reports.filter(r => r.verifiedStatus === 'COMMUNITY_FLAGGED').length;

  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter(u => u.status === 'ACTIVE').length;

  // Category chart distribution data calculation
  const categoryCountMap: Record<string, number> = {};
  reports.forEach(r => {
    const name = r.scamTypeNameVi || 'Lừa đảo khác';
    categoryCountMap[name] = (categoryCountMap[name] || 0) + 1;
  });

  const categoryDistributionData = Object.keys(categoryCountMap).map((catName) => ({
    name: catName.length > 20 ? catName.slice(0, 18) + '...' : catName,
    fullName: catName,
    value: categoryCountMap[catName]
  }));

  // Top reported targets calculation
  const topPhoneNumbers = reports
    .filter(r => r.targetPhone)
    .map(r => ({ phone: r.targetPhone!, count: r.upvotes + 1, name: r.title }));

  // REPORT MANAGEMENT ACTIONS
  const handleApproveReport = (reportId: string) => {
    const updated = reports.map(r => r.id === reportId ? { ...r, verifiedStatus: 'VERIFIED' as const } : r);
    onUpdateReports(updated);
    if (onUpdateReportStatus) onUpdateReportStatus(reportId, 'VERIFIED');
    addAuditLog(`Đã PHÊ DUYỆT báo cáo #${reportId}`, 'SUCCESS');
  };

  const handleRejectReport = (reportId: string) => {
    const updated = reports.map(r => r.id === reportId ? { ...r, verifiedStatus: 'REJECTED' as const } : r);
    onUpdateReports(updated);
    if (onUpdateReportStatus) onUpdateReportStatus(reportId, 'REJECTED');
    addAuditLog(`Đã TỪ CHỐI báo cáo #${reportId}`, 'WARNING');
  };

  const handleFlagReport = (reportId: string) => {
    const updated = reports.map(r => r.id === reportId ? { ...r, verifiedStatus: 'COMMUNITY_FLAGGED' as const } : r);
    onUpdateReports(updated);
    if (onUpdateReportStatus) onUpdateReportStatus(reportId, 'COMMUNITY_FLAGGED');
    addAuditLog(`Đã GẮN CỜ CẢNH BÁO báo cáo #${reportId}`, 'WARNING');
  };

  const handleDeleteReport = (reportId: string) => {
    if (onDeleteReport) {
      onDeleteReport(reportId);
    } else {
      const updated = reports.filter(r => r.id !== reportId);
      onUpdateReports(updated);
    }
    if (selectedReportDetail?.id === reportId) setSelectedReportDetail(null);
    addAuditLog(`Đã XÓA vĩnh viễn báo cáo #${reportId}`, 'WARNING');
  };

  // USER MANAGEMENT ACTIONS
  const handleChangeUserRole = async (uid: string, newRole: 'ADMIN' | 'MODERATOR' | 'USER') => {
    const roleLower = newRole.toLowerCase() as 'admin' | 'moderator' | 'user';
    await updateUserRoleInFirestore(uid, roleLower);
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    addAuditLog(`Đã thay đổi quyền tài khoản ${uid} thành ${newRole}`, 'INFO');
  };

  const handleChangeUserStatus = (uid: string, newStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    setUsersList(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    addAuditLog(`Đã chuyển trạng thái tài khoản ${uid} thành ${newStatus}`, 'WARNING');
  };

  const handleDeleteUser = (uid: string) => {
    setUsersList(prev => prev.filter(u => u.uid !== uid));
    addAuditLog(`Đã xóa tài khoản người dùng ${uid}`, 'WARNING');
  };

  const handleAddNewUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: ManagedUser = {
      uid: 'u-' + Date.now(),
      displayName: newUserName,
      email: newUserEmail,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUserName}`,
      role: newUserRole,
      status: 'ACTIVE',
      joinedDate: new Date().toLocaleDateString('vi-VN'),
      scansCount: 0,
      reportsSubmitted: 0
    };

    setUsersList(prev => [newUser, ...prev]);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    addAuditLog(`Đã tạo tài khoản quản trị mới: ${newUserEmail}`, 'SUCCESS');
  };

  const addAuditLog = (action: string, type: 'SUCCESS' | 'WARNING' | 'INFO') => {
    const newLog = {
      id: 'l-' + Date.now(),
      time: 'Vừa xong',
      action,
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Filtered lists
  const filteredReports = reports.filter(r => {
    const searchLower = reportSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      (r.title || '').toLowerCase().includes(searchLower) ||
      (r.description || '').toLowerCase().includes(searchLower) ||
      (r.targetPhone && r.targetPhone.includes(searchLower)) ||
      (r.targetBankAccount && r.targetBankAccount.includes(searchLower));

    const matchesStatus = reportStatusFilter === 'ALL' || r.verifiedStatus === reportStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = usersList.filter(u => {
    const searchLower = userSearch.toLowerCase().trim();
    const matchesSearch = !searchLower || 
      u.displayName.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower);

    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className={`space-y-6 ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      {/* Admin Dashboard Banner */}
      <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8DEF8] text-[#4F378B] border border-[#D0BCFF] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0061A4]" />
            <span>Trung Tâm Quản Trị Hệ Thống An Ninh</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1B1F] tracking-tight">
            Bảng Điều Khiển Quản Trị Viên (Admin Dashboard)
          </h2>
          <p className="text-[#44474E] text-sm max-w-2xl">
            Quản lý báo cáo lừa đảo từ cộng đồng, kiểm duyệt nội dung, theo dõi thống kê dữ liệu thời gian thực và điều hành tài khoản người dùng.
          </p>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('REPORTS')}
            className="px-4 py-2.5 rounded-full bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFDAD6] text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Chờ Duyệt ({pendingReportsCount})</span>
          </button>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Quản Trị Viên</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#E1E2E9] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#0061A4] text-white shadow-xs'
              : 'bg-white text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Tổng Quan & Thống Kê</span>
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer relative ${
            activeTab === 'REPORTS'
              ? 'bg-[#0061A4] text-white shadow-xs'
              : 'bg-white text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quản Lý Báo Cáo ({totalReportsCount})</span>
          {pendingReportsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'USERS'
              ? 'bg-[#0061A4] text-white shadow-xs'
              : 'bg-white text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Người Dùng ({totalUsersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'LOGS'
              ? 'bg-[#0061A4] text-white shadow-xs'
              : 'bg-white text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Nhật Ký Hệ Thống</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS CHARTS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E1E2E9] rounded-[24px] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#44474E]">Tổng Báo Cáo</span>
                <div className="w-8 h-8 rounded-xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#1C1B1F]">{totalReportsCount}</p>
              <div className="flex items-center text-xs text-[#006E00] font-semibold">
                <TrendingUp className="w-3.5 h-3.5 mr-1" />
                <span>+18% so với tuần trước</span>
              </div>
            </div>

            <div className="bg-white border border-[#FFDAD6] rounded-[24px] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#BA1A1A]">Chờ Phê Duyệt</span>
                <div className="w-8 h-8 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#BA1A1A]">{pendingReportsCount}</p>
              <p className="text-xs text-[#44474E]">Cần kiểm duyệt ngay</p>
            </div>

            <div className="bg-white border border-[#C8E6C9] rounded-[24px] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#006E00]">Đã Phê Duyệt</span>
                <div className="w-8 h-8 rounded-xl bg-[#E8F5E9] text-[#006E00] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#006E00]">{approvedReportsCount}</p>
              <p className="text-xs text-[#006E00] font-medium">Đã xác minh Firestore</p>
            </div>

            <div className="bg-white border border-[#E1E2E9] rounded-[24px] p-5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#44474E]">Tài Khoản Hoạt Động</span>
                <div className="w-8 h-8 rounded-xl bg-[#E8DEF8] text-[#4F378B] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#1C1B1F]">{activeUsersCount} / {totalUsersCount}</p>
              <p className="text-xs text-[#4F378B] font-medium">Người dùng đã xác thực</p>
            </div>
          </div>

          {/* Visual Recharts Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Area Chart: Weekly Scan & Report Trends */}
            <div className="lg:col-span-2 bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-[#0061A4]" />
                  <h3 className="font-extrabold text-base text-[#1C1B1F]">
                    Xu Hướng Quét AI & Báo Cáo Trong Tuần
                  </h3>
                </div>
                <span className="text-xs text-[#44474E] font-medium">Thời gian thực</span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0061A4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0061A4" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BA1A1A" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#BA1A1A" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E2E9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#44474E' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#44474E' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1B1F', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="scans" name="Lượt quét AI" stroke="#0061A4" fillOpacity={1} fill="url(#colorScans)" />
                    <Area type="monotone" dataKey="reports" name="Cảnh báo cộng đồng" stroke="#BA1A1A" fillOpacity={1} fill="url(#colorReports)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart: Scam Category Distribution */}
            <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2 border-b border-[#E1E2E9] pb-3">
                <PieChartIcon className="w-5 h-5 text-[#BA1A1A]" />
                <h3 className="font-extrabold text-base text-[#1C1B1F]">
                  Tỷ Lệ Các Loại Lừa Đảo
                </h3>
              </div>

              <div className="h-64 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1C1B1F', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="space-y-1.5 text-xs max-h-28 overflow-y-auto pr-1">
                {categoryDistributionData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_CHART_COLORS[idx % CATEGORY_CHART_COLORS.length] }} />
                      <span className="text-[#1C1B1F] truncate font-medium">{item.fullName}</span>
                    </div>
                    <span className="font-bold text-[#44474E]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Flagged Target Items */}
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-[#1C1B1F] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#BA1A1A]" />
              <span>Các Mục Tiêu Độc Hại Bị Cảnh Báo Nhiều Nhất</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reports.slice(0, 3).map((r, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#BA1A1A]">{r.scamTypeNameVi}</span>
                    <span className="text-[10px] font-bold bg-[#FFE9E9] text-[#BA1A1A] px-2 py-0.5 rounded-full">
                      {r.upvotes} lượt báo
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#1C1B1F] line-clamp-1">{r.title}</p>
                  {r.targetPhone && (
                    <p className="text-xs text-[#44474E] flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#BA1A1A]" /> SĐT: <span className="font-bold text-[#1C1B1F]">{r.targetPhone}</span>
                    </p>
                  )}
                  {r.targetBankAccount && (
                    <p className="text-xs text-[#44474E] flex items-center gap-1 font-mono">
                      <CreditCard className="w-3.5 h-3.5 text-[#E65100]" /> STK: <span className="font-bold text-[#1C1B1F]">{r.targetBankAccount}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REPORTS MANAGEMENT & APPROVAL WORKFLOW */}
      {activeTab === 'REPORTS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#44474E] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Tìm báo cáo theo tiêu đề, số ĐT, số tài khoản..."
                className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl pl-12 pr-4 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
              />
            </div>

            {/* Filter Status Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'Tất Cả' },
                { id: 'PENDING', label: 'Chờ Duyệt' },
                { id: 'VERIFIED', label: 'Đã Phê Duyệt' },
                { id: 'REJECTED', label: 'Từ Chối' },
                { id: 'COMMUNITY_FLAGGED', label: 'Cảnh Báo Cực Bộ' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setReportStatusFilter(st.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    reportStatusFilter === st.id
                      ? 'bg-[#0061A4] text-white shadow-xs'
                      : 'bg-[#F3F3F7] text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table / Cards List */}
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F3F3F7] text-xs font-bold text-[#44474E] uppercase border-b border-[#E1E2E9]">
                  <tr>
                    <th className="px-5 py-4">Báo Cáo</th>
                    <th className="px-4 py-4">Loại Lừa Đảo</th>
                    <th className="px-4 py-4">Người Gửi</th>
                    <th className="px-4 py-4">Trạng Thái</th>
                    <th className="px-4 py-4 text-center">Tương Tác</th>
                    <th className="px-5 py-4 text-right">Thao Tác Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E2E9]">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#44474E] text-xs">
                        Không tìm thấy báo cáo lừa đảo nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-[#F8F9FF] transition">
                        {/* Report Title */}
                        <td className="px-5 py-4">
                          <div className="space-y-1 max-w-md">
                            <h4 className="font-bold text-[#1C1B1F] line-clamp-1">{rep.title}</h4>
                            <p className="text-xs text-[#44474E] line-clamp-2">{rep.description}</p>
                            <div className="flex items-center gap-2 text-[11px] text-[#74777F] pt-0.5">
                              <span>📍 {rep.locationName}</span>
                              <span>•</span>
                              <span>{new Date(rep.timestamp).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4 font-semibold text-xs text-[#0061A4]">
                          {rep.scamTypeNameVi}
                        </td>

                        {/* Reporter */}
                        <td className="px-4 py-4 text-xs font-medium text-[#1C1B1F]">
                          {rep.reporterName}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4">
                          {rep.verifiedStatus === 'VERIFIED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#006E00] border border-[#C8E6C9]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã Phê Duyệt
                            </span>
                          )}
                          {rep.verifiedStatus === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                              <Clock className="w-3.5 h-3.5" /> Chờ Phê Duyệt
                            </span>
                          )}
                          {rep.verifiedStatus === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFE9E9] text-[#BA1A1A] border border-[#FFDAD6]">
                              <XCircle className="w-3.5 h-3.5" /> Từ Chối
                            </span>
                          )}
                          {rep.verifiedStatus === 'COMMUNITY_FLAGGED' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8DEF8] text-[#4F378B] border border-[#D0BCFF]">
                              <AlertTriangle className="w-3.5 h-3.5" /> Cảnh Báo Cục Bộ
                            </span>
                          )}
                        </td>

                        {/* Upvotes */}
                        <td className="px-4 py-4 text-center font-bold text-xs text-[#44474E]">
                          👍 {rep.upvotes}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedReportDetail(rep)}
                              title="Xem chi tiết"
                              className="p-2 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#0061A4] transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {rep.verifiedStatus !== 'VERIFIED' && (
                              <button
                                onClick={() => handleApproveReport(rep.id)}
                                title="Phê duyệt báo cáo"
                                className="p-2 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#006E00] transition cursor-pointer font-bold"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}

                            {rep.verifiedStatus !== 'REJECTED' && (
                              <button
                                onClick={() => handleRejectReport(rep.id)}
                                title="Từ chối báo cáo"
                                className="p-2 rounded-xl bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] transition cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteReport(rep.id)}
                              title="Xóa báo cáo"
                              className="p-2 rounded-xl bg-[#F3F3F7] hover:bg-[#FFE9E9] text-[#44474E] hover:text-[#BA1A1A] transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-4 sm:p-5 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-[#44474E] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm người dùng theo tên hoặc email..."
                className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl pl-12 pr-4 py-2.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#1C1B1F]"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản Trị Viên (Admin)</option>
                <option value="MODERATOR">Kiểm Duyệt Viên</option>
                <option value="USER">Người Dùng Thường</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#1C1B1F]"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang Hoạt Động</option>
                <option value="SUSPENDED">Tạm Khóa</option>
                <option value="BANNED">Cấm Hoàn Toàn</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F3F3F7] text-xs font-bold text-[#44474E] uppercase border-b border-[#E1E2E9]">
                  <tr>
                    <th className="px-5 py-4">Tài Khoản</th>
                    <th className="px-4 py-4">Vai Trò</th>
                    <th className="px-4 py-4">Trạng Thái</th>
                    <th className="px-4 py-4">Ngày Tham Gia</th>
                    <th className="px-4 py-4 text-center">Lượt Quét / Báo Cáo</th>
                    <th className="px-5 py-4 text-right">Phân Quyền & Quản Lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E2E9]">
                  {filteredUsers.map((usr) => (
                    <tr key={usr.uid} className="hover:bg-[#F8F9FF] transition">
                      {/* Avatar & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={usr.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${usr.displayName}`}
                            alt={usr.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-[#E1E2E9]"
                          />
                          <div>
                            <p className="font-bold text-[#1C1B1F]">{usr.displayName}</p>
                            <p className="text-xs text-[#44474E] font-mono">{usr.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="px-4 py-4">
                        <select
                          value={usr.role}
                          onChange={(e) => handleChangeUserRole(usr.uid, e.target.value as any)}
                          className="bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-2.5 py-1 text-xs font-bold text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#0061A4]"
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="USER">USER</option>
                        </select>
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-4">
                        <select
                          value={usr.status}
                          onChange={(e) => handleChangeUserStatus(usr.uid, e.target.value as any)}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border focus:outline-none ${
                            usr.status === 'ACTIVE'
                              ? 'bg-[#E8F5E9] text-[#006E00] border-[#C8E6C9]'
                              : usr.status === 'SUSPENDED'
                              ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                              : 'bg-[#FFE9E9] text-[#BA1A1A] border-[#FFDAD6]'
                          }`}
                        >
                          <option value="ACTIVE">Đang Hoạt Động</option>
                          <option value="SUSPENDED">Tạm Khóa</option>
                          <option value="BANNED">Cấm</option>
                        </select>
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-4 text-xs font-medium text-[#44474E]">
                        {usr.joinedDate}
                      </td>

                      {/* Activity count */}
                      <td className="px-4 py-4 text-center text-xs font-bold text-[#1C1B1F]">
                        {usr.scansCount} lượt / {usr.reportsSubmitted} báo cáo
                      </td>

                      {/* User Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(usr.uid)}
                          title="Xóa người dùng"
                          className="p-2 rounded-xl bg-[#F3F3F7] hover:bg-[#FFE9E9] text-[#44474E] hover:text-[#BA1A1A] transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#0061A4]" />
              <h3 className="font-extrabold text-base text-[#1C1B1F]">
                Nhật Ký Sự Kiện An Ninh Hệ Thống
              </h3>
            </div>
            <span className="text-xs text-[#006E00] font-bold">● Kết nối Firestore Live</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                    log.type === 'SUCCESS' ? 'bg-[#006E00]' : log.type === 'WARNING' ? 'bg-[#BA1A1A]' : 'bg-[#0061A4]'
                  }`} />
                  <div>
                    <p className="font-bold text-[#1C1B1F]">{log.action}</p>
                    <p className="text-[10px] text-[#74777F] mt-0.5">{log.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORT DETAIL MODAL */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-2xl p-6 sm:p-8 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-[#0061A4]" />
                <h3 className="text-xl font-extrabold text-[#1C1B1F]">
                  Chi Tiết Báo Cáo #{selectedReportDetail.id}
                </h3>
              </div>
              <button onClick={() => setSelectedReportDetail(null)} className="p-2 text-[#44474E] hover:text-[#1C1B1F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE9E9] text-[#BA1A1A] border border-[#FFDAD6]">
                  {selectedReportDetail.scamTypeNameVi}
                </span>
                <h4 className="text-lg font-black text-[#1C1B1F] mt-2">{selectedReportDetail.title}</h4>
                <p className="text-xs text-[#44474E] mt-1">
                  Gửi bởi: <span className="font-bold text-[#1C1B1F]">{selectedReportDetail.reporterName}</span> • Tỉnh: {selectedReportDetail.locationName}
                </p>
              </div>

              <div className="bg-[#F3F3F7] p-4 rounded-2xl border border-[#E1E2E9]">
                <p className="text-xs font-bold text-[#44474E] mb-1">Mô tả sự việc:</p>
                <p className="text-sm text-[#1C1B1F] leading-relaxed whitespace-pre-line">{selectedReportDetail.description}</p>
              </div>

              {/* Target Credentials */}
              {(selectedReportDetail.targetPhone || selectedReportDetail.targetBankAccount || selectedReportDetail.targetUrl) && (
                <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] space-y-1.5 text-xs">
                  <p className="font-bold text-[#BA1A1A]">Thông tin đối tượng lừa đảo bị tố cáo:</p>
                  {selectedReportDetail.targetPhone && <p className="text-[#1C1B1F]">📞 Số ĐT: <span className="font-mono font-bold">{selectedReportDetail.targetPhone}</span></p>}
                  {selectedReportDetail.targetBankAccount && <p className="text-[#1C1B1F]">💳 STK: <span className="font-mono font-bold">{selectedReportDetail.targetBankAccount}</span> ({selectedReportDetail.targetBankName})</p>}
                  {selectedReportDetail.targetUrl && <p className="text-[#1C1B1F]">🌐 Link: <span className="font-mono font-bold underline">{selectedReportDetail.targetUrl}</span></p>}
                </div>
              )}

              {/* Proof images */}
              {selectedReportDetail.proofImages && selectedReportDetail.proofImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#44474E]">Ảnh bằng chứng đính kèm ({selectedReportDetail.proofImages.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReportDetail.proofImages.map((img, i) => (
                      <img key={i} src={img} alt="Bằng chứng" className="w-24 h-24 object-cover rounded-xl border border-[#E1E2E9]" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#E1E2E9]">
              <button
                onClick={() => {
                  handleRejectReport(selectedReportDetail.id);
                  setSelectedReportDetail(null);
                }}
                className="px-5 py-2.5 rounded-full bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] font-bold text-xs cursor-pointer"
              >
                Từ Chối Báo Cáo
              </button>

              <button
                onClick={() => {
                  handleApproveReport(selectedReportDetail.id);
                  setSelectedReportDetail(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Phê Duyệt Khẩn Cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-md p-6 space-y-4 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
              <h3 className="text-lg font-extrabold text-[#1C1B1F] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0061A4]" />
                <span>Thêm Quản Trị Viên Mới</span>
              </h3>
              <button onClick={() => setShowAddUserModal(false)} className="p-1 text-[#44474E] hover:text-[#1C1B1F] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1C1B1F] mb-1">Họ và Tên (*):</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1B1F] mb-1">Địa Chỉ Email (*):</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="quantrivien@lachanso.vn"
                  className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C1B1F] mb-1">Cấp Quyền Hạn:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] font-bold"
                >
                  <option value="MODERATOR">MODERATOR - Kiểm duyệt viên báo cáo</option>
                  <option value="ADMIN">ADMIN - Quản trị viên toàn quyền</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E1E2E9]">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-full bg-[#F3F3F7] text-[#1C1B1F] font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold cursor-pointer shadow-xs"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
