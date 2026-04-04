// ============================================================
// WasteCAPTCHA — app.js
// ============================================================

// ── CONFIG ───────────────────────────────────────────────────
// ใส่ URL ที่ได้หลัง Deploy Apps Script ตรงนี้
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby45b9-lXfVH_4yDhAR3THu3FVF-g524gY8RQ6LQQ4VETt7r756C7PFMQLxxbLx650S4A/exec';

// ── DEMO DATA (ใช้เมื่อยังไม่มี Apps Script URL) ─────────────
const DEMO_DATA = {
  totalRounds: 3,
  rounds: [
    {
      round: 1,
      question: 'ขยะอินทรีย์',
      images: [
        { url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&h=200&fit=crop', name: 'เปลือกกล้วย',  isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop', name: 'ขวดพลาสติก',  isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop', name: 'เศษผัก',       isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=200&h=200&fit=crop', name: 'ถ่านไฟฉาย',   isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop', name: 'เปลือกแอปเปิ้ล',isCorrect: true },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', name: 'กล่องโฟม',    isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=200&h=200&fit=crop', name: 'เศษอาหาร',   isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=200&h=200&fit=crop', name: 'กระป๋องน้ำ',  isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop', name: 'เศษผลไม้',   isCorrect: true  },
      ]
    },
    {
      round: 2,
      question: 'ขยะรีไซเคิล',
      images: [
        { url: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=200&h=200&fit=crop', name: 'กระป๋องอลูมิเนียม', isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&h=200&fit=crop', name: 'เปลือกกล้วย', isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop', name: 'ขวดพลาสติก', isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop', name: 'เศษผลไม้',   isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=200&h=200&fit=crop', name: 'กล่องกระดาษ',isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=200&h=200&fit=crop', name: 'ถ่านไฟฉาย',  isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', name: 'กล่องโฟม',   isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=200&h=200&fit=crop', name: 'ขวดแก้ว',   isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=200&h=200&fit=crop', name: 'กระดาษหนังสือพิมพ์',isCorrect: true },
      ]
    },
    {
      round: 3,
      question: 'ขยะอันตราย',
      images: [
        { url: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=200&h=200&fit=crop', name: 'ถ่านไฟฉาย',   isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=200&h=200&fit=crop', name: 'กล่องกระดาษ', isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1576020799627-aeac74d58064?w=200&h=200&fit=crop', name: 'หลอดไฟ',      isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop', name: 'เศษผัก',       isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=200&h=200&fit=crop', name: 'ขวดสารเคมี',  isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&h=200&fit=crop', name: 'เปลือกกล้วย', isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?w=200&h=200&fit=crop', name: 'กระป๋องสเปรย์', isCorrect: true  },
        { url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop', name: 'เศษผลไม้',   isCorrect: false },
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', name: 'กล่องโฟม',   isCorrect: false },
      ]
    }
  ]
};

// ── STATE ─────────────────────────────────────────────────────
let gameData        = null;   // { totalRounds, rounds[] }
let currentRound    = 0;      // index (0-based)
let totalScore      = 0;
let totalCorrect    = 0;
let totalWrong      = 0;
let totalMissed     = 0;
let selectedCells   = new Set(); // index ของรูปที่เลือกในรอบปัจจุบัน
let answerSubmitted = false;     // guard ป้องกัน double-submit
let currentImages   = [];        // รูปที่ shuffle แล้ว ใช้ตอน submit

// ── DOM REFERENCES ────────────────────────────────────────────
const screens = {
  start:  document.getElementById('start-screen'),
  game:   document.getElementById('game-screen'),
  result: document.getElementById('result-screen'),
  final:  document.getElementById('final-screen'),
};

// ── HELPERS ───────────────────────────────────────────────────
function showScreen(id) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[id].classList.add('active');
}

function $(id) { return document.getElementById(id); }

// Fisher-Yates shuffle — คืน array ใหม่ ไม่แก้ต้นฉบับ
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  $('btn-start').addEventListener('click', startGame);
  $('btn-confirm').addEventListener('click', submitAnswer);
  $('btn-next').addEventListener('click', nextRound);
  $('btn-save').addEventListener('click', () => savePlayer(false));
  $('btn-anonymous').addEventListener('click', () => savePlayer(true));
  $('btn-replay').addEventListener('click', () => location.reload());
  $('btn-info').addEventListener('click', () => $('info-modal').classList.remove('hidden'));
  $('btn-close-info').addEventListener('click', () => $('info-modal').classList.add('hidden'));
  $('info-modal').addEventListener('click', e => {
    if (e.target === $('info-modal')) $('info-modal').classList.add('hidden');
  });
  // phone: รับเฉพาะตัวเลข
  $('input-phone').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
  });
});

