import { ScamAnalysisResult, UrlAnalysisResult, CommunityReport, ChatMessage } from '../types';

export async function scanScamMessage(text?: string, base64Image?: string): Promise<ScamAnalysisResult> {
  const response = await fetch('/api/scan-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, base64Image }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể kết nối đến Gemini AI Server để phân tích.');
  }

  const data = await response.json();
  return enrichAnalysisResult(data, text);
}

function enrichAnalysisResult(result: ScamAnalysisResult, text?: string): ScamAnalysisResult {
  if (!result.timeline) {
    result.timeline = generateMockTimeline(result.riskScore, result.scamType);
  }
  if (!result.similarCases) {
    result.similarCases = generateMockSimilarCases(result.scamType);
  }
  return result;
}

function generateMockCyberAnalysis(text?: string, base64Image?: string): ScamAnalysisResult {
  const content = (text || '').toLowerCase();
  let riskScore = 92;
  let scamType: ScamAnalysisResult['scamType'] = 'BANK_IMPERSONATION';
  let scamTypeNameVi = 'Giả Danh Ngân Hàng / Phishing';
  let summary = 'Cảnh báo nguy cơ cao: Tin nhắn mạo danh tổ chức tài chính nhằm chiếm đoạt tài khoản VCB Digibank và mã OTP giao dịch.';

  if (content.includes('shopee') || content.includes('tiki') || content.includes('chốt đơn') || content.includes('cộng tác viên')) {
    riskScore = 88;
    scamType = 'JOB_VACANCY';
    scamTypeNameVi = 'Bẫy Việc Làm Online / Chốt Đơn';
    summary = 'Cảnh báo nguy cơ cao: Thủ đoạn dụ dỗ tuyển cộng tác viên thu nhập cao, yêu cầu nạp tiền cọc làm nhiệm vụ tăng hoa hồng.';
  } else if (content.includes('công an') || content.includes('vneid') || content.includes('phạt nguội') || content.includes('tòa án')) {
    riskScore = 96;
    scamType = 'GOVERNMENT_AUTHORITY';
    scamTypeNameVi = 'Giả Danh Công An / Tòa Án';
    summary = 'Rất nguy hiểm: Kịch bản đe dọa khởi tố, giả mạo cán bộ cơ quan nhà nước yêu cầu cài file APK độc hại hoặc chuyển tiền bảo đảm.';
  } else if (content.includes('mẹ ơi') || content.includes('con bị') || content.includes('hỏng xe') || content.includes('chuyển gấp')) {
    riskScore = 85;
    scamType = 'FAMILY_EMERGENCY';
    scamTypeNameVi = 'Giả Thân Nhân Cấp Cứu';
    summary = 'Cảnh báo nguy hiểm: Mạo danh người thân gặp tai nạn/sự cố khẩn cấp yêu cầu chuyển tiền vào tài khoản trung gian.';
  }

  return {
    id: 'scan-' + Date.now(),
    timestamp: Date.now(),
    inputType: text && base64Image ? 'both' : base64Image ? 'image' : 'text',
    inputText: text,
    riskScore,
    riskLevel: riskScore >= 80 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : 'WARNING',
    scamType,
    scamTypeNameVi,
    summary,
    explanation: 'Dữ liệu chứa các từ khóa kích động tâm lý khẩn cấp, sử dụng đường dẫn URL bất thường không thuộc tên miền chính thức (.gov.vn hoặc .com.vn). Kẻ lừa đảo sử dụng kỹ thuật mạo danh thương hiệu để tạo lòng tin giả.',
    redFlags: [
      'Tên miền URL có đuôi lạ (ví dụ: -xacnhan.com, .xyz, .top)',
      'Tạo áp lực thời gian khẩn cấp (yêu cầu xử lý trong 24h hoặc bị khóa tài khoản)',
      'Yêu cầu cung cấp thông tin nhạy cảm: Mật khẩu, Mã PIN, OTP',
      'Tài khoản người nhận tiền là tài khoản cá nhân thay vì tài khoản doanh nghiệp chính thức'
    ],
    recommendedActions: [
      'KHÔNG bấm vào bất kỳ đường link nào trong tin nhắn hoặc ứng dụng',
      'Gọi ngay cho tổng đài chính thức của ngân hàng hoặc tổ chức liên quan để xác minh',
      'Khóa khẩn cấp ứng dụng Ngân hàng trực tuyến nếu đã lỡ nhập thông tin',
      'Gửi báo cáo số điện thoại/STK kẻ lừa đảo lên Cơ sở dữ liệu Cảnh Báo Cộng Đồng',
      'Trình báo cho cơ quan Công an gần nhất hoặc gọi Hotline 113 / 156'
    ],
    emergencyHotlines: ['113 (Công An Khẩn Cấp)', '156 (Bộ Thông Tin & Truyền Thông)', '1900 54 54 13 (Vietcombank)'],
    timeline: generateMockTimeline(riskScore, scamType),
    similarCases: generateMockSimilarCases(scamType)
  };
}

