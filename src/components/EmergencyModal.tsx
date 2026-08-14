import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, X, Copy, Check, ExternalLink, Building2, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMERGENCY_HOTLINES = [
  { name: 'Cảnh Sát Khẩn Cấp', number: '113', desc: 'Báo án lừa đảo chiếm đoạt tài sản khẩn cấp', icon: '🚨' },
  { name: 'Cục An Toàn Thông Tin (Bộ TT&TT)', number: '156', desc: 'Tổng đài phản ánh tin nhắn & cuộc gọi lừa đảo', icon: '🛡️' },
  { name: 'Phòng An Ninh Mạng A05 (Bộ Công An)', number: '0692196470', desc: 'Tiếp nhận tố giác tội phạm công nghệ cao', icon: '⚖️' },
  { name: 'Cảnh Báo Tin Nhắn Rác / Lừa Đảo', number: '5656', desc: 'Cú pháp SMS gửi miễn phí đến 5656', icon: '💬' },
];

const BANK_HOTLINES = [
  { name: 'Vietcombank', number: '1900545413' },
  { name: 'Techcombank', number: '1800588822' },
  { name: 'BIDV', number: '19009247' },
  { name: 'MB Bank', number: '1900545426' },
  { name: 'Agribank', number: '1900558818' },
  { name: 'VietinBank', number: '1900558868' },
  { name: 'ACB', number: '1900545486' },
  { name: 'VPBank', number: '1900545415' },
];

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [copiedNum, setCopiedNum] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNum(num);
    setTimeout(() => setCopiedNum(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div 
        className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-2xl p-6 sm:p-8 space-y-5 relative shadow-2xl max-h-[90vh] overflow-y-auto my-auto animate-zoom-in"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE9E9] text-[#BA1A1A] flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 id="emergency-modal-title" className="text-xl font-extrabold text-[#1C1B1F]">Đường Dây Nóng Khẩn Cấp</h3>
              <p className="text-xs text-[#44474E]">Liên hệ ngay khi phát hiện hoặc bị lừa đảo tài chính</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full text-[#44474E] hover:text-[#1C1B1F] hover:bg-[#F3F3F7] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Urgent Action Checklist Callout */}
        <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] text-[#410002] text-xs sm:text-sm space-y-2">
          <p className="font-bold text-[#BA1A1A] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#BA1A1A]" />
            CẦN LÀM NGAY TRONG 5 PHÚT ĐẦU KHI BỊ LỪA CHUYỂN TIỀN:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#410002] leading-relaxed">
            <li>Gọi ngay Hotline Ngân hàng của bạn để <strong>yêu cầu khóa khẩn cấp ứng dụng & tài khoản</strong>.</li>
            <li>Lưu lại toàn bộ <strong>ảnh chụp màn hình giao dịch, tin nhắn, số tài khoản kẻ lừa đảo</strong>.</li>
            <li>Đến cơ quan <strong>Công an phường/xã gần nhất</strong> hoặc gọi số 113 để trình báo hồ sơ.</li>
          </ol>
        </div>

        {/* Authorities Hotlines */}
        <div>
          <h4 className="text-xs font-bold text-[#44474E] uppercase tracking-wider mb-2.5">
            Tổng đài cơ quan nhà nước tiếp nhận tố giác:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {EMERGENCY_HOTLINES.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#1C1B1F] flex items-center gap-1">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </p>
                  <p className="text-[11px] text-[#44474E]">{item.desc}</p>
                </div>
                <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                  <a
                    href={`tel:${item.number}`}
                    className="px-3.5 py-2 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white font-bold text-xs shadow-2xs transition focus-visible:ring-2 focus-visible:ring-[#BA1A1A] focus-visible:outline-none flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>{item.number}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Hotlines */}
        <div>
          <h4 className="text-xs font-bold text-[#44474E] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#0061A4]" />
            <span>Hotline Khóa Tài Khoản Ngân Hàng Nhanh:</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BANK_HOTLINES.map((bank, idx) => (
              <div key={idx} className="p-2.5 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] space-y-1 text-center">
                <p className="text-xs font-bold text-[#1C1B1F] truncate">{bank.name}</p>
                <div className="flex items-center justify-center space-x-1">
                  <a
                    href={`tel:${bank.number}`}
                    className="text-xs font-black text-[#0061A4] hover:underline"
                  >
                    {bank.number}
                  </a>
                  <button
                    onClick={() => handleCopy(bank.number)}
                    className="p-1 rounded hover:bg-[#E1E2E9] text-[#44474E] transition cursor-pointer focus-visible:ring-1 focus-visible:ring-[#0061A4] focus-visible:outline-none"
                    title="Sao chép hotline"
                  >
                    {copiedNum === bank.number ? (
                      <Check className="w-3 h-3 text-[#006E00]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#E1E2E9]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold transition shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
