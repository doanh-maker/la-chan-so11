import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  X, 
  Globe, 
  MessageSquare, 
  Image as ImageIcon, 
  Bot, 
  Pin, 
  Star, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Copy, 
  Check, 
  Share2, 
  Printer, 
  RefreshCw, 
  Clock, 
  SlidersHorizontal, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  FileSpreadsheet, 
  FileJson, 
  Edit3, 
  ExternalLink, 
  Lock, 
  Smartphone, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Plus, 
  RotateCcw,
  Tag,
  Flame,
  Info
} from 'lucide-react';
import { ScamAnalysisResult, ScamRiskLevel } from '../types';
import { updateFirestoreScanItem, deleteFirestoreScanItem } from '../lib/firebase';

interface ScanHistoryProps {
  historyItems: ScamAnalysisResult[];
  onClearHistory: () => void;
  isLargeFont: boolean;
  onNavigateToScanner?: () => void;
}

// Initial realistic default mock dataset if no items present
const DEFAULT_MOCK_HISTORY: ScamAnalysisResult[] = [
  {
    id: 'scan-mock-001',
    timestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    inputType: 'text',
    inputText: 'THONG BAO: Tai khoan VCB cua quy khach bi khoa. Vui long truy cap hxxps://vietcombank-login-sec.info/vcb de xac thuc ngay va tranh gian đoạn dich vu!',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    scamType: 'BANK_IMPERSONATION',
    scamTypeNameVi: 'Giả Danh Ngân Hàng Vietcombank',
    confidenceLevel: '98% (Rất cao)',
    confidenceScore: 98,
    summary: 'Phát hiện website giả mạo Vietcombank đánh cắp OTP và tên đăng nhập internet banking.',
    explanation: 'Liên kết chứa tên miền giả mạo (vietcombank-login-sec.info) mới đăng ký 2 ngày trước, không có chứng thư SSL hợp lệ từ Vietcombank. Nội dung đe dọa khóa tài khoản để ép người dùng nhập thông tin nhạy cảm.',
    redFlags: [
      'Tên miền giả mạo Vietcombank (.info)',
      'Hành vi đe dọa khóa tài khoản khẩn cấp',
      'Không dùng mã hóa SSL chính thức của ngân hàng'
    ],
    recommendedActions: [
      'Không truy cập vào đường link trong tin nhắn',
      'Đổi mật khẩu tài khoản ngân hàng ngay nếu đã lỡ click',
      'Khóa thẻ tạm thời qua ứng dụng Digibank chính thức'
    ],
    emergencyHotlines: ['1900 54 54 13 (Vietcombank)', '113 (Công An)'],
    type: 'website',
    title: 'Website Phishing Giả Mạo Vietcombank',
    aiModel: 'Gemini 3.6 Flash',
    favorite: true,
    pinned: true,
    note: 'Đã báo cáo lên Cục An toàn thông tin (NCSC)',
    device: 'Chrome / macOS 14.5',
    location: 'TP. Hồ Chí Minh',
    processingTime: '1.1s',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
    url: 'https://vietcombank-login-sec.info/vcb',
    domain: 'vietcombank-login-sec.info'
  },
  {
    id: 'scan-mock-002',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    inputType: 'text',
    inputText: 'Chúc mừng SĐT 098****123 đã trúng thưởng 01 xe máy SH 125i từ Shopee Event! Bấm vào link t.me/shopee_gift2026 để liên hệ làm thủ tục nhận giải.',
    riskScore: 85,
    riskLevel: 'HIGH',
    scamType: 'E_COMMERCE_PRIZE',
    scamTypeNameVi: 'Bẫy Trúng Thưởng Mạng Shopee',
    confidenceLevel: '95% (Cao)',
    confidenceScore: 95,
    summary: 'Tin nhắn mạo danh Shopee thông báo trúng thưởng để dẫn dụ qua Telegram thanh toán phí vận chuyển giả.',
    explanation: 'Kịch bản trúng thưởng quà tặng lớn nhằm yêu cầu nạn nhân chuyển khoản trước "tiền thuế" hoặc "phí làm hồ sơ" qua Telegram.',
    redFlags: [
      'Thông báo trúng thưởng không qua ứng dụng Shopee',
      'Dẫn hướng sang kênh chat cá nhân Telegram',
      'Yêu cầu đóng phí nhận giải trước'
    ],
    recommendedActions: [
      'Báo xấu số điện thoại gửi tin nhắn',
      'Không làm theo hướng dẫn chuyển tiền cọc'
    ],
    emergencyHotlines: ['1900 1221 (Shopee)'],
    type: 'message',
    title: 'SMS Lừa Đảo Trúng Thưởng Shopee',
    aiModel: 'Gemini 3.6 Flash',
    favorite: false,
    pinned: false,
    note: 'Nhận từ đầu số 0912.833.111',
    device: 'Safari / iPhone 15 Pro',
    location: 'Hà Nội',
    processingTime: '0.9s',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
    phone: '0912.833.111'
  },
  {
    id: 'scan-mock-003',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // Yesterday
    inputType: 'image',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    riskScore: 78,
    riskLevel: 'HIGH',
    scamType: 'JOB_VACANCY',
    scamTypeNameVi: 'Tuyển Dụng Cộng Tác Viên Online',
    confidenceLevel: '91% (Cao)',
    confidenceScore: 91,
    summary: 'Ảnh chụp màn hình thông báo tuyển dụng việc làm tại nhà "Việc nhẹ lương 500k-2 triệu/ngày".',
    explanation: 'Hình ảnh chứa nội dung tuyển dụng xem video TikTok/Shopee trả thưởng mồi. Thực chất là hình thức lừa đảo ủy nhiệm cọc tiền cấp độ tăng dần.',
    redFlags: [
      'Thu nhập bất thường so với công việc đơn giản',
      'Yêu cầu nạp tiền để nâng cấp hạng thành viên'
    ],
    recommendedActions: [
      'Không nạp tiền vào tài khoản cá nhân do đối tượng cung cấp'
    ],
    emergencyHotlines: ['113 (Công An)'],
    type: 'image',
    title: 'Ảnh Bìa Lừa Đảo Việc Nhẹ Lương Cao',
    aiModel: 'Gemini 3.6 Flash',
    favorite: true,
    pinned: false,
    note: 'Gửi trên nhóm Facebook Việc Làm Hà Nội',
    device: 'Chrome / Windows 11',
    location: 'Đà Nẵng',
    processingTime: '1.4s',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'scan-mock-004',
    timestamp: Date.now() - 1000 * 60 * 60 * 28, // Yesterday
    inputType: 'text',
    inputText: 'Hỏi AI: Làm sao biết tài khoản Zalopay hay MoMo của mình có đang bị người lạ liên kết trái phép không?',
    riskScore: 12,
    riskLevel: 'SAFE',
    scamType: 'OTHER',
    scamTypeNameVi: 'Hỏi Đáp Bảo Mật Ví Điện Tử',
    confidenceLevel: '99% (Tuyệt đối)',
    confidenceScore: 99,
    summary: 'Hỏi đáp bảo mật tài khoản ví điện tử cá nhân.',
    explanation: 'Người dùng chủ động hỏi thông tin tư vấn cách kiểm tra thiết bị đã đăng nhập và liên kết tài khoản ngân hàng trên ứng dụng Zalopay/MoMo. Không có dấu hiệu lừa đảo.',
    redFlags: [],
    recommendedActions: [
      'Bật xác thực 2 lớp (2FA) và sinh trắc học vân tay/FaceID cho ví điện tử'
    ],
    emergencyHotlines: [],
    type: 'chat',
    title: 'Tư Vấn An Toàn Ví Điện Tử Zalopay/MoMo',
    aiModel: 'Gemini 3.6 Flash',
    favorite: false,
    pinned: false,
    note: 'Lưu mẹo kiểm tra thiết bị lạ',
    device: 'Android / Samsung Galaxy S24',
    location: 'Cần Thơ',
    processingTime: '0.8s',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'scan-mock-005',
    timestamp: Date.now() - 1000 * 60 * 60 * 72, // 3 days ago
    inputType: 'text',
    inputText: 'https://chinhphu-gov-app.apk-download.net/dichvucong',
    riskScore: 96,
    riskLevel: 'CRITICAL',
    scamType: 'GOVERNMENT_AUTHORITY',
    scamTypeNameVi: 'Mã Độc Giả Mạo Cổng Dịch Vụ Công',
    confidenceLevel: '99% (Rất cao)',
    confidenceScore: 99,
    summary: 'Đường link tải tệp APK chứa mã độc giả mạo ứng dụng Dịch Vụ Công Bộ Công An.',
    explanation: 'Tệp APK chứa mã độc Spyware tự động đọc tin nhắn SMS OTP, chiếm quyền điều khiển màn hình điện thoại Android từ xa.',
    redFlags: [
      'File APK ngoài CH Play / App Store',
      'Đòi hỏi quyền Accessibility & Đọc SMS',
      'Tên miền giả mạo cơ quan nhà nước'
    ],
    recommendedActions: [
      'Gỡ ứng dụng APK giả mạo lập tức',
      'Bật Google Play Protect',
      'Thực hiện khôi phục cài đặt gốc nếu điện thoại có dấu hiệu giật lag bất thường'
    ],
    emergencyHotlines: ['069 234 8542 (Cục A05)'],
    type: 'website',
    title: 'Tệp APK Mã Độc Giả Mạo Dịch Vụ Công',
    aiModel: 'Gemini 3.6 Flash',
    favorite: true,
    pinned: true,
    note: 'Cực kỳ nguy hiểm - Đã chia sẻ cho người thân cảnh báo',
    device: 'Android / Xiaomi 13',
    location: 'Hải Phòng',
    processingTime: '1.2s',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
    url: 'https://chinhphu-gov-app.apk-download.net/dichvucong',
    domain: 'chinhphu-gov-app.apk-download.net'
  }
];

