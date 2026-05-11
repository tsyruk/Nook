'use strict';
// ═══════════════════════════════════════════
// AUTH — customer sign in / out / create / settings
// ═══════════════════════════════════════════

let pendingPinPhone = '';
let customerPin = '';
let customerPinMode = 'verify'; // 'verify' or 'create'

function updateCustomerPinUI() {
  for (let i = 0; i < 4; i++) {
    const d = document.getElementById('cpd' + i);
    d.innerHTML = i < customerPin.length
      ? `<div class="pin-pip" style="background:var(--g);box-shadow:0 0 6px var(--g);"></div>` : '';
    d.classList.toggle('on', i < customerPin.length);
    d.classList.remove('err');
  }
}

function customerPinPress(k) {
  if (k === 'del') { customerPin = customerPin.slice(0,-1); updateCustomerPinUI(); return; }
  if (customerPin.length >= 4) return;
  customerPin += String(k);
  updateCustomerPinUI();
  if (customerPin.length === 4) {
    setTimeout(async () => {
      showBusy(true);
      try {
        const c = await dbVerifyPin(pendingPinPhone, customerPin);
        customerPin = ''; updateCustomerPinUI();
        currentCustomer = c;
        showBusy(false);
        showToast('WELCOME BACK ' + c.name + '!');
        go('s-c-rewards');
      } catch (e) {
        showBusy(false);
        customerPin = ''; updateCustomerPinUI();
        const msg = e.message || '!! WRONG PIN !!';
        const isLockout = msg.includes('TOO MANY');
        if (isLockout) {
          showToast(msg, 'err');
        } else {
          document.getElementById('cpin-err').textContent = msg;
        }
        document.getElementById('cpin-row').classList.add('shake');
        for (let i = 0; i < 4; i++) document.getElementById('cpd' + i).classList.add('err');
        setTimeout(() => {
          document.getElementById('cpin-err').textContent = '';
          document.getElementById('cpin-row').classList.remove('shake');
        }, 900);
      }
    }, 120);
  }
}

async function doSignIn() {
  const phone = document.getElementById('w-phone').value.trim();
  if (!PHONE_RE.test(phone)) { showToast('ENTER A VALID 10-DIGIT PHONE', 'err'); return; }
  showBusy(true);
  const result = await dbCheckPhone(phone);
  showBusy(false);
  if (!result.exists) { showToast('PHONE NOT FOUND — CREATE ACCOUNT?', 'err'); return; }
  pendingPinPhone = phone;
  customerPin = '';
  updateCustomerPinUI();
  document.getElementById('cpin-err').textContent = '';
  if (result.hasPin) {
    document.getElementById('cpin-title').textContent = 'ENTER YOUR PIN';
    document.getElementById('cpin-sub').textContent = '4-DIGIT PIN';
  } else {
    document.getElementById('cpin-title').textContent = 'CREATE YOUR PIN';
    document.getElementById('cpin-sub').textContent = 'CHOOSE A 4-DIGIT PIN FOR YOUR ACCOUNT';
  }
  document.getElementById('w-phone').value = '';
  go('s-customer-pin');
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
// ── Change PIN ────────────────────────────────────────────────────────────
let cpOld = '';
let cpNew = '';

function cpPress(which, k) {
  const isOld = which === 'old';
  if (k === 'del') {
    if (isOld) cpOld = cpOld.slice(0,-1);
    else       cpNew = cpNew.slice(0,-1);
  } else {
    if (isOld && cpOld.length < 4) cpOld += String(k);
    if (!isOld && cpNew.length < 4) cpNew += String(k);
  }
  // update dots
  ['old','new'].forEach(w => {
    const val = w === 'old' ? cpOld : cpNew;
    for (let i = 0; i < 4; i++) {
      const d = document.getElementById(`cp-${w}-${i}`);
      d.innerHTML = i < val.length ? '<div class="pin-pip"></div>' : '';
      d.classList.toggle('on', i < val.length);
    }
  });
}

async function doChangePin() {
  if (cpOld.length < 4) { document.getElementById('cp-err').textContent = 'ENTER YOUR CURRENT PIN'; return; }
  if (cpNew.length < 4) { document.getElementById('cp-err').textContent = 'ENTER YOUR NEW PIN'; return; }
  if (cpOld === cpNew)  { document.getElementById('cp-err').textContent = 'NEW PIN MUST BE DIFFERENT'; return; }
  showBusy(true);
  try {
    await callEdge('nook-customer', { action: 'changePin', customerId: currentCustomer.id, oldPin: cpOld, newPin: cpNew });
    cpOld = ''; cpNew = '';
    cpPress('old', 'del'); cpPress('new', 'del'); // reset UI
    showBusy(false);
    showToast('✓ PIN CHANGED!');
    go('s-c-settings');
  } catch (e) {
    showBusy(false);
    document.getElementById('cp-err').textContent = e.message || 'ERROR';
  }
}

// ── Delete account ────────────────────────────────────────────────────────
async function doDeleteAccount() {
  showConfirm('DELETE YOUR ACCOUNT? THIS CANNOT BE UNDONE.', async () => {
    showBusy(true);
    try {
      await callEdge('nook-customer', { action: 'deleteAccount', customerId: currentCustomer.id });
      showBusy(false);
      currentCustomer = null;
      go('s-welcome');
      showToast('ACCOUNT DELETED', 'info');
    } catch (e) {
      showBusy(false);
      showToast(e.message || 'ERROR', 'err');
    }
  });
}
