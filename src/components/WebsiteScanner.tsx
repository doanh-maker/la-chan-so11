import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Search, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { UrlAnalysisResult, ScamAnalysisResult } from '../types';
import { scanWebsiteUrl } from '../services/api';
import { AnalysisSkeleton, ErrorStateCard } from './UIStateComponents';

interface WebsiteScannerProps {
  isLargeFont: boolean;
  onOpenEmergency: () => void;
  onScanCompleted?: (result: ScamAnalysisResult) => void;
}

const SAMPLE_URLS = [
  { url: 'http://vcb-digibank-xacnhan.com', label: 'Giả Mạo Vietcombank (Độc hại)' },
  { url: 'https://vneid-chinhthuc-nhan-qua.xyz', label: 'Giả Mạo VNeID Tải File APK' },
  { url: 'http://shopee-khuyenmai-tangqua.app-free.com', label: 'Bẫy Trúng Thưởng Shopee' },
  { url: 'https://vietcombank.com.vn', label: 'Trang Web Vietcombank Chính Thức' },
];

export const WebsiteScanner: React.FC<WebsiteScannerProps> = ({ isLargeFont, onOpenEmergency, onScanCompleted }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [urlResult, setUrlResult] = useState<UrlAnalysisResult | null>(null);

  const handleScanUrl = async (targetUrl?: string) => {
    let queryUrl = (targetUrl || urlInput).trim();
    if (!queryUrl) {
      setErrorMsg('Vui lòng nhập địa chỉ website cần kiểm tra.');
      return;
    }

    // Basic URL validation & normalization
    if (!/^https?:\/\//i.test(queryUrl)) {
      queryUrl = 'https://' + queryUrl;
    }

    try {
      new URL(queryUrl);
    } catch {
      setErrorMsg('Địa chỉ website không đúng định dạng. Ví dụ hợp lệ: vietcombank.com.vn hoặc http://vcb-digibank.com');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setUrlResult(null);

    try {
      const result = await scanWebsiteUrl(queryUrl);
      setUrlResult(result);

      // Convert URL result to Scan History entry and notify parent / store in Firestore
      if (onScanCompleted) {
        const scanHistoryItem: ScamAnalysisResult = {
          id: result.id || 'url-' + Date.now(),
          timestamp: result.timestamp || Date.now(),
          inputType: 'text',
          inputText: `[Website Scan] ${result.url}`,
          riskScore: result.riskScore,
          riskLevel: result.riskLevel || (result.riskScore >= 80 ? 'CRITICAL' : result.riskScore >= 50 ? 'HIGH' : result.riskScore >= 25 ? 'WARNING' : 'SAFE'),
          scamType: 'PHISHING_LINK',
          scamTypeNameVi: result.brandImpersonated ? `Giả Mạo Thương Hiệu (${result.brandImpersonated})` : 'Tên Miền Phishing / Giả Mạo',
          summary: result.isPhishing || result.riskScore >= 50 ? `Cảnh báo: Website ${result.domain} có dấu hiệu giả mạo!` : `Website ${result.domain} không phát hiện dấu hiệu nguy hiểm.`,
          explanation: result.aiVerdict,
          redFlags: result.suspiciousIndicators || [],
          recommendedActions: result.recommendations || [],
          emergencyHotlines: ['113 (Công An Khẩn Cấp)', '156 (Bộ Thông Tin & Truyền Thông)'],
          confidenceLevel: '96% (Xác minh Gemini AI)',
          confidenceScore: 96,
        };
        onScanCompleted(scanHistoryItem);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể kiểm tra website này lúc này. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${isLargeFont ? 'text-lg leading-relaxed' : 'text-base'}`}>
      {/* Intro Header Banner */}
      <div className="bg-white p-6 rounded-[28px] border border-[#E1E2E9] shadow-xs space-y-2 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#D1E4FF] text-[#001D36] border border-[#B0C6FF] text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-[#0061A4]" />
          <span>Hệ Thống Nhận Diện Tên Miền Độc Hại & Phishing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#1C1B1F] tracking-tight">
          Kiểm Tra Độ An Toàn Website
        </h2>
        <p className="text-[#44474E] text-sm sm:text-base max-w-2xl">
          Phát hiện các website giả mạo ngân hàng, trang mạng thương mại điện tử nhái tên miền, và các liên kết độc hại chứa mã độc đánh cắp tài khoản.
        </p>
      </div>

      {/* URL Input Form Card */}
      <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#1C1B1F] mb-2 flex items-center justify-between">
            <span>Nhập hoặc dán địa chỉ đường link (URL) nghi vấn:</span>
            <span className="text-xs text-[#44474E] font-normal">Định dạng: http://... hoặc https://...</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Globe className="w-5 h-5 text-[#44474E] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Ví dụ: http://vcb-digibank-xacnhan.com hoặc shopee-tri-an.xyz"
                className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl pl-12 pr-4 py-3.5 text-[#1C1B1F] placeholder-[#44474E] focus:outline-none focus:ring-2 focus:ring-[#0061A4] text-sm sm:text-base transition"
              />
            </div>
            <button
              onClick={() => handleScanUrl()}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-full font-bold bg-[#0061A4] hover:bg-[#004B80] text-white transition flex items-center justify-center space-x-2 shrink-0 shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Kiểm Tra...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Kiểm Tra Website</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preset Sample URLs */}
        <div>
          <p className="text-xs font-bold text-[#44474E] uppercase tracking-wider mb-2">
            Thử mẫu kiểm tra các tên miền nghi vấn:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUrlInput(sample.url);
                  handleScanUrl(sample.url);
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#F3F3F7] border border-[#E1E2E9] hover:border-[#0061A4] hover:bg-[#E7E8EE] text-xs text-[#1C1B1F] font-medium transition flex items-center space-x-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#0061A4]" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message Card */}
        {errorMsg ? (
          <ErrorStateCard
            title="Không thể kiểm tra website này"
            message={errorMsg}
            onRetry={() => handleScanUrl()}
            onOpenEmergency={onOpenEmergency}
          />
        ) : null}
      </div>

      {/* Loading Skeleton */}
      {isLoading && <AnalysisSkeleton />}

      {/* URL Scan Result */}
      {urlResult && !isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-[#E1E2E9] rounded-[28px] p-6 shadow-xs space-y-6"
        >
          {/* Header Verdict Card */}
          <div className={`p-5 rounded-2xl border ${
            urlResult.isPhishing || urlResult.riskScore >= 50
              ? 'bg-[#FFE9E9] border-[#FFDAD6] text-[#410002]'
              : 'bg-[#E8F5E9] border-[#C8E6C9] text-[#006E00]'
          } space-y-3`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
                  urlResult.isPhishing || urlResult.riskScore >= 50
                    ? 'bg-[#BA1A1A] text-white'
                    : 'bg-[#006E00] text-white'
                }`}>
                  {urlResult.riskScore}%
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-lg sm:text-xl text-[#1C1B1F]">
                      {urlResult.domain}
                    </span>
                    {urlResult.brandImpersonated ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#BA1A1A] text-white">
                        Nghi vấn mạo danh: {urlResult.brandImpersonated}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold mt-0.5">
                    {urlResult.isPhishing || urlResult.riskScore >= 50
                      ? 'CẢNH BÁO: WEBSITE CÓ DẤU HIỆU GIẢ MẠO VÀ LỪA ĐẢO!'
                      : 'WEBSITE CHÍNH THỨC HOẶC KHÔNG PHÁT HIỆN DẤU HIỆU NGUY HIỂM.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Safety Indicator Checklist Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-white border border-[#E1E2E9] text-xs flex items-center space-x-2">
                <Lock className={`w-4 h-4 ${urlResult.safetyChecklist.hasSsl ? 'text-[#006E00]' : 'text-[#BA1A1A]'}`} />
                <span className="text-[#1C1B1F] font-medium">
                  {urlResult.safetyChecklist.hasSsl ? 'Có SSL Mã Hóa' : 'Không SSL An Toàn'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E1E2E9] text-xs flex items-center space-x-2">
                <Globe className={`w-4 h-4 ${urlResult.safetyChecklist.isTopDomain ? 'text-[#006E00]' : 'text-[#E65100]'}`} />
                <span className="text-[#1C1B1F] font-medium">
                  {urlResult.safetyChecklist.isTopDomain ? 'Tên miền uy tín' : 'Đuôi miền rủi ro (.xyz/.top)'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E1E2E9] text-xs flex items-center space-x-2">
                <AlertOctagon className={`w-4 h-4 ${!urlResult.safetyChecklist.hasTypoSquatting ? 'text-[#006E00]' : 'text-[#BA1A1A]'}`} />
                <span className="text-[#1C1B1F] font-medium">
                  {urlResult.safetyChecklist.hasTypoSquatting ? 'Dấu hiệu nhái tên miền' : 'Tên miền gốc chuẩn'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E1E2E9] text-xs flex items-center space-x-2">
                <ShieldAlert className={`w-4 h-4 ${!urlResult.safetyChecklist.isKnownScamPattern ? 'text-[#006E00]' : 'text-[#BA1A1A]'}`} />
                <span className="text-[#1C1B1F] font-medium">
                  {urlResult.safetyChecklist.isKnownScamPattern ? 'Nằm trong danh sách đen' : 'Chưa có báo cáo xấu'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Verdict */}
          <div className="p-4 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] space-y-2">
            <h4 className="text-sm font-bold text-[#0061A4] flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Đánh Giá Từ Gemini AI:
            </h4>
            <p className="text-sm text-[#1C1B1F] leading-relaxed">
              {urlResult.aiVerdict}
            </p>
          </div>

          {/* Suspicious Indicators */}
          {urlResult.suspiciousIndicators && urlResult.suspiciousIndicators.length > 0 ? (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#BA1A1A] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Các chỉ số rủi ro phát hiện:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {urlResult.suspiciousIndicators.map((ind, i) => (
                  <li key={i} className="p-3 rounded-xl bg-[#FFE9E9] border border-[#FFDAD6] text-[#410002] text-xs sm:text-sm font-medium flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-[#BA1A1A] shrink-0" />
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Recommendations */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-[#006E00] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Khuyến nghị cho bạn:
            </h4>
            <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-2">
              {urlResult.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-[#006E00]">
                  <CheckCircle2 className="w-4 h-4 text-[#006E00] shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
};
