/* FILE: js/cart.js
   Cart: add/remove, totals, promo codes, free delivery, toast popup */
const FREE_SHIP = 1500, SHIP_FEE = 80, MAX_QTY = 10;
const PROMOS = { TRIBE10:{ type:'pct', v:10, label:'10% off' }, WELCOME100:{ type:'flat', v:100, label:'৳100 off' } };
const PAYMENTS = ['Cash on Delivery','bKash','Nagad'];
let cart = [], promo = null, cartNote = '';
try {
  cart = (JSON.parse(localStorage.getItem('tb_cart') || '[]')).filter(i => PRODUCTS.some(p => p.id === i.id));
  promo = localStorage.getItem('tb_promo'); if (!PROMOS[promo]) promo = null;
  cartNote = localStorage.getItem('tb_note') || '';
} catch (err) {}
function saveCart(){ try { localStorage.setItem('tb_cart', JSON.stringify(cart)); localStorage.setItem('tb_promo', promo || ''); localStorage.setItem('tb_note', cartNote); } catch (err) {} }
const prod = id => PRODUCTS.find(p => p.id === id);
const maxQty = p => Math.max(1, Math.min(MAX_QTY, p.stock));
const cartQty = () => cart.reduce((n, i) => n + i.qty, 0);
function cartTotals(){
  const subtotal = cart.reduce((s, i) => s + prod(i.id).price * i.qty, 0);
  const pr = promo && PROMOS[promo];
  const discount = !pr ? 0 : pr.type === 'pct' ? Math.round(subtotal * pr.v / 100) : Math.min(pr.v, subtotal);
  const shipping = !cart.length || subtotal >= FREE_SHIP ? 0 : SHIP_FEE;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
/* qty is optional (defaults to 1), so every older call addToCart(id, size, color) still works */
function addToCart(id, size, color, qty){
  const p = prod(id); if (!p || p.stock === 0) return null;
  size  = size  || (p.sizes.includes('M') ? 'M' : p.sizes[0]);
  color = color || p.colors[0];
  qty = Math.max(1, Math.floor(Number(qty)) || 1);
  let line = cart.find(i => i.id === id && i.size === size && i.color === color);
  if (line) line.qty = Math.min(line.qty + qty, maxQty(p)); else cart.push(line = { id, size, color, qty:Math.min(qty, maxQty(p)) });
  saveCart(); updateCartUI();
  return { p, size, color };
}
function updateCartUI(){
  document.querySelectorAll('[data-cart]').forEach(c => c.textContent = 'Cart (' + cartQty() + ')');
  renderCart();
}
let toastTimer;
function showToast(msg, withLink){
  const t = document.getElementById('toast');
  t.innerHTML = '<span>' + msg + '</span>' + (withLink ? '<a href="#/cart">VIEW CART</a>' : '');
  t.classList.toggle('has-link', !!withLink); t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
}
function lineHTML(i, idx){
  const p = prod(i.id), left = p.stock <= 5 ? '<div class="l-stock">Only ' + p.stock + ' left</div>' : '';
  const sizes = p.sizes.map(s => '<option' + (s === i.size ? ' selected' : '') + '>' + s + '</option>').join('');
  return '<div class="line" data-i="' + idx + '">' +
    '<a href="#/product/' + encodeURIComponent(p.id) + '"><div class="tex tex-' + p.tex + '"' + (p.img ? ' style="background-image:url(\'' + p.img + '\');background-size:cover"' : '') + '></div></a>' +
    '<div><span class="l-name">' + p.name + '</span>' +
      '<div class="l-meta"><span class="dot" style="background:' + (COLORS[i.color] || '#ccc') + '"></span>' + i.color + '<span class="sep">/</span>Size ' + i.size + '</div>' + left +
      '<div class="l-controls">' +
        '<div class="qty"><button data-act="dec" aria-label="Less">−</button><span>' + i.qty + '</span><button data-act="inc" aria-label="More"' + (i.qty >= maxQty(p) ? ' disabled' : '') + '>+</button></div>' +
        '<select class="size-sel" data-act="size" aria-label="Size">' + sizes + '</select>' +
        '<button class="link-btn" data-act="remove">Remove</button>' +
      '</div></div>' +
    '<div class="l-price"><b>' + fmt(p.price * i.qty) + '</b>' + (i.qty > 1 ? '<small>' + fmt(p.price) + ' each</small>' : '') + '</div>' +
  '</div>';
}
function renderCart(){
  const root = document.getElementById('cartRoot'); if (!root) return;
  const more = document.getElementById('cartMore');
  if (!cart.length) {
    root.innerHTML = '<div class="cart-empty"><div class="bag-art"></div><h2>Your cart is empty.</h2><p>Nothing here yet. Start with the pieces everyone is wearing this week.</p><a class="btn btn-solid" href="#/shop"><span>START SHOPPING</span></a></div>';
  } else {
    const t = cartTotals(), left = FREE_SHIP - t.subtotal, pct = Math.min(100, Math.round(t.subtotal / FREE_SHIP * 100));
    const pr = promo && PROMOS[promo];
    root.innerHTML = '<div class="cart-grid"><div>' +
      '<div class="ship-bar"><p>' + (t.subtotal >= FREE_SHIP ? '<b>✓ Free delivery unlocked.</b> Your order ships on us.' : 'Add <b>' + fmt(left) + '</b> more for free delivery.') + '</p><div class="bar"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="cart-top"><div class="eyebrow"><b>' + cartQty() + '</b> ' + (cartQty() === 1 ? 'item' : 'items') + ' in your cart</div><button class="link-btn" data-act="clear">Clear cart</button></div>' +
      cart.map(lineHTML).join('') +
      '<div class="line" style="grid-template-columns:1fr;padding-bottom:0"><a class="link-btn" href="#/shop" style="width:max-content">← Continue shopping</a></div>' +
    '</div>' +
    '<aside class="summary"><h3>Order summary</h3>' +
      '<div class="sum-row"><span>Subtotal</span><b>' + fmt(t.subtotal) + '</b></div>' +
      '<div class="sum-row"><span>Delivery</span><b>' + (t.shipping ? fmt(t.shipping) : 'Free') + '</b></div>' +
      '<div class="sum-row disc"><span>Discount' + (pr ? ' · ' + promo : '') + '</span><b>' + (t.discount ? '−' + fmt(t.discount) : '—') + '</b></div>' +
      '<div class="sum-total"><span>TOTAL</span><b>' + fmt(t.total) + '</b></div>' +
      '<div class="promo"><input id="promoIn" placeholder="Promo code" value="' + (promo || '') + '" autocomplete="off"><button data-act="promo">' + (promo ? 'REMOVE' : 'APPLY') + '</button></div>' +
      '<div class="promo-msg' + (pr ? ' ok' : '') + '" id="promoMsg">' + (pr ? '✓ ' + pr.label + ' applied' : 'Try TRIBE10 or WELCOME100') + '</div>' +
      '<textarea class="note-area" id="cartNote" placeholder="Order note (optional) — gift message, delivery instructions…">' + cartNote.replace(/</g, '&lt;') + '</textarea>' +
      '<div class="sum-actions"><button class="btn btn-solid" data-act="checkout"><span>CHECKOUT</span></button></div>' +
      '<div class="cart-pay">' + PAYMENTS.map(x => '<span>' + x + '</span>').join('') + '</div>' +
      '<div class="perks">' +
        '<div class="perk"><i>01</i><div><b>Delivery</b><br>1–2 days inside Dhaka, 3–5 days elsewhere. Free on orders of ' + fmt(FREE_SHIP) + ' or more, otherwise ' + fmt(SHIP_FEE) + '.</div></div>' +
        '<div class="perk"><i>02</i><div><b>Easy exchange</b><br>Wrong size? Swap it within 7 days of delivery.</div></div>' +
        '<div class="perk"><i>03</i><div><b>Pay your way</b><br>Cash on delivery, bKash, Nagad .</div></div>' +
      '</div>' +
    '</aside></div>';
  }
  if (more) {
    const inBag = new Set(cart.map(i => i.id));
    const picks = PRODUCTS.filter(p => !inBag.has(p.id) && p.stock > 0).slice(0, 4);
    more.innerHTML = '<h3>You may also like</h3><div class="grid">' + picks.map(p => cardHTML(p, true)).join('') + '</div>';
  }
}
(function(){
  const page = document.getElementById('page-cart');
  page.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'SELECT') return;
    const row = b.closest('.line'), i = row ? cart[Number(row.dataset.i)] : null, act = b.dataset.act;
    if (act === 'inc' && i) i.qty = Math.min(i.qty + 1, maxQty(prod(i.id)));
    else if (act === 'dec' && i) { i.qty--; if (i.qty < 1) cart.splice(cart.indexOf(i), 1); }
    else if (act === 'remove' && i) cart.splice(cart.indexOf(i), 1);
    else if (act === 'clear') { cart = []; promo = null; }
    else if (act === 'promo') {
      if (promo) promo = null;
      else {
        const code = document.getElementById('promoIn').value.trim().toUpperCase();
        if (PROMOS[code]) promo = code;
        else { const m = document.getElementById('promoMsg'); m.className = 'promo-msg err'; m.textContent = code ? 'That code isn’t valid.' : 'Enter a promo code first.'; return; }
      }
    }
    else if (act === 'checkout') { location.hash = '#/checkout'; return; }
    else return;
    saveCart(); updateCartUI();
  });
  page.addEventListener('change', e => {
    if (e.target.dataset.act !== 'size') return;
    const row = e.target.closest('.line'), i = cart[Number(row.dataset.i)], size = e.target.value;
    const twin = cart.find(x => x !== i && x.id === i.id && x.color === i.color && x.size === size);
    if (twin) { twin.qty = Math.min(twin.qty + i.qty, maxQty(prod(i.id))); cart.splice(cart.indexOf(i), 1); } else i.size = size;
    saveCart(); updateCartUI();
  });
  page.addEventListener('input', e => { if (e.target.id === 'cartNote') { cartNote = e.target.value; saveCart(); } });
})();