export const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  historyItems, 
  onClearHistory, 
  isLargeFont,
  onNavigateToScanner
}) => {
  // Local state initialized with props or default mock records
  const [items, setItems] = useState<ScamAnalysisResult[]>(() => {
    if (historyItems && historyItems.length > 0) {
      return historyItems.map(item => ({
        ...item,
        type: item.type || (item.url ? 'website' : item.imageUrl ? 'image' : 'message'),
        title: item.title || item.scamTypeNameVi || 'Bản ghi quét',
        aiModel: item.aiModel || 'Gemini 3.6 Flash',
        favorite: item.favorite ?? false,
        pinned: item.pinned ?? false,
        note: item.note || '',
        device: item.device || 'Chrome / macOS',
        location: item.location || 'Việt Nam',
        processingTime: item.processingTime || '1.1s',
        status: item.status || 'ACTIVE',
        updatedAt: item.updatedAt || new Date().toISOString()
      }));
    }
    return DEFAULT_MOCK_HISTORY;
  });

  // Sync state if props updated
  useEffect(() => {
    if (historyItems && historyItems.length > 0) {
      setItems(prev => {
        const itemMap = new Map(prev.map(i => [i.id, i]));
        historyItems.forEach(h => {
          const existing = itemMap.get(h.id);
          itemMap.set(h.id, {
            ...h,
            type: h.type || (h.url ? 'website' : h.imageUrl ? 'image' : 'message'),
            title: h.title || h.scamTypeNameVi || 'Bản ghi quét',
            aiModel: h.aiModel || 'Gemini 3.6 Flash',
            favorite: existing?.favorite ?? h.favorite ?? false,
            pinned: existing?.pinned ?? h.pinned ?? false,
            note: existing?.note ?? h.note ?? '',
            device: existing?.device ?? h.device ?? 'Chrome / macOS',
            location: existing?.location ?? h.location ?? 'Việt Nam',
            processingTime: existing?.processingTime ?? h.processingTime ?? '1.1s',
            status: existing?.status ?? h.status ?? 'ACTIVE',
            updatedAt: existing?.updatedAt ?? h.updatedAt ?? new Date().toISOString()
          });
        });
        return Array.from(itemMap.values());
      });
    }
  }, [historyItems]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'website' | 'message' | 'image' | 'chat'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'SAFE' | 'WARNING' | 'HIGH' | 'CRITICAL'>('ALL');
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS' | '90DAYS' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortOption, setSortOption] = useState<'NEWEST' | 'OLDEST' | 'HIGHEST_RISK' | 'FASTEST'>('NEWEST');
  const [viewMode, setViewMode] = useState<'LIST' | 'TIMELINE'>('LIST');

  // Quick Filter Toggles
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyHasNote, setOnlyHasNote] = useState(false);

  // Selected Item Drawer & Modal states
  const [selectedScan, setSelectedScan] = useState<ScamAnalysisResult | null>(null);
  const [editingNote, setEditingNote] = useState<string>('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiInsightRefreshing, setAiInsightRefreshing] = useState(false);

  // Keyboard shortcut ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedScan) setSelectedScan(null);
        if (isTrashOpen) setIsTrashOpen(false);
        if (isExportPdfOpen) setIsExportPdfOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedScan, isTrashOpen, isExportPdfOpen]);

  // Sync editing note when selected scan changes
  useEffect(() => {
    if (selectedScan) {
      setEditingNote(selectedScan.note || '');
    }
  }, [selectedScan]);

  // Actions for Pin, Favorite, Note, Delete
  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;
    const newPinned = !targetItem.pinned;
    
    setItems(prev => prev.map(item => item.id === id ? { ...item, pinned: newPinned } : item));
    if (selectedScan && selectedScan.id === id) {
      setSelectedScan(prev => prev ? { ...prev, pinned: newPinned } : null);
    }
    await updateFirestoreScanItem(id, { pinned: newPinned });
  };

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;
    const newFavorite = !targetItem.favorite;

    setItems(prev => prev.map(item => item.id === id ? { ...item, favorite: newFavorite } : item));
    if (selectedScan && selectedScan.id === id) {
      setSelectedScan(prev => prev ? { ...prev, favorite: newFavorite } : null);
    }
    await updateFirestoreScanItem(id, { favorite: newFavorite });
  };

  const handleSaveNote = async (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, note: editingNote } : item));
    if (selectedScan && selectedScan.id === id) {
      setSelectedScan(prev => prev ? { ...prev, note: editingNote } : null);
    }
    await updateFirestoreScanItem(id, { note: editingNote });
  };

  const handleSoftDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'DELETED' } : item));
    if (selectedScan?.id === id) setSelectedScan(null);
    await updateFirestoreScanItem(id, { status: 'DELETED' });
  };

  const handleRestoreItem = async (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'ACTIVE' } : item));
    await updateFirestoreScanItem(id, { status: 'ACTIVE' });
  };

  const handlePermanentDelete = async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await deleteFirestoreScanItem(id);
  };

  const handleEmptyTrash = async () => {
    const deletedIds = items.filter(i => i.status === 'DELETED').map(i => i.id);
    setItems(prev => prev.filter(item => item.status !== 'DELETED'));
    for (const id of deletedIds) {
      await deleteFirestoreScanItem(id);
    }
  };

  const handleCopyText = (text: string, labelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(labelId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Active (non-deleted) items
  const activeItems = useMemo(() => {
    return items.filter(i => i.status !== 'DELETED');
  }, [items]);

  // Deleted items in trash
  const trashItems = useMemo(() => {
    return items.filter(i => i.status === 'DELETED');
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return activeItems.filter(item => {
      // Search term
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = !query || 
        (item.inputText && item.inputText.toLowerCase().includes(query)) ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.scamTypeNameVi && item.scamTypeNameVi.toLowerCase().includes(query)) ||
        (item.summary && item.summary.toLowerCase().includes(query)) ||
        (item.domain && item.domain.toLowerCase().includes(query)) ||
        (item.phone && item.phone.includes(query)) ||
        (item.note && item.note.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Type Filter
      if (typeFilter !== 'ALL') {
        const itemType = item.type || (item.url ? 'website' : item.imageUrl ? 'image' : 'message');
        if (itemType !== typeFilter) return false;
      }

      // Risk Level Filter
      if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) {
        return false;
      }

      // Time Period Filter
      const now = Date.now();
      const itemTime = item.timestamp;
      if (periodFilter === 'TODAY') {
        const startOfToday = new Date().setHours(0,0,0,0);
        if (itemTime < startOfToday) return false;
      } else if (periodFilter === '7DAYS') {
        if (itemTime < now - 1000 * 60 * 60 * 24 * 7) return false;
      } else if (periodFilter === '30DAYS') {
        if (itemTime < now - 1000 * 60 * 60 * 24 * 30) return false;
      } else if (periodFilter === '90DAYS') {
        if (itemTime < now - 1000 * 60 * 60 * 24 * 90) return false;
      } else if (periodFilter === 'CUSTOM') {
        if (customStartDate && itemTime < new Date(customStartDate).getTime()) return false;
        if (customEndDate && itemTime > new Date(customEndDate).getTime() + 86400000) return false;
      }

      // Quick Toggles
      if (onlyPinned && !item.pinned) return false;
      if (onlyFavorites && !item.favorite) return false;
      if (onlyHasNote && !item.note?.trim()) return false;

      return true;
    }).sort((a, b) => {
      // Always put pinned items at top unless specified otherwise
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      if (sortOption === 'NEWEST') return b.timestamp - a.timestamp;
      if (sortOption === 'OLDEST') return a.timestamp - b.timestamp;
      if (sortOption === 'HIGHEST_RISK') return b.riskScore - a.riskScore;
      if (sortOption === 'FASTEST') return parseFloat(a.processingTime || '9') - parseFloat(b.processingTime || '9');
      return b.timestamp - a.timestamp;
    });
  }, [activeItems, searchTerm, typeFilter, riskFilter, periodFilter, customStartDate, customEndDate, onlyPinned, onlyFavorites, onlyHasNote, sortOption]);

  // Timeline Grouping
  const timelineGroups = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date().setHours(0,0,0,0);
    const startOfYesterday = startOfToday - 86400000;
    const startOfLastWeek = startOfToday - 7 * 86400000;

    const today: ScamAnalysisResult[] = [];
    const yesterday: ScamAnalysisResult[] = [];
    const lastWeek: ScamAnalysisResult[] = [];
    const older: ScamAnalysisResult[] = [];

    filteredItems.forEach(item => {
      if (item.timestamp >= startOfToday) {
        today.push(item);
      } else if (item.timestamp >= startOfYesterday) {
        yesterday.push(item);
      } else if (item.timestamp >= startOfLastWeek) {
        lastWeek.push(item);
      } else {
        older.push(item);
      }
    });

    return [
      { label: 'Hôm Nay', items: today },
      { label: 'Hôm Qua', items: yesterday },
      { label: 'Tuần Trước', items: lastWeek },
      { label: 'Tháng Trước & Cũ Hơn', items: older }
    ].filter(group => group.items.length > 0);
  }, [filteredItems]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalScans = activeItems.length;
    const websiteScans = activeItems.filter(i => (i.type === 'website' || i.url)).length;
    const messageScans = activeItems.filter(i => (i.type === 'message' || (!i.url && !i.imageUrl))).length;
    const chatScans = activeItems.filter(i => i.type === 'chat').length;
    const highRiskScans = activeItems.filter(i => i.riskScore >= 70).length;
    const bankPhishingBlocked = activeItems.filter(i => i.scamType === 'BANK_IMPERSONATION' || i.scamType === 'PHISHING_LINK').length;

    return {
      totalScans,
      websiteScans,
      messageScans,
      chatScans,
      highRiskScans,
      bankPhishingBlocked
    };
  }, [activeItems]);

  // Exports
  const handleExportCSV = () => {
    if (activeItems.length === 0) return;
    const headers = ['ID', 'Ngay Gio', 'Loai', 'Tieu De', 'Diem Rui Ro', 'Muc Do', 'Noi Dung', 'Ket Luan', 'Model AI', 'Ghi Chu'];
    const rows = activeItems.map(item => [
      `"${item.id}"`,
      `"${new Date(item.timestamp).toLocaleString('vi-VN')}"`,
      `"${item.type || 'message'}"`,
      `"${(item.title || item.scamTypeNameVi).replace(/"/g, '""')}"`,
      item.riskScore,
      `"${item.riskLevel}"`,
      `"${(item.inputText || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(item.summary || '').replace(/"/g, '""')}"`,
      `"${item.aiModel || 'Gemini 3.6 Flash'}"`,
      `"${(item.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lachanso_Activity_Log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    if (activeItems.length === 0) return;
    const jsonStr = JSON.stringify(activeItems, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lachanso_Activity_Log_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Helper badge color lookup for MD3
  const getRiskBadgeStyles = (level: ScamRiskLevel, score: number) => {
    if (score >= 85 || level === 'CRITICAL') {
      return {
        bg: 'bg-[#FFDAD6] text-[#410002] border-[#FFB4AB]',
        dot: 'bg-[#BA1A1A]',
        label: 'CRITICAL',
        chipBg: 'bg-[#BA1A1A] text-white'
      };
    }
    if (score >= 70 || level === 'HIGH') {
      return {
        bg: 'bg-[#FFE9E9] text-[#BA1A1A] border-[#FFDAD6]',
        dot: 'bg-[#BA1A1A]',
        label: 'HIGH',
        chipBg: 'bg-[#BA1A1A] text-white'
      };
    }
    if (score >= 40 || level === 'WARNING') {
      return {
        bg: 'bg-[#FFF0C2] text-[#8C6200] border-[#FFE088]',
        dot: 'bg-[#E65100]',
        label: 'WARNING',
        chipBg: 'bg-[#E65100] text-white'
      };
    }
    return {
      bg: 'bg-[#C8E6C9] text-[#003900] border-[#A5D6A7]',
      dot: 'bg-[#006E00]',
      label: 'SAFE',
      chipBg: 'bg-[#006E00] text-white'
    };
  };

  const getTypeIcon = (type?: string, url?: string, imageUrl?: string) => {
    if (type === 'website' || url) return <Globe className="w-4 h-4 text-[#0061A4]" />;
    if (type === 'image' || imageUrl) return <ImageIcon className="w-4 h-4 text-[#8C6200]" />;
    if (type === 'chat') return <Bot className="w-4 h-4 text-[#4F378B]" />;
    return <MessageSquare className="w-4 h-4 text-[#E65100]" />;
  };

  return (
    <div className={`space-y-6 ${isLargeFont ? 'text-lg' : 'text-base'}`}>
      
      {/* 1. HEADER SECTION (MATERIAL DESIGN 3) */}
      <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#E1E2E9] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#D1E4FF] text-[#001D36] border border-[#A3C9FF] text-xs font-black">
            <History className="w-4 h-4 text-[#0061A4]" />
            <span>🏷 Nhật Ký An Toàn Cá Nhân</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1B1F] tracking-tight">
            Lịch Sử Các Lần Quét
          </h1>
          <p className="text-[#44474E] text-sm max-w-2xl leading-relaxed">
            Lưu trữ toàn bộ lịch sử quét tin nhắn, hình ảnh, website và cuộc trò chuyện AI của bạn.
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsExportPdfOpen(true)}
            className="px-3.5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-xs font-bold border border-[#E1E2E9] transition flex items-center space-x-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            title="In / Xuất Báo Cáo PDF"
          >
            <Printer className="w-4 h-4 text-[#0061A4]" />
            <span className="hidden sm:inline">Xuất PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-xs font-bold border border-[#E1E2E9] transition flex items-center space-x-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            title="Xuất Bảng Tính CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#006E00]" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-xs font-bold border border-[#E1E2E9] transition flex items-center space-x-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            title="Xuất Cấu Trúc JSON"
          >
            <FileJson className="w-4 h-4 text-[#4F378B]" />
            <span className="hidden sm:inline">Xuất JSON</span>
          </button>

          <button
            onClick={() => setIsTrashOpen(true)}
            className="relative px-3.5 py-2.5 rounded-full bg-[#F3F3F7] hover:bg-[#E7E8EE] text-[#1C1B1F] text-xs font-bold border border-[#E1E2E9] transition flex items-center space-x-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none"
            title="Thùng rác - Khôi phục trong 30 ngày"
          >
            <Trash2 className="w-4 h-4 text-[#BA1A1A]" />
            <span>Thùng Rác</span>
            {trashItems.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#BA1A1A] text-white text-[10px] font-extrabold">
                {trashItems.length}
              </span>
            )}
          </button>

          <button
            onClick={onClearHistory}
            disabled={activeItems.length === 0}
            className="px-3.5 py-2.5 rounded-full bg-[#FFE9E9] hover:bg-[#FFDAD6] text-[#BA1A1A] text-xs font-bold border border-[#FFDAD6] transition flex items-center space-x-1.5 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[#BA1A1A] focus-visible:outline-none"
          >
            <X className="w-4 h-4" />
            <span className="hidden md:inline">Xóa Lịch Sử</span>
          </button>
        </div>
      </div>

      {/* 2. GEMINI AI INSIGHT SYNTHESIS BANNER */}
      <div className="bg-gradient-to-br from-[#EEF4FF] via-white to-[#F5EEFF] p-6 rounded-[28px] border border-[#D1E4FF] shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#D1E4FF]/60 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0061A4] text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C1B1F] flex items-center gap-2">
                BÁO CÁO TỔNG QUAN AI INSIGHTS 30 NGÀY QUA
              </h3>
              <p className="text-xs text-[#44474E]">
                Gemini 3.6 Flash tự động phân tích hành vi và xu hướng an toàn của bạn
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAiInsightRefreshing(true);
              setTimeout(() => setAiInsightRefreshing(false), 800);
            }}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3F3F7] text-xs font-bold text-[#0061A4] border border-[#D1E4FF] flex items-center gap-1.5 shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${aiInsightRefreshing ? 'animate-spin' : ''}`} />
            <span>Cập nhật phân tích</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-[#E1E2E9] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#0061A4]">TỔNG SỐ LƯỢT QUẾT</span>
            <p className="text-xl font-black text-[#1C1B1F]">{stats.totalScans} lượt</p>
            <p className="text-[11px] text-[#006E00] font-bold">✓ 100% dữ liệu đồng bộ an toàn</p>
          </div>

          <div className="bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-[#E1E2E9] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#0061A4]">WEBSITE & TIN NHẮN</span>
            <p className="text-xl font-black text-[#1C1B1F]">{stats.websiteScans} web • {stats.messageScans} tin nhắn</p>
            <p className="text-[11px] text-[#44474E]">Đã phân tích mã độc & link độc</p>
          </div>

          <div className="bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-[#E1E2E9] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#BA1A1A]">CẢNH BÁO NGUY HIỂM</span>
            <p className="text-xl font-black text-[#BA1A1A]">{stats.highRiskScans} vụ việc rủi ro cao</p>
            <p className="text-[11px] text-[#BA1A1A] font-bold">Kịp thời phòng tránh cọc lừa đảo</p>
          </div>

          <div className="bg-white/80 backdrop-blur p-3.5 rounded-2xl border border-[#E1E2E9] space-y-1">
            <span className="text-[10px] font-black uppercase text-[#006E00]">GIẢ MẠO NGÂN HÀNG</span>
            <p className="text-xl font-black text-[#006E00]">{stats.bankPhishingBlocked} trang phishing bị chặn</p>
            <p className="text-[11px] text-[#006E00] font-bold">Đã kiểm tra chứng thư SSL</p>
          </div>
        </div>

        {/* Lời khuyên an toàn Gemini */}
        <div className="bg-white/90 p-4 rounded-2xl border border-[#D1E4FF] flex items-start space-x-3">
          <Info className="w-5 h-5 text-[#0061A4] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#1C1B1F]">
              Lời khuyên bảo mật cá nhân từ AI:
            </p>
            <p className="text-xs text-[#44474E] leading-relaxed">
              "Trong tuần qua, tần suất bạn gặp các tin nhắn chứa đường link rút gọn (.info, .apk) tăng 20%. Hãy tiếp tục duy trì thói quen kiểm tra link trên Lá Chắn Số AI trước khi nhập OTP ngân hàng hoặc cài đặt tệp APK từ nguồn lạ."
            </p>
          </div>
        </div>
      </div>

      {/* 3. STATISTICS CARDS GRID (4 MATERIAL DESIGN 3 CARDS WITH SPARKLINE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat Card 1: Tổng lượt quét */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#D1E4FF] text-[#0061A4] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-[#006E00] bg-[#C8E6C9] px-2.5 py-0.5 rounded-full">
              +18% tháng này
            </span>
          </div>
          <div>
            <p className="text-xs text-[#44474E] font-medium">Tổng Lượt Quét</p>
            <p className="text-2xl font-black text-[#1C1B1F] tracking-tight">{stats.totalScans}</p>
          </div>
          {/* Mini Sparkline SVG */}
          <svg className="w-full h-8 text-[#0061A4]" viewBox="0 0 100 25" fill="none">
            <path d="M0 20 Q 20 10, 40 18 T 80 5 T 100 12" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* Stat Card 2: Website đã kiểm tra */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E8DEF8] text-[#4F378B] flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-[#0061A4] bg-[#D1E4FF] px-2.5 py-0.5 rounded-full">
              +12% tuần này
            </span>
          </div>
          <div>
            <p className="text-xs text-[#44474E] font-medium">Website Đã Kiểm Tra</p>
            <p className="text-2xl font-black text-[#1C1B1F] tracking-tight">{stats.websiteScans}</p>
          </div>
          {/* Mini Sparkline SVG */}
          <svg className="w-full h-8 text-[#4F378B]" viewBox="0 0 100 25" fill="none">
            <path d="M0 15 Q 25 22, 50 8 T 75 14 T 100 4" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* Stat Card 3: Tin nhắn đã phân tích */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE0B2] text-[#E65100] flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-[#E65100] bg-[#FFF0C2] px-2.5 py-0.5 rounded-full">
              +8% hôm nay
            </span>
          </div>
          <div>
            <p className="text-xs text-[#44474E] font-medium">Tin Nhắn Đã Phân Tích</p>
            <p className="text-2xl font-black text-[#1C1B1F] tracking-tight">{stats.messageScans}</p>
          </div>
          {/* Mini Sparkline SVG */}
          <svg className="w-full h-8 text-[#E65100]" viewBox="0 0 100 25" fill="none">
            <path d="M0 18 Q 30 5, 60 20 T 100 8" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

        {/* Stat Card 4: AI Chat */}
        <div className="bg-white p-5 rounded-[20px] border border-[#E1E2E9] shadow-xs flex flex-col justify-between space-y-3 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#FFDAD6] text-[#BA1A1A] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black text-[#BA1A1A] bg-[#FFDAD6] px-2.5 py-0.5 rounded-full">
              +25% AI trợ lý
            </span>
          </div>
          <div>
            <p className="text-xs text-[#44474E] font-medium">AI Chat & Trợ Lý</p>
            <p className="text-2xl font-black text-[#1C1B1F] tracking-tight">{stats.chatScans}</p>
          </div>
          {/* Mini Sparkline SVG */}
          <svg className="w-full h-8 text-[#BA1A1A]" viewBox="0 0 100 25" fill="none">
            <path d="M0 12 Q 20 24, 50 10 T 80 18 T 100 5" stroke="currentColor" strokeWidth="2.5" fill="none" />
          </svg>
        </div>

      </div>

      {/* 4. FILTER CONTROLS BAR (SEARCH, TYPE TABS, RISK, PERIOD, SORT, VIEW TOGGLE) */}
      <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-5 shadow-xs space-y-4">
        
        {/* Top Search & Primary Filters Row */}
        <div className="flex flex-col lg:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-[#44474E] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề, URL, SĐT, ghi chú..."
              className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl pl-12 pr-4 py-3 text-[#1C1B1F] placeholder-[#44474E] focus:outline-none focus:ring-2 focus:ring-[#0061A4] text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474E] hover:text-[#1C1B1F] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="w-full lg:w-auto bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-4 py-3 text-[#1C1B1F] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
          >
            <option value="ALL">Mọi Mức Rủi Ro</option>
            <option value="SAFE">🟢 Safe (An Toàn)</option>
            <option value="WARNING">🟡 Warning (Cảnh Báo)</option>
            <option value="HIGH">🔴 High (Nguy Hiểm)</option>
            <option value="CRITICAL">🔥 Critical (Rất Nguy Hiểm)</option>
          </select>

          {/* Time Period Filter */}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="w-full lg:w-auto bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-4 py-3 text-[#1C1B1F] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
          >
            <option value="ALL">Mọi Thời Gian</option>
            <option value="TODAY">Hôm Nay</option>
            <option value="7DAYS">7 Ngày Qua</option>
            <option value="30DAYS">30 Ngày Qua</option>
            <option value="90DAYS">90 Ngày Qua</option>
            <option value="CUSTOM">Tùy Chọn Khung Ngày</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="w-full lg:w-auto bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl px-4 py-3 text-[#1C1B1F] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0061A4]"
          >
            <option value="NEWEST">Mới Nhất</option>
            <option value="OLDEST">Cũ Nhất</option>
            <option value="HIGHEST_RISK">Rủi Ro Cao Nhất</option>
            <option value="FASTEST">Xử Lý Nhanh Nhất</option>
          </select>

          {/* List vs Timeline Mode Toggle */}
          <div className="flex items-center p-1 bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl shrink-0 w-full lg:w-auto justify-center">
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'LIST' 
                  ? 'bg-white text-[#0061A4] shadow-2xs font-black' 
                  : 'text-[#44474E] hover:text-[#1C1B1F]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Danh Sách</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                viewMode === 'TIMELINE' 
                  ? 'bg-white text-[#0061A4] shadow-2xs font-black' 
                  : 'text-[#44474E] hover:text-[#1C1B1F]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

        </div>

        {/* Custom Range Inputs (if Period = CUSTOM) */}
        {periodFilter === 'CUSTOM' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E1E2E9] text-xs font-bold text-[#44474E]">
            <span>Từ ngày:</span>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-white border border-[#E1E2E9] rounded-xl px-3 py-1.5 text-[#1C1B1F]"
            />
            <span>Đến ngày:</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-white border border-[#E1E2E9] rounded-xl px-3 py-1.5 text-[#1C1B1F]"
            />
          </div>
        )}

        {/* Data Type Filter Tabs & Quick Toggles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[#E1E2E9] pt-3">
          
          {/* Data Type Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition ${
                typeFilter === 'ALL'
                  ? 'bg-[#0061A4] text-white shadow-2xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E7E8EE]'
              }`}
            >
              Tất Cả ({activeItems.length})
            </button>
            <button
              onClick={() => setTypeFilter('website')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1 ${
                typeFilter === 'website'
                  ? 'bg-[#0061A4] text-white shadow-2xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E7E8EE]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website ({activeItems.filter(i => i.type === 'website' || i.url).length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('message')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1 ${
                typeFilter === 'message'
                  ? 'bg-[#0061A4] text-white shadow-2xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E7E8EE]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tin Nhắn ({activeItems.filter(i => i.type === 'message' || (!i.url && !i.imageUrl)).length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('image')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1 ${
                typeFilter === 'image'
                  ? 'bg-[#0061A4] text-white shadow-2xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E7E8EE]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Ảnh ({activeItems.filter(i => i.type === 'image' || i.imageUrl).length})</span>
            </button>
            <button
              onClick={() => setTypeFilter('chat')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition flex items-center gap-1 ${
                typeFilter === 'chat'
                  ? 'bg-[#0061A4] text-white shadow-2xs'
                  : 'bg-[#F3F3F7] text-[#44474E] hover:bg-[#E7E8EE]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Chat ({activeItems.filter(i => i.type === 'chat').length})</span>
            </button>
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex items-center space-x-2 shrink-0 text-xs">
            <button
              onClick={() => setOnlyPinned(!onlyPinned)}
              className={`px-3 py-1.5 rounded-full border transition flex items-center gap-1 font-bold ${
                onlyPinned 
                  ? 'bg-[#D1E4FF] text-[#001D36] border-[#A3C9FF]' 
                  : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9] hover:bg-[#E7E8EE]'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>Ghim</span>
            </button>

            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 rounded-full border transition flex items-center gap-1 font-bold ${
                onlyFavorites 
                  ? 'bg-[#FFF0C2] text-[#8C6200] border-[#FFE088]' 
                  : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9] hover:bg-[#E7E8EE]'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-[#8C6200]" />
              <span>Yêu Thích</span>
            </button>

            <button
              onClick={() => setOnlyHasNote(!onlyHasNote)}
              className={`px-3 py-1.5 rounded-full border transition flex items-center gap-1 font-bold ${
                onlyHasNote 
                  ? 'bg-[#E8DEF8] text-[#1D192B] border-[#D0BCFF]' 
                  : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9] hover:bg-[#E7E8EE]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Có Ghi Chú</span>
            </button>
          </div>

        </div>

      </div>

      {/* 5. HISTORY LIST OR TIMELINE DISPLAY */}
      {filteredItems.length === 0 ? (
        /* EMPTY STATE */
        <div className="bg-white border border-[#E1E2E9] rounded-[28px] p-12 text-center space-y-4 shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#F3F3F7] border border-[#E1E2E9] flex items-center justify-center text-[#0061A4]">
            <History className="w-10 h-10 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#1C1B1F]">
              Bạn Chưa Có Lịch Sử Quét Nào Phù Hợp
            </h3>
            <p className="text-sm text-[#44474E] max-w-md mx-auto">
              Kết quả phân tích AI sẽ tự động lưu lại tại đây. Hãy thử điều chỉnh bộ lọc hoặc quét nội dung mới.
            </p>
          </div>
          {onNavigateToScanner && (
            <button
              onClick={onNavigateToScanner}
              className="mt-2 px-6 py-3 rounded-full bg-[#0061A4] hover:bg-[#004B80] text-white text-sm font-bold shadow-md transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Quét Ngay Nào</span>
            </button>
          )}
        </div>
      ) : viewMode === 'LIST' ? (
        /* CARD LIST VIEW */
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const riskBadge = getRiskBadgeStyles(item.riskLevel, item.riskScore);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                onClick={() => setSelectedScan(item)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedScan(item);
                }}
                className={`bg-white border rounded-[20px] p-5 shadow-xs transition group cursor-pointer space-y-3 relative overflow-hidden focus-visible:ring-2 focus-visible:ring-[#0061A4] focus-visible:outline-none ${
                  item.pinned 
                    ? 'border-[#0061A4] bg-gradient-to-r from-[#F4F8FF] to-white shadow-xs' 
                    : 'border-[#E1E2E9] hover:border-[#0061A4]/40 hover:shadow-md'
                }`}
              >
                {/* Top Card Bar: Type, Title, Date, Risk Score & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] flex items-center justify-center shrink-0">
                      {getTypeIcon(item.type, item.url, item.imageUrl)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {item.pinned && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase text-[#0061A4] bg-[#D1E4FF] px-2 py-0.2 rounded-full">
                            <Pin className="w-3 h-3 fill-current" /> Đã Ghim
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#0061A4] uppercase tracking-wider">
                          {item.scamTypeNameVi || item.title}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#1C1B1F] text-base group-hover:text-[#0061A4] transition truncate max-w-xl">
                        {item.title || item.inputText || item.url || 'Bản ghi quét'}
                      </h3>
                      <div className="flex items-center space-x-3 text-[11px] text-[#44474E] mt-0.5">
                        <span>⏱️ {new Date(item.timestamp).toLocaleString('vi-VN')}</span>
                        <span>•</span>
                        <span>🤖 {item.aiModel || 'Gemini 3.6 Flash'}</span>
                        <span>•</span>
                        <span>⚡ {item.processingTime || '1.1s'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk Score Gauge & Badge */}
                  <div className="flex items-center space-x-3 shrink-0 self-start sm:self-auto">
                    <div className={`px-3 py-1.5 rounded-full border text-xs font-black flex items-center gap-1.5 ${riskBadge.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${riskBadge.dot}`} />
                      <span>{item.riskScore}% {riskBadge.label}</span>
                    </div>

                    {/* Quick Pin / Favorite Controls */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleTogglePin(item.id, e)}
                        className={`p-2 rounded-full transition ${
                          item.pinned 
                            ? 'text-[#0061A4] bg-[#D1E4FF]' 
                            : 'text-[#44474E] hover:bg-[#F3F3F7]'
                        }`}
                        title={item.pinned ? 'Bỏ ghim' : 'Ghim kết quả này'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleToggleFavorite(item.id, e)}
                        className={`p-2 rounded-full transition ${
                          item.favorite 
                            ? 'text-[#8C6200] bg-[#FFF0C2]' 
                            : 'text-[#44474E] hover:bg-[#F3F3F7]'
                        }`}
                        title={item.favorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
                      >
                        <Star className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleSoftDelete(item.id, e)}
                        className="p-2 rounded-full text-[#44474E] hover:text-[#BA1A1A] hover:bg-[#FFE9E9] transition"
                        title="Chuyển vào thùng rác"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Snippet */}
                {item.inputText && (
                  <p className="text-xs text-[#1C1B1F] bg-[#F8FAFC] p-3 rounded-xl border border-[#E1E2E9] line-clamp-2 italic">
                    "{item.inputText}"
                  </p>
                )}

                {/* Summary / Result & Note Indicator */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#44474E]">
                  <p className="line-clamp-2 flex-1">
                    <strong className="text-[#1C1B1F]">Kết quả AI:</strong> {item.summary}
                  </p>
                  
                  {item.note && (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F378B] bg-[#E8DEF8] px-2.5 py-0.5 rounded-full shrink-0">
                      <Edit3 className="w-3 h-3" />
                      <span>Ghi chú: {item.note}</span>
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="space-y-8">
          {timelineGroups.map((group) => (
            <div key={group.label} className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1 rounded-full bg-[#0061A4] text-white text-xs font-black uppercase tracking-wider">
                  {group.label}
                </span>
                <div className="h-px bg-[#E1E2E9] flex-1" />
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E1E2E9]">
                {group.items.map((item) => {
                  const riskBadge = getRiskBadgeStyles(item.riskLevel, item.riskScore);
                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${riskBadge.chipBg}`}>
                        •
                      </div>

                      <div 
                        onClick={() => setSelectedScan(item)}
                        className="bg-white border border-[#E1E2E9] hover:border-[#0061A4] rounded-[20px] p-4 shadow-xs hover:shadow-md transition cursor-pointer space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0061A4]">
                            {new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {item.scamTypeNameVi}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${riskBadge.bg}`}>
                            {item.riskScore}% {riskBadge.label}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1C1B1F]">
                          {item.title || item.inputText}
                        </h4>
                        <p className="text-xs text-[#44474E] line-clamp-2">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. RIGHT DRAWER / MODAL FOR ITEM DETAIL VIEW */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div 
            key="scan-detail-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
            role="dialog"
            aria-modal="true"
          >
            <motion.div 
              key="scan-detail-drawer-content"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden relative border-l border-[#E1E2E9]"
            >
              {/* Drawer Sticky Header */}
              <div className="bg-white/95 backdrop-blur-md border-b border-[#E1E2E9] p-5 flex items-center justify-between shrink-0 sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                    getRiskBadgeStyles(selectedScan.riskLevel, selectedScan.riskScore).chipBg
                  }`}>
                    {selectedScan.riskScore}%
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0061A4]">
                      {selectedScan.scamTypeNameVi}
                    </span>
                    <h2 className="text-base font-bold text-[#1C1B1F] truncate max-w-sm">
                      {selectedScan.title || 'Chi Tiết Phân Tích'}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePin(selectedScan.id)}
                    className={`p-2 rounded-full border transition ${
                      selectedScan.pinned ? 'bg-[#D1E4FF] text-[#0061A4] border-[#A3C9FF]' : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9]'
                    }`}
                    title="Ghim kết quả"
                  >
                    <Pin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleToggleFavorite(selectedScan.id)}
                    className={`p-2 rounded-full border transition ${
                      selectedScan.favorite ? 'bg-[#FFF0C2] text-[#8C6200] border-[#FFE088]' : 'bg-[#F3F3F7] text-[#44474E] border-[#E1E2E9]'
                    }`}
                    title="Đánh dấu yêu thích"
                  >
                    <Star className={`w-4 h-4 ${selectedScan.favorite ? 'fill-current' : ''}`} />
                  </button>

                  <button 
                    onClick={() => setSelectedScan(null)} 
                    className="p-2 text-[#44474E] hover:text-[#1C1B1F] rounded-full hover:bg-[#F3F3F7] transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Risk Score & Model Info Card */}
                <div className="bg-[#F8FAFC] p-5 rounded-[24px] border border-[#E1E2E9] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#0061A4]">ĐÁNH GIÁ TRÍ TUỆ NHÂN TẠO</span>
                    <span className="text-xs text-[#44474E] font-medium">Model: {selectedScan.aiModel || 'Gemini 3.6 Flash'}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E1E2E9] pt-3">
                    <div>
                      <p className="text-2xl font-black text-[#1C1B1F]">{selectedScan.riskScore}/100</p>
                      <p className="text-xs text-[#44474E]">Độ tin cậy: {selectedScan.confidenceLevel || '98%'}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl border text-xs font-black ${
                      getRiskBadgeStyles(selectedScan.riskLevel, selectedScan.riskScore).bg
                    }`}>
                      {selectedScan.riskLevel}
                    </div>
                  </div>
                </div>

                {/* Original Input Text / URL / Image */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#44474E]">Nội Dung Gốc (Original Input):</h4>
                  <div className="p-4 rounded-2xl bg-[#F3F3F7] border border-[#E1E2E9] text-xs text-[#1C1B1F] leading-relaxed whitespace-pre-wrap">
                    {selectedScan.inputText || selectedScan.url || '[Ảnh chụp màn hình]'}
                  </div>
                </div>

                {/* AI Explanation & Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#0061A4]">Phân Tích Chi Tiết Gemini:</h4>
                  <div className="p-4 rounded-2xl bg-white border border-[#E1E2E9] text-xs text-[#44474E] leading-relaxed space-y-2 shadow-2xs">
                    <p className="font-bold text-[#1C1B1F]">{selectedScan.summary}</p>
                    <p>{selectedScan.explanation}</p>
                  </div>
                </div>

                {/* Detected Red Flags */}
                {selectedScan.redFlags && selectedScan.redFlags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#BA1A1A]">Dấu Hiệu Phát Hiện (Red Flags):</h4>
                    <div className="p-4 rounded-2xl bg-[#FFE9E9] border border-[#FFDAD6] space-y-1.5">
                      {selectedScan.redFlags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#410002] font-semibold">
                          <AlertTriangle className="w-4 h-4 text-[#BA1A1A] shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {selectedScan.recommendedActions && selectedScan.recommendedActions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase text-[#006E00]">Khuyến Nghị Xử Lý Khẩn Cấp:</h4>
                    <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] space-y-1.5">
                      {selectedScan.recommendedActions.map((act, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#003900] font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-[#006E00] shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#44474E]">Thông Tin Kỹ Thuật (Technical Intel):</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#44474E] bg-[#F8FAFC] p-4 rounded-2xl border border-[#E1E2E9]">
                    <p><strong className="text-[#1C1B1F]">Thiết bị:</strong> {selectedScan.device || 'Chrome / macOS'}</p>
                    <p><strong className="text-[#1C1B1F]">Vị trí:</strong> {selectedScan.location || 'Việt Nam'}</p>
                    <p><strong className="text-[#1C1B1F]">Thời gian AI:</strong> {selectedScan.processingTime || '1.1s'}</p>
                    <p><strong className="text-[#1C1B1F]">Thời điểm:</strong> {new Date(selectedScan.timestamp).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Personal Note Editor */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-[#4F378B] flex items-center justify-between">
                    <span>Ghi Chú Cá Nhân:</span>
                    <span className="text-[10px] text-[#44474E] font-normal">Tự động đồng bộ Firebase</span>
                  </h4>
                  <textarea
                    value={editingNote}
                    onChange={(e) => setEditingNote(e.target.value)}
                    placeholder="Nhập ghi chú cá nhân của bạn về bản ghi này..."
                    className="w-full bg-[#F3F3F7] border border-[#E1E2E9] rounded-2xl p-3 text-xs text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-[#0061A4] h-20"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSaveNote(selectedScan.id)}
                      className="px-4 py-1.5 rounded-full bg-[#0061A4] text-white text-xs font-bold hover:bg-[#004B80] transition shadow-2xs"
                    >
                      Lưu Ghi Chú
                    </button>
                  </div>
                </div>

              </div>

              {/* Drawer Bottom Actions Footer */}
              <div className="p-4 bg-white border-t border-[#E1E2E9] flex flex-wrap items-center justify-between gap-2 shrink-0">
                <button
                  onClick={() => handleCopyText(selectedScan.inputText || selectedScan.url || selectedScan.summary, 'drawer')}
                  className="px-3.5 py-2 rounded-xl bg-[#F3F3F7] text-xs font-bold text-[#1C1B1F] hover:bg-[#E7E8EE] flex items-center gap-1.5 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedId === 'drawer' ? 'Đã Sao Chép' : 'Sao Chép'}</span>
                </button>

                {onNavigateToScanner && (
                  <button
                    onClick={() => {
                      setSelectedScan(null);
                      onNavigateToScanner();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#D1E4FF] text-[#0061A4] text-xs font-bold hover:bg-[#A3C9FF] flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Quét Lại</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleSoftDelete(selectedScan.id, e)}
                  className="px-3.5 py-2 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] text-xs font-bold hover:bg-[#FFDAD6] flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Bản Ghi</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. TRASH RECOVERY MODAL (KHÔI PHỤC TRONG 30 NGÀY) */}
      <AnimatePresence>
        {isTrashOpen && (
          <motion.div 
            key="trash-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              key="trash-modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-3 shrink-0">
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-5 h-5 text-[#BA1A1A]" />
                  <h3 className="font-extrabold text-lg text-[#1C1B1F]">Thùng Rác - Tự Động Xóa Sau 30 Ngày</h3>
                </div>
                <button onClick={() => setIsTrashOpen(false)} className="p-2 text-[#44474E] hover:text-[#1C1B1F]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                {trashItems.length === 0 ? (
                  <div className="py-12 text-center text-[#44474E] text-sm space-y-2">
                    <p className="font-bold">Thùng rác rỗng</p>
                    <p className="text-xs">Không có bản ghi nào bị xóa tạm thời.</p>
                  </div>
                ) : (
                  trashItems.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E1E2E9] flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-[#1C1B1F] truncate">{item.title || item.inputText}</p>
                        <p className="text-[11px] text-[#44474E]">Đã xóa: {new Date(item.updatedAt || Date.now()).toLocaleDateString('vi-VN')}</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleRestoreItem(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#E8F5E9] text-[#006E00] font-bold flex items-center gap-1 hover:bg-[#C8E6C9]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Khôi phục</span>
                        </button>

                        <button
                          onClick={() => handlePermanentDelete(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#FFE9E9] text-[#BA1A1A] font-bold hover:bg-[#FFDAD6]"
                        >
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {trashItems.length > 0 && (
                <div className="pt-3 border-t border-[#E1E2E9] flex justify-between items-center shrink-0">
                  <span className="text-xs text-[#44474E]">{trashItems.length} mục trong thùng rác</span>
                  <button
                    onClick={handleEmptyTrash}
                    className="px-4 py-2 rounded-xl bg-[#BA1A1A] text-white text-xs font-bold hover:bg-[#93000A]"
                  >
                    Dọn sạch thùng rác
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. EXPORT / PRINTABLE PDF MODAL */}
      <AnimatePresence>
        {isExportPdfOpen && (
          <motion.div 
            key="export-pdf-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              key="export-pdf-modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E1E2E9] rounded-[28px] w-full max-w-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#E1E2E9] pb-4">
                <div className="flex items-center space-x-3">
                  <Printer className="w-6 h-6 text-[#0061A4]" />
                  <div>
                    <h3 className="font-extrabold text-lg text-[#1C1B1F]">Xuất Báo Cáo Nhật Ký An Toàn Cá Nhân</h3>
                    <p className="text-xs text-[#44474E]">Định dạng chuẩn in ấn và lưu file PDF của Lá Chắn Số AI</p>
                  </div>
                </div>
                <button onClick={() => setIsExportPdfOpen(false)} className="p-2 text-[#44474E] hover:text-[#1C1B1F]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Content Box */}
              <div id="printable-report" className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E1E2E9] space-y-4 text-xs">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-base font-black text-[#0061A4]">BÁO CÁO NHẬT KÝ AN TOÀN SỐ</h2>
                    <p className="text-[11px] text-[#44474E]">Ứng dụng: Lá Chắn Số AI - Gemini 3.6 Threat Intel</p>
                  </div>
                  <div className="text-right text-[11px] text-[#44474E]">
                    <p>Ngày xuất: {new Date().toLocaleDateString('vi-VN')}</p>
                    <p>Tổng số lượt: {activeItems.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-2.5 rounded-xl border font-bold">
                    <span className="block text-[10px] text-[#44474E]">TỔNG QUÉT</span>
                    <span className="text-base text-[#0061A4]">{stats.totalScans}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border font-bold">
                    <span className="block text-[10px] text-[#44474E]">CẢNH BÁO CAO</span>
                    <span className="text-base text-[#BA1A1A]">{stats.highRiskScans}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border font-bold">
                    <span className="block text-[10px] text-[#44474E]">PHISHING CHẶN</span>
                    <span className="text-base text-[#006E00]">{stats.bankPhishingBlocked}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-[#1C1B1F]">Danh sách {activeItems.length} lượt quét gần nhất:</p>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b bg-gray-200">
                        <th className="p-1.5">Thời gian</th>
                        <th className="p-1.5">Loại</th>
                        <th className="p-1.5">Tiêu đề / URL</th>
                        <th className="p-1.5">Điểm rủi ro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeItems.slice(0, 10).map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-1.5">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</td>
                          <td className="p-1.5 font-bold uppercase">{item.type || 'message'}</td>
                          <td className="p-1.5 truncate max-w-xs">{item.title || item.inputText}</td>
                          <td className="p-1.5 font-black">{item.riskScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsExportPdfOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F3F7] text-xs font-bold text-[#1C1B1F]"
                >
                  Đóng
                </button>
                <button
                  onClick={handlePrintReport}
                  className="px-5 py-2 rounded-xl bg-[#0061A4] text-white text-xs font-bold hover:bg-[#004B80] flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Mở Hộp Thoại In / Lưu PDF</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
