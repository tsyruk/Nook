'use strict';
// ═══════════════════════════════════════════
// STAFF — pin, home, detail, stamps, camera
// ═══════════════════════════════════════════

// ── State ────────────────────────────────
let staffPin       = '';
let lastStampTime  = 0;
let coolTimer      = null;
let selectedCustomer = null;
let staffList      = [];
let cameraActive   = false;
let html5QrCode    = null;

let staffToken = sessionStorage.getItem('nook_staff_token') || null;
function saveStaffToken(t)  { staffToken = t; sessionStorage.setItem('nook_staff_token', t); }
function clearStaffToken()  { staffToken = null; sessionStorage.removeItem('nook_staff_token'); }

// ── Pin UI ───────────────────────────────
function updateStaffPinUI() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('spd' + i);
    d.innerHTML = i < staffPin.length ? '<div class="pin-pip"></div>' : '';
    d.classList.toggle('on', i < staffPin.length);
    d.classList.remove('err');
  }
}

function staffPinPress(k) {
  if (k === 'del') { staffPin = staffPin.slice(0,-1); updateStaffPinUI(); return; }
  if (staffPin.length >= 4) return;
  staffPin += String(k);
  updateStaffPinUI();
  if (staffPin.length === 4) {
    setTimeout(async () => {
      showBusy(true);
      try {
        const { token } = await callEdge('nook-auth', { pin: staffPin, role: 'staff' });
        staffPin = ''; updateStaffPinUI();
        saveStaffToken(token);
        showBusy(false);
        go('s-staff-home');
      } catch (e) {
        showBusy(false);
        staffPin = ''; updateStaffPinUI();
        document.getElementById('spin-err').textContent = '!! WRONG PIN !!';
        document.getElementById('spin-row').classList.add('shake');
        for (let i = 0; i < 4; i++) document.getElementById('spd' + i).classList.add('err');
        setTimeout(() => {
          document.getElementById('spin-err').textContent = '';
          document.getElementById('spin-row').classList.remove('shake');
        }, 900);
      }
    }, 120);
  }
}

function doStaffLogout() {
  stopCamera();
  clearStaffToken();
  go('s-welcome');
  showToast('STAFF LOGGED OUT', 'info');
}

// ── Staff home ───────────────────────────
async function renderStaffHome() {
  document.getElementById('sh-members').textContent = '…';
  document.getElementById('sh-visits').textContent  = '…';
  showBusy(true);
  staffList = await dbGetAll();
  showBusy(false);
  document.getElementById('sh-members').textContent = staffList.length;
  document.getElementById('sh-visits').textContent  = staffList.reduce((a,c) => a + (c.visits||0), 0);
  renderCustomerList();
}

