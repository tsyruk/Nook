'use strict';
// ═══════════════════════════════════════════
// CUSTOMER — rewards card, history, settings, leaderboard
// ═══════════════════════════════════════════

async function renderCustomerRewards() {
  if (!currentCustomer) return;
  showBusy(true);
  const fresh = await dbGetById(currentCustomer.id);
  showBusy(false);
  if (fresh) currentCustomer = fresh;
  const c = currentCustomer;

  document.getElementById('c-header-name').textContent = c.name;
  renderOffers('c-offers', c);
  drawQR(c.id, 'c-qr');
  document.getElementById('c-qr-id').textContent    = c.id;
  document.getElementById('c-stamp-lbl').textContent = c.stamps + '/10';
  renderHPBar(document.getElementById('c-stamps'), c.stamps);
  document.getElementById('c-prog').style.width      = (c.stamps / 10 * 100) + '%';
  document.getElementById('c-prog-t').textContent    = c.stamps >= 10 ? 'FULL!' : c.stamps + '/10';
  renderRewardChips('c-rewards-list', c, false, '');
  document.getElementById('c-total-r').textContent   = (c.rewards || []).filter(r => r.redeemed).length;
  document.getElementById('c-total-v').textContent   = c.visits || 0;
}

async function renderCustomerHistory() {
  if (!currentCustomer) return;
  document.getElementById('c-hist-name').textContent = currentCustomer.name;
  renderHistList('c-history-list', currentCustomer);
}

async function renderCustomerSettings() {
  const c = currentCustomer; if (!c) return;
  document.getElementById('c-set-name').textContent = c.name;
  document.getElementById('s-name').value           = c.name;
  document.getElementById('s-id').textContent       = c.id;
  document.getElementById('s-phone').textContent    = c.phone;
  document.getElementById('s-since').textContent    = c.since || '—';

  if (c.birthday) {
    const [y, m, d] = c.birthday.split('-');
    const mo = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    document.getElementById('s-bday-val').textContent        = mo[parseInt(m,10)-1] + ' ' + parseInt(d,10) + ', ' + y;
    document.getElementById('s-bday-locked').style.display   = 'block';
    document.getElementById('s-bday-dropdowns').style.display = 'none';
  } else {
    document.getElementById('s-bday-locked').style.display   = 'none';
    document.getElementById('s-bday-dropdowns').style.display = 'block';
  }
}
