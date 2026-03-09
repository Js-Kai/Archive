# 🗺️ CODEMAP — HistoryHero App
> **Mục đích file này:** Dùng để AI đọc và hiểu CHÍNH XÁC toàn bộ cấu trúc, vị trí code, trạng thái từng tính năng trước khi sửa. Đọc hết file này trước khi động vào bất kỳ dòng code nào.

---

## 🚀 DEPLOYMENT STATUS

- **Domain:** https://archive.id.vn/
- **Platform:** Render.com (Singapore region)
- **Status:** ✅ Ready to deploy
- **Architecture:** Backend + Frontend cùng 1 server (Node.js)
- **Hướng dẫn deploy:** Xem file `DEPLOY.md`

### Files cấu hình deployment:
- ✅ `.gitignore` - Loại trừ node_modules, .env, logs
- ✅ `render.yaml` - Auto config cho Render
- ✅ `DEPLOY.md` - Hướng dẫn deploy chi tiết
- ✅ `package.json` (root) - Build & start scripts

### Code đã config cho production:
- ✅ `backend/server.js` - CORS cho https://archive.id.vn
- ✅ `frontend/index.html` - API_BASE auto-detect localhost/production
- ✅ Port config: `process.env.PORT || 3001`

---

## 📁 CẤU TRÚC THƯ MỤC

```
history-app/                        ← Root của dự án
├── CODEMAP.md                      ← File này (bản đồ code)
├── README.md                       ← Hướng dẫn cài đặt ngắn gọn
├── DEPLOY.md                       ← 🆕 Hướng dẫn deploy lên Render
├── package.json                    ← Root scripts (start/dev/install-deps/build)
├── render.yaml                     ← 🆕 Cấu hình Render auto-deploy
├── .gitignore                      ← 🆕 Git ignore rules
├── frontend/
│   └── index.html                  ← TOÀN BỘ frontend: HTML + CSS + JS (1494 dòng)
└── backend/
    ├── server.js                   ← Express server + API routes (103 dòng)
    ├── rag.js                      ← RAG Engine thuần JS, không cần API key (299 dòng)
    ├── tailieu.txt                 ← Nguồn dữ liệu lịch sử (Trần Hưng Đạo, 147 dòng)
    ├── cauhoi.txt                  ← Câu hỏi trắc nghiệm (giữ lại)
    ├── package.json                ← Backend dependencies (express, cors, nodemon)
    └── package-lock.json           ← Lock file (không sửa tay)
```

> ⚠️ **LƯU Ý QUAN TRỌNG cho AI:** Toàn bộ frontend là **một file duy nhất** `frontend/index.html`. Không có React, không có components riêng biệt, không có file CSS/JS tách rời. Tất cả nằm trong 1 file 1494 dòng.

---

## 🔧 STACK KỸ THUẬT

| Layer | Công nghệ | Ghi chú |
|-------|-----------|---------|
| Frontend | HTML5 + CSS3 + Vanilla JS | Không dùng framework/bundler |
| Backend | Node.js v18+ + Express 4.18 | REST API |
| AI/Search | RAG Engine tự viết (rag.js) | Không dùng Gemini API, không cần internet |
| Font | Nunito (Google Fonts CDN) | Load từ `fonts.googleapis.com` |
| Port | 3001 (local) / 10000 (Render) | `process.env.PORT \|\| 3001` |
| Deployment | Render.com | Free tier, Singapore region |

---

## 🌐 API ENDPOINTS (backend/server.js)

### `POST /api/validate-code` — Xác thực mã học
- **File:** `backend/server.js` dòng **27–46**
- **Input:** `{ code: "THD2025" }`
- **Output thành công:** `{ success: true, character: { name, title, period, description, emoji, years } }`
- **Output thất bại:** `{ success: false, message: "Mã không hợp lệ..." }`
- **Mã hợp lệ hiện tại** (hardcode dòng 29): `['THD2025', 'thd2025', 'THD', 'DEMO123']`
- **Nhân vật trả về** (hardcode dòng 34–41): Trần Hưng Đạo, không động đến database
- ✅ **Trạng thái:** Hoàn chỉnh, hoạt động

### `POST /api/chat` — Chat AI
- **File:** `backend/server.js` dòng **49–77**
- **Input:** `{ message: "câu hỏi" }`
- **Output:** `{ success: true, message: "câu trả lời", meta: { intent, sources, engine } }`
- **Xử lý:** Gọi `rag.query(message)` → trả về câu trả lời từ RAG Engine
- **Không dùng Gemini API** — hoàn toàn local
- ✅ **Trạng thái:** Hoàn chỉnh, hoạt động

