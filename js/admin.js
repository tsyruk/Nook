'use strict';
// ═══════════════════════════════════════════
// ADMIN — pin, dashboard, players, detail, camera
// ═══════════════════════════════════════════

// ── State ────────────────────────────────
let adminPin      = '';
let adminCustomer = null;
let admCamActive  = false;
let html5QrCodeAdm = null;

let adminToken = sessionStorage.getItem('nook_admin_token') || null;
function saveAdminToken(t) { adminToken = t; sessionStorage.setItem('nook_admin_token', t); }
function clearAdminToken() { adminToken = null; sessionStorage.removeItem('nook_admin_token'); }

// ── Pin UI ───────────────────────────────
function updateAdminPinUI() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('apd' + i);
    d.innerHTML = i < adminPin.length
      ? `<div class="pin-pip" style="background:var(--adm);box-shadow:0 0 6px var(--adm);"></div>` : '';
    d.classList.toggle('on-adm', i < adminPin.length);
    d.classList.remove('err');
  }
}

function adminPinPress(k) {
  if (k === 'del') { adminPin = adminPin.slice(0,-1); updateAdminPinUI(); return; }
  if (adminPin.length >= 4) return;
  adminPin += String(k);
  updateAdminPinUI();
  if (adminPin.length === 4) {
    setTimeout(async () => {
      showBusy(true);
      try {
        const { token } = await callEdge('nook-auth', { pin: adminPin, role: 'admin' });
        adminPin = ''; updateAdminPinUI();
        saveAdminToken(token);
        showBusy(false);
        go('s-admin-dash');
      } catch (e) {
        showBusy(false);
        adminPin = ''; updateAdminPinUI();
        document.getElementById('apin-err').textContent = e.message || '!! WRONG PIN !!';
        document.getElementById('apin-row').classList.add('shake');
        for (let i = 0; i < 4; i++) document.getElementById('apd' + i).classList.add('err');
        setTimeout(() => {
          document.getElementById('apin-err').textContent = '';
          document.getElementById('apin-row').classList.remove('shake');
        }, 900);
      }
    }, 120);
  }
}

function doAdminLogout() {
  stopAdminCamera();
  clearAdminToken();
  go('s-welcome');
  showToast('ADMIN LOGGED OUT', 'info');
}

// ── Dashboard ────────────────────────────
async function renderAdminDash() {
  showBusy(true);
  staffList = await dbGetAll(adminToken);
  showBusy(false);
  const total    = staffList.length;
  const visits   = staffList.reduce((a,c) => a + (c.visits||0), 0);
  const allRew   = staffList.flatMap(c => c.rewards || []);
  const redeemed = allRew.filter(r => r.redeemed).length;
  const active   = staffList.flatMap(c => pendingRewards(c)).length;
  const avgS     = total ? Math.round(staffList.reduce((a,c) => a+(c.stamps||0), 0) / total * 10) / 10 : 0;

  document.getElementById('db-members').textContent  = total;
  document.getElementById('db-visits').textContent   = visits;
  document.getElementById('db-redeemed').textContent = redeemed;
  document.getElementById('db-active').textContent   = active;
  document.getElementById('db-avg-bar').style.width  = (avgS / 10 * 100) + '%';
  document.getElementById('db-avg-lbl').textContent  = avgS + '/10';
  document.getElementById('db-avg-text').textContent = 'AVG ' + avgS;

  const top    = [...staffList].sort((a,b) =>
    (b.rewards||[]).filter(r=>r.redeemed).length - (a.rewards||[]).filter(r=>r.redeemed).length
  ).slice(0,3);
  const medals = ['🥇','🥈','🥉'];

  document.getElementById('db-top').innerHTML = top.length
    ? top.map((c,i) => `<div class="stat-row">
        <span style="font-size:13px;">${medals[i]}</span>
        <div style="flex:1;margin-left:8px;">
          <div style="font-size:9px;color:var(--g);">${c.name}</div>
          <div style="font-size:8px;color:rgba(0,229,255,.4);margin-top:1px;">${c.id}</div>
        </div>
        <div style="font-size:9px;color:var(--y);">${(c.rewards||[]).filter(r=>r.redeemed).length} ☕</div>
      </div>`).join('')
    : '<div style="font-size:9px;color:rgba(176,96,255,.2);padding:6px;">NO DATA YET</div>';

  const evts = [];
  staffList.forEach(c => (c.history||[]).forEach(h => evts.push({ ...h, cname: c.name })));
  evts.sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('db-activity').innerHTML = evts.slice(0,12).map(e => `
    <div class="hist-item">
      <span class="hist-icon">${H_ICO[e.type]||'•'}</span>
      <div class="hist-text">
        <span style="color:var(--g);">${e.cname}</span>
        <span style="color:rgba(0,229,255,.5);margin-left:8px;font-size:8px;">${H_LBL[e.type]||e.type}</span>
        ${e.note ? `<div style="font-size:8px;color:rgba(0,229,255,.4);">${sanitize(e.note)}</div>` : ''}
      </div>
      <span class="hist-date">${e.date}</span>
    </div>`).join('')
    || '<div style="font-size:9px;color:rgba(176,96,255,.2);padding:6px;">NO ACTIVITY</div>';
}