// ── START GAME ────────────────────────────────────────────────
async function startGame() {
  $('btn-start').disabled = true;
  $('loading-msg').classList.remove('hidden');

  try {
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // DEMO mode
      gameData = DEMO_DATA;
    } else {
      const res  = await fetch(`${APPS_SCRIPT_URL}?action=getQuestions`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      gameData = json;
    }

    if (!gameData.rounds || gameData.rounds.length === 0) {
      throw new Error('ไม่พบข้อมูลโจทย์ใน Google Sheet');
    }

    currentRound = 0;
    totalScore   = 0;
    totalCorrect = 0;
    totalWrong   = 0;
    totalMissed  = 0;

    showScreen('game');
    renderRound();
  } catch (err) {
    alert('❌ โหลดข้อมูลไม่สำเร็จ: ' + err.message);
    $('btn-start').disabled = false;
  } finally {
    $('loading-msg').classList.add('hidden');
  }
}

// ── RENDER ROUND ──────────────────────────────────────────────
function renderRound() {
  const round = gameData.rounds[currentRound];
  selectedCells.clear();
  answerSubmitted = false;

  // Header
  $('question-text').textContent = round.question;
  $('round-current').textContent = currentRound + 1;
  $('round-total').textContent   = gameData.totalRounds;
  $('score-display').textContent = totalScore;

  // Grid — สุ่มตำแหน่งรูปทุกรอบ
  const grid = $('image-grid');
  grid.innerHTML = '';

  // สุ่ม 8 ถูก + 4 ผิด = 12 เสมอ (ไม่ซ้ำ)
  const NEED_CORRECT = 8, NEED_WRONG = 4;
  const correctPool = shuffle(round.images.filter(img => img.isCorrect));
  const wrongPool   = shuffle(round.images.filter(img => !img.isCorrect));
  currentImages = shuffle([...correctPool.slice(0, NEED_CORRECT), ...wrongPool.slice(0, NEED_WRONG)]);
  grid.className = 'image-grid cols-4';

  currentImages.forEach((img, i) => {
    const cell = document.createElement('div');
    cell.className = 'grid-cell';
    cell.dataset.index = i;

    const image = document.createElement('img');
    image.src   = img.url;
    image.alt   = img.name;
    image.loading = 'lazy';
    // fallback เมื่อโหลดรูปไม่ได้
    image.onerror = () => {
      image.src = `https://via.placeholder.com/200x200/e0e0e0/757575?text=${encodeURIComponent(img.name)}`;
    };

    const label = document.createElement('span');
    label.className = 'cell-label';
    label.textContent = img.name;

    cell.appendChild(image);
    cell.appendChild(label);
    cell.addEventListener('click', () => toggleCell(cell, i));
    grid.appendChild(cell);
  });
}

// ── TOGGLE CELL ───────────────────────────────────────────────
function toggleCell(cell, index) {
  if (selectedCells.has(index)) {
    selectedCells.delete(index);
    cell.classList.remove('selected');
  } else {
    selectedCells.add(index);
    cell.classList.add('selected');
  }
}

// ── SUBMIT ANSWER ─────────────────────────────────────────────
function submitAnswer() {
  if (answerSubmitted) return; // ป้องกัน double-submit
  if (!gameData) return;
  answerSubmitted = true;
  const round  = gameData.rounds[currentRound];
  const images = currentImages; // ใช้ลำดับที่ shuffle แล้ว
  let   roundScore = 0;
  const items = [];

  images.forEach((img, i) => {
    const chosen = selectedCells.has(i);

    if (chosen && img.isCorrect) {
      // เลือกถูก +2
      roundScore   += 2;
      totalCorrect += 1;
      items.push({ img, type: 'correct', delta: +2, chosen });
    } else if (chosen && !img.isCorrect) {
      // เลือกผิด -2
      roundScore  -= 2;
      totalWrong  += 1;
      items.push({ img, type: 'wrong', delta: -2, chosen });
    } else if (!chosen && img.isCorrect) {
      // พลาดรูปที่ถูก -1
      roundScore  -= 1;
      totalMissed += 1;
      items.push({ img, type: 'missed', delta: -1, chosen });
    } else {
      // ไม่เลือกรูปที่ผิด +0 (ถูกต้อง แต่ไม่แสดง)
      items.push({ img, type: 'ok', delta: 0, chosen });
    }
  });

  // คะแนนต่ำสุดต่อรอบ = 0
  roundScore = Math.max(0, roundScore);
  totalScore += roundScore;

  showRoundResult(round, items, roundScore);
}