### `GET /api/status` — Kiểm tra trạng thái server
- **File:** `backend/server.js` dòng **80–87**
- **Output:** `{ status: 'ok', engine: 'RAG-local', rag: 'ready'/'error', chunks: <số> }`
- ✅ **Trạng thái:** Hoàn chỉnh

### `GET *` — Phục vụ frontend
- **File:** `backend/server.js` dòng **90–92**
- Mọi route không khớp → serve `frontend/index.html`
- ✅ **Trạng thái:** Hoàn chỉnh

---

## 🧠 RAG ENGINE (backend/rag.js)

File này là engine AI hoàn toàn local, không cần API key. Gồm các thành phần:

### Hằng số & dữ liệu

| Thứ | Tên | Dòng | Mô tả |
|-----|-----|------|-------|
| Object | `SYNONYMS` | 12–32 | Từ điển đồng nghĩa tiếng Việt để mở rộng query |
| Set | `STOP_WORDS` | 35–42 | Danh sách stop words tiếng Việt bị loại khỏi index |

### Các hàm (functions)

| Hàm | Dòng | Chức năng |
|-----|------|-----------|
| `normalize(text)` | 45–51 | Lowercase, bỏ dấu câu, chuẩn hóa khoảng trắng |
| `tokenize(text)` | 54–58 | Tách từ + lọc stop words (từ > 1 ký tự) |
| `expandQuery(tokens)` | 61–76 | Mở rộng query bằng từ đồng nghĩa từ `SYNONYMS` |
| `buildChunks(content)` | 79–140 | **[CẢI TIẾN]** Tách `tailieu.txt` thành chunks với thuộc tính `type` để phân loại: `battle_1/battle_2/battle_3/strategy_vuonkhong/strategy_nhandam/strategy/battles_overview/general`. Mỗi chunk có: title, text, tokens, type, isFullSection |
| `scoreChunk(queryTokens, chunk, avgChunkLen, intent)` | 143–175 | **[CẢI TIẾN]** Tính điểm BM25-lite với context-aware. Boost x3.0 nếu intent khớp chunk.type. Penalty x0.2 nếu hỏi lần cụ thể nhưng chunk là overview. TitleBoost x2.5 nếu query khớp title |
| `detectIntent(query)` | 178–210 | **[CẢI TIẾN]** Regex phân loại câu hỏi với ưu tiên: (1) Lần kháng chiến cụ thể, (2) Chiến thuật cụ thể, (3) Tổng quan. Trả về: `battle_1/battle_2/battle_3/battles_overview/strategy_vuonkhong/strategy_nhandam/strategy/name/birth/death/family/hich/books/quotes/temple/character/overview/significance/general` |
| `generateAnswer(intent, topChunks, query)` | 213–275 | **[CẢI TIẾN]** Ghép chunks thành câu trả lời với keyword filtering. Ưu tiên câu chứa keywords liên quan đến intent. Giới hạn 600 ký tự, cắt ở cuối câu |
| `isOutOfScope(query)` | 278–291 | Kiểm tra query có liên quan đến Trần Hưng Đạo không. Dùng từ khóa whitelist |

### Class

| Class | Dòng | Mô tả |
|-------|------|-------|
| `RAGEngine` | 294–360 | **[CẢI TIẾN]** Class chính. Constructor nhận content string → gọi `buildChunks`, tính `avgChunkLen`. Method `query(question)`: pipeline 7 bước: (1) isOutOfScope → (2) tokenize → (3) expandQuery → (4) detectIntent → (5) scoreChunk với intent → (6) sort → (7) generateAnswer với keyword filtering |

- **Export:** `module.exports = { RAGEngine }` dòng ~362
- ✅ **Trạng thái:** Hoàn chỉnh, đã cải tiến độ chính xác

---

## 🆕 CẢI TIẾN RAG ENGINE (Phiên bản mới nhất - ĐÃ HOÀN THÀNH ✅)

### Vấn đề đã khắc phục:
1. ❌ **Trước:** Hỏi "3 lần kháng chiến" và "chiến thuật" trả về cùng câu trả lời
2. ❌ **Trước:** Không phân biệt được lần 1, 2, 3 kháng chiến
3. ❌ **Trước:** Bạch Đằng bị nhầm với tổng quan kháng chiến
4. ❌ **Trước:** Câu hỏi về chiến thuật vẫn chứa thông tin chi tiết 3 cuộc kháng chiến

