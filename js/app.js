'use strict';
// ═══════════════════════════════════════════
// APP — navigation, shared state, boot
// ═══════════════════════════════════════════

// ── Shared customer state ────────────────
// (referenced across auth.js, customer.js, staff.js, admin.js)
let currentCustomer = null;

// ── Navigation ───────────────────────────
async function go(id) {
  if (id !== 's-staff-scanner') stopCamera();
  if (id !== 's-admin-scan')    stopAdminCamera();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const renders = {
    's-c-rewards':     renderCustomerRewards,
    's-c-history':     renderCustomerHistory,
    's-c-settings':    renderCustomerSettings,
    's-leaderboard':   renderLeaderboard,
    's-staff-home':    renderStaffHome,
    's-staff-detail':  renderStaffDetail,
    's-admin-dash':    renderAdminDash,
    's-admin-rdm':     renderAdminRdm,
    's-admin-players': loadAdminPlayerList,
    's-admin-detail':  renderAdminDetail,
  };
  if (renders[id]) await renders[id]();
}

function adminGoTab(tab) { go('s-admin-' + tab); }

function staffGoScan() {
  document.getElementById('qr-reader').style.display       = 'none';
  document.getElementById('scan-placeholder').style.display = 'block';
  go('s-staff-scanner');
}

// ── DVH shim (fixes iOS Safari toolbar shrinking viewport) ──
function setDvh() {
  document.documentElement.style.setProperty('--dvh', (window.innerHeight * 0.01) + 'px');
}
setDvh();
window.addEventListener('resize', setDvh);
window.addEventListener('orientationchange', () => setTimeout(setDvh, 150));

// ── Boot ─────────────────────────────────
initYearSelect('c-by');
initYearSelect('s-by');
populateDays('c-bm', 'c-bd', 'c-by');
populateDays('s-bm', 's-bd', 's-by');
document.getElementById('qr-reader').style.display     = 'none';
document.getElementById('qr-reader-adm').style.display = 'none';
window.addEventListener('beforeunload', () => { stopCamera(); stopAdminCamera(); });