// ── SHOW ROUND RESULT ─────────────────────────────────────────
function showRoundResult(round, items, roundScore) {
  $('result-round-num').textContent    = currentRound + 1;
  $('result-category-text').textContent = round.question;
  $('result-round-score').textContent  = (roundScore >= 0 ? '+' : '') + roundScore;
  $('result-round-score').style.color  = roundScore > 0 ? 'var(--green)' : roundScore < 0 ? 'var(--red)' : 'inherit';

  const container = $('result-items');
  container.innerHTML = '';

  const typeConfig = {
    correct: { icon: '✅', label: 'เลือกถูก (+2)',    cls: 'item-correct' },
    wrong:   { icon: '❌', label: 'เลือกผิด (-2)',    cls: 'item-wrong'   },
    missed:  { icon: '⚠️', label: 'ลืมเลือก (-1)',   cls: 'item-missed'  },
    ok:      { icon: '⬜', label: 'ไม่เลือก (ถูก)',  cls: 'item-ok'      },
  };

  // เรียงให้ correct/wrong/missed ขึ้นก่อน ok
  const sorted = [...items].sort((a, b) => {
    const order = { correct: 0, wrong: 1, missed: 2, ok: 3 };
    return order[a.type] - order[b.type];
  });

  sorted.forEach(({ img, type, delta }) => {
    if (type === 'ok') return; // ซ่อนรูปที่ไม่เลือกและไม่ได้ผิด

    const cfg  = typeConfig[type];
    const div  = document.createElement('div');
    div.className = `result-item ${cfg.cls}`;

    const image     = document.createElement('img');
    image.src       = img.url;
    image.alt       = img.name;
    image.onerror   = () => { image.src = `https://via.placeholder.com/48x48/e0e0e0/757575?text=${encodeURIComponent(img.name)}`; };

    const icon      = document.createElement('span');
    icon.className  = 'item-icon';
    icon.textContent = cfg.icon;

    const name      = document.createElement('span');
    name.className  = 'item-name';
    name.textContent = img.name;

    const deltaSpan = document.createElement('span');
    deltaSpan.className = 'item-delta ' + (delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zer');
    deltaSpan.textContent = (delta > 0 ? '+' : '') + delta;

    div.append(image, icon, name, deltaSpan);
    container.appendChild(div);
  });

  const isLast = currentRound + 1 >= gameData.totalRounds;
  $('btn-next').textContent = isLast ? 'ดูผลสรุป 🎉' : 'รอบถัดไป ›';

  showScreen('result');
}

// ── NEXT ROUND ────────────────────────────────────────────────
function nextRound() {
  if (!answerSubmitted) return; // ป้องกันกด next ก่อน submit
  currentRound++;
  if (currentRound >= gameData.totalRounds) {
    showFinalScreen();
  } else {
    showScreen('game');
    renderRound();
  }
}

// ── FINAL SCREEN ──────────────────────────────────────────────
function showFinalScreen() {
  $('final-score').textContent   = totalScore;
  $('stat-correct').textContent  = totalCorrect;
  $('stat-wrong').textContent    = totalWrong;
  $('stat-missed').textContent   = totalMissed;

  // reset form
  $('input-name').value  = '';
  $('input-phone').value = '';
  $('form-error').classList.add('hidden');
  $('register-form').classList.remove('hidden');
  $('leaderboard-section').classList.add('hidden');

  showScreen('final');
}

// ── SAVE PLAYER ───────────────────────────────────────────────
async function savePlayer(anonymous = false) {
  const errorEl = $('form-error');
  errorEl.classList.add('hidden');

  let name, phone;

  if (anonymous) {
    name  = 'ไม่ระบุ';
    phone = '0000000000';
  } else {
    name  = $('input-name').value.trim();
    phone = $('input-phone').value.trim();
    if (!name) {
      errorEl.textContent = 'กรุณากรอกชื่อ';
      return errorEl.classList.remove('hidden');
    }
    if (!/^0[0-9]{9}$/.test(phone)) {
      errorEl.textContent = 'กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก เริ่มด้วย 0)';
      return errorEl.classList.remove('hidden');
    }
  }

  $('btn-save').disabled    = true;
  $('btn-anonymous').disabled = true;
  $('save-loading').classList.remove('hidden');

  const payload = {
    action:       'savePlayer',
    name,
    phone,
    score:        totalScore,
    totalRounds:  gameData.totalRounds,
    correctCount: totalCorrect,
    wrongCount:   totalWrong,
  };

  try {
    if (APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE') {
      await fetch(APPS_SCRIPT_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        mode:    'no-cors',
      });
    }
    $('register-form').classList.add('hidden');
    await loadLeaderboard(name);
  } catch (err) {
    errorEl.textContent = 'บันทึกไม่สำเร็จ: ' + err.message;
    errorEl.classList.remove('hidden');
    $('btn-save').disabled    = false;
    $('btn-anonymous').disabled = false;
  } finally {
    $('save-loading').classList.add('hidden');
  }
}

