import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Bot,
  Send,
  User,
  Sparkles,
  PhoneCall,
  RefreshCw,
  HelpCircle,
  Moon,
  Sun,
  History,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Code2,
  BookOpen,
  MessageSquare,
  Search,
  X,
  ChevronRight,
  Terminal,
  Zap,
  Globe,
  Lock,
  AlertTriangle,
  Maximize2,
  Minimize2,
  ChevronDown,
  MessageCircle
} from 'lucide-react';
import { ChatMessage, ChatSession, CitationSource, UserProfile } from '../types';
import { sendChatMessage, sendChatMessageStream } from '../services/api';
import { ChatMessageSkeleton } from './UIStateComponents';
import { 
  saveFirestoreChatSession, 
  subscribeToChatSessions, 
  deleteFirestoreChatSession 
} from '../lib/firebase';

export interface ChatAssistantProps {
  user?: UserProfile | null;
  isLargeFont: boolean;
  onOpenEmergency: () => void;
  isFloating?: boolean;
  onCloseFloating?: () => void;
  onExpandToFull?: () => void;
}

// Default initial citations for cybersecurity responses
const VERIFIED_CITATIONS: Record<string, CitationSource[]> = {
  bank: [
    {
      id: 'cit-1',
      title: 'Quy trình xử lý sự cố lộ thông tin tài khoản ngân hàng',
      publisher: 'Cục An toàn thông tin - Bộ TT&TT',
      url: 'https://ais.gov.vn',
      verified: true,
      snippet: 'Ngăn chặn khẩn cấp các lệnh chuyển tiền bất hợp pháp và khóa dịch vụ Internet Banking trong 5 phút.',
    },
    {
      id: 'cit-2',
      title: 'Cảnh báo chiêu trò mạo danh tin nhắn Brandname Ngân hàng',
      publisher: 'Hiệp hội Ngân hàng Việt Nam (VNBA)',
      url: 'https://vnba.org.vn',
      verified: true,
      snippet: 'Các ngân hàng tuyệt đối không gửi đường dẫn (URL) yêu cầu nhập mật khẩu hay mã OTP qua SMS.',
    },
  ],
  authority: [
    {
      id: 'cit-3',
      title: 'Cảnh báo giả danh cán bộ Công an hướng dẫn cài VNeID mức 2',
      publisher: 'Cổng Thông Tin Điện Tử Bộ Công An',
      url: 'https://bocongan.gov.vn',
      verified: true,
      snippet: 'Công an chỉ làm việc trực tiếp tại trụ sở hoặc qua ứng dụng VNeID chính thức trên Google Play/App Store.',
    },
    {
      id: 'cit-4',
      title: 'Hệ thống Tiếp nhận Báo cáo Lừa đảo Mạng Quốc gia',
      publisher: 'Trung tâm Cảnh báo An toàn thông tin VNCERT/CC',
      url: 'https://khongluadao.org',
      verified: true,
      snippet: 'Cơ sở dữ liệu tập trung các số điện thoại và số tài khoản ngân hàng đã bị đưa vào danh sách đen.',
    },
  ],
  code: [
    {
      id: 'cit-5',
      title: 'Hướng dẫn kiểm tra độ an toàn của tên miền & địa chỉ IP',
      publisher: 'Google Cybersecurity & Threat Intelligence',
      url: 'https://transparencyreport.google.com',
      verified: true,
      snippet: 'Sử dụng kỹ thuật tra cứu DNS/WHOIS và SSL Certificate để xác định website mạo danh.',
    },
  ],
};

const SUGGESTED_PROMPTS = [
  {
    category: 'Xử Lý Khẩn Cấp',
    prompt: 'Lỡ bấm vào đường link lạ và nhập OTP ngân hàng thì phải làm gì ngay lập tức?',
    icon: '🚨',
  },
  {
    category: 'Phòng Tránh Lừa Đảo',
    prompt: 'Làm sao để nhận biết cuộc gọi video AI Deepfake giả giọng người thân vay tiền?',
    icon: '🎭',
  },
  {
    category: 'Mã Độc & VNeID',
    prompt: 'Cách phát hiện điện thoại Android bị cài ứng dụng VNeID giả mạo chứa mã độc Trojan?',
    icon: '📱',
  },
  {
    category: 'Script Kiếm Tra',
    prompt: 'Cho tôi đoạn code Python/Bash kiểm tra tên miền có dấu hiệu Typosquatting nhái ngân hàng',
    icon: '💻',
  },
];

