/* js/supabase.js: Supabase connect + products load + order save */

/* IMPORTANT: the URL must be ONLY the project address. Do NOT add /rest/v1 at the end,
   the Supabase library adds that part by itself. */
var SUPABASE_URL = 'https://bhhqaarbhpslpwsfmxdl.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_xFUgjtsBKKC5zYc4s1bRzg_FjfllZEJ';
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.TRIB_SB = sb;   /* customer-auth.js uses this same client, so login is shared with order saving */

/* ---------- 1) Products load ----------
   Products you add in the admin panel (Products & Categories) are read from the "products" table.
   Hidden products are skipped. If the table is empty, the built-in list in js/data.js is used. */
function toList(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v.trim()) return v.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  return [];
}
function mapProduct(r, i) {
  var sizes = toList(r.sizes), colors = toList(r.colors);
  return {
    id: r.id,
    name: r.name,
    price: Number(r.price) || 0,
    stock: Number(r.stock) || 0,
    sizes: sizes.length ? sizes : ['One size'],
    colors: colors.length ? colors : ['Black'],
    tags: toList(r.tags),
    tex: Number(r.tex) || ((i % 5) + 1),
    img: r.img || '',
    imgBack: r.img_back || '',
    desc: r.description || '',
    colorHex: (r.color_hex && typeof r.color_hex === 'object') ? r.color_hex : {}
  };
}
async function loadProducts() {
  try {
    var res = await sb.from('products').select('*').order('id');
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) {            /* table is empty: keep the built-in list */
      try { localStorage.removeItem(PRODUCT_CACHE_KEY); } catch (e) {}
      return;
    }

    var rows = res.data.filter(function (r) { return r.active !== false; }).map(mapProduct);
    setProducts(rows);
    try { localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(rows)); } catch (e) {}

    /* remove cart lines whose product is gone */
    if (typeof cart !== 'undefined') {
      var keep = cart.filter(function (l) { return PRODUCTS.some(function (p) { return p.id === l.id; }); });
      if (keep.length !== cart.length) { cart = keep; if (typeof saveCart === 'function') saveCart(); }
    }
    if (typeof updateCartUI === 'function') updateCartUI();

    /* shop, category counts and the home carousel redraw themselves on this event */
    window.dispatchEvent(new Event('products-ready'));
    /* the product page redraws on hashchange */
    if (/^#\/product\//.test(location.hash)) window.dispatchEvent(new Event('hashchange'));
  } catch (err) {
    console.error('Supabase products error:', err);   /* on error the site keeps the products it already has */
  }
}

/* ---------- 2) Order save ----------
   Works both ways:
     placeOrder({name, phone, address}, cartItems, total)
     placeOrder({name, phone, email, area, district, address, note, payment, trx_id,
                 order_no, subtotal, discount, shipping}, cartItems, total)
   Guest orders save with user_id = null. If the customer is signed in, the order is
   linked to their account so it shows in their "Recent orders".
   Returns { ok:true } or { ok:false, error:'...' } */
async function placeOrder(customer, items, total) {
  var c = customer || {};
  function v(x) { return (x === undefined || x === '') ? null : x; }

  var uid = null;
  try {
    var s = await sb.auth.getSession();
    uid = (s && s.data && s.data.session && s.data.session.user && s.data.session.user.id) || null;
  } catch (e) { uid = null; }   /* if anything goes wrong, just order as a guest */

  var row = {
    order_no: v(c.order_no),
    user_id: uid,
    name: c.name,
    phone: c.phone,
    email: v(c.email),
    area: v(c.area),
    district: v(c.district),
    address: c.address,
    note: v(c.note),
    payment: v(c.payment),
    trx_id: v(c.trx_id),
    items: items || [],
    subtotal: v(c.subtotal),
    discount: v(c.discount),
    shipping: v(c.shipping),
    total: total
  };
  var res = await sb.from('orders').insert(row);
  if (res.error) {
    console.error('Order error:', res.error);
    return { ok: false, error: res.error.message };
  }
  return { ok: true };
}

/* ---------- start ---------- */
loadProducts();