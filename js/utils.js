'use strict';
// ═══════════════════════════════════════════
// UTILS — shared UI helpers + small renderers
// ═══════════════════════════════════════════

// ── Loading overlay ──────────────────────
function showBusy(on) {
  document.getElementById('busy-overlay').style.display = on ? 'flex' : 'none';
}

// ── Toast ────────────────────────────────
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  // shrink font for long messages so they don't overflow
  t.style.fontSize = msg.length > 40 ? '6px' : '7px';
  setTimeout(() => t.classList.add('show'), 10);
  const duration = type === 'err' ? 5000 : 3000;
  setTimeout(() => t.classList.remove('show'), duration);
}

// ── Data helpers ─────────────────────────
function genId()       { return 'NOOK-' + String(Math.floor(Math.random() * 9000) + 1000); }
function todayStr()    { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function addDays(ds,n) { const d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); }
function daysLeft(ds)  { return Math.ceil((new Date(ds + 'T12:00:00') - new Date()) / 864e5); }

function isBirthdayMonth(c) {
  if (!c?.birthday) return false;
  return new Date(c.birthday + 'T12:00:00').getMonth() === new Date().getMonth();
}
function bdayUsed(c)      { return c.birthdayYear === new Date().getFullYear(); }
function pendingRewards(c) {
  const t = todayStr();
  return (c.rewards || []).filter(r => !r.redeemed && r.expires >= t);
}

// ── Stamp pips ───────────────────────────
function renderHPBar(el, stamps, max = 10, animateIndex = -1) {
  el.innerHTML = Array.from({ length: max }, (_,i) => {
    const on  = i < stamps ? 'on' : '';
    const pop = i === animateIndex ? 'pop' : '';
    return `<div class="hp-pip ${on} ${pop}"></div>`;
  }).join('');
}

// ── Offer banners ────────────────────────
function renderOffers(containerId, c) {
  let h = '';
  if (c && isBirthdayMonth(c) && !bdayUsed(c)) {
    h += `<div class="offer-banner bday"><span class="ob-icon">🎂</span>
      <div class="ob-text">BIRTHDAY MONTH, ${c.name}!<br>FREE COFFEE WAITING</div></div>`;
  }
  document.getElementById(containerId).innerHTML = h;
}

// ── History lists ────────────────────────
const H_ICO = { stamp: '☕', reward: '🏆', birthday: '🎂' };
const H_LBL = { stamp: 'STAMP ADDED', reward: 'FREE COFFEE', birthday: 'BIRTHDAY REWARD' };

function renderHistList(elId, c) {
  const h = (c.history || []).slice().reverse();
  if (!h.length) {
    document.getElementById(elId).innerHTML =
      '<div style="font-size:6px;color:rgba(0,255,136,.2);padding:8px;text-align:center;">NO ACTIVITY YET</div>';
    return;
  }
  document.getElementById(elId).innerHTML = h.map(e => `
    <div class="hist-item">
      <span class="hist-icon">${H_ICO[e.type] || '•'}</span>
      <div class="hist-text">${H_LBL[e.type] || e.type}
        ${e.note ? `<div style="font-size:5px;color:rgba(0,229,255,.35);margin-top:1px;">${e.note}</div>` : ''}
      </div>
      <span class="hist-date">${e.date}</span>
    </div>`).join('');
}

// ── Reward chips ─────────────────────────
function renderRewardChips(elId, c, showBtn, fnName) {
  const all = (c.rewards || []).filter(r => !r.redeemed);
  if (!all.length) {
    document.getElementById(elId).innerHTML =
      '<div style="font-size:6px;color:rgba(0,255,136,.2);padding:6px 0;">NO PENDING REWARDS</div>';
    return;
  }
  document.getElementById(elId).innerHTML = all.map(r => {
    const left = daysLeft(r.expires), expired = left <= 0, warn = left > 0 && left <= 14;
    const cls = expired ? 'dead' : warn ? 'warn' : '';
    const col = expired ? 'var(--r)' : warn ? 'var(--o)' : 'var(--g)';
    return `<div class="reward-chip ${cls}">
      <div>
        <div style="font-size:7px;color:${col};margin-bottom:2px;">☕ FREE COFFEE</div>
        <div style="font-size:5px;color:rgba(0,229,255,.35);">
          ${expired ? 'EXPIRED' : 'EXPIRES'} ${r.expires}${!expired ? ' (' + left + 'd LEFT)' : ''}
          ${r.note ? ' · ' + r.note : ''}
        </div>
      </div>
      ${showBtn && !expired ? `<button class="btn-sm btn-sm-g" onclick="${fnName}('${r.id}')">REDEEM</button>` : ''}
    </div>`;
  }).join('');
}

// ── QR code ──────────────────────────────
function drawQR(id, elId) {
  const el = document.getElementById(elId);
  el.innerHTML = '';
  if (typeof QRCode === 'undefined') return;
  new QRCode(el, {
    text: id, width: 110, height: 110,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ── Birthday dropdowns ───────────────────
function populateDays(mId, dId, yId) {
  const m = parseInt(document.getElementById(mId).value) || 0;
  const y = parseInt(document.getElementById(yId).value) || 2000;
  const days = m ? new Date(y, m, 0).getDate() : 31;
  const dEl = document.getElementById(dId);
  const cur = dEl.value;
  dEl.innerHTML = '<option value="">DD</option>';
  for (let d = 1; d <= days; d++) {
    const o = document.createElement('option');
    o.value = String(d).padStart(2, '0');
    o.textContent = d;
    dEl.appendChild(o);
  }
  if (cur) dEl.value = cur;
}

function initYearSelect(yId) {
  const el = document.getElementById(yId);
  const cur = new Date().getFullYear();
  for (let y = cur - 5; y >= cur - 100; y--) {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    el.appendChild(o);
  }
}

function getBday(mId, dId, yId) {
  const m = document.getElementById(mId).value;
  const d = document.getElementById(dId).value;
  const y = document.getElementById(yId).value;
  return (m && d && y) ? `${y}-${m}-${d}` : '';
}
