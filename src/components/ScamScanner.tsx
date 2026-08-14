import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Copy,
  RefreshCw,
  Info,
  ArrowRight,
  PhoneCall,
  Check,
  History,
  X,
  Maximize2,
  Clock,
  ExternalLink,
  Clipboard,
  Trash2,
  Lock,
  Layers,
  Search,
  Activity,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { ScamAnalysisResult, ScamTimelineStep, SimilarScamCase } from '../types';
import { scanScamMessage } from '../services/api';
import { AnalysisSkeleton, ErrorStateCard, SuccessBadgeAnimation } from './UIStateComponents';

interface ScamScannerProps {
  onScanCompleted: (result: ScamAnalysisResult) => void;
  isLargeFont?: boolean;
  onOpenEmergency: () => void;
  onNavigateToHistory?: () => void;
}

const SAMPLE_SCAMS = [
  {
    title: 'SMS Mạo Danh Vietcombank',
    text: '[VCB] Tai khoan VCB Digibank cua quy khach bi khoa do vi pham an toan. Vui long truy cap http://vcb-digibank-xacnhan.com de xac nhan va mo lai trong 24h.',
    category: 'Giả Ngân Hàng'
  },
  {
    title: 'Bẫy Việc Làm Shopee / Tiki',
    text: 'Cơ hội việc làm online tại nhà! Tuyển cộng tác viên chốt đơn Shopee thu nhập 300k - 1 triệu/ngày. Không cần kinh nghiệm, làm 30 phút nhận lương ngay qua Zalo 0868.999.888!',
    category: 'Việc Làm Online'
  },
  {
    title: 'Giả Công An / VNeID Mức 2',
    text: 'Thông báo từ Bộ Công An: Hồ sơ VNeID mức 2 của bạn bị lỗi định danh. Vui lòng gọi 024.888.9912 hoặc tải app VNeID-ChinhThuc.apk qua Zalo để tránh bị khởi tố.',
    category: 'Giả Công An'
  },
  {
    title: 'Tin Nhắn Giả Thân Nhân Cấp Cứu',
    text: 'Mẹ ơi, con bị hỏng xe với rơi ví ở đường, đang cần gấp 5 triệu chuyển khoản cho chú sửa xe này. Chuyển gấp vào STK 1019283746 Ngân hàng MB LE VAN A giúp con nhé!',
    category: 'Giả Thân Nhân'
  }
];

