// ============================================================
// แยกให้ถูก! — Admin Panel JS  (read-only: questions + players)
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby45b9-lXfVH_4yDhAR3THu3FVF-g524gY8RQ6LQQ4VETt7r756C7PFMQLxxbLx650S4A/exec';

// ── PASSWORD ──────────────────────────────────────────────────
const ADMIN_PASSWORD = 'admin1234'; // ← เปลี่ยนรหัสผ่านตรงนี้

// ── STATE ─────────────────────────────────────────────────────
let allRows    = [];
let allPlayers = [];
let dateFilter = 'all';
let sortDir    = -1;   // -1 = desc (high→low), 1 = asc

// ── LOGIN ─────────────────────────────────────────────────────
function checkLogin() {
  const stored = sessionStorage.getItem('admin_ok');
  if (stored === 'yes') {
    document.getElementById('login-overlay').classList.add('hidden');
    return true;
  }
  return false;
}

function setupLogin() {
  const overlay = document.getElementById('login-overlay');
  const input   = document.getElementById('login-input');
  const btn     = document.getElementById('login-btn');
  const errEl   = document.getElementById('login-error');

  const attempt = () => {
    if (input.value === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', 'yes');
      overlay.classList.add('hidden');
      initApp();
    } else {
      errEl.classList.remove('hidden');
      input.value = '';
      input.focus();
    }
  };

  btn.addEventListener('click', attempt);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') attempt(); });
  input.focus();
}

function initApp() {
  // Tab switching
  document.getElementById('tab-btn-questions').addEventListener('click', () => switchTab('questions'));
  document.getElementById('tab-btn-players').addEventListener('click',   () => switchTab('players'));

  // Refresh buttons
  document.getElementById('btn-refresh-q').addEventListener('click', loadQuestions);
  document.getElementById('btn-refresh-p').addEventListener('click', loadPlayers);

  // Date filter buttons
  document.querySelectorAll('.date-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dateFilter = btn.dataset.f;
      renderPlayers();
    });
  });

  // Search
  document.getElementById('player-search').addEventListener('input', renderPlayers);

  // Sort header
  document.getElementById('sort-score').addEventListener('click', () => {
    sortDir *= -1;
    document.getElementById('sort-score').textContent = sortDir === -1 ? 'คะแนน ▼' : 'คะแนน ▲';
    renderPlayers();
  });

  checkApiConnection();
  loadQuestions();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (checkLogin()) {
    initApp();
  } else {
    setupLogin();
  }
});

// ── TAB SWITCH ────────────────────────────────────────────────
function switchTab(tab) {
  const isQ = tab === 'questions';
  document.getElementById('tab-questions').classList.toggle('hidden', !isQ);
  document.getElementById('tab-players').classList.toggle('hidden',   isQ);
  document.getElementById('tab-btn-questions').classList.toggle('active', isQ);
  document.getElementById('tab-btn-players').classList.toggle('active',  !isQ);

  if (!isQ && !allPlayers.length) loadPlayers();
}

// ── API CHECK ─────────────────────────────────────────────────
async function checkApiConnection() {
  const badge = document.getElementById('api-status');
  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=getQuestionsAdmin');
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    badge.textContent = '✅ เชื่อมต่อแล้ว';
    badge.className   = 'api-badge ok';
  } catch(e) {
    badge.textContent = '❌ เชื่อมต่อไม่ได้';
    badge.className   = 'api-badge error';
  }
}

// ── LOAD QUESTIONS ────────────────────────────────────────────
async function loadQuestions() {
  show('q-loading'); hide('q-list'); hide('q-empty');
  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=getQuestionsAdmin&_t=' + Date.now());
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    allRows = json.rows || [];
    renderSummary(json.summary || []);
    renderQuestions();
  } catch(e) {
    hide('q-loading');
    document.getElementById('q-empty').textContent = '❌ โหลดไม่สำเร็จ: ' + e.message;
    show('q-empty');
  } finally {
    hide('q-loading');
  }
}

