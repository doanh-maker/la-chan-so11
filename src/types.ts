export type ScamRiskLevel = 'SAFE' | 'WARNING' | 'HIGH' | 'CRITICAL';

export type ScamCategory = 
  | 'BANK_IMPERSONATION'  // Giả danh ngân hàng
  | 'GOVERNMENT_AUTHORITY'// Giả danh công an, tòa án, cơ quan nhà nước
  | 'JOB_VACANCY'         // Lừa đảo tuyển dụng việc làm
  | 'E_COMMERCE_PRIZE'    // Lừa trúng thưởng, cọc mua hàng online
  | 'CREDIT_LOAN'         // Bẫy tín dụng đen, vay ứng dụng
  | 'DEEPFAKE_CALL'       // Cuộc gọi video/thoại AI Deepfake
  | 'CRYPTO_INVESTMENT'   // Đầu tư tiền ảo, sàn đa cấp
  | 'PHISHING_LINK'       // Độc hại, đánh cắp OTP, thông tin
  | 'FAMILY_EMERGENCY'    // Giả thân nhân cấp cứu
  | 'OTHER';              // Khác

export interface ScamTimelineStep {
  stepNumber: number;
  timeOffset: string;
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SimilarScamCase {
  id: string;
  title: string;
  scamTypeNameVi: string;
  similarityScore: number; // 0 - 100%
  reportedDate: string;
  location: string;
  targetInfo?: string;
  summary: string;
  status: 'VERIFIED' | 'INVESTIGATING';
}

export interface ScamAnalysisResult {
  id: string;
  timestamp: number;
  inputType: 'text' | 'image' | 'both';
  inputText?: string;
  imageName?: string;
  imageUrl?: string;
  
  riskScore: number; // 0 to 100
  riskLevel: ScamRiskLevel;
  scamType: ScamCategory;
  scamTypeNameVi: string;
  confidenceLevel?: string; // e.g. "95% (Rất cao)"
  confidenceScore?: number; // 0 to 100
  
  summary: string;
  explanation: string;
  redFlags: string[];
  recommendedActions: string[];
  emergencyHotlines: string[];

  timeline?: ScamTimelineStep[];
  similarCases?: SimilarScamCase[];

  // Personal Security Activity Center fields
  type?: 'website' | 'message' | 'image' | 'chat';
  title?: string;
  aiModel?: string;
  favorite?: boolean;
  pinned?: boolean;
  note?: string;
  device?: string;
  location?: string;
  processingTime?: string;
  status?: 'ACTIVE' | 'DELETED';
  updatedAt?: string;
  userId?: string;
  url?: string;
  domain?: string;
  phone?: string;
  bankAccount?: string;
}

export interface UrlAnalysisResult {
  id: string;
  timestamp: number;
  url: string;
  domain: string;
  
  riskScore: number; // 0 to 100
  riskLevel: ScamRiskLevel;
  isPhishing: boolean;
  
  brandImpersonated?: string;
  suspiciousIndicators: string[];
  safetyChecklist: {
    hasSsl: boolean;
    isTopDomain: boolean;
    hasTypoSquatting: boolean;
    isKnownScamPattern: boolean;
  };
  
  aiVerdict: string;
  recommendations: string[];
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: number;
}

export interface TargetPhoneNumber {
  number: string;
  carrier?: string;
  reportsCount?: number;
}

export interface TargetBankAccount {
  bankName: string;
  accountNumber: string;
  accountName?: string;
  branch?: string;
}

export interface TargetWebsite {
  domain: string;
  url?: string;
  ssl?: boolean;
  registrar?: string;
  creationDate?: string;
  expiryDate?: string;
  ip?: string;
  hosting?: string;
  asn?: string;
}

export interface TargetEmail {
  email: string;
  mxRecord?: boolean;
  spf?: boolean;
  dkim?: boolean;
}

export interface CommunityReport {
  id: string;
  timestamp: number;
  reporterName: string;
  reporterAvatar?: string;
  reporterVerified?: boolean;
  scamType: ScamCategory;
  scamTypeNameVi: string;
  title: string;
  description: string;
  summary?: string;
  
  // Threat Scoring & AI Analysis
  riskScore?: number; // 0 - 100
  confidenceScore?: number; // 0 - 100
  riskLevel?: ScamRiskLevel;
  aiAnalysis?: string;
  explanation?: string;
  aiSummary?: string;
  aiRecommendation?: string[];
  aiRedFlags?: string[];
  comments?: ReportComment[];
  
  // Target Intelligence
  targetPhone?: string;
  targetBankAccount?: string;
  targetBankName?: string;
  targetAccountName?: string; // Tên chủ tài khoản thụ hưởng
  targetUrl?: string;
  targetSocialHandle?: string; // Zalo, Telegram, Facebook
  approachChannel?: string; // Kênh tiếp cận
  
