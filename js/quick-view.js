/* FILE: js/quick-view.js
   Quick view popup, size guide, shop search, back-to-top button */

/* ---------- Quick view, size guide, search, back-to-top ---------- */
(function(){
  /* SAMPLE size chart (inches). EDIT these numbers to match your real tees. */
  const SIZE_GUIDE = { XS:['36"','26"'], S:['38"','27"'], M:['40"','28"'], L:['42"','29"'], XL:['44"','30"'], XXL:['46"','31"'] };
  const back = document.getElementById('qvBack'), box = document.getElementById('qvBox');
  let qv = { id:null, size:null, color:null };

  function render(){
    const p = prod(qv.id), out = p.stock === 0, b = badgeFor(p);
    const sw = p.colors.map(c => '<button class="qv-sw' + (c === qv.color ? ' on' : '') + '" data-qv="color" data-v="' + c + '" title="' + c + '" aria-label="' + c + '" style="background:' + (COLORS[c] || '#ccc') + '"></button>').join('');
    const sz = p.sizes.map(x => '<button class="qv-sz' + (x === qv.size ? ' on' : '') + '" data-qv="size" data-v="' + x + '">' + x + '</button>').join('');
    const rows = p.sizes.filter(x => SIZE_GUIDE[x]).map(x => '<tr><td>' + x + '</td><td>' + SIZE_GUIDE[x][0] + '</td><td>' + SIZE_GUIDE[x][1] + '</td></tr>').join('');
    const btn = out ? 'SOLD OUT' : qv.size ? 'ADD TO CART · ' + fmt(p.price) : 'SELECT A SIZE';
    box.innerHTML =
      '<button class="qv-close" data-qv="close" aria-label="Close">✕</button>' +
      '<div class="tex tex-' + p.tex + '"' + (p.img ? ' style="background-image:url(\'' + p.img + '\')"' : '') + '></div>' +
      '<div class="qv-body">' +
        '<div class="eyebrow">' + (b || 'Tribrontro') + '</div>' +
        '<h3>' + p.name + '</h3><div class="qv-price">' + fmt(p.price) + '</div>' +
        '<p class="qv-note">Easy size exchange within 7 days of delivery. Pay by cash on delivery, bKash, Nagad or card.</p>' +
        '<div class="qv-label">Color<b>' + qv.color + '</b></div><div class="qv-opts">' + sw + '</div>' +
        '<div class="qv-label">Size<b>' + (qv.size || 'Choose one') + '</b></div><div class="qv-opts" id="qvSizes">' + sz + '</div>' +
        '<details class="qv-guide"><summary>Size guide ▾</summary><table><tr><th>Size</th><th>Chest</th><th>Length</th></tr>' + rows + '</table><small>Measurements are in inches, taken flat. Between sizes? Go one up for a relaxed fit.</small></details>' +
        '<details class="qv-guide"><summary>Fabric &amp; care ▾</summary><p class="qv-note" style="margin-top:8px">Cotton tee. Wash cold, inside out. Do not bleach. Dry in shade.</p></details>' +
        '<details class="qv-guide"><summary>Delivery &amp; exchange ▾</summary><p class="qv-note" style="margin-top:8px">1–2 days inside Dhaka, 3–5 days elsewhere. Free delivery on orders of ৳1,500 or more. Exchange within 7 days of delivery.</p></details>' +
        (!out && p.stock <= 5 ? '<div class="qv-stock">Only ' + p.stock + ' left</div>' : '') +
        '<button class="btn btn-solid qv-add" data-qv="add"' + (out ? ' disabled' : '') + '><span>' + btn + '</span></button>' +
      '</div>';
  }
  function open(id){
    const p = prod(id); if (!p) return;
    qv = { id:id, size:p.sizes.length === 1 ? p.sizes[0] : null, color:p.colors[0] };
    render(); back.classList.add('open'); document.body.style.overflow = 'hidden';
  }
  function close(){ back.classList.remove('open'); document.body.style.overflow = ''; }

  document.addEventListener('click', e => {
    const t = e.target.closest('.product .tex, .product .p-name');
    if (t) { const pr = t.closest('.product'); if (pr && pr.dataset.id) open(Number(pr.dataset.id)); }
  });
  back.addEventListener('click', e => {
    if (e.target === back) return close();
    const b = e.target.closest('[data-qv]'); if (!b) return;
    const a = b.dataset.qv;
    if (a === 'close') close();
    else if (a === 'color') { qv.color = b.dataset.v; render(); }
    else if (a === 'size') { qv.size = b.dataset.v; render(); }
    else if (a === 'add') {
      if (!qv.size) { const s = document.getElementById('qvSizes'); s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake'); return; }
      const r = addToCart(qv.id, qv.size, qv.color);
      if (r) { close(); showToast('<b>' + r.p.name + '</b><small>' + r.color + ' / ' + r.size + ' · added to cart</small>', true); }
    }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('hashchange', close);

  /* shop search */
  document.getElementById('shopSearch').addEventListener('input', e => { shop.q = e.target.value.trim().toLowerCase(); renderShop(); });

  /* back to top */
  const top = document.getElementById('toTop');
  addEventListener('scroll', () => top.classList.toggle('show', scrollY > 700), { passive:true });
  top.addEventListener('click', () => scrollTo({ top:0, behavior:'smooth' }));
})();
