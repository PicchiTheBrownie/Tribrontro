var SUPABASE_URL = 'https://bhhqaarbhpslpwsfmxdl.supabase.co/rest/v1/';
var SUPABASE_ANON_KEY = 'sb_publishable_xFUgjtsBKKC5zYc4s1bRzg_FjfllZEJ';
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/* js/supabase.js: Supabase connect + products load + order save */

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

/* ---------- 2) Order save ---------- */
/* Use: var r = await placeOrder({name:'..', phone:'..', address:'..'}, cartItems, total); */
async function placeOrder(customer, items, total) {
  var res = await sb.from('orders').insert({
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
    items: items,
    total: total
  });
  if (res.error) {
    console.error('Order error:', res.error);
    return { ok: false, error: res.error.message };
  }
  return { ok: true };
}

/* ---------- start ---------- */
loadProducts();