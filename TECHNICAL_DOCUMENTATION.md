# 📘 TÀILIỆU KỸ THUẬT CHI TIẾT - HISTORYHERO APP

> **Mục đích**: File này cung cấp thông tin đầy đủ về cấu trúc, chức năng, và vị trí code để AI/Developer có thể sửa code chính xác mà không bị nhầm lẫn.

---

## 🏗️ CẤU TRÚC DỰ ÁN

```
history-app/
├── frontend/
│   └── index.html              [2350 dòng] - Single Page Application (SPA)
│       ├── <style>             [Dòng 1-1200+] - CSS styling
│       ├── <body>              [Dòng 1200-2000+] - HTML structure
│       └── <script>            [Dòng 2000-2350] - JavaScript logic
│
├── backend/
│   ├── server.js               [85 dòng] - Express server + API routes
│   ├── rag.js                  [450+ dòng] - RAG Engine (AI local)
│   ├── tailieu.txt             - Nội dung học về Trần Hưng Đạo
│   ├── package.json            - Backend dependencies
│   └── node_modules/           - Installed packages
│
├── package.json                - Root package (scripts chạy app)
└── README.md                   - Hướng dẫn cơ bản
```

---

## 🎯 KIẾN TRÚC HỆ THỐNG

### 1. FRONTEND (Single Page Application)
**File**: `frontend/index.html` (2350 dòng)

#### A. CẤU TRÚC HTML - 5 SCREENS CHÍNH


| Screen ID | Vị trí HTML | Mô tả | Trạng thái |
|-----------|-------------|-------|------------|
| `#screen-landing` | Dòng ~1300-1600 | Trang chủ với hero section, tabs (Học/Xếp hạng/Tiến độ), About section | ✅ HOÀN THÀNH |
| `#screen-character` | Dòng ~1700-1800 | Giới thiệu nhân vật lịch sử (Trần Hưng Đạo) | ✅ HOÀN THÀNH |
| `#screen-learning` | Dòng ~1850-2000 | Trang học với Video 3D, Chat AI, Countdown timer | ✅ HOÀN THÀNH |
| `#screen-game` | Dòng ~2000+ | Mini game trắc nghiệm (Who Wants to Be a Millionaire style) | ✅ HOÀN THÀNH |
| Modal overlays | Dòng ~1650-1750 | Code modal, QR scanner modal | ✅ HOÀN THÀNH |

#### B. CSS STYLING (Dòng 1-1200+)

**CSS Variables** (Dòng ~15-30):
```css
:root {
  --green: #58CC02;        /* Màu chủ đạo (Duolingo style) */
  --blue: #1CB0F6;         /* Màu phụ */
  --yellow: #FFD900;       /* XP badge */
  --red: #FF4B4B;          /* Error/Wrong answer */
  /* ... các biến khác */
}
```

**Các Section CSS Chính**:
- Navbar: Dòng ~50-90
- Landing page: Dòng ~100-400
- Character screen: Dòng ~700-850
- Learning screen: Dòng ~900-1100
- Game screen: Dòng ~1150-1200+


#### C. JAVASCRIPT LOGIC (Dòng 2000-2350)

**Các Function Chính**:

| Function | Vị trí | Chức năng | Gọi từ đâu |
|----------|--------|-----------|------------|
| `goToScreen(screenId)` | ~Dòng 2050 | Chuyển đổi giữa các screen | Tất cả buttons navigation |
| `openCodeModal()` | ~Dòng 2100 | Mở modal nhập mã code | Button "Bắt Đầu Học" |
| `openQRModal()` | ~Dòng 2120 | Mở modal quét QR | Button "Quét Mã QR" |
| `validateCode()` | ~Dòng 2150 | Gửi mã đến API `/api/validate-code` | Modal code submit |
| `sendMessage()` | ~Dòng 2200 | Gửi chat đến API `/api/chat` | Chat input trong learning screen |
| `startCountdown()` | ~Dòng 2250 | Đếm ngược 60s để unlock game | Auto khi vào learning screen |
| `playVideo()` | ~Dòng 2180 | Load YouTube iframe | Click vào video placeholder |
| `switchTab(index)` | ~Dòng 2080 | Chuyển tab trong landing page | Tab buttons |
| `showToast(msg, type)` | ~Dòng 2070 | Hiển thị thông báo toast | Nhiều nơi |

