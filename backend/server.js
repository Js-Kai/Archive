const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { RAGEngine } = require('./rag');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://archive.id.vn'
    : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── Đọc tailieu.txt và khởi tạo RAG Engine ──────────────────────────────────
const TAILIEU_PATH = path.join(__dirname, 'tailieu.txt');
const CAUHOI_PATH = path.join(__dirname, 'cauhoi.txt');
let rag = null;

try {
  const content = fs.readFileSync(TAILIEU_PATH, 'utf-8');
  rag = new RAGEngine(content);
  console.log('✅ RAG Engine sẵn sàng!');
} catch (err) {
  console.error('❌ Không thể khởi tạo RAG Engine:', err.message);
}

// ─── Route: Validate mã học ───────────────────────────────────────────────────
app.post('/api/validate-code', (req, res) => {
  const { code } = req.body;
  const validCodes = ['THD2025', 'thd2025', 'THD', 'DEMO123'];

  if (validCodes.includes(code?.trim())) {
    res.json({
      success: true,
      character: {
        name: 'Trần Hưng Đạo',
        title: 'Hưng Đạo Đại Vương',
        period: 'Nhà Trần - Thế kỷ XIII',
        description: 'Vị tướng tài ba, anh hùng dân tộc, ba lần đánh thắng quân Mông-Nguyên, bảo vệ nền độc lập của Đại Việt.',
        emoji: '⚔️',
        years: '1228 - 1300',
      },
    });
  } else {
    res.json({ success: false, message: 'Mã không hợp lệ. Vui lòng thử lại!' });
  }
});

// ─── Route: Chat (dùng RAG, không cần API key) ───────────────────────────────
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Tin nhắn không được để trống' });
  }

  if (!rag) {
    return res.status(500).json({
      error: 'RAG Engine chưa khởi động. Kiểm tra file tailieu.txt!',
    });
  }

  try {
    const result = rag.query(message.trim());
    res.json({
      success: true,
      message: result.answer,
      meta: {
        intent: result.intent,
        sources: result.chunks,
        engine: 'RAG-local',
      },
    });
  } catch (err) {
    console.error('❌ RAG query error:', err);
    res.status(500).json({ error: 'Có lỗi xử lý câu hỏi. Vui lòng thử lại.' });
  }
});

// ─── Route: Lấy 15 câu hỏi random (5/level) ─────────────────────────────────
app.get('/api/questions', (req, res) => {
  try {
    const raw = fs.readFileSync(CAUHOI_PATH, 'utf-8');
    const all = JSON.parse(raw);
    const shuffle = arr => arr.sort(() => Math.random() - 0.5);
    const byLevel = { 1: [], 2: [], 3: [] };
    all.forEach(q => { if (byLevel[q.level]) byLevel[q.level].push(q); });
    const selected = [
      ...shuffle(byLevel[1]).slice(0, 5),
      ...shuffle(byLevel[2]).slice(0, 5),
      ...shuffle(byLevel[3]).slice(0, 5),
    ];
    res.json({ success: true, questions: selected });
  } catch (err) {
    console.error('❌ Questions error:', err);
    res.status(500).json({ error: 'Không thể tải câu hỏi' });
  }
});

// ─── Route: Trạng thái server ─────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'RAG-local (no API key)',
    rag: rag ? 'ready' : 'error',
    chunks: rag ? rag.chunks.length : 0,
  });
});

// ─── Phục vụ frontend ─────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ======================================');
  console.log(`🚀  Server: http://localhost:${PORT}`);
  console.log(`🧠  Engine: RAG local (không cần API key)`);
  console.log(`📚  Chunks: ${rag ? rag.chunks.length : 'N/A'}`);
  console.log('🚀 ======================================');
  console.log('');
});