// ── RENDER SUMMARY BADGES ─────────────────────────────────────
function renderSummary(summary) {
  const el = document.getElementById('round-summary');
  if (!summary.length) { el.innerHTML = ''; return; }
  el.innerHTML = summary.map(s => {
    const cls   = s.count >= 12 ? 'badge-ok' : s.count > 0 ? 'badge-warn' : 'badge-empty';
    const icon  = s.count >= 12 ? '✅' : '⚠️';
    return `<span class="round-badge ${cls}">${icon} รอบ ${s.round}: ${s.count}/12 รูป</span>`;
  }).join('');
}

// ── RENDER QUESTIONS ──────────────────────────────────────────
function renderQuestions() {
  const listEl = document.getElementById('q-list');
  if (!allRows.length) { show('q-empty'); return; }

  // Group by round + question
  const groups = {};
  allRows.forEach(r => {
    const key = r.round + '|' + r.question;
    if (!groups[key]) groups[key] = { round: r.round, question: r.question, items: [] };
    groups[key].items.push(r);
  });

  listEl.innerHTML = Object.values(groups)
    .sort((a, b) => a.round - b.round)
    .map(g => `
      <div class="round-group">
        <div class="round-group-header">
          รอบ ${g.round} — ${g.question}
          <span class="count-badge ${g.items.length >= 12 ? 'ok' : 'warn'}">${g.items.length}/12 รูป</span>
        </div>
        <div class="item-grid">
          ${g.items.map(renderItem).join('')}
        </div>
      </div>`
    ).join('');

  hide('q-empty');
  show('q-list');
}

function renderItem(item) {
  const cls    = item.isCorrect ? 'correct' : 'wrong';
  const text   = item.isCorrect ? '✅ ถูก' : '❌ ผิด';
  const imgSrc = toEmbedUrl(item.imageUrl);
  return `
    <div class="item-card ${cls}">
      <div class="item-img-wrap">
        <img src="${imgSrc}" alt="${item.imageName}"
             onerror="this.src='https://via.placeholder.com/120x120/e0e0e0/888?text=no+img'" />
      </div>
      <div class="item-info">
        <div class="item-name">${item.imageName}</div>
        <div class="item-badge ${cls}">${text}</div>
      </div>
    </div>`;
}

function toEmbedUrl(url) {
  if (!url) return '';
  // /file/d/FILE_ID/view
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w300`;
  // ?id=FILE_ID
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w300`;
  return url;
}

// ── LOAD PLAYERS ──────────────────────────────────────────────
async function loadPlayers() {
  show('p-loading'); hide('p-table-wrap'); hide('p-empty');
  document.getElementById('stats-cards').innerHTML = '';
  try {
    const res  = await fetch(APPS_SCRIPT_URL + '?action=getPlayers&_t=' + Date.now());
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    allPlayers = json.players || [];
    renderPlayers();
  } catch(e) {
    hide('p-loading');
    document.getElementById('p-empty').textContent = '❌ โหลดไม่สำเร็จ: ' + e.message;
    show('p-empty');
  } finally {
    hide('p-loading');
  }
}

