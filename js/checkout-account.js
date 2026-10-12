/* FILE: js/checkout-account.js
   Checkout, order confirmation, My Account, Help page hooks */
(function(){
  const $ = id => document.getElementById(id);
  const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const db = {
    get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const TITLES = {
    home:'TRIBRONTRO — Dark thinking, worn in daylight', shop:'Shop — TRIBRONTRO', category:'Categories — TRIBRONTRO',
    cart:'Your cart — TRIBRONTRO', checkout:'Checkout — TRIBRONTRO', success:'Order placed — TRIBRONTRO',
    profile:'My account — TRIBRONTRO', help:'Help & policies — TRIBRONTRO'
  };
  const PAYNAME = { cod:'Cash on Delivery', bkash:'bKash', nagad:'Nagad' };

  /* ---- store settings -> links and text ---- */
  document.querySelectorAll('[data-wa]').forEach(a => a.href = 'https://wa.me/' + STORE.whatsapp);
  document.querySelectorAll('[data-mail]').forEach(a => a.href = 'mailto:' + STORE.email);
  document.querySelectorAll('[data-tel]').forEach(a => a.href = 'tel:' + STORE.phoneDisplay.replace(/[^+\d]/g, ''));
  document.querySelectorAll('[data-social]').forEach(a => a.href = STORE[a.dataset.social]);
  document.querySelectorAll('[data-store]').forEach(el => el.textContent = STORE[el.dataset.store] || '');

  const profile = () => db.get('tb_profile', {});

  /* ---- order summary rows (shared) ---- */
  function itemsHTML(items, removable){
    return items.map((i, n) => {
      const p = PRODUCTS.find(x => x.name === i.name) || { tex:1 };
      return '<div class="co-item"><div class="tex tex-' + p.tex + '"></div><div><b>' + esc(i.name) + '</b><small>' + esc(i.color) + ' / ' + esc(i.size) + ' × ' + i.qty + '</small>' + (removable ? '<button type="button" class="link-btn co-rm" data-rm="' + n + '" style="display:block;margin-top:6px">Remove</button>' : '') + '</div><span>' + fmt(i.price * i.qty) + '</span></div>';
    }).join('');
  }
  function totalsHTML(t, promoCode){
    return '<div class="sum-row"><span>Subtotal</span><b>' + fmt(t.subtotal) + '</b></div>' +
      '<div class="sum-row"><span>Delivery</span><b>' + (t.shipping ? fmt(t.shipping) : 'Free') + '</b></div>' +
      (t.discount ? '<div class="sum-row disc"><span>Discount' + (promoCode ? ' · ' + esc(promoCode) : '') + '</span><b>−' + fmt(t.discount) + '</b></div>' : '') +
      '<div class="sum-total"><span>TOTAL</span><b>' + fmt(t.total) + '</b></div>';
  }

  /* ================= CHECKOUT ================= */
  function payChoice(){ const r = document.querySelector('input[name="pay"]:checked'); return r ? r.value : 'cod'; }
  function renderPay(){
    const t = cartTotals(), cur = payChoice();
    const tick = '';   /* tick mark removed: the whole option is clickable, the selected one is highlighted by CSS */
    const L = STORE.logos || {};
    const logo = (k, fb) => L[k] ? '<img src="' + esc(L[k]) + '" alt="">' : fb;
    const wm = k => k === 'bkash' ? '<span class="wm wm-bkash"><b>b</b><span>Kash</span></span>' : '<span class="wm wm-nagad">Nagad</span>';
    const cashSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><g stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 6V5.4A1.9 1.9 0 0 1 7.1 3.5h9.8a1.9 1.9 0 0 1 1.9 1.9V6" opacity=".6"/><rect x="2.5" y="6" width="19" height="13" rx="3"/><circle cx="12" cy="12.5" r="2.7"/><path d="M6 10v.01M18 15v.01" stroke-width="2.3"/></g></svg>';
    const wallet = (key, name, num, ussd) =>
      '<div class="pm" data-m="' + key + '"><input type="radio" name="pay" id="pay-' + key + '" value="' + key + '"' + (cur === key ? ' checked' : '') + '>' +
      '<label class="pm-head" for="pay-' + key + '"><span class="pm-badge ' + key + (L[key] ? ' has-logo' : '') + '">' + logo(key, wm(key)) + '</span><span class="pm-t"><b>' + name + '</b><small>Send money · enter your TrxID</small></span><span class="pm-tag">Mobile wallet</span>' + tick + '</label>' +
      '<div class="pm-body"><ol class="pm-steps">' +
        '<li>Open the ' + name + ' app and tap <b>Send Money</b>. <span class="pm-alt">Or dial ' + ussd + '.</span></li>' +
        '<li>Enter our number<div class="copyrow"><b>' + esc(num) + '</b><button type="button" data-copy="' + esc(num) + '">COPY</button></div></li>' +
        '<li>Send exactly<div class="copyrow"><b>' + fmt(t.total) + '</b><button type="button" data-copy="' + t.total + '">COPY</button></div></li>' +
        '<li>Confirm with your PIN, then copy the <b>Transaction ID (TrxID)</b> from the confirmation message.</li>' +
        '<li>Paste it in the TrxID box below, then place your order.</li></ol>' +
        '</div></div>';
    const cod =
      '<div class="pm" data-m="cod"><input type="radio" name="pay" id="pay-cod" value="cod"' + (cur === 'cod' ? ' checked' : '') + '>' +
      '<label class="pm-head" for="pay-cod"><span class="pm-badge cod' + (L.cod ? ' has-logo' : '') + '">' + logo('cod', cashSvg) + '</span><span class="pm-t"><b>Cash on Delivery</b><small>Pay when it arrives</small></span><span class="pm-tag">Pay later</span>' + tick + '</label>' +
      '<div class="pm-body"><ol class="pm-steps">' +
        '<li>Place your order.</li>' +
        '<li>We confirm it with you by phone or WhatsApp.</li>' +
        '<li>Pay the delivery person in cash when your order arrives. Please keep <b>' + fmt(t.total) + '</b> ready.</li></ol></div></div>';
    const card =
      '<div class="pm off" data-m="card"><input type="radio" name="pay" id="pay-card" value="card" disabled>' +
      '<label class="pm-head" for="pay-card"><span class="pm-badge card"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><g stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="3.2"/><path d="M2.5 9.6h19"/><rect x="5.6" y="13" width="4.4" height="2.8" rx=".9"/><path d="M13.2 14.4h5.2"/></g></svg></span><span class="pm-t"><b>Card</b><small>Debit and credit cards</small></span><span class="pm-soon">COMING SOON</span></label></div>';
    $('coPay').innerHTML = cod + wallet('bkash', 'bKash', STORE.bkash, '*247#') + wallet('nagad', 'Nagad', STORE.nagad, '*167#') + card;
    syncTrx();
  }
  function syncTrx(){
    const m = payChoice(), box = $('coTrxBox'), inp = $('co-trx'), lab = $('coTrxLabel'), note = $('coTrxNote');
    if (!box) return;
    const wallet = m === 'bkash' || m === 'nagad';
    box.dataset.m = m;
    box.classList.toggle('off', !wallet);
    inp.disabled = !wallet;
    if (!wallet) { setErr('co-trx', ''); }
    lab.textContent = wallet ? (PAYNAME[m] + ' Transaction ID (TrxID) *') : 'Transaction ID (TrxID)';
    note.textContent = wallet
      ? 'Paste the TrxID from your ' + PAYNAME[m] + ' confirmation message. We match it with your payment before we dispatch your order.'
      : 'Only needed when you pay with bKash or Nagad.';
  }
  function renderCheckout(){
    const areaRadio = document.querySelector('input[name="area"][value="' + shipArea + '"]'); if (areaRadio) areaRadio.checked = true;
    const t = cartTotals(), pr = promo && PROMOS[promo];
    $('coSide').innerHTML = '<h3>Your order</h3>' +
      itemsHTML(cart.map(i => { const p = prod(i.id); return { name:p.name, color:i.color, size:i.size, qty:i.qty, price:p.price }; }), true) +
      '<div style="height:10px"></div>' + totalsHTML(t, pr ? promo : '') +
      '<a class="link-btn co-edit" href="#/cart">← Edit cart</a>';
    const f = $('coForm');
    if (!f.dataset.filled) {
      const p = profile();
      $('co-name').value = p.name || ''; $('co-phone').value = p.phone || ''; $('co-email').value = p.email || '';
      $('co-district').value = p.district || ''; $('co-address').value = p.address || ''; $('co-note').value = cartNote || '';
      f.dataset.filled = '1';
    }
    renderPay();
  }
  function setErr(id, msg){
    const wrap = $(id).closest('.field'); wrap.classList.toggle('bad', !!msg);
    const e = wrap.querySelector('.err'); if (e) e.textContent = msg || '';
    return !msg;
  }
  const normPhone = v => { let d = v.replace(/\D/g, ''); if (d.startsWith('880')) d = '0' + d.slice(3); return d; };
  function waMessage(o){
    const L = ['New order ' + o.id, '', 'Name: ' + o.name, 'Phone: ' + o.phone];
    if (o.email) L.push('Email: ' + o.email);
    L.push('Delivery: ' + o.area + ', ' + o.district, 'Address: ' + o.address, '', 'Items:');
    o.items.forEach((i, n) => L.push((n + 1) + '. ' + i.name + ' (' + i.color + ' / ' + i.size + ') x' + i.qty + ' = ' + fmt(i.price * i.qty)));
    L.push('', 'Subtotal: ' + fmt(o.totals.subtotal), 'Delivery: ' + (o.totals.shipping ? fmt(o.totals.shipping) : 'Free'));
    if (o.totals.discount) L.push('Discount: -' + fmt(o.totals.discount) + (o.promo ? ' (' + o.promo + ')' : ''));
    L.push('Total: ' + fmt(o.totals.total), 'Payment: ' + PAYNAME[o.pay] + (o.trx ? ' (TrxID: ' + o.trx + ')' : ''));
    if (o.note) L.push('Note: ' + o.note);
    return L.join('\n');
  }
  /* remove a piece from the order summary at checkout */
  $('coSide').addEventListener('click', e => {
    const b = e.target.closest('[data-rm]'); if (!b) return;
    const idx = Number(b.dataset.rm); if (!cart[idx]) return;
    cart.splice(idx, 1); saveCart(); updateCartUI();
    if (!cart.length) { showToast('Your cart is empty.', false); location.hash = '#/cart'; return; }
    renderCheckout();
  });
  $('coForm').addEventListener('change', e => {
    if (e.target.name === 'pay') syncTrx();
    if (e.target.name === 'area') { setShipArea(e.target.value); renderCheckout(); }   /* delivery charge changes with the area */
  });
  
  ;$('coForm').addEventListener('submit', async e => {
  e.preventDefault();
  console.log('SUBMIT HANDLER RUNNING');
  if (!cart.length) { location.hash = '#/cart'; return; }

  const name = $('co-name').value.trim(), phone = normPhone($('co-phone').value), email = $('co-email').value.trim();
  const district = $('co-district').value.trim(), address = $('co-address').value.trim(), pay = payChoice();
  const trxEl = $('co-trx'), trx = pay !== 'cod' && trxEl ? trxEl.value.trim() : '';
  const checks = [
    setErr('co-name', name.length < 2 ? 'Please enter your full name.' : ''),
    setErr('co-phone', /^01[3-9]\d{8}$/.test(phone) ? '' : 'Enter a valid mobile number, like 01XXXXXXXXX.'),
    setErr('co-email', email && !/^\S+@\S+\.\S+$/.test(email) ? 'That email does not look right.' : ''),
    setErr('co-district', district.length < 2 ? 'Please enter your district or area.' : ''),
    setErr('co-address', address.length < 8 ? 'Please enter your full address.' : '')
  ];
  if (pay !== 'cod') checks.push(setErr('co-trx', trx.length < 6 ? 'Enter the Transaction ID from your payment.' : ''));
  if (checks.includes(false)) {
    const bad = document.querySelector('#coForm .field.bad');
    if (bad) bad.scrollIntoView({ behavior:'smooth', block:'center' });
    showToast('Please fix the highlighted fields.', false); return;
  }

  const t = cartTotals();
  const d = new Date();
  const id = 'TB-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + (1000 + Math.floor(Math.random() * 9000));
  const order = {
    id, date:d.toISOString(), name, phone, email, district, address, pay, trx,
    area:(document.querySelector('input[name="area"]:checked') || {}).value || shipArea,
    note:$('co-note').value.trim(), promo:promo || '', totals:t,
    items:cart.map(i => { const p = prod(i.id); return { name:p.name, color:i.color, size:i.size, qty:i.qty, price:p.price }; })
  };

  /* ---- who is ordering? signed-in customers get the order linked to their account, guests get null ---- */
  let uid = (window.TribAuth && window.TribAuth.user && window.TribAuth.user.id) || null;
  if (!uid) {
    try {
      const s = await sb.auth.getSession();
      uid = (s && s.data && s.data.session && s.data.session.user && s.data.session.user.id) || null;
    } catch (err) { uid = null; }
  }

  /* ---- SUPABASE INSERT ---- */
  const btn = $('coForm').querySelector('[type="submit"]');
  if (btn) btn.disabled = true;
  try {
    if (typeof sb === 'undefined') throw new Error('Supabase client (sb) load hoyni');
    const { error } = await sb.from('orders').insert({
      order_no:   order.id,
      user_id:    uid,
      name:       order.name,
      phone:      order.phone,
      email:      order.email || null,
      district:   order.district,
      address:    order.address,
      area:       order.area,
      note:       order.note || null,
      pay_method: order.pay,
      trx_id:     order.trx || null,
      promo:      order.promo || null,
      subtotal:   order.totals.subtotal,
      shipping:   order.totals.shipping,
      discount:   order.totals.discount,
      total:      order.totals.total,
      items:      order.items
    });
    if (error) throw error;
  } catch (err) {
    console.error('SUPABASE ERROR:', err);
    showToast(err && err.code === '23505' ? 'Ei TrxID ager e use kora hoyeche.' : 'Error: ' + ((err && err.message) || 'order pathano jayni'), false);
    if (btn) btn.disabled = false;
    return;
  }
  if (btn) btn.disabled = false;

  /* ---- local save + success ---- */
  const all = db.get('tb_orders', []); all.unshift(order); db.set('tb_orders', all.slice(0, 20));
  db.set('tb_last', id);
  if ($('co-save').checked) db.set('tb_profile', { name, phone, email, district, address });
  cart = []; promo = null; cartNote = ''; saveCart(); updateCartUI();
  $('coForm').dataset.filled = '';
  location.hash = '#/success';
});

  /* ================= SUCCESS ================= */
  function renderSuccess(){
    const id = db.get('tb_last', null), o = db.get('tb_orders', []).find(x => x.id === id);
    if (!o) { location.hash = '#/home'; return; }
    const link = 'https://wa.me/' + STORE.whatsapp + '?text=' + encodeURIComponent(waMessage(o));
    $('successRoot').innerHTML =
      '<div class="ok-wrap"><div class="ok-badge">✓</div><h1>Thank you, <em>' + esc(o.name.split(' ')[0]) + '.</em></h1>' +
      '<div class="ok-id">ORDER ' + esc(o.id) + '</div>' +
      '<p>Your order is placed. <b style="color:var(--ink)">One last step:</b> tap the button below to send your order details to us on WhatsApp. We will then confirm by phone or WhatsApp and get it on its way.</p>' +
      '<div class="co-card ok-card">' + itemsHTML(o.items) + '<div style="height:8px"></div>' + totalsHTML(o.totals, o.promo) +
      '<div class="sum-row" style="margin-top:8px"><span>Payment</span><b>' + esc(PAYNAME[o.pay]) + (o.trx ? ' · ' + esc(o.trx) : '') + '</b></div>' +
      '<div class="sum-row"><span>Deliver to</span><b style="text-align:right;max-width:60%">' + esc(o.address) + ', ' + esc(o.district) + '</b></div></div>' +
      '<div class="ok-actions"><a class="btn btn-solid" href="' + link + '" target="_blank" rel="noopener"><span>SEND ORDER ON WHATSAPP</span></a>' +
      '<a class="btn btn-outline" href="#/shop"><span>CONTINUE SHOPPING</span></a></div></div>';
  }

  /* ================= ACCOUNT ================= */
  function renderOrders(){
    const list = db.get('tb_orders', []);
    if (!list.length) {
      $('acct-orders').innerHTML = '<div class="acct-empty"><h3>No orders yet.</h3><p>When you place an order, it will show up here.</p><a class="btn btn-solid" href="#/shop"><span>START SHOPPING</span></a></div>';
      return;
    }
    $('acct-orders').innerHTML = list.map(o => {
      const date = new Date(o.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
      const link = 'https://wa.me/' + STORE.whatsapp + '?text=' + encodeURIComponent(waMessage(o));
      return '<div class="ord"><div class="ord-top"><div><b>' + esc(o.id) + '</b><small>' + date + '</small></div><span class="status">Placed</span></div>' +
        o.items.map(i => '<div class="ord-line"><span>' + esc(i.name) + ' <small style="color:var(--ink-soft)">· ' + esc(i.color) + ' / ' + esc(i.size) + ' × ' + i.qty + '</small></span><span>' + fmt(i.price * i.qty) + '</span></div>').join('') +
        '<div class="ord-bot"><span>' + esc(PAYNAME[o.pay]) + ' · ' + esc(o.area) + '</span><b>' + fmt(o.totals.total) + '</b></div>' +
        '<div style="margin-top:14px"><a class="link-btn" href="' + link + '" target="_blank" rel="noopener">Message us about this order →</a></div></div>';
    }).join('');
  }
  function renderSaved(){
    const items = PRODUCTS.filter(p => wishlist.has(p.id));
    $('acct-saved').innerHTML = items.length
      ? '<div class="grid" style="padding-bottom:0">' + items.map(p => cardHTML(p, true)).join('') + '</div>'
      : '<div class="acct-empty"><h3>Nothing saved yet.</h3><p>Tap the heart on any piece to keep it here.</p><a class="btn btn-solid" href="#/shop"><span>BROWSE THE SHOP</span></a></div>';
  }
  function fillDetails(){
    const p = profile();
    $('pf-name').value = p.name || ''; $('pf-phone').value = p.phone || ''; $('pf-email').value = p.email || '';
    $('pf-district').value = p.district || ''; $('pf-address').value = p.address || '';
  }
  function renderAccount(){ renderOrders(); renderSaved(); fillDetails(); }
  document.querySelector('.acct-tabs').addEventListener('click', e => {
    const b = e.target.closest('[data-acct]'); if (!b) return;
    document.querySelectorAll('.acct-tabs .pill').forEach(x => x.classList.toggle('active', x === b));
    document.querySelectorAll('.acct-panel').forEach(p => p.hidden = p.id !== 'acct-' + b.dataset.acct);
  });
  $('pfForm').addEventListener('submit', e => {
    e.preventDefault();
    db.set('tb_profile', { name:$('pf-name').value.trim(), phone:normPhone($('pf-phone').value), email:$('pf-email').value.trim(), district:$('pf-district').value.trim(), address:$('pf-address').value.trim() });
    showToast('Your details are saved on this device.', false);
  });
  $('pfClear').addEventListener('click', () => {
    try { localStorage.removeItem('tb_profile'); } catch (err) {}
    fillDetails(); showToast('Saved details cleared.', false);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.wish')) setTimeout(() => { if ($('page-profile').classList.contains('active')) renderSaved(); }, 0);
  });

  /* ================= ROUTE HOOK ================= */
  window.onPage = function(page){
    document.title = TITLES[page] || TITLES.home;
    if (page === 'checkout') { if (!cart.length) { location.hash = '#/cart'; return; } renderCheckout(); }
    if (page === 'success') renderSuccess();
    if (page === 'profile') renderAccount();
  };
  window.onPage((location.hash.replace(/^#\/?/, '') || 'home').split('/')[0] || 'home');
})();