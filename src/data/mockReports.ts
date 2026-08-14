import { CommunityReport } from '../types';

export const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'rep-001',
    timestamp: Date.now() - 3600000 * 2,
    reporterName: 'Trần Văn Hoàng',
    reporterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
    scamType: 'BANK_IMPERSONATION',
    scamTypeNameVi: 'Giả danh Ngân hàng khóa tài khoản',
    title: 'Cảnh báo tin nhắn mạo danh Vietcombank yêu cầu đổi mật khẩu gấp',
    description: 'Nhận được SMS gửi đến danh mục tin nhắn thương hiệu Vietcombank (do đối tượng chèn sóng trạm BTS giả lập). Tin nhắn báo tài khoản VCB Digibank bị tạm khóa do vi phạm an toàn, ép nạn nhân truy cập đường link fake "vcb-digibank-xacnhan.com" trong 15 phút để mở lại.',
    targetPhone: '0901234567',
    targetBankAccount: '1019283746',
    targetBankName: 'Mạo danh Vietcombank (Nền tảng MBBank)',
    targetAccountName: 'NGUYEN VAN HOANG (Tài khoản trung gian)',
    targetUrl: 'http://vcb-digibank-xacnhan.com',
    targetSocialHandle: 'SMS Thương hiệu Giả (Trạm BTS giả)',
    approachChannel: 'SMS Brandname giả mạo (Chèn trạm phát sóng BTS)',
    riskLevel: 'CRITICAL',
    estimatedLoss: 'Rút sạch tiền mặt trong tài khoản & chiếm đoạt mã OTP chuyển tiền tự động.',
    redFlags: [
      'Tạo tâm lý khẩn cấp hối thúc trong 15 phút (Nếu không làm sẽ bị khóa tài khoản vĩnh viễn)',
      'Tên miền nhái tên thương hiệu: "vcb-digibank-xacnhan.com" (Tên miền Vietcombank chuẩn duy nhất là vietcombank.com.vn)',
      'Yêu cầu nhập cả Tên đăng nhập, Mật khẩu VCB Digibank và mã OTP SMS/Soft OTP',
      'Đường link không có HTTPS an toàn hoặc đuôi tên miền .com lạ không thuộc hệ thống ngân hàng'
    ],
    recommendedActions: [
      'KHÔNG click vào bất kỳ đường link nào trong tin nhắn SMS có dấu hiệu nghi vấn.',
      'Gọi ngay cho Tổng đài Vietcombank chính thức 1900 54 54 13 để xác minh trạng thái tài khoản.',
      'Nếu đã lỡ nhập mật khẩu/OTP: Đăng nhập ngay app VCB Digibank chính thức đổi mật khẩu hoặc gọi ngân hàng khóa khẩn cấp.',
      'Phản ánh tin nhắn rác / lừa đảo đến Tổng đài 156 hoặc 5656 (Bộ Thông tin & Truyền thông).'
    ],
    locationName: 'Hà Nội',
    coordinates: { lat: 21.028511, lng: 105.804817 },
    upvotes: 42,
    verifiedStatus: 'VERIFIED'
  },
  {
    id: 'rep-002',
    timestamp: Date.now() - 3600000 * 5,
    reporterName: 'Nguyễn Thị Mai',
    reporterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mai',
    scamType: 'JOB_VACANCY',
    scamTypeNameVi: 'Lừa đảo Tuyển dụng Shopee/Lazada',
    title: 'Chiêu trò tuyển cộng tác viên chốt đơn Shopee thu nhập 500k-1 triệu/ngày',
    description: 'Bị dụ tham gia nhóm Telegram "Việc Làm Shopee 2026", ban đầu cho nạp 100k làm nhiệm vụ chốt đơn được hoàn lại 130k. Lần sau bắt nạp nhiệm vụ lớn 5 triệu, 20 triệu với lý do "sai cú pháp", "kẹt hệ thống", "nhiệm vụ liên hoàn" để ép nạn nhân nạp thêm tiền chiếm đoạt.',
    targetPhone: '0868999888',
    targetBankAccount: '9998887771',
    targetBankName: 'MB Bank',
    targetAccountName: 'CTCP DICH VU TRUYEN THONG FAKE',
    targetSocialHandle: '@CongTacVienShopee_Official (Telegram)',
    approachChannel: 'Nhóm Telegram / Facebook Tuyển Dụng',
    riskLevel: 'HIGH',
    estimatedLoss: 'Mất toàn bộ số tiền nạp làm "nhiệm vụ" (từ 5 triệu đến hàng trăm triệu đồng).',
    redFlags: [
      'Tuyển dụng việc nhẹ lương cao, chỉ cần điện thoại chốt đơn kiếm hàng trăm ngàn/ngày',
      'Yêu cầu chuyển tiền vào tài khoản cá nhân hoặc tài khoản công ty truyền thông không phải của Shopee',
      'Dùng chiêu trò "thưởng mồi" lần đầu 30k-50k để tạo niềm tin',
      'Hối thúc nạp thêm tiền giải cứu số tiền cũ bị đóng băng với lý do "lỗi cú pháp"'
    ],
    recommendedActions: [
      'Ngừng ngay việc chuyển tiền, tuyệt đối không nạp thêm tiền để "giải cứu" tiền cũ.',
      'Shopee, Lazada, Tiki KHÔNG BAO GIỜ tuyển cộng tác viên chốt đơn qua Telegram/Zalo cá nhân.',
      'Chụp lại hình ảnh tin nhắn, biên lai chuyển tiền và tài khoản ngân hàng kẻ gian làm bằng chứng.',
      'Nộp đơn trình báo lên Cơ quan Công an quận/huyện nơi cư trú.'
    ],
    locationName: 'TP. Hồ Chí Minh',
    coordinates: { lat: 10.77653, lng: 106.70098 },
    upvotes: 89,
    verifiedStatus: 'VERIFIED'
  },
  {
    id: 'rep-003',
    timestamp: Date.now() - 3600000 * 12,
    reporterName: 'Lê Minh Tuấn',
    reporterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tuan',
    scamType: 'GOVERNMENT_AUTHORITY',
    scamTypeNameVi: 'Giả danh Công an báo phạt nguội / Định danh VNeID',
    title: 'Cuộc gọi tự xưng Công an Quận 1 yêu cầu cập nhật VNeID mức 2 bằng file APK',
    description: 'Đối tượng gọi thoại dọa nạn nhân có thông tin VNeID bị sai lệch hồ sơ hoặc có lệnh phạt nguội giao thông. Yêu cầu kết bạn Zalo để gửi đường link tải app "VNeID-ChinhThuc.apk". Khi cài đặt, app độc hại xin quyền Accessibility Service, chiếm quyền điều khiển điện thoại và tự động chuyển sạch tiền ngân hàng.',
    targetPhone: '0248889912',
    targetSocialHandle: 'Cán bộ Công An Hỗ Trợ VNeID (Zalo)',
    approachChannel: 'Cuộc gọi thoại mạo danh + Zalo gửi file APK',
    riskLevel: 'CRITICAL',
    estimatedLoss: 'Điện thoại bị chiếm quyền điều khiển từ xa (Remote Access Trojan), mất tiền toàn bộ ứng dụng ngân hàng.',
    redFlags: [
      'Công an KHÔNG BAO GIỜ làm việc qua điện thoại hay yêu cầu kết bạn Zalo hướng dẫn cài ứng dụng',
      'Yêu cầu tải ứng dụng dạng file APK ngoài CH Play / App Store (đặc biệt đuôi .apk)',
      'Ứng dụng đòi cấp quyền "Truy cập trợ năng" (Accessibility Service) hoặc "Đọc SMS/Notification"',
      'Dọa dẫm bắt giam, truy tố hoặc khóa SIM nếu không làm theo hướng dẫn ngay lập tức'
    ],
    recommendedActions: [
      'Tắt máy ngay lập tức, tuyệt đối KHÔNG tải hay cài đặt bất kỳ file APK nào từ Zalo/Web.',
      'Nếu lỡ cài file APK: Bật ngay chế độ Máy Bay (Airplane Mode), gỡ cài đặt app hoặc khôi phục cài đặt gốc.',
      'Dùng điện thoại khác gọi ngân hàng khóa khẩn cấp tất cả tài khoản và thẻ tín dụng.',
      'Đến cơ quan Công an phường/xã gần nhất để trình báo và nhờ hỗ trợ kỹ thuật.'
    ],
    locationName: 'Đà Nẵng',
    coordinates: { lat: 16.054407, lng: 108.202167 },
    upvotes: 67,
    verifiedStatus: 'VERIFIED'
  },
  {
    id: 'rep-004',
    timestamp: Date.now() - 3600000 * 24,
    reporterName: 'Phạm Thu Hà',
    reporterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ha',
    scamType: 'DEEPFAKE_CALL',
    scamTypeNameVi: 'Cuộc gọi Video Deepfake mạo danh thân nhân',
    title: 'Giả khuôn mặt con gái gọi video 5 giây báo tai nạn gãy chân cần nạp viện phí',
    description: 'Đối tượng gọi qua Messenger có hình ảnh khuôn mặt và chuyển động của con gái (dùng công nghệ AI Deepfake), tiếng nói bị giật giật. Viện lý do "mạng yếu", đối tượng tắt máy ngay rồi nhắn tin hối thúc mẹ chuyển gấp 30 triệu vào tài khoản ngân hàng đứng tên người khác.',
    targetBankAccount: '038100039281',
    targetBankName: 'Agribank',
    targetAccountName: 'LE VAN B (Tài khoản người lạ)',
    targetSocialHandle: 'Facebook Messenger (Tài khoản bị Hack)',
    approachChannel: 'Cuộc gọi Video Messenger Deepfake AI',
    riskLevel: 'CRITICAL',
    estimatedLoss: 'Mất số tiền chuyển khoản khẩn cấp do hoảng sợ trước thông tin thân nhân gặp tai nạn.',
    redFlags: [
      'Cuộc gọi video ngắn (chỉ vài giây), hình ảnh bị giật, mờ, khẩu hình miệng không khớp với lời nói',
      'Lấy lý do "sóng yếu", "đang cấp cứu" để ngắt kết nối video và chuyển sang nhắn tin đòi tiền gấp',
      'Tài khoản ngân hàng yêu cầu chuyển tiền lại đứng tên một NGƯỜI LẠ, không phải tên người thân',
      'Đánh vào tâm lý hoảng loạn, sợ hãi của phụ huynh khi nghe tin con cái gặp nạn'
    ],
    recommendedActions: [
      'Bình tĩnh, KHÔNG chuyển tiền ngay lập tức.',
      'Tắt cuộc gọi và dùng số điện thoại di động thông thường gọi trực tiếp cho người thân hoặc bạn bè xung quanh người thân để xác minh.',
      'Hỏi các câu hỏi riêng tư mà chỉ bạn và người thân biết (ví dụ: tên con vật nuôi, kỷ niệm cũ).',
      'Cảnh báo cho người thân biết tài khoản Facebook/Zalo của họ đã bị kẻ gian chiếm đoạt.'
    ],
    locationName: 'Cần Thơ',
    coordinates: { lat: 10.045162, lng: 105.746857 },
    upvotes: 112,
    verifiedStatus: 'VERIFIED'
  },
  {
    id: 'rep-005',
    timestamp: Date.now() - 3600000 * 36,
    reporterName: 'Đỗ Đức Hải',
    reporterAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hai',
    scamType: 'CREDIT_LOAN',
    scamTypeNameVi: 'Bẫy app vay tiền tín dụng đen online',
    title: 'App "Vay Siêu Tốc 247" giải ngân nhanh nhưng phí dịch vụ 40%, đe dọa người thân',
    description: 'Quảng cáo vay 10 triệu giải ngân siêu tốc không thế chấp, nhưng thực tế chỉ nhận 6 triệu (trừ 4 triệu phí dịch vụ & lãi ngầm). Đến hạn 5 ngày không trả kịp thì bị nhắn tin hăm dọa ghép ảnh bôi nhọ gửi cho đồng nghiệp, người thân và toàn bộ danh bạ điện thoại.',
    targetPhone: '0933112233',
    targetUrl: 'https://vaysieutoc247.xyz',
    approachChannel: 'Quảng cáo Facebook / App web vay tiền biến tướng',
    riskLevel: 'HIGH',
    estimatedLoss: 'Nợ lãi mẹ đẻ lãi con gấp hàng chục lần, bị khủng bố tinh thần và bôi nhọ danh dự.',
    redFlags: [
      'Vay vốn không cần thế chấp, không duyệt nợ xấu nhưng trừ phí dịch vụ cắt cổ 30%-50%',
      'Yêu cầu truy cập danh bạ điện thoại và bộ sưu tập ảnh trên máy',
      'Hợp đồng không rõ ràng, lãi suất thực tế vượt quá 100%/năm',
      'Sử dụng biện pháp xã hội đen trực tuyến: Gọi điện khủng bố danh bạ, cắt ghép ảnh làm phiền người thân'
    ],
    recommendedActions: [
      'Không vay tiền qua các ứng dụng/website không rõ nguồn gốc pháp lý.',
      'Nếu lỡ bị khủng bố: Khóa danh bạ, cài đặt chặn số lạ, báo cáo bài viết bôi nhọ trên mạng xã hội.',
      'Nộp đơn tố giác hành vi cho vay lãi nặng và khủng bố tinh thần lên Cơ quan Công an.',
      'Tìm hiểu các gói vay chính thống tại các ngân hàng thương mại hoặc công ty tài chính được Ngân hàng Nhà nước cấp phép.'
    ],
    locationName: 'Hải Phòng',
    coordinates: { lat: 20.844912, lng: 106.688084 },
    upvotes: 35,
    verifiedStatus: 'COMMUNITY_FLAGGED'
  }
];