**State Management** (Global Variables):
```javascript
let currentXP = 0;              // Điểm XP hiện tại
let countdownTimer = 60;        // Timer cho game unlock
let gameUnlocked = false;       // Trạng thái unlock game
let currentCharacter = null;    // Thông tin nhân vật hiện tại
```


---

## 🔧 BACKEND ARCHITECTURE

### 2. SERVER.JS (85 dòng)

**File**: `backend/server.js`

#### A. DEPENDENCIES & SETUP (Dòng 1-15)
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { RAGEngine } = require('./rag');
```

#### B. API ENDPOINTS

| Route | Method | Vị trí | Chức năng | Input | Output |
|-------|--------|--------|-----------|-------|--------|
| `/api/validate-code` | POST | Dòng 20-40 | Xác thực mã học | `{ code: string }` | `{ success: bool, character: {...} }` |
| `/api/chat` | POST | Dòng 42-70 | Chat với AI (RAG) | `{ message: string }` | `{ success: bool, message: string, meta: {...} }` |
| `/api/status` | GET | Dòng 72-80 | Kiểm tra trạng thái server | - | `{ status, engine, rag, chunks }` |
| `/*` | GET | Dòng 82-85 | Serve frontend HTML | - | `index.html` |

#### C. RAG ENGINE INITIALIZATION (Dòng 10-18)
```javascript
const TAILIEU_PATH = path.join(__dirname, 'tailieu.txt');
let rag = null;

try {
  const content = fs.readFileSync(TAILIEU_PATH, 'utf-8');
  rag = new RAGEngine(content);  // Khởi tạo RAG với nội dung file
  console.log('✅ RAG Engine sẵn sàng!');
} catch (err) {
  console.error('❌ Không thể khởi tạo RAG Engine:', err.message);
}
```

**Valid Codes** (Dòng 22):
```javascript
const validCodes = ['THD2025', 'thd2025', 'THD', 'DEMO123'];
```


---

### 3. RAG.JS - AI ENGINE (450+ dòng)

**File**: `backend/rag.js`

#### A. CẤU TRÚC MODULE

| Section | Dòng | Mô tả |
|---------|------|-------|
| **Synonyms Dictionary** | 10-30 | Từ điển đồng nghĩa tiếng Việt để mở rộng query |
| **Stop Words** | 32-40 | Danh sách từ dừng (bỏ qua khi tính điểm) |
| **Utility Functions** | 42-100 | `normalize()`, `tokenize()`, `expandQuery()` |
| **Chunking Logic** | 102-150 | `buildChunks()` - Tách tài liệu thành chunks |
| **Scoring Algorithm** | 152-200 | `scoreChunk()` - Tính điểm BM25-lite |
| **Intent Detection** | 202-250 | `detectIntent()` - Phát hiện chủ đề câu hỏi |
| **Answer Generation** | 252-300 | `generateAnswer()` - Tạo câu trả lời tự nhiên |
| **RAGEngine Class** | 350-450 | Main class với method `query()` |

#### B. CÁCH HOẠT ĐỘNG

**1. INDEXING** (Khi khởi động):
```javascript
constructor(content) {
  this.content = content;
  this.chunks = buildChunks(content);  // Tách thành chunks
  this.avgChunkLen = ...;              // Tính độ dài trung bình
}
```

**2. RETRIEVAL** (Khi user hỏi):
```javascript
query(question) {
  // 1. Kiểm tra ngoài phạm vi
  if (isOutOfScope(question)) return ...;
  
  // 2. Tokenize + mở rộng query
  const rawTokens = tokenize(question);
  const expandedTokens = expandQuery(rawTokens);
  
  // 3. Tính điểm từng chunk
  const scored = this.chunks.map(chunk => ({
    ...chunk,
    score: scoreChunk(expandedTokens, chunk, this.avgChunkLen)
  }));
  
  // 4. Lấy top 3 chunks
  const topChunks = sorted.slice(0, 3);
  
  // 5. Generate answer
  const intent = detectIntent(question);
  const answer = generateAnswer(intent, topChunks, question);
  
  return { answer, chunks, intent };
}
```


#### C. INTENT TYPES (Dòng 202-250)

| Intent | Trigger Keywords | Ví dụ câu hỏi |
|--------|------------------|---------------|
| `name` | tên, gọi là, tên thật | "Tên thật của Trần Hưng Đạo là gì?" |
| `birth` | sinh, năm sinh, ra đời | "Trần Hưng Đạo sinh năm nào?" |
| `death` | mất, qua đời, từ trần | "Ông mất năm nào?" |
| `family` | cha, bố, con, gia đình | "Cha của Trần Hưng Đạo là ai?" |
| `battles` | ba lần, kháng chiến, đánh thắng | "Ba lần kháng chiến là gì?" |
| `battle_bd` | bạch đằng, cọc bạch | "Trận Bạch Đằng diễn ra như thế nào?" |
| `strategy` | chiến thuật, vườn không | "Chiến thuật của ông là gì?" |
| `hich` | hịch, tướng sĩ | "Hịch Tướng Sĩ nói gì?" |
| `books` | sách, binh thư, tác phẩm | "Ông viết sách gì?" |
| `quotes` | câu nói, danh ngôn | "Câu nói nổi tiếng của ông?" |
| `temple` | đền, thờ, kiếp bạc | "Đền thờ ở đâu?" |
| `overview` | là ai, giới thiệu, tiểu sử | "Trần Hưng Đạo là ai?" |
| `general` | (default) | Các câu hỏi khác |

#### D. SCORING ALGORITHM (BM25-lite)

**Công thức** (Dòng 152-200):
```javascript
function scoreChunk(queryTokens, chunk, avgChunkLen) {
  const k1 = 1.5;   // Term frequency saturation
  const b = 0.75;   // Length normalization
  
  // TF-IDF với length normalization
  score = Σ (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * len/avgLen))
  
  // Bonus nếu match trong title
  if (chunk.title.includes(token)) score *= 2.5;
  
  // Bonus nếu nhiều token match cùng lúc
  if (matchCount >= 2) score *= (1 + matchCount * 0.15);
}
```


---

## 🔄 LUỒNG HOẠT ĐỘNG (USER FLOW)

### Flow 1: Nhập Mã Code → Học
```
1. User click "Bắt Đầu Học" (landing page)
   ↓
2. openCodeModal() được gọi
   ↓
3. User nhập mã (VD: THD2025)
   ↓
4. validateCode() → POST /api/validate-code
   ↓
5. Backend kiểm tra mã trong validCodes[]
   ↓
6. Nếu hợp lệ: return character data
   ↓
7. Frontend lưu vào currentCharacter
   ↓
8. goToScreen('character') - Hiển thị màn giới thiệu
   ↓
9. User click "Bắt Đầu Học"
   ↓
10. goToScreen('learning') - Vào màn học
```

### Flow 2: Chat với AI
```
1. User nhập câu hỏi trong chat input (learning screen)
   ↓
2. sendMessage() được gọi
   ↓
3. POST /api/chat với { message: "..." }
   ↓
4. Backend: rag.query(message)
   ↓
5. RAG Engine:
   - Tokenize query
   - Expand với synonyms
   - Score tất cả chunks
   - Lấy top 3 chunks
   - Detect intent
   - Generate answer
   ↓
6. Return { answer, chunks, intent }
   ↓
7. Frontend hiển thị answer trong chat bubble
   ↓
8. Cộng XP (+10 mỗi câu hỏi)
```