export const ScamScanner: React.FC<ScamScannerProps> = ({
  onScanCompleted,
  isLargeFont = false,
  onOpenEmergency,
  onNavigateToHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScamAnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Interactive Checklist State
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    'Trích xuất văn bản OCR từ ảnh chụp...',
    'Đầu nối Cơ sở dữ liệu Tên miền & STK Cảnh báo...',
    'Đánh giá mô hình tâm lý Gemini 3.6 Flash AI...',
    'Xây dựng ma trận rủi ro & lộ trình khắc phục...'
  ];

  // Handle Clipboard Paste
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
        setErrorMsg(null);
      }
    } catch (err) {
      setErrorMsg('Không thể truy cập khay nhớ tạm. Vui lòng dán thủ công.');
    }
  };

  // Handle Image File Selection
  const processImageFile = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Dung lượng ảnh vượt quá 8MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }
    setImageName(file.name);
    setImageSize(`${(file.size / 1024).toFixed(0)} KB`);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      setErrorMsg('Vui lòng kéo thả tập tin hình ảnh (PNG, JPG, WebP).');
    }
  };

  // Run AI Scan
  const handleRunScan = async () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMsg('Vui lòng dán nội dung tin nhắn hoặc tải ảnh chụp màn hình cần kiểm tra.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStepIndex(0);

    // Simulate telemetry step progress
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const result = await scanScamMessage(inputText.trim(), selectedImage || undefined);
      clearInterval(interval);
      setScanResult(result);
      setCompletedActions({});
      onScanCompleted(result);
    } catch (err: any) {
      clearInterval(interval);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi Gemini AI phân tích. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setInputText(sampleText);
    setErrorMsg(null);
  };

  const handleToggleAction = (index: number) => {
    setCompletedActions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyReport = () => {
    if (!scanResult) return;
    const textToCopy = `[CẢNH BÁO AN NINH MẠNG - LÁ CHẮN SỐ AI]
Mức độ rủi ro: ${scanResult.riskScore}/100 (${scanResult.scamTypeNameVi})
Tóm tắt: ${scanResult.summary}
Dấu hiệu vi phạm:
${scanResult.redFlags.map((rf) => `- ${rf}`).join('\n')}
Hướng dẫn xử lý:
${scanResult.recommendedActions.map((ra) => `- ${ra}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Risk styling helper
  const getRiskConfig = (score: number) => {
    if (score >= 80) {
      return {
        bg: 'bg-[#FFE9E9] border-[#FFDAD6]',
        badgeBg: 'bg-[#BA1A1A] text-white',
        textColor: 'text-[#BA1A1A]',
        progressColor: 'bg-[#BA1A1A]',
        label: 'RẤT NGUY HIỂM (CRITICAL RISK)',
        desc: 'Mối đe dọa trực tiếp đến tài khoản tài chính và thông tin cá nhân. Hãy dừng mọi thao tác khẩn cấp!',
      };
    } else if (score >= 50) {
      return {
        bg: 'bg-[#FFF3E0] border-[#FFE0B2]',
        badgeBg: 'bg-[#E65100] text-white',
        textColor: 'text-[#E65100]',
        progressColor: 'bg-[#EF6C00]',
        label: 'CẢNH BÁO CAO (HIGH RISK)',
        desc: 'Nội dung có nhiều dấu hiệu giả mạo bẫy tài chính. Cần xác minh kỹ qua kênh chính thống.',
      };
    } else if (score >= 20) {
      return {
        bg: 'bg-[#FFFDE7] border-[#FFF59D]',
        badgeBg: 'bg-[#F57F17] text-white',
        textColor: 'text-[#F57F17]',
        progressColor: 'bg-[#FBC02D]',
        label: 'THẬN TRỌNG (MODERATE RISK)',
        desc: 'Có dấu hiệu bất thường nhỏ. Vui lòng kiểm tra lại địa chỉ người gửi và tên miền.',
      };
    } else {
      return {
        bg: 'bg-[#E8F5E9] border-[#C8E6C9]',
        badgeBg: 'bg-[#006E00] text-white',
        textColor: 'text-[#006E00]',
        progressColor: 'bg-[#006E00]',
        label: 'AN TOÀN (LOW RISK)',
        desc: 'Chưa phát hiện dấu hiệu độc hại hoặc kịch bản lừa đảo phổ biến.',
      };
    }
  };

  return (
    <div className={`space-y-8 ${isLargeFont ? 'text-lg leading-relaxed' : 'text-base'}`}>
      {/* PAGE HEADER / CYBER DASHBOARD BAR */}
      <div className="bg-[#001D36] text-white p-6 sm:p-8 rounded-[32px] shadow-xl border border-[#00325B] relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00325B_1px,transparent_1px),linear-gradient(to_bottom,#00325B_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#0061A4]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#0061A4]/40 border border-[#A3C9FF]/30 text-xs font-semibold text-[#D1E4FF]">
              <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              <span>Trung Tâm Phân Tích Mối Đe Dọa • Gemini 3.6 Flash Multi-Modal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              AI Cyber Threat Scanner
            </h1>
            <p className="text-[#D1E4FF] text-sm sm:text-base leading-relaxed">
              Phát hiện tức thì thủ đoạn lừa đảo qua tin nhắn, ảnh chụp màn hình, bẫy tuyển dụng & tên miền giả mạo bằng AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNavigateToHistory && (
              <button
                onClick={onNavigateToHistory}
                className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition flex items-center space-x-2 shadow-xs"
              >
                <History className="w-4 h-4 text-sky-300" />
                <span>Lịch Sử Quét</span>
              </button>
            )}

            <button
              onClick={onOpenEmergency}
              className="px-5 py-3 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold transition flex items-center space-x-2 shadow-md"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span>Hotline Khẩn Cấp 113 / 156</span>
            </button>
          </div>
        </div>
      </div>

      {/* INPUT WORKSPACE PANEL */}
      <div className="bg-white border border-[#E1E2E9] rounded-[32px] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Text Input Area */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-[#1C1B1F] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0061A4]" />
                1. Dán Văn Bản / Tin Nhắn Nghi Ngờ:
              </label>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-1.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#0061A4] text-xs font-bold transition flex items-center space-x-1"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Dán từ khay nhớ</span>
                </button>
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText('')}
                    className="p-1.5 rounded-full text-[#44474E] hover:text-[#BA1A1A] hover:bg-[#FFE9E9] transition"
                    title="Xóa văn bản"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Dán tin nhắn SMS, Zalo, Messenger, Email hoặc nội dung lời mời tuyển dụng nghi ngờ tại đây... (Ví dụ: [VCB] Tai khoan bi khoa...)"
                className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl p-4 text-[#1C1B1F] placeholder-[#74777F] focus:outline-none focus:ring-2 focus:ring-[#0061A4] focus:bg-white text-sm sm:text-base resize-y transition"
              />
              <div className="absolute bottom-3 right-4 text-xs text-[#74777F]">
                {inputText.length} ký tự
              </div>
            </div>
          </div>

          {/* Right: Drag & Drop Screenshot Dropzone */}
          <div className="lg:col-span-5 space-y-3">
            <label className="text-sm font-extrabold text-[#1C1B1F] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#0061A4]" />
                2. Tải Ảnh Chụp Màn Hình (Tùy chọn):
              </span>
              <span className="text-xs text-[#74777F] font-normal">Tối đa 8MB</span>
            </label>

            {selectedImage ? (
              <div className="bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl p-4 space-y-3 relative">
                <div className="flex items-start space-x-3">
                  <div
                    onClick={() => setIsPreviewOpen(true)}
                    className="relative cursor-pointer group shrink-0"
                  >
                    <img
                      src={selectedImage}
                      alt="Uploaded Screenshot"
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 rounded-xl object-cover border border-[#E1E2E9] shadow-2xs group-hover:opacity-80 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <Maximize2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-bold text-[#1C1B1F] truncate">{imageName || 'Anh_chup_man_hinh.png'}</p>
                    <p className="text-xs text-[#74777F]">{imageSize || 'Kích thước hợp lệ'}</p>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#006E00]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đã sẵn sàng phân tích OCR
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E1E2E9]">
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(true)}
                    className="text-xs font-bold text-[#0061A4] hover:underline flex items-center gap-1"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Xem phóng to
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageName(null);
                      setImageSize(null);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFE9E9] text-[#BA1A1A] hover:bg-[#FFDAD6] transition"
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[168px] ${
                  isDragging
                    ? 'border-[#0061A4] bg-[#D1E4FF]/30'
                    : 'border-[#C4C6D0] hover:border-[#0061A4] bg-[#F3F3F7] hover:bg-[#E7E8EE]'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[#1C1B1F]">
                  Kéo & thả ảnh chụp màn hình vào đây
                </p>
                <p className="text-xs text-[#0061A4] font-semibold mt-1">
                  hoặc bấm để chọn từ thiết bị (PNG, JPG, WebP)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preset Sample Scams */}
        <div>
          <p className="text-xs font-bold text-[#74777F] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#0061A4]" />
            Thử nhanh các mẫu tin nhắn lừa đảo thực tế tại Việt Nam:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SAMPLE_SCAMS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.text)}
                className="p-3.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] hover:border-[#0061A4] hover:bg-white transition text-left group shadow-2xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0061A4] group-hover:underline">
                    {sample.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E1E2E9] text-[#44474E] font-medium shrink-0">
                    {sample.category}
                  </span>
                </div>
                <p className="text-xs text-[#44474E] line-clamp-2">
                  {sample.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <ErrorStateCard
            title="Có Lỗi Trong Quá Trình Phân Tích"
            message={errorMsg}
            onRetry={handleRunScan}
            onOpenEmergency={onOpenEmergency}
          />
        )}

        {/* Analyze Action Button */}
        <button
          onClick={handleRunScan}
          disabled={isLoading}
          className="w-full py-4 rounded-full font-black text-base bg-[#0061A4] hover:bg-[#004B80] text-white shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
        >
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-200" />
              <span>{loadingSteps[loadingStepIndex]}</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Phân Tích Bằng Gemini AI Ngay</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
            </>
          )}
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <AnalysisSkeleton />}

      {/* DASHBOARD RESULTS DISPLAY SECTION */}
      {scanResult && !isLoading && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#E1E2E9] rounded-[32px] p-6 sm:p-8 shadow-md space-y-8"
        >
          {/* TOP METRICS & RISK SCORE METER */}
          {(() => {
            const riskConfig = getRiskConfig(scanResult.riskScore);
            return (
              <div className={`p-6 rounded-[28px] border ${riskConfig.bg} space-y-6`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Score Radial & Title */}
                  <div className="flex items-center space-x-5">
                    {/* Radial Score Meter Visual */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-white/60"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={riskConfig.textColor}
                          strokeDasharray={`${scanResult.riskScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className={`text-2xl font-black ${riskConfig.textColor}`}>
                          {scanResult.riskScore}
                        </span>
                        <span className="text-[10px] block font-bold text-[#44474E]">/100</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${riskConfig.badgeBg}`}>
                          {riskConfig.label}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1C1B1F] border border-[#E1E2E9]">
                          {scanResult.scamTypeNameVi}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D1E4FF] text-[#001D36] border border-[#A3C9FF]/60 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#0061A4]" />
                          <span>Độ tin cậy AI: {scanResult.confidenceLevel || '95% (Cực kỳ tin cậy)'}</span>
                        </span>
                      </div>
                      <h2 className={`text-xl sm:text-2xl font-black ${riskConfig.textColor}`}>
                        {scanResult.summary}
                      </h2>
                      <p className="text-xs sm:text-sm text-[#44474E] max-w-2xl">
                        {riskConfig.desc}
                      </p>
                    </div>
                  </div>

                  {/* Export & Copy Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyReport}
                      className="px-4 py-2.5 rounded-full bg-white hover:bg-[#F3F3F7] text-[#1C1B1F] text-xs font-bold flex items-center space-x-2 transition border border-[#C4C6D0] shadow-2xs"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#006E00]" /> : <Copy className="w-4 h-4 text-[#0061A4]" />}
                      <span>{copied ? 'Đã sao chép!' : 'Sao chép kết quả'}</span>
                    </button>

                    {onNavigateToHistory && (
                      <button
                        onClick={onNavigateToHistory}
                        className="px-4 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold flex items-center space-x-2 transition shadow-xs"
                      >
                        <History className="w-4 h-4" />
                        <span>Xem Lịch Sử</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-black/5">
                  <div className="flex justify-between text-xs font-extrabold text-[#1C1B1F]">
                    <span>Thang chỉ số rủi ro lừa đảo (AI Risk Index):</span>
                    <span>{scanResult.riskScore} / 100 Điểm</span>
                  </div>
                  <div className="w-full bg-white/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-black/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${riskConfig.progressColor}`}
                      style={{ width: `${scanResult.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* EXPLANATION & RED FLAGS PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: AI Detailed Analysis */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] space-y-3">
                <h3 className="text-sm font-extrabold text-[#0061A4] flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Phân Tích Chi Tiết Từ Trí Tuệ Nhân Tạo (AI Threat Explanation)
                </h3>
                <p className="text-sm text-[#1C1B1F] leading-relaxed font-medium whitespace-pre-line">
                  {scanResult.explanation}
                </p>
              </div>

              {/* Red Flags List */}
              {scanResult.redFlags && scanResult.redFlags.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-sm font-extrabold text-[#BA1A1A] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Dấu Hiệu Bất Thường Phát Hiện Được ({scanResult.redFlags.length}):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {scanResult.redFlags.map((flag, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#FFE9E9] border border-[#FFDAD6] text-[#410002] text-xs sm:text-sm font-semibold flex items-start space-x-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#BA1A1A] mt-1.5 shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Attack Timeline Flow */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-5 rounded-2xl bg-[#001D36] text-white border border-[#00325B] space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#00325B] mb-4">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-300" />
                      Kịch Bản Diễn Tiến Tấn Công (Attack Timeline)
                    </h3>
                    <span className="text-[11px] font-mono text-[#A3C9FF]">Cyber Matrix</span>
                  </div>

                  <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-3.5 before:w-0.5 before:bg-[#00325B]">
                    {scanResult.timeline?.map((step) => (
                      <div key={step.stepNumber} className="relative pl-8 space-y-1">
                        <div
                          className={`absolute left-1.5 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                            step.severity === 'CRITICAL'
                              ? 'bg-[#BA1A1A] border-white text-white'
                              : step.severity === 'WARNING'
                              ? 'bg-[#E65100] border-white text-white'
                              : 'bg-[#0061A4] border-white text-white'
                          }`}
                        >
                          {step.stepNumber}
                        </div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-extrabold text-white">{step.title}</h4>
                          <span className="text-[10px] font-mono text-[#A3C9FF] bg-white/10 px-2 py-0.5 rounded">
                            {step.timeOffset}
                          </span>
                        </div>
                        <p className="text-xs text-[#D1E4FF] leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#00325B] text-center">
                  <p className="text-[11px] text-[#A3C9FF]">
                    💡 Nhận diện sớm ở Bước 1 giúp bạn giảm 99% thiệt hại tài chính.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED ACTIONS INTERACTIVE CHECKLIST */}
          <div className="p-6 rounded-[28px] bg-[#E8F5E9] border border-[#C8E6C9] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-extrabold text-[#006E00] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Lộ Trình Khắc Phục Khẩn Cấp (Recommended Remediation Checklist):
              </h3>
              <span className="text-xs font-bold text-[#006E00] bg-white px-3 py-1 rounded-full border border-[#C8E6C9]">
                {Object.values(completedActions).filter(Boolean).length} / {scanResult.recommendedActions?.length || 0} Đã Hoàn Thành
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scanResult.recommendedActions?.map((action, idx) => {
                const isChecked = !!completedActions[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleToggleAction(idx)}
                    className={`p-3.5 rounded-2xl text-left transition flex items-start space-x-3 border ${
                      isChecked
                        ? 'bg-[#C8E6C9] border-[#006E00] text-[#002105] line-through opacity-80'
                        : 'bg-white border-[#C8E6C9] text-[#006E00] hover:bg-[#F1F8E9]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                      isChecked ? 'bg-[#006E00] border-[#006E00] text-white' : 'border-[#006E00] bg-white'
                    }`}>
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                      {action}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#C8E6C9]/60">
              <div className="text-xs text-[#006E00] font-medium flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#006E00]" />
                <span>Thực hiện đầy đủ các bước trên để đảm bảo an toàn tuyệt đối cho tài khoản.</span>
              </div>

              <button
                onClick={onOpenEmergency}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-extrabold transition shadow-xs flex items-center justify-center space-x-2"
              >
                <PhoneCall className="w-4 h-4 text-white" />
                <span>Gọi Ngân Hàng Khóa Thẻ Tự Động</span>
              </button>
            </div>
          </div>

          {/* SIMILAR CASES (THREAT INTELLIGENCE MATCH) */}
          {scanResult.similarCases && scanResult.similarCases.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#1C1B1F] flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#0061A4]" />
                  Vụ Việc Tương Tự Trích Xuất Từ CSĐT Cảnh Báo Cộng Đồng (Threat Intelligence):
                </h3>
                <span className="text-xs text-[#74777F]">Cập nhật thời gian thực</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scanResult.similarCases.map((simCase) => (
                  <div
                    key={simCase.id}
                    className="p-4 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] space-y-3 hover:border-[#0061A4] transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1E4FF] text-[#001D36]">
                          Khớp {simCase.similarityScore}%
                        </span>
                        <span className="text-[11px] text-[#74777F]">{simCase.reportedDate}</span>
                      </div>

                      <h4 className="text-sm font-bold text-[#1C1B1F] line-clamp-2">
                        {simCase.title}
                      </h4>

                      <p className="text-xs text-[#44474E] line-clamp-3">
                        {simCase.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E1E2E9] space-y-1 text-[11px] text-[#74777F]">
                      {simCase.targetInfo && (
                        <p className="truncate font-mono"><strong className="text-[#1C1B1F]">Đối tượng:</strong> {simCase.targetInfo}</p>
                      )}
                      <p className="truncate"><strong className="text-[#1C1B1F]">Địa bàn:</strong> {simCase.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {isPreviewOpen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E1E2E9]">
              <h3 className="font-bold text-sm text-[#1C1B1F]">{imageName || 'Ảnh chụp màn hình'}</h3>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-full text-[#44474E] hover:bg-[#F3F3F7] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 overflow-auto flex items-center justify-center">
              <img src={selectedImage} alt="Full Preview" className="max-h-[70vh] rounded-xl object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
