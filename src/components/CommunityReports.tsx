import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ThumbsUp, 
  Phone, 
  CreditCard, 
  Globe, 
  Share2, 
  X,
  Map as MapIcon,
  Filter,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Trash2,
  Maximize2,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  Check,
  UserCheck,
  ExternalLink,
  Radio,
  Sparkles,
  BookOpen,
  Edit3,
  Layers,
  HelpCircle,
  Lock,
  Eye,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { CommunityReport, ScamCategory, ReportComment } from '../types';
import { createCommunityReport, extractStoryIntelligence, ExtractedStoryIntelligence } from '../services/api';
import { 
  upvoteFirestoreReport, 
  subscribeToReportComments, 
  addFirestoreReportComment,
  auth
} from '../lib/firebase';
import { EmptyState } from './UIStateComponents';
import { ReportDetailModal } from './ReportDetailModal';

interface CommunityReportsProps {
  reports: CommunityReport[];
  onAddNewReport: (report: CommunityReport) => void;
  isLargeFont: boolean;
  onOpenEmergency?: () => void;
}

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Tất Cả Loại' },
  { id: 'BANK_IMPERSONATION', label: 'Giả Ngân Hàng' },
  { id: 'JOB_VACANCY', label: 'Bẫy Việc Làm' },
  { id: 'GOVERNMENT_AUTHORITY', label: 'Giả Công An' },
  { id: 'DEEPFAKE_CALL', label: 'Cuộc Gọi Deepfake' },
  { id: 'CREDIT_LOAN', label: 'Tín Dụng Đen' },
];