function generateMockTimeline(riskScore: number, scamType: string) {
  return [
    {
      stepNumber: 1,
      timeOffset: '00:00',
      title: 'Tiếp Cận Khởi Đầu (Initial Contact)',
      description: 'Kẻ gian gửi tin nhắn SMS Brandname giả mạo hoặc tin nhắn OTT (Zalo/Telegram) chứa lời mời/thông báo gấp.',
      severity: 'INFO' as const,
    },
    {
      stepNumber: 2,
      timeOffset: '00:02',
      title: 'Bẫy Tâm Lý & Đường Link Độc Hại',
      description: 'Nạn nhân bị kích động lo sợ hoặc tham hám lợi nhuận, bấm vào liên kết phishing hoặc ứng dụng giả.',
      severity: 'WARNING' as const,
    },
    {
      stepNumber: 3,
      timeOffset: '00:05',
      title: 'Thu Thuật Thu Thập Cung Cấp OTP / Mật Khẩu',
      description: 'Giao diện nhái trang đăng nhập ngân hàng yêu cầu nhập Tên đăng nhập, Mật khẩu và Mã xác thực OTP.',
      severity: 'CRITICAL' as const,
    },
    {
      stepNumber: 4,
      timeOffset: '00:08',
      title: 'Rút Tiền Khỏi Tài Khoản & Tẩu Tán Asset',
      description: 'Hệ thống tự động thực hiện lệnh chuyển tiền đến chuỗi tài khoản rác (mule accounts) liên ngân hàng.',
      severity: 'CRITICAL' as const,
    },
  ];
}

function generateMockSimilarCases(scamType: string) {
  return [
    {
      id: 'case-1082',
      title: 'Mạo danh Vietcombank gửi link giả mạo digibank',
      scamTypeNameVi: 'Giả Danh Ngân Hàng',
      similarityScore: 96,
      reportedDate: 'Hôm nay, 14:20',
      location: 'Quận Cầu Giấy, Hà Nội',
      targetInfo: 'STK 1029384756 (MBBank)',
      summary: 'Đối tượng dùng SMS Brandname giả mạo thông báo tài khoản bị khóa, dẫn đường link giả cướp OTP.',
      status: 'VERIFIED' as const,
    },
    {
      id: 'case-1079',
      title: 'Cảnh báo bẫy lừa đảo qua trang web nhái .xyz',
      scamTypeNameVi: 'Tên Miền Phishing',
      similarityScore: 89,
      reportedDate: 'Hôm qua, 09:15',
      location: 'Quận 1, TP. Hồ Chí Minh',
      targetInfo: 'SĐT 0901234567 (Zalo)',
      summary: 'Gửi tin nhắn tri ân tặng quà Shopee yêu cầu nạp tiền phí vận chuyển 500k.',
      status: 'VERIFIED' as const,
    },
    {
      id: 'case-1071',
      title: 'Giả danh cán bộ Công an yêu cầu cập nhật VNeID mức 2',
      scamTypeNameVi: 'Giả Cơ Quan Nhà Nước',
      similarityScore: 82,
      reportedDate: '01/08/2026',
      location: 'Thành phố Đà Nẵng',
      targetInfo: 'App VNeID-ChinhThuc.apk',
      summary: 'Hướng dẫn cài ứng dụng chứa mã độc trojan chiếm quyền điều khiển điện thoại từ xa.',
      status: 'INVESTIGATING' as const,
    }
  ];
}

export async function scanWebsiteUrl(url: string): Promise<UrlAnalysisResult> {
  const response = await fetch('/api/scan-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể kiểm tra địa chỉ website này');
  }

  return response.json();
}

export async function sendChatMessage(history: ChatMessage[], newMessage: string): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, message: newMessage }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Lỗi khi phản hồi từ Trợ Lý AI');
  }

  const data = await response.json();
  return data.reply;
}

export async function sendChatMessageStream(
  history: ChatMessage[],
  newMessage: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const response = await fetch('/api/chat-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message: newMessage }),
    });

    if (!response.ok || !response.body) {
      // Fallback to non-streaming if stream endpoint is unavailable
      const reply = await sendChatMessage(history, newMessage);
      onChunk(reply);
      return reply;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6).trim();
          if (dataStr === '[DONE]') {
            break;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              fullText += parsed.text;
              onChunk(parsed.text);
            } else if (parsed.error) {
              if (!fullText) {
                fullText = parsed.error;
                onChunk(parsed.error);
              }
            }
          } catch {
            // Ignore JSON parse errors on partial fragments
          }
        }
      }
    }

    if (!fullText) {
      // If stream produced empty output, call non-streaming endpoint
      const reply = await sendChatMessage(history, newMessage);
      onChunk(reply);
      return reply;
    }

    return fullText;
  } catch (err) {
    console.warn('Chat stream error, falling back to standard API call:', err);
    const reply = await sendChatMessage(history, newMessage);
    onChunk(reply);
    return reply;
  }
}

export async function fetchCommunityReports(): Promise<CommunityReport[]> {
  try {
    const response = await fetch('/api/community-reports');
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Using fallback reports data');
  }
  return [];
}

export async function createCommunityReport(report: Partial<CommunityReport>): Promise<CommunityReport> {
  const response = await fetch('/api/community-reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error('Lỗi khi gửi báo cáo');
  }

  return response.json();
}

export interface ExtractedStoryIntelligence {
  title?: string;
  scamType?: string;
  scamTypeNameVi?: string;
  targetPhone?: string | null;
  targetBankAccount?: string | null;
  targetBankName?: string | null;
  targetAccountName?: string | null;
  targetUrl?: string | null;
  approachChannel?: string;
  estimatedLoss?: string | null;
  riskLevel?: 'CRITICAL' | 'HIGH' | 'WARNING';
  riskScore?: number;
  summary?: string;
  redFlags?: string[];
  recommendedActions?: string[];
}

export async function extractStoryIntelligence(story?: string, images?: string[]): Promise<ExtractedStoryIntelligence> {
  const response = await fetch('/api/extract-story-intelligence', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ story, images }),
  });

  if (!response.ok) {
    throw new Error('Không thể bóc tách câu chuyện bằng AI');
  }

  return response.json();
}