// ── Redemptions log ──────────────────────
async function renderAdminRdm() {
  showBusy(true);
  const all = await dbGetAll(adminToken);
  showBusy(false);
  const rdms = [];
  all.forEach(c => (c.rewards||[]).filter(r=>r.redeemed).forEach(r =>
    rdms.push({ name: c.name, id: c.id, date: r.redeemedDate||'–', note: r.note||'10-stamp' })
  ));
  rdms.sort((a,b) => b.date.localeCompare(a.date));
  document.getElementById('rdm-list').innerHTML = rdms.length === 0
    ? '<div style="font-size:9px;color:rgba(176,96,255,.2);padding:16px;text-align:center;">NO REDEMPTIONS YET</div>'
    : rdms.map(r => `<div class="rdm-row">
        <div style="flex:1;">
          <div style="font-size:9px;color:var(--g);">${r.name}</div>
          <div style="font-size:8px;color:rgba(0,229,255,.4);margin-top:1px;">${r.id}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:9px;color:var(--adm);">☕ ${r.note}</div>
          <div style="font-size:8px;color:rgba(0,229,255,.45);margin-top:1px;">${r.date}</div>
        </div>
      </div>`).join('');
}

// ── Player list ──────────────────────────
async function loadAdminPlayerList() {
  showBusy(true);
  staffList = await dbGetAll(adminToken);
  showBusy(false);
  _renderAdminListFromCache();
}

function _renderAdminListFromCache() {
  const q  = (document.getElementById('admin-search')?.value || '').toUpperCase();
  const sorted = [...staffList].filter(c => !q || c.name.includes(q) || c.phone.includes(q) || c.id.includes(q));
  const el = document.getElementById('admin-player-list');
  el.innerHTML = sorted.length === 0
    ? '<div style="font-size:9px;color:rgba(176,96,255,.2);padding:14px;text-align:center;">NO PLAYERS FOUND</div>'
    : sorted.map(c => {
        const rd = (c.rewards||[]).filter(r=>r.redeemed).length;
        const pr = pendingRewards(c).length;
        return `<div class="c-row" onclick="openAdminDetail('${c.id}')">
          <div class="c-av c-av-adm">${c.name.charAt(0)}</div>
          <div style="flex:1;">
            <div style="font-size:10px;color:var(--g);margin-bottom:3px;">${c.name}</div>
            <div style="font-size:9px;color:rgba(0,229,255,.5);">${c.phone} · ${c.visits||0} visits</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:9px;color:var(--y);">☕ ${c.stamps}/10</div>
            <div style="font-size:8px;color:rgba(0,255,136,.5);margin-top:1px;">${rd} redeemed</div>
            ${pr > 0 ? `<div style="font-size:9px;color:var(--g);margin-top:1px;">★ ${pr} pending</div>` : ''}
          </div>
        </div>`;
      }).join('');
}

function renderAdminPlayerList() {
  if (staffList.length) _renderAdminListFromCache();
  else loadAdminPlayerList();
}

async function openAdminDetail(id) {
  showBusy(true);
  adminCustomer = await dbGetById(id);
  showBusy(false);
  go('s-admin-detail');
}

// ── Admin detail ─────────────────────────
async function renderAdminDetail() {
  const c = adminCustomer; if (!c) return;
  document.getElementById('ad-avatar').textContent    = c.name.charAt(0);
  document.getElementById('ad-name').textContent      = c.name;
  const rd = (c.rewards||[]).filter(r=>r.redeemed).length;
  document.getElementById('ad-meta').textContent      = `${c.id}\n${c.phone} · ${rd} REDEEMED · ${c.visits||0} VISITS`;
  renderOffers('ad-offers', c);
  document.getElementById('ad-stamp-lbl').textContent = c.stamps + '/10';
  renderHPBar(document.getElementById('ad-stamps'), c.stamps);
  document.getElementById('ad-prog').style.width      = (c.stamps / 10 * 100) + '%';
  document.getElementById('ad-prog-t').textContent    = c.stamps >= 10 ? 'FULL!' : c.stamps + '/10';
  document.getElementById('ad-rm-btn').disabled       = c.stamps <= 0;
  renderRewardChips('ad-rewards-list', c, true, 'adRedeemById');
  const pending = pendingRewards(c).length > 0;
  document.getElementById('ad-redeem-btn').disabled        = !pending;
  document.getElementById('sd-btn-redeem-adm').disabled    = !pending;
  document.getElementById('ad-btn-bday').style.display     = (isBirthdayMonth(c) && !bdayUsed(c)) ? 'block' : 'none';
  renderHistList('ad-hist-list', c);
}

