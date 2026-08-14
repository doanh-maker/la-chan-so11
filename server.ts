import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_REPORTS } from './src/data/mockReports.js';
import { CommunityReport } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini AI Client
const getGenAIClient = () => {
  let apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  }
  if (!apiKey) {
    console.warn("⚠️ Warning: GEMINI_API_KEY is missing. AI analysis will operate with default guidance mode.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "MISSING_KEY",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const getFallbackModels = (): string[] => {
  const envModel = process.env.GEMINI_MODEL;
  const customList = process.env.GEMINI_FALLBACK_MODELS ? process.env.GEMINI_FALLBACK_MODELS.split(',').map(m => m.trim()).filter(Boolean) : [];
  
  const defaults = [
    'gemini-flash-latest',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
  ];

  const models = [
    ...(envModel ? [envModel.trim()] : []),
    ...customList,
    ...defaults
  ];

  return Array.from(new Set(models));
};

const FALLBACK_MODELS = getFallbackModels();

const isRetryableGeminiError = (err: any): boolean => {
  if (!err) return false;
  const status = err?.status;
  const msg = String(err?.message || '');
  return (
    status === 429 ||
    status === 404 ||
    status === 503 ||
    msg.includes('429') ||
    msg.includes('404') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('no longer available') ||
    msg.includes('NOT_FOUND') ||
    msg.includes('rate limit')
  );
};

const generateContentWithFallback = async (ai: GoogleGenAI, params: any) => {
  let lastError: any = null;
  for (const model of FALLBACK_MODELS) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      lastError = err;
      if (isRetryableGeminiError(err)) {
        console.warn(`[Gemini Fallback] Model ${model} failed (${err?.status || 'Error'}), trying next model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

const sendQuotaOrGeneralError = (res: express.Response, error: any, defaultMsg: string) => {
  const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
  if (isQuota) {
    return res.status(429).json({
      message: 'Hệ thống AI tạm thời quá tải hoặc hết hạn mức miễn phí (Rate Limit 429). Vui lòng thử lại sau 1-2 phút hoặc chuyển sang gói Pay-As-You-Go trên Google AI Studio.',
    });
  }
  return res.status(500).json({ message: defaultMsg });
};

const inMemoryReports: CommunityReport[] = [...INITIAL_REPORTS];

// Input sanitization and validation helpers
function sanitizeText(input: unknown, maxLength: number = 5000): string {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim().slice(0, maxLength);
  // Basic HTML tag stripping for XSS prevention
  return trimmed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function isValidHttpUrl(urlStr: unknown): boolean {
  if (typeof urlStr !== 'string' || !urlStr.trim()) return false;
  const trimmed = urlStr.trim();
  if (trimmed.length > 2048) return false;
  
  // Reject dangerous pseudo-protocols explicitly
  if (/^(javascript|data|file|vbscript|blob):/i.test(trimmed)) {
    return false;
  }
  
  try {
    const parsed = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function safeParseJson<T = any>(rawText: string): T | null {
  if (!rawText) return null;
  const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function getMockSimulationFallback(scenario: any, userMsg: string, actionTaken: any) {
  const isTrapAction = actionTaken && (actionTaken.type === 'CLICKED_LINK' || actionTaken.type === 'DOWNLOADED_APK' || actionTaken.type === 'ENTERED_OTP' || actionTaken.type === 'TRANSFERRED_MONEY');
  const lowerMsg = (userMsg || '').toLowerCase();
  
  const mentionsPoliceOffice = lowerMsg.includes('công an phường') || lowerMsg.includes('trụ sở') || lowerMsg.includes('giấy mời') || lowerMsg.includes('113') || lowerMsg.includes('hotline');
  const mentionsRefusal = lowerMsg.includes('từ chối') || lowerMsg.includes('lừa đảo') || lowerMsg.includes('báo công an') || lowerMsg.includes('không tin');
  const givesSensitiveData = lowerMsg.includes('otp') || lowerMsg.includes('mật khẩu') || lowerMsg.includes('pass') || /\b\d{6}\b/.test(lowerMsg);

  if (isTrapAction || givesSensitiveData) {
    return {
      scammerResponse: "Hệ thống đang xử lý yêu cầu của anh/chị. Vui lòng giữ máy và không thao tác gì thêm để hoàn tất giao dịch!",
      actionBait: { type: "none" },
      coachEvaluation: {
        scoreDelta: -30,
        threatDetected: true,
        severity: "DANGER",
        trapName: "Sập bẫy cung cấp thông tin/hành động nguy hiểm",
        coachAdvice: "Cảnh báo nguy cấp: Bạn đã thực hiện hành động do kẻ lừa đảo yêu cầu. Trong thực tế, tài khoản hoặc thiết bị của bạn đã bị xâm nhập!",
        isSimulationEnded: true,
        endOutcome: "TRAPPED"
      },
      suggestedReplies: [
        "Tôi nhận ra đây là bẫy và sẽ lập tức đổi mật khẩu ngân hàng!",
        "Tôi sẽ khóa tài khoản ngay lập tức."
      ]
    };
  }

  if (mentionsPoliceOffice || mentionsRefusal) {
    return {
      scammerResponse: "Anh/chị không chịu hợp tác đúng không? Tôi nhắc lại đây là việc khẩn cấp liên quan đến an ninh tài khoản, nếu anh/chị tự ý chịu trách nhiệm thì tôi sẽ lập biên bản ngay!",
      actionBait: { type: "none" },
      coachEvaluation: {
        scoreDelta: 25,
        threatDetected: true,
        severity: "SAFE_DEFENSE",
        trapName: "Phòng thủ kiên định & Vạch trần",
        coachAdvice: "Rất tốt! Phản xạ kiên quyết yêu cầu làm việc trực tiếp hoặc từ chối hành vi hối thúc là chìa khóa bẻ gãy đòn thao túng tâm lý.",
        isSimulationEnded: false,
        endOutcome: "IN_PROGRESS"
      },
      suggestedReplies: [
        "Tôi sẽ chỉ làm việc trực tiếp tại cơ quan có thẩm quyền.",
        "Mời anh gửi giấy triệu tập/giấy mời chính thức về địa chỉ cư trú của tôi.",
        "Tôi đã ghi âm cuộc gọi và báo cáo lên đường dây nóng 113."
      ]
    };
  }

  return {
    scammerResponse: "Tôi đã gửi hướng dẫn xử lý khẩn cấp qua tin nhắn cho anh/chị. Anh/chị kiểm tra ngay và làm theo để tránh bị khóa dịch vụ trong hôm nay!",
    actionBait: {
      type: scenario?.platform === 'sms' ? 'link' : scenario?.category === 'GOVERNMENT_AUTHORITY' ? 'apk_download' : 'none',
      title: scenario?.platform === 'sms' ? 'Bấm để xác minh tài khoản' : 'Tải ứng dụng hỗ trợ .apk',
      payload: 'https://kiemtra-baomat-xacminh.com'
    },
    coachEvaluation: {
      scoreDelta: 5,
      threatDetected: true,
      severity: "WARNING",
      trapName: "Tạo áp lực thời gian",
      coachAdvice: "Kẻ xấu đang cố tình tạo cảm giác gấp gáp để bạn không kịp suy nghĩ kỹ. Hãy yêu cầu giấy tờ hoặc thông tin xác minh rõ ràng.",
      isSimulationEnded: false,
      endOutcome: "IN_PROGRESS"
    },
    suggestedReplies: [
      "Tại sao cơ quan nhà nước / ngân hàng lại gửi đường link lạ như vậy?",
      "Tôi cần xác minh danh tính của anh trước khi tiếp tục.",
      "Tôi sẽ liên hệ tổng đài chính thức để kiểm tra thông tin này."
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Production request logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'production') {
        console.log(JSON.stringify({
          severity: res.statusCode >= 400 ? 'WARNING' : 'INFO',
          method: req.method,
          path: req.path,
          status: res.statusCode,
          durationMs: duration,
          timestamp: new Date().toISOString()
        }));
      } else {
        console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // Health check endpoint for Cloud Run readiness & liveness probes
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'lachanso-ai-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY
    });
  });

  // API 1: Scan Message (Text or Image Screenshot)
  app.post('/api/scan-message', async (req, res) => {
    try {
      const text = sanitizeText(req.body.text, 10000);
      const rawBase64 = typeof req.body.base64Image === 'string' ? req.body.base64Image : '';

      if (!text && !rawBase64) {
        return res.status(400).json({ message: 'Vui lòng cung cấp nội dung tin nhắn hoặc hình ảnh cần phân tích.' });
      }

      // Base64 volumetric check (max ~7MB base64)
      if (rawBase64.length > 7000000) {
        return res.status(400).json({ message: 'Kích thước hình ảnh quá lớn. Vui lòng tải lên ảnh dưới 5MB.' });
      }

      const ai = getGenAIClient();

      const promptText = `
Bạn là "Lá Chắn Số AI" - Chuyên gia Hàng đầu về An ninh mạng và Phòng chống Lừa đảo Trực tuyến tại Việt Nam.
Nhiệm vụ của bạn là phân tích nội dung (tin nhắn, email, lời mời công việc, hoặc hình ảnh chụp màn hình do OCR/Vision phân tích) và đưa ra đánh giá an toàn, cảnh báo lừa đảo một cách chính xác, dễ hiểu cho người dân Việt Nam.

Nội dung do người dùng cung cấp:
${text ? `Lời nhắn/Văn bản: "${text}"` : ''}
${rawBase64 ? '[Kèm ảnh chụp màn hình - Hãy sử dụng Gemini Vision trích xuất văn bản & nhận diện giao diện nhái, logo giả mạo, phông chữ bất thường]' : ''}

Hãy phân tích và xuất kết quả theo định dạng JSON chuẩn với các thuộc tính:
- riskScore: số nguyên từ 0 đến 100 (0 = Tuyệt đối an toàn, 100 = Lừa đảo cực kỳ nguy hiểm)
- riskLevel: một trong 4 mức: "SAFE" (0-20), "WARNING" (21-50), "HIGH" (51-80), "CRITICAL" (81-100)
- scamType: chọn loại lừa đảo chính xác nhất trong các loại sau:
  "BANK_IMPERSONATION", "GOVERNMENT_AUTHORITY", "JOB_VACANCY", "E_COMMERCE_PRIZE", "CREDIT_LOAN", "DEEPFAKE_CALL", "CRYPTO_INVESTMENT", "PHISHING_LINK", "FAMILY_EMERGENCY", "OTHER"
- scamTypeNameVi: Tên loại lừa đảo bằng tiếng Việt ngắn gọn (Ví dụ: "Lừa đảo giả danh Ngân hàng", "Bẫy việc làm nhẹ lương cao", "Giả danh Công an/Tòa án")
- confidenceScore: số nguyên từ 0 đến 100 thể hiện độ tin cậy của AI trong đánh giá này (Ví dụ: 95)
- confidenceLevel: Chuỗi mức độ tin cậy tiếng Việt (Ví dụ: "95% (Cực kỳ tin cậy)", "88% (Rất cao)")
- summary: Tóm tắt 1-2 câu kết luận chính yếu.
- explanation: Giải thích chi tiết, ngắn gọn lý do tại sao nội dung này lại có dấu hiệu lừa đảo hoặc an toàn.
- redFlags: Mảng các chuỗi dấu hiệu bất thường phát hiện được.
- recommendedActions: Mảng các bước hành động khuyến nghị khẩn cấp cho người dùng.
- emergencyHotlines: Mảng số điện thoại hỗ trợ khẩn cấp nếu cần (Ví dụ: ["113 (Công an)", "156 (Cục ATTT)", "Hotline ngân hàng"]).
`;

      const contents: any[] = [];
      if (rawBase64) {
        const mimeMatch = rawBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
        const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '');
        contents.push({
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        });
      }
      contents.push({ text: promptText });

      const response = await generateContentWithFallback(ai, {
        contents: { parts: contents },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING },
              scamType: { type: Type.STRING },
              scamTypeNameVi: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
              confidenceLevel: { type: Type.STRING },
              summary: { type: Type.STRING },
              explanation: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
              emergencyHotlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['riskScore', 'riskLevel', 'scamType', 'scamTypeNameVi', 'summary', 'explanation', 'redFlags', 'recommendedActions'],
          },
        },
      });

      const resultText = response.text || '{}';
      const parsed = JSON.parse(resultText);

      return res.json({
        id: 'scan-' + Date.now(),
        timestamp: Date.now(),
        inputType: text && rawBase64 ? 'both' : rawBase64 ? 'image' : 'text',
        inputText: text,
        ...parsed,
      });

    } catch (error: any) {
      console.error('Lỗi khi phân tích tin nhắn lừa đảo:', error);
      return sendQuotaOrGeneralError(res, error, 'Không thể phân tích dữ liệu lúc này. Vui lòng thử lại sau.');
    }
  });

  // API 2: Scan Website / URL
  app.post('/api/scan-url', async (req, res) => {
    try {
      const rawUrl = typeof req.body.url === 'string' ? req.body.url.trim() : '';

      if (!isValidHttpUrl(rawUrl)) {
        return res.status(400).json({ message: 'Vui lòng nhập địa chỉ website URL hợp lệ (ví dụ: https://example.com).' });
      }

      let normalizedUrl = rawUrl;
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      const ai = getGenAIClient();

      const promptText = `
Bạn là hệ thống kiểm tra độc hại và giả mạo website "Lá Chắn Số AI" Việt Nam.
Hãy phân tích URL sau: "${normalizedUrl}" (gốc người dùng nhập: "${rawUrl}")

Đánh giá các khía cạnh an ninh mạng & kỹ thuật:
1. Tên miền có dấu hiệu Typosquatting / Homograph (nhái tên miền thương hiệu lớn tại Việt Nam như VCB, Techcombank, VPBank, MBBank, Shopee, Tiki, Lazada, Cổng thông tin Chính phủ, VNeID, Momo, Zalo, Viettel, Vinaphone, Mobifone)?
2. Đuôi tên miền có độ tin cậy thấp hoặc rủi ro cao (như .xyz, .top, .app-free, .vip, .cc, .site, .online, .club, .buzz, .casa, .icu)?
3. Cấu trúc URL có chứa đuôi file thực thi (.apk, .exe, .scr) hoặc trang đăng nhập phishing giả mạo?
4. Đăng ký thông tin giả mạo hoặc chứa các từ khóa kích thích lừa đảo ("xac-nhan", "khuyen-mai", "tri-an", "quang-cao", "nhan-qua", "nap-the").

Xuất kết quả dưới dạng JSON:
- riskScore: số nguyên 0..100 (0 = An toàn tuyệt đối, 100 = Trang phishing/độc hại cực kỳ nguy hiểm)
- riskLevel: "SAFE" | "WARNING" | "HIGH" | "CRITICAL"
- isPhishing: boolean (true nếu là trang giả mạo/độc hại)
- brandImpersonated: chuỗi tên thương hiệu bị mạo danh (nếu có, ví dụ "Vietcombank", "Shopee", "Bộ Công An", "VNeID", hoặc null/rỗng nếu không)
- suspiciousIndicators: mảng các chuỗi chỉ số rủi ro / dấu hiệu lừa đảo phát hiện được
- safetyChecklist: {
    hasSsl: boolean,
    isTopDomain: boolean,
    hasTypoSquatting: boolean,
    isKnownScamPattern: boolean
  }
- aiVerdict: Đánh giá tổng quan 2-3 câu bằng tiếng Việt từ Gemini AI
- recommendations: mảng các bước hành động khuyến nghị an toàn cho người dùng
`;

      const response = await generateContentWithFallback(ai, {
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.INTEGER },
              riskLevel: { type: Type.STRING },
              isPhishing: { type: Type.BOOLEAN },
              brandImpersonated: { type: Type.STRING },
              suspiciousIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              safetyChecklist: {
                type: Type.OBJECT,
                properties: {
                  hasSsl: { type: Type.BOOLEAN },
                  isTopDomain: { type: Type.BOOLEAN },
                  hasTypoSquatting: { type: Type.BOOLEAN },
                  isKnownScamPattern: { type: Type.BOOLEAN },
                },
                required: ['hasSsl', 'isTopDomain', 'hasTypoSquatting', 'isKnownScamPattern'],
              },
              aiVerdict: { type: Type.STRING },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['riskScore', 'riskLevel', 'isPhishing', 'suspiciousIndicators', 'safetyChecklist', 'aiVerdict', 'recommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      let domain = rawUrl;
      try {
        const u = new URL(normalizedUrl);
        domain = u.hostname;
      } catch (e) {}

      return res.json({
        id: 'url-' + Date.now(),
        timestamp: Date.now(),
        url: normalizedUrl,
        domain,
        ...parsed,
      });

    } catch (error: any) {
      console.error('Lỗi khi quét URL:', error);
      return sendQuotaOrGeneralError(res, error, 'Không thể phân tích URL lúc này. Vui lòng thử lại.');
    }
  });

  // Helper to format and validate conversation history for Gemini API
  const formatGeminiChatHistory = (rawHistory: any[], currentMessage?: string) => {
    if (!Array.isArray(rawHistory)) return [];

    const validItems: { role: 'user' | 'model'; text: string }[] = [];

    for (const item of rawHistory) {
      const text = sanitizeText(item?.text || '', 5000).trim();
      if (!text) continue;
      const role: 'user' | 'model' = (item?.sender === 'user' || item?.role === 'user') ? 'user' : 'model';
      validItems.push({ role, text });
    }

    // If the last item in history is the identical message currently being sent by user, remove it from history
    if (currentMessage && validItems.length > 0) {
      const last = validItems[validItems.length - 1];
      if (last.role === 'user' && last.text === currentMessage.trim()) {
        validItems.pop();
      }
    }

    // Gemini chat history MUST start with a 'user' turn. Drop any leading 'model' messages (e.g. welcome greeting).
    while (validItems.length > 0 && validItems[0].role !== 'user') {
      validItems.shift();
    }

    // Ensure alternating roles by merging consecutive turns of the same role
    const formatted: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const item of validItems) {
      if (formatted.length > 0 && formatted[formatted.length - 1].role === item.role) {
        formatted[formatted.length - 1].parts[0].text += `\n\n${item.text}`;
      } else {
        formatted.push({
          role: item.role,
          parts: [{ text: item.text }],
        });
      }
    }

    return formatted.slice(-20);
  };

  // API 3: AI Cybersecurity Assistant Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const message = sanitizeText(req.body.message, 5000);
      if (!message) {
        return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống.' });
      }

      const formattedHistory = formatGeminiChatHistory(req.body.history, message);

      const ai = getGenAIClient();

      const systemInstruction = `
Bạn là Trợ Lý AI Chuyên Gia An Ninh Mạng của ứng dụng "Lá Chắn Số AI" Việt Nam.
Phong cách giao tiếp:
- Thân thiện, lịch sự, chu đáo, dễ hiểu, phù hợp với mọi độ tuổi (kể cả người cao tuổi hoặc sinh viên).
- Trả lời bằng tiếng Việt chuẩn, rõ ràng, chia bố cục bằng gạch đầu dòng ngắn gọn.
- Khi người dùng gặp tình huống bị lừa đảo hoặc nghi vấn, luôn hướng dẫn xử lý khẩn cấp (khóa tài khoản ngân hàng, báo đường dây nóng 113, Cục An toàn thông tin 156, VNCERT).
- Tuyệt đối không tư vấn các hành vi xâm nhập, hacker lừa đảo ngược hoặc vi phạm pháp luật.
`;

      let responseText = '';
      let chatSuccess = false;
      let lastErr: any = null;

      for (const model of FALLBACK_MODELS) {
        try {
          const chat = ai.chats.create({
            model,
            config: { systemInstruction },
            history: formattedHistory,
          });
          const response = await chat.sendMessage({ message });
          responseText = response.text || '';
          chatSuccess = true;
          break;
        } catch (err: any) {
          lastErr = err;
          if (isRetryableGeminiError(err)) {
            console.warn(`[Gemini Chat Fallback] Model ${model} failed (${err?.status || 'Error'}), trying next model...`);
            continue;
          }
          throw err;
        }
      }

      if (!chatSuccess && lastErr) {
        throw lastErr;
      }

      return res.json({ reply: responseText });
    } catch (error: any) {
      console.error('Lỗi AI Chat:', error);
      return sendQuotaOrGeneralError(res, error, 'Lỗi khi trò chuyện với Trợ Lý AI. Vui lòng thử lại sau.');
    }
  });

  // API 3.5: AI Cybersecurity Assistant Streaming Chat (Server-Sent Events)
  app.post('/api/chat-stream', async (req, res) => {
    try {
      const message = sanitizeText(req.body.message, 5000);
      if (!message) {
        return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống.' });
      }

      const formattedHistory = formatGeminiChatHistory(req.body.history, message);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const ai = getGenAIClient();

      const systemInstruction = `
Bạn là Trợ Lý AI Chuyên Gia An Ninh Mạng của ứng dụng "Lá Chắn Số AI" Việt Nam.
Phong cách giao tiếp:
- Thân thiện, lịch sự, chu đáo, dễ hiểu, phù hợp với mọi độ tuổi (kể cả người cao tuổi hoặc sinh viên).
- Trả lời bằng tiếng Việt chuẩn, rõ ràng, chia bố cục bằng gạch đầu dòng ngắn gọn.
- Khi người dùng gặp tình huống bị lừa đảo hoặc nghi vấn, luôn hướng dẫn xử lý khẩn cấp (khóa tài khoản ngân hàng, báo đường dây nóng 113, Cục An toàn thông tin 156, VNCERT).
- Tuyệt đối không tư vấn các hành vi xâm nhập, hacker lừa đảo ngược hoặc vi phạm pháp luật.
`;

      let streamSuccess = false;
      let lastErr: any = null;

      for (const model of FALLBACK_MODELS) {
        try {
          const chat = ai.chats.create({
            model,
            config: { systemInstruction },
            history: formattedHistory,
          });

          const streamResponse = await chat.sendMessageStream({ message });
          for await (const chunk of streamResponse) {
            if (chunk.text) {
              res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            }
          }
          res.write('data: [DONE]\n\n');
          res.end();
          streamSuccess = true;
          break;
        } catch (err: any) {
          lastErr = err;
          if (isRetryableGeminiError(err)) {
            console.warn(`[Gemini Chat Stream Fallback] Model ${model} failed (${err?.status || 'Error'}), trying next model...`);
            continue;
          }
          throw err;
        }
      }

      if (!streamSuccess && lastErr) {
        throw lastErr;
      }
    } catch (error: any) {
      console.error('Lỗi AI Chat Stream:', error);
      const isQuota = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      const errText = isQuota
        ? 'Hệ thống AI tạm thời vượt quá hạn mức truy cập miễn phí (Quota Exceeded 429). Vui lòng thử lại sau 1-2 phút.'
        : 'Lỗi phát sinh trong quá trình kết nối AI.';

      if (!res.headersSent) {
        return sendQuotaOrGeneralError(res, error, 'Lỗi khi trò chuyện với Trợ Lý AI. Vui lòng thử lại sau.');
      } else {
        res.write(`data: ${JSON.stringify({ error: errText })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  });

  // API 4: Community Scam Reports
  app.get('/api/community-reports', (req, res) => {
    res.json(inMemoryReports);
  });

  app.post('/api/community-reports', (req, res) => {
    const reportData = req.body || {};
    const title = sanitizeText(reportData.title, 200);
    const description = sanitizeText(reportData.description, 5000);

    if (!title || !description) {
      return res.status(400).json({ message: 'Tiêu đề và nội dung mô tả không được để trống.' });
    }

    const newReport: CommunityReport = {
      id: 'rep-' + Date.now(),
      timestamp: Date.now(),
      reporterName: sanitizeText(reportData.reporterName, 100) || 'Người dùng ẩn danh',
      reporterAvatar: sanitizeText(reportData.reporterAvatar, 1000) || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random(),
      scamType: (sanitizeText(reportData.scamType, 50) || 'OTHER') as any,
      scamTypeNameVi: sanitizeText(reportData.scamTypeNameVi, 100) || 'Lừa đảo khác',
      title,
      description,
      summary: sanitizeText(reportData.summary, 500) || description.slice(0, 180) + '...',
      riskLevel: reportData.riskLevel || 'HIGH',
      riskScore: typeof reportData.riskScore === 'number' ? reportData.riskScore : 85,
      confidenceScore: 92,
      targetPhone: sanitizeText(reportData.targetPhone, 30) || undefined,
      targetBankAccount: sanitizeText(reportData.targetBankAccount, 40) || undefined,
      targetBankName: sanitizeText(reportData.targetBankName, 100) || undefined,
      targetAccountName: sanitizeText(reportData.targetAccountName, 100) || undefined,
      targetUrl: isValidHttpUrl(reportData.targetUrl) ? reportData.targetUrl.trim() : undefined,
      targetSocialHandle: sanitizeText(reportData.targetSocialHandle, 100) || undefined,
      approachChannel: sanitizeText(reportData.approachChannel, 100) || undefined,
      locationName: sanitizeText(reportData.locationName, 100) || 'Toàn quốc',
      coordinates: reportData.coordinates || { lat: 10.77653, lng: 106.70098 },
      redFlags: Array.isArray(reportData.redFlags) ? reportData.redFlags.map((s: string) => sanitizeText(s, 200)).filter(Boolean) : undefined,
      recommendedActions: Array.isArray(reportData.recommendedActions) ? reportData.recommendedActions.map((s: string) => sanitizeText(s, 200)).filter(Boolean) : undefined,
      estimatedLoss: sanitizeText(reportData.estimatedLoss, 100) || undefined,
      proofImages: Array.isArray(reportData.proofImages) ? reportData.proofImages.filter((p: string) => typeof p === 'string' && p.length > 0) : [],
      incidentTime: sanitizeText(reportData.incidentTime, 100) || 'Mới đây',
      upvotes: 1,
      verifiedStatus: 'PENDING',
    };

    inMemoryReports.unshift(newReport);
    res.status(201).json(newReport);
  });

  // API 4.1: AI Story to Threat Intelligence Extraction
  app.post('/api/extract-story-intelligence', async (req, res) => {
    try {
      const storyText = sanitizeText(req.body.story, 6000);
      if (!storyText || storyText.length < 15) {
        return res.status(400).json({ message: 'Vui lòng nhập chi tiết câu chuyện hoặc diễn biến vụ việc (tối thiểu 15 ký tự).' });
      }

      const ai = getGenAIClient();
      const prompt = `
Bạn là Chuyên gia Điều tra Tội phạm Mạng & Bóc Tách Dấu Vết của "Lá Chắn Số AI" Việt Nam.
Nạn nhân hoặc người dùng vừa chia sẻ câu chuyện / diễn biến vụ lừa đảo sau đây bằng ngôn ngữ tự nhiên:
"""
${storyText}
"""

Nhiệm vụ của bạn là đọc hiểu tường tận câu chuyện, trích xuất tất cả dữ liệu dấu vết đối tượng và cấu trúc lại để lập hồ sơ cảnh báo cộng đồng:
1. Đặt một tiêu đề thật rõ ràng, cảnh báo cụ thể (ví dụ: "Giả danh shipper GHTK gọi điện yêu cầu nạp 250k phí hoàn đơn", "SMS mạo danh Vietcombank yêu cầu đổi mật khẩu gấp").
2. Phân loại loại hình lừa đảo (scamType: "BANK_IMPERSONATION" | "GOVERNMENT_AUTHORITY" | "JOB_VACANCY" | "E_COMMERCE_PRIZE" | "CREDIT_LOAN" | "DEEPFAKE_CALL" | "OTHER").
3. Trích xuất SĐT kẻ lừa đảo (nếu có nhắc đến, ví dụ: 0901234567, 038xxx).
4. Trích xuất Số tài khoản ngân hàng (nếu có), Tên ngân hàng (VCB, MB, Techcombank...), Tên chủ tài khoản thụ hưởng (viết HOA).
5. Trích xuất Link website / App độc hại / Nhóm Telegram / Zalo (nếu có).
6. Trích xuất Kênh tiếp cận (ví dụ: "Cuộc gọi thoại + Zalo", "SMS Brandname", "Tin nhắn Telegram", "Facebook Ads").
7. Trích xuất số tiền thiệt hại hoặc kẻ gian yêu cầu (ví dụ: "30.000.000 VNĐ", "500.000 VNĐ", "Chưa chuyển").
8. Đánh giá mức độ nguy hiểm ("CRITICAL" | "HIGH" | "WARNING").
9. Liệt kê 3-5 Dấu hiệu nhận biết / Bẫy tâm lý kẻ gian đã dùng (redFlags).
10. Liệt kê 3-5 Lời khuyên xử lý khẩn cấp và phòng ngừa cho người đọc (recommendedActions).
11. Tóm tắt ngắn gọn 2-3 câu diễn biến câu chuyện (summary).

Trả về định dạng JSON thuần túy:
{
  "title": string,
  "scamType": string,
  "scamTypeNameVi": string,
  "targetPhone": string | null,
  "targetBankAccount": string | null,
  "targetBankName": string | null,
  "targetAccountName": string | null,
  "targetUrl": string | null,
  "approachChannel": string,
  "estimatedLoss": string | null,
  "riskLevel": "CRITICAL" | "HIGH" | "WARNING",
  "riskScore": number,
  "summary": string,
  "redFlags": string[],
  "recommendedActions": string[]
}
`;

      let extractedResult: any = null;
      for (const model of FALLBACK_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });
          extractedResult = safeParseJson(response.text || '');
          if (extractedResult) break;
        } catch (err: any) {
          if (isRetryableGeminiError(err)) continue;
          throw err;
        }
      }

      if (!extractedResult) {
        return res.status(500).json({ message: 'Không thể trích xuất tự động qua AI lúc này.' });
      }

      res.json(extractedResult);
    } catch (error: any) {
      console.error('Lỗi khi bóc tách câu chuyện lừa đảo:', error);
      return sendQuotaOrGeneralError(res, error, 'Lỗi khi kết nối AI bóc tách thông tin.');
    }
  });

  // API 5: AI Scam Simulation Sandbox Engine
  app.post('/api/simulate-scam', async (req, res) => {
    try {
      const { scenario, messages, userMessage, actionTaken } = req.body;
      if (!scenario || (!userMessage && !actionTaken)) {
        return res.status(400).json({ message: 'Thiếu thông tin kịch bản hoặc phản hồi người dùng.' });
      }

      const ai = getGenAIClient();
      const sanitizedUserMsg = sanitizeText(userMessage, 2000);
      const actionDesc = actionTaken ? `[NGƯỜI DÙNG VỪA THỰC HIỆN HÀNH ĐỘNG TƯƠNG TÁC: ${actionTaken.type} - Chi tiết: ${JSON.stringify(actionTaken.payload || '')}]` : '';

      const historyContext = Array.isArray(messages)
        ? messages.slice(-10).map((m: any) => `${m.sender === 'user' ? 'Nạn nhân/Người dùng' : 'Kẻ lừa đảo'}: ${m.text}`).join('\n')
        : '';

      const systemPrompt = `
Bạn là Động Cơ Giả Lập Bẫy Lừa Đảo AI (Scam Simulator Engine) và Chuyên Gia Cố Vấn An Ninh Mạng của hệ thống "Lá Chắn Số AI".

NHIỆM VỤ KÉP CỦA BẠN:
1. ĐÓNG VAI KẺ LỪA ĐẢO (Scammer Persona): 
   - Danh tính kẻ lừa đảo: "${scenario.attackerPersona}"
   - Mục tiêu lừa đảo: "${scenario.title}"
   - Thủ đoạn & Bẫy tâm lý: ${JSON.stringify(scenario.psychologicalTricks || [])}
   - Các bẫy chính: ${JSON.stringify(scenario.trapTriggers || [])}
   - Hãy phản hồi ĐẦY KỊCH TÍNH, THẬT, TINH VI, dùng kỹ thuật thao túng xã hội (Social Engineering), tạo gấp gáp, uy hiếp, dỗ ngọt, hoặc đưa ra lý do giả mạo cực kỳ thuyết phục.

2. ĐÓNG VAI CỐ VẤN AN NINH (AI Security Coach):
   - Đánh giá khách quan hành động hoặc câu trả lời vừa rồi của người dùng.
   - Nếu người dùng cung cấp thông tin nhạy cảm (OTP, CCCD, mật khẩu, chuyển khoản, bấm link giả, tải file APK lạ) -> Điểm phạt nặng (-25 đến -40), cảnh báo DANGER, và có thể kết thúc kịch bản với kết quả TRAPPED nếu là bẫy chí mạng.
   - Nếu người dùng tỏ ra bối rối, lưỡng lự, dễ bị dẫn dắt -> Trừ nhẹ (-10 đến -15), cảnh báo WARNING.
   - Nếu người dùng hỏi câu hỏi xác thực thông minh, đòi giấy mời, từ chối tải app lạ, vạch trần chiêu trò -> Thưởng điểm (+15 đến +25), cảnh báo SAFE_DEFENSE.
   - Nếu người dùng đã đối phó thành công qua 3-5 lượt đối thoại mà không sập bẫy -> Đặt isSimulationEnded = true, endOutcome = "DEFENDED_SUCCESS".

ĐỊNH DẠNG ĐẦU RA BẮT BUỘC LÀ JSON KHÔNG KÈM MARKDOWN:
{
  "scammerResponse": "Câu trả lời của kẻ lừa đảo (tiếng Việt tự nhiên, phù hợp vai diễn)",
  "actionBait": {
    "type": "none" | "link" | "otp_request" | "transfer_request" | "apk_download",
    "title": "Tiêu đề nút tương tác bẫy (ví dụ: 'Bấm để tải VNeID_v2.apk' hoặc 'Nhập mã Smart OTP để hủy lệnh' hoặc null nếu là tin nhắn chat thường)",
    "payload": "Thông tin chi tiết giả lập (ví dụ link giả https://... hoặc STK giả 1903...)"
  },
  "coachEvaluation": {
    "scoreDelta": -30 đến +25,
    "threatDetected": true/false,
    "severity": "SAFE_DEFENSE" | "WARNING" | "DANGER",
    "trapName": "Tên bẫy tâm lý / thủ đoạn đang được dùng (ví dụ: 'Uy hiếp pháp lý', 'Bẫy lòng tham hoa hồng', 'Giả mạo liên kết ngân hàng')",
    "coachAdvice": "Lời khuyên an ninh ngắn gọn, trực diện (1-2 câu) giúp người dùng hiểu tại sao kẻ lừa đảo lại nói như vậy và cần làm gì.",
    "isSimulationEnded": true/false,
    "endOutcome": "IN_PROGRESS" | "DEFENDED_SUCCESS" | "TRAPPED"
  },
  "suggestedReplies": [
    "Câu trả lời gợi ý an toàn 1",
    "Câu trả lời gợi ý an toàn 2",
    "Câu trả lời phản biện vạch mặt kẻ xấu 3"
  ]
}
`;

      const userPrompt = `
KỊCH BẢN HIỆN TẠI: ${scenario.title}
BỐI CẢNH: ${scenario.scenarioContext}

LỊCH SỬ ĐỐI THOẠI TRƯỚC ĐÓ:
${historyContext}

PHẢN HỒI MỚI NHẤT CỦA NGƯỜI DÙNG:
${sanitizedUserMsg}
${actionDesc}

Hãy nhập vai kẻ lừa đảo đáp lại, đồng thời xuất phân tích từ AI Coach dưới dạng JSON chuẩn.
`;

      let parsedResult: any = null;

      try {
        const response = await generateContentWithFallback(ai, {
          contents: `${systemPrompt}\n\n${userPrompt}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                scammerResponse: { type: Type.STRING },
                actionBait: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    title: { type: Type.STRING },
                    payload: { type: Type.STRING },
                  },
                  required: ['type'],
                },
                coachEvaluation: {
                  type: Type.OBJECT,
                  properties: {
                    scoreDelta: { type: Type.INTEGER },
                    threatDetected: { type: Type.BOOLEAN },
                    severity: { type: Type.STRING },
                    trapName: { type: Type.STRING },
                    coachAdvice: { type: Type.STRING },
                    isSimulationEnded: { type: Type.BOOLEAN },
                    endOutcome: { type: Type.STRING },
                  },
                  required: [
                    'scoreDelta',
                    'threatDetected',
                    'severity',
                    'trapName',
                    'coachAdvice',
                    'isSimulationEnded',
                    'endOutcome',
                  ],
                },
                suggestedReplies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['scammerResponse', 'coachEvaluation', 'suggestedReplies'],
            },
          },
        });

        const text = response.text || '';
        parsedResult = safeParseJson(text);
      } catch (geminiErr) {
        console.warn('Gemini API call for simulation encountered an issue, using adaptive fallback:', geminiErr);
      }

      if (!parsedResult) {
        parsedResult = getMockSimulationFallback(scenario, userMessage, actionTaken);
      }

      res.json(parsedResult);
    } catch (error: any) {
      console.error('Lỗi Simulate Scam API, using intelligent fallback:', error);
      const fallback = getMockSimulationFallback(req.body.scenario, req.body.userMessage, req.body.actionTaken);
      res.json(fallback);
    }
  });

  // API 6: Generate Custom Scam Scenario with Gemini AI
  app.post('/api/generate-custom-scenario', async (req, res) => {
    try {
      const { prompt } = req.body;
      const sanitizedPrompt = sanitizeText(prompt, 500);
      if (!sanitizedPrompt) {
        return res.status(400).json({ message: 'Vui lòng nhập mô tả tình huống bạn muốn giả lập.' });
      }

      const ai = getGenAIClient();
      const promptInstruction = `
Bạn là Chuyên gia Thiết Kế Kịch Bản An Ninh Mạng của "Lá Chắn Số AI".
Người dùng muốn tạo một kịch bản giả lập lừa đảo thực tế dựa trên ý tưởng: "${sanitizedPrompt}".

Hãy tạo một kịch bản lừa đảo hoàn chỉnh dưới dạng JSON chuẩn:
{
  "id": "custom_${Date.now()}",
  "title": "Tiêu đề ngắn gọn, lôi cuốn",
  "category": "BANK_IMPERSONATION" | "GOVERNMENT_AUTHORITY" | "JOB_VACANCY" | "E_COMMERCE_PRIZE" | "CREDIT_LOAN" | "DEEPFAKE_CALL" | "CRYPTO_INVESTMENT" | "PHISHING_LINK" | "FAMILY_EMERGENCY" | "OTHER",
  "categoryName": "Tên tiếng Việt của loại lừa đảo",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "platform": "zalo" | "telegram" | "sms" | "facebook" | "call",
  "attackerPersona": "Tên và danh xưng của kẻ lừa đảo (ví dụ: Chuyên viên bồi thường bảo hiểm / Cán bộ thuế)",
  "attackerAvatar": "URL ảnh avatar phù hợp (dùng unplash)",
  "targetVictimRole": "Đối tượng mục tiêu",
  "description": "Mô tả ngắn 1-2 câu về vụ việc",
  "scenarioContext": "Bối cảnh âm mưu của kẻ xấu",
  "initialMessage": "Tin nhắn mở đầu mở màn cực kỳ thực tế của kẻ lừa đảo",
  "psychologicalTricks": ["Bẫy 1", "Bẫy 2", "Bẫy 3"],
  "trapTriggers": ["Bẫy hành động 1", "Bẫy hành động 2"],
  "winningTips": ["Bí quyết phòng thủ 1", "Bí quyết phòng thủ 2"],
  "isCustom": true
}
`;

      let generatedScenario: any = null;
      for (const model of FALLBACK_MODELS) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: promptInstruction,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.6,
            },
          });
          generatedScenario = safeParseJson(response.text || '');
          if (generatedScenario) break;
        } catch (err: any) {
          if (isRetryableGeminiError(err)) continue;
          throw err;
        }
      }

      if (!generatedScenario) {
        generatedScenario = {
          id: `custom_${Date.now()}`,
          title: `Tình huống: ${sanitizedPrompt.slice(0, 45)}...`,
          category: 'OTHER',
          categoryName: 'Tình huống lừa đảo đặc biệt',
          difficulty: 'MEDIUM',
          platform: 'zalo',
          attackerPersona: 'Đối tượng khả nghi trực tuyến',
          attackerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          targetVictimRole: 'Người dùng internet',
          description: `Kịch bản mô phỏng đối phó với tình huống: "${sanitizedPrompt}"`,
          scenarioContext: `Đối tượng đang cố gắng liên hệ và tạo bẫy lừa đảo dựa trên bối cảnh: ${sanitizedPrompt}`,
          initialMessage: `Chào bạn, liên quan đến thông tin "${sanitizedPrompt.slice(0, 50)}", chúng tôi cần bạn xác minh thông tin khẩn cấp ngay bây giờ.`,
          psychologicalTricks: ['Tạo áp lực thời gian', 'Uy hiếp hoặc dỗ ngọt', 'Yêu cầu hành động tức thì'],
          trapTriggers: ['Bấm vào link liên kết', 'Cung cấp mã xác nhận OTP', 'Chuyển khoản cọc tiền'],
          winningTips: ['Yêu cầu giấy tờ pháp lý rõ ràng', 'Không chuyển tiền cho người lạ', 'Liên hệ hotline cơ quan chức năng'],
          isCustom: true
        };
      }

      res.json(generatedScenario);
    } catch (error: any) {
      console.error('Lỗi Generate Custom Scenario, using fallback:', error);
      const fallbackScenario = {
        id: `custom_${Date.now()}`,
        title: `Kịch bản: ${(req.body.prompt || '').slice(0, 40)}`,
        category: 'OTHER',
        categoryName: 'Lừa đảo tùy chọn',
        difficulty: 'MEDIUM',
        platform: 'zalo',
        attackerPersona: 'Kẻ mạo danh qua mạng',
        attackerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        targetVictimRole: 'Người dân',
        description: 'Kịch bản giả lập tình huống an ninh mạng.',
        scenarioContext: req.body.prompt || 'Tình huống an ninh số',
        initialMessage: 'Chào anh/chị, tôi cần anh/chị xác thực thông tin ngay bây giờ để tránh bị khóa dịch vụ!',
        psychologicalTricks: ['Áp lực thời gian', 'Uy hiếp'],
        trapTriggers: ['Tải app lạ', 'Đọc mã OTP'],
        winningTips: ['Từ chối làm việc qua chat', 'Xác minh qua kênh chính thức'],
        isCustom: true
      };
      res.json(fallbackScenario);
    }
  });

  // Vite development middleware or static file serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lá Chắn Số AI Server running on http://0.0.0.0:${PORT}`);
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
});

startServer();