  phoneNumbers?: TargetPhoneNumber[];
  bankAccounts?: TargetBankAccount[];
  websites?: TargetWebsite[];
  emails?: TargetEmail[];
  telegrams?: string[];
  facebooks?: string[];
  zalos?: string[];
  tiktoks?: string[];
  youtubes?: string[];
  discords?: string[];
  
  // Evidence
  proofImages?: string[];
  screenshots?: string[];
  videos?: string[];
  audioFiles?: string[];
  documents?: string[];
  
  // Location & Dates
  locationName: string; // e.g. "Hà Nội", "TP. Hồ Chí Minh"
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  incidentTime?: string;
  createdAt?: string;
  
  // Incident progression
  timeline?: ScamTimelineStep[];
  
  // Badges & Status
  verifiedStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'COMMUNITY_FLAGGED';
  sourceType?: 'AI_DETECTED' | 'COMMUNITY' | 'VERIFIED_OFFICIAL';
  
  // Stats & Metrics
  upvotes: number;
  likes?: number;
  shares?: number;
  bookmarks?: number;
  usefulCount?: number;
  unusefulCount?: number;
  commentsCount?: number;
  reportsCount?: number;
  viewCount?: number;
  
  redFlags?: string[];
  recommendedActions?: string[];
  estimatedLoss?: string;
}

export interface CitationSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  verified: boolean;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedActions?: string[];
  citations?: CitationSource[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

export type NavTab = 'home' | 'scanner' | 'website' | 'simulator' | 'chat' | 'community' | 'history' | 'profile' | 'moderator' | 'admin';

export type SimulatorDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type SimulatorPlatform = 'zalo' | 'telegram' | 'sms' | 'facebook' | 'call';

export interface ScamScenario {
  id: string;
  title: string;
  category: ScamCategory;
  categoryName: string;
  difficulty: SimulatorDifficulty;
  platform: SimulatorPlatform;
  attackerPersona: string;
  attackerAvatar: string;
  targetVictimRole: string; // e.g. "Người dân", "Nhân viên văn phòng", "Sinh viên", "Phụ huynh"
  description: string;
  scenarioContext: string;
  initialMessage: string;
  psychologicalTricks: string[];
  trapTriggers: string[];
  winningTips: string[];
  isCustom?: boolean;
}

export interface SimulatorChatMessage {
  id: string;
  sender: 'scammer' | 'user' | 'system' | 'coach';
  text: string;
  timestamp: number;
  trapAlert?: {
    triggered: boolean;
    trapType: string;
    explanation: string;
    severity: 'WARNING' | 'DANGER' | 'SAFE_DEFENSE';
  };
  interactiveAction?: {
    type: 'link' | 'otp_request' | 'transfer_request' | 'apk_download';
    title: string;
    payload?: string;
  };
}

export interface SimulationSession {
  id: string;
  scenario: ScamScenario;
  score: number; // 0 - 100
  status: 'IN_PROGRESS' | 'DEFENDED_SUCCESS' | 'TRAPPED' | 'TERMINATED';
  messages: SimulatorChatMessage[];
  trapsAvoided: number;
  totalTrapsEncountered: number;
  vulnerabilitiesDetected: string[];
  strengthsObserved: string[];
  aiCoachDebrief?: string;
  startedAt: number;
  completedAt?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAnonymous?: boolean;
  phoneNumber?: string;
  bio?: string;
  role?: 'user' | 'moderator' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  createdAt?: string;
  lastLogin?: string;
  location?: string;
}

export interface UserSettings {
  // Account Detail
  phoneNumber?: string;
  bio?: string;
  department?: string;

  // AI Engine Settings
  aiModel?: 'gemini-3.6-flash' | 'gemini-3.5-pro' | 'gemini-2.5-ultra';
  highSafetyMode?: boolean;
  autoScanUrls?: boolean;
  aiConfidenceThreshold?: number; // 50 to 99
  deepfakeDetection?: boolean;

  // Notification Settings
  pushNotifications?: boolean;
  emailAlerts?: boolean;
  emergencySosAlerts?: boolean;
  dailyThreatSummary?: boolean;
  soundEffects?: boolean;

  // Privacy
  anonymousReporting?: boolean;
  shareDataForResearch?: boolean;
  hideLocation?: boolean;

  // Accessibility
  isLargeFont?: boolean;
  voiceAssistantEnabled?: boolean;
  highContrastMode?: boolean;

  // Security
  biometricLock?: boolean;
  twoFactorEnabled?: boolean;

  // Firebase Sync
  autoSyncOffline?: boolean;

  updatedAt?: string;
}

export interface UserActivityLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  category: 'SECURITY' | 'SETTINGS' | 'SCAN' | 'REPORT' | 'AUTH';
  status: 'SUCCESS' | 'WARNING' | 'INFO';
  ipAddress?: string;
}

export interface ManagedUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'ADMIN' | 'MODERATOR' | 'USER';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  joinedDate: string;
  scansCount: number;
  reportsSubmitted: number;
}

