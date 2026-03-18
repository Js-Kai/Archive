/**
 * rag.js — RAG Engine (Retrieval-Augmented Generation) thuần JavaScript
 * Không cần API key, không cần internet, chạy hoàn toàn local.
 *
 * Cách hoạt động:
 *  1. INDEXING  : Tách tailieu.txt thành các "chunk" nhỏ theo section/paragraph
 *  2. RETRIEVAL : Khi user hỏi → tính điểm TF-IDF đơn giản → lấy top chunks liên quan
 *  3. GENERATION: Ghép chunks thành câu trả lời tự nhiên bằng template
 */

// ─── Bộ từ đồng nghĩa / alias để mở rộng query ──────────────────────────────
const SYNONYMS = {
  'tên': ['tên thật', 'tên gọi', 'gọi là', 'tên đầy đủ'],
  'sinh': ['sinh năm', 'năm sinh', 'ra đời', 'ngày sinh'],
  'mất': ['qua đời', 'mất năm', 'năm mất', 'từ trần', 'băng hà', 'chết'],
  'cha': ['bố', 'ba', 'phụ thân', 'cha đẻ'],
  'vợ': ['phu nhân', 'hôn thê', 'bạn đời'],
  'chiến thắng': ['đánh thắng', 'đại thắng', 'chiến công', 'thắng lợi', 'đánh bại'],
  'kháng chiến': ['chống giặc', 'chống quân', 'kháng quân', 'đánh giặc'],
  'mông': ['mông cổ', 'mông-nguyên', 'nguyên mông', 'nguyên', 'quân nguyên'],
  'chiến thuật': ['chiến lược', 'cách đánh', 'phương pháp', 'kế sách', 'kế hoạch'],
  'sách': ['tác phẩm', 'trước tác', 'viết', 'soạn', 'binh thư'],
  'hịch': ['hịch tướng sĩ', 'hịch văn', 'bài hịch'],
  'bạch đằng': ['sông bạch đằng', 'trận bạch đằng', 'cọc bạch đằng'],
  'vườn không': ['vườn không nhà trống', 'tiêu thổ'],
  'nhân dân': ['dân', 'người dân', 'toàn dân', 'chiến tranh nhân dân'],
  'gia đình': ['con', 'con trai', 'con gái', 'con rể', 'gia tộc', 'dòng họ'],
  'câu nói': ['danh ngôn', 'lời nói', 'câu nổi tiếng', 'trích dẫn', 'nói gì'],
  'đền': ['thờ', 'thờ phụng', 'đền thờ', 'lăng', 'di tích', 'kiếp bạc'],
  'ai': ['là ai', 'là gì', 'giới thiệu', 'thông tin', 'tiểu sử', 'xuất thân'],
  'lần': ['lần thứ', 'cuộc', 'cuộc kháng chiến', 'lần kháng chiến'],
};

// ─── Stop words tiếng Việt (bỏ qua khi tính điểm) ───────────────────────────
const STOP_WORDS = new Set([
  'là', 'và', 'của', 'có', 'được', 'trong', 'này', 'đó', 'một', 'các', 'những',
  'với', 'cho', 'từ', 'về', 'khi', 'như', 'đã', 'sẽ', 'để', 'hay', 'hoặc',
  'tôi', 'bà', 'anh', 'chị', 'họ', 'ta', 'mình', 'hãy', 'đây',
  'thì', 'mà', 'nên', 'vì', 'do', 'theo', 'lại', 'cũng', 'đều', 'rất', 'không',
  'hỏi', 'biết', 'nói', 'thế', 'nào', 'gì', 'sao', 'ai', 'đâu', 'bao', 'nhiêu',
  'cho', 'tôi', 'hỏi', 'muốn', 'cần', 'giúp', 'giải', 'thích', 'hiểu',
]);

// ─── Chuẩn hóa text ──────────────────────────────────────────────────────────
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[.,!?;:"'()\[\]{}\-–—\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Tách từ và lọc stop words ───────────────────────────────────────────────
function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

// ─── Mở rộng query bằng từ đồng nghĩa ───────────────────────────────────────
function expandQuery(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (token.includes(key) || key.includes(token)) {
        synonyms.forEach(s => s.split(' ').forEach(w => expanded.add(w)));
        expanded.add(key);
      }
      if (synonyms.some(s => s.includes(token) || token.includes(s.split(' ')[0]))) {
        expanded.add(key);
        synonyms.forEach(s => s.split(' ').forEach(w => expanded.add(w)));
      }
    }
  }
  return [...expanded].filter(w => w.length > 1);
}

