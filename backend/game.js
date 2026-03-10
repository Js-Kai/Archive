/**
 * game.js — Module xử lý trò chơi Ai Là Triệu Phú
 * Đọc câu hỏi từ cauhoi.txt (định dạng JSON)
 *
 * FORMAT cauhoi.txt:
 * [
 *   {
 *     "id": 1, "level": 1,
 *     "question": "Nội dung câu hỏi?",
 *     "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
 *     "answer": "A",
 *     "hint": "Gợi ý (tùy chọn)"
 *   }, ...
 * ]
 * level 1 = Dễ | level 2 = Trung bình | level 3 = Khó
 */

const fs   = require('fs');
const path = require('path');

const CAUHOI_PATH = path.join(__dirname, 'cauhoi.txt');

/**
 * Parse cauhoi.txt (JSON array) → chuẩn hoá về dạng nội bộ:
 * { question, a, b, c, d, answer, level, explain }
 */
function parseCauHoi(content) {
  let raw;
  try {
    raw = JSON.parse(content);
  } catch (err) {
    console.error('[GameModule] cauhoi.txt không phải JSON hợp lệ:', err.message);
    return [];
  }

  if (!Array.isArray(raw)) {
    console.error('[GameModule] cauhoi.txt phải là một mảng JSON.');
    return [];
  }

  const questions = [];
  for (const item of raw) {
    if (!item.question || !item.options || !item.answer) continue;
    const opts = item.options;
    if (!opts.A || !opts.B || !opts.C || !opts.D) continue;

    questions.push({
      question : item.question.trim(),
      a        : opts.A.trim(),
      b        : opts.B.trim(),
      c        : opts.C.trim(),
      d        : opts.D.trim(),
      answer   : String(item.answer).toUpperCase().trim(),
      level    : parseInt(item.level) || 1,
      explain  : item.hint || item.explain || '',
    });
  }

  return questions;
}

/**
 * Đọc và trả về tất cả câu hỏi từ cauhoi.txt
 */
function loadQuestions() {
  try {
    const content = fs.readFileSync(CAUHOI_PATH, 'utf8');
    const questions = parseCauHoi(content);
    console.log(`[GameModule] Đã tải ${questions.length} câu hỏi từ cauhoi.txt`);
    return questions.length > 0 ? questions : getFallbackQuestions();
  } catch (err) {
    console.error('[GameModule] Lỗi đọc cauhoi.txt:', err.message);
    return getFallbackQuestions();
  }
}

/**
 * Câu hỏi dự phòng — trích từ chính nội dung cauhoi.txt của bạn
 */