const PROVINCES = ['Tất Cả Tỉnh Thành', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Đồng Nai', 'Bình Dương'];

// Quick Story Starters for common scams in Vietnam
const QUICK_STORY_TEMPLATES = [
  {
    id: 'job_shopee',
    label: '💼 Tuyển CTV Shopee / Telegram',
    title: 'Bẫy tuyển CTV chốt đơn Shopee nạp tiền làm nhiệm vụ',
    category: 'JOB_VACANCY' as ScamCategory,
    story: `Sáng nay mình nhận tin nhắn Zalo tuyển cộng tác viên chốt đơn Shopee tại nhà kiếm 300k-500k/ngày. Sau khi vào nhóm Telegram có tên "TẬP ĐOÀN ĐẦU TƯ LIÊN KẾT", đối tượng yêu cầu mình nạp thử 100k làm nhiệm vụ 1 và hoàn lại 130k rất uy tín. Đến nhiệm vụ thứ 3, họ yêu cầu nạp 5 triệu vào tài khoản MB Bank: 0912345678, chủ tài khoản NGUYEN VAN A. Khi mình yêu cầu rút tiền thì báo lỗi cú pháp và bắt nạp thêm 20 triệu để giải cứu tài khoản. Mình nhận ra bị lừa nên không nạp nữa và bị xóa khỏi nhóm.`
  },
  {
    id: 'gov_police',
    label: '👮 Giả Công An / Dọa Án Ma Túy',
    title: 'Mạo danh Cán bộ Công an điều tra án ma túy dọa bắt tạm giam',
    category: 'GOVERNMENT_AUTHORITY' as ScamCategory,
    story: `Có một số điện thoại 0247779988 gọi đến xưng là Cán bộ Điều tra hình sự Công an TP. Hà Nội, thông báo căn cước công dân của mình liên quan đến đường dây rửa tiền ma túy quốc tế 40 tỷ. Đối tượng yêu cầu mình kết bạn Zalo tên "Cán bộ Nguyễn Văn Hùng", gửi lệnh bắt tạm giam có dấu đỏ giả mạo. Họ dọa nếu không chuyển 30 triệu vào tài khoản tạm giữ bảo lãnh BIDV: 1234567890 chủ tài khoản TRAN VAN B để thanh tra nguồn tiền thì sẽ bị công an đến nhà bắt ngay trong chiều nay.`
  },
  {
    id: 'bank_sms',
    label: '🏦 SMS Ngân hàng mạo danh',
    title: 'Tin nhắn SMS Brandname Vietcombank lừa đổi mật khẩu',
    category: 'BANK_IMPERSONATION' as ScamCategory,
    story: `Mình nhận được tin nhắn SMS Brandname hiển thị tên ngân hàng Vietcombank với nội dung: "Tai khoan cua quy khach bi khoa do dang nhap bat thuong tai thiet bi la, vui long truy cap https://vcb-digibank-kiemtra.xyz de xac thuc ngay". Mình bấm vào link thấy giao diện y hệt ngân hàng VCB, vừa nhập tên đăng nhập và mật khẩu thì trang web yêu cầu nhập mã OTP. Rất may mình sực nhớ ngân hàng không bao giờ gửi link yêu cầu đổi mật khẩu qua SMS nên đã thoát ra và đổi mật khẩu app chính thức ngay.`
  },
  {
    id: 'shipper_scam',
    label: '📦 Shipper giả gọi giao hàng',
    title: 'Shipper giả gọi giao hàng yêu cầu chuyển cọc rồi dụ link hoàn tiền',
    category: 'OTHER' as ScamCategory,
    story: `Mình nhận được cuộc gọi từ số 0987654321 xưng là shipper giao bưu phẩm từ sàn Shopee/Lazada trị giá 180k. Do đang đi làm không ở nhà, mình bảo gửi bưu điện hoặc gửi bảo vệ thì shipper bảo "Em thanh toán hộ anh rồi, anh chuyển khoản cho em qua STK Techcombank: 1903344556 NGUYEN THI C nhé". Mình chuyển khoản xong thì shipper gọi lại bảo "Em gửi nhầm link kích hoạt thẻ hội viên VIP, tài khoản anh sẽ bị trừ 3.5 triệu mỗi tháng, anh bấm vào link http://lazada-hoantien.com để hủy gấp". Mình biết là lừa đảo nên đã chặn số ngay.`
  },
  {
    id: 'crypto_forex',
    label: '📈 Đầu tư sàn Forex / Tiền ảo',
    title: 'Dụ dỗ đầu tư sàn tài chính quốc tế cam kết bao lỗ 30%/ngày',
    category: 'CREDIT_LOAN' as ScamCategory,
    story: `Người quen trên mạng xã hội Facebook giới thiệu mình tham gia sàn giao dịch tài chính quốc tế sàn http://forex-vip-investment.site cam kết lợi nhuận 30% mỗi ngày, có chuyên gia đọc lệnh bao lỗ. Mình nạp thử 1 triệu thì thấy tài khoản trên web nhảy lên 1.5 triệu và cho rút thử. Sau đó mình nạp 50 triệu thì chuyên gia bảo dính lệnh đòn bẩy âm, bắt nạp thêm 30 triệu để mở khóa rút gốc. Sau khi nạp tiếp thì web báo lỗi bảo trì và người hướng dẫn chặn Facebook.`
  }
];

// Single Report Card Item with Screenshots, Upvotes, Red Flags, Recommended Actions and Real-time Comments
const ReportCardItem: React.FC<{ rep: CommunityReport; onOpenDetail: (rep: CommunityReport) => void }> = ({ rep, onOpenDetail }) => {
  const [upvotes, setUpvotes] = useState(rep.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ReportComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setUpvotes(rep.upvotes);
  }, [rep.upvotes]);

  // Subscribe to Firestore comments when expanded
  useEffect(() => {
    if (!showComments) return;
    const unsubscribe = subscribeToReportComments(rep.id, (fetchedComments) => {
      setComments(fetchedComments);
    });
    return () => unsubscribe();
  }, [rep.id, showComments]);

  const handleUpvote = async () => {
    if (hasUpvoted) return;
    setUpvotes(prev => prev + 1);
    setHasUpvoted(true);
    await upvoteFirestoreReport(rep.id);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsPostingComment(true);
    try {
      const authorName = commenterName.trim() || auth?.currentUser?.displayName || 'Người dùng cộng đồng';
      await addFirestoreReportComment(rep.id, authorName, undefined, newCommentText);
      setNewCommentText('');
    } catch (err) {
      console.error("Lỗi đăng bình luận:", err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleCopyShareWarning = () => {
    const shareText = `🚨 CẢNH BÁO LỪA ĐẢO: ${rep.title}\n` +
      `📌 Loại hình: ${rep.scamTypeNameVi}\n` +
      (rep.targetPhone ? `📞 SĐT Kẻ Lừa Đảo: ${rep.targetPhone}\n` : '') +
      (rep.targetBankAccount ? `💳 STK Ngân Hàng: ${rep.targetBankAccount} (${rep.targetBankName || ''})\n` : '') +
      (rep.targetAccountName ? `👤 Chủ TK Thụ Hưởng: ${rep.targetAccountName}\n` : '') +
      (rep.targetUrl ? `🌐 Link Phishing: ${rep.targetUrl}\n` : '') +
      `⚠️ Tra cứu và tố giác tại "Lá Chắn Số AI"!`;
    
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const riskLevel = rep.riskLevel || (rep.scamType === 'BANK_IMPERSONATION' || rep.scamType === 'GOVERNMENT_AUTHORITY' || rep.scamType === 'DEEPFAKE_CALL' ? 'CRITICAL' : 'HIGH');

  return (
    <div className="bg-white border border-[#E1E2E9] hover:border-[#C4C6D0] rounded-[28px] p-5 sm:p-6 shadow-xs space-y-4 transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E2E9] pb-3.5">
        <div className="flex items-start space-x-3">
          <img
            src={rep.reporterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rep.reporterName}`}
            alt={rep.reporterName}
            className="w-10 h-10 rounded-full bg-[#F3F3F7] border border-[#E1E2E9] object-cover shrink-0 mt-0.5 cursor-pointer"
            onClick={() => onOpenDetail(rep)}
          />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-[#FFE9E9] text-[#BA1A1A] border border-[#FFDAD6] flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#BA1A1A]" />
                {rep.scamTypeNameVi}
              </span>

              {riskLevel === 'CRITICAL' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#BA1A1A] text-white flex items-center gap-1 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  Mức Nguy Hiểm: RẤT CAO
                </span>
              )}

              {riskLevel === 'HIGH' && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E65100] text-white flex items-center gap-1 uppercase">
                  Mức Nguy Hiểm: CAO
                </span>
              )}
            </div>

            <h3 
              onClick={() => onOpenDetail(rep)}
              className="font-extrabold text-base sm:text-lg text-[#1C1B1F] leading-snug hover:text-[#0061A4] transition cursor-pointer"
            >
              {rep.title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#44474E] mt-1">
              <span className="font-bold text-[#1C1B1F] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#0061A4]" />
                {rep.reporterName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#1C1B1F] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#BA1A1A]" />
                {rep.locationName}
              </span>
              <span>•</span>
              <span>{new Date(rep.timestamp).toLocaleDateString('vi-VN')}</span>
              {rep.approachChannel && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#0061A4] font-medium">
                    <Radio className="w-3 h-3 text-[#0061A4]" />
                    {rep.approachChannel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onOpenDetail(rep)}
            className="px-4 py-2 rounded-full text-xs font-black bg-[#0061A4] hover:bg-[#004B80] text-white shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            title="Xem phân tích chi tiết hồ sơ vụ việc"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Chi Tiết Cảnh Báo</span>
          </button>

          <button
            onClick={handleCopyShareWarning}
            className="px-3 py-2 rounded-full text-xs font-bold bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] border border-[#E1E2E9] transition flex items-center gap-1.5 cursor-pointer"
            title="Sao chép nội dung cảnh báo gửi cho bạn bè, người thân"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#006E00]" />
                <span className="text-[#006E00]">Đã chép!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#0061A4]" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Description & Storyteller Voice */}
      <div className="space-y-2.5">
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E1E2E9]">
          <p className="text-xs font-extrabold text-[#0061A4] uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#0061A4]" />
            Lời Kể Của Người Báo Cáo:
          </p>
          <p className="text-sm text-[#1C1B1F] leading-relaxed font-normal whitespace-pre-line">
            "{rep.description}"
          </p>
        </div>

        {rep.estimatedLoss && (
          <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#FFDAD6] text-xs font-medium text-[#BA1A1A] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#BA1A1A]" />
            <div>
              <strong className="font-bold">Số tiền bị thiệt hại / Đối tượng đòi nạp:</strong> {rep.estimatedLoss}
            </div>
          </div>
        )}
      </div>

      {/* Proof Screenshots Gallery */}
      {rep.proofImages && rep.proofImages.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-bold text-[#44474E] flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5 text-[#0061A4]" />
            <span>Hình ảnh bằng chứng đính kèm ({rep.proofImages.length}):</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {rep.proofImages.map((imgUrl, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedProofImg(imgUrl)}
                className="relative group cursor-pointer overflow-hidden rounded-xl border border-[#E1E2E9] w-24 h-24 bg-[#F3F3F7]"
              >
                <img src={imgUrl} alt={`Proof ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Warning Targets Intelligence Box */}
      {(rep.targetPhone || rep.targetBankAccount || rep.targetAccountName || rep.targetUrl || rep.targetSocialHandle) && (
        <div className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#E1E2E9] space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-1.5">
            <span className="font-extrabold text-[#1C1B1F] flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
              HỒ SƠ THÔNG TIN ĐỐI TƯỢNG LỪA ĐẢO
            </span>
            <span className="text-[10px] font-bold text-[#74777F] uppercase tracking-wider">Cảnh báo trực tuyến</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {rep.targetPhone && (
              <div className="flex items-center space-x-2 text-[#BA1A1A] font-bold bg-white p-2.5 rounded-xl border border-[#FFDAD6]">
                <Phone className="w-4 h-4 text-[#BA1A1A] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#44474E] block font-medium">SĐT Lừa Đảo:</span>
                  <span className="text-[#BA1A1A] font-extrabold text-sm">{rep.targetPhone}</span>
                </div>
              </div>
            )}

            {rep.targetBankAccount && (
              <div className="flex items-start space-x-2 text-[#E65100] font-bold bg-white p-2.5 rounded-xl border border-[#FFE0B2]">
                <CreditCard className="w-4 h-4 text-[#E65100] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] text-[#44474E] block font-medium">Số Tài Khoản Ngân Hàng:</span>
                  <span className="text-[#E65100] font-extrabold text-sm">{rep.targetBankAccount}</span>
                  <span className="text-[11px] text-[#44474E] font-medium block">
                    ({rep.targetBankName || 'Ngân Hàng'})
                  </span>
                  {rep.targetAccountName && (
                    <span className="text-[11px] text-[#BA1A1A] font-bold block mt-0.5 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-[#BA1A1A]" />
                      Tên chủ TK thụ hưởng: {rep.targetAccountName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {rep.targetUrl && (
              <div className="sm:col-span-2 flex items-start space-x-2 text-[#0061A4] font-bold bg-white p-2.5 rounded-xl border border-[#D1E4FF]">
                <Globe className="w-4 h-4 text-[#0061A4] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-[#44474E] block font-medium">Đường Link / Website Phishing Độc Hại:</span>
                  <a href={rep.targetUrl} target="_blank" rel="noopener noreferrer" className="text-[#0061A4] underline break-all text-xs font-mono font-bold flex items-center gap-1 hover:text-[#004B80]">
                    {rep.targetUrl}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <span className="text-[10px] text-[#BA1A1A] font-semibold block mt-0.5">
                    ⚠️ Tuyệt đối KHÔNG nhấp chuột hay nhập bất kỳ mật khẩu / mã OTP nào vào liên kết này!
                  </span>
                </div>
              </div>
            )}

            {rep.targetSocialHandle && (
              <div className="flex items-center space-x-2 text-[#4F378B] font-bold bg-white p-2.5 rounded-xl border border-[#E8DEF8]">
                <Users className="w-4 h-4 text-[#4F378B] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#44474E] block font-medium">Tài Khoản Mạng Xã Hội / App:</span>
                  <span className="text-[#4F378B] font-bold text-xs">{rep.targetSocialHandle}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scam Tactics & Red Flags List */}
      {rep.redFlags && rep.redFlags.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF8F0] border border-[#FFE0B2] space-y-2">
          <h4 className="text-xs font-extrabold text-[#E65100] flex items-center gap-1.5 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-[#E65100]" />
            Dấu Hiệu Nhận Biết & Chiêu Trò Thủ Đoạn:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#1C1B1F]">
            {rep.redFlags.map((flag, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#E65100] font-bold">🚩</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Emergency Actions */}
      {rep.recommendedActions && rep.recommendedActions.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#F1F9F1] border border-[#C8E6C9] space-y-2">
          <h4 className="text-xs font-extrabold text-[#006E00] flex items-center gap-1.5 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-[#006E00]" />
            Khuyến Cáo Phòng Tránh & Xử Lý Khẩn Cấp:
          </h4>
          <ul className="space-y-1.5 text-xs text-[#1C1B1F]">
            {rep.recommendedActions.map((act, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#006E00] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="font-medium">{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer verification & reactions */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E1E2E9]">
        <span className="flex items-center gap-1 font-bold text-[#006E00] bg-[#E8F5E9] px-3 py-1 rounded-full border border-[#C8E6C9]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#006E00]" />
          Đã lưu & đồng bộ Firestore
        </span>

        <div className="flex items-center space-x-3 text-[#44474E]">
          {/* Like / Upvote button */}
          <button 
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`flex items-center space-x-1.5 font-bold transition cursor-pointer px-3 py-1 rounded-full ${
              hasUpvoted ? 'bg-[#FFE9E9] text-[#BA1A1A]' : 'hover:bg-[#F3F3F7] hover:text-[#BA1A1A]'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current text-[#BA1A1A]' : ''}`} />
            <span>Hữu ích ({upvotes})</span>
          </button>

          {/* Comment toggle button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 hover:bg-[#F3F3F7] hover:text-[#0061A4] px-3 py-1 rounded-full transition font-bold cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#0061A4]" />
            <span>Bình luận ({rep.commentsCount || comments.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Interactive Comments Drawer */}
      {showComments && (
        <div className="pt-3 border-t border-[#E1E2E9] space-y-3 bg-[#FAFAFD] p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-[#1C1B1F] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#0061A4]" />
            <span>Bình luận & Phản hồi từ cộng đồng ({comments.length})</span>
          </h4>

          {/* List of comments */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-[#44474E] italic py-2">
                Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ góc nhìn hoặc bổ sung cảnh báo!
              </p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-white p-3 rounded-xl border border-[#E1E2E9] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img 
                        src={c.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.authorName}`} 
                        alt={c.authorName} 
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-bold text-[#1C1B1F]">{c.authorName}</span>
                    </div>
                    <span className="text-[10px] text-[#74777F]">
                      {new Date(c.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[#1C1B1F] pl-7">{c.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Comment input form */}
          <form onSubmit={handlePostComment} className="space-y-2 pt-2 border-t border-[#E1E2E9]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Tên của bạn (Tùy chọn)"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                className="bg-white border border-[#E1E2E9] rounded-xl px-3 py-1.5 text-xs text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#0061A4]"
              />
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Viết bình luận hoặc bổ sung thông tin..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 bg-white border border-[#E1E2E9] rounded-xl px-3 py-1.5 text-xs text-[#1C1B1F] focus:outline-none focus:ring-1 focus:ring-[#0061A4]"
                />
                <button
                  type="submit"
                  disabled={isPostingComment || !newCommentText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-[#0061A4] hover:bg-[#004B80] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3 h-3" />
                  <span>Gửi</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Proof Image Fullscreen Modal */}
      {selectedProofImg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden p-2">
            <button 
              onClick={() => setSelectedProofImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={selectedProofImg} alt="Proof Fullscreen" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};

export const CommunityReports: React.FC<CommunityReportsProps> = ({ reports, onAddNewReport, isLargeFont, onOpenEmergency }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('Tất Cả Tỉnh Thành');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedDetailReport, setSelectedDetailReport] = useState<CommunityReport | null>(null);

  // Mode Selection: 'story' (natural victim voice + AI extraction) vs 'manual' (structured 3-step form)
  const [reportInputMode, setReportInputMode] = useState<'story' | 'manual'>('story');
  const [storyInput, setStoryInput] = useState('');
  const [isExtractingStory, setIsExtractingStory] = useState(false);
  const [storyExtracted, setStoryExtracted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ScamCategory>('BANK_IMPERSONATION');
  const [formDesc, setFormDesc] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountName, setFormAccountName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formApproachChannel, setFormApproachChannel] = useState('Cuộc gọi thoại / Tin nhắn Zalo');
  const [formRiskLevel, setFormRiskLevel] = useState<'CRITICAL' | 'HIGH' | 'WARNING'>('CRITICAL');
  const [formRedFlagsText, setFormRedFlagsText] = useState('');
  const [formRecommendedText, setFormRecommendedText] = useState('');
  const [formEstimatedLoss, setFormEstimatedLoss] = useState('');
  const [formLocation, setFormLocation] = useState('Hà Nội');
  const [formReporterName, setFormReporterName] = useState('');
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  // Local fallback extractor when offline or Gemini API is slow
  const extractLocalStoryDetails = (rawText: string) => {
    const text = rawText.toLowerCase();

    // 1. Detect category
    let detectedCategory: ScamCategory = 'OTHER';
    if (text.includes('công an') || text.includes('vneid') || text.includes('tòa án') || text.includes('lệnh bắt') || text.includes('rửa tiền')) {
      detectedCategory = 'GOVERNMENT_AUTHORITY';
    } else if (text.includes('shopee') || text.includes('tuyển dụng') || text.includes('ctv') || text.includes('nhiệm vụ') || text.includes('hoa hồng') || text.includes('telegram')) {
      detectedCategory = 'JOB_VACANCY';
    } else if (text.includes('vietcombank') || text.includes('vcb') || text.includes('mbbank') || text.includes('ngân hàng') || text.includes('mã otp') || text.includes('sms brandname')) {
      detectedCategory = 'BANK_IMPERSONATION';
    } else if (text.includes('deepfake') || text.includes('video call') || text.includes('khuôn mặt') || text.includes('nhại giọng')) {
      detectedCategory = 'DEEPFAKE_CALL';
    } else if (text.includes('vay') || text.includes('tín dụng') || text.includes('lãi suất') || text.includes('app vay')) {
      detectedCategory = 'CREDIT_LOAN';
    }

    // 2. Detect Phone Number
    const phoneMatch = rawText.match(/(?:(?:\+|00)84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-9])\d{7}/);
    const detectedPhone = phoneMatch ? phoneMatch[0] : '';

    // 3. Detect Bank Account
    const bankAccountMatch = rawText.match(/(?:stk|số tài khoản|tài khoản|tk|chuyển khoản|bank)[:\s]+([0-9]{6,16})/i) || rawText.match(/\b([0-9]{8,15})\b/);
    const detectedBankAccount = bankAccountMatch ? bankAccountMatch[1] : '';

    // 4. Detect Bank Name
    let detectedBankName = '';
    const banks = ['Vietcombank', 'VCB', 'MB Bank', 'MBBank', 'Techcombank', 'BIDV', 'Agribank', 'VPBank', 'ACB', 'TPBank', 'Sacombank', 'VIB', 'OCB', 'Cake', 'Timo', 'Momo'];
    for (const b of banks) {
      if (new RegExp(`\\b${b}\\b`, 'i').test(rawText)) {
        detectedBankName = b;
        break;
      }
    }

    // 5. Detect Account Name
    const nameMatch = rawText.match(/(?:tên chủ tk|chủ tài khoản|chủ tk|tên)[:\s]+([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]{3,30})/i);
    const detectedAccountName = nameMatch ? nameMatch[1].trim() : '';

    // 6. Detect URL
    const urlMatch = rawText.match(/https?:\/\/[^\s]+|[a-zA-Z0-9-]+\.(?:com|vn|xyz|top|site|online|cc|vip|app|net|info)[^\s]*/i);
    const detectedUrl = urlMatch ? urlMatch[0] : '';

    // 7. Detect Loss
    const lossMatch = rawText.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|nghìn|k|tỷ|vnđ|vnd|đ)/i);
    const detectedLoss = lossMatch ? lossMatch[0] : '';

    // 8. Generate title
    let detectedTitle = '';
    if (detectedCategory === 'JOB_VACANCY') detectedTitle = 'Cảnh báo bẫy tuyển CTV chốt đơn Shopee/Telegram';
    else if (detectedCategory === 'GOVERNMENT_AUTHORITY') detectedTitle = 'Cảnh báo giả danh Công an gọi điện dọa bắt tạm giam';
    else if (detectedCategory === 'BANK_IMPERSONATION') detectedTitle = 'Cảnh báo tin nhắn mạo danh Ngân hàng yêu cầu đổi mật khẩu';
    else if (detectedCategory === 'DEEPFAKE_CALL') detectedTitle = 'Cảnh báo cuộc gọi Video Deepfake AI mượn tiền';
    else if (detectedCategory === 'CREDIT_LOAN') detectedTitle = 'Cảnh báo bẫy tín dụng đen & app vay tiền độc hại';
    else detectedTitle = 'Cảnh báo lừa đảo trực tuyến: ' + rawText.slice(0, 45) + '...';

    return {
      title: detectedTitle,
      scamType: detectedCategory,
      scamTypeNameVi: CATEGORIES.find(c => c.id === detectedCategory)?.label || 'Lừa đảo khác',
      targetPhone: detectedPhone || null,
      targetBankAccount: detectedBankAccount || null,
      targetBankName: detectedBankName || null,
      targetAccountName: detectedAccountName || null,
      targetUrl: detectedUrl || null,
      approachChannel: text.includes('telegram') ? 'Nhóm Telegram' : text.includes('zalo') ? 'Zalo' : text.includes('sms') ? 'SMS Brandname' : 'Cuộc gọi thoại',
      estimatedLoss: detectedLoss || null,
      riskLevel: (detectedCategory === 'BANK_IMPERSONATION' || detectedCategory === 'GOVERNMENT_AUTHORITY') ? 'CRITICAL' : 'HIGH',
      redFlags: [
        'Tạo áp lực thời gian hoặc đe dọa xử lý hình sự qua điện thoại',
        'Yêu cầu chuyển tiền vào tài khoản cá nhân để làm nhiệm vụ hoặc bảo lãnh',
        'Dẫn dắt chuyển sang các ứng dụng chat bí mật (Telegram/Zalo)'
      ],
      recommendedActions: [
        'Tuyệt đối KHÔNG chuyển tiền hoặc chia sẻ mã xác nhận OTP',
        'Báo ngay cho ngân hàng để phong tỏa tài khoản nếu đã chuyển',
        'Trình báo cơ quan Công an gần nhất để lập hồ sơ ngăn chặn'
      ]
    };
  };

  // Handle AI Auto Extraction from Story
  const handleAutoExtractStory = async (customStory?: string) => {
    const textToExtract = (customStory || storyInput).trim();
    if (!textToExtract) return;

    setIsExtractingStory(true);
    try {
      let extracted: ExtractedStoryIntelligence | null = null;
      try {
        extracted = await extractStoryIntelligence(textToExtract);
      } catch (e) {
        console.warn("AI extraction fallback to local heuristic:", e);
      }

      if (!extracted || !extracted.title) {
        extracted = extractLocalStoryDetails(textToExtract) as any;
      }

      if (extracted) {
        if (extracted.title) setFormTitle(extracted.title);
        if (extracted.scamType) setFormCategory(extracted.scamType as ScamCategory);
        if (extracted.targetPhone) setFormPhone(extracted.targetPhone);
        if (extracted.targetBankAccount) setFormBankAccount(extracted.targetBankAccount);
        if (extracted.targetBankName) setFormBankName(extracted.targetBankName);
        if (extracted.targetAccountName) setFormAccountName(extracted.targetAccountName);
        if (extracted.targetUrl) setFormUrl(extracted.targetUrl);
        if (extracted.approachChannel) setFormApproachChannel(extracted.approachChannel);
        if (extracted.riskLevel) setFormRiskLevel(extracted.riskLevel);
        if (extracted.estimatedLoss) setFormEstimatedLoss(extracted.estimatedLoss);
        if (extracted.redFlags && extracted.redFlags.length > 0) setFormRedFlagsText(extracted.redFlags.join('\n'));
        if (extracted.recommendedActions && extracted.recommendedActions.length > 0) setFormRecommendedText(extracted.recommendedActions.join('\n'));
        
        setFormDesc(textToExtract);
        setStoryExtracted(true);
      }
    } finally {
      setIsExtractingStory(false);
    }
  };

  // Handle Quick Template Click
  const handleApplyTemplate = (tmpl: typeof QUICK_STORY_TEMPLATES[0]) => {
    setStoryInput(tmpl.story);
    setFormTitle(tmpl.title);
    setFormCategory(tmpl.category);
    setFormDesc(tmpl.story);
    handleAutoExtractStory(tmpl.story);
  };

  // Handle screenshot image file uploads
  const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProofImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeProofImage = (index: number) => {
    setProofImages(prev => prev.filter((_, i) => i !== index));
  };

  // Search & Filtered list logic
  const filteredReports = reports.filter((rep) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !searchLower ||
      (rep.title || '').toLowerCase().includes(searchLower) ||
      (rep.description || '').toLowerCase().includes(searchLower) ||
      (rep.targetPhone && rep.targetPhone.includes(searchLower)) ||
      (rep.targetBankAccount && rep.targetBankAccount.includes(searchLower)) ||
      (rep.targetAccountName && rep.targetAccountName.toLowerCase().includes(searchLower)) ||
      (rep.targetUrl && rep.targetUrl.toLowerCase().includes(searchLower));

    const matchesCategory = selectedCategory === 'ALL' || rep.scamType === selectedCategory;
    const matchesProvince = selectedProvince === 'Tất Cả Tỉnh Thành' || rep.locationName.includes(selectedProvince);

    return matchesSearch && matchesCategory && matchesProvince;
  });

  const handleSubmitNewReport = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDesc = formDesc.trim() || storyInput.trim();
    const finalTitle = formTitle.trim() || (finalDesc ? finalDesc.slice(0, 50) + '...' : 'Cảnh báo lừa đảo mới');

    if (!finalDesc) return;

    setIsSubmitting(true);
    try {
      const redFlags = formRedFlagsText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const recommendedActions = formRecommendedText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const reporterDisplayName = isAnonymous 
        ? 'Người dùng ẩn danh' 
        : (formReporterName.trim() || auth?.currentUser?.displayName || 'Thành viên cộng đồng');

      const created = await createCommunityReport({
        title: finalTitle,
        scamType: formCategory,
        scamTypeNameVi: CATEGORIES.find(c => c.id === formCategory)?.label || 'Lừa đảo',
        description: finalDesc,
        summary: finalDesc.slice(0, 180) + '...',
        targetPhone: formPhone.trim() || undefined,
        targetBankAccount: formBankAccount.trim() || undefined,
        targetBankName: formBankName.trim() || undefined,
        targetAccountName: formAccountName.trim() || undefined,
        targetUrl: formUrl.trim() || undefined,
        approachChannel: formApproachChannel.trim() || undefined,
        riskLevel: formRiskLevel,
        riskScore: formRiskLevel === 'CRITICAL' ? 95 : formRiskLevel === 'HIGH' ? 80 : 60,
        redFlags: redFlags.length > 0 ? redFlags : undefined,
        recommendedActions: recommendedActions.length > 0 ? recommendedActions : undefined,
        estimatedLoss: formEstimatedLoss.trim() || undefined,
        locationName: formLocation,
        reporterName: reporterDisplayName,
        proofImages: proofImages,
      });

      onAddNewReport(created);
      setSubmitSuccessNotice(true);
      setTimeout(() => {
        setSubmitSuccessNotice(false);
        setIsModalOpen(false);
      }, 1500);

      // Reset Form State
      setStoryInput('');
      setFormTitle('');
      setFormDesc('');
      setFormPhone('');
      setFormBankAccount('');
      setFormBankName('');
      setFormAccountName('');
      setFormUrl('');
      setFormRedFlagsText('');
      setFormRecommendedText('');
      setFormEstimatedLoss('');
      setProofImages([]);
      setStoryExtracted(false);
    } catch (err) {
      console.error("Lỗi khi đăng báo cáo:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`space-y-6 ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FFE9E9] text-[#BA1A1A] border border-[#FFDAD6] text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Mạng Lưới Cảnh Báo Cộng Đồng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1C1B1F] tracking-tight">
            Cơ Sở Dữ Liệu Cảnh Báo Lừa Đảo
          </h2>
          <p className="text-[#44474E] text-sm mt-1 max-w-xl">
            Tra cứu số điện thoại, số tài khoản ngân hàng, tên chủ tài khoản thụ hưởng, link website giả mạo và các câu chuyện cảnh báo thực tế do cộng đồng người dùng Việt Nam phản ánh.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowMapModal(true)}
            className="px-4 py-3 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-sm font-bold border border-[#E1E2E9] transition flex items-center space-x-2 shadow-2xs cursor-pointer"
          >
            <MapIcon className="w-4 h-4 text-[#0061A4]" />
            <span>Bản Đồ Cảnh Báo</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-sm font-bold transition flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Gửi Báo Cáo / Kể Sự Việc</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#44474E] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tra cứu SĐT, STK ngân hàng, Tên chủ tài khoản, địa chỉ web, hoặc từ khóa vụ việc..."
              className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl pl-12 pr-4 py-3 text-[#1C1B1F] placeholder-[#44474E] focus:outline-none focus:ring-2 focus:ring-[#0061A4] text-sm transition"
            />
          </div>

          {/* Location dropdown */}
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-4 py-3 text-[#1C1B1F] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
          >
            {PROVINCES.map((prov, i) => (
              <option key={i} value={prov}>
                📍 {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E1E2E9]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0061A4] text-white shadow-xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:text-[#1C1B1F] border border-[#E1E2E9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#44474E] flex items-center justify-between px-1">
          <span>Tìm thấy {filteredReports.length} cảnh báo chi tiết phù hợp:</span>
          <span className="text-[#006E00] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dữ liệu đồng bộ thời gian thực từ Firestore
          </span>
        </p>

        {filteredReports.length === 0 ? (
          <EmptyState
            icon="search"
            title="Không Tìm Thấy Báo Cáo Phù Hợp"
            description="Hãy thử thay đổi từ khóa tra cứu, xóa bộ lọc tìm kiếm hoặc chọn 'Tất Cả Loại' để hiển thị danh sách đầy đủ."
            actionLabel="Gửi Báo Cáo Mới"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          filteredReports.map((rep) => (
            <ReportCardItem 
              key={rep.id} 
              rep={rep} 
              onOpenDetail={(r) => setSelectedDetailReport(r)}
            />
          ))
        )}
      </div>

      {/* MAP MODAL */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-4xl p-6 space-y-4 relative shadow-lg animate-zoom-in">
            <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-6 h-6 text-[#0061A4]" />
                <h3 className="text-xl font-extrabold text-[#1C1B1F]">Bản Đồ Cảnh Báo Lừa Đảo Việt Nam</h3>
              </div>
              <button onClick={() => setShowMapModal(false)} className="p-2 text-[#44474E] hover:text-[#1C1B1F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Map Visualizer Box */}
            <div className="bg-[#F3F3F7] rounded-2xl border border-[#E1E2E9] p-6 h-[380px] relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10 text-center py-2 bg-white/90 backdrop-blur border border-[#E1E2E9] rounded-xl">
                <p className="text-sm font-bold text-[#1C1B1F]">
                  📍 Phân bố các điểm cảnh báo lừa đảo trực tuyến tại các thành phố lớn
                </p>
              </div>

              {/* Map Hotspots Simulation */}
              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
                {reports.slice(0, 6).map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white border border-[#FFDAD6] text-xs space-y-1 shadow-2xs">
                    <p className="font-bold text-[#BA1A1A] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#BA1A1A] animate-ping" />
                      {r.locationName}
                    </p>
                    <p className="text-[#1C1B1F] truncate font-semibold">{r.title}</p>
                    <p className="text-[10px] text-[#44474E]">{r.scamTypeNameVi}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 text-center">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="px-6 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Đóng Bản Đồ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW REPORT MODAL - HUMAN & STORY-CENTRIC WORKFLOW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-3xl p-5 sm:p-7 space-y-5 relative shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-zoom-in">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE9E9] text-[#BA1A1A] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1C1B1F]">
                    Gửi Cảnh Báo Lừa Đảo Tới Cộng Đồng
                  </h3>
                  <p className="text-xs text-[#44474E]">
                    Chia sẻ câu chuyện hoặc cung cấp dấu vết đối tượng để bảo vệ hàng triệu người dùng khác
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-[#44474E] hover:text-[#BA1A1A] rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Notice Flash */}
            {submitSuccessNotice && (
              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[#006E00] mx-auto animate-bounce" />
                <p className="font-extrabold text-[#006E00] text-sm">Gửi cảnh báo thành công!</p>
                <p className="text-xs text-[#44474E]">Dữ liệu đã được lưu vào Firestore và cập nhật lên mạng lưới cảnh báo.</p>
              </div>
            )}

            {/* Mode Switcher: Story vs Manual */}
            <div className="flex items-center p-1 bg-[#F3F3F7] rounded-2xl border border-[#E1E2E9]">
              <button
                type="button"
                onClick={() => setReportInputMode('story')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  reportInputMode === 'story'
                    ? 'bg-white text-[#0061A4] shadow-xs border border-[#E1E2E9]'
                    : 'text-[#44474E] hover:text-[#1C1B1F]'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>🎙️ Kể Lại Sự Việc (AI Tự Động Bóc Tách)</span>
              </button>

              <button
                type="button"
                onClick={() => setReportInputMode('manual')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  reportInputMode === 'manual'
                    ? 'bg-white text-[#0061A4] shadow-xs border border-[#E1E2E9]'
                    : 'text-[#44474E] hover:text-[#1C1B1F]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>📋 Điền Theo Mục Chi Tiết</span>
              </button>
            </div>

            <form onSubmit={handleSubmitNewReport} className="space-y-4 text-sm">
              
              {/* MODE 1: STORY-FIRST & AI EXTRACTION */}
              {reportInputMode === 'story' && (
                <div className="space-y-4">
                  {/* Quick Story Starters Bar */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-[#44474E] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#0061A4]" />
                      Gợi ý mẫu tình huống phổ biến (Bấm để điền mẫu nhanh):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_STORY_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleApplyTemplate(tmpl)}
                          className="px-3 py-1.5 rounded-full bg-[#F3F3F7] hover:bg-[#E2EAF8] hover:text-[#0061A4] text-xs font-medium text-[#1C1B1F] border border-[#E1E2E9] transition cursor-pointer"
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Big Natural Story Input Box */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-extrabold text-[#1C1B1F] flex items-center justify-between">
                      <span>Kể lại những gì bạn đã trải qua (*):</span>
                      <span className="text-[11px] font-normal text-[#74777F]">
                        (Viết tự nhiên: thời gian, SĐT gọi đến, STK chuyển tiền, lời hứa hẹn, số tiền...)
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={storyInput}
                      onChange={(e) => {
                        setStoryInput(e.target.value);
                        setFormDesc(e.target.value);
                      }}
                      placeholder="Ví dụ: Sáng nay có số 0912345678 xưng là Công an gọi dọa án ma túy, bắt kết bạn Zalo tên Đại Úy Hùng, gửi lệnh bắt giả và ép chuyển 20 triệu vào tài khoản MBBank: 1019283746 NGUYEN VAN A..."
                      className="w-full bg-[#F8FAFC] border border-[#E1E2E9] rounded-2xl p-3.5 text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4] leading-relaxed text-sm"
                    />
                  </div>

                  {/* AI Extraction Trigger Button */}
                  <div className="flex items-center justify-between gap-3 bg-[#F0F4FA] p-3 rounded-2xl border border-[#D1E4FF]">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-[#0061A4] animate-pulse shrink-0" />
                      <p className="text-xs text-[#004B80] font-medium leading-tight">
                        Trợ lý AI sẽ tự động phân tích lời kể và trích xuất SĐT, STK, link độc hại, loại lừa đảo...
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isExtractingStory || !storyInput.trim()}
                      onClick={() => handleAutoExtractStory()}
                      className="px-4 py-2 rounded-xl bg-[#0061A4] hover:bg-[#004B80] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                    >
                      {isExtractingStory ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang Bóc Tách...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>✨ AI Bóc Tách Chi Tiết</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Extracted Intelligence Live Preview Box */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#E1E2E9] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-2">
                      <span className="text-xs font-extrabold text-[#1C1B1F] flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
                        Dấu Vết Đã Bóc Tách Được (Có thể bấm để chỉnh sửa):
                      </span>
                      {storyExtracted && (
                        <span className="text-[10px] font-bold text-[#006E00] bg-[#C8E6C9] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã bóc tách tự động
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          Tiêu đề cảnh báo:
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="Tiêu đề vụ việc..."
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          Loại hình lừa đảo:
                        </label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as ScamCategory)}
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs font-bold"
                        >
                          <option value="BANK_IMPERSONATION">Giả danh Ngân Hàng</option>
                          <option value="GOVERNMENT_AUTHORITY">Giả danh Công An / Tòa Án / VNeID</option>
                          <option value="JOB_VACANCY">Bẫy Việc Làm / Chốt Đơn Shopee</option>
                          <option value="E_COMMERCE_PRIZE">Trúng Thưởng / Quà Tặng Tri Ân</option>
                          <option value="CREDIT_LOAN">Bẫy Tín Dụng Đen / Vay Tiền</option>
                          <option value="DEEPFAKE_CALL">Cuộc Gọi Video Deepfake AI</option>
                          <option value="OTHER">Loại Lừa Đảo Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          📞 SĐT Kẻ Lừa Đảo (nếu có):
                        </label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="Ví dụ: 0912345678"
                          className="w-full bg-white border border-[#FFDAD6] rounded-xl px-3 py-2 text-[#BA1A1A] text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          🌐 Link Website Phishing (nếu có):
                        </label>
                        <input
                          type="text"
                          value={formUrl}
                          onChange={(e) => setFormUrl(e.target.value)}
                          placeholder="Ví dụ: https://vcb-digibank-xacnhan.com"
                          className="w-full bg-white border border-[#D1E4FF] rounded-xl px-3 py-2 text-[#0061A4] text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          💳 Số Tài Khoản Ngân Hàng & Tên Ngân Hàng:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={formBankAccount}
                            onChange={(e) => setFormBankAccount(e.target.value)}
                            placeholder="Số TK: 1019283746"
                            className="w-full bg-white border border-[#FFE0B2] rounded-xl px-2.5 py-2 text-[#E65100] text-xs font-bold"
                          />
                          <input
                            type="text"
                            value={formBankName}
                            onChange={(e) => setFormBankName(e.target.value)}
                            placeholder="Ngân hàng (MB, VCB...)"
                            className="w-full bg-white border border-[#FFE0B2] rounded-xl px-2.5 py-2 text-[#1C1B1F] text-xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          👤 Tên Chủ Tài Khoản Thụ Hưởng:
                        </label>
                        <input
                          type="text"
                          value={formAccountName}
                          onChange={(e) => setFormAccountName(e.target.value)}
                          placeholder="Ví dụ: NGUYEN VAN A"
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs font-bold uppercase"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          💰 Số tiền thiệt hại / Bắt nạp:
                        </label>
                        <input
                          type="text"
                          value={formEstimatedLoss}
                          onChange={(e) => setFormEstimatedLoss(e.target.value)}
                          placeholder="Ví dụ: 30.000.000 VNĐ"
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#BA1A1A] text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          📍 Tỉnh / Thành phố:
                        </label>
                        <select
                          value={formLocation}
                          onChange={(e) => setFormLocation(e.target.value)}
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs font-medium"
                        >
                          {PROVINCES.filter(p => p !== 'Tất Cả Tỉnh Thành').map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: DETAILED FORM STEPS */}
              {reportInputMode === 'manual' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Tiêu đề báo cáo (*):
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ví dụ: Cảnh báo SMS Brandname mạo danh Vietcombank yêu cầu đổi mật khẩu gấp"
                      className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-4 py-2.5 text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                        Loại hình lừa đảo:
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as ScamCategory)}
                        className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-4 py-2.5 text-[#1C1B1F] font-medium"
                      >
                        <option value="BANK_IMPERSONATION">Giả danh Ngân Hàng</option>
                        <option value="GOVERNMENT_AUTHORITY">Giả danh Công An / Tòa Án / VNeID</option>
                        <option value="JOB_VACANCY">Lừa Tuyển Dụng / Chốt Đơn Shopee</option>
                        <option value="E_COMMERCE_PRIZE">Trúng Thưởng / Quà Tặng Tri Ân</option>
                        <option value="CREDIT_LOAN">Bẫy Tín Dụng Đen / Vay App Độc Hại</option>
                        <option value="DEEPFAKE_CALL">Cuộc Gọi Video Deepfake AI</option>
                        <option value="OTHER">Loại Lừa Đảo Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                        Kênh tiếp cận / Hình thức:
                      </label>
                      <input
                        type="text"
                        value={formApproachChannel}
                        onChange={(e) => setFormApproachChannel(e.target.value)}
                        placeholder="Ví dụ: SMS Brandname, Zalo, Cuộc gọi thoại..."
                        className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-4 py-2.5 text-[#1C1B1F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                        Mức độ nguy hiểm:
                      </label>
                      <select
                        value={formRiskLevel}
                        onChange={(e) => setFormRiskLevel(e.target.value as any)}
                        className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-4 py-2.5 text-[#1C1B1F] font-bold"
                      >
                        <option value="CRITICAL">🔴 RẤT CAO (Chiếm OTP / Mất hết tiền)</option>
                        <option value="HIGH">🟠 CAO (Bẫy nạp tiền / Đe dọa)</option>
                        <option value="WARNING">🟡 TRUNG BÌNH (Phiền phức / Giả mạo nhẹ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                        Tỉnh / Thành phố:
                      </label>
                      <select
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl px-4 py-2.5 text-[#1C1B1F] font-medium"
                      >
                        {PROVINCES.filter(p => p !== 'Tất Cả Tỉnh Thành').map((p, i) => (
                          <option key={i} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1B1F] mb-1">
                      Nội dung kịch bản & Diễn biến sự việc (*):
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Mô tả lại chi tiết kịch bản kẻ lừa đảo sử dụng, cách thức đối tượng gây áp lực, dụ dỗ hoặc đe dọa..."
                      className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-xl p-3 text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
                    />
                  </div>

                  {/* Target intelligence detail fields */}
                  <div className="p-4 rounded-2xl bg-[#F8F9FE] border border-[#E1E2E9] space-y-3">
                    <p className="text-xs font-extrabold text-[#1C1B1F] flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#BA1A1A]" />
                      Thông tin nhận diện đối tượng lừa đảo (Giúp cộng đồng tra cứu):
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          SĐT Kẻ Lừa Đảo:
                        </label>
                        <input
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="0901234567"
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          Đường Link / Website Phishing:
                        </label>
                        <input
                          type="text"
                          value={formUrl}
                          onChange={(e) => setFormUrl(e.target.value)}
                          placeholder="http://vcb-digibank-xacnhan.com"
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          Số Tài Khoản Ngân Hàng:
                        </label>
                        <input
                          type="text"
                          value={formBankAccount}
                          onChange={(e) => setFormBankAccount(e.target.value)}
                          placeholder="1019283746"
                          className="w-full bg-white border border-[#E1E2E9] rounded-xl px-3 py-2 text-[#1C1B1F] text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#44474E] mb-1">
                          Ngân Hàng & Tên Chủ Tài Khoản Thụ Hưởng:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            value={formBankName}
                            onChange={(e) => setFormBankName(e.target.value)}
                            placeholder="Tên NH (VCB, MB...)"
                            className="w-full bg-white border border-[#E1E2E9] rounded-xl px-2.5 py-2 text-[#1C1B1F] text-xs"
                          />
                          <input
                            type="text"
                            value={formAccountName}
                            onChange={(e) => setFormAccountName(e.target.value)}
                            placeholder="Tên chủ TK (NGUYEN VAN A)"
                            className="w-full bg-white border border-[#E1E2E9] rounded-xl px-2.5 py-2 text-[#1C1B1F] text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Red Flags & Recommended Actions Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#E65100] mb-1">
                        Dấu hiệu dối lừa & Thủ đoạn (Mỗi dòng 1 dấu hiệu):
                      </label>
                      <textarea
                        rows={2}
                        value={formRedFlagsText}
                        onChange={(e) => setFormRedFlagsText(e.target.value)}
                        placeholder={`Tạo tâm lý gấp rút trong 15 phút\nTên miền lạ nhái ngân hàng gốc\nYêu cầu cung cấp mã OTP SMS`}
                        className="w-full bg-[#FFF8F0] border border-[#FFE0B2] rounded-xl p-2.5 text-xs text-[#1C1B1F]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#006E00] mb-1">
                        Lời khuyên phòng tránh & Xử lý (Mỗi dòng 1 bước):
                      </label>
                      <textarea
                        rows={2}
                        value={formRecommendedText}
                        onChange={(e) => setFormRecommendedText(e.target.value)}
                        placeholder={`KHÔNG click vào bất kỳ đường link lạ nào\nGọi Tổng đài ngân hàng kiểm tra\nĐổi mật khẩu app ngân hàng gấp`}
                        className="w-full bg-[#F1F9F1] border border-[#C8E6C9] rounded-xl p-2.5 text-xs text-[#1C1B1F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Screenshots Section */}
              <div className="space-y-2 pt-2 border-t border-[#E1E2E9]">
                <label className="block text-xs font-bold text-[#1C1B1F]">
                  Ảnh chụp màn hình làm bằng chứng (Tùy chọn):
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="px-4 py-2.5 rounded-xl bg-[#F3F3F7] hover:bg-[#E7E8EE] border border-[#E1E2E9] text-xs font-bold text-[#0061A4] cursor-pointer transition flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Tải ảnh màn hình</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProofImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Screenshot thumbnails preview */}
                  {proofImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl border border-[#E1E2E9] overflow-hidden group">
                      <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeProofImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-0.5 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Identity Protection Option */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E1E2E9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-[#0061A4]" />
                  <div>
                    <p className="text-xs font-bold text-[#1C1B1F]">Bảo mật danh tính người gửi</p>
                    <p className="text-[11px] text-[#44474E]">
                      {isAnonymous ? 'Đang bật chế độ Ẩn danh (Bảo vệ thông tin cá nhân của bạn)' : 'Hiển thị tên công khai'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      isAnonymous ? 'bg-[#006E00] text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAnonymous ? 'Đăng Ẩn Danh' : 'Đăng Công Khai'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E1E2E9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] font-semibold cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold shadow-xs cursor-pointer flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang lưu vào Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Đăng Cảnh Báo Cộng Đồng</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED SCAM WARNING MODAL */}
      <ReportDetailModal
        report={selectedDetailReport}
        onClose={() => setSelectedDetailReport(null)}
        onOpenEmergency={onOpenEmergency}
        isLargeFont={isLargeFont}
      />
    </div>
  );
};
