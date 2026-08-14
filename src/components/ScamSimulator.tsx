import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Award,
  AlertTriangle,
  Send,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PhoneCall,
  ExternalLink,
  Download,
  KeyRound,
  CreditCard,
  Flame,
  Zap,
  Info,
  ChevronRight,
  Share2,
  MessageSquare,
  Lock,
  Search,
  PlusCircle,
  X
} from 'lucide-react';
import { PRESET_SCAM_SCENARIOS } from '../data/simulatorScenarios';
import { ScamScenario, SimulatorChatMessage, SimulationSession, SimulatorDifficulty } from '../types';

interface ScamSimulatorProps {
  isLargeFont?: boolean;
  onOpenEmergency?: () => void;
  onNavigateToScanner?: () => void;
}

export const ScamSimulator: React.FC<ScamSimulatorProps> = ({
  isLargeFont = false,
  onOpenEmergency = () => {},
  onNavigateToScanner = () => {},
}) => {
  // Navigation inside simulator: 'library' | 'session' | 'debrief'
  const [viewState, setViewState] = useState<'library' | 'session' | 'debrief'>('library');

  // Scenario selection & filters
  const [scenarios, setScenarios] = useState<ScamScenario[]>(PRESET_SCAM_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState<ScamScenario>(PRESET_SCAM_SCENARIOS[0]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom scenario generation modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  // Active Session State
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [latestCoachAdvice, setLatestCoachAdvice] = useState<string>('');
  const [latestTrapName, setLatestTrapName] = useState<string>('');
  const [latestSeverity, setLatestSeverity] = useState<'SAFE_DEFENSE' | 'WARNING' | 'DANGER'>('SAFE_DEFENSE');

  // Interactive Bait Modal State (e.g. if user clicks simulated fake link or APK)
  const [activeBaitPrompt, setActiveBaitPrompt] = useState<{
    type: 'link' | 'otp' | 'transfer' | 'apk';
    title: string;
    payload?: string;
  } | null>(null);
  const [fakeOtpValue, setFakeOtpValue] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (viewState === 'session') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages, isLoadingAi]);

  // Start a new simulation session
  const handleStartSimulation = (scenario: ScamScenario) => {
    setSelectedScenario(scenario);

    const initialMsg: SimulatorChatMessage = {
      id: 'msg-0',
      sender: 'scammer',
      text: scenario.initialMessage,
      timestamp: Date.now(),
    };

    const newSession: SimulationSession = {
      id: 'sim-' + Date.now(),
      scenario,
      score: 100,
      status: 'IN_PROGRESS',
      messages: [initialMsg],
      trapsAvoided: 0,
      totalTrapsEncountered: 1,
      vulnerabilitiesDetected: [],
      strengthsObserved: [],
      startedAt: Date.now(),
    };

    setSession(newSession);
    setSuggestedReplies(scenario.winningTips || []);
    setLatestCoachAdvice('Kẻ xấu vừa gửi tin nhắn mồi nhử. Hãy bình tĩnh phân tích các dấu hiệu bất thường và phản hồi an toàn!');
    setLatestTrapName(scenario.psychologicalTricks[0] || 'Mồi nhử ban đầu');
    setLatestSeverity('WARNING');
    setViewState('session');
  };

  // Send message or trigger action in simulation
  const handleSendResponse = async (
    userTextToSend: string,
    actionTriggered?: { type: 'CLICKED_LINK' | 'ENTERED_OTP' | 'TRANSFERRED_MONEY' | 'DOWNLOADED_APK' | 'REJECTED_TRAP'; payload?: string }
  ) => {
    if (!session || (!userTextToSend.trim() && !actionTriggered) || isLoadingAi) return;

    const userMsg: SimulatorChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userTextToSend.trim() || (actionTriggered ? `[Đã thực hiện: ${actionTriggered.type}]` : ''),
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, userMsg];
    setSession({
      ...session,
      messages: updatedMessages,
    });
    setInputText('');
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/simulate-scam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: session.scenario,
          messages: updatedMessages,
          userMessage: userTextToSend,
          actionTaken: actionTriggered,
        }),
      });

      if (!response.ok) {
        throw new Error('Lỗi máy chủ mô phỏng AI');
      }

      const data = await response.json();

      // Evaluate score changes
      const scoreDelta = data.coachEvaluation?.scoreDelta || 0;
      const newScore = Math.max(0, Math.min(100, session.score + scoreDelta));

      // Build scammer response message
      const scammerMsg: SimulatorChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'scammer',
        text: data.scammerResponse || '...',
        timestamp: Date.now() + 1,
        trapAlert: {
          triggered: data.coachEvaluation?.threatDetected || false,
          trapType: data.coachEvaluation?.trapName || 'Thủ đoạn tâm lý',
          explanation: data.coachEvaluation?.coachAdvice || '',
          severity: data.coachEvaluation?.severity || 'SAFE_DEFENSE',
        },
        interactiveAction: data.actionBait && data.actionBait.type !== 'none'
          ? {
              type: data.actionBait.type,
              title: data.actionBait.title || 'Hành động giả lập',
              payload: data.actionBait.payload,
            }
          : undefined,
      };

      const finalMessages = [...updatedMessages, scammerMsg];

      // Update strengths / vulnerabilities
      const newVulnerabilities = [...session.vulnerabilitiesDetected];
      const newStrengths = [...session.strengthsObserved];

      if (scoreDelta < -10 && data.coachEvaluation?.trapName) {
        if (!newVulnerabilities.includes(data.coachEvaluation.trapName)) {
          newVulnerabilities.push(data.coachEvaluation.trapName);
        }
      } else if (scoreDelta > 10) {
        const strength = 'Phản xạ cảnh giác trước bẫy ' + (data.coachEvaluation?.trapName || 'lừa đảo');
        if (!newStrengths.includes(strength)) {
          newStrengths.push(strength);
        }
      }

      const isEnded = data.coachEvaluation?.isSimulationEnded || newScore <= 20 || finalMessages.length >= 10;
      const finalStatus = isEnded
        ? newScore >= 60
          ? 'DEFENDED_SUCCESS'
          : 'TRAPPED'
        : 'IN_PROGRESS';

      const updatedSession: SimulationSession = {
        ...session,
        score: newScore,
        status: finalStatus,
        messages: finalMessages,
        trapsAvoided: session.trapsAvoided + (scoreDelta >= 0 ? 1 : 0),
        totalTrapsEncountered: session.totalTrapsEncountered + 1,
        vulnerabilitiesDetected: newVulnerabilities,
        strengthsObserved: newStrengths,
        aiCoachDebrief: data.coachEvaluation?.coachAdvice,
        completedAt: isEnded ? Date.now() : undefined,
      };

      setSession(updatedSession);
      setSuggestedReplies(data.suggestedReplies || []);
      setLatestCoachAdvice(data.coachEvaluation?.coachAdvice || 'Tiếp tục giữ vững cảnh giác!');
      setLatestTrapName(data.coachEvaluation?.trapName || 'Bẫy đàm phán');
      setLatestSeverity(data.coachEvaluation?.severity || 'SAFE_DEFENSE');

      if (isEnded) {
        setTimeout(() => {
          setViewState('debrief');
        }, 1500);
      }
    } catch (error) {
      console.error('Lỗi phản hồi giả lập:', error);
      setLatestCoachAdvice('Mất kết nối với mô hình AI mô phỏng. Hãy thử gửi lại câu trả lời.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Generate Custom Scenario by User Prompt
  const handleGenerateCustom = async () => {
    if (!customPrompt.trim() || isGeneratingCustom) return;
    setIsGeneratingCustom(true);
    try {
      const res = await fetch('/api/generate-custom-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customPrompt }),
      });
      if (!res.ok) throw new Error('Không thể tạo kịch bản');
      const newScenario: ScamScenario = await res.json();
      setScenarios([newScenario, ...scenarios]);
      setIsCustomModalOpen(false);
      setCustomPrompt('');
      handleStartSimulation(newScenario);
    } catch (err) {
      alert('Không thể tạo kịch bản AI lúc này. Vui lòng thử lại với mô tả ngắn gọn hơn.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Filter Scenarios
  const filteredScenarios = scenarios.filter((s) => {
    const matchCategory = filterCategory === 'ALL' || s.category === filterCategory;
    const matchDifficulty = filterDifficulty === 'ALL' || s.difficulty === filterDifficulty;
    const matchSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.attackerPersona.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchDifficulty && matchSearch;
  });

  // Calculate score colors & badges
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#006E00] bg-[#E8F5E9] border-[#A5D6A7]';
    if (score >= 50) return 'text-[#B26A00] bg-[#FFF8E1] border-[#FFE082]';
    return 'text-[#BA1A1A] bg-[#FFDAD6] border-[#FFB4AB]';
  };

  const getDifficultyBadge = (diff: SimulatorDifficulty) => {
    switch (diff) {
      case 'EASY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#006E00] border border-[#C8E6C9]">Dễ (Cơ bản)</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF8E1] text-[#B26A00] border border-[#FFE082]">Trung Bình</span>;
      case 'HARD':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFDAD6] text-[#BA1A1A] border border-[#FFB4AB]">Khó (Cao cấp)</span>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'zalo':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0068FF]/10 text-[#0068FF] border border-[#0068FF]/20">Zalo</span>;
      case 'telegram':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#229ED9]/10 text-[#229ED9] border border-[#229ED9]/20">Telegram</span>;
      case 'sms':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#4CAF50]/10 text-[#2E7D32] border border-[#81C784]">SMS Brandname</span>;
      case 'facebook':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/20">Facebook Messenger</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#6750A4]/10 text-[#6750A4] border border-[#6750A4]/20">Cuộc Gọi</span>;
    }
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0061A4] via-[#004B80] to-[#1D192B] rounded-[32px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>Đấu Trường Phản Xạ An Ninh Số • Gemini 3.6 Sandbox</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Giả Lập Bẫy Lừa Đảo AI (AI Scam Simulator)
            </h1>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Trải nghiệm thực chiến đối đầu 1-1 với kẻ lừa đảo do AI đóng vai trong môi trường an toàn tuyệt đối. Được Cố Vấn An Ninh AI chấm điểm phản xạ, chỉ ra bẫy tâm lý và rèn luyện kỹ năng bảo vệ tài sản số.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {viewState !== 'library' && (
              <button
                onClick={() => setViewState('library')}
                className="px-5 py-3 rounded-full font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thư Viện Kịch Bản</span>
              </button>
            )}

            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="px-6 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-[#1C1B1F] shadow-lg transition flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#1C1B1F]" />
              <span>Tạo Kịch Bản Tùy Chọn</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SCENARIO LIBRARY & SELECTION                                      */}
      {/* ========================================================================= */}
      {viewState === 'library' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-[#E1E2E9] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#74777F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kịch bản lừa đảo..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#C4C6D0] text-xs sm:text-sm focus:outline-none focus:border-[#0061A4] focus:ring-1 focus:ring-[#0061A4]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setFilterDifficulty('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterDifficulty === 'ALL'
                    ? 'bg-[#0061A4] text-white shadow-xs'
                    : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E1E2E9]'
                }`}
              >
                Tất cả độ khó
              </button>
              <button
                onClick={() => setFilterDifficulty('EASY')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterDifficulty === 'EASY'
                    ? 'bg-[#006E00] text-white shadow-xs'
                    : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E1E2E9]'
                }`}
              >
                Cơ bản (Dễ)
              </button>
              <button
                onClick={() => setFilterDifficulty('MEDIUM')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterDifficulty === 'MEDIUM'
                    ? 'bg-[#B26A00] text-white shadow-xs'
                    : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E1E2E9]'
                }`}
              >
                Trung bình
              </button>
              <button
                onClick={() => setFilterDifficulty('HARD')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  filterDifficulty === 'HARD'
                    ? 'bg-[#BA1A1A] text-white shadow-xs'
                    : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E1E2E9]'
                }`}
              >
                Nâng cao (Khó)
              </button>
            </div>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-white rounded-[28px] border border-[#E1E2E9] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group hover:border-[#0061A4]/40"
              >
                {scenario.isCustom && (
                  <div className="absolute top-3 right-3 bg-purple-100 text-purple-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-purple-200">
                    AI Custom
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    {getDifficultyBadge(scenario.difficulty)}
                    {getPlatformIcon(scenario.platform)}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-[#1C1B1F] group-hover:text-[#0061A4] transition leading-snug line-clamp-2">
                      {scenario.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#44474E] line-clamp-3 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Attacker Persona Box */}
                  <div className="bg-[#F8F9FC] border border-[#E1E2E9] rounded-2xl p-3 flex items-center space-x-3">
                    <img
                      src={scenario.attackerAvatar}
                      alt={scenario.attackerPersona}
                      className="w-10 h-10 rounded-full object-cover border border-[#C4C6D0]"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#74777F] font-medium">Kẻ mạo danh đóng vai:</p>
                      <p className="text-xs font-bold text-[#1C1B1F] truncate">{scenario.attackerPersona}</p>
                    </div>
                  </div>

                  {/* Red Flags preview */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-bold text-[#BA1A1A] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Các bẫy nguy hiểm cần vượt qua:</span>
                    </p>
                    <ul className="text-xs text-[#44474E] space-y-1">
                      {scenario.trapTriggers.slice(0, 2).map((trap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-red-500 font-bold">•</span>
                          <span className="line-clamp-1">{trap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Action Button */}
                <button
                  onClick={() => handleStartSimulation(scenario)}
                  className="w-full py-3.5 px-4 rounded-full font-bold text-xs sm:text-sm bg-[#0061A4] hover:bg-[#004B80] text-white shadow-md transition flex items-center justify-center space-x-2 group-hover:scale-[1.02] cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Bắt Đầu Thử Thách Phòng Thủ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ACTIVE 1-ON-1 INTERACTIVE SIMULATION SANDBOX                      */}
      {/* ========================================================================= */}
      {viewState === 'session' && session && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Simulated Chat Window (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-[32px] border border-[#E1E2E9] shadow-lg flex flex-col h-[700px] overflow-hidden">
            {/* Sandbox Chat Header */}
            <div className="bg-[#F8F9FD] border-b border-[#E1E2E9] p-4 sm:px-6 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={session.scenario.attackerAvatar}
                    alt={session.scenario.attackerPersona}
                    className="w-11 h-11 rounded-full object-cover border-2 border-red-400"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B1F] truncate">
                      {session.scenario.attackerPersona}
                    </h3>
                    {getPlatformIcon(session.scenario.platform)}
                  </div>
                  <p className="text-[11px] text-[#BA1A1A] font-semibold truncate flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Giả lập: {session.scenario.title}</span>
                  </p>
                </div>
              </div>

              {/* Safety Score Meter in Top Bar */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-black flex items-center space-x-1.5 ${getScoreColor(session.score)}`}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Điểm An Toàn: {session.score}/100</span>
                </div>

                <button
                  onClick={() => setViewState('debrief')}
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-[#BA1A1A] bg-[#FFDAD6] hover:bg-[#FFB4AB] transition cursor-pointer"
                >
                  Kết Thúc Sớm
                </button>
              </div>
            </div>

            {/* Chat Body Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F5F6FA]">
              {/* Simulation Safety Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center text-xs text-amber-800 flex items-center justify-center space-x-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Đây là môi trường giả lập an toàn do AI điều khiển. Mọi thông tin nhập vào sẽ không bị lưu trữ hay gửi ra ngoài.</span>
              </div>

              {session.messages.map((msg) => {
                const isScammer = msg.sender === 'scammer';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isScammer ? 'justify-start' : 'justify-end'}`}
                  >
                    {isScammer && (
                      <img
                        src={session.scenario.attackerAvatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-[#C4C6D0] shrink-0 mt-1"
                      />
                    )}

                    <div className="max-w-[85%] sm:max-w-[75%] space-y-2">
                      <div
                        className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                          isScammer
                            ? 'bg-white text-[#1C1B1F] border border-[#E1E2E9] rounded-tl-xs'
                            : 'bg-[#0061A4] text-white rounded-tr-xs'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Interactive Bait Card (if scammer sent a link/OTP/APK trap) */}
                      {msg.interactiveAction && (
                        <div className="bg-[#FFF4E5] border-2 border-amber-300 rounded-2xl p-3.5 shadow-sm space-y-2.5">
                          <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-xs">
                            <Flame className="w-4 h-4 text-amber-600 animate-bounce" />
                            <span>BẪY TƯƠNG TÁC TỪ KẺ LỪA ĐẢO:</span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.interactiveAction.type === 'link' && (
                              <button
                                onClick={() =>
                                  setActiveBaitPrompt({
                                    type: 'link',
                                    title: 'Bấm vào đường liên kết nghi vấn',
                                    payload: msg.interactiveAction?.payload || 'https://vietcombank-xacminh.com',
                                  })
                                }
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{msg.interactiveAction.title || 'Truy Cập Link Giả'}</span>
                              </button>
                            )}

                            {msg.interactiveAction.type === 'apk_download' && (
                              <button
                                onClick={() =>
                                  setActiveBaitPrompt({
                                    type: 'apk',
                                    title: 'Tải tệp tin cài đặt .APK lạ',
                                    payload: msg.interactiveAction?.payload || 'DinhDanhDienTu_v2.apk',
                                  })
                                }
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{msg.interactiveAction.title || 'Tải File Cài Đặt .APK'}</span>
                              </button>
                            )}

                            {msg.interactiveAction.type === 'otp_request' && (
                              <button
                                onClick={() =>
                                  setActiveBaitPrompt({
                                    type: 'otp',
                                    title: 'Cung cấp mã Smart OTP / SMS OTP',
                                  })
                                }
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>{msg.interactiveAction.title || 'Nhập Mã OTP Ngân Hàng'}</span>
                              </button>
                            )}

                            {msg.interactiveAction.type === 'transfer_request' && (
                              <button
                                onClick={() =>
                                  setActiveBaitPrompt({
                                    type: 'transfer',
                                    title: 'Chuyển tiền vào số tài khoản cá nhân',
                                    payload: msg.interactiveAction?.payload || '190382928192 - Nguyen Van B',
                                  })
                                }
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{msg.interactiveAction.title || 'Xác Nhận Chuyển Tiền'}</span>
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleSendResponse(
                                  'Tôi kiên quyết từ chối thực hiện yêu cầu này vì đây là dấu hiệu lừa đảo chiếm đoạt tài sản!',
                                  { type: 'REJECTED_TRAP' }
                                )
                              }
                              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Từ Chối & Vạch Mặt</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoadingAi && (
                <div className="flex items-center space-x-2 text-xs text-[#74777F] italic p-2">
                  <Bot className="w-4 h-4 animate-spin text-[#0061A4]" />
                  <span>Kẻ lừa đảo đang soạn tin nhắn phản hồi...</span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestion Reply Pills */}
            {suggestedReplies.length > 0 && (
              <div className="bg-white px-4 py-2.5 border-t border-[#E1E2E9] flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-bold text-[#74777F] shrink-0">Gợi ý phản biện:</span>
                {suggestedReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendResponse(reply)}
                    disabled={isLoadingAi}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E8DEF8] hover:bg-[#D0BCFF] text-[#1D192B] border border-[#CAC4D0] transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-3 sm:p-4 bg-white border-t border-[#E1E2E9] flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendResponse(inputText);
                  }
                }}
                placeholder="Nhập câu trả lời hoặc câu hỏi đối chất với kẻ xấu..."
                disabled={isLoadingAi}
                className="flex-1 px-4 py-3 rounded-full border border-[#C4C6D0] text-xs sm:text-sm focus:outline-none focus:border-[#0061A4] focus:ring-1 focus:ring-[#0061A4]"
              />

              <button
                onClick={() => handleSendResponse(inputText)}
                disabled={isLoadingAi || !inputText.trim()}
                className="p-3.5 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white shadow-md disabled:opacity-50 transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Live AI Security Coach Radar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* AI Security Coach Box */}
            <div className="bg-white rounded-[32px] border border-[#E1E2E9] p-5 sm:p-6 shadow-md space-y-4 relative overflow-hidden">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0061A4] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#1C1B1F]">
                    Cố Vấn An Ninh AI (Radar)
                  </h3>
                  <p className="text-[11px] text-[#74777F]">Phân tích tâm lý theo thời gian thực</p>
                </div>
              </div>

              {/* Status Alert */}
              <div className={`p-4 rounded-2xl border ${
                latestSeverity === 'SAFE_DEFENSE'
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : latestSeverity === 'WARNING'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              } space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {latestSeverity === 'SAFE_DEFENSE' ? '🛡️ Phản Xạ An Toàn' : latestSeverity === 'WARNING' ? '⚠️ Cảnh Giác Bẫy' : '🚨 Cực Kỳ Nguy Hiểm'}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70">
                    {latestTrapName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {latestCoachAdvice}
                </p>
              </div>

              {/* Psychological Tricks Breakdown */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#1C1B1F] uppercase tracking-wider">
                  Chiêu trò tâm lý kẻ xấu đang dùng:
                </h4>
                <div className="space-y-1.5">
                  {session.scenario.psychologicalTricks.map((trick, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-[#44474E]">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{trick}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defense Rules */}
              <div className="pt-2 border-t border-[#E1E2E9] space-y-2">
                <h4 className="text-xs font-bold text-[#006E00] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Quy tắc phòng thủ bất biến:</span>
                </h4>
                <ul className="text-xs text-[#44474E] space-y-1">
                  <li>• Không đọc mã OTP / Mật khẩu cho bất kỳ ai</li>
                  <li>• Không bấm link lạ hoặc tải file .APK ngoài Store</li>
                  <li>• Không chuyển tiền vào STK cá nhân người lạ</li>
                </ul>
              </div>

              <button
                onClick={onOpenEmergency}
                className="w-full py-3 px-4 rounded-2xl bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] font-bold text-xs flex items-center justify-center space-x-2 border border-[#FFDAD6] transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 text-[#BA1A1A]" />
                <span>Báo Cáo Sự Cố Hotline 113/156</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SIMULATION DEBRIEF & DEFENSE CERTIFICATE                          */}
      {/* ========================================================================= */}
      {viewState === 'debrief' && session && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Certificate Hero Box */}
          <div className="bg-white rounded-[36px] border-2 border-[#0061A4]/30 p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#D1E4FF]/40 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg bg-gradient-to-br from-[#0061A4] to-[#004B80] text-white">
                {session.score >= 60 ? (
                  <Award className="w-10 h-10 text-amber-300" />
                ) : (
                  <ShieldAlert className="w-10 h-10 text-red-300" />
                )}
              </div>

              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0061A4]/10 text-[#0061A4] font-black text-xs">
                <span>CHỨNG NHẬN PHẢN XẠ AN NINH SỐ</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#1C1B1F]">
                {session.score >= 80
                  ? '🏆 Phòng Thủ Xuất Sắc — Bất Khả Xâm Phạm!'
                  : session.score >= 50
                  ? '🛡️ Phòng Thủ Đạt Chuẩn — Cần Thêm Cảnh Giác'
                  : '🚨 Cảnh Báo: Bạn Đã Bị Sập Bẫy Lừa Đảo!'}
              </h2>

              <p className="text-xs sm:text-sm text-[#44474E]">
                Thử thách kịch bản: <strong className="text-[#1C1B1F]">{session.scenario.title}</strong>
              </p>
            </div>

            {/* Score & Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="bg-[#F8F9FD] border border-[#E1E2E9] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#74777F] font-bold">Điểm An Toàn Số</p>
                <p className={`text-3xl font-black mt-1 ${session.score >= 60 ? 'text-[#006E00]' : 'text-[#BA1A1A]'}`}>
                  {session.score}<span className="text-base font-normal">/100</span>
                </p>
              </div>

              <div className="bg-[#F8F9FD] border border-[#E1E2E9] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#74777F] font-bold">Bẫy Đã Hóa Giải</p>
                <p className="text-3xl font-black text-[#0061A4] mt-1">
                  {session.trapsAvoided}/{session.totalTrapsEncountered}
                </p>
              </div>

              <div className="bg-[#F8F9FD] border border-[#E1E2E9] rounded-2xl p-4 text-center">
                <p className="text-xs text-[#74777F] font-bold">Xếp Hạng Phản Xạ</p>
                <p className="text-sm font-extrabold text-[#6750A4] mt-2.5">
                  {session.score >= 85 ? 'Khiên Vàng Cấp 5' : session.score >= 60 ? 'Khiên Bạc Cấp 3' : 'Cần Huấn Luyện Lại'}
                </p>
              </div>
            </div>

            {/* Strengths & Vulnerabilities Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-green-900 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Điểm mạnh đã thể hiện:</span>
                </h4>
                <ul className="text-xs text-green-950 space-y-2">
                  {session.strengthsObserved.length > 0 ? (
                    session.strengthsObserved.map((s, i) => <li key={i}>• {s}</li>)
                  ) : (
                    <li>• Đã giữ được sự bình tĩnh trong các lượt đối thoại</li>
                  )}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-red-900 uppercase flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Lỗ hổng tâm lý cần khắc phục:</span>
                </h4>
                <ul className="text-xs text-red-950 space-y-2">
                  {session.vulnerabilitiesDetected.length > 0 ? (
                    session.vulnerabilitiesDetected.map((v, i) => <li key={i}>• Dễ bị dẫn dắt bởi bẫy: {v}</li>)
                  ) : (
                    <li>• Không phát hiện lỗ hổng nguy hiểm đáng kể</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => handleStartSimulation(session.scenario)}
                className="px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-white hover:bg-[#F3F3F7] text-[#1C1B1F] border border-[#C4C6D0] transition flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thực Hiện Lại Kịch Bản Này</span>
              </button>

              <button
                onClick={() => setViewState('library')}
                className="px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#0061A4] hover:bg-[#004B80] text-white shadow-md transition flex items-center space-x-2 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Thử Thách Kịch Bản Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE BAIT PROMPT (Simulated Trap Trigger)                  */}
      {/* ========================================================================= */}
      {activeBaitPrompt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-5 animate-scale-in border border-red-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-extrabold text-base text-[#1C1B1F]">
                {activeBaitPrompt.title}
              </h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 leading-relaxed">
              Bạn đang định thực hiện một hành động mà kẻ lừa đảo yêu cầu ({activeBaitPrompt.payload || ''}). Trong thực tế, đây là bước kẻ xấu chiếm đoạt tiền hoặc chiếm quyền kiểm soát thiết bị của bạn!
            </div>

            {activeBaitPrompt.type === 'otp' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1C1B1F]">Nhập mã OTP giả lập:</label>
                <input
                  type="text"
                  maxLength={6}
                  value={fakeOtpValue}
                  onChange={(e) => setFakeOtpValue(e.target.value)}
                  placeholder="Ví dụ: 829103"
                  className="w-full px-4 py-2.5 border border-[#C4C6D0] rounded-xl text-center text-lg font-mono font-bold tracking-widest"
                />
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveBaitPrompt(null)}
                className="px-4 py-2.5 rounded-full text-xs font-bold text-[#44474E] bg-[#F3F3F7] hover:bg-[#E1E2E9] cursor-pointer"
              >
                Hủy / Nhận ra bẫy
              </button>

              <button
                onClick={() => {
                  const type = activeBaitPrompt.type;
                  setActiveBaitPrompt(null);
                  if (type === 'link') {
                    handleSendResponse('Tôi đã vừa bấm vào đường liên kết bạn gửi.', {
                      type: 'CLICKED_LINK',
                      payload: activeBaitPrompt.payload,
                    });
                  } else if (type === 'apk') {
                    handleSendResponse('Tôi đã vừa tải và cài đặt tệp tin .apk bạn gửi.', {
                      type: 'DOWNLOADED_APK',
                      payload: activeBaitPrompt.payload,
                    });
                  } else if (type === 'otp') {
                    handleSendResponse(`Mã OTP của tôi là ${fakeOtpValue || '938201'}.`, {
                      type: 'ENTERED_OTP',
                      payload: fakeOtpValue,
                    });
                  } else if (type === 'transfer') {
                    handleSendResponse('Tôi đã chuyển tiền thành công vào số tài khoản bạn yêu cầu.', {
                      type: 'TRANSFERRED_MONEY',
                      payload: activeBaitPrompt.payload,
                    });
                  }
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md cursor-pointer"
              >
                Vẫn Tiếp Tục Thử (Chấp Nhận Bị Phạt Điểm)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CUSTOM SCENARIO GENERATOR WITH GEMINI AI                         */}
      {/* ========================================================================= */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-lg text-[#1C1B1F]">
                  Tạo Kịch Bản Giả Lập Tùy Chọn Bằng AI
                </h3>
              </div>
              <button
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1 rounded-full text-[#74777F] hover:bg-[#F3F3F7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
              Mô tả bất kỳ tình huống nghi vấn lừa đảo nào bạn từng gặp hoặc muốn luyện tập (ví dụ: <em>Lừa cọc mua vé concert, Lừa đảo hoàn thuế VAT, Dụ dỗ nạp tiền chơi game...</em>), Gemini AI sẽ tự động tạo một kịch bản hoàn chỉnh ngay lập tức!
            </p>

            <textarea
              rows={4}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Nhập ý tưởng tình huống lừa đảo của bạn..."
              className="w-full p-4 border border-[#C4C6D0] rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#0061A4] focus:ring-1 focus:ring-[#0061A4]"
            />

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsCustomModalOpen(false)}
                disabled={isGeneratingCustom}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-[#44474E] bg-[#F3F3F7] hover:bg-[#E1E2E9] cursor-pointer"
              >
                Đóng
              </button>

              <button
                onClick={handleGenerateCustom}
                disabled={isGeneratingCustom || !customPrompt.trim()}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#0061A4] hover:bg-[#004B80] shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingCustom ? (
                  <>
                    <Bot className="w-4 h-4 animate-spin" />
                    <span>Đang Khởi Tạo Bằng Gemini...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Khởi Tạo Kịch Bản Ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
