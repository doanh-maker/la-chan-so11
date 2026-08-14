import React, { useState, useEffect } from 'react';
import { User, LogIn, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await signInWithGoogle();
      onLoginSuccess(loggedUser);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-md p-6 sm:p-8 space-y-5 relative shadow-2xl my-auto animate-zoom-in"
      >
        <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-[#0061A4]" />
            <h3 id="auth-modal-title" className="text-xl font-extrabold text-[#1C1B1F]">Đăng Nhập Lá Chắn Số AI</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-[#44474E] hover:text-[#1C1B1F] rounded-full hover:bg-[#F3F3F7] transition cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-3 py-2">
          <div className="w-16 h-16 rounded-2xl bg-[#D1E4FF] text-[#001D36] flex items-center justify-center mx-auto shadow-2xs">
            <User className="w-8 h-8 text-[#0061A4]" />
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-[#1C1B1F]">Đăng nhập tài khoản Google</h4>
            <p className="text-xs text-[#44474E] mt-1 leading-relaxed">
              Đồng bộ lịch sử quét, lưu báo cáo lừa đảo cộng đồng và nhận thông báo cảnh báo nguy hiểm kịp thời.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoggingIn}
            className="w-full py-3.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] font-bold text-sm transition flex items-center justify-center space-x-2 border border-[#E1E2E9] shadow-2xs disabled:opacity-50 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggingIn ? 'Đang kết nối...' : 'Tiếp tục với Google'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] text-[11px] text-[#006E00] space-y-1">
          <p className="font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006E00]" />
            Cam kết bảo mật dữ liệu:
          </p>
          <p>
            Chúng tôi tuân thủ các quy định an toàn thông tin cá nhân. Thông tin của bạn không bao giờ bị chia sẻ cho bên thứ ba.
          </p>
        </div>
      </div>
    </div>
  );
};
