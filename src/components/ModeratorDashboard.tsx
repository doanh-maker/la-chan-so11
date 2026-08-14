import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  FileText, 
  Eye, 
  Check, 
  X, 
  Flag, 
  MessageSquare, 
  Tag, 
  RefreshCw,
  User,
  MapPin,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { CommunityReport } from '../types';

interface ModeratorDashboardProps {
  reports: CommunityReport[];
  onUpdateReports: (updatedReports: CommunityReport[]) => void;
  onDeleteReport?: (reportId: string) => void;
  onUpdateReportStatus?: (reportId: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED') => void;
  isLargeFont: boolean;
}

export const ModeratorDashboard: React.FC<ModeratorDashboardProps> = ({
  reports,
  onUpdateReports,
  onDeleteReport,
  onUpdateReportStatus,
  isLargeFont
}) => {
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'PENDING' | 'WAITING_EVIDENCE'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  // Filter reports based on activeTab
  const getFilteredReports = () => {
    return reports.filter(r => {
      // Search text filter
      const matchesSearch = 
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.reporterName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.targetPhone && r.targetPhone.includes(searchQuery)) ||
        (r.targetBankAccount && r.targetBankAccount.includes(searchQuery));

      if (!matchesSearch) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && r.scamType !== selectedCategory) {
        return false;
      }

      // Tab filter
      if (activeTab === 'PENDING') {
        return !r.riskLevel || r.riskLevel === 'WARNING' || (r as any).status === 'PENDING' || r.verifiedStatus === 'PENDING';
      }
      if (activeTab === 'WAITING_EVIDENCE') {
        return (r as any).status === 'WAITING_EVIDENCE' || (r.proofImages && r.proofImages.length === 0);
      }
      return true; // MANAGEMENT = ALL
    });
  };

  const handleApproveReport = (reportId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          reporterVerified: true,
          riskLevel: 'HIGH' as const,
          status: 'VERIFIED',
          verifiedStatus: 'VERIFIED' as const
        };
      }
      return r;
    });
    onUpdateReports(updated);
    if (onUpdateReportStatus) onUpdateReportStatus(reportId, 'VERIFIED');
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport({ ...selectedReport, reporterVerified: true, riskLevel: 'HIGH', verifiedStatus: 'VERIFIED' });
    }
  };

  const handleRejectReport = (reportId: string) => {
    const updated = reports.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'REJECTED',
          verifiedStatus: 'REJECTED' as const
        };
      }
      return r;
    });
    onUpdateReports(updated);
    if (onUpdateReportStatus) onUpdateReportStatus(reportId, 'REJECTED');
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(null);
    }
  };

  const filteredReports = getFilteredReports();

  return (
    <div className={`space-y-6 ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      {/* Top Header Card */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#1D192B] to-[#4F378B] text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> MODERATOR WORKSPACE
            </span>
            <span className="text-xs text-[#E8DEF8] font-semibold">Cấp quyền: Kiểm duyệt nội dung</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">Trung Tâm Kiểm Duyệt Báo Cáo</h2>
          <p className="text-xs text-[#E8DEF8] max-w-xl">
            Đánh giá, phê duyệt và gắn nhãn xác thực báo cáo lừa đảo từ cộng đồng nhằm duy trì dữ liệu an ninh mạng chính xác.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0 z-10">
          <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-xs text-white/80 block font-medium">Chờ kiểm duyệt</span>
            <span className="text-xl font-extrabold text-[#FFD8E4]">{reports.filter(r => !r.reporterVerified).length} vụ</span>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-2xl border border-white/20 text-center">
            <span className="text-xs text-white/80 block font-medium">Đã phê duyệt</span>
            <span className="text-xl font-extrabold text-[#C8E6C9]">{reports.filter(r => r.reporterVerified).length} vụ</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#E1E2E9] pb-3">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'PENDING'
              ? 'bg-[#4F378B] text-white shadow-md'
              : 'bg-white text-[#44474E] hover:bg-[#F3F3F7] border border-[#E1E2E9]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Kiểm Duyệt ({reports.filter(r => !r.reporterVerified).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WAITING_EVIDENCE')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'WAITING_EVIDENCE'
              ? 'bg-[#4F378B] text-white shadow-md'
              : 'bg-white text-[#44474E] hover:bg-[#F3F3F7] border border-[#E1E2E9]'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-[#E65100]" />
          <span>Danh Sách Chờ Duyệt / Thiếu Bằng Chứng</span>
        </button>

        <button
          onClick={() => setActiveTab('MANAGEMENT')}
          className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition flex items-center space-x-2 cursor-pointer ${
            activeTab === 'MANAGEMENT'
              ? 'bg-[#4F378B] text-white shadow-md'
              : 'bg-white text-[#44474E] hover:bg-[#F3F3F7] border border-[#E1E2E9]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tất Cả Báo Cáo ({reports.length})</span>
        </button>
      </div>

      {/* Filters Search Bar */}
      <div className="bg-white p-4 rounded-[24px] border border-[#E1E2E9] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-[#44474E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, số điện thoại, tài khoản..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#F3F3F7] border border-[#E1E2E9] text-xs font-medium text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#4F378B]"
          />
        </div>

        <div className="text-xs text-[#44474E] font-medium flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#4F378B]" />
          <span>Hiển thị {filteredReports.length} báo cáo</span>
        </div>
      </div>

      {/* Reports Moderation List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Reports List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white p-12 rounded-[28px] border border-[#E1E2E9] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#006E00] mx-auto" />
              <h3 className="font-extrabold text-base text-[#1C1B1F]">Không có báo cáo nào ở danh sách này</h3>
              <p className="text-xs text-[#44474E]">Mọi báo cáo trong mục này đã được xử lý hoàn tất.</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-5 rounded-[24px] bg-white border transition cursor-pointer space-y-3 relative ${
                  selectedReport?.id === report.id
                    ? 'border-[#4F378B] ring-2 ring-[#4F378B]/20 shadow-md'
                    : 'border-[#E1E2E9] hover:border-[#4F378B]/50 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E8DEF8] text-[#4F378B]">
                        {report.scamTypeNameVi}
                      </span>
                      {report.reporterVerified ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#C8E6C9] text-[#006E00] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã duyệt
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFDAD6] text-[#BA1A1A] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Chờ duyệt
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-sm text-[#1C1B1F] hover:text-[#4F378B] transition">
                      {report.title}
                    </h3>
                  </div>

                  <span className="text-[11px] text-[#74777F] shrink-0 font-medium">
                    {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <p className="text-xs text-[#44474E] line-clamp-2">
                  {report.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-[#44474E] pt-2 border-t border-[#F3F3F7] gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#4F378B]" /> {report.reporterName}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#E65100]" /> {report.locationName}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedReport(report);
                    }}
                    className="px-3 py-1 rounded-full bg-[#F3F3F7] hover:bg-[#E8DEF8] text-[#4F378B] font-bold text-[11px] transition"
                  >
                    Xem chi tiết & Phê duyệt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Detail & Moderation Panel */}
        <div className="lg:col-span-1">
          {selectedReport ? (
            <div className="bg-white p-6 rounded-[28px] border border-[#4F378B] shadow-md space-y-5 sticky top-20">
              <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
                <span className="text-xs font-extrabold text-[#4F378B] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Bảng Kiểm Duyệt
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1 rounded-full text-[#74777F] hover:bg-[#F3F3F7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-extrabold text-base text-[#1C1B1F]">{selectedReport.title}</h3>
                <p className="text-xs text-[#44474E] leading-relaxed bg-[#F3F3F7] p-3 rounded-2xl border border-[#E1E2E9]">
                  {selectedReport.description}
                </p>
              </div>

              {/* Targets Intel */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#1C1B1F] flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#4F378B]" /> Thông tin đối tượng lừa đảo:
                </h4>
                {selectedReport.targetPhone && (
                  <div className="flex justify-between p-2 rounded-xl bg-[#FFDAD6]/50 text-[#BA1A1A] font-medium">
                    <span>Số điện thoại:</span>
                    <span className="font-extrabold">{selectedReport.targetPhone}</span>
                  </div>
                )}
                {selectedReport.targetBankAccount && (
                  <div className="flex justify-between p-2 rounded-xl bg-[#FFDAD6]/50 text-[#BA1A1A] font-medium">
                    <span>Số tài khoản NH:</span>
                    <span className="font-extrabold">{selectedReport.targetBankAccount} ({selectedReport.targetBankName || 'Ngân hàng'})</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-3 border-t border-[#E1E2E9]">
                <p className="text-xs font-bold text-[#1C1B1F]">Hành động kiểm duyệt:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleApproveReport(selectedReport.id)}
                    className="py-2.5 px-3 rounded-full bg-[#006E00] hover:bg-[#005200] text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Phê Duyệt</span>
                  </button>

                  <button
                    onClick={() => handleRejectReport(selectedReport.id)}
                    className="py-2.5 px-3 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Từ Chối</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[28px] border border-[#E1E2E9] text-center text-[#74777F] space-y-2 sticky top-20">
              <Eye className="w-8 h-8 mx-auto text-[#4F378B]/50" />
              <p className="text-xs font-bold text-[#1C1B1F]">Chọn một báo cáo từ danh sách</p>
              <p className="text-[11px]">Nhấn vào báo cáo bất kỳ ở cột trái để xem chi tiết và thực hiện kiểm duyệt.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