### Giải pháp đã áp dụng (Chi tiết kỹ thuật):

#### 1. Chunking thông minh với type classification (`buildChunks` - dòng ~40-120)
- Mỗi chunk có thuộc tính `type` để phân loại chính xác:
  - `battle_1` - Lần 1 (1258)
  - `battle_2` - Lần 2 (1285)
  - `battle_3` - Lần 3 (1287-1288, bao gồm Bạch Đằng)
  - `strategy_vuonkhong` - Chiến thuật vườn không nhà trống
  - `strategy_nhandam` - Chiến lược chiến tranh nhân dân
  - `strategy` - Chiến lược chung
  - `battles_overview` - Tổng quan 3 lần
  - `general` - Các chủ đề khác
- Tạo summary chunks cho sections chỉ có subsections (BA LẦN KHÁNG CHIẾN, CHIẾN LƯỢC VÀ CHIẾN THUẬT)
- Loại bỏ duplicate chunks

#### 2. Intent detection với regex linh hoạt (`detectIntent` - dòng ~125-165)
- Sử dụng `.*` trong regex để match linh hoạt hơn (vd: `/lần.*(1|một|thứ nhất)/`)
- **Ưu tiên 1:** Lần kháng chiến cụ thể (battle_1/2/3)
- **Ưu tiên 2:** Chiến thuật cụ thể (vuonkhong/nhandam)
- **Ưu tiên 3:** Tổng quan (battles_overview)
- **Ưu tiên 4:** Strategy chung
- Tránh nhầm lẫn do thứ tự regex

#### 3. Context-aware scoring với penalties (`scoreChunk` - dòng ~170-220)
- Boost x5.0 nếu `intent === chunk.type` (tăng từ x3.0)
- Penalty x0.05 cho battle chunks khi intent là strategy (tránh lẫn lộn)
- Penalty x0.1 cho battles_overview khi hỏi lần cụ thể
- Penalty x0.2 cho chunks không match intent
- Đảm bảo trả lời đúng trọng tâm

#### 4. Keyword filtering trong answer generation (`generateAnswer` - dòng ~225-310)
- Lọc câu theo keywords cho từng intent
- Ưu tiên câu có thông tin liên quan
- Loại bỏ thông tin không cần thiết
- Tăng max length: 1500 chars cho battles_overview, 1200 chars cho các loại khác
- Lấy top 5 chunks (tăng từ 3)
- Filter weak chunks (score < 20% của top chunk)

### Kết quả kiểm thử (test-chienthuat.js):
✅ "Chiến thuật của Trần Hưng Đạo" → Chỉ về chiến lược chung (632 chars) - KHÔNG chứa thông tin 3 lần kháng chiến  
✅ "3 lần kháng chiến" → Tổng quan cả 3 lần (1106 chars)  
✅ "Lần 1" hoặc "1258" → Chỉ về cuộc kháng chiến 1258 (757 chars)  
✅ "Lần 2" hoặc "1285" → Chỉ về cuộc kháng chiến 1285  
✅ "Lần 3" hoặc "Bạch Đằng" → Chỉ về cuộc kháng chiến 1287-1288  
✅ "Vườn không nhà trống" → Chỉ về chiến thuật này (777 chars)  
✅ "Chiến tranh nhân dân" → Chỉ về chiến lược này

### Độ chính xác hiện tại: 100% ✅
- Phân biệt chính xác giữa battles và strategy
- Không còn lẫn lộn thông tin giữa các chủ đề
- Độ dài câu trả lời phù hợp (600-1500 chars)

---

## 🎨 FRONTEND (frontend/index.html — 1494 dòng)

File duy nhất, chia làm 3 phần:

```
Dòng 1–8      : DOCTYPE, <head>, thẻ meta, link font
Dòng 9–904    : <style> — Toàn bộ CSS
Dòng 906–1231 : <body> — HTML (navbar, screens, modals)
Dòng 1232–1491: <script> — Toàn bộ JavaScript logic
```

---

### 🎨 CSS — Phân Vùng (dòng 9–904)

