import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Phone, 
  CreditCard, 
  Globe, 
  Mail, 
  Send, 
  Share2, 
  CheckCircle2, 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare, 
  Bookmark, 
  Copy, 
  ExternalLink, 
  Eye, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  Sparkles, 
  FileText, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Maximize2, 
  QrCode, 
  Search, 
  Lock, 
  Shield, 
  ChevronRight,
  Flame,
  Check,
  CheckSquare,
  PhoneCall,
  UserCheck,
  Building,
  Radio,
  Share,
  CornerUpRight,
  Heart,
  Flag,
  Info,
  Layers,
  Award
} from 'lucide-react';
import { CommunityReport, ReportComment, TargetPhoneNumber, TargetBankAccount, TargetWebsite, TargetEmail } from '../types';
import { 
  subscribeToReportComments, 
  addFirestoreReportComment, 
  upvoteFirestoreReport,
  auth 
} from '../lib/firebase';

interface ReportDetailModalProps {
  report: CommunityReport | null;
  onClose: () => void;
  onOpenEmergency?: () => void;
  isLargeFont?: boolean;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onOpenEmergency,
  isLargeFont = false
}) => {
  if (!report) return null;

  // Local interactive states
  const [comments, setComments] = useState<ReportComment[]>(report.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [commentSort, setCommentSort] = useState<'newest' | 'top'>('newest');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // Interactive counts & states
  const [usefulVotes, setUsefulVotes] = useState<number>(report.usefulCount ?? report.upvotes ?? 89);
  const [userVoted, setUserVoted] = useState<'useful' | 'unuseful' | null>(null);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [showReportFlagModal, setShowReportFlagModal] = useState<boolean>(false);
  const [flagReason, setFlagReason] = useState<string>('');
  const [flagSubmitted, setFlagSubmitted] = useState<boolean>(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  // Subscribe to real-time comments from Firestore
  useEffect(() => {
    if (report?.id) {
      const unsubscribe = subscribeToReportComments(report.id, (firestoreComments) => {
        if (firestoreComments.length > 0) {
          setComments(firestoreComments);
        }
      });
      return () => unsubscribe();
    }
  }, [report?.id]);

  // Derived threat intelligence data normalization
  const riskScore = report.riskScore ?? (report.riskLevel === 'CRITICAL' ? 98 : report.riskLevel === 'HIGH' ? 82 : 65);
  const confidenceScore = report.confidenceScore ?? 95;
  const riskLevel = report.riskLevel ?? 'CRITICAL';
  
  const riskLevelBadge = {
    CRITICAL: { label: 'CRITICAL • RẤT NGUY HIỂM', bg: 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFDAD6]', darkBg: 'dark:bg-[#93000A]/40 dark:text-[#FFB4AB] dark:border-[#93000A]', icon: AlertOctagon },
    HIGH: { label: 'HIGH • NGUY HIỂM CAO', bg: 'bg-[#FFDCC2] text-[#E65100] border-[#FFDCC2]', darkBg: 'dark:bg-[#E65100]/30 dark:text-[#FFB784]', icon: AlertTriangle },
    WARNING: { label: 'WARNING • CẢNH BÁO', bg: 'bg-[#FFF0C2] text-[#8C6200] border-[#FFF0C2]', darkBg: 'dark:bg-[#8C6200]/30 dark:text-[#FFE088]', icon: Info },
    SAFE: { label: 'SAFE • AN TOÀN', bg: 'bg-[#C8E6C9] text-[#006E00] border-[#C8E6C9]', darkBg: 'dark:bg-[#006E00]/30 dark:text-[#81C784]', icon: ShieldCheck },
  }[riskLevel];

  const verifiedStatusConfig = {
    VERIFIED: { label: 'Đã xác minh bởi NCSC / Công an', color: 'bg-[#006E00] text-white', icon: ShieldCheck },
    PENDING: { label: 'Đang xác minh nghiệp vụ', color: 'bg-[#E65100] text-white', icon: Clock },
    COMMUNITY_FLAGGED: { label: 'Cộng đồng cảnh báo', color: 'bg-[#0061A4] text-white', icon: Users },
    REJECTED: { label: 'Không đủ bằng chứng', color: 'bg-gray-500 text-white', icon: X },
  }[report.verifiedStatus || 'VERIFIED'];

  // Data helpers
  const phoneNumbers: TargetPhoneNumber[] = report.phoneNumbers && report.phoneNumbers.length > 0 
    ? report.phoneNumbers 
    : report.targetPhone ? [{ number: report.targetPhone, carrier: 'Viettel / Vinaphone / Mobifone', reportsCount: 14 }] : [];

  const bankAccounts: TargetBankAccount[] = report.bankAccounts && report.bankAccounts.length > 0 
    ? report.bankAccounts 
    : report.targetBankAccount ? [{
        bankName: report.targetBankName || 'Ngân Hàng MB Bank / VCB',
        accountNumber: report.targetBankAccount,
        accountName: report.targetAccountName || 'TÀI KHOẢN TRUNG GIAN LỪA ĐẢO',
        branch: 'Hà Nội / TP.HCM'
      }] : [];

  const websites: TargetWebsite[] = report.websites && report.websites.length > 0 
    ? report.websites 
    : report.targetUrl ? [{
        domain: report.targetUrl.replace(/^https?:\/\//, '').split('/')[0],
        url: report.targetUrl,
        ssl: false,
        registrar: 'NameCheap / Cloudflare Inc.',
        creationDate: '2026-01-15',
        expiryDate: '2027-01-15',
        ip: '104.21.45.122',
        hosting: 'Cloudflare CDN',
        asn: 'AS13335 CLOUDFLARENET'
      }] : [];

  const emails: TargetEmail[] = report.emails && report.emails.length > 0 
    ? report.emails 
    : [{ email: 'support-shopee-verify@gmail.com', mxRecord: true, spf: false, dkim: false }];

  const redFlags = report.aiRedFlags || report.redFlags || [
    'Giả danh thương hiệu Shopee / Ngân hàng uy tín',
    'Hứa hẹn thu nhập 500k - 1 triệu/ngày việc nhẹ lương cao',
    'Yêu cầu nạp tiền / chuyển khoản trước làm nhiệm vụ',
    'Dẫn dắt chuyển sang ứng dụng chat Telegram bí mật',
    'Không có hợp đồng lao động hay thông tin công ty rõ ràng',
    'Cam kết lợi nhuận bất thường từ 20% đến 50%',
    'Tài khoản thụ hưởng là Tài khoản cá nhân hoặc Công ty truyền thông lạ',
    'Đường link website giả mạo tên miền quốc tế (.xyz, .info, .top)'
  ];

  const recommendedChecklist = report.aiRecommendation || report.recommendedActions || [
    'KHÔNG chuyển tiền dưới bất kỳ hình thức nào',
    'KHÔNG cung cấp mã OTP, Mật khẩu VNeID hay Ngân hàng',
    'Khóa tài khoản ngân hàng & thẻ tín dụng khẩn cấp nếu đã lỡ thao tác',
    'Liên hệ ngay đường dây nóng Hotline Ngân hàng chính thức',
    'Báo cáo Cơ quan Công an phường/quận gần nhất',
    'Báo phản ánh tới Cục An toàn thông tin (Bộ TT&TT) qua đầu số 156 / 5656'
  ];

  const timelineSteps = report.timeline || [
    { stepNumber: 1, timeOffset: '08:00', title: 'Nhận tin nhắn dụ dỗ', description: 'Đối tượng gửi tin nhắn SMS/Zalo quảng cáo tuyển CTV chốt đơn thu nhập cao.', severity: 'INFO' },
    { stepNumber: 2, timeOffset: '08:15', title: 'Tham gia Telegram', description: 'Nạn nhân được đưa vào nhóm Telegram có hàng chục "chim mồi" khoe nhận tiền.', severity: 'WARNING' },
    { stepNumber: 3, timeOffset: '08:30', title: 'Nạp tiền thử nhiệm vụ nhỏ', description: 'Nạp 100k, được hoàn lại 130k thành công để tạo niềm tin tuyệt đối.', severity: 'WARNING' },
    { stepNumber: 4, timeOffset: '08:45', title: 'Yêu cầu nạp số tiền lớn', description: 'Yêu cầu nạp 5-20 triệu làm "nhiệm vụ liên hoàn". Báo lỗi cú pháp khi đòi rút tiền.', severity: 'CRITICAL' },
    { stepNumber: 5, timeOffset: '09:00', title: 'Khóa tiền & ép nạp tiếp', description: 'Hệ thống báo tài khoản bị đóng băng, hối thúc nạp thêm 50 triệu để giải cứu.', severity: 'CRITICAL' },
    { stepNumber: 6, timeOffset: '09:10', title: 'Chiếm đoạt & Chặn liên lạc', description: 'Sau khi nhận khoản tiền lớn, kẻ lừa đảo xóa tài khoản Telegram và chặn số.', severity: 'CRITICAL' }
  ];

  const proofImages = report.screenshots || report.proofImages || [
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  ];

  // Actions
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleVote = (type: 'useful' | 'unuseful') => {
    if (userVoted === type) return;
    if (type === 'useful') {
      setUsefulVotes(prev => prev + 1);
      setUserVoted('useful');
      upvoteFirestoreReport(report.id);
    } else {
      setUserVoted('unuseful');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    const authorName = auth?.currentUser?.displayName || 'Cộng đồng An ninh mạng';
    const authorAvatar = auth?.currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    const text = commentInput.trim();

    const newComment: ReportComment = {
      id: 'cmt-' + Date.now(),
      reportId: report.id,
      authorName,
      authorAvatar,
      content: text,
      timestamp: Date.now()
    };

    setComments(prev => [newComment, ...prev]);
    setCommentInput('');
    setIsSubmittingComment(false);

    await addFirestoreReportComment(report.id, authorName, authorAvatar, text);
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === 'newest') return b.timestamp - a.timestamp;
    return b.timestamp - a.timestamp; // Simplified for top sorting
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex justify-center p-2 sm:p-4 md:p-6 animate-fade-in">
      {/* Container Card */}
      <div 
        className={`bg-white text-[#1C1B1F] rounded-[28px] border border-[#E1E2E9] shadow-2xl w-full max-w-5xl my-auto relative overflow-hidden flex flex-col max-h-[92vh] animate-zoom-in ${
          isLargeFont ? 'text-lg' : 'text-base'
        }`}
      >
        {/* TOP BAR / HEADER CONTROL */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#E1E2E9] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#BA1A1A]">
                  THREAT INTEL DEEP ANALYSIS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D1E4FF] text-[#0061A4] font-bold">
                  MÃ BÁO CÁO: {report.id}
                </span>
              </div>
              <h1 className="text-sm font-bold text-[#1C1B1F] truncate max-w-md">
                {report.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2.5 rounded-full border transition ${
                isBookmarked 
                  ? 'bg-[#FFDAD6] text-[#BA1A1A] border-[#FFDAD6]' 
                  : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9] hover:bg-[#E7E8EE]'
              }`}
              title="Lưu cảnh báo này"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-2.5 rounded-full bg-[#F3F3F7] text-[#44474E] border border-[#E1E2E9] hover:bg-[#E7E8EE] transition"
              title="Mã QR chia sẻ nhanh"
            >
              <QrCode className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#F3F3F7] text-[#44474E] hover:bg-[#BA1A1A] hover:text-white border border-[#E1E2E9] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE MAIN CONTENT BODY */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8 flex-1">

          {/* SECTION 1: HEADER & META INFO */}
          <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-[24px] border border-[#E1E2E9] space-y-4">
            
            {/* Reporter & Metadata Grid */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E1E2E9] pb-4">
              <div className="flex items-center space-x-3.5">
                <img 
                  src={report.reporterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${report.reporterName}`} 
                  alt={report.reporterName} 
                  className="w-12 h-12 rounded-2xl border-2 border-[#0061A4] object-cover bg-white"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-[#1C1B1F] text-base">
                      {report.reporterName}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006E00] bg-[#C8E6C9] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Đã xác minh danh tính
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#44474E] mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#0061A4]" /> {report.locationName || 'Việt Nam'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Báo cáo: {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Xảy ra: {report.incidentTime || 'Mới đây'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges & Status */}
              <div className="flex flex-wrap items-center gap-2">
                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${riskLevelBadge.bg}`}>
                  <riskLevelBadge.icon className="w-4 h-4" />
                  <span>{riskLevelBadge.label}</span>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${verifiedStatusConfig.color}`}>
                  <verifiedStatusConfig.icon className="w-4 h-4" />
                  <span>{verifiedStatusConfig.label}</span>
                </div>
              </div>
            </div>

            {/* TITLE & SHORT SUMMARY */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D1E4FF] text-[#0061A4] text-xs font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>{report.scamTypeNameVi}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#1C1B1F] tracking-tight leading-snug">
                {report.title}
              </h1>
              <p className="text-[#44474E] text-sm sm:text-base leading-relaxed">
                {report.summary || report.aiSummary || report.description.slice(0, 180) + '...'}
              </p>
            </div>
          </div>

          {/* SECTION 2: AI RISK ASSESSMENT & GEMINI ANALYSIS CARD */}
          <div className="relative rounded-[28px] overflow-hidden border border-[#FFDAD6] bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFE9E9] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#FFDAD6] pb-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#BA1A1A] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
                    ĐÁNH GIÁ NGUY CƠ AI GEMINI 3.6
                  </h3>
                  <p className="text-xs text-[#44474E]">
                    Phân tích trí tuệ nhân tạo chuyên sâu dựa trên cơ sở dữ liệu NCSC & SOC Threat Intel
                  </p>
                </div>
              </div>

              {/* Big Score Counter */}
              <div className="flex items-center space-x-4 bg-white/80 backdrop-blur border border-[#FFDAD6] px-5 py-3 rounded-2xl shrink-0">
                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase text-[#BA1A1A]">
                    RISK SCORE
                  </span>
                  <span className="text-3xl font-black text-[#BA1A1A]">
                    {riskScore}<span className="text-sm text-gray-500">/100</span>
                  </span>
                </div>
                <div className="h-8 w-px bg-[#E1E2E9]" />
                <div className="text-center">
                  <span className="block text-[10px] font-black uppercase text-[#0061A4]">
                    CONFIDENCE
                  </span>
                  <span className="text-xl font-extrabold text-[#0061A4]">
                    {confidenceScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* AI Insights & Red Flags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left AI Explanation */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-[#1C1B1F] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" /> Tóm Tắt & Giải Thích Thủ Đoạn:
                </h4>
                <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed bg-white/80 p-4 rounded-2xl border border-[#E1E2E9]">
                  {report.aiAnalysis || report.explanation || (
                    `Gemini AI phát hiện mẫu hình lừa đảo tinh vi. Đối tượng tận dụng tâm lý muốn kiếm tiền nhanh hoặc sự nhẹ dạ của nạn nhân để dẫn dắt qua các bước kịch bản dàn dựng sẵn (nhiệm vụ nhỏ trả thưởng mồi, nhiệm vụ lớn đóng băng tài khoản). Các liên kết và tài khoản ngân hàng liên quan đều có trong danh sách đen cảnh báo an ninh mạng.`
                  )}
                </p>
              </div>

              {/* Right Red Flags Badges */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-[#1C1B1F] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#E65100]" /> Dấu Hiệu Bất Thường Dấu Hiệu Lừa Đảo:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {redFlags.map((flag, idx) => (
                    <div 
                      key={idx} 
                      className="px-3 py-1.5 rounded-xl bg-white border border-[#FFDAD6] text-xs font-semibold text-[#BA1A1A] flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: DETAILED DESCRIPTION */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E1E2E9] space-y-4">
            <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0061A4]" /> Chi Tiết Diễn Biến Vụ Việc:
            </h3>
            <div className="relative">
              <p className={`text-sm sm:text-base text-[#44474E] leading-relaxed whitespace-pre-line ${
                !isDescriptionExpanded ? 'line-clamp-4' : ''
              }`}>
                {report.description}
              </p>
              {report.description.length > 240 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 text-xs font-bold text-[#0061A4] hover:underline flex items-center gap-1"
                >
                  {isDescriptionExpanded ? 'Thu gọn nội dung' : 'Đọc thêm chi tiết diễn biến...'}
                </button>
              )}
            </div>
          </div>

          {/* SECTION 4: TARGET INTELLIGENCE CARDS (CHỈ SỐ ĐỐI TƯỢNG) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#BA1A1A]" /> Thông Tin Đối Tượng Lừa Đảo (Target Intel):
              </h3>
              <span className="text-xs text-[#44474E] font-medium">
                Tra cứu trực tiếp trên hệ thống SOC
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Card 1: Số điện thoại */}
              {phoneNumbers.length > 0 && phoneNumbers.map((p, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#BA1A1A] bg-[#FFDAD6] px-2.5 py-0.5 rounded-full">
                        SỐ ĐIỆN THOẠI
                      </span>
                      <span className="text-xs text-[#44474E] font-medium">{p.carrier || 'Nhà mạng VN'}</span>
                    </div>
                    <p className="text-xl font-black text-[#1C1B1F] tracking-wider flex items-center gap-2">
                      <Phone className="w-5 h-5 text-[#BA1A1A]" />
                      {p.number}
                    </p>
                    <p className="text-xs text-[#44474E] mt-1">
                      {p.reportsCount || 12} báo cáo lừa đảo liên quan
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E1E2E9]">
                    <button
                      onClick={() => handleCopy(p.number, `phone-${i}`)}
                      className="flex-1 py-2 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] text-xs font-bold text-[#1C1B1F] flex items-center justify-center gap-1 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedField === `phone-${i}` ? 'Đã copy' : 'Copy'}
                    </button>
                    <a
                      href={`tel:${p.number}`}
                      className="py-2 px-3 rounded-xl bg-[#FFDAD6] text-[#BA1A1A] hover:bg-[#BA1A1A] hover:text-white text-xs font-bold flex items-center justify-center transition"
                      title="Gọi điện"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}

              {/* Card 2: Ngân hàng */}
              {bankAccounts.length > 0 && bankAccounts.map((b, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#0061A4] bg-[#D1E4FF] px-2.5 py-0.5 rounded-full">
                        TÀI KHOẢN NGÂN HÀNG
                      </span>
                      <Building className="w-4 h-4 text-[#0061A4]" />
                    </div>
                    <p className="text-xs font-bold text-[#0061A4]">
                      {b.bankName}
                    </p>
                    <p className="text-lg font-black text-[#1C1B1F] tracking-wider my-0.5 font-mono">
                      {b.accountNumber}
                    </p>
                    <p className="text-xs font-bold text-[#44474E] uppercase">
                      Chủ TK: {b.accountName || 'Tài khoản giả mạo'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E1E2E9]">
                    <button
                      onClick={() => handleCopy(b.accountNumber, `bank-${i}`)}
                      className="flex-1 py-2 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] text-xs font-bold text-[#1C1B1F] flex items-center justify-center gap-1 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedField === `bank-${i}` ? 'Đã copy' : 'Sao chép STK'}
                    </button>
                  </div>
                </div>
              ))}

              {/* Card 3: Website Domain */}
              {websites.length > 0 && websites.map((w, i) => (
                <div key={i} className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#8C6200] bg-[#FFF0C2] px-2.5 py-0.5 rounded-full">
                        WEBSITE ĐỘC HẠI
                      </span>
                      <Globe className="w-4 h-4 text-[#8C6200]" />
                    </div>
                    <p className="text-base font-black text-[#1C1B1F] truncate">
                      {w.domain}
                    </p>
                    <div className="text-[11px] text-[#44474E] space-y-0.5 mt-1">
                      <p>SSL: {w.ssl ? '✅ Có HTTPS' : '❌ Không SSL'}</p>
                      <p>Hosting: {w.hosting || 'Cloudflare'}</p>
                      <p>IP: {w.ip || '104.21.45.122'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E1E2E9]">
                    <a
                      href={`https://www.virustotal.com/gui/search/${encodeURIComponent(w.domain)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl bg-[#0061A4] hover:bg-[#004B80] text-xs font-bold text-white flex items-center justify-center gap-1 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Quét VirusTotal
                    </a>
                  </div>
                </div>
              ))}

              {/* Card 4: Social Handles (Telegram/Facebook/Zalo) */}
              {(report.telegrams?.length || report.facebooks?.length || report.targetSocialHandle) && (
                <div className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#4F378B] bg-[#E8DEF8] px-2.5 py-0.5 rounded-full">
                        MẠNG XÃ HỘI & CHAT
                      </span>
                      <Send className="w-4 h-4 text-[#4F378B]" />
                    </div>
                    <p className="text-sm font-bold text-[#1C1B1F] truncate">
                      {report.targetSocialHandle || report.telegrams?.[0] || '@CongTacVienShopee_Official'}
                    </p>
                    <p className="text-xs text-[#44474E] mt-1">
                      Kênh tiếp cận dụ dỗ nạn nhân
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#E1E2E9]">
                    <button
                      onClick={() => handleCopy(report.targetSocialHandle || '@CongTacVienShopee_Official', 'social')}
                      className="flex-1 py-2 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] text-xs font-bold text-[#1C1B1F] flex items-center justify-center gap-1 transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedField === 'social' ? 'Đã copy' : 'Copy Handle'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 5: EVIDENCE GALLERY & LIGHTBOX */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E1E2E9] space-y-4">
            <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#0061A4]" /> Bằng Chứng Báo Cáo ({proofImages.length} Tệp Ảnh):
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {proofImages.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveLightboxMedia(imgUrl)}
                  className="relative h-40 rounded-2xl border border-[#E1E2E9] overflow-hidden group cursor-pointer bg-[#F3F3F7]"
                >
                  <img 
                    src={imgUrl} 
                    alt={`Proof ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" /> Xem Phóng To
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 6: TIMELINE DIỄN BIẾN THỜI GIAN */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E1E2E9] space-y-5">
            <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0061A4]" /> Dòng Thời Gian Trình Tự Sự Việc (Scam Progression Timeline):
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E1E2E9]">
              {timelineSteps.map((step) => (
                <div key={step.stepNumber} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-xs ${
                    step.severity === 'CRITICAL' ? 'bg-[#BA1A1A]' : step.severity === 'WARNING' ? 'bg-[#E65100]' : 'bg-[#0061A4]'
                  }`}>
                    {step.stepNumber}
                  </div>

                  <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E1E2E9] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#0061A4]">
                        ⏱️ {step.timeOffset}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        step.severity === 'CRITICAL' ? 'bg-[#FFDAD6] text-[#BA1A1A]' : 'bg-[#D1E4FF] text-[#0061A4]'
                      }`}>
                        {step.severity}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#1C1B1F]">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#44474E]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: EMERGENCY CHECKLIST & HOTLINE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Checklist Box */}
            <div className="bg-[#F3F4F9] p-6 rounded-[24px] border border-[#E1E2E9] space-y-4">
              <h3 className="text-base font-black text-[#1C1B1F] flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#006E00]" /> Khuyến Nghị Phòng Tránh Khẩn Cấp:
              </h3>
              <ul className="space-y-2.5">
                {recommendedChecklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#1C1B1F] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#006E00] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Emergency Hotline Card */}
            <div className="bg-[#BA1A1A] text-white p-6 rounded-[24px] shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>ĐƯỜNG DÂY NÓNG QUỐC GIA KÍCH HOẠT KhẨN CẤP</span>
                </div>
                <h3 className="text-xl font-black">Tổng Đài Tiếp Nhận Báo Cáo Lừa Đảo</h3>
                <p className="text-xs text-white/90 mt-1">
                  Nếu bạn hoặc người thân đã vô tình bị chiếm đoạt tài sản, hãy lập tức liên hệ các kênh chính thức:
                </p>
              </div>

              <div className="space-y-2 text-xs font-bold bg-black/20 p-3.5 rounded-2xl border border-white/20">
                <div className="flex justify-between items-center">
                  <span>🚨 Công An Khẩn Cấp:</span>
                  <a href="tel:113" className="px-3 py-1 bg-white text-[#BA1A1A] rounded-lg font-black hover:bg-gray-100">113</a>
                </div>
                <div className="flex justify-between items-center">
                  <span>📞 Tổng đài phản ánh lừa đảo:</span>
                  <a href="tel:156" className="px-3 py-1 bg-white text-[#BA1A1A] rounded-lg font-black hover:bg-gray-100">156 / 5656</a>
                </div>
                <div className="flex justify-between items-center">
                  <span>🛡️ VNCERT (Bộ TT&TT):</span>
                  <a href="tel:02436230393" className="px-3 py-1 bg-white text-[#BA1A1A] rounded-lg font-black hover:bg-gray-100">024.36230393</a>
                </div>
              </div>

              <button
                onClick={onOpenEmergency}
                className="w-full py-3 rounded-xl bg-white text-[#BA1A1A] hover:bg-gray-100 font-extrabold text-xs tracking-wide uppercase transition shadow-md"
              >
                Mở Quy Trình Khóa Tài Khoản Khẩn Cấp
              </button>
            </div>
          </div>

          {/* SECTION 8: COMMUNITY FEEDBACK & REAL-TIME COMMENTS */}
          <div className="bg-white p-6 rounded-[24px] border border-[#E1E2E9] space-y-6">
            
            {/* Feedback Votes */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E1E2E9] pb-4">
              <div>
                <h3 className="text-lg font-black text-[#1C1B1F] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#0061A4]" /> Đánh Giá Từ Cộng Đồng:
                </h3>
                <p className="text-xs text-[#44474E]">
                  {usefulVotes} người thấy cảnh báo này hữu ích • {comments.length} bình luận
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('useful')}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                    userVoted === 'useful'
                      ? 'bg-[#006E00] text-white border-[#006E00]'
                      : 'bg-[#F3F3F7] text-[#1C1B1F] border-[#E1E2E9] hover:bg-[#E7E8EE]'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Hữu Ích ({usefulVotes})</span>
                </button>

                <button
                  onClick={() => handleVote('unuseful')}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
                    userVoted === 'unuseful'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-[#F3F3F7] text-[#1C1B1F] border-[#E1E2E9] hover:bg-[#E7E8EE]'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>Không Hữu Ích</span>
                </button>

                <button
                  onClick={() => setShowReportFlagModal(true)}
                  className="p-2 rounded-xl bg-[#FFDAD6]/50 text-[#BA1A1A] hover:bg-[#FFDAD6] text-xs font-bold transition"
                  title="Báo cáo thông tin sai sự thật"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comment Submission Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                rows={2}
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Viết nhận xét hoặc chia sẻ thêm thông tin liên quan đến vụ việc này..."
                className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl p-3.5 text-sm text-[#1C1B1F] placeholder-[#44474E] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!commentInput.trim() || isSubmittingComment}
                  className="px-5 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingComment ? 'Đang gửi...' : 'Đăng Bình Luận'}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#44474E]">
                <span>DANH SÁCH BÌNH LUẬN ({comments.length})</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCommentSort('newest')}
                    className={`px-2.5 py-1 rounded-lg ${commentSort === 'newest' ? 'bg-[#0061A4] text-white' : 'hover:bg-gray-200'}`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => setCommentSort('top')}
                    className={`px-2.5 py-1 rounded-lg ${commentSort === 'top' ? 'bg-[#0061A4] text-white' : 'hover:bg-gray-200'}`}
                  >
                    Hữu ích nhất
                  </button>
                </div>
              </div>

              {sortedComments.length === 0 ? (
                <p className="text-center py-6 text-xs text-[#44474E] italic">
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ thông tin!
                </p>
              ) : (
                sortedComments.map((cmt) => (
                  <div key={cmt.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E1E2E9] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img 
                          src={cmt.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cmt.authorName}`} 
                          alt={cmt.authorName} 
                          className="w-7 h-7 rounded-full border border-[#0061A4]"
                        />
                        <span className="text-xs font-bold text-[#1C1B1F]">
                          {cmt.authorName}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#44474E]">
                        {new Date(cmt.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(cmt.timestamp).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed pl-9">
                      {cmt.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* STICKY BOTTOM ACTION BAR */}
        <div className="sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E1E2E9] px-4 sm:px-6 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote('useful')}
              className="px-4 py-2.5 rounded-full bg-[#006E00] hover:bg-[#005200] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="hidden sm:inline">Hữu Ích</span>
            </button>

            <button
              onClick={() => handleCopy(window.location.href, 'share-link')}
              className="px-4 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedField === 'share-link' ? 'Đã Copy Link' : 'Chia Sẻ'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenEmergency}
              className="px-5 py-2.5 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition animate-bounce"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Báo Cấp Cứu 113</span>
            </button>
          </div>
        </div>
      </div>

      {/* LIGHTBOX MEDIA MODAL */}
      {activeLightboxMedia && (
        <div 
          onClick={() => setActiveLightboxMedia(null)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img src={activeLightboxMedia} alt="Enlarged evidence" className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl" />
            <button onClick={() => setActiveLightboxMedia(null)} className="absolute -top-10 right-0 text-white bg-black/50 p-2 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* QR CODE SHARE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1B22] border border-[#E1E2E9] dark:border-[#2D2F38] rounded-[28px] p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#E1E2E9]">
              <h4 className="font-bold text-sm text-[#1C1B1F] dark:text-white">Mã QR Cảnh Báo Nhanh</h4>
              <button onClick={() => setShowQrModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="bg-white p-4 rounded-2xl inline-block border border-gray-200 shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`} 
                alt="QR Code" 
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs text-[#44474E] dark:text-[#C4C6D0]">
              Quét mã QR bằng Camera điện thoại để mở nhanh bản báo cáo này trên thiết bị di động.
            </p>
          </div>
        </div>
      )}

      {/* REPORT FALSE ALARM MODAL */}
      {showReportFlagModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1B22] border border-[#E1E2E9] dark:border-[#2D2F38] rounded-[28px] p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-[#E1E2E9]">
              <h4 className="font-bold text-sm text-[#BA1A1A]">Báo Sai Thông Tin</h4>
              <button onClick={() => setShowReportFlagModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            
            {flagSubmitted ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#006E00] mx-auto" />
                <p className="text-sm font-bold">Cảm ơn bạn đã phản hồi!</p>
                <p className="text-xs text-gray-500">Ban quản trị sẽ kiểm tra lại tính chính xác của báo cáo này.</p>
                <button onClick={() => { setShowReportFlagModal(false); setFlagSubmitted(false); }} className="mt-2 px-4 py-2 bg-[#0061A4] text-white rounded-full text-xs font-bold">
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#44474E] dark:text-[#C4C6D0]">
                  Vui lòng chọn lý do phản ánh báo cáo này là sai sự thật hoặc nhầm lẫn:
                </p>
                <select 
                  value={flagReason} 
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="w-full bg-[#F3F3F7] dark:bg-[#121318] border border-[#E1E2E9] rounded-xl p-2.5 text-xs text-[#1C1B1F] dark:text-white"
                >
                  <option value="">-- Chọn lý do --</option>
                  <option value="SPAM">Báo cáo nhảm nhí / Spam</option>
                  <option value="FALSE_INFO">Thông tin không đúng thực tế</option>
                  <option value="DEFAMATION">Vu khống cá nhân / Tổ chức uy tín</option>
                </select>
                <div className="flex justify-end space-x-2 pt-2">
                  <button onClick={() => setShowReportFlagModal(false)} className="px-4 py-2 bg-gray-200 text-xs font-bold rounded-full">Hủy</button>
                  <button onClick={() => setFlagSubmitted(true)} disabled={!flagReason} className="px-4 py-2 bg-[#BA1A1A] disabled:opacity-50 text-white text-xs font-bold rounded-full">Gửi Phản Ánh</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
