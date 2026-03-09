# 🚀 HƯỚNG DẪN DEPLOY LÊN RENDER

## 📋 Thông tin dự án
- **Domain:** https://archive.id.vn/
- **Platform:** Render.com
- **Architecture:** Backend + Frontend cùng 1 server (Node.js)

---

## ✅ ĐÃ CHUẨN BỊ

### Files đã tạo:
- ✅ `.gitignore` - Loại trừ node_modules, .env, logs
- ✅ `render.yaml` - Cấu hình tự động cho Render
- ✅ `package.json` (root) - Scripts để build và start
- ✅ `DEPLOY.md` - File này

### Code đã sửa:
- ✅ `backend/server.js` - CORS cho domain https://archive.id.vn
- ✅ `frontend/index.html` - API_BASE tự động detect localhost/production

---

## 🔧 CẤU HÌNH ĐÃ THỰC HIỆN

### 1. CORS Configuration (backend/server.js)
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://archive.id.vn'
    : '*',
  credentials: true
}));
```

### 2. API Endpoint (frontend/index.html)
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001'
  : '';  // Relative path cho production
```

### 3. Port Configuration (backend/server.js)
```javascript
const PORT = process.env.PORT || 3001;
```

---

## 📦 BƯỚC DEPLOY

### Bước 1: Push code lên Git

```bash
# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Ready for Render deployment with archive.id.vn"

# Kết nối với remote repository
git remote add origin https://github.com/your-username/your-repo.git

# Push lên GitHub/GitLab
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render

1. Đăng nhập https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect repository của bạn (GitHub/GitLab)
4. Render sẽ tự động detect `render.yaml` và điền thông tin

**Hoặc điền thủ công:**
```
Name: tran-hung-dao-learning
Environment: Node
Region: Singapore
Branch: main
Build Command: npm run build
Start Command: npm start
```

5. **Environment Variables:**
```
NODE_ENV = production
PORT = 10000
```

6. Click **"Create Web Service"**

### Bước 3: Đợi Deploy hoàn tất
- Render sẽ build (~2-5 phút)
- Sau khi xong, bạn sẽ có URL: `https://tran-hung-dao-learning.onrender.com`

### Bước 4: Cấu hình Custom Domain (archive.id.vn)

1. Trong Render dashboard, vào **Settings** → **Custom Domain**
2. Click **"Add Custom Domain"**
3. Nhập: `archive.id.vn`
4. Render sẽ cho bạn CNAME record:
   ```
   Type: CNAME
   Name: archive (hoặc @)
   Value: tran-hung-dao-learning.onrender.com
   ```
5. Vào DNS provider của bạn (nơi quản lý domain id.vn)
6. Thêm CNAME record như trên
7. Đợi DNS propagate (~5-30 phút)
8. Render sẽ tự động cấp SSL certificate (HTTPS)

---

## ✅ KIỂM TRA SAU KHI DEPLOY

### Test trên Render URL:
```bash
# Test API status
curl https://tran-hung-dao-learning.onrender.com/api/status

# Mở browser
https://tran-hung-dao-learning.onrender.com
```

### Test trên Custom Domain:
```bash
# Test API status
curl https://archive.id.vn/api/status

# Mở browser
https://archive.id.vn
```

### Checklist:
- ✅ Trang chủ hiển thị đúng
- ✅ Click "Bắt Đầu Học" → Màn nhân vật
- ✅ Nhập mã code → Validate thành công
- ✅ Video hiển thị
- ✅ Chat RAG trả lời đúng
- ✅ Không có lỗi CORS trong Console (F12)
- ✅ HTTPS hoạt động (có ổ khóa xanh)

---

## 🔍 DEBUG

### Xem logs:
1. Vào Render dashboard
2. Click vào service name
3. Tab **"Logs"** để xem real-time logs

### Lỗi thường gặp:

**1. CORS Error:**
- Kiểm tra `backend/server.js` có đúng domain `https://archive.id.vn`
- Kiểm tra `NODE_ENV=production` trong Environment Variables

**2. API 404:**
- Kiểm tra `frontend/index.html` API_BASE đã đúng chưa
- Kiểm tra routes trong `backend/server.js`

**3. Service không start:**
- Xem logs để biết lỗi cụ thể
- Kiểm tra `package.json` scripts
- Kiểm tra `backend/package.json` có đủ dependencies

**4. Custom domain không hoạt động:**
- Đợi DNS propagate (có thể mất đến 24h)
- Kiểm tra CNAME record đã đúng chưa
- Dùng `nslookup archive.id.vn` để check DNS

---

## ⚠️ LƯU Ý QUAN TRỌNG

### Render Free Plan:
- ✅ 750 giờ/tháng (đủ dùng)
- ⚠️ Service "ngủ" sau 15 phút không dùng
- ⚠️ Lần đầu truy cập sau khi ngủ mất ~30s để "thức dậy"
- ✅ SSL/HTTPS miễn phí
- ✅ Custom domain miễn phí

### Để service không ngủ:
1. **Upgrade Paid Plan** ($7/tháng)
2. **Dùng Cron Job** ping mỗi 10 phút:
   - UptimeRobot (free)
   - Cron-job.org (free)
   - Ping URL: `https://archive.id.vn/api/status`

### Bảo mật:
- ✅ CORS đã giới hạn chỉ domain `archive.id.vn`
- ✅ Không expose API keys (dùng RAG local)
- ✅ HTTPS tự động

---

## 🔄 UPDATE CODE SAU KHI DEPLOY

Mỗi khi sửa code:

```bash
# Commit changes
git add .
git commit -m "Update feature X"

# Push
git push origin main
```

Render sẽ tự động:
1. Detect push mới
2. Build lại
3. Deploy version mới
4. Zero-downtime deployment

---

## 📞 HỖ TRỢ

- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Community: https://community.render.com

---

## 🎯 TỔNG KẾT

✅ Code đã sẵn sàng deploy  
✅ CORS đã config cho https://archive.id.vn  
✅ API endpoint tự động detect local/production  
✅ Files cấu hình đã tạo (.gitignore, render.yaml)  
✅ Hướng dẫn deploy chi tiết  

**Chỉ cần push lên Git và tạo Web Service trên Render!** 🚀