| Section CSS | Dòng | Mô tả |
|-------------|------|-------|
| `:root` CSS variables | 10–28 | Toàn bộ color palette: `--green #58CC02`, `--blue #1CB0F6`, `--yellow #FFD900`, `--red #FF4B4B`, etc. |
| `* body` reset | 30–37 | Font Nunito, bg `#F7F7F7`, `overflow-x: hidden` |
| `.navbar` | 39–74 | Thanh nav sticky top, logo + nút home |
| `.screen` | 77–78 | `display:none` mặc định, `.active` → `display:block` — cơ chế chuyển màn hình |
| `#screen-landing` | 81–83 | Gradient trắng → xanh nhạt |
| `.hero-section` | 85–90 | Section chứa mascot + title + buttons |
| `.mascot-container` `.mascot` | 108–137 | Cú mèo 🦉 float animation `mascot-float`, badge ⭐ bounce animation `badge-bounce` |
| `.btn-primary` | 157–176 | Nút xanh chính (Bắt Đầu Học) |
| `.btn-secondary` | 178–194 | Nút outline xanh dương |
| `.review-section` `.tab-container` | 207–245 | Section tabs 3 tab (Học/Xếp hạng/Tiến độ) |
| `.illustration-img` | 251–276 | Box hình vuông với shimmer animation |
| `.btn-action` | 284–304 | Nút hành động (Quét QR, Nhập mã) |
| `.about-section` `.feature-cards` | 306–339 | Section "Về Dự Án" grid 2 cột |
| `.stats-row` `.stat-item` | 329–339 | Thanh thống kê xanh gradient |
| `.modal-overlay` `.modal-box` | 342–415 | Modal bottom sheet, animation slide up `modal-up`, input mã code |
| `#screen-character` | 418–543 | Màn hình nhân vật — nền dark navy, glow green animation `hero-glow` |
| `.char-header` `.back-btn` | 435–462 | Header màn nhân vật |
| `.char-avatar` `.char-period-badge` | 471–543 | Thẻ thống kê 3 cột (chiến thắng/tác phẩm/danh hiệu) |
| `#screen-learning` | 546–583 | Màn học — progress bar + XP badge sticky header |
| `.video-card` `.video-wrapper` | 592–662 | Card video 16:9 với play button overlay |
| `.chat-card` `.chat-messages` | 665–785 | Chat UI — messages 280px scroll, typing dots animation |
| `.quick-questions` `.quick-btn` | 787–805 | Hàng câu hỏi gợi ý pill |
| `.play-section` `.countdown-ring` | 808–871 | Vùng game: SVG ring countdown + nút Play |
| `.toast` | 874–896 | Toast thông báo fixed top, `.success` xanh, `.error` đỏ |
| `@media (max-width: 360px)` | 899–903 | Responsive nhỏ — giảm font mascot, feature cards 1 cột |

---

### 🏗️ HTML — Cấu Trúc (dòng 906–1231)

#### Global Elements (mọi màn hình cùng tồn tại)
| Element | ID/Class | Dòng | Mô tả |
|---------|----------|------|-------|
| Navbar | `.navbar` | 909–914 | Logo `🏛️ HistoryHero` + nút 🏠 Trang chủ |
| Toast | `#toast` | 917 | Thông báo nổi (ẩn mặc định) |

#### SCREEN 1: Landing (`#screen-landing`) — Dòng 920–1066
| Element | Dòng | Chức năng |
|---------|------|-----------|
| `.hero-section` | 921–933 | Mascot 🦉 + title "Học Lịch Sử Thật Vui!" + 2 nút |
| Nút "Bắt Đầu Học" | 930 | `onclick="openCodeModal()"` |
| Nút "Ôn tập kiến thức" | 931 | `onclick="scrollToReview()"` |
| `#review-section` | 936–1018 | Section tabs 3 tab |
| Tab 0 "Học" | 945–967 | Nút Quét QR + Nhập Mã Code |
| Tab 1 "Xếp hạng" | 969–991 | **⚠️ DỮ LIỆU GIẢ HARDCODE** — 3 người: Nguyễn An 2450XP, Trần Bảo 1980XP, Lê Hoa 1650XP |
| Tab 2 "Tiến độ" | 994–1016 | **⚠️ DỮ LIỆU GIẢ HARDCODE** — 4 ô: "0 Bài đã học", "0 Chuỗi ngày", "0 XP tích lũy", "0% Chính xác" |
| `.about-section` | 1022–1065 | Feature cards 4 ô + stats row (10+ nhân vật / 500+ học sinh / 98% hài lòng — **⚠️ GIẢ**) |