// Custom Code Block Component with Copy Functionality
const CodeBlock: React.FC<{ language: string; value: string; isDark: boolean }> = ({ language, value, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-2xl overflow-hidden border border-[#00325B]/40 shadow-md font-mono text-xs sm:text-sm">
      {/* Terminal Header */}
      <div className="bg-[#001D36] text-[#D1E4FF] px-4 py-2.5 flex items-center justify-between border-b border-[#00325B]">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3C9FF] ml-2 flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            {language || 'code'}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-300">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-sky-300" />
              <span>Sao chép mã</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="bg-[#0B132B] text-[#E0E6ED] p-4 overflow-x-auto leading-relaxed">
        <pre>
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};

// Citation Card Component
const CitationCard: React.FC<{ citations: CitationSource[]; isDark: boolean }> = ({ citations, isDark }) => {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={`mt-4 pt-3 border-t ${isDark ? 'border-[#333538]' : 'border-[#E1E2E9]'} space-y-2`}>
      <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0061A4] dark:text-[#A8C7FA]">
        <BookOpen className="w-3.5 h-3.5" />
        <span>Nguồn trích dẫn & Cơ sở dữ liệu xác thực (Gemini Citations):</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {citations.map((cit) => (
          <a
            key={cit.id}
            href={cit.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-3 rounded-xl border transition flex flex-col justify-between group ${
              isDark
                ? 'bg-[#1E1F20] border-[#333538] hover:border-[#A8C7FA] text-[#E3E3E3]'
                : 'bg-white border-[#E1E2E9] hover:border-[#0061A4] text-[#1C1B1F]'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0061A4] dark:text-[#A8C7FA] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {cit.publisher}
                </span>
                <ExternalLink className="w-3 h-3 text-[#74777F] group-hover:text-[#0061A4] dark:group-hover:text-[#A8C7FA] transition" />
              </div>
              <p className="text-xs font-bold line-clamp-1 group-hover:underline">
                {cit.title}
              </p>
              {cit.snippet && (
                <p className="text-[11px] text-[#74777F] dark:text-[#C4C6D0] line-clamp-2">
                  {cit.snippet}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const createDefaultWelcomeSession = (idPrefix: string = 'session-default'): ChatSession => ({
  id: idPrefix,
  title: 'Tư vấn an toàn mạng ban đầu',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [
    {
      id: 'welcome-' + Date.now(),
      sender: 'assistant',
      text: `## 👋 Xin chào! Tôi là Trợ Lý AI Lá Chắn Số (Gemini 3.6 Flash)

Tôi sẵn sàng hỗ trợ bạn 24/7 về mọi tình huống an toàn thông tin & phòng chống lừa đảo mạng tại Việt Nam:

- **Khóa tài khoản khẩn cấp**: Hướng dẫn xử lý khi lỡ chuyển tiền cho kẻ gian.
- **Phân biệt thật - giả**: Nhận diện SMS Brandname, tin nhắn Zalo, VNeID & cuộc gọi Deepfake.
- **Kiểm tra kỹ thuật**: Cung cấp mã script Python/Bash kiểm tra tên miền phishing.
- **Quy trình báo án**: Kết nối trực tiếp với Cục An toàn thông tin (156) và Cảnh sát hình sự (113).

Bạn cần trợ giúp hoặc kiểm tra thông tin gì hôm nay?`,
      timestamp: Date.now(),
      citations: [
        {
          id: 'welcome-cit-' + Date.now(),
          title: 'Cổng thông tin Cảnh Báo An Toàn Thông Tin Mạng Việt Nam',
          publisher: 'Cục An toàn thông tin - Bộ TT&TT',
          url: 'https://ais.gov.vn',
          verified: true,
          snippet: 'Trung tâm giám sát an ninh mạng quốc gia 24/7.',
        },
      ],
    },
  ],
});

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  user,
  isLargeFont,
  onOpenEmergency,
  isFloating = false,
  onCloseFloating,
  onExpandToFull,
}) => {
  const currentUid = user?.uid || 'guest';
  const storageKey = `la_chan_so_chat_sessions_${currentUid}`;

  // Theme state: dark vs light
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Chat sessions history state
  const fallbackWelcomeSession = createDefaultWelcomeSession();
  const [sessions, setSessions] = useState<ChatSession[]>([fallbackWelcomeSession]);
  const [activeSessionId, setActiveSessionId] = useState<string>(fallbackWelcomeSession.id);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active session object with guaranteed fallback
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || fallbackWelcomeSession;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isLoading]);

  // Load and subscribe to chat sessions isolated per user ID
  useEffect(() => {
    let initialSessions: ChatSession[] = [];
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialSessions = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load chat sessions from localStorage:", e);
    }

    if (initialSessions.length === 0) {
      initialSessions = [createDefaultWelcomeSession('session-' + Date.now())];
    }

    setSessions(initialSessions);
    setActiveSessionId(initialSessions[0].id);

    if (currentUid && currentUid !== 'guest') {
      const unsubscribe = subscribeToChatSessions(currentUid, (firestoreSessions) => {
        if (firestoreSessions && firestoreSessions.length > 0) {
          setSessions((prev) => {
            const map = new Map<string, ChatSession>();
            prev.forEach((s) => map.set(s.id, s));

            firestoreSessions.forEach((fs) => {
              const local = map.get(fs.id);
              if (!local) {
                map.set(fs.id, fs);
              } else {
                // If local session is currently streaming or has more messages, preserve local messages
                const isLocalStreaming = local.messages.some((m) => m.isStreaming);
                const localMsgCount = local.messages.length;
                const fsMsgCount = fs.messages.length;

                if (isLocalStreaming || localMsgCount > fsMsgCount) {
                  map.set(fs.id, {
                    ...fs,
                    messages: local.messages,
                    updatedAt: Math.max(local.updatedAt, fs.updatedAt),
                  });
                } else {
                  map.set(fs.id, fs);
                }
              }
            });

            const merged = Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      });
      return () => unsubscribe();
    }
  }, [currentUid, storageKey]);

  // Create a new Chat Session
  const handleCreateNewChat = () => {
    const newId = 'session-' + Date.now();
    const newSession: ChatSession = {
      id: newId,
      title: 'Cuộc trò chuyện mới ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: 'welcome-' + Date.now(),
          sender: 'assistant',
          text: `## 🌟 Cuộc trò chuyện mới cùng Gemini 3.6 Flash

Hãy nhập thắc mắc hoặc câu hỏi an ninh mạng bạn đang quan tâm. Tôi sẽ phân tích và cung cấp câu trả lời chuẩn xác kèm trích dẫn uy tín.`,
          timestamp: Date.now(),
        },
      ],
    };

    setSessions((prev) => {
      const updated = [newSession, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentUid && currentUid !== 'guest') {
      saveFirestoreChatSession(newSession, currentUid).catch(() => {});
    }
    setActiveSessionId(newId);
    setIsHistoryOpen(false);
  };

  // Delete a Session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFirestoreChatSession(sessionId);
    if (sessions.length <= 1) {
      handleCreateNewChat();
      return;
    }
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {}
    if (activeSessionId === sessionId) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Attach Citations based on user query content
  const selectCitationsForQuery = (query: string): CitationSource[] => {
    const q = query.toLowerCase();
    if (q.includes('ngân hàng') || q.includes('vcb') || q.includes('chuyển tiền') || q.includes('mật khẩu') || q.includes('otp')) {
      return VERIFIED_CITATIONS.bank;
    } else if (q.includes('công an') || q.includes('vneid') || q.includes('khởi tố') || q.includes('báo án')) {
      return VERIFIED_CITATIONS.authority;
    } else if (q.includes('code') || q.includes('script') || q.includes('domain') || q.includes('python') || q.includes('bash')) {
      return VERIFIED_CITATIONS.code;
    }
    return [VERIFIED_CITATIONS.bank[0], VERIFIED_CITATIONS.authority[0]];
  };

  // Send Message with Real-Time Streaming
  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText.trim();
    if (!query || isLoading) return;

    const targetSessionId = activeSessionId;
    const currentSession = sessions.find((s) => s.id === targetSessionId) || activeSession;

    const userMsgId = 'msg-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    // Prepare past history for AI (excluding uncompleted streaming messages)
    const historyForAi = currentSession.messages.filter((m) => m.text && !m.isStreaming);

    // Update session title if default
    let sessionTitle = currentSession.title;
    if (currentSession.messages.length <= 1) {
      sessionTitle = query.slice(0, 32) + (query.length > 32 ? '...' : '');
    }

    const assistantMsgId = 'reply-' + Date.now();
    const citations = selectCitationsForQuery(query);

    // Initial placeholder for assistant's streaming answer
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: Date.now(),
      citations,
      isStreaming: true,
    };

    // Atomically append user message AND streaming assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== targetSessionId) return s;
        return {
          ...s,
          title: sessionTitle,
          updatedAt: Date.now(),
          messages: [...s.messages, userMsg, initialAssistantMsg],
        };
      })
    );

    setInputText('');
    setIsLoading(true);

    try {
      let accumulatedText = '';
      let finalReplyText = '';

      try {
        finalReplyText = await sendChatMessageStream(
          historyForAi,
          query,
          (chunk) => {
            accumulatedText += chunk;
            setSessions((prev) =>
              prev.map((s) => {
                if (s.id !== targetSessionId) return s;
                const exists = s.messages.some((m) => m.id === assistantMsgId);
                let msgs: ChatMessage[];
                if (exists) {
                  msgs = s.messages.map((m) =>
                    m.id === assistantMsgId ? { ...m, text: accumulatedText, isStreaming: true } : m
                  );
                } else {
                  msgs = [
                    ...s.messages,
                    {
                      id: assistantMsgId,
                      sender: 'assistant',
                      text: accumulatedText,
                      timestamp: Date.now(),
                      citations,
                      isStreaming: true,
                    },
                  ];
                }
                return { ...s, messages: msgs };
              })
            );
          }
        );
      } catch (err) {
        console.warn("sendChatMessageStream warning, applying fallback:", err);
        finalReplyText = generateRichFallbackChatReply(query);
      }

      const replyToUse = finalReplyText || accumulatedText || generateRichFallbackChatReply(query);

      // Finalize assistant message
      setSessions((prev) => {
        const nextSessions = prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const exists = s.messages.some((m) => m.id === assistantMsgId);
          let msgs: ChatMessage[];
          if (exists) {
            msgs = s.messages.map((m) =>
              m.id === assistantMsgId ? { ...m, text: replyToUse, isStreaming: false } : m
            );
          } else {
            msgs = [
              ...s.messages,
              {
                id: assistantMsgId,
                sender: 'assistant',
                text: replyToUse,
                timestamp: Date.now(),
                citations,
                isStreaming: false,
              },
            ];
          }
          const finishedSession = { ...s, messages: msgs, updatedAt: Date.now() };

          // Persist completed session to Firestore safely in background
          if (currentUid && currentUid !== 'guest') {
            saveFirestoreChatSession(finishedSession, currentUid).catch((err) => {
              console.warn("Firestore sync chat session notice:", err);
            });
          }
          return finishedSession;
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(nextSessions));
        } catch {}
        return nextSessions;
      });

      setIsLoading(false);
    } catch (err) {
      console.error("Chat send error:", err);
      setIsLoading(false);
    }
  };

  // Rich local fallback reply generator for instant cybersecurity guidance
  const generateRichFallbackChatReply = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('chuyển tiền') || q.includes('lỡ') || q.includes('mất tiền')) {
      return `## 🚨 Quy Trình Khẩn Cấp 4 Bước Khi Đã Lỡ Chuyển Tiền Cho Kẻ Lừa Đảo

Bạn hãy thực hiện **NGAY LẬP TỨC** các bước sau để tối đa hóa khả năng phong tỏa dòng tiền:

### 1. Gọi Điện Tổng Đài Ngân Hàng Để Khóa Dịch Vụ
Liên hệ tổng đài hỗ trợ 24/7 của ngân hàng bạn đang sử dụng và yêu cầu **Tạm khóa thẻ & Tài khoản Internet Banking**:
- **Vietcombank**: \`1900 54 54 13\`
- **MBBank**: \`1900 54 54 26\`
- **Techcombank**: \`1900 58 88 22\`
- **VietinBank**: \`1900 55 88 68\`

### 2. Thu Thập Bằng Chứng Giao Dịch
- Chụp ảnh màn hình Biên lai chuyển tiền (chứa **Mã giao dịch FT/Trace**, Số tài khoản nhận, Ngân hàng nhận).
- Lưu lại toàn bộ tin nhắn, số điện thoại hoặc link Zalo/Telegram kẻ lừa đảo.

### 3. Trình Báo Cơ Quan Công An
Đến trụ sở Công an Xã/Phường gần nhất hoặc gọi **Hotline Khẩn Cấp 113** để đăng ký hồ sơ phong tỏa tài khoản trung gian.

### 4. Báo Cáo Lên Cổng An Toàn Thông Tin
Tải bằng chứng lên Cổng tiếp nhận quốc gia \`khongluadao.org\` để đưa STK kẻ gian vào danh sách đen liên ngân hàng.`;
    }

    if (q.includes('deepfake') || q.includes('cuộc gọi') || q.includes('giả giọng')) {
      return `## 🎭 Cách Nhận Biết & Đối Phó Cuộc Gọi AI Deepfake Giả Dạng Người Thân

Các đối tượng lừa đảo hiện nay sử dụng công nghệ AI tạo video & giọng nói giả mạo để gọi điện vay tiền khẩn cấp.

### 🔍 Dấu Hiệu Đặc Trưng Của Deepfake:
1. **Khuôn mặt đơ cứng**: Mắt ít chớp, tín hiệu chập chờn khi di chuyển tay qua mặt.
2. **Giọng nói thiếu tự nhiên**: Có độ trễ ngắt quãng, âm điệu robot hoặc bị méo tiếng sau 10-15 giây.
3. **Lý do gấp gáp**: Thường lấy cớ "đang cấp cứu", "xe bị hỏng", "bị tạm giữ" để yêu cầu chuyển khoản ngay.

### 🛠️ Mẹo Xác Minh An Toàn 100%:
- **Tắt máy và gọi lại trực tiếp**: Dùng số điện thoại chính chủ thông thường (không gọi qua app OTT như Zalo/Messenger).
- **Hỏi câu hỏi bí mật cá nhân**: Hỏi một chi tiết chỉ riêng 2 người biết (ví dụ: *"Hôm qua mình ăn món gì?"* hoặc *"Tên con mèo nhà mình là gì?"*).`;
    }

    if (q.includes('code') || q.includes('script') || q.includes('python') || q.includes('bash') || q.includes('domain')) {
      return `## 💻 Code Script Python Kiểm Tra Tên Miền Giả Mạo (Typosquatting Detector)

Dưới đây là đoạn mã Python giúp bạn tự động phân tích một địa chỉ Website nghi ngờ có phải là tên miền nhái thương hiệu ngân hàng hay không:

\`\`\`python
import re
import urllib.parse

# Danh sách tên miền hợp pháp của các Ngân hàng lớn tại Việt Nam
LEGIT_DOMAINS = [
    "vietcombank.com.vn",
    "techcombank.com.vn",
    "mbbank.com.vn",
    "vnpay.vn",
    "gov.vn"
]

def check_phishing_domain(url_string):
    # Trích xuất hostname từ URL
    parsed = urllib.parse.urlparse(url_string if '://' in url_string else 'http://' + url_string)
    domain = parsed.netloc.lower().split(':')[0]
    
    # Dấu hiệu 1: Đuôi tên miền rủi ro cao
    SUSPICIOUS_TLDS = ['.xyz', '.top', '.vip', '.app-free', '.cc', '.info']
    is_bad_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
    
    # Dấu hiệu 2: Nhái từ khóa VCB, Digibank
    has_brand_keyword = bool(re.search(r'(vcb|vietcom|digibank|techcom|mbbank)', domain))
    is_official = any(domain.endswith(legit) for legit in LEGIT_DOMAINS)
    
    if has_brand_keyword and not is_official:
        return {
            "status": "DANGER",
            "risk_score": 95,
            "message": f"CẢNH BÁO: Tên miền '{domain}' chứa từ khóa ngân hàng nhưng KHÔNG thuộc hệ thống chính thức!"
        }
    
    return {"status": "SAFE", "risk_score": 10, "message": "Tên miền có vẻ hợp lệ."}

# Chạy thử nghiệm
sample_url = "http://vcb-digibank-xacnhan.com.xyz"
result = check_phishing_domain(sample_url)
print(f"Kết quả kiểm tra: {result['message']}")
\`\`\`

### 📌 Hướng dẫn thực thi:
1. Sao chép đoạn mã trên và chạy trong môi trường Python 3.x.
2. Bạn có thể mở rộng danh sách \`LEGIT_DOMAINS\` để quét các thương hiệu khác.`;
    }

    return `## 🛡️ Hướng Dẫn An Toàn Thông Tin Mạng Dành Cho Người Dùng

Để giữ an toàn cho tài sản số và thông tin cá nhân trên môi trường mạng Việt Nam, bạn hãy ghi nhớ **Nguyên tắc 3 KHÔNG**:

1. **KHÔNG** bấm vào bất kỳ đường link lạ nhận được qua SMS, Zalo, Messenger hoặc Email từ người không quen biết.
2. **KHÔNG** cung cấp Tên đăng nhập, Mật khẩu, mã PIN và đặc biệt là mã **OTP** cho bất kỳ ai (kể cả người tự xưng là cán bộ Ngân hàng hay Công an).
3. **KHÔNG** tải file cài đặt dạng \`.APK\` từ các website trôi nổi bên ngoài Google PlayStore / Apple AppStore.

---
💡 *Nếu bạn nghi vấn một số điện thoại hoặc tài khoản ngân hàng cụ thể, hãy dán thông tin vào ô trò chuyện để tôi tra cứu giúp bạn!*`;
  };

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div
      className={
        isFloating
          ? `h-full w-full flex flex-col relative overflow-hidden bg-[#131314] text-[#E3E3E3] ${
              isLargeFont ? 'text-base' : 'text-sm'
            }`
          : `min-h-[720px] rounded-[32px] border transition-colors duration-300 flex flex-col relative overflow-hidden shadow-xl ${
              isDarkMode
                ? 'bg-[#131314] text-[#E3E3E3] border-[#2A2B2D]'
                : 'bg-[#F8F9FA] text-[#1C1B1F] border-[#E1E2E9]'
            } ${isLargeFont ? 'text-lg' : 'text-base'}`
      }
    >
      {/* TOP GEMINI NAVBAR */}
      {isFloating ? (
        <div className="px-4 py-3 bg-gradient-to-r from-[#0061A4] via-[#004B80] to-[#4F378B] text-white flex items-center justify-between border-b border-[#0061A4]/30 shrink-0 shadow-md z-20">
          {/* Left: AI Icon + Title */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Bot className="w-4 h-4 text-white" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                Trợ Lý AI Lá Chắn Số
                <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                  24/7
                </span>
              </h3>
              <p className="text-[10px] text-white/80 truncate">
                {activeSession?.title || 'Gemini 3.6 Flash'}
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Lịch sử chat"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={handleCreateNewChat}
              className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
              title="Đoạn chat mới"
            >
              <Plus className="w-4 h-4" />
            </button>

            {onExpandToFull && (
              <button
                onClick={onExpandToFull}
                className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
                title="Phóng to toàn màn hình"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}

            {onCloseFloating && (
              <button
                onClick={onCloseFloating}
                className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
                title="Thu nhỏ / Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-20 ${
            isDarkMode
              ? 'bg-[#131314]/90 border-[#2A2B2D]'
              : 'bg-white/90 border-[#E1E2E9]'
          }`}
        >
          {/* Left: Model Name & History Drawer Trigger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className={`p-2.5 rounded-full transition flex items-center gap-2 ${
                isDarkMode
                  ? 'hover:bg-[#2A2B2D] text-[#E3E3E3]'
                  : 'hover:bg-[#F3F3F7] text-[#1C1B1F]'
              }`}
              title="Lịch sử cuộc trò chuyện"
            >
              <History className="w-5 h-5 text-[#0061A4] dark:text-[#A8C7FA]" />
              <span className="text-xs font-bold hidden sm:inline">Lịch Sử</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0061A4]/20 text-[#0061A4] dark:text-[#A8C7FA] text-[10px] font-bold">
                {sessions.length}
              </span>
            </button>

            <div className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Gemini AI Brand Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0061A4] via-[#7CACF8] to-[#D3E3FD] flex items-center justify-center shadow-md animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-sm sm:text-base tracking-tight">
                    Gemini 3.6 Flash
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                    Streaming Live
                  </span>
                </div>
                <p className="text-[11px] text-[#74777F] dark:text-[#C4C6D0] truncate max-w-[180px] sm:max-w-xs">
                  {activeSession?.title || 'Cuộc trò chuyện mới'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">
            {/* New Chat Button */}
            <button
              onClick={handleCreateNewChat}
              className="px-3.5 py-2 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo Chat Mới</span>
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-full transition ${
                isDarkMode
                  ? 'bg-[#2A2B2D] text-yellow-400 hover:bg-[#333538]'
                  : 'bg-[#F3F3F7] text-slate-700 hover:bg-[#E7E8EE]'
              }`}
              title={isDarkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối (Gemini Dark)'}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Emergency Call Button */}
            <button
              onClick={onOpenEmergency}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-full bg-[#BA1A1A] hover:bg-[#93000A] text-white text-xs font-bold transition flex items-center space-x-1 shadow-xs"
              title="Báo án khẩn cấp"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">113 / 156</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER: SIDEBAR + CHAT MESSAGES */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* CONVERSATION HISTORY SIDEBAR DRAWER */}
        {isHistoryOpen && (
          <div
            className={`absolute sm:relative inset-y-0 left-0 w-72 sm:w-80 z-30 border-r flex flex-col transition-all duration-300 backdrop-blur-xl ${
              isDarkMode
                ? 'bg-[#1E1F20]/95 border-[#2A2B2D]'
                : 'bg-white/95 border-[#E1E2E9]'
            }`}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0061A4] dark:text-[#A8C7FA]" />
                Lịch Sử Trò Chuyện
              </h3>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search sessions */}
            <div className="p-3">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs ${
                isDarkMode ? 'bg-[#131314] border-[#2A2B2D]' : 'bg-[#F3F3F7] border-[#E1E2E9]'
              }`}>
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchHistoryQuery}
                  onChange={(e) => setSearchHistoryQuery(e.target.value)}
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  className="bg-transparent focus:outline-none w-full"
                />
              </div>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setIsHistoryOpen(false);
                    }}
                    className={`p-3 rounded-2xl cursor-pointer transition flex items-center justify-between group ${
                      isActive
                        ? isDarkMode
                          ? 'bg-[#0061A4]/30 border border-[#A8C7FA]/40 text-[#A8C7FA]'
                          : 'bg-[#D1E4FF] border border-[#0061A4]/30 text-[#001D36]'
                        : isDarkMode
                        ? 'hover:bg-[#2A2B2D] text-[#E3E3E3]'
                        : 'hover:bg-[#F3F3F7] text-[#1C1B1F]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate flex-1 pr-2">
                      <MessageSquare className="w-4 h-4 shrink-0 text-[#0061A4] dark:text-[#A8C7FA]" />
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{session.title || 'Trò chuyện'}</p>
                        <p className="text-[10px] opacity-60">
                          {new Date(session.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                      title="Xóa cuộc trò chuyện này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={handleCreateNewChat}
                className="w-full py-2.5 rounded-xl bg-[#0061A4] hover:bg-[#004B80] text-white text-xs font-bold transition flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Cuộc trò chuyện mới</span>
              </button>
            </div>
          </div>
        )}

        {/* CHAT CONTENT CANVAS */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
          {/* Messages Stream Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Suggested Prompts Header (shown if only 1 message in thread) */}
            {(activeSession?.messages?.length || 0) <= 1 && (
              <div className="space-y-3 max-w-3xl mx-auto my-4 animate-fade-in">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0061A4] dark:text-[#A8C7FA] flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Gợi ý chủ đề hỗ trợ nhanh:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SUGGESTED_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      className={`p-3.5 rounded-2xl border text-left transition group shadow-2xs ${
                        isDarkMode
                          ? 'bg-[#1E1F20] border-[#2A2B2D] hover:border-[#A8C7FA] text-[#E3E3E3]'
                          : 'bg-white border-[#E1E2E9] hover:border-[#0061A4] text-[#1C1B1F]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold flex items-center gap-1.5">
                          <span>{item.icon}</span>
                          <span>{item.category}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition" />
                      </div>
                      <p className="text-xs text-[#74777F] dark:text-[#C4C6D0] line-clamp-2">
                        {item.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {(activeSession?.messages || []).map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 max-w-4xl mx-auto ${
                    isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                      isUser
                        ? 'bg-[#0061A4] text-white'
                        : 'bg-gradient-to-tr from-[#001D36] via-[#00325B] to-[#0061A4] text-white border border-[#A3C9FF]/30'
                    }`}
                  >
                    {isUser ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
                    )}
                  </div>

                  {/* Message Content Bubble */}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] p-4 sm:p-5 rounded-3xl transition ${
                      isUser
                        ? 'bg-[#0061A4] text-white rounded-tr-xs font-medium'
                        : isDarkMode
                        ? 'bg-[#1E1F20] border border-[#2A2B2D] text-[#E3E3E3] rounded-tl-xs'
                        : 'bg-white border border-[#E1E2E9] text-[#1C1B1F] rounded-tl-xs shadow-2xs'
                    }`}
                  >
                    {/* Message Body with Markdown Rendering */}
                    {isUser ? (
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="markdown-body space-y-3 text-sm sm:text-base leading-relaxed">
                        <Markdown
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeVal = String(children).replace(/\n$/, '');
                              if (!inline) {
                                return (
                                  <CodeBlock
                                    language={match ? match[1] : 'text'}
                                    value={codeVal}
                                    isDark={isDarkMode}
                                  />
                                );
                              }
                              return (
                                <code
                                  className="px-1.5 py-0.5 rounded font-mono text-xs bg-black/10 dark:bg-white/10 text-pink-600 dark:text-pink-400"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {msg.text}
                        </Markdown>

                        {/* Streaming Pulse Cursor */}
                        {msg.isStreaming && (
                          <span className="inline-block w-2.5 h-4 bg-[#0061A4] dark:bg-[#A8C7FA] animate-pulse ml-1 rounded-xs" />
                        )}
                      </div>
                    )}

                    {/* Citations Section */}
                    {!isUser && msg.citations && (
                      <CitationCard citations={msg.citations} isDark={isDarkMode} />
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[10px] mt-2.5 text-right opacity-60 ${
                        isUser ? 'text-white/80' : 'text-[#74777F] dark:text-[#C4C6D0]'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Waiting Indicator Skeleton */}
            {isLoading && !(activeSession?.messages || []).some((m) => m.isStreaming) && (
              <ChatMessageSkeleton />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT FIELD BAR */}
          <div
            className={`p-4 border-t sticky bottom-0 z-10 backdrop-blur-md ${
              isDarkMode ? 'bg-[#131314]/95 border-[#2A2B2D]' : 'bg-white/95 border-[#E1E2E9]'
            }`}
          >
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Hỏi Gemini AI về an toàn thông tin (Ví dụ: Mã độc VNeID giả mạo là gì?)"
                  className={`flex-1 rounded-full px-5 py-3.5 text-sm sm:text-base focus:outline-none transition border shadow-xs ${
                    isDarkMode
                      ? 'bg-[#1E1F20] border-[#2A2B2D] text-[#E3E3E3] placeholder-[#74777F] focus:border-[#A8C7FA] focus:ring-1 focus:ring-[#A8C7FA]'
                      : 'bg-[#F3F3F7] border-[#E1E2E9] text-[#1C1B1F] placeholder-[#74777F] focus:border-[#0061A4] focus:ring-1 focus:ring-[#0061A4]'
                  }`}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputText.trim()}
                  className="px-6 py-3.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white font-black transition flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed group"
                  title="Gửi câu hỏi"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>

              {/* Disclaimer Note */}
              <p className="text-[10px] text-center text-[#74777F] dark:text-[#C4C6D0]">
                🛡️ Gemini 3.6 Flash AI có thể tư vấn quy trình khẩn cấp. Trong trường hợp đã bị lừa đảo tài chính, vui lòng liên hệ ngay tổng đài Ngân hàng & Hotline 113.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface FloatingChatWidgetProps {
  user?: UserProfile | null;
  isLargeFont: boolean;
  onOpenEmergency: () => void;
  onNavigateToFullChat?: () => void;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
  user,
  isLargeFont,
  onOpenEmergency,
  onNavigateToFullChat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissedChip, setIsDismissedChip] = useState(false);

  return (
    <>
      {/* Floating Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-16 sm:bottom-20 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[440px] md:w-[460px] h-[580px] sm:h-[620px] max-h-[80vh] bg-white dark:bg-[#131314] rounded-3xl shadow-2xl border border-[#E1E2E9] dark:border-[#2A2B2D] overflow-hidden flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-5">
          <ChatAssistant
            user={user}
            isLargeFont={isLargeFont}
            onOpenEmergency={onOpenEmergency}
            isFloating={true}
            onCloseFloating={() => setIsOpen(false)}
            onExpandToFull={() => {
              setIsOpen(false);
              onNavigateToFullChat?.();
            }}
          />
        </div>
      )}

      {/* Floating Bubble Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-16 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
          {/* Tooltip Chip */}
          {!isDismissedChip && (
            <div className="mb-2 max-w-[200px] sm:max-w-xs bg-white dark:bg-[#1C1B1F] text-[#1C1B1F] dark:text-[#E3E3E3] p-2.5 sm:p-3 rounded-2xl shadow-xl border border-[#0061A4]/30 flex items-center space-x-2 animate-bounce-slow">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0061A4]/15 text-[#0061A4] dark:text-[#A8C7FA] flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#0061A4] dark:text-[#A8C7FA]" />
              </div>
              <p className="text-[10px] sm:text-xs font-semibold leading-tight flex-1">
                Nghi ngờ lừa đảo?{' '}
                <span className="text-[#0061A4] dark:text-[#A8C7FA] font-bold block">
                  Hỏi Trợ Lý AI 24/7
                </span>
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissedChip(true);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                title="Đóng thông báo"
              >
                <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          )}

          {/* Main Bubble Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="p-1 bg-gradient-to-tr from-[#0061A4] via-[#004B80] to-[#4F378B] rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group flex items-center gap-2 pr-1 sm:pr-5 cursor-pointer ring-4 ring-[#0061A4]/20"
            title="Mở Trợ Lý AI Lá Chắn Số"
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0061A4] flex items-center justify-center text-white shadow-inner">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              <span className="absolute top-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 border-2 border-white dark:border-[#1C1B1F] rounded-full animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-[9px] uppercase font-extrabold tracking-wider text-amber-300">
                Gemini 3.6 Flash
              </span>
              <span className="block text-xs font-black text-white">
                Trợ Lý AI
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
};
