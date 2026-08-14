# Lá Chắn Số AI - AI-Powered Anti-Scam Shield for Vietnam

**Lá Chắn Số AI** là giải pháp trí tuệ nhân tạo toàn diện giúp nhận diện, phân tích và phòng chống các hình thức lừa đảo trực tuyến tại Việt Nam (tin nhắn SMS/Zalo/FB giả mạo, hình ảnh chuyển khoản giả, website phishing, cuộc gọi lừa đảo).

---

## 🌟 Tính Năng Nổi Bật (Key Features)

1. **Quét Tin Nhắn & Ảnh Chụp Màn Hình (Scam Scanner):**
   - Phân tích văn bản tin nhắn hoặc hình ảnh bill/chuyển khoản/tin nhắn bằng **Google Gemini 3.6 Flash**.
   - Trích xuất điểm rủi ro (Risk Score 0-100), dấu hiệu bất thường, loại hình lừa đảo (Giả mạo ngân hàng, việc làm online, trúng thưởng, v.v.).
   - Gợi ý hành động ứng phó khẩn cấp và các tình huống thực tế tương tự.

2. **Kiểm Tra Website Độc Hại & Phishing (Website Scanner):**
   - Nhận diện tên miền Typosquatting / Homograph (giả mạo VCB, Techcombank, Shopee, VNeID, v.v.).
   - Kiểm tra chứng chỉ SSL, cấu trúc URL nguy hiểm, mã độc và tính pháp lý của tên miền.

3. **Trợ Lý AI Chuyên Gia An Ninh Mạng (AI Chat Assistant):**
   - Hỗ trợ tư vấn trực tiếp 24/7 với phản hồi theo thời gian thực (SSE Streaming).
   - Giải đáp thắc mắc, hướng dẫn khóa tài khoản ngân hàng khẩn cấp và quy trình báo án.

4. **Bản Đồ & Báo Cáo Cộng Đồng (Community Reports & Map):**
   - Cho phép người dùng đăng tải cảnh báo lừa đảo thực tế kèm bằng chứng.
   - Hiển thị tọa độ cảnh báo trực quan trên bản đồ nhiệt (Google Maps integration).
   - Hỗ trợ tương tác bình luận và bình chọn hữu ích (Upvote).

5. **Lịch Sử Quét & Đồng Bộ Cloud (Scan History & Firebase Sync):**
   - Lưu trữ kết quả quét cá nhân an toàn qua Firebase Authentication & Firestore.
   - Chế độ chữ lớn (Elder-Friendly Mode) dành cho người cao tuổi.

6. **Chế Độ Khẩn Cấp (Emergency Hotline Modal):**
   - Kết nối tức thì tới Đường dây nóng Bộ Công An (113), Cục An toàn thông tin (156), VNCERT (1121).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion (Framer Motion).
- **Backend:** Express.js (Node.js ESM / CJS bundle via esbuild).
- **AI Core:** `@google/genai` (Google Gemini 3.6 Flash SDK).
- **Database & Auth:** Firebase Firestore, Firebase Authentication.
- **Build & Server:** Bundled `dist/server.cjs` with static file serving for Google Cloud Run container execution.

---

## ⚡ Hướng Dẫn Cài Đặt & Phát Triển (Local Setup)

### 1. Yêu Cầu Tiền Đề
- Node.js >= 20.0.0
- npm >= 10.0.0

### 2. Cài Đặt Biến Môi Trường (.env)
Tạo file `.env` từ mẫu `.env.example`:

```bash
cp .env.example .env
```

Điền các giá trị cần thiết:
```env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
APP_URL="http://localhost:3000"
NODE_ENV="development"
PORT=3000
```

### 3. Cài Đặt Dependencies
```bash
npm install
```

### 4. Chạy Dev Server
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 🚀 Tối Ưu Hóa Production & Build

Ứng dụng được tối ưu hóa toàn diện cho môi trường Cloud Run:

- **Code Splitting & Lazy Loading:** Các modal và tab chức năng chính được nạp lười (`React.lazy` + `Suspense`) giúp giảm dung lượng bundle ban đầu.
- **Manual Vendor Chunking:** Tách các thư viện lớn (`vendor-react`, `vendor-firebase`, `vendor-motion`, `vendor-icons`) giúp tối ưu bộ nhớ đệm trình duyệt.
- **Bảo Mật Đầu Vào & XSS:** Lọc thẻ HTML/Script, kiểm tra chuẩn URL và giới hạn dung lượng Base64 (max 5MB) tại server proxy.
- **Firebase Security Rules:** Đã định cấu hình chặt chẽ trong `firestore.rules` kiểm tra quyền sở hữu người dùng và giới hạn độ dài ký tự field.

---

## 📦 Biên Dịch & Khởi Chạy Production

```bash
# Biên dịch Client SPA & Backend Server
npm run build

# Chạy Server Production
npm start
```

---

## 🛡️ Giấy Phép & Tác Quyền
Dự án được phát triển dưới giấy phép **Apache-2.0**.
