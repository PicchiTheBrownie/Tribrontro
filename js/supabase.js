/* js/supabase.js: Supabase connect + products load + order save */

/* IMPORTANT: the URL must be ONLY the project address. Do NOT add /rest/v1 at the end,
   the Supabase library adds that part by itself. */
var SUPABASE_URL = 'https://bhhqaarbhpslpwsfmxdl.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_xFUgjtsBKKC5zYc4s1bRzg_FjfllZEJ';
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.TRIB_SB = sb;   /* customer-auth.js uses this same client, so login is shared with order saving */

/* ---------- 1) Products load ---------- */
async function loadProducts() {
  try {
    var res = await sb.from('products').select('*').order('id');
    if (res.error) throw res.error;
    if (!res.data || !res.data.length) return;   /* table faka hole purano hardcoded list e thakbe */

    var rows = res.data.map(function (r) {
      return {
        id: r.id,
        name: r.name,
        price: r.price,
        stock: r.stock,
        sizes: r.sizes || [],
        colors: r.colors || [],
        tags: r.tags || [],
        tex: r.tex,
        img: r.img,
        imgBack: r.img_back,
        desc: r.description
      };
    });

    /* PRODUCTS array ta jekhane-i define kora thak, tar bhitore data bosiye dey */
    if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) {
      PRODUCTS.length = 0;
      rows.forEach(function (r) { PRODUCTS.push(r); });
    } else {
      window.PRODUCTS = rows;
    }

    /* Router ke abar chalay, jate current page notun data diye re-render hoy */
    window.dispatchEvent(new Event('products-ready'));
    window.dispatchEvent(new Event('hashchange'));
  } catch (err) {
    console.error('Supabase products error:', err);   /* error hole site purano data diye cholbe */
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