function getFallbackQuestions() {
  return [
    { question: "Tên thật của Trần Hưng Đạo là gì?", a: "Trần Quốc Tuấn", b: "Trần Thái Tông", c: "Trần Nhân Tông", d: "Trần Quốc Toản", answer: "A", level: 1, explain: "Tên thật là Trần Quốc Tuấn, con trai An Sinh Vương Trần Liễu." },
    { question: "Nhân dân thường gọi Trần Hưng Đạo là gì?", a: "Đức Thánh Gióng", b: "Đức Thánh Trần", c: "Đức Thánh Tản", d: "Đức Thánh Mẫu", answer: "B", level: 1, explain: "Danh hiệu gắn với họ Trần — dòng họ của ông." },
    { question: "Trần Hưng Đạo lãnh đạo bao nhiêu lần kháng chiến thắng lợi?", a: "1 lần", b: "2 lần", c: "3 lần", d: "4 lần", answer: "C", level: 1, explain: "Ba lần: 1258, 1285 và 1287-1288." },
    { question: "Trần Hưng Đạo mất vào năm nào?", a: "1285", b: "1295", c: "1300", d: "1310", answer: "C", level: 1, explain: "Ông mất ngày 20/8 năm 1300 tại Vạn Kiếp." },
    { question: "Cha của Trần Hưng Đạo là ai?", a: "Trần Thái Tông", b: "Trần Liễu", c: "Trần Nhân Tông", d: "Trần Anh Tông", answer: "B", level: 1, explain: "Cha là An Sinh Vương Trần Liễu." },
    { question: "Chiến thắng Bạch Đằng lịch sử diễn ra vào năm nào?", a: "1258", b: "1285", c: "1288", d: "1300", answer: "C", level: 2, explain: "Trận thuỷ chiến vĩ đại kết thúc cuộc kháng chiến lần thứ ba." },
    { question: "Toa Đô bị tiêu diệt tại trận nào?", a: "Bạch Đằng", b: "Hàm Tử", c: "Tây Kết", d: "Chương Dương", answer: "C", level: 2, explain: "Tây Kết là chiến thắng lớn trong cuộc kháng chiến lần hai." },
    { question: "Ô Mã Nhi bị bắt sống tại trận nào?", a: "Hàm Tử", b: "Chương Dương", c: "Bạch Đằng", d: "Tây Kết", answer: "C", level: 2, explain: "Thất bại thảm hại nhất của quân Nguyên tại sông Bạch Đằng." },
    { question: "Con rể nổi tiếng của Trần Hưng Đạo là ai?", a: "Trần Quang Khải", b: "Phạm Ngũ Lão", c: "Trần Khánh Dư", d: "Đinh Lễ", answer: "B", level: 2, explain: "Phạm Ngũ Lão đang đan giỏ mải nghĩ việc nước đến bị giáo đâm không biết." },
    { question: "Cuốn sách binh pháp nào do Trần Hưng Đạo biên soạn?", a: "Binh thư yếu lược", b: "Binh pháp Tôn Tử bản Việt", c: "Lĩnh Nam chích quái", d: "Đại Việt sử ký", answer: "A", level: 2, explain: "Tên sách có nghĩa là những điều cốt lõi trong binh pháp." },
    { question: "Cha của Trần Hưng Đạo mâu thuẫn với ai và vì chuyện gì?", a: "Vua Trần Thái Tông — tranh giành vợ", b: "Vua Trần Nhân Tông — tranh ngôi", c: "Trần Quang Khải — tranh đất", d: "Phạm Ngũ Lão — tranh quyền", answer: "A", level: 3, explain: "Bà Thuận Thiên vốn là vợ Trần Liễu trước khi bị vua lấy." },
    { question: "Thoát Hoan trốn về nước sau lần 2 bằng cách nào?", a: "Cải trang thường dân", b: "Chui vào ống đồng để quân khiêng chạy", c: "Đi thuyền nhỏ vượt biển", d: "Cưỡi ngựa phi về biên giới", answer: "B", level: 3, explain: "Chi tiết kỳ lạ và nhục nhã nhất lịch sử thất trận." },
    { question: "Trần Khánh Dư tiêu diệt đoàn thuyền lương địch lần 3 tại đâu?", a: "Bạch Đằng", b: "Vân Đồn", c: "Hàm Tử", d: "Lạch Trường", answer: "B", level: 3, explain: "Vân Đồn — cửa biển Đông Bắc, nay thuộc Quảng Ninh." },
    { question: "Câu 'Nếu bệ hạ muốn hàng, trước hết hãy chém đầu thần đi đã' thể hiện điều gì?", a: "Sự kiêu ngạo coi thường vua", b: "Lòng trung thành và ý chí không đầu hàng", c: "Tính phục tùng mệnh lệnh", d: "Sự tức giận nhất thời", answer: "B", level: 3, explain: "Ông sẵn sàng chết chứ không chịu đầu hàng." },
    { question: "Trần Hưng Đạo dặn hậu sự của mình như thế nào?", a: "Xây lăng tẩm lớn tại Vạn Kiếp", b: "Chôn cất đơn sơ tại quê hương", c: "Hỏa táng, tro chôn trong vườn An Lạc, không xây lăng to", d: "Thả tro xuống sông Bạch Đằng", answer: "C", level: 3, explain: "Ông không muốn làm khổ dân vì việc tang lễ." },
  ];
}

/**
 * Trộn ngẫu nhiên mảng (Fisher-Yates shuffle)
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Lấy bộ 15 câu cho 1 game, phân bổ đều theo level:
 *   level 1 (dễ)   → câu 1–5
 *   level 2 (tb)   → câu 6–10
 *   level 3 (khó)  → câu 11–15
 *
 * File có 40 câu (14 level1 + 13 level2 + 13 level3)
 * Mỗi game chọn ngẫu nhiên → không bao giờ lặp đúng bộ câu.
 */
function getGameQuestions(count = 15) {
  const all = loadQuestions();

  const byLevel = {};
  for (const q of all) {
    const l = q.level || 1;
    if (!byLevel[l]) byLevel[l] = [];
    byLevel[l].push(q);
  }

  const distribution = [
    { level: 1, count: 5 },
    { level: 2, count: 5 },
    { level: 3, count: 5 },
  ];

  let selected = [];
  for (const { level, count: c } of distribution) {
    const pool = shuffle(byLevel[level] || []);
    selected.push(...pool.slice(0, c));
  }

  // Bổ sung nếu thiếu câu
  if (selected.length < count) {
    const used = new Set(selected.map(q => q.question));
    const extra = shuffle(all.filter(q => !used.has(q.question)));
    selected.push(...extra.slice(0, count - selected.length));
  }

  return selected.slice(0, count);
}

module.exports = { loadQuestions, getGameQuestions, parseCauHoi };
