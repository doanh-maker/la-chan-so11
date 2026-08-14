import { ScamScenario } from '../types';

export const PRESET_SCAM_SCENARIOS: ScamScenario[] = [
  {
    id: 'police_vneid_trap',
    title: 'Cán Bộ Công An Gọi Điện Lỗi Định Danh VNeID Mức 2',
    category: 'GOVERNMENT_AUTHORITY',
    categoryName: 'Giả danh Cơ quan Công an / Tòa án',
    difficulty: 'MEDIUM',
    platform: 'zalo',
    attackerPersona: 'Đại úy Nguyễn Văn Hùng - Cán bộ Đội CSQLHC về TTXH',
    attackerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    targetVictimRole: 'Người dân thường',
    description: 'Kẻ lừa đảo đóng giả cán bộ công an, thông báo hồ sơ VNeID bị lỗi đồng bộ và ép tải ứng dụng định danh giả (.apk) để khắc phục khẩn cấp.',
    scenarioContext: 'Kẻ xấu đang cố gắng thao túng tâm lý sợ rắc rối pháp lý, ép nạn nhân tải file APK chứa mã độc chiếm quyền điều khiển điện thoại hoặc cung cấp mã OTP ngân hàng.',
    initialMessage: 'Chào anh/chị, tôi là Đại úy Hùng thuộc Đội Quản lý Hành chính Công an Quận. Hồ sơ VNeID mức 2 của anh/chị bị lỗi sai lệch thông tin cư trú, cần đồng bộ ngay trong 2 giờ tới nếu không tài khoản VNeID và mã số thuế sẽ bị tạm khóa toàn quốc. Anh/chị đã nhận được thông báo chưa?',
    psychologicalTricks: [
      'Uy hiếp bằng quyền lực và chế tài pháp lý',
      'Tạo áp lực thời gian cực gấp (2 giờ)',
      'Hối thúc làm thủ tục online để "đỡ phải lên cơ quan làm việc mất cả ngày"'
    ],
    trapTriggers: [
      'Yêu cầu tải file DinhDanhDienTu.apk',
      'Đòi đọc số CCCD kèm ngày cấp và nơi sinh',
      'Yêu cầu cấp quyền trợ năng Accessibility trên điện thoại Android',
      'Hỏi số tài khoản ngân hàng để "xác minh không có nợ xấu"'
    ],
    winningTips: [
      'Yêu cầu có giấy mời trực tiếp tại trụ sở Công an phường/xã',
      'Nhắc nhở Công an KHÔNG BAO GIỜ hướng dẫn cài app qua đường link ngoài Zalo',
      'Chủ động ngắt kết nối và gọi số 113 hoặc Công an khu vực để đối chứng'
    ]
  },
  {
    id: 'ctv_ecommerce_order',
    title: 'Tuyển Dụng Cộng Tác Viên Mua Hàng Shopee / TikTok Kiếm 500k/Ngày',
    category: 'JOB_VACANCY',
    categoryName: 'Lừa đảo Tuyển dụng Việc làm Online',
    difficulty: 'EASY',
    platform: 'telegram',
    attackerPersona: 'Minh Thư - Quản lý Tuyển Dụng & Qũy Trả Thưởng',
    attackerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    targetVictimRole: 'Sinh viên / Mẹ bỉm sữa / Người tìm việc thêm',
    description: 'Chiêu trò "việc nhẹ lương cao", mời làm nhiệm vụ tương tác đơn hàng ảo, ban đầu hoàn tiền thật kèm hoa hồng nhỏ để tạo lòng tin, sau đó ép nạp tiền triệu.',
    scenarioContext: 'Kẻ xấu dùng lòng tham và bẫy chi phí chìm (Sunk cost fallacy) để nạn nhân liên tục nạp tiền nhằm rút lại số vốn ban đầu.',
    initialMessage: 'Dạ chào bạn! Bên công ty truyền thông Shopee Mall đang tuyển 10 bạn làm nhiệm vụ đánh giá sản phẩm tại nhà, lương 300k - 800k/ngày chuyển khoản theo đơn. Bạn chỉ cần thả tim và like sản phẩm là nhận ngay 50.000đ đầu tiên. Bạn có muốn nhận nhiệm vụ thử nghiệm miễn phí ngay không?',
    psychologicalTricks: [
      'Mồi nhử hoa hồng nhanh chóng (50k - 100k tiền tươi)',
      'Tạo cảm giác công việc siêu dễ, ai cũng làm được',
      'Dùng tài khoản "chim mồi" trong nhóm Telegram liên tục khoe nhận tiền'
    ],
    trapTriggers: [
      'Yêu cầu ứng trước 200.000đ để mở khóa đơn hàng VIP',
      'Đòi nạp 5.000.000đ để sửa lỗi "sai cú pháp đơn hàng"',
      'Gửi link sàn thương mại điện tử nhái để tạo tài khoản'
    ],
    winningTips: [
      'Nhận biết nguyên tắc: Tuyển dụng chân chính không bao giờ bắt ứng viên cọc/nạp tiền',
      'Từ chối mọi yêu cầu chuyển khoản ứng trước vào tài khoản cá nhân',
      'Không tham gia các hội nhóm Telegram không rõ danh tính công ty'
    ]
  },
  {
    id: 'bank_sms_phishing_link',
    title: 'Tin Nhắn Brandname Ngân Hàng Báo Tài Khoản Bị Đăng Nhập Lạ',
    category: 'BANK_IMPERSONATION',
    categoryName: 'Giả mạo Ngân Hàng & Link Phishing',
    difficulty: 'HARD',
    platform: 'sms',
    attackerPersona: 'Hệ thống Cảnh báo An ninh Ngân hàng số',
    attackerAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80',
    targetVictimRole: 'Chủ tài khoản ngân hàng / Doanh nghiệp',
    description: 'Kẻ xấu dùng trạm phát sóng BTS giả mạo tin nhắn SMS Brandname ngân hàng, gửi link trang web ngân hàng nhái (phishing) nhằm chiếm đoạt tên đăng nhập và OTP.',
    scenarioContext: 'Kẻ lừa đảo cố gắng tạo tâm lý hoảng loạn tài sản bị đe dọa để người dùng vội vã bấm link và gõ mật khẩu ngân hàng.',
    initialMessage: '[VIETCOMBANK CẢNH BÁO]: Tài khoản của Quý khách vừa đăng nhập tại IP lạ (Tokyo, Nhật Bản). Nếu không phải bạn thực hiện, vui lòng truy cập ngay https://vietcombank-xacminh-baomat.com để hủy giao dịch và bảo vệ số dư trong vòng 5 phút.',
    psychologicalTricks: [
      'Gây sốc và hoảng sợ mất tiền trong tài khoản',
      'Đồng hồ đếm ngược 5 phút khiến nạn nhân không kịp suy nghĩ',
      'Tên miền nhái gần giống tên miền thật của ngân hàng'
    ],
    trapTriggers: [
      'Bấm vào đường link lạ có tên miền giả mạo',
      'Nhập Tên đăng nhập & Mật khẩu Internet Banking',
      'Nhập mã OTP / Smart OTP gửi về điện thoại'
    ],
    winningTips: [
      'Tuyệt đối KHÔNG bấm vào link trong tin nhắn SMS ngân hàng',
      'Kiểm tra tên miền chính thống (ví dụ: vietcombank.com.vn)',
      'Gọi ngay hotline chính thức của ngân hàng in ở mặt sau thẻ ATM'
    ]
  },
  {
    id: 'relative_emergency_deepfake',
    title: 'Deepfake Con Gái / Bạn Thân Nhắn Tin Vay Tiền Đóng Viện Phí Gấp',
    category: 'DEEPFAKE_CALL',
    categoryName: 'Cuộc gọi Deepfake / Giả mạo Thân nhân',
    difficulty: 'HARD',
    platform: 'facebook',
    attackerPersona: 'Trâm Anh (Tài khoản Facebook bị hack của người thân)',
    attackerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    targetVictimRole: 'Cha mẹ / Người thân trong gia đình',
    description: 'Hack tài khoản mạng xã hội, sử dụng video AI Deepfake vài giây hình ảnh chập chờn để lấy lòng tin, xin chuyển tiền gấp vào tài khoản của "bác sĩ" do tài khoản chính bị lỗi.',
    scenarioContext: 'Kẻ xấu nhắm vào tình cảm gia đình và sự lo lắng tột cùng khi nghe tin người thân gặp nạn.',
    initialMessage: 'Mẹ ơi! Con đang trên đường đi làm thì bị va quẹt xe nhẹ, hiện đang ở phòng khám cấp cứu. Điện thoại con sắp hết pin và sóng yếu lắm. Bác sĩ yêu cầu tạm ứng viện phí 8.500.000đ ngay để chụp X-quang. Mẹ chuyển gấp vào tài khoản Viện phí của Bác sĩ này giúp con với, con lo quá!',
    psychologicalTricks: [
      'Khai thác triệt để lòng thương xót và tình cảm gia đình',
      'Viện cớ sóng yếu / điện thoại chập chờn để tránh bị gọi thoại lâu',
      'Hối thúc chuyển khoản ngay lập tức'
    ],
    trapTriggers: [
      'Chuyển tiền vào số tài khoản lạ mang tên người khác',
      'Tin tưởng ngay mà không gọi điện thoại kiểm chứng qua số di động cá nhân',
      'Gửi tiền mà không hỏi các câu hỏi mật chỉ người thân mới biết'
    ],
    winningTips: [
      'Bình tĩnh, lập tức gọi điện thoại thông thường (qua sóng viễn thông) vào số di động của người thân',
      'Hỏi các câu hỏi riêng tư hoặc kỷ niệm gia đình mà kẻ lừa đảo không thể biết',
      'Không bao giờ chuyển tiền vào STK người lạ mang danh "bác sĩ/công an"'
    ]
  },
  {
    id: 'crypto_vip_signal_group',
    title: 'Thầy Phong Thủy / Chuyên Gia Tài Chính Kéo Về Bờ Lãi 300%',
    category: 'CRYPTO_INVESTMENT',
    categoryName: 'Đầu tư Tiền ảo / Sàn Đa cấp Lừa đảo',
    difficulty: 'MEDIUM',
    platform: 'telegram',
    attackerPersona: 'Tony Hoàng - Trưởng Ban Đầu Tư Sàn Quốc Tế BitGlobal',
    attackerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    targetVictimRole: 'Người muốn đầu tư sinh lời nhanh',
    description: 'Dụ dỗ nạn nhân tham gia các sàn giao dịch nhái, cam kết bảo toàn vốn 100% và lợi nhuận 20-30%/ngày, cho rút tiền nhỏ nhưng khi nạp lớn thì khóa tài khoản và đòi thuế phí.',
    scenarioContext: 'Kẻ xấu đánh vào tâm lý muốn làm giàu nhanh chóng và sự thiếu hiểu biết về thị trường tài chính.',
    initialMessage: 'Chào người anh em! Mình thấy bạn đang tìm hiểu về kênh đầu tư tài chính số. Bên mình đang có chuyên gia phân tích thuật toán AI cam kết tỷ lệ thắng 98%, nạp tối thiểu 2 triệu nhận lợi nhuận 600k/ngày, bảo hiểm vốn 100%. Bạn muốn tham gia nhóm tín hiệu VIP miễn phí hôm nay không?',
    psychologicalTricks: [
      'Cam kết vô lý: Lãi suất siêu khủng + Bao lỗ 100%',
      'Tạo hình ảnh chuyên gia thành đạt, nhà xe sang trọng',
      'Khoe biên lai tiền tỷ được chuyển khoản liên tục'
    ],
    trapTriggers: [
      'Tải app sàn giao dịch từ link ngoài CH Play / App Store',
      'Chuyển tiền đầu tư vào số tài khoản cá nhân của "thủ quỹ sàn"',
      'Đóng thêm tiền "phí mở khóa tài khoản" khi bị kẹt tiền'
    ],
    winningTips: [
      'Ghi nhớ: Không có kênh đầu tư hợp pháp nào cam kết lợi nhuận 30%/tháng mà không có rủi ro',
      'Chỉ giao dịch trên các tổ chức tài chính được Ngân hàng Nhà nước cấp phép',
      'Dừng ngay lập tức khi sàn yêu cầu nạp thêm tiền để rút tiền gốc'
    ]
  }
];
