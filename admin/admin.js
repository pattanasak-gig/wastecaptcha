// ============================================================
// แยกให้ถูก! — Admin Panel JS
// ============================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby45b9-lXfVH_4yDhAR3THu3FVF-g524gY8RQ6LQQ4VETt7r756C7PFMQLxxbLx650S4A/exec';
const ADMIN_PASSWORD  = 'admin1234'; // ← เปลี่ยนรหัสผ่านตรงนี้

// ── STATE ─────────────────────────────────────────────────────
let allRows     = [];
let allPlayers  = [];
let dateFilter  = 'all';
let rewardFilter= 'all';
let sortDir     = -1;
let pageSize    = 20;
let currentPage = 1;
let reportPeriod= 'week';
let chartDaily  = null;
let chartScores = null;

// ── LOGIN ─────────────────────────────────────────────────────
function checkLogin() {
  if (sessionStorage.getItem('admin_ok') === 'yes') {
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
  document.getElementById('tab-btn-reports').addEventListener('click',   () => switchTab('reports'));

  // Refresh buttons
  document.getElementById('btn-refresh-q').addEventListener('click', loadQuestions);
  document.getElementById('btn-refresh-p').addEventListener('click', loadPlayers);

  // Date filter
  document.querySelectorAll('.date-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      dateFilter = btn.dataset.f;
      currentPage = 1;
      renderPlayers();
    });
  });

  // Reward filter
  document.querySelectorAll('.reward-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.reward-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rewardFilter = btn.dataset.r;
      currentPage = 1;
      renderPlayers();
    });
  });

  // Search
  document.getElementById('player-search').addEventListener('input', () => {
    currentPage = 1;
    renderPlayers();
  });

  // Page size
  document.getElementById('page-size').addEventListener('change', e => {
    pageSize = Number(e.target.value);
    currentPage = 1;
    renderPlayers();
  });

  // Sort
  document.getElementById('sort-score').addEventListener('click', () => {
    sortDir *= -1;
    document.getElementById('sort-score').textContent = sortDir === -1 ? 'คะแนน ▼' : 'คะแนน ▲';
    currentPage = 1;
    renderPlayers();
  });

  // Report period
  document.querySelectorAll('.report-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.report-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      reportPeriod = btn.dataset.p;
      renderReports();
    });
  });

  checkApiConnection();
  loadQuestions();
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (checkLogin()) initApp();
  else setupLogin();
});

// ── TAB SWITCH ────────────────────────────────────────────────
function switchTab(tab) {
  ['questions','players','reports'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('hidden', t !== tab);
    document.getElementById('tab-btn-' + t).classList.toggle('active', t === tab);
  });
  if (tab === 'players' && !allPlayers.length) loadPlayers();
  if (tab === 'reports') {
    if (!allPlayers.length) loadPlayers().then(renderReports);
    else renderReports();
  }
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
    document.getElementById('q-empty').textContent = '❌ โหลดไม่สำเร็จ: ' + e.message;
    show('q-empty');
  } finally {
    hide('q-loading');
  }
}

function renderSummary(summary) {
  const el = document.getElementById('round-summary');
  if (!summary.length) { el.innerHTML = ''; return; }
  el.innerHTML = summary.map(s => {
    const cls  = s.count >= 12 ? 'badge-ok' : s.count > 0 ? 'badge-warn' : 'badge-empty';
    const icon = s.count >= 12 ? '✅' : '⚠️';
    return `<span class="round-badge ${cls}">${icon} รอบ ${s.round}: ${s.count}/12 รูป</span>`;
  }).join('');
}