// ─── Tách tailieu.txt thành chunks theo section ──────────────────────────────
function buildChunks(content) {
  const chunks = [];
  // Tách theo tiêu đề ## hoặc ###
  const sections = content.split(/\n(?=#{1,3}\s)/);

  for (const section of sections) {
    const lines = section.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) continue;

    const titleLine = lines[0].replace(/^#+\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim();

    // Xác định type của chunk dựa vào title
    let chunkType = 'general';
    if (titleLine.includes('Lần 1') || titleLine.includes('1258')) {
      chunkType = 'battle_1';
    } else if (titleLine.includes('Lần 2') || titleLine.includes('1285')) {
      chunkType = 'battle_2';
    } else if (titleLine.includes('Lần 3') || titleLine.includes('1287') || titleLine.includes('1288')) {
      chunkType = 'battle_3';
    } else if (titleLine.includes('Vườn không')) {
      chunkType = 'strategy_vuonkhong';
    } else if (titleLine.includes('Chiến tranh nhân dân')) {
      chunkType = 'strategy_nhandam';
    } else if (titleLine.includes('CHIẾN LƯỢC') || titleLine.includes('CHIẾN THUẬT')) {
      chunkType = 'strategy';
    } else if (titleLine.includes('BA LẦN KHÁNG CHIẾN') || titleLine.includes('SỰ NGHIỆP QUÂN SỰ')) {
      chunkType = 'battles_overview';
    }

    // Nếu không có body (section chỉ có subsections), tạo chunk tổng hợp
    if (!body || body.length < 10) {
      // Nếu là section "BA LẦN KHÁNG CHIẾN", tạo chunk tổng hợp từ các subsections
      if (chunkType === 'battles_overview') {
        // Tìm tất cả subsections thuộc section này
        const subsectionTexts = [];
        let currentIndex = sections.indexOf(section);
        for (let i = currentIndex + 1; i < sections.length; i++) {
          const nextSection = sections[i];
          const nextLines = nextSection.trim().split('\n');
          const nextTitle = nextLines[0].replace(/^#+\s*/, '').trim();
          
          // Nếu gặp section mới (##) thì dừng
          if (nextSection.startsWith('##') && !nextSection.startsWith('###')) break;
          
          // Nếu là subsection (###) của battles
          if (nextSection.startsWith('###') && (nextTitle.includes('Lần') || nextTitle.includes('1258') || nextTitle.includes('1285') || nextTitle.includes('1287'))) {
            const nextBody = nextLines.slice(1).join('\n').trim();
            if (nextBody.length > 30) {
              // Lấy 3-4 dòng đầu thay vì 200 ký tự để đủ thông tin
              const firstLines = nextBody.split('\n').slice(0, 4).join('\n');
              subsectionTexts.push(nextTitle + ':\n' + firstLines);
            }
          }
        }
        
        if (subsectionTexts.length > 0) {
          const summaryText = subsectionTexts.join('\n\n');
          chunks.push({
            title: titleLine,
            text: summaryText,
            fullText: titleLine + '. ' + summaryText,
            tokens: tokenize(titleLine + ' ' + summaryText),
            type: chunkType,
            isFullSection: true,
          });
        }
      }
      
      // Nếu là section "CHIẾN LƯỢC VÀ CHIẾN THUẬT", tạo chunk tổng hợp
      if (chunkType === 'strategy') {
        const subsectionTexts = [];
        let currentIndex = sections.indexOf(section);
        for (let i = currentIndex + 1; i < sections.length; i++) {
          const nextSection = sections[i];
          const nextLines = nextSection.trim().split('\n');
          const nextTitle = nextLines[0].replace(/^#+\s*/, '').trim();
          
          // Nếu gặp section mới (##) thì dừng
          if (nextSection.startsWith('##') && !nextSection.startsWith('###')) break;
          
          // Nếu là subsection (###) của strategy
          if (nextSection.startsWith('###')) {
            const nextBody = nextLines.slice(1).join('\n').trim();
            if (nextBody.length > 20) {
              subsectionTexts.push(nextTitle + ': ' + nextBody);
            }
          }
        }
        
        if (subsectionTexts.length > 0) {
          const summaryText = subsectionTexts.join('\n\n');
          chunks.push({
            title: titleLine,
            text: summaryText,
            fullText: titleLine + '. ' + summaryText,
            tokens: tokenize(titleLine + ' ' + summaryText),
            type: chunkType,
            isFullSection: true,
          });
        }
      }
      
      continue;
    }

    // Tách thêm theo paragraph trong mỗi section (nếu dài)
    const paragraphs = body.split(/\n\n+/);
    for (const para of paragraphs) {
      const text = para.trim();
      if (text.length < 30) continue;

      chunks.push({
        title: titleLine,
        text: text,
        fullText: titleLine + '. ' + text,
        tokens: tokenize(titleLine + ' ' + text),
        type: chunkType,
      });
    }

    // Thêm cả section đầy đủ như một chunk riêng (để truy xuất rộng hơn)
    if (body.length > 50) {
      chunks.push({
        title: titleLine,
        text: body,
        fullText: titleLine + '. ' + body,
        tokens: tokenize(titleLine + ' ' + body),
        type: chunkType,
        isFullSection: true,
      });
    }
  }

  return chunks;
}

// ─── Tính điểm BM25-lite cho một chunk với context-aware ─────────────────────
function scoreChunk(queryTokens, chunk, avgChunkLen, intent) {
  const k1 = 1.5;
  const b = 0.75;
  const chunkLen = chunk.tokens.length;

  // Tần suất token trong chunk
  const tf = {};
  for (const t of chunk.tokens) tf[t] = (tf[t] || 0) + 1;

  let score = 0;
  for (const qt of queryTokens) {
    for (const [token, freq] of Object.entries(tf)) {
      if (token === qt || token.includes(qt) || qt.includes(token)) {
        const tfScore = (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * chunkLen / avgChunkLen));
        const titleBoost = chunk.title.toLowerCase().includes(qt) ? 2.5 : 1.0;
        score += tfScore * titleBoost;
      }
    }
  }

  // Bonus: nếu nhiều query token khớp cùng lúc (phrase coherence)
  const matchCount = queryTokens.filter(qt =>
    chunk.tokens.some(t => t === qt || t.includes(qt) || qt.includes(t))
  ).length;
  if (matchCount >= 2) score *= (1 + matchCount * 0.15);

  // CONTEXT-AWARE BOOST: Nếu intent khớp với type của chunk
  if (intent && chunk.type && intent === chunk.type) {
    score *= 5.0; // Boost rất mạnh nếu type khớp chính xác (tăng từ 3.0 lên 5.0)
  }
  
  // PENALTY: Nếu hỏi về lần cụ thể nhưng chunk là overview
  if ((intent === 'battle_1' || intent === 'battle_2' || intent === 'battle_3') && 
      chunk.type === 'battles_overview') {
    score *= 0.2;
  }
  
  // PENALTY: Nếu hỏi về chiến thuật cụ thể nhưng chunk là về kháng chiến hoặc không liên quan
  if ((intent === 'strategy_vuonkhong' || intent === 'strategy_nhandam') && 
      (chunk.type === 'battle_1' || chunk.type === 'battle_2' || chunk.type === 'battle_3' || chunk.type === 'battles_overview' || chunk.type === 'general')) {
    score *= 0.1; // Giảm rất mạnh (từ 0.2 xuống 0.1)
  }
  
  // PENALTY: Nếu hỏi về chiến thuật cụ thể nhưng chunk là chiến thuật khác
  if (intent === 'strategy_vuonkhong' && chunk.type === 'strategy_nhandam') {
    score *= 0.05; // Giảm cực mạnh
  }
  if (intent === 'strategy_nhandam' && chunk.type === 'strategy_vuonkhong') {
    score *= 0.05; // Giảm cực mạnh
  }
  
  // PENALTY: Nếu hỏi về chiến thuật (chung hoặc cụ thể) nhưng chunk là về kháng chiến
  if ((intent === 'strategy' || intent === 'strategy_vuonkhong' || intent === 'strategy_nhandam') && 
      (chunk.type === 'battle_1' || chunk.type === 'battle_2' || chunk.type === 'battle_3' || chunk.type === 'battles_overview')) {
    score *= 0.05; // Giảm cực mạnh
  }

  return score;
}

// ─── Phát hiện chủ đề câu hỏi ────────────────────────────────────────────────
function detectIntent(query) {
  const q = normalize(query);

  // Kiểm tra các lần kháng chiến CỤ THỂ trước (ưu tiên cao)
  // Sử dụng regex linh hoạt hơn để bắt "lần 1", "lần thứ nhất", "lần kháng chiến thứ nhất"
  if (/lần.*(1|một|thứ nhất|đầu)|1258|uriyangkhadai|đông bộ đầu/.test(q)) return 'battle_1';
  if (/lần.*(2|hai|thứ hai)|1285|thoát hoan|hàm tử|chương dương|tây kết|toa đô/.test(q)) return 'battle_2';
  if (/lần.*(3|ba|thứ ba|cuối)|1287|1288|ô mã nhi|vân đồn|trần khánh dư/.test(q)) return 'battle_3';
  if (/bạch đằng|cọc bạch|sông bạch/.test(q)) return 'battle_3'; // Bạch Đằng thuộc lần 3
  
  // Chiến thuật CỤ THỂ
  if (/vườn không|nhà trống|tiêu thổ/.test(q)) return 'strategy_vuonkhong';
  if (/chiến tranh nhân dân|toàn dân|sức dân/.test(q)) return 'strategy_nhandam';
  
  // Tổng quan về kháng chiến (kiểm tra sau)
  if (/ba lần|3 lần|tất cả.*lần|các lần/.test(q)) return 'battles_overview';
  if (/kháng chiến|đánh thắng|chiến thắng mông|chống mông|chống nguyên/.test(q)) return 'battles_overview';
  if (/mông|nguyên/.test(q)) return 'battles_overview';
  
  // Chiến thuật chung
  if (/chiến thuật|chiến lược|cách đánh/.test(q)) return 'strategy';
  
  // Các intent khác
  if (/tên|gọi là|tên thật|tên đầy đủ/.test(q)) return 'name';
  if (/sinh|năm sinh|ra đời|ngày sinh/.test(q)) return 'birth';
  if (/mất|qua đời|từ trần|năm mất/.test(q)) return 'death';
  if (/cha|bố|phụ thân|xuất thân/.test(q)) return 'family';
  if (/con trai|con gái|con rể|gia đình|gia tộc|dòng họ/.test(q)) return 'family';
  if (/hịch|tướng sĩ|bài hịch/.test(q)) return 'hich';
  if (/sách|binh thư|tác phẩm|viết|soạn/.test(q)) return 'books';
  if (/câu nói|danh ngôn|nổi tiếng|lời nói/.test(q)) return 'quotes';
  if (/đền|thờ|kiếp bạc|di tích|thờ phụng/.test(q)) return 'temple';
  if (/nhân cách|đạo đức|tính cách|con người/.test(q)) return 'character';
  if (/là ai|giới thiệu|thông tin|tiểu sử|tổng quan/.test(q)) return 'overview';
  if (/ý nghĩa|đóng góp|vai trò|tầm quan trọng/.test(q)) return 'significance';

  return 'general';
}

// ─── Template sinh câu trả lời tự nhiên ─────────────────────────────────────
function generateAnswerLocal(intent, topChunks, query) {
  const topText = topChunks.map(c => c.text).join('\n\n');

  const intros = {
    name:                '📛 Về tên gọi của Trần Hưng Đạo:',
    birth:               '🎂 Về ngày sinh của Trần Hưng Đạo:',
    death:               '🕯️ Về sự ra đi của Trần Hưng Đạo:',
    family:              '👨‍👩‍👦 Về gia đình Trần Hưng Đạo:',
    battle_1:            '⚔️ Về cuộc kháng chiến lần thứ nhất (1258):',
    battle_2:            '⚔️ Về cuộc kháng chiến lần thứ hai (1285):',
    battle_3:            '⚔️ Về cuộc kháng chiến lần thứ ba (1287-1288):',
    battles_overview:    '🏹 Tổng quan về ba lần kháng chiến chống Mông-Nguyên:',
    strategy_vuonkhong:  '🧠 Về chiến thuật "Vườn không nhà trống":',
    strategy_nhandam:    '🧠 Về chiến lược "Chiến tranh nhân dân":',
    strategy:            '🧠 Về chiến lược và chiến thuật của Trần Hưng Đạo:',
    hich:                '📜 Về Hịch Tướng Sĩ - áng văn bất hủ:',
    books:               '📚 Về các tác phẩm của Trần Hưng Đạo:',
    quotes:              '💬 Những câu nói nổi tiếng của Trần Hưng Đạo:',
    temple:              '🛕 Về đền thờ và di tích Trần Hưng Đạo:',
    character:           '🌟 Về nhân cách và đạo đức của Trần Hưng Đạo:',
    overview:            '⚔️ Giới thiệu về Trần Hưng Đạo - Anh hùng dân tộc:',
    significance:        '🏛️ Về ý nghĩa lịch sử của Trần Hưng Đạo:',
    general:             '📖 Từ tài liệu học tập:',
  };

  const intro = intros[intent] || intros.general;

  // Làm sạch text: bỏ markdown heading, bullet
  let cleanText = topText
    .replace(/^#{1,3}\s.*/gm, '')
    .replace(/^[-*]\s/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Lọc câu theo keywords nếu là intent cụ thể (CHỈ áp dụng cho battles, không áp dụng cho strategy vì quá ngắn)
  const keywordFilters = {
    battle_1: ['1258', 'uriyangkhadai', 'đông bộ đầu', 'vườn không', '3 vạn', 'lần 1', 'lần thứ nhất'],
    battle_2: ['1285', 'thoát hoan', '50 vạn', 'hàm tử', 'chương dương', 'tây kết', 'toa đô', 'lần 2', 'lần thứ hai'],
    battle_3: ['1287', '1288', 'bạch đằng', 'cọc', 'ô mã nhi', 'vân đồn', 'trần khánh dư', 'lần 3', 'lần thứ ba'],
    // Bỏ strategy_vuonkhong và strategy_nhandam để giữ nguyên toàn bộ text
  };

  if (keywordFilters[intent]) {
    const sentences = cleanText.split(/(?<=[.!?])\s+/);
    const relevantSentences = [];
    const otherSentences = [];

    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      const hasKeyword = keywordFilters[intent].some(kw => sentenceLower.includes(kw));

      if (hasKeyword) {
        relevantSentences.push(sentence);
      } else {
        otherSentences.push(sentence);
      }
    }

    // Ưu tiên câu có keyword, nhưng vẫn giữ câu khác để đủ ngữ cảnh
    if (relevantSentences.length > 0) {
      cleanText = relevantSentences.join(' ');
      // Thêm câu khác để đủ ngữ cảnh (tăng từ 2 lên 5 câu)
      if (cleanText.length < 400 && otherSentences.length > 0) {
        cleanText += ' ' + otherSentences.slice(0, 5).join(' ');
      }
    }
  }

  // Giới hạn độ dài (tăng lên 1500 ký tự tối đa)
  const maxLen = intent === 'battles_overview' ? 1500 : 1200;
  let answer = cleanText.length > maxLen
    ? cleanText.slice(0, maxLen).replace(/[^.!?]*$/, '') + '...'
    : cleanText;

  return `${intro}\n\n${answer}`;
}
async function generateAnswerWithGemini(intent, topChunks, query, apiKey) {
  const context = topChunks.slice(0, 3).map(c => c.text).join('\n\n');

  const intros = {
    name:             '📛 Về tên gọi của Trần Hưng Đạo:',
    birth:            '🎂 Về ngày sinh của Trần Hưng Đạo:',
    death:            '🕯️ Về sự ra đi của Trần Hưng Đạo:',
    family:           '👨‍👩‍👦 Về gia đình Trần Hưng Đạo:',
    battle_1:         '⚔️ Về cuộc kháng chiến lần thứ nhất (1258):',
    battle_2:         '⚔️ Về cuộc kháng chiến lần thứ hai (1285):',
    battle_3:         '⚔️ Về cuộc kháng chiến lần thứ ba (1287-1288):',
    battles_overview: '🏹 Tổng quan về ba lần kháng chiến chống Mông-Nguyên:',
    strategy_vuonkhong: '🧠 Về chiến thuật "Vườn không nhà trống":',
    strategy_nhandam: '🧠 Về chiến lược "Chiến tranh nhân dân":',
    strategy:         '🧠 Về chiến lược và chiến thuật của Trần Hưng Đạo:',
    hich:             '📜 Về Hịch Tướng Sĩ - áng văn bất hủ:',
    books:            '📚 Về các tác phẩm của Trần Hưng Đạo:',
    quotes:           '💬 Những câu nói nổi tiếng của Trần Hưng Đạo:',
    temple:           '🛕 Về đền thờ và di tích Trần Hưng Đạo:',
    character:        '🌟 Về nhân cách và đạo đức của Trần Hưng Đạo:',
    overview:         '⚔️ Giới thiệu về Trần Hưng Đạo - Anh hùng dân tộc:',
    significance:     '🏛️ Về ý nghĩa lịch sử của Trần Hưng Đạo:',
    general:          '📖 Từ tài liệu học tập:',
  };
  const intro = intros[intent] || intros.general;

  const prompt = `Bạn là trợ lý lịch sử chuyên về Trần Hưng Đạo và lịch sử Việt Nam.
Chỉ trả lời dựa vào tài liệu dưới đây. Không bịa đặt thông tin ngoài tài liệu.
Trả lời bằng tiếng Việt, súc tích (tối đa 200 từ), đúng trọng tâm câu hỏi.
Không dùng markdown, không dùng dấu **, chỉ viết văn xuôi hoặc gạch đầu dòng •.

TÀI LIỆU:
${context}

CÂU HỎI: ${query}

TRẢ LỜI:`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 400,
        }
      })
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini trả về rỗng');

  return `${intro}\n\n${text.trim()}`;
}
// ─── Kiểm tra câu hỏi có ngoài phạm vi không ────────────────────────────────
function isOutOfScope(query) {
  const q = normalize(query);
  // Nếu query không chứa bất kỳ từ liên quan đến Trần Hưng Đạo / lịch sử VN
  const inScopeKeywords = [
    'trần', 'hưng', 'đạo', 'quốc tuấn', 'mông', 'nguyên', 'kháng chiến',
    'đại việt', 'nhà trần', 'bạch đằng', 'hịch', 'binh thư', 'lịch sử',
    'tướng', 'vua', 'thế kỷ', 'chiến', 'quân', 'vạn kiếp', 'kiếp bạc',
    'thoát hoan', 'toa đô', 'ô mã nhi', 'phạm ngũ lão', 'trần liễu',
    'ông', 'ngài', 'vị', 'anh hùng', 'dân tộc', 'đức thánh',
    'sinh', 'mất', 'năm', 'đời', 'cha', 'con', 'gia đình', 'tên', 'sách',
    'chiến thuật', 'chiến lược', 'câu nói', 'đền', 'thờ', 'nhân cách',
  ];
  return !inScopeKeywords.some(kw => q.includes(kw));
}

// ─── MAIN: Hàm xử lý câu hỏi ─────────────────────────────────────────────────
class RAGEngine {
  constructor(content, geminiApiKey = null) {
  this.chunks = buildChunks(content);
  this.avgChunkLen = this.chunks.reduce((s, c) => s + c.tokens.length, 0) / this.chunks.length;
  this.geminiApiKey = geminiApiKey; // thêm dòng này
  }

  async query(question) {
  if (isOutOfScope(question)) {
    return {
      answer: 'Xin lỗi, tôi chỉ có thể trả lời các câu hỏi về Trần Hưng Đạo và lịch sử liên quan.',
      intent: 'out_of_scope',
      sources: []
    };
  }

  const tokens = tokenize(normalize(question));
  const expanded = expandQuery(tokens);
  const intent = detectIntent(question);

  const scored = this.chunks.map(chunk => ({
    chunk,
    score: scoreChunk(expanded, chunk, this.avgChunkLen, intent)
  }));

  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 5).map(s => s.chunk);

  // Thử Gemini trước, fallback về local nếu lỗi
  let answer;
  if (this.geminiApiKey) {
    try {
      answer = await generateAnswerWithGemini(intent, topChunks, question, this.geminiApiKey);
    } catch (err) {
      console.warn('⚠️ Gemini thất bại, dùng RAG local:', err.message);
    }
  }

  // Fallback nếu Gemini lỗi hoặc không có key
  if (!answer) {
    answer = generateAnswerLocal(intent, topChunks, question);
  }

  return {
    answer,
    intent,
    sources: topChunks.map(c => c.title)
  };
  }
}

module.exports = { RAGEngine };