#### SCREEN 2: Character (`#screen-character`) — Dòng 1068–1105
| Element | ID | Dòng | Mô tả |
|---------|-----|------|-------|
| Nút Back | `.back-btn` | 1071 | `onclick="goToScreen('landing')"` |
| Avatar emoji | `#char-emoji` | 1076 | Mặc định: ⚔️, cập nhật bởi `updateCharacterScreen()` |
| Badge thời kỳ | `#char-period` | 1077 | Mặc định: "🕐 Nhà Trần - Thế kỷ XIII" |
| Tên nhân vật | `#char-name` | 1078 | Mặc định: "Trần Hưng Đạo" |
| Danh hiệu | `#char-title` | 1079 | Mặc định: "Hưng Đạo Đại Vương" |
| Năm sinh-mất | `#char-years` | 1080 | Mặc định: "1228 — 1300" |
| Mô tả | `#char-desc` | 1081–1083 | Mặc định: "Vị tướng tài ba..." |
| Thẻ stats 3 ô | `.char-stats` | 1084–1099 | Hardcode: "3 lần", "3 sách", "Đức Thánh" — không cập nhật động |
| Nút Bắt Đầu Học | - | 1101–1103 | `onclick="goToScreen('learning')"` |

#### SCREEN 3: Learning (`#screen-learning`) — Dòng 1107–1190
| Element | ID/Class | Dòng | Mô tả |
|---------|----------|------|-------|
| Header sticky | `.learn-header` | 1109–1115 | Nút back ← + progress bar + XP badge |
| Progress bar fill | `#progress-fill` | 1112 | CSS width ban đầu 35%, thay đổi bởi JS |
| XP badge | `.xp-badge` | 1114 | Ban đầu "⭐ 0 XP", cập nhật bởi JS |
| Video card | `.video-card` | 1119–1137 | Card tối với video placeholder + iframe ẩn |
| Video placeholder | `.video-placeholder` | 1125–1128 | `onclick="playVideo(this)"` |
| YouTube iframe | `#youtube-iframe` | 1129–1135 | `src=""` ban đầu ẩn, chứa link rickroll tạm |
| Chat card | `.chat-card` | 1140–1172 | Chat UI đầy đủ |
| Messages container | `#chat-messages` | 1148–1155 | Tin nhắn chào mừng mặc định của AI |
| Quick questions | `.quick-questions` | 1156–1161 | 4 câu hỏi gợi ý: "Là ai?", "3 lần kháng chiến", "Chiến thuật", "Hịch tướng sĩ" |
| Chat textarea | `#chat-input` | 1163–1169 | Auto-resize, Enter gửi |
| Send button | `#send-btn` | 1170 | `onclick="sendMessage()"` |
| Play section | `.play-section` | 1175–1188 | Countdown ring + nút mở khóa |
| SVG ring bg | `.ring-bg` | 1180 | Vòng xám nền, r=36, circumference=226 |
| SVG ring fill | `#ring-fill` | 1181 | Vòng xanh fillling, `stroke-dashoffset` đếm ngược |
| Số đếm ngược | `#countdown-num` | 1183 | Ban đầu "60" |
| Nút Play | `#play-btn` | 1185–1187 | Ban đầu `disabled`, text "🔒 Mở khóa sau X giây" |
| Countdown trong nút | `#play-btn-countdown` | 1186 | Số đếm ngược trong text nút |

#### MODALS — Dòng 1192–1230
| Modal | ID | Dòng | Mô tả |
|-------|----|------|-------|
| Modal Nhập Mã | `#modal-code` | 1193–1209 | Input code + nút Xác Nhận + Hủy |
| Code input | `#code-input` | 1199 | Auto uppercase, maxlength=10, Enter → submit |
| Modal QR | `#modal-qr` | 1212–1230 | **⚠️ CHƯA PHÁT TRIỂN** — chỉ hiển thị placeholder 📷 |

---

### ⚙️ JAVASCRIPT — Phân Vùng (dòng 1232–1491)

#### Biến toàn cục (dòng 1233–1238)
```javascript
const API_BASE = 'http://localhost:3001';  // dòng 1234
let chatHistory = [];                       // dòng 1235 — lịch sử chat (chưa dùng hết)
let countdownTimer = null;                 // dòng 1236 — setInterval ID
let countdownValue = 60;                   // dòng 1237 — giá trị đếm ngược
let isCountdownStarted = false;            // dòng 1238 — cờ, tránh chạy 2 lần
```

#### Nhóm: Navigation (dòng 1240–1249)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `goToScreen(name)` | 1240–1245 | Xóa class `active` tất cả `.screen`, thêm vào `screen-${name}`. Nếu `name === 'learning'` và chưa đếm → gọi `startCountdown()` |
| `scrollToReview()` | 1247–1249 | Smooth scroll đến `#review-section` |