function renderCustomerList() {
  const q = (document.getElementById('staff-search')?.value || '').toUpperCase();
  const sorted = [...staffList].filter(c => !q || c.name.includes(q) || c.phone.includes(q) || c.id.includes(q));
  const el = document.getElementById('staff-customer-list');
  if (!sorted.length) {
    el.innerHTML = '<div style="font-size:6px;color:rgba(255,0,255,.3);padding:14px;text-align:center;">NO PLAYERS FOUND</div>';
    return;
  }
  el.innerHTML = sorted.map(c => {
    const bday = isBirthdayMonth(c) && !bdayUsed(c) ? '🎂 ' : '';
    const pr   = pendingRewards(c).length;
    return `<div class="c-row" onclick="openStaffDetail('${c.id}')">
      <div class="c-av">${c.name.charAt(0)}</div>
      <div style="flex:1;">
        <div style="font-size:8px;color:var(--g);margin-bottom:3px;">${bday}${c.name}</div>
        <div style="font-size:6px;color:rgba(0,229,255,.4);">${c.phone}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:7px;color:var(--y);">☕ ${c.stamps}/10</div>
        ${pr > 0 ? `<div style="font-size:5px;color:var(--g);margin-top:2px;">★ ${pr} REWARD${pr>1?'S':''}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

async function openStaffDetail(id) {
  showBusy(true);
  selectedCustomer = await dbGetById(id);
  showBusy(false);
  go('s-staff-detail');
}

// ── Staff detail ─────────────────────────
async function renderStaffDetail() {
  const c = selectedCustomer; if (!c) return;
  document.getElementById('sd-avatar').textContent    = c.name.charAt(0);
  document.getElementById('sd-name').textContent      = c.name;
  const rd = (c.rewards||[]).filter(r => r.redeemed).length;
  document.getElementById('sd-meta').textContent      = `${c.id}\n${c.phone} · ${rd} REDEEMED · ${c.visits||0} VISITS`;
  renderOffers('sd-offers', c);
  document.getElementById('sd-stamp-lbl').textContent = c.stamps + '/10';
  document.getElementById('sd-ready').style.display   = c.stamps >= 10 ? 'inline' : 'none';
  renderHPBar(document.getElementById('sd-stamps'), c.stamps);
  document.getElementById('sd-prog').style.width      = (c.stamps / 10 * 100) + '%';
  document.getElementById('sd-prog-t').textContent    = c.stamps >= 10 ? 'FULL!' : c.stamps + '/10';
  renderRewardChips('sd-rewards-list', c, true, 'sdRedeemById');
  document.getElementById('sd-btn-add').disabled    = c.stamps >= 10;
  document.getElementById('sd-btn-redeem').disabled = pendingRewards(c).length === 0;
  document.getElementById('sd-btn-bday').style.display = (isBirthdayMonth(c) && !bdayUsed(c)) ? 'block' : 'none';
}

async function sdAddStamp() {
  const now = Date.now();
  if (now - lastStampTime < 5000) { showToast('WAIT ' + Math.ceil((5000-(now-lastStampTime))/1000) + 's', 'err'); return; }
  lastStampTime = now;
  if (!staffToken) { showToast('SESSION EXPIRED — PLEASE LOG IN AGAIN', 'err'); go('s-staff-login'); return; }
  showBusy(true);
  try {
    const { customer } = await callEdge('nook-staff', { action: 'addStamp', customerId: selectedCustomer.id }, staffToken);
    selectedCustomer = customer;
    await refreshCustomer(customer.id);
    showBusy(false);
    renderStaffDetail();
    showToast(customer.stamps === 0 ? '★ FREE COFFEE EARNED! ★' : '☕ STAMP ADDED (' + customer.stamps + '/10)');
    const pips = document.querySelectorAll('#sd-stamps .hp-pip');
    const pi   = Math.min(customer.stamps > 0 ? customer.stamps - 1 : 9, 9);
    if (pips[pi]) { pips[pi].classList.remove('pop'); void pips[pi].offsetWidth; pips[pi].classList.add('pop'); }
  } catch (e) {
    showBusy(false);
    if (e.message.includes('Unauthorized')) { showToast('SESSION EXPIRED — LOG IN AGAIN', 'err'); go('s-staff-login'); }
    else showToast(e.message || 'ERROR', 'err');
  }
  clearInterval(coolTimer);
  coolTimer = setInterval(() => {
    const r  = Math.ceil((5000 - (Date.now() - lastStampTime)) / 1000);
    const el = document.getElementById('sd-cooldown');
    if (el) el.textContent = r > 0 ? 'COOLDOWN: ' + r + 's' : '';
    if (r <= 0) clearInterval(coolTimer);
  }, 500);
}

async function sdRedeemCoffee() {
  const pr = pendingRewards(selectedCustomer);
  if (!pr.length) { showToast('NO VALID REWARDS', 'err'); return; }
  await sdRedeemById(pr[0].id);
}

async function sdRedeemById(rid) {
  if (!staffToken) { showToast('SESSION EXPIRED', 'err'); go('s-staff-login'); return; }
  showBusy(true);
  try {
    const { customer } = await callEdge('nook-staff', { action: 'redeemReward', customerId: selectedCustomer.id, rewardId: rid }, staffToken);
    selectedCustomer = customer;
    await refreshCustomer(customer.id);
    showBusy(false);
    renderStaffDetail();
    showToast('★★ FREE COFFEE REDEEMED! ★★');
  } catch (e) {
    showBusy(false);
    showToast(e.message || 'ERROR', 'err');
  }
}

async function sdGrantBirthday() {
  if (!staffToken) { showToast('SESSION EXPIRED', 'err'); go('s-staff-login'); return; }
  showBusy(true);
  try {
    const { customer } = await callEdge('nook-staff', { action: 'grantBirthday', customerId: selectedCustomer.id }, staffToken);
    selectedCustomer = customer;
    await refreshCustomer(customer.id);
    showBusy(false);
    renderStaffDetail();
    showToast('🎂 BIRTHDAY REWARD GRANTED!', 'info');
  } catch (e) {
    showBusy(false);
    showToast(e.message || 'ERROR', 'err');
  }
}

// ── Camera ───────────────────────────────
function toggleCamera() { cameraActive ? stopCamera() : startCamera(); }

function startCamera() {
  const rd  = document.getElementById('qr-reader');
  const ph  = document.getElementById('scan-placeholder');
  const btn = document.getElementById('btn-cam');
  if (typeof Html5Qrcode === 'undefined') { showToast('SCANNER NOT LOADED', 'err'); return; }
  ph.style.display = 'none'; rd.style.display = 'block'; rd.innerHTML = '';
  html5QrCode = new Html5Qrcode('qr-reader');
  html5QrCode.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 180, height: 180 } },
    async decoded => {
      const id = decoded.trim();
      stopCamera();
      showBusy(true);
      selectedCustomer = await dbGetById(id);
      showBusy(false);
      if (selectedCustomer) go('s-staff-detail');
      else showToast('QR NOT RECOGNISED', 'err');
    },
    () => {}
  ).then(() => { cameraActive = true; btn.textContent = '■ STOP CAMERA'; btn.className = 'btn btn-r'; })
   .catch(() => { rd.style.display = 'none'; ph.style.display = 'block'; showToast('CAMERA UNAVAILABLE', 'err'); });
}

function stopCamera() {
  if (html5QrCode && cameraActive) {
    html5QrCode.stop().catch(() => {}).finally(() => {
      html5QrCode = null; cameraActive = false;
      const btn = document.getElementById('btn-cam');
      if (btn) { btn.textContent = '▶ START CAMERA'; btn.className = 'btn btn-b'; }
      const ph = document.getElementById('scan-placeholder');
      const rd = document.getElementById('qr-reader');
      if (ph) ph.style.display = 'block';
      if (rd) { rd.style.display = 'none'; rd.innerHTML = ''; }
    });
  }
}

async function doPhoneScan() {
  const v = document.getElementById('scan-phone').value.trim();
  showBusy(true);
  const c = await dbGetByPhone(v);
  showBusy(false);
  if (c) { selectedCustomer = c; go('s-staff-detail'); }
  else showToast('PLAYER NOT FOUND', 'err');
  document.getElementById('scan-phone').value = '';
}
