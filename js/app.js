if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use root path for custom domain (nook.margarita-tech.dev).
    // Previously registered as /Nook/sw.js which is the GitHub Pages subpath —
    // on the custom domain the site lives at /, so the SW must also be at /.
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.error('SW failed:', err));
  });
}

/**
 * Decodes a JWT payload and returns true if the token is expired.
 * Used before making authenticated Edge Function calls.
 */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? (Date.now() / 1000) > payload.exp : false;
  } catch {
    return true;
  }
}
'use strict';
// ═══════════════════════════════════════════
// APP — navigation, shared state, boot
// ═══════════════════════════════════════════

// ── Shared customer state ────────────────
// (referenced across auth.js, customer.js, staff.js, admin.js)
let currentCustomer = null;

// ── Navigation ───────────────────────────
let prevScreen = 's-welcome';

async function go(id) {
  const cur = document.querySelector('.screen.active');
  if (cur && cur.id !== id) prevScreen = cur.id;
  if (id !== 's-staff-scanner') stopCamera();
  if (id !== 's-admin-scan')    stopAdminCamera();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');

  const renders = {
    's-c-rewards':     renderCustomerRewards,
    's-c-history':     renderCustomerHistory,
    's-c-settings':    renderCustomerSettings,
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
