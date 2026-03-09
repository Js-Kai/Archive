# 🏛️ HistoryHero - Học Lịch Sử Tương Tác

Ứng dụng học lịch sử Việt Nam theo phong cách Duolingo, tích hợp AI Gemini.

---

## 📁 Cấu Trúc Dự Án

```
history-app/
├── frontend/
│   └── index.html          ← Toàn bộ UI (HTML + CSS + JS)
├── backend/
│   ├── server.js           ← Express server + Gemini API
│   ├── tailieu.txt         ← Nội dung lịch sử Trần Hưng Đạo
│   └── package.json        ← Backend dependencies
├── package.json            ← Root scripts
└── README.md               ← Hướng dẫn này
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### Yêu cầu
- Node.js >= 16.x (https://nodejs.org)
- npm >= 8.x

### Bước 1: Cài đặt dependencies

```bash
cd history-app/backend
npm install
```

### Bước 2: Chạy backend server

```bash
# Trong thư mục backend/
npm start
# Hoặc dùng nodemon để auto-reload:
npm run dev
```

Server sẽ chạy tại: `http://localhost:3001`

### Bước 3: Mở frontend

**Cách 1 (Khuyến nghị):** Truy cập qua backend server:
```
http://localhost:3001
```

**Cách 2:** Mở trực tiếp file HTML (chức năng AI chat sẽ không hoạt động):
```
Mở file frontend/index.html trong trình duyệt
```

---

## 🔑 Demo

Để thử nghiệm ứng dụng:
1. Mở `http://localhost:3001`
2. Nhấn **"Bắt Đầu Học"** hoặc **"Nhập Mã Code"**
3. Nhập mã: **`THD2025`**
4. Nhấn "Bắt Đầu Học" để vào trang học
5. Chờ 60 giây để mở khóa game (hoặc chat với AI)

### Các mã hợp lệ:
- `THD2025` - Trần Hưng Đạo (demo đầy đủ)
- `THD` - Trần Hưng Đạo (rút gọn)
- `DEMO123` - Chế độ demo

---

## 🤖 Tính Năng

| Tính năng | Mô tả |
|-----------|-------|
| Landing Page | UI Duolingo, mascot animation, tab học/xếp hạng/tiến độ |
| Nhập mã / QR | Xác thực mã để vào bài học |
| Trang nhân vật | Giới thiệu Trần Hưng Đạo với hiệu ứng |
| Video 3D | Embed video nhân vật |
| Chat AI | Hỏi đáp về Trần Hưng Đạo qua Gemini 2.5 |
| Countdown Timer | Mở khóa game sau 60 giây |
| Hệ thống XP | Tích điểm khi học và chat |

---

## 🛠️ Công Nghệ

- **Frontend:** HTML5 + CSS3 + Vanilla JS
- **Backend:** Node.js + Express
- **AI:** Google Gemini 2.5 Pro API
- **Font:** Nunito (Google Fonts)
- **Responsive:** Mobile-first design

---

## 📝 Tùy Chỉnh Nội Dung

Chỉnh sửa file `backend/tailieu.txt` để thay đổi nhân vật lịch sử. File hiện tại chứa thông tin về **Trần Hưng Đạo**.

Format file:
```
# TÊN NHÂN VẬT

## I. THÔNG TIN CƠ BẢN
...

## II. TIỂU SỬ
...
```

AI sẽ CHỈ trả lời dựa trên nội dung file này.

---

## ⚙️ Cấu Hình API

Trong `backend/server.js`:
```javascript
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';
```

---

## 🐛 Troubleshooting

**Lỗi "Cannot connect to server":**
- Kiểm tra backend đang chạy: `cd backend && npm start`
- Kiểm tra port 3001 không bị chiếm

**Lỗi Gemini API:**
- Kiểm tra API key còn hạn
- Kiểm tra kết nối internet

**Frontend không hiển thị:**
- Truy cập `http://localhost:3001` thay vì mở file trực tiếp