// ── LEADERBOARD ───────────────────────────────────────────────
async function loadLeaderboard(savedName) {
  const section = $('leaderboard-section');
  const list    = $('leaderboard-list');
  list.innerHTML = '<li style="color:#888">กำลังโหลด…</li>';
  section.classList.remove('hidden');
  $('player-rank-msg').classList.add('hidden');

  let players = [];

  try {
    if (APPS_SCRIPT_URL !== 'YOUR_APPS_SCRIPT_URL_HERE') {
      const res  = await fetch(`${APPS_SCRIPT_URL}?action=getLeaderboard&_t=` + Date.now());
      const json = await res.json();
      players = json.leaderboard || [];
    }
  } catch (_) {}

  if (players.length === 0) {
    players = [{ name: savedName || 'คุณ', score: totalScore }];
  }

  // จัดกลุ่มตาม score → แต่ละกลุ่มคือ rank เดียว
  const groups = [];
  players.forEach(p => {
    const last = groups[groups.length - 1];
    if (last && last.score === p.score) {
      last.names.push(p.name);
    } else {
      groups.push({ score: p.score, names: [p.name], rank: 0 });
    }
  });
  // กำหนด rank จริง (นับจากจำนวนผู้เล่นที่อยู่ก่อนหน้า)
  let pos = 1;
  groups.forEach(g => { g.rank = pos; pos += g.names.length; });

  // หา rank ของผู้เล่นปัจจุบัน
  let myRank = null;
  groups.forEach(g => {
    if (g.score === totalScore) myRank = g.rank;
  });

  // แสดงข้อความลำดับ (ถ้าไม่ติด top 10 หรือติด)
  const rankEl = $('player-rank-msg');
  if (myRank !== null) {
    const medals = ['🥇','🥈','🥉'];
    const medal  = myRank <= 3 ? medals[myRank - 1] + ' ' : '';
    rankEl.textContent = `${medal}คุณได้ลำดับที่ ${myRank} (${totalScore} แต้ม)`;
    rankEl.classList.remove('hidden');
  }

  // แสดง Top 10 กลุ่ม
  list.innerHTML = '';
  groups.slice(0, 10).forEach(g => {
    const li       = document.createElement('li');
    const rankSpan = document.createElement('span');
    rankSpan.className = 'lb-rank';
    const medals = ['🥇','🥈','🥉'];
    rankSpan.textContent = medals[g.rank - 1] || `${g.rank}.`;

    const nameSpan  = document.createElement('span');
    nameSpan.className = 'lb-name';
    nameSpan.textContent = g.names.join(', ');

    const scoreSpan = document.createElement('span');
    scoreSpan.className = 'lb-score';
    scoreSpan.textContent = g.score + ' แต้ม';
    if (g.names.length > 1) {
      const tie = document.createElement('span');
      tie.className = 'lb-tie';
      tie.textContent = ` (${g.names.length} คน)`;
      scoreSpan.appendChild(tie);
    }

    li.append(rankSpan, nameSpan, scoreSpan);
    list.appendChild(li);
  });
}