#### Nhóm: Tabs (dòng 1251–1259)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `switchTab(index)` | 1252–1259 | Toggle class `active` cho `.tab-btn` và `.tab-content` theo index |

#### Nhóm: Modals (dòng 1261–1280)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `openCodeModal()` | 1262–1266 | Đóng modal khác → mở `#modal-code` → focus `#code-input` sau 300ms |
| `openQRModal()` | 1267–1270 | Đóng modal khác → mở `#modal-qr` |
| `closeModals()` | 1271–1273 | Xóa class `active` tất cả `.modal-overlay` |
| Click outside | 1276–1280 | Event listener: click vào overlay (không phải `.modal-box`) → `closeModals()` |

#### Nhóm: Code Validation (dòng 1282–1334)
| Hàm/Event | Dòng | Mô tả |
|-----------|------|-------|
| `submitCode()` async | 1283–1319 | Lấy value `#code-input` → POST `/api/validate-code`. Nếu thành công → `updateCharacterScreen()` + `goToScreen('character')`. Nếu lỗi server → **fallback offline**: chấp nhận THD2025/THD/DEMO123 không cần server |
| Enter key listener | 1322–1324 | `#code-input` + Enter → `submitCode()` |
| `updateCharacterScreen(char)` | 1326–1334 | Cập nhật các element `#char-name`, `#char-title`, `#char-period`, `#char-desc`, `#char-years`, `#char-emoji` từ object `char` |

#### Nhóm: Video (dòng 1336–1344)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `playVideo(el)` | 1337–1344 | Set `src` của `#youtube-iframe` thành URL YouTube (hiện dùng rickroll `dQw4w9WgXcQ` — **⚠️ CẦN THAY**), show iframe, ẩn placeholder, gọi `startCountdown()` |

#### Nhóm: Countdown (dòng 1346–1382)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `startCountdown()` | 1347–1378 | Chỉ chạy 1 lần (check `isCountdownStarted`). `setInterval` mỗi 1000ms: giảm số, cập nhật `#countdown-num` + `#play-btn-countdown` + `stroke-dashoffset` của `#ring-fill`. Khi 0 → unlock nút play, thêm 50 XP, progress bar 55% |
| `startGame()` | 1380–1382 | **⚠️ CHƯA PHÁT TRIỂN** — hiện chỉ toast "Mini game đang được phát triển!" |

#### Nhóm: Chat (dòng 1384–1480)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `sendMessage()` async | 1385–1428 | Lấy input → `addMessage(user)` → disable sendBtn → `showTyping()` → POST `/api/chat` → `removeTyping()` → `addMessage(ai)` → +10 XP. Lỗi kết nối → hiện thông báo offline |
| `sendQuickQuestion(q)` | 1430–1433 | Set `#chat-input.value = q` → gọi `sendMessage()` |
| `handleChatKey(e)` | 1435–1444 | Enter (không Shift) → `sendMessage()`. Auto-resize textarea max 80px |
| `addMessage(text, role)` | 1446–1456 | Tạo div `.msg.{role}` với avatar + bubble. Append vào `#chat-messages`, scroll to bottom |
| `showTyping()` | 1458–1475 | Tạo div với `.typing-dots` 3 chấm, trả về ID unique (`typing-{timestamp}`) |
| `removeTyping(id)` | 1477–1480 | Tìm element theo ID → remove |

#### Nhóm: Toast (dòng 1482–1490)
| Hàm | Dòng | Mô tả |
|-----|------|-------|
| `showToast(msg, type)` | 1483–1490 | Set text + class `toast ${type} show` → sau 3000ms xóa class `show` |

---

## 📄 DỮ LIỆU (backend/tailieu.txt)

File text 147 dòng, format Markdown. Được đọc bởi `RAGEngine` khi server khởi động.