function renderQuestions() {
  const listEl = document.getElementById('q-list');
  if (!allRows.length) { show('q-empty'); return; }

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
        <div class="item-grid">${g.items.map(renderItem).join('')}</div>
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
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/thumbnail?id=${m1[1]}&sz=w300`;
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
    document.getElementById('p-empty').textContent = '❌ โหลดไม่สำเร็จ: ' + e.message;
    show('p-empty');
  } finally {
    hide('p-loading');
  }
}

// ── RENDER PLAYERS ────────────────────────────────────────────
function renderPlayers() {
  const search = document.getElementById('player-search').value.trim().toLowerCase();
  const now  = new Date();
  const tod  = startOf('day', now);
  const week = startOf('week', now);
  const mon  = startOf('month', now);

  let rows = allPlayers.filter(p => {
    // Date filter
    if (dateFilter !== 'all') {
      const ts = parseTimestamp(p.timestamp);
      if (!ts) return false;
      if (dateFilter === 'today' && ts < tod)  return false;
      if (dateFilter === 'week'  && ts < week) return false;
      if (dateFilter === 'month' && ts < mon)  return false;
    }
    // Reward filter
    if (rewardFilter === 'pending' && p.reward)  return false;
    if (rewardFilter === 'done'    && !p.reward) return false;
    // Search
    if (search) {
      if (!(p.name + ' ' + p.phone).toLowerCase().includes(search)) return false;
    }
    return true;
  });

  rows = [...rows].sort((a, b) => sortDir * (b.score - a.score));

  renderStatsCards(rows);

  if (!rows.length) { hide('p-table-wrap'); show('p-empty'); return; }

  // Pagination
  const total = rows.length;
  const ps    = pageSize === 0 ? total : pageSize;
  const pages = Math.ceil(total / ps);
  currentPage = Math.min(currentPage, pages);
  const start = (currentPage - 1) * ps;
  const slice = rows.slice(start, start + ps);

  const tbody = document.getElementById('player-tbody');
  tbody.innerHTML = slice.map((p, i) => {
    const rank = start + i + 1;
    const rewardBtn = p.reward
      ? `<button class="btn btn-rewarded btn-sm" disabled>✅ รับแล้ว<br><small>${formatDate(p.redeemedBy)}</small></button>`
      : `<button class="btn btn-reward btn-sm" onclick="rewardPlayer(${p.rowIndex}, this)">🎁 มอบรางวัล</button>`;
    return `
      <tr>
        <td class="col-rank">${rank}</td>
        <td class="col-name">${esc(p.name)}</td>
        <td class="col-phone">${esc(p.phone)}</td>
        <td class="col-score"><strong>${p.score}</strong></td>
        <td class="col-rounds">${p.rounds}</td>
        <td class="col-time">${formatDate(p.timestamp)}</td>
        <td class="col-reward">${rewardBtn}</td>
      </tr>`;
  }).join('');

  renderPagination(total, ps, pages);

  hide('p-empty');
  show('p-table-wrap');
}

// ── PAGINATION ────────────────────────────────────────────────
function renderPagination(total, ps, pages) {
  const el = document.getElementById('pagination');
  if (pageSize === 0 || pages <= 1) { el.innerHTML = `<span class="page-info">ทั้งหมด ${total} รายการ</span>`; return; }

  const start = (currentPage - 1) * ps + 1;
  const end   = Math.min(currentPage * ps, total);

  el.innerHTML = `
    <span class="page-info">${start}–${end} จาก ${total} รายการ</span>
    <div class="page-btns">
      <button class="page-btn" onclick="goPage(1)"        ${currentPage===1?'disabled':''}>«</button>
      <button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>
      <span class="page-cur">หน้า ${currentPage}/${pages}</span>
      <button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages?'disabled':''}>›</button>
      <button class="page-btn" onclick="goPage(${pages})"  ${currentPage===pages?'disabled':''}>»</button>
    </div>`;
}

function goPage(n) {
  currentPage = n;
  renderPlayers();
  document.getElementById('p-table-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── STATS CARDS ───────────────────────────────────────────────
function renderStatsCards(rows) {
  const el = document.getElementById('stats-cards');
  if (!rows.length) { el.innerHTML = ''; return; }
  const total     = rows.length;
  const maxSc     = Math.max(...rows.map(r => r.score));
  const avgSc     = Math.round(rows.reduce((s, r) => s + r.score, 0) / total);
  const top       = rows.reduce((best, r) => r.score > best.score ? r : best, rows[0]);
  const rewarded  = rows.filter(r => r.reward).length;
  el.innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">ผู้เล่นทั้งหมด</div></div>
    <div class="stat-card"><div class="stat-num">${maxSc}</div><div class="stat-label">คะแนนสูงสุด</div></div>
    <div class="stat-card"><div class="stat-num">${avgSc}</div><div class="stat-label">คะแนนเฉลี่ย</div></div>
    <div class="stat-card top"><div class="stat-num" style="font-size:1.2rem">${esc(top.name)||'—'}</div><div class="stat-label">แชมป์ปัจจุบัน</div></div>
    <div class="stat-card"><div class="stat-num">${rewarded}</div><div class="stat-label">มอบรางวัลแล้ว</div></div>`;
}

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
    const now = formatDate(new Date().toISOString());
    btn.outerHTML = `<button class="btn btn-rewarded btn-sm" disabled>✅ รับแล้ว<br><small>${now}</small></button>`;
    // อัปเดต local state
    const p = allPlayers.find(p => p.rowIndex === rowIndex);
    if (p) { p.reward = true; p.redeemedBy = new Date().toISOString(); }
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🎁 มอบรางวัล';
    alert('บันทึกไม่สำเร็จ: ' + e.message);
  }
}