async function adminAction(action, extra = {}) {
  if (!adminToken || isTokenExpired(adminToken)) { clearAdminToken(); showToast('SESSION EXPIRED', 'err'); go('s-admin-login'); return; }
  showBusy(true);
  try {
    const { customer } = await callEdge('nook-staff', { action, customerId: adminCustomer.id, ...extra }, adminToken);
    adminCustomer = customer;
    await refreshCustomer(customer.id);
    showBusy(false);
    renderAdminDetail();
  } catch (e) {
    showBusy(false);
    if (e.message.includes('Unauthorized')) { showToast('SESSION EXPIRED — LOG IN AGAIN', 'err'); go('s-admin-login'); }
    else showToast(e.message || 'ERROR', 'err');
  }
}

async function adAddStamp()     { await adminAction('addStamp');     showToast(adminCustomer.stamps === 0 ? '★ FREE COFFEE EARNED! ★' : '☕ STAMP ADDED'); }
async function adRemoveStamp()  { await adminAction('removeStamp');  showToast('STAMP REMOVED', 'info'); }
async function adGrantReward()  { await adminAction('grantReward');  showToast('★ FREE COFFEE GRANTED ★'); }
async function adGrantBirthday(){ await adminAction('grantBirthday'); showToast('🎂 BIRTHDAY REWARD GRANTED!', 'info'); }

async function adRedeemCoffee() {
  const pr = pendingRewards(adminCustomer);
  if (!pr.length) { showToast('NO VALID REWARDS', 'err'); return; }
  await adRedeemById(pr[0].id);
}
async function adRedeemById(rid) {
  await adminAction('redeemReward', { rewardId: rid });
  showToast('★★ FREE COFFEE REDEEMED! ★★');
}

// ── Admin camera ─────────────────────────
function toggleAdminCamera() { admCamActive ? stopAdminCamera() : startAdminCamera(); }

function startAdminCamera() {
  const rd  = document.getElementById('qr-reader-adm');
  const ph  = document.getElementById('scan-ph-adm');
  const btn = document.getElementById('btn-cam-adm');
  if (typeof Html5Qrcode === 'undefined') { showToast('SCANNER NOT LOADED', 'err'); return; }
  ph.style.display = 'none'; rd.style.display = 'block'; rd.innerHTML = '';
  html5QrCodeAdm = new Html5Qrcode('qr-reader-adm');
  html5QrCodeAdm.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 180, height: 180 } },
    async decoded => {
      const id = decoded.trim();
      stopAdminCamera();
      showBusy(true);
      adminCustomer = await dbGetById(id);
      showBusy(false);
      if (adminCustomer) go('s-admin-detail');
      else showToast('QR NOT RECOGNISED', 'err');
    },
    () => {}
  ).then(() => { admCamActive = true; btn.textContent = '■ STOP CAMERA'; btn.className = 'btn btn-r'; })
   .catch(() => { rd.style.display = 'none'; ph.style.display = 'block'; showToast('CAMERA UNAVAILABLE', 'err'); });
}

function stopAdminCamera() {
  if (html5QrCodeAdm && admCamActive) {
    html5QrCodeAdm.stop().catch(() => {}).finally(() => {
      html5QrCodeAdm = null; admCamActive = false;
      const btn = document.getElementById('btn-cam-adm');
      if (btn) { btn.textContent = '▶ START CAMERA'; btn.className = 'btn btn-adm'; }
      const ph = document.getElementById('scan-ph-adm');
      const rd = document.getElementById('qr-reader-adm');
      if (ph) ph.style.display = 'block';
      if (rd) { rd.style.display = 'none'; rd.innerHTML = ''; }
    });
  }
}

async function doAdminPhoneScan() {
  const v = document.getElementById('scan-phone-adm').value.trim();
  showBusy(true);
  const c = await dbGetByPhone(v);
  showBusy(false);
  if (c) { adminCustomer = c; go('s-admin-detail'); }
  else showToast('PLAYER NOT FOUND', 'err');
  document.getElementById('scan-phone-adm').value = '';
}