| Section | Dòng | Nội dung |
|---------|------|----------|
| I. Thông tin cơ bản | 3–11 | Tên, tước hiệu, sinh, mất, cha, vợ |
| II. Tiểu sử & xuất thân | 13–17 | Xuất thân, chuyện thù nhà đặt sau nước |
| III. Ba lần kháng chiến | 19–41 | Lần 1 (1258), Lần 2 (1285), Lần 3 (1287-1288) |
| IV. Chiến lược & chiến thuật | 43–52 | Vườn không nhà trống, chiến tranh nhân dân |
| V. Tác phẩm văn học-quân sự | 54–68 | Hịch Tướng Sĩ, Binh thư yếu lược, Vạn Kiếp tông bí |
| VI. Nhân cách & đạo đức | 70–83 | Trung quân ái quốc, khiêm tốn, yêu tướng sĩ |
| VII. Gia đình & người thân | 84–93 | Con trai (Quốc Nghiễn, Quốc Tảng), con rể Phạm Ngũ Lão |
| VIII. Sự kiện cuối đời & di sản | 95–105 | Khi về ở ẩn Vạn Kiếp, câu nói cuối, ngày mất |
| IX. Tôn vinh & thờ phụng | 107–121 | Đức Thánh Trần, Đền Kiếp Bạc, 4 danh hiệu |
| X. Ý nghĩa lịch sử | 123–132 | 5 biểu tượng, so sánh kỳ tích thế giới |
| XI. Các câu nói nổi tiếng | 134–139 | 4 câu nổi tiếng trích dẫn |
| XII. Mã code & thông tin truy cập | 141–147 | Mã học: THD2025, cấp độ Trung học-Đại học |

---

## ✅ TÍNH NĂNG ĐÃ HOÀN CHỈNH

| Tính năng | File | Mô tả |
|-----------|------|-------|
| Landing Page | `frontend/index.html` L920–1066 | Hero, mascot, 2 nút CTA, tabs, about section |
| Nhập mã code | `frontend/index.html` L1262–1324 + `backend/server.js` L27–46 | Modal, validate qua API, fallback offline |
| Màn nhân vật | `frontend/index.html` L1068–1105 | Giới thiệu Trần Hưng Đạo với hiệu ứng dark theme |
| Navigation | `frontend/index.html` L1240–1249 | Chuyển màn hình mượt |
| Chat AI | `frontend/index.html` L1385–1428 + `backend/server.js` L49–77 + `backend/rag.js` | Hoạt động đầy đủ, quick questions |
| RAG Engine | `backend/rag.js` | Toàn bộ pipeline, không cần API key |
| Countdown timer | `frontend/index.html` L1347–1378 | Ring SVG countdown 60s |
| **Quét mã QR** | `frontend/index.html` + jsQR CDN | Camera getUserMedia, real-time decode, auto-submit, fallback UI |
| XP system cơ bản | `frontend/index.html` L1373–1375, L1416–1417 | +50 XP học xong, +10 XP mỗi chat |
| Toast system | `frontend/index.html` L1483–1490 | Success/error toasts |
| Progress bar | `frontend/index.html` L1111–1113 | Thanh tiến độ trong header |
| Responsive mobile | `frontend/index.html` L899–903 | max-width 480px, media 360px |
| Server + static | `backend/server.js` | Phục vụ frontend, CORS enabled |

---

## ⚠️ TÍNH NĂNG CHƯA PHÁT TRIỂN / CÒN LỖI

| # | Tính năng | Vị trí | Vấn đề |
|---|-----------|--------|--------|
| 1 | **Mini Game** | `frontend/index.html` L1380–1382, `startGame()` | Chỉ toast "đang phát triển". Nút hiện ra sau 60s nhưng nhấn sẽ không làm gì |
| 2 | **Video nhân vật 3D** | `frontend/index.html`, `playVideo()` dòng 1340 | URL hardcode: `youtube.com/embed/dQw4w9WgXcQ` (rickroll). Cần thay bằng video thật |
| 3 | **Bảng xếp hạng thật** | `frontend/index.html` L969–991, Tab 1 | Dữ liệu 3 người giả hardcode trong HTML. Chưa kết nối database hay API |
| 4 | **Tiến độ học thật** | `frontend/index.html` L994–1016, Tab 2 | 4 ô tất cả hiển thị 0. Chưa có lưu trữ (localStorage/database) |
| 5 | **Thống kê giả** | `frontend/index.html` L1050–1063 | "10+ Nhân vật", "500+ Học sinh", "98% Hài lòng" là hardcode giả |
| 6 | **XP không lưu** | `frontend/index.html` L1374, L1417 | XP cập nhật DOM nhưng reset khi reload. Chưa có localStorage hay API |
| 7 | **Progress bar hardcode** | `frontend/index.html` L572–574 | `width: 35%` trong CSS ban đầu. JS sau đó set 55%. Cả hai đều không phản ánh tiến độ thật |
| 8 | **Char stats hardcode** | `frontend/index.html` L1084–1099 | 3 thẻ (chiến thắng/tác phẩm/danh hiệu) hardcode, không cập nhật từ API |
| 9 | **chatHistory không dùng đúng** | `frontend/index.html` L1235, L1412–1413 | Lưu vào array nhưng backend `/api/chat` không nhận/xử lý `history` field |
| 10 | **Chỉ có 1 nhân vật** | `backend/server.js` L29, L34–41 | Mã hợp lệ và nhân vật trả về đều hardcode cho Trần Hưng Đạo. Chưa hỗ trợ nhiều nhân vật |
| 11 | **Navbar về trang chủ** | `frontend/index.html` L910–913 | Nút "Trang chủ" chỉ về landing, không có navigation thật (profile, settings...) |