// ── REPORTS ───────────────────────────────────────────────────
async function renderReports() {
  show('r-loading'); hide('r-content');
  if (!allPlayers.length) {
    await loadPlayers();
  }

  // กรองตาม period
  const now   = new Date();
  const week  = startOf('week', now);
  const month = startOf('month', now);

  let rows = allPlayers.filter(p => {
    const ts = parseTimestamp(p.timestamp);
    if (!ts) return false;
    if (reportPeriod === 'week'  && ts < week)  return false;
    if (reportPeriod === 'month' && ts < month) return false;
    return true;
  });

  hide('r-loading');
  show('r-content');

  buildDailyChart(rows);
  buildScoreChart(rows);
}

function buildDailyChart(rows) {
  // นับจำนวนผู้เล่นต่อวัน
  const counts = {};
  rows.forEach(p => {
    const ts = parseTimestamp(p.timestamp);
    if (!ts) return;
    const day = ts.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' });
    counts[day] = (counts[day] || 0) + 1;
  });

  // เรียง key ตามวันที่
  const sortedKeys = Object.keys(counts).sort((a, b) => {
    const da = parseTimestamp(rows.find(r => {
      const ts = parseTimestamp(r.timestamp);
      return ts && ts.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' }) === a;
    })?.timestamp);
    const db = parseTimestamp(rows.find(r => {
      const ts = parseTimestamp(r.timestamp);
      return ts && ts.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' }) === b;
    })?.timestamp);
    return (da||0) - (db||0);
  });

  const labels = sortedKeys;
  const data   = sortedKeys.map(k => counts[k]);

  if (chartDaily) chartDaily.destroy();
  const ctx = document.getElementById('chart-daily').getContext('2d');
  chartDaily = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'จำนวนผู้เล่น',
        data,
        borderColor: '#2E7D32',
        backgroundColor: 'rgba(46,125,50,.1)',
        tension: .3,
        fill: true,
        pointBackgroundColor: '#2E7D32',
        pointRadius: 5,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  });
}

function buildScoreChart(rows) {
  // Top 10 เรียงคะแนนมากไปน้อย
  const top10 = [...rows].sort((a, b) => b.score - a.score).slice(0, 10);
  const labels = top10.map(p => p.name || 'ไม่ระบุ');
  const data   = top10.map(p => p.score);
  const colors = top10.map((_, i) =>
    i === 0 ? '#F9A825' : i === 1 ? '#B0BEC5' : i === 2 ? '#A1887F' : '#4CAF50'
  );

  if (chartScores) chartScores.destroy();
  const ctx = document.getElementById('chart-scores').getContext('2d');
  chartScores = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'คะแนน',
        data,
        backgroundColor: colors,
        borderRadius: 6,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true }
      }
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────
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
  if (unit === 'week')  { d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); }
  if (unit === 'month') { d.setDate(1); d.setHours(0,0,0,0); }
  return d;
}

function formatDate(ts) {
  const d = parseTimestamp(ts);
  if (!d) return ts || '—';
  return d.toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'2-digit' })
       + ' ' + d.toLocaleTimeString('th-TH', { hour:'2-digit', minute:'2-digit' });
}