// ── RENDER PLAYERS ────────────────────────────────────────────
function renderPlayers() {
  const search = document.getElementById('player-search').value.trim().toLowerCase();

  // Filter by date
  const now    = new Date();
  const tod    = startOf('day', now);
  const week   = startOf('week', now);
  const month  = startOf('month', now);

  let rows = allPlayers.filter(p => {
    // Date filter
    if (dateFilter !== 'all') {
      const ts = parseTimestamp(p.timestamp);
      if (!ts) return false;
      if (dateFilter === 'today' && ts < tod)   return false;
      if (dateFilter === 'week'  && ts < week)  return false;
      if (dateFilter === 'month' && ts < month) return false;
    }
    // Search filter
    if (search) {
      const haystack = (p.name + ' ' + p.phone).toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  // Sort
  rows = [...rows].sort((a, b) => sortDir * (b.score - a.score));

  // Stats cards
  renderStatsCards(rows);

  // Table
  const tbody = document.getElementById('player-tbody');
  if (!rows.length) {
    hide('p-table-wrap');
    show('p-empty');
    return;
  }

  tbody.innerHTML = rows.map((p, i) => {
    const rewardBtn = p.reward
      ? `<button class="btn btn-rewarded btn-sm" disabled>✅ รับรางวัลแล้ว<br><small>${formatDate(p.redeemedBy)}</small></button>`
      : `<button class="btn btn-reward btn-sm" onclick="rewardPlayer(${p.rowIndex}, this)">🎁 มอบรางวัล</button>`;
    return `
    <tr>
      <td class="col-rank">${i + 1}</td>
      <td class="col-name">${esc(p.name)}</td>
      <td class="col-phone">${esc(p.phone)}</td>
      <td class="col-score"><strong>${p.score}</strong></td>
      <td class="col-rounds">${p.rounds}</td>
      <td class="col-time">${formatDate(p.timestamp)}</td>
      <td class="col-reward">${rewardBtn}</td>
    </tr>`;
  }).join('');

  hide('p-empty');
  show('p-table-wrap');
}

// ── STATS CARDS ───────────────────────────────────────────────
function renderStatsCards(rows) {
  const el = document.getElementById('stats-cards');
  if (!rows.length) { el.innerHTML = ''; return; }
  const total  = rows.length;
  const maxSc  = Math.max(...rows.map(r => r.score));
  const avgSc  = Math.round(rows.reduce((s, r) => s + r.score, 0) / total);
  const top    = rows.reduce((best, r) => r.score > best.score ? r : best, rows[0]);
  el.innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">ผู้เล่นทั้งหมด</div></div>
    <div class="stat-card"><div class="stat-num">${maxSc}</div><div class="stat-label">คะแนนสูงสุด</div></div>
    <div class="stat-card"><div class="stat-num">${avgSc}</div><div class="stat-label">คะแนนเฉลี่ย</div></div>
    <div class="stat-card top"><div class="stat-num">${esc(top.name) || '—'}</div><div class="stat-label">แชมป์ปัจจุบัน</div></div>`;
}

// ── HELPERS ───────────────────────────────────────────────────
// ── REWARD PLAYER ─────────────────────────────────────────────
async function rewardPlayer(rowIndex, btn) {
  if (!confirm('บันทึกการมอบรางวัลให้ผู้เล่นแถวนี้?')) return;
  btn.disabled = true;
  btn.textContent = 'กำลังบันทึก…';
  try {
    await fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'rewardPlayer', rowIndex }),
      mode:    'no-cors',
    });
    // no-cors ไม่สามารถอ่าน response ได้ — ถือว่าสำเร็จ
    const now = new Date().toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' })
              + ' ' + new Date().toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
    btn.outerHTML = `<button class="btn btn-rewarded btn-sm" disabled>✅ รับรางวัลแล้ว<br><small>${now}</small></button>`;
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🎁 มอบรางวัล';
    alert('บันทึกไม่สำเร็จ: ' + e.message);
  }
}

function show(id) { document.getElementById(id).classList.remove('hidden'); }
function hide(id) { document.getElementById(id).classList.add('hidden'); }
function esc(s)   { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function parseTimestamp(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d) ? null : d;
}

function startOf(unit, date) {
  const d = new Date(date);
  if (unit === 'day')   { d.setHours(0,0,0,0); }
  if (unit === 'week')  { const day = d.getDay(); d.setDate(d.getDate() - day); d.setHours(0,0,0,0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); }
  return d;
}

function formatDate(ts) {
  const d = parseTimestamp(ts);
  if (!d) return ts || '—';
  return d.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' })
       + ' ' + d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
}
