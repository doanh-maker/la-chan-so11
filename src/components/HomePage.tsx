import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Globe,
  Bot,
  Users,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  Lock,
  ShieldAlert,
  Zap,
  Star,
  HelpCircle,
  Activity,
  FileText,
  Building2,
  Heart,
  ChevronRight,
  Search,
  Check,
  Gamepad2,
  Award
} from 'lucide-react';
import { NavTab, ScamAnalysisResult } from '../types';
import { ScamScanner } from './ScamScanner';
import { WebsiteScanner } from './WebsiteScanner';

interface HomePageProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenEmergency: () => void;
  isLargeFont?: boolean;
  onScanCompleted?: (result: ScamAnalysisResult) => void;
  onNavigateToHistory?: () => void;
  initialToolTab?: 'scanner' | 'website';
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTab,
  onOpenEmergency,
  isLargeFont = false,
  onScanCompleted = () => {},
  onNavigateToHistory = () => {},
  initialToolTab = 'scanner',
}) => {
  // Active tool tab state in home page
  const [activeTool, setActiveTool] = useState<'scanner' | 'website'>(initialToolTab);

  useEffect(() => {
    if (initialToolTab) {
      setActiveTool(initialToolTab);
    }
  }, [initialToolTab]);

  const scrollToToolHub = (tool: 'scanner' | 'website') => {
    setActiveTool(tool);
    const element = document.getElementById('primary-tool-hub');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ accordion active state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Hero interactive demo state
  const [heroDemoType, setHeroDemoType] = useState<'message' | 'website' | 'bank'>('message');

  const faqItems = [
    {
      question: 'Lá Chắn Số AI có thể nhận diện những hình thức lừa đảo nào?',
      answer:
        'Hệ thống tích hợp Google Gemini AI đa phương tiện, có khả năng phân tích cả văn bản và ảnh chụp màn hình từ SMS, Zalo, Messenger, Email. Phân tích được lừa đảo giả danh ngân hàng, giả danh công an/tòa án, bẫy việc làm thu nhập cao, trang web nhái tên miền (phishing), mã QR độc hại và số tài khoản ngân hàng nằm trong danh sách đen.',
    },
    {
      question: 'Thông tin tin nhắn hay ảnh của tôi có bị lưu trữ cá nhân không?',
      answer:
        'Lá Chắn Số AI tuân thủ nghiêm ngặt tiêu chuẩn bảo mật dữ liệu của Google. Mọi dữ liệu quét được xử lý theo cơ chế thời gian thực (real-time) để đưa ra kết quả phân tích và không lưu trữ thông tin nhận dạng cá nhân (PII) trên máy chủ.',
    },
    {
      question: 'Tôi phải làm gì ngay lập tức nếu đã lỡ chuyển tiền cho kẻ lừa đảo?',
      answer:
        '1. Hãy gọi ngay Hotline ngân hàng của bạn để yêu cầu khóa khẩn cấp tài khoản/ứng dụng.\n2. Bấm vào nút "Đường Dây Nóng Khẩn Cấp" trên ứng dụng để lấy hotline hỗ trợ.\n3. Lưu trữ toàn bộ ảnh chụp màn hình giao dịch, tin nhắn, số tài khoản kẻ lừa đảo.\n4. Trình báo ngay cho cơ quan Công an gần nhất hoặc gọi tổng đài 113 / 156.',
    },
    {
      question: 'Làm thế nào để đóng góp báo cáo số điện thoại hoặc tài khoản lừa đảo mới?',
      answer:
        'Bạn có thể vào mục "Báo Cáo Cộng Đồng" và nhấn "Gửi Báo Cáo Mới". Dữ liệu sau khi kiểm duyệt sẽ được đồng bộ lên hệ thống cảnh báo toàn quốc giúp người dùng khác tra cứu và phòng tránh.',
    },
    {
      question: 'Ứng dụng này có hoàn toàn miễn phí không?',
      answer:
        'Hoàn toàn miễn phí 100% cho tất cả người dân Việt Nam. Mục tiêu của Lá Chắn Số AI là tạo ra môi trường không gian mạng an toàn, ứng dụng công nghệ trí tuệ nhân tạo vì cộng đồng.',
    },
  ];

  const features = [
    {
      icon: Gamepad2,
      color: 'bg-amber-100 text-amber-900',
      badgeColor: 'bg-amber-500 text-white',
      title: 'Giả Lập Bẫy Lừa Đảo AI (Sandbox)',
      description:
        'Thực chiến đối đầu 1-1 với kẻ lừa đảo AI trong môi trường an toàn. Đo lường phản xạ bảo mật, hóa giải bẫy tâm lý và nhận chứng chỉ phòng thủ số.',
      actionText: 'Thực chiến ngay',
      tab: 'simulator' as NavTab,
    },
    {
      icon: ShieldCheck,
      color: 'bg-[#D1E4FF] text-[#001D36]',
      badgeColor: 'bg-[#0061A4] text-white',
      title: 'Quét Tin Nhắn & Ảnh Đa Phương Tiện',
      description:
        'Sử dụng Google Gemini AI đọc hiểu hình ảnh chụp màn hình SMS, Zalo, Telegram, Facebook để bóc tách dấu hiệu dụ dỗ, dọa nạt hoặc link độc.',
      actionText: 'Dùng thử ngay',
      tab: 'scanner' as NavTab,
    },
    {
      icon: Globe,
      color: 'bg-[#97F0FF] text-[#001F26]',
      badgeColor: 'bg-[#006874] text-white',
      title: 'Kiểm Tra Website & Phishing Domain',
      description:
        'Phát hiện tức thì các đường link nhái ngân hàng, thương mại điện tử, kiểm tra chứng chỉ SSL, danh sách đen tên miền lừa đảo.',
      actionText: 'Kiểm tra link',
      tab: 'website' as NavTab,
    },
    {
      icon: Bot,
      color: 'bg-[#E8DEF8] text-[#1D192B]',
      badgeColor: 'bg-[#6750A4] text-white',
      title: 'Trợ Lý AI An Ninh Mạng 24/7',
      description:
        'Hỏi đáp trực tiếp với trợ lý thông minh để nhận hướng dẫn xử lý từng bước khi gặp tình huống nghi ngờ bị lừa đảo tài chính.',
      actionText: 'Trò chuyện AI',
      tab: 'chat' as NavTab,
    },
    {
      icon: Users,
      color: 'bg-[#FFDAD6] text-[#410002]',
      badgeColor: 'bg-[#BA1A1A] text-white',
      title: 'Cơ Sở Dữ Liệu Cảnh Báo Cộng Đồng',
      description:
        'Tra cứu số điện thoại, số tài khoản ngân hàng kẻ lừa đảo do người dân trên 63 tỉnh thành trực tiếp phản ánh và xác thực.',
      actionText: 'Xem cảnh báo',
      tab: 'community' as NavTab,
    },
    {
      icon: PhoneCall,
      color: 'bg-[#FFE0B2] text-[#E65100]',
      badgeColor: 'bg-[#E65100] text-white',
      title: 'Đường Dây Nóng Khẩn Cấp 1-Touch',
      description:
        'Truy cập nhanh danh bạ khẩn cấp khóa thẻ tự động các ngân hàng lớn (Vietcombank, Techcombank, BIDV, Agribank) và số 113 / 156.',
      actionText: 'Mở hotline',
      isEmergency: true,
    },
  ];

  const testimonials = [
    {
      name: 'Bác Nguyễn Văn Vinh',
      age: '68 tuổi',
      location: 'Quận Ba Đình, Hà Nội',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      role: 'Người hưu trí',
      comment:
        'Mới tuần trước tôi nhận được tin nhắn dọa phạt nguội và yêu cầu bấm vào đường link. Con trai tôi mở Lá Chắn Số AI quét ảnh màn hình, hệ thống cảnh báo ngay 95% lừa đảo. Nhờ vậy gia đình tôi không bị mất tiền.',
      verified: true,
      rating: 5,
    },
    {
      name: 'Chị Lê Thu Trang',
      age: '34 tuổi',
      location: 'Quận 1, TP. Hồ Chí Minh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120',
      role: 'Kế toán viên',
      comment:
        'Website giả mạo trang web tri ân quà tặng của Shopee làm rất giống thật. Nhờ công cụ kiểm tra tên miền chỉ ra đuôi miền .xyz bất thường và chưa có SSL, tôi đã ngắt kết nối kịp thời.',
      verified: true,
      rating: 5,
    },
    {
      name: 'Anh Phạm Hoàng Nam',
      age: '29 tuổi',
      location: 'Quận Hải Châu, Đà Nẵng',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      role: 'Chuyên viên kỹ thuật',
      comment:
        'Giao diện Material 3 siêu mượt và sạch sẽ. Điểm cộng lớn nhất là khả năng phân tích cực kỳ nhanh của Gemini AI và tính năng tra cứu danh sách đen số tài khoản ngân hàng lừa đảo.',
      verified: true,
      rating: 5,
    },
  ];

  return (
    <div className={`space-y-16 lg:space-y-24 ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      {/* HERO SECTION */}
      <section className="relative pt-4 pb-8 overflow-hidden">
        {/* Background Material 3 Ambient Glow Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#D1E4FF]/60 rounded-full blur-3xl opacity-70 animate-pulse" />
          <div className="absolute top-20 right-10 w-80 h-80 bg-[#E8DEF8]/60 rounded-full blur-3xl opacity-60" />
          <div className="absolute top-40 left-1/3 w-96 h-96 bg-[#FFE9E9]/50 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white border border-[#E1E2E9] shadow-xs text-xs sm:text-sm font-semibold text-[#0061A4]">
                <span className="flex h-2 w-2 rounded-full bg-[#0061A4] animate-ping" />
                <Sparkles className="w-4 h-4 text-[#0061A4]" />
                <span>Google Gemini 3.6 Flash AI • Lá Chắn Số Quốc Gia</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1B1F] tracking-tight leading-[1.15]">
                Bảo vệ bạn & gia đình khỏi <span className="text-[#0061A4] relative inline-block">
                  lừa đảo trực tuyến
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#D1E4FF] -z-10" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,10 Q50,20 100,10" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span> bằng AI
              </h1>

              {/* Subtitle */}
              <p className="text-[#44474E] text-base sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Hệ thống thông minh phát hiện tin nhắn lừa đảo, website giả mạo, số điện thoại và STK nghi vấn trong vài giây với công nghệ trí tuệ nhân tạo hàng đầu từ Google.
              </p>

              {/* CTAs Button Group */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2 flex-wrap">
                <button
                  onClick={() => scrollToToolHub('scanner')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm sm:text-base bg-[#0061A4] hover:bg-[#004B80] text-white shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5 group cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span>Quét Tin Nhắn & Ảnh</span>
                  <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition" />
                </button>

                <button
                  onClick={() => onSelectTab('simulator')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full font-bold text-sm sm:text-base bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5 cursor-pointer"
                >
                  <Gamepad2 className="w-5 h-5 text-white animate-bounce" />
                  <span>Đấu Trường Giả Lập Bẫy AI</span>
                </button>

                <button
                  onClick={() => scrollToToolHub('website')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full font-bold text-sm sm:text-base bg-white hover:bg-[#F3F3F7] text-[#1C1B1F] border border-[#C4C6D0] transition flex items-center justify-center space-x-2 shadow-2xs cursor-pointer"
                >
                  <Globe className="w-5 h-5 text-[#0061A4]" />
                  <span>Kiểm Tra Website</span>
                </button>
              </div>

              {/* Trust Guarantee Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-[#44474E]">
                <div className="flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#006E00]" />
                  <span>100% Miễn phí cộng đồng</span>
                </div>
                <div className="flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#006E00]" />
                  <span>Bảo mật dữ liệu cá nhân</span>
                </div>
                <div className="flex items-center space-x-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#006E00]" />
                  <span>Chuẩn Accessibility AA</span>
                </div>
              </div>
            </div>

            {/* Right Column: AI Interactive Live Scanner Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white border border-[#E1E2E9] rounded-[32px] p-6 shadow-xl space-y-5 relative">
                {/* Header card indicator */}
                <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#001D36] flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5 text-[#0061A4]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#1C1B1F] text-sm sm:text-base">Mô Phỏng Phân Tích Gemini AI</h3>
                      <p className="text-xs text-[#44474E]">Thử nghiệm các tình huống lừa đảo phổ biến</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#006E00] border border-[#C8E6C9]">
                    Live AI
                  </span>
                </div>

                {/* Scenario Toggle Tabs */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F3F3F7] rounded-full text-xs font-medium">
                  <button
                    onClick={() => setHeroDemoType('message')}
                    className={`py-2 rounded-full transition ${
                      heroDemoType === 'message'
                        ? 'bg-white text-[#0061A4] font-bold shadow-2xs'
                        : 'text-[#44474E] hover:text-[#1C1B1F]'
                    }`}
                  >
                    Tin SMS
                  </button>
                  <button
                    onClick={() => setHeroDemoType('website')}
                    className={`py-2 rounded-full transition ${
                      heroDemoType === 'website'
                        ? 'bg-white text-[#0061A4] font-bold shadow-2xs'
                        : 'text-[#44474E] hover:text-[#1C1B1F]'
                    }`}
                  >
                    Website
                  </button>
                  <button
                    onClick={() => setHeroDemoType('bank')}
                    className={`py-2 rounded-full transition ${
                      heroDemoType === 'bank'
                        ? 'bg-white text-[#0061A4] font-bold shadow-2xs'
                        : 'text-[#44474E] hover:text-[#1C1B1F]'
                    }`}
                  >
                    STK / SĐT
                  </button>
                </div>

                {/* Demo Scenario Content */}
                {heroDemoType === 'message' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] text-xs font-mono text-[#1C1B1F]">
                      "[VCB] Taikhoan cua Quy khach bi khoa. Truy cap ngay link http://vcb-digibank-xacnhan.com de mo lai trong 2h."
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#BA1A1A] flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> Đánh giá: RẤT NGUY HIỂM
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#BA1A1A] text-white">
                          98% Rủi Ro
                        </span>
                      </div>
                      <p className="text-xs text-[#410002]">
                        Tin nhắn mạo danh ngân hàng Vietcombank sử dụng đường link giả mạo đánh cắp mật khẩu & OTP.
                      </p>
                    </div>
                  </div>
                )}

                {heroDemoType === 'website' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] text-xs font-mono text-[#1C1B1F] flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-[#BA1A1A] shrink-0" />
                      <span className="truncate">https://shopee-tri-an-khach-hang-2026.xyz</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#BA1A1A] flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4" /> Tên Miền Giả Mạo
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#BA1A1A] text-white">
                          92% Rủi Ro
                        </span>
                      </div>
                      <p className="text-xs text-[#410002]">
                        Tên miền đuôi .xyz nhái thương hiệu Shopee, thiếu chứng chỉ SSL an toàn, có bẫy thu thập thông tin thẻ.
                      </p>
                    </div>
                  </div>
                )}

                {heroDemoType === 'bank' && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="p-3.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] text-xs font-mono text-[#1C1B1F] space-y-1">
                      <p><strong className="text-[#44474E]">STK:</strong> 1029384756 (MBBank)</p>
                      <p><strong className="text-[#44474E]">SĐT:</strong> 0901234567</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#BA1A1A] flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> Nằm Trong Cảnh Báo
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BA1A1A] text-white">
                          12 Báo Cáo
                        </span>
                      </div>
                      <p className="text-xs text-[#410002]">
                        Tài khoản này đã bị nhiều người dân báo cáo liên quan đến thủ đoạn tuyển cộng tác viên chốt đơn ảo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer action button inside hero graphic */}
                <button
                  onClick={() => onSelectTab('scanner')}
                  className="w-full py-3 rounded-full font-bold text-xs bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#0061A4] transition flex items-center justify-center space-x-2 border border-[#E1E2E9]"
                >
                  <span>Thử Quét Với Dữ Liệu Của Bạn</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY TOOL HUB SECTION (INTEGRATED SCANNER & WEBSITE CHECKER) */}
      <section id="primary-tool-hub" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 scroll-mt-20">
        <div className="bg-white border-2 border-[#0061A4]/30 rounded-[32px] p-4 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Highlight */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#D1E4FF]/40 rounded-full blur-3xl pointer-events-none" />

          {/* Tool Hub Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#0061A4]/10 text-[#0061A4] text-xs font-bold border border-[#0061A4]/20">
              <Sparkles className="w-4 h-4 text-[#0061A4]" />
              <span>Trung Tâm Phân Tích Gemini 3.6 AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1B1F] tracking-tight">
              Công Cụ Kiểm Tra & Quét An Ninh Trực Tuyến
            </h2>
            <p className="text-xs sm:text-sm text-[#44474E]">
              Chuyển đổi nhanh 2 công cụ bên dưới để kiểm tra an toàn tin nhắn, hình ảnh, tài khoản ngân hàng hoặc đường link website.
            </p>
          </div>

          {/* Segmented Switcher Controls (2 Toggle Buttons) */}
          <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 bg-[#F3F3F7] rounded-2xl border border-[#E1E2E9] shadow-inner">
            <button
              onClick={() => setActiveTool('scanner')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2.5 cursor-pointer ${
                activeTool === 'scanner'
                  ? 'bg-[#0061A4] text-white shadow-md'
                  : 'text-[#44474E] hover:text-[#1C1B1F] hover:bg-white/60'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeTool === 'scanner' ? 'text-white' : 'text-[#0061A4]'}`} />
              <div className="text-left leading-tight">
                <span className="block font-black">1. Quét Lừa Đảo</span>
                <span className={`block text-[10px] font-normal ${activeTool === 'scanner' ? 'text-white/80' : 'text-[#74777F]'}`}>
                  Tin nhắn, Ảnh, SĐT, STK
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTool('website')}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center space-x-2.5 cursor-pointer ${
                activeTool === 'website'
                  ? 'bg-[#0061A4] text-white shadow-md'
                  : 'text-[#44474E] hover:text-[#1C1B1F] hover:bg-white/60'
              }`}
            >
              <Globe className={`w-5 h-5 ${activeTool === 'website' ? 'text-white' : 'text-[#0061A4]'}`} />
              <div className="text-left leading-tight">
                <span className="block font-black">2. Kiểm Tra Website</span>
                <span className={`block text-[10px] font-normal ${activeTool === 'website' ? 'text-white/80' : 'text-[#74777F]'}`}>
                  Tên miền, Link Phishing, SSL
                </span>
              </div>
            </button>
          </div>

          {/* Active Tool Panel */}
          <div className="pt-2">
            {activeTool === 'scanner' ? (
              <ScamScanner
                onScanCompleted={onScanCompleted}
                isLargeFont={isLargeFont}
                onOpenEmergency={onOpenEmergency}
                onNavigateToHistory={onNavigateToHistory}
              />
            ) : (
              <WebsiteScanner
                isLargeFont={isLargeFont}
                onOpenEmergency={onOpenEmergency}
                onScanCompleted={onScanCompleted}
              />
            )}
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="bg-white border-y border-[#E1E2E9] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0061A4]">1,280,000+</p>
              <p className="text-xs sm:text-sm font-semibold text-[#1C1B1F]">Lượt quét an toàn</p>
              <p className="text-xs text-[#44474E]">Đã thực hiện trên toàn quốc</p>
            </div>

            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006874]">99.4%</p>
              <p className="text-xs sm:text-sm font-semibold text-[#1C1B1F]">Độ chính xác phân tích</p>
              <p className="text-xs text-[#44474E]">Huấn luyện dữ liệu lừa đảo Việt Nam</p>
            </div>

            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#6750A4]">&lt; 2s</p>
              <p className="text-xs sm:text-sm font-semibold text-[#1C1B1F]">Tốc độ phản hồi AI</p>
              <p className="text-xs text-[#44474E]">Google Cloud Run container</p>
            </div>

            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#006E00]">63/63</p>
              <p className="text-xs sm:text-sm font-semibold text-[#1C1B1F]">Tỉnh thành bảo vệ</p>
              <p className="text-xs text-[#44474E]">Mạng lưới cảnh báo cộng đồng</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI SCAM SIMULATOR SPOTLIGHT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#1C1B1F] via-[#2A2930] to-[#004B80] rounded-[36px] p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-4 max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Gamepad2 className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Phòng Luyện An Ninh Số • AI Scam Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Bạn có tự tin không sập bẫy lừa đảo công nghệ cao?
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Trải nghiệm thực chiến đối đầu 1-1 với AI đóng vai kẻ giả danh công an, tuyển dụng đa cấp, deepfake người thân... Hệ thống AI Coach sẽ chấm điểm phản xạ an ninh, phát hiện lỗ hổng tâm lý và cấp chứng chỉ phòng thủ cho bạn!
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onSelectTab('simulator')}
                className="px-7 py-3.5 rounded-full font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#1C1B1F] shadow-lg transition flex items-center space-x-2.5 cursor-pointer group"
              >
                <Gamepad2 className="w-4 h-4 text-[#1C1B1F]" />
                <span>Vào Đấu Trường Giả Lập Ngay</span>
                <ArrowRight className="w-4 h-4 text-[#1C1B1F] group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>

          {/* Graphical Mockup Preview */}
          <div className="w-full lg:w-96 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20 shadow-xl space-y-3 relative z-10 shrink-0">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 bg-red-400 rounded-full" />
                <span className="w-3 h-3 bg-amber-400 rounded-full" />
                <span className="w-3 h-3 bg-green-400 rounded-full" />
                <span className="text-xs font-bold text-white/80 ml-2">Live AI Simulation</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                100/100 An Toàn
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="bg-white/15 p-3 rounded-2xl text-white/90 rounded-tl-xs">
                <p className="font-bold text-amber-300 text-[11px]">Kẻ mạo danh Công An:</p>
                <p className="mt-0.5">"Tài khoản VNeID của bạn bị lỗi định danh, tải ngay file .apk để đồng bộ khẩn cấp!"</p>
              </div>
              <div className="bg-[#0061A4] p-3 rounded-2xl text-white ml-auto max-w-[85%] rounded-tr-xs">
                <p className="font-bold text-xs">Bạn (Phòng thủ):</p>
                <p className="mt-0.5">"Công an không làm việc qua Zalo hay gửi link tải app ngoài. Tôi sẽ đến trụ sở phường!"</p>
              </div>
              <div className="bg-green-500/20 border border-green-400/30 p-2.5 rounded-xl text-green-200 text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
                <span>AI Coach: +25 Điểm phản xạ cảnh giác xuất sắc!</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#D1E4FF] text-[#001D36] text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-[#0061A4]" />
            <span>Tính Năng Đột Phá • Tiêu Chuẩn Google Safety</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1B1F] tracking-tight">
            Giải pháp phòng chống lừa đảo toàn diện
          </h2>
          <p className="text-[#44474E] text-sm sm:text-base">
            Sử dụng trí tuệ nhân tạo tiên tiến và dữ liệu cộng đồng thời gian thực để bảo vệ thông tin tài chính cá nhân của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E1E2E9] hover:border-[#C4C6D0] rounded-[28px] p-6 space-y-5 transition shadow-xs hover:shadow-md flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${feat.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${feat.badgeColor}`}>
                      Tính năng
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#1C1B1F] group-hover:text-[#0061A4] transition">
                    {feat.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2">
                  {feat.isEmergency ? (
                    <button
                      onClick={onOpenEmergency}
                      className="w-full py-2.5 rounded-full bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] font-bold text-xs transition flex items-center justify-center space-x-2"
                    >
                      <PhoneCall className="w-4 h-4 text-[#BA1A1A]" />
                      <span>{feat.actionText}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => feat.tab && onSelectTab(feat.tab)}
                      className="w-full py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#0061A4] font-bold text-xs transition flex items-center justify-center space-x-2"
                    >
                      <span>{feat.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#0061A4]" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS PROCESS STEPS */}
      <section className="bg-white border-y border-[#E1E2E9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#E8DEF8] text-[#1D192B] text-xs font-bold">
              Quy Trình 3 Bước Đơn Giản
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1B1F] tracking-tight">
              Sử dụng dễ dàng chỉ trong vài giây
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-[28px] bg-[#F3F3F7] border border-[#E1E2E9] space-y-4 text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#0061A4] text-white font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                1
              </div>
              <h3 className="font-extrabold text-lg text-[#1C1B1F]">Dán Tin Nhắn / Tải Ảnh</h3>
              <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                Sao chép văn bản nghi ngờ hoặc tải ảnh chụp màn hình tin nhắn, lời mời việc làm, đường link hay số điện thoại.
              </p>
            </div>

            <div className="p-6 rounded-[28px] bg-[#F3F3F7] border border-[#E1E2E9] space-y-4 text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#006874] text-white font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                2
              </div>
              <h3 className="font-extrabold text-lg text-[#1C1B1F]">Gemini AI Phân Tích</h3>
              <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                Mô hình AI đa phương tiện bóc tách các dấu hiệu lừa đảo, đối chiếu với cơ sở dữ liệu danh sách đen toàn quốc.
              </p>
            </div>

            <div className="p-6 rounded-[28px] bg-[#F3F3F7] border border-[#E1E2E9] space-y-4 text-center relative">
              <div className="w-12 h-12 rounded-full bg-[#006E00] text-white font-black text-xl flex items-center justify-center mx-auto shadow-xs">
                3
              </div>
              <h3 className="font-extrabold text-lg text-[#1C1B1F]">Nhận Kết Quả & Khuyên Nghị</h3>
              <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                Xem ngay thang điểm rủi ro, danh sách bất thường và các hướng dẫn xử lý an toàn kịp thời.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FFE9E9] text-[#BA1A1A] text-xs font-bold">
            <Heart className="w-3.5 h-3.5 text-[#BA1A1A]" />
            <span>Đánh Giá Từ Cộng Đồng</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1B1F] tracking-tight">
            Cộng đồng nói gì về Lá Chắn Số AI?
          </h2>
          <p className="text-[#44474E] text-sm sm:text-base">
            Hàng ngàn người dân và chuyên gia đã bảo vệ tài sản gia đình nhờ phản ứng kịp thời.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-amber-500">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-[#1C1B1F] leading-relaxed italic">
                  "{item.comment}"
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-[#E1E2E9]">
                <img
                  src={item.avatar}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover border border-[#E1E2E9]"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-[#1C1B1F] flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0061A4]" />
                  </h4>
                  <p className="text-[11px] text-[#44474E]">
                    {item.role} • {item.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="bg-white border-y border-[#E1E2E9] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1.5 rounded-full bg-[#D1E4FF] text-[#001D36] text-xs font-bold">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1C1B1F] tracking-tight">
              Câu Hỏi Thường Gặp (FAQ)
            </h2>
            <p className="text-[#44474E] text-sm">
              Mọi điều bạn cần biết về nguyên lý hoạt động, tính riêng tư và bảo mật của ứng dụng.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#E1E2E9] rounded-2xl overflow-hidden transition bg-[#F3F3F7]"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-[#1C1B1F] flex items-center justify-between gap-4 hover:bg-[#E7E8EE] transition"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#44474E] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0061A4]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={`faq-answer-${idx}`}
                      className="p-5 pt-0 text-xs sm:text-sm text-[#44474E] leading-relaxed whitespace-pre-line border-t border-[#E1E2E9] bg-white"
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EMERGENCY HOTLINE BANNER CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-[32px] bg-gradient-to-r from-[#001D36] via-[#00325B] to-[#001D36] text-white shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left relative z-10 max-w-2xl">
            <span className="px-3.5 py-1.5 rounded-full bg-[#FFDAD6] text-[#BA1A1A] text-xs font-bold inline-block">
              ⚠️ Tình Huống Khẩn Cấp
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Bạn đã chuyển tiền hoặc nghi ngờ bị lừa đảo?
            </h2>
            <p className="text-[#D1E4FF] text-sm sm:text-base">
              Hãy liên hệ ngay tổng đài khẩn cấp các ngân hàng và cơ quan chức năng để được hỗ trợ phong tỏa tài khoản kịp thời.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
            <button
              onClick={onOpenEmergency}
              className="px-8 py-4 rounded-full font-extrabold text-sm bg-[#BA1A1A] hover:bg-[#93000A] text-white shadow-md transition flex items-center justify-center space-x-2"
            >
              <PhoneCall className="w-5 h-5 text-white" />
              <span>Xem Đường Dây Nóng Khẩn Cấp</span>
            </button>

            <button
              onClick={() => onSelectTab('chat')}
              className="px-7 py-4 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center justify-center space-x-2"
            >
              <Bot className="w-5 h-5 text-sky-300" />
              <span>Hỏi Trợ Lý AI</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