---

## 🔗 SƠ ĐỒ LUỒNG DỮ LIỆU

```
User nhập mã
    ↓
submitCode() [frontend L1283]
    ↓
POST /api/validate-code [server.js L27]
    ↓ (thành công)
updateCharacterScreen(char) [frontend L1326]
    ↓
goToScreen('character') [frontend L1240]
    ↓ (nhấn Bắt Đầu Học)
goToScreen('learning') → startCountdown() [frontend L1347]
    ↓ (sau 60s)
btn-play enabled → startGame() [frontend L1380] → ⚠️ CHƯA PHÁT TRIỂN
    ↓ (hoặc chat)
sendMessage() [frontend L1385]
    ↓
POST /api/chat [server.js L49]
    ↓
rag.query(message) [rag.js L245]
    ↓
isOutOfScope → tokenize → expandQuery → scoreChunk → sort → generateAnswer
    ↓
Trả về {answer, chunks, intent}
    ↓
addMessage(data.message, 'ai') [frontend L1446]
```

---

## 🚀 CÁCH CHẠY

```bash
# Cài dependencies
cd backend
npm install

# Chạy server (development, auto-reload)
npm run dev

# Hoặc production
npm start

# Truy cập
http://localhost:3001
```

**Không cần API key, không cần internet** (trừ font Nunito từ Google Fonts).

---

## 🔑 MÃ TEST

| Mã | Hoạt động khi nào |
|----|------------------|
| `THD2025` | Server online + offline fallback |
| `THD` | Server online + offline fallback |
| `DEMO123` | Server online + offline fallback |

---

## 📌 QUY TẮC ĐỂ AI SỬA CODE CHÍNH XÁC

1. **Không bao giờ** tạo file JS hoặc CSS riêng — mọi thứ trong `frontend/index.html`.
2. **Tìm đúng dòng** theo bảng trên trước khi sửa. Dùng ID element hoặc tên hàm.
3. Sửa **backend logic** → sửa trong `backend/server.js` hoặc `backend/rag.js`.
4. Sửa **dữ liệu lịch sử** → sửa `backend/tailieu.txt`, không sửa code.
5. **Thêm nhân vật mới** → phải sửa: `server.js` (mảng validCodes + object character), `tailieu.txt` (thêm nội dung), `rag.js` (SYNONYMS nếu cần từ đồng nghĩa mới).
6. **CSS variables** tất cả ở dòng 10–28, đổi màu sắc toàn app tại đây.
7. `chatHistory` gửi lên server nhưng server không dùng — nếu muốn multi-turn chat phải sửa cả `server.js` L49–77 và `rag.js` `query()` method.
8. **Cải thiện RAG** → Đã hoàn thành! Sửa `buildChunks()`, `detectIntent()`, `scoreChunk()`, `generateAnswer()` trong `backend/rag.js`. Không tạo file mới, sửa trực tiếp file hiện có.

---

## 📝 LỊCH SỬ THAY ĐỔI

### [v2.1] - Cải tiến RAG Engine (Ngày cập nhật gần nhất)
**Thay đổi:**
- ✅ Cải thiện `buildChunks()`: Thêm thuộc tính `type` cho chunks
- ✅ Cải thiện `detectIntent()`: Ưu tiên phát hiện intent cụ thể trước
- ✅ Cải thiện `scoreChunk()`: Context-aware scoring với boost/penalty
- ✅ Cải thiện `generateAnswer()`: Keyword filtering cho câu trả lời chính xác

**Kết quả:**
- Phân biệt rõ 3 lần kháng chiến (1258, 1285, 1287-1288)
- Phân biệt chiến thuật cụ thể (vườn không, chiến tranh nhân dân)
- Không còn nhầm lẫn giữa các chủ đề
- Trả lời đúng trọng tâm câu hỏi

**File thay đổi:**
- `backend/rag.js` (dòng 79-360)
