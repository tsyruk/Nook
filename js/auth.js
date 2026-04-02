'use strict';
// ═══════════════════════════════════════════
// AUTH — customer sign in / out / create / settings
// ═══════════════════════════════════════════

async function doSignIn() {
  const phone = document.getElementById('w-phone').value.trim();
  if (!PHONE_RE.test(phone)) { showToast('ENTER A VALID 10-DIGIT PHONE', 'err'); return; }
  showBusy(true);
  const c = await dbGetByPhone(phone);
  showBusy(false);
  if (!c) { showToast('PHONE NOT FOUND — CREATE ACCOUNT?', 'err'); return; }
  currentCustomer = c;
  document.getElementById('w-phone').value = '';
  showToast('WELCOME BACK ' + c.name + '!');
  go('s-c-rewards');
}

function doSignOut() {
  currentCustomer = null;
  go('s-welcome');
  showToast('SEE YOU SOON! ☕', 'info');
}

async function doCreate() {
  const name  = document.getElementById('c-name').value.trim().toUpperCase();
  const phone = document.getElementById('c-phone').value.trim();
  if (!name || !phone) { showToast('FILL ALL FIELDS', 'err'); return; }
  if (!PHONE_RE.test(phone)) { showToast('INVALID PHONE NUMBER', 'err'); return; }
  const bday = getBday('c-bm', 'c-bd', 'c-by');
  const nc = { id: genId(), name, phone, birthday: bday, since: todayStr() };
  showBusy(true);
  try {
    await callEdge('nook-customer', { action: 'create', ...nc });
    currentCustomer = await dbGetByPhone(phone);
    showBusy(false);
    document.getElementById('c-name').value  = '';
    document.getElementById('c-phone').value = '';
    ['c-bm', 'c-bd', 'c-by'].forEach(id => document.getElementById(id).value = '');
    showToast('★ WELCOME ' + nc.name + '! ★');
    go('s-c-rewards');
  } catch (e) {
    showBusy(false);
    showToast(e.message || 'ERROR CREATING ACCOUNT', 'err');
  }
}

async function doSaveSettings() {
  const c = currentCustomer; if (!c) return;
  const name = document.getElementById('s-name').value.trim().toUpperCase();
  if (!name) { showToast('NAME CANNOT BE EMPTY', 'err'); return; }
  const payload = { action: 'updateSettings', customerId: c.id, name };
  if (!c.birthday) {
    const bday = getBday('s-bm', 's-bd', 's-by');
    if (bday) payload.birthday = bday;
  }
  showBusy(true);
  try {
    await callEdge('nook-customer', payload);
    currentCustomer = await dbGetById(c.id);
    showBusy(false);
    document.getElementById('c-set-name').textContent    = currentCustomer.name;
    document.getElementById('c-header-name').textContent = currentCustomer.name;
    showToast('✓ SETTINGS SAVED');
    renderCustomerSettings();
  } catch (e) {
    showBusy(false);
    showToast(e.message || 'SAVE FAILED', 'err');
  }
}
