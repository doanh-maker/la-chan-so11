# Hướng Dẫn Triển Khai Production (Cloud Run & Firebase Deployment Guide)

Tài liệu này hướng dẫn chi tiết quy trình triển khai hệ thống **Lá Chắn Số AI** lên môi trường **Google Cloud Run** và **Firebase**.

---

## 📋 1. Chuẩn Bị Trước Khi Triển Khai

1. **Tài khoản Google Cloud Platform (GCP)** có kích hoạt Billing.
2. **Dự án Firebase (Firebase Project)** đã khởi tạo Firestore Database và Firebase Authentication.
3. **Google Gemini API Key** từ Google AI Studio (hoặc GCP Vertex AI).
4. Khởi tạo **GCP Cloud Shell** hoặc cài đặt **Google Cloud SDK (`gcloud` CLI)** trên máy cục bộ.

---

## 🔑 2. Cấu Hình Biến Môi Trường (Environment Variables & Secrets)

Trên Cloud Run, các biến môi trường nhạy cảm như `GEMINI_API_KEY` nên được lưu trữ thông qua **Secret Manager**:

```bash
# Tạo secret cho Gemini API Key
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Thêm giá trị cho secret
echo -n "AIzaSyYourGeminiApiKeyHere" | gcloud secrets versions add GEMINI_API_KEY --data-file=-
```

---

## 🔒 3. Triển Khai Quy Tắc Bảo Mật Firestore (Firebase Security Rules)

File `firestore.rules` của dự án đã được định cấu hình bảo mật cấp cao. Triển khai bằng Firebase CLI:

```bash
# Đăng nhập Firebase
firebase login

# Chọn project
firebase use --add <YOUR_FIREBASE_PROJECT_ID>

# Deploy rules
firebase deploy --only firestore:rules
```

Hoặc dán trực tiếp nội dung trong file `firestore.rules` vào phần **Rules** trên Firebase Console.

---

## 🐳 4. Đóng Gói Docker & Triển Khai Lên Google Cloud Run

### Cách 1: Triển Khai Trực Tiếp Từ Source Code (Cloud Build)

Chạy lệnh gcloud bên dưới tại thư mục gốc của dự án:

```bash
gcloud run deploy lachanso-ai \
  --source . \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --set-env-vars NODE_ENV=production
```

### Cách 2: Sử Dụng Dockerfile Tùy Chỉnh

Tạo file `Dockerfile` ở thư mục gốc nếu muốn đóng gói thủ công:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

Build & Push lên Artifact Registry:

```bash
# Build image
gcloud builds submit --tag asia-southeast1-docker.pkg.dev/<PROJECT_ID>/app-repo/lachanso-ai:latest

# Deploy Cloud Run
gcloud run deploy lachanso-ai \
  --image asia-southeast1-docker.pkg.dev/<PROJECT_ID>/app-repo/lachanso-ai:latest \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

---

## 🏥 5. Kiểm Tra Tình Trạng Hoạt Động (Health Checks)

Sau khi dịch vụ Cloud Run được khởi chạy thành công, truy cập đường dẫn health check để kiểm tra:

```http
GET https://<YOUR_CLOUD_RUN_URL>/api/health
```

**Kết quả phản hồi kỳ vọng (200 OK):**
```json
{
  "status": "ok",
  "service": "lachanso-ai-backend",
  "timestamp": "2026-08-03T01:45:00.000Z",
  "uptime": 120.5,
  "hasGeminiKey": true
}
```

---

## 🌐 6. Cấu Hình Tên Miền Tùy Chỉnh (Custom Domain Mapping)

1. Mở trang quản lý **Cloud Run** trên GCP Console.
2. Chọn **Manage Custom Domains**.
3. Thêm tên miền của bạn (ví dụ: `lachanso.vn` hoặc `app.lachanso.vn`).
4. Thêm các bản ghi CNAME / A record do GCP cấp vào nhà cung cấp DNS của bạn (Cloudflare, PAVietnam, MatBao, v.v.).
