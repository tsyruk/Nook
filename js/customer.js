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

async function renderLeaderboard() {
  showBusy(true);
  const all = await dbGetAll();
  showBusy(false);
  const sorted = [...all].sort((a,b) =>
    (b.rewards||[]).filter(r=>r.redeemed).length - (a.rewards||[]).filter(r=>r.redeemed).length
  );
  const medals = ['🥇','🥈','🥉'];
  document.getElementById('lb-list').innerHTML = sorted.length === 0
    ? '<div style="font-size:6px;color:rgba(0,255,136,.2);padding:14px;text-align:center;">NO PLAYERS YET</div>'
    : sorted.map((c,i) => {
        const rd = (c.rewards||[]).filter(r=>r.redeemed).length;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(0,255,136,.08);">
          <div style="font-size:13px;width:22px;text-align:center;flex-shrink:0;color:${i===0?'var(--y)':i===1?'rgba(200,200,200,.9)':'rgba(200,140,80,.9)'}">
            ${i < 3 ? medals[i] : (i+1)}</div>
          <div style="flex:1;">
            <div style="font-size:8px;color:var(--g);">${c.name}</div>
            <div style="font-size:5px;color:rgba(0,229,255,.3);margin-top:2px;">${c.id}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:7px;color:var(--y);">${rd} ☕</div>
            <div style="font-size:5px;color:rgba(0,255,136,.3);margin-top:2px;">${c.stamps}/10 STAMPS</div>
          </div>
        </div>`;
      }).join('');
}
