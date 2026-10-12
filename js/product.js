/* FILE: js/product.js
   Product detail page for the single-page site.
   Opens when the address is  #/product/<id>  (View Details button on a card).
   Load this AFTER router.js, cart.js and init.js.

   FRONT/BACK FLIP: give each product in PRODUCTS a back image:
     img: 'img/tee1-front.jpg', imgBack: 'img/tee1-back.jpg'
   or  images: ['front.jpg', 'back.jpg']                                  */
(function () {
  'use strict';

  /* The page container is created automatically if index.html does not have it */
  var host = document.getElementById('page-product');
  if (!host) {
    host = document.createElement('main');
    host.className = 'page';
    host.id = 'page-product';
    var cartPage = document.getElementById('page-cart');
    if (cartPage && cartPage.parentNode) cartPage.parentNode.insertBefore(host, cartPage);
    else document.body.appendChild(host);
  }

  /* ---------- SIZE CHART DATA ----------
     EDIT THESE NUMBERS to match your real garments. Values are in INCHES,
     measured flat: [chest, length]. */
  var SIZE_CHARTS = {
    regular:   { 'S':[38,27], 'M':[40,28], 'L':[42,29], 'XL':[44,30], '2XL':[46,31] },
    oversized: { 'S':[42,27], 'M':[44,28], 'L':[46,29], 'XL':[48,30], '2XL':[50,31] }
  };
  var SIZE_ALIAS = { 'XXL':'2XL' };

  /* ---------- styles ---------- */
  var css = `
  .pd{padding:120px 0 100px}
  .pd-crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:12.5px;color:var(--ink-soft,#A39887);margin-bottom:28px}
  .pd-crumbs a{color:var(--ink-soft,#A39887);text-decoration:none;transition:color .25s}
  .pd-crumbs a:hover{color:var(--orange-deep,#9B5BD6)}
  .pd-crumbs i{font-style:normal;opacity:.45}
  .pd-crumbs b{font-weight:500;color:var(--ink,#EFE8F3)}
  .pd-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(0,1fr);gap:64px;align-items:start}
  .pd-media{position:sticky;top:var(--pd-top,120px)}
  .pd-frame{position:relative;border-radius:30px;padding:10px;background:linear-gradient(160deg,rgba(126,43,181,.35),rgba(126,43,181,.05) 45%,rgba(255,255,255,.04));box-shadow:0 40px 80px -40px rgba(126,43,181,.55)}
  .pd-frame .tex{height:640px;border-radius:22px;margin:0;background-size:cover;background-position:center}
  .pd-frame .badge{top:26px;left:26px}
  .pd-info{padding-top:6px}
  .pd-eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--orange-deep,#9B5BD6)}
  .pd-info h1{font-family:var(--font-display,inherit);font-size:clamp(34px,4.4vw,56px);font-weight:500;line-height:1.04;margin:12px 0 18px;letter-spacing:-.01em}
  .pd-priceline{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
  .pd-price{font-size:28px;font-weight:600;color:var(--ink,#EFE8F3)}
  .pd-stock{font-size:11.5px;font-weight:600;letter-spacing:.06em;padding:6px 14px;border-radius:100px;border:1px solid var(--line,#2a2133);color:var(--ink-soft,#A39887)}
  .pd-stock.in{color:#4FD08D;border-color:rgba(79,208,141,.35);background:rgba(79,208,141,.07)}
  .pd-stock.low{color:#F6B34E;border-color:rgba(246,179,78,.4);background:rgba(246,179,78,.07)}
  .pd-stock.out{color:#E5575A;border-color:rgba(229,87,90,.4);background:rgba(229,87,90,.07)}
  .pd-desc{margin:20px 0 0;font-size:15px;line-height:1.8;color:var(--ink-soft,#A39887);max-width:520px}
  .pd-chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
  .pd-chips span{font-size:11.5px;padding:6px 14px;border-radius:100px;border:1px solid var(--line,#2a2133);color:var(--ink-soft,#A39887)}
  .pd-rule{height:1px;background:var(--line,#2a2133);margin:28px 0 0;border:0}
  .pd-block{margin-top:26px}
  .pd-label{display:flex;gap:10px;align-items:baseline;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;color:var(--ink-soft,#A39887);margin-bottom:13px}
  .pd-label b{color:var(--ink,#EFE8F3);letter-spacing:.03em;text-transform:none;font-size:13px;font-weight:600}
  .pd-swatches{display:flex;gap:14px;flex-wrap:wrap}
  .pd-swatch{width:38px;height:38px;border-radius:50%;border:1px solid rgba(239,232,243,.28);cursor:pointer;padding:0;transition:transform .2s,box-shadow .2s}
  .pd-swatch:hover{transform:scale(1.1)}
  .pd-swatch.on{box-shadow:0 0 0 3px #09060B,0 0 0 5px var(--orange,#7E2BB5)}
  .pd-sizes{display:flex;gap:10px;flex-wrap:wrap}
  .pd-size{min-width:56px;padding:12px 18px;border-radius:100px;border:1px solid var(--line,#2a2133);background:transparent;color:var(--ink,#EFE8F3);font-family:inherit;font-size:13.5px;font-weight:500;cursor:pointer;transition:.2s}
  .pd-size:hover{border-color:var(--orange,#7E2BB5)}
  .pd-size.on{background:var(--orange,#7E2BB5);border-color:var(--orange,#7E2BB5);color:#fff;box-shadow:0 10px 24px -12px var(--orange,#7E2BB5)}
  .pd-buy{display:grid;grid-template-columns:auto 1fr;gap:12px;margin-top:32px}
  .pd-qty{display:flex;align-items:center;border:1px solid var(--line,#2a2133);border-radius:100px;overflow:hidden}
  .pd-qty button{width:46px;height:54px;border:0;background:transparent;color:var(--ink,#EFE8F3);font-size:19px;cursor:pointer;transition:background .2s}
  .pd-qty button:hover{background:rgba(126,43,181,.2)}
  .pd-qty span{min-width:32px;text-align:center;font-size:15px;font-weight:600}
  .pd-buy .btn{width:100%;justify-content:center}
  .pd-buy .pd-now{grid-column:1/-1}
  .pd-buy .btn:disabled{opacity:.55;cursor:not-allowed}
  .pd-sub{grid-column:1/-1;display:flex;justify-content:space-between;font-size:13px;color:var(--ink-soft,#A39887)}
  .pd-sub b{color:var(--ink,#EFE8F3);font-size:15px}
  .pd-wish{position:absolute;top:26px;right:26px;width:46px;height:46px;border-radius:50%;border:0;background:rgba(9,6,11,.85);color:var(--ink,#EFE8F3);font-size:19px;cursor:pointer;box-shadow:0 10px 24px -10px rgba(0,0,0,.9);transition:.25s;z-index:3}
  .pd-wish:hover,.pd-wish.on{background:var(--orange,#7E2BB5);color:#fff}
  .pd-perks{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:32px}
  .pd-perk{padding:16px 14px;border:1px solid var(--line,#2a2133);border-radius:18px;background:linear-gradient(160deg,#120A1A,#09060C);text-align:center}
  .pd-perk svg{width:24px;height:24px;stroke:var(--orange-deep,#9B5BD6);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;margin-bottom:8px}
  .pd-perk b{display:block;font-size:12.5px;font-weight:600;margin-bottom:3px}
  .pd-perk small{display:block;font-size:11.5px;line-height:1.45;color:var(--ink-soft,#A39887)}
  .pd-acc{margin-top:28px;border-top:1px solid var(--line,#2a2133)}
  .pd-acc details{border-bottom:1px solid var(--line,#2a2133)}
  .pd-acc summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:18px 2px;font-size:13.5px;font-weight:600;letter-spacing:.04em}
  .pd-acc summary::-webkit-details-marker{display:none}
  .pd-acc summary::after{content:'+';font-size:20px;font-weight:400;color:var(--orange-deep,#9B5BD6);transition:transform .25s}
  .pd-acc details[open] summary::after{content:'−'}
  .pd-acc p{margin:0 0 18px;padding:0 2px;font-size:13.5px;line-height:1.75;color:var(--ink-soft,#A39887)}
  .pd-chart{margin-top:96px}
  .pd-chart-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:28px;flex-wrap:wrap}
  .pd-chart-head h2{font-family:var(--font-display,inherit);font-size:36px;font-weight:500;margin:6px 0 0;line-height:1}
  .pd-unit{display:flex;border:1px solid var(--line,#2a2133);border-radius:100px;padding:4px;background:rgba(255,255,255,.02)}
  .pd-unit button{border:0;background:transparent;color:var(--ink-soft,#A39887);font-family:inherit;font-size:11.5px;font-weight:600;letter-spacing:.12em;padding:9px 20px;border-radius:100px;cursor:pointer;transition:.2s}
  .pd-unit button.on{background:var(--orange,#7E2BB5);color:#fff;box-shadow:0 8px 20px -10px var(--orange,#7E2BB5)}
  .pd-chart-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:28px;align-items:stretch}
  .pd-spot{padding:26px 26px 24px;border-radius:28px;border:1px solid rgba(126,43,181,.35);background:radial-gradient(120% 80% at 0% 0%,rgba(126,43,181,.3),transparent 62%),linear-gradient(160deg,#150C1F,#09060C);box-shadow:0 34px 64px -42px rgba(126,43,181,.75)}
  .pd-spot-top{display:flex;justify-content:space-between;align-items:baseline}
  .pd-spot-top span{font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;color:var(--ink-soft,#A39887)}
  .pd-spot-top b{font-family:var(--font-display,inherit);font-size:52px;font-weight:500;line-height:1;color:var(--ink,#EFE8F3)}
  .pd-tee{width:100%;max-width:270px;height:auto;display:block;margin:10px auto 22px;overflow:visible}
  .tee-body{fill:rgba(126,43,181,.12);stroke:rgba(181,138,208,.6);stroke-width:1.6;stroke-linejoin:round}
  .tee-dim line{stroke:var(--orange-deep,#9B5BD6);stroke-width:1.5;stroke-linecap:round}
  .tee-dim circle{fill:var(--orange,#7E2BB5)}
  .tee-dim text{fill:#fff;font-size:10px;font-weight:700;font-family:inherit;text-anchor:middle;dominant-baseline:central}
  .pd-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
  .pd-stat{padding:14px 8px 12px;border-radius:18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);text-align:center}
  .pd-stat i,.pd-table th i{font-style:normal;display:inline-flex;width:20px;height:20px;border-radius:50%;background:var(--orange,#7E2BB5);color:#fff;font-size:10.5px;font-weight:700;align-items:center;justify-content:center;letter-spacing:0}
  .pd-stat small{display:block;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft,#A39887);margin:8px 0 3px}
  .pd-stat b{font-size:22px;font-weight:600;color:var(--ink,#EFE8F3)}
  .pd-stat em{font-style:normal;font-size:11px;font-weight:500;color:var(--ink-soft,#A39887);margin-left:3px}
  .pd-tablewrap{overflow-x:auto}
  .pd-table{width:100%;border-collapse:separate;border-spacing:0 9px;min-width:380px;font-size:15px;margin-top:-9px}
  .pd-table th{padding:0 18px 4px;text-align:left;font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--ink-soft,#A39887);white-space:nowrap}
  .pd-table th i{margin-right:8px;width:18px;height:18px;font-size:10px}
  .pd-table td{padding:16px 18px;background:rgba(255,255,255,.035);border-top:1px solid transparent;border-bottom:1px solid transparent;color:var(--ink,#EFE8F3);transition:background .2s,border-color .2s}
  .pd-table td:first-child{border-radius:18px 0 0 18px;border-left:1px solid transparent}
  .pd-table td:last-child{border-radius:0 18px 18px 0;border-right:1px solid transparent}
  .pd-table tbody tr{cursor:pointer}
  .pd-table tbody tr:hover td{background:rgba(126,43,181,.1)}
  .pd-table tbody tr.on td{background:rgba(126,43,181,.24);border-color:rgba(155,91,214,.55)}
  .pd-sz{display:inline-flex;align-items:center;justify-content:center;min-width:44px;height:30px;padding:0 12px;border-radius:100px;border:1px solid var(--line,#2a2133);font-size:13px;font-weight:600}
  .pd-table tr.on .pd-sz{background:var(--orange,#7E2BB5);border-color:var(--orange,#7E2BB5);color:#fff}
  .pd-chart-note{margin:14px 4px 0;font-size:13px;line-height:1.7;color:var(--ink-soft,#A39887)}
  .pd-rel{margin-top:100px}
  .pd-rel-head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:26px}
  .pd-rel-head h2{font-family:var(--font-display,inherit);font-size:32px;font-weight:500;margin:0}
  .pd-rel-head a{font-size:13px;font-weight:600;color:var(--orange-deep,#9B5BD6);text-decoration:none}
  .pd-rel .grid{padding-bottom:0}
  .pd-404{text-align:center;padding:110px 20px 160px;color:var(--ink-soft,#A39887)}
  .pd-404 h1{font-size:34px;color:var(--ink,#EFE8F3);margin-bottom:12px}
  .pd-404 a{display:inline-block;margin-top:22px;padding:13px 28px;border-radius:100px;background:var(--orange,#7E2BB5);color:#fff;text-decoration:none;font-size:12.5px;font-weight:600;letter-spacing:.08em}
  @media (max-width:980px){.pd-chart-grid{grid-template-columns:1fr}.pd-grid{grid-template-columns:1fr;gap:34px}.pd-media{position:static}.pd-frame .tex{height:520px}}
  @media (max-width:560px){.pd{padding-top:100px}.pd-frame{padding:6px;border-radius:24px}.pd-frame .tex{height:400px;border-radius:19px}.pd-frame .badge,.pd-wish{top:18px}.pd-frame .badge{left:18px}.pd-wish{right:18px}.pd-perks{grid-template-columns:1fr}.pd-perk{display:flex;align-items:center;gap:14px;text-align:left}.pd-perk svg{margin:0;flex:none}.pd-buy{grid-template-columns:1fr}.pd-qty{justify-content:center}}

  /* ----- front / back flip ----- */
  .pd-flip{perspective:1600px;cursor:pointer;outline:0}
  .pd-flip-in{position:relative;height:640px;transform-style:preserve-3d;transition:transform .75s cubic-bezier(.2,.8,.2,1)}
  .pd-flip.back .pd-flip-in{transform:rotateY(180deg)}
  .pd-frame .pd-face{position:absolute;inset:0;height:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center}
  .pd-frame .pd-face.bk{transform:rotateY(180deg)}
  .pd-soon{font-style:normal;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.7);background:rgba(9,6,11,.6);padding:8px 16px;border-radius:100px}
  .pd-flip:focus-visible .pd-face{box-shadow:0 0 0 3px var(--orange,#7E2BB5)}
  .pd-views{position:absolute;left:50%;bottom:26px;transform:translateX(-50%);display:flex;gap:4px;padding:4px;border-radius:100px;background:rgba(9,6,11,.85);box-shadow:0 10px 24px -10px rgba(0,0,0,.9);z-index:3}
  .pd-views button{border:0;background:transparent;color:var(--ink-soft,#A39887);font-family:inherit;font-size:11px;font-weight:600;letter-spacing:.12em;padding:9px 18px;border-radius:100px;cursor:pointer;transition:.2s}
  .pd-views button.on{background:var(--orange,#7E2BB5);color:#fff}
  @media (max-width:980px){.pd-flip-in{height:520px}}
  @media (max-width:560px){.pd-flip-in{height:400px}.pd-views{bottom:18px}}
  `;
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- helpers ---------- */
  var baseTitle = document.title;
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function money(n){ return '৳' + Number(n).toLocaleString('en-US'); }
  function pretty(tag){ return String(tag).replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function colorHex(c){ return (typeof COLORS !== 'undefined' && COLORS[c]) || '#ccc'; }
  function getList(){ return (typeof PRODUCTS !== 'undefined') ? PRODUCTS : []; }
  function freeShip(){ return (typeof FREE_SHIP !== 'undefined') ? FREE_SHIP : 1500; }
  function shipFee(){ return (typeof SHIP_FEE !== 'undefined') ? SHIP_FEE : 80; }

  var ICON = {
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    swap:  '<svg viewBox="0 0 24 24"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>',
    wallet:'<svg viewBox="0 0 24 24"><path d="M3 7h16a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l2-3h12M16 13h3"/></svg>'
  };

  /* ---------- render one product ---------- */
  function render(id){
    var list = getList();
    var p = list.filter(function (x) { return String(x.id) === String(id); })[0];

    if (!p) {
      document.title = 'Product not found — TRIBRONTRO';
      host.innerHTML = '<div class="wrap"><div class="pd-404"><h1>Product not found</h1>' +
        '<p>Ei product ta khuje pawa jayni ba ar nai.</p><a href="#/shop">BACK TO SHOP</a></div></div>';
      return;
    }

    document.title = p.name + ' — TRIBRONTRO';

    var out = p.stock === 0;
    var sizes = p.sizes || [];
    var colors = p.colors || [];
    var tags = p.tags || [];
    var maxQty = out ? 0 : Math.max(1, Math.min(p.stock || 10, 10));
    var state = { size: sizes.indexOf('M') > -1 ? 'M' : (sizes[0] || ''), color: colors[0] || '', qty: 1 };

    var wishlist = new Set();
    try { wishlist = new Set(JSON.parse(localStorage.getItem('tb_wish') || '[]')); } catch (err) {}
    var wished = wishlist.has(p.id);

    /* front / back images */
    var frontImg = p.img || (p.images && p.images[0]) || '';
    var backImg  = p.imgBack || (p.images && p.images[1]) || '';
    function faceStyle(src){ return src ? ' style="background-image:url(\'' + esc(src) + '\')"' : ''; }

    var badge = out ? 'Sold out' : tags.indexOf('limited-drop') > -1 ? 'Limited' : tags.indexOf('new-arrivals') > -1 ? 'New' : '';
    var stockHTML = out ? '<span class="pd-stock out">SOLD OUT</span>'
      : (p.stock && p.stock <= 5) ? '<span class="pd-stock low">ONLY ' + p.stock + ' LEFT</span>'
      : '<span class="pd-stock in">IN STOCK</span>';

    var cats = (typeof CATEGORIES !== 'undefined') ? CATEGORIES : [];
    var catTag = tags.filter(function (t) { return cats.some(function (c) { return c.id === t; }) && t !== 'all'; })[0] || '';
    var catObj = cats.filter(function (c) { return c.id === catTag; })[0];
    var mainTag = catTag || tags[0] || '';
    var desc = p.desc || p.description || '';

    var related = list.filter(function (x) {
      return String(x.id) !== String(p.id) && x.tags && x.tags.some(function (t) { return tags.indexOf(t) > -1; });
    }).slice(0, 4);
    if (related.length < 4) {
      list.forEach(function (x) {
        if (related.length < 4 && String(x.id) !== String(p.id) && related.indexOf(x) < 0) related.push(x);
      });
    }
    var relGrid = related.map(function (x) {
      if (typeof cardHTML === 'function') return cardHTML(x, true);
      return '<a href="#/product/' + encodeURIComponent(x.id) + '">' + esc(x.name) + '</a>';
    }).join('');

    var chartKey = tags.indexOf('oversized') > -1 ? 'oversized' : 'regular';
    var chartRows = sizes.map(function (sz) {
      var d = SIZE_CHARTS[chartKey][SIZE_ALIAS[sz] || sz];
      return d ? { size: sz, d: d } : null;
    }).filter(Boolean);
    var unit = 'in';
    function val(v){ return unit === 'cm' ? Math.round(v * 2.54) : v; }
    var TEE = '<svg class="pd-tee" viewBox="0 0 260 220" aria-hidden="true">' +
      '<path class="tee-body" d="M85 28 L60 34 L18 66 L40 96 L62 82 L62 196 L178 196 L178 82 L200 96 L222 66 L180 34 L155 28 Q120 52 85 28 Z"/>' +
      '<g class="tee-dim">' +
        '<line x1="62" y1="112" x2="178" y2="112"/><line x1="62" y1="107" x2="62" y2="117"/><line x1="178" y1="107" x2="178" y2="117"/>' +
        '<line x1="240" y1="28" x2="240" y2="196"/><line x1="235" y1="28" x2="245" y2="28"/><line x1="235" y1="196" x2="245" y2="196"/>' +
        '<circle cx="120" cy="112" r="9"/><text x="120" y="112">A</text>' +
        '<circle cx="240" cy="112" r="9"/><text x="240" y="112">B</text>' +
      '</g></svg>';
    var chartHTML = !chartRows.length ? '' :
      '<section class="pd-chart"><div class="pd-chart-head"><div><div class="pd-eyebrow">Fit guide</div><h2>Size chart</h2></div>' +
        '<div class="pd-unit" id="pdUnit"><button type="button" class="on" data-u="in">IN</button><button type="button" data-u="cm">CM</button></div></div>' +
        '<div class="pd-chart-grid">' +
          '<div class="pd-spot"><div class="pd-spot-top"><span>Your size</span><b id="pdSpotSize">' + esc(state.size || chartRows[0].size) + '</b></div>' + TEE +
            '<div class="pd-stats">' +
              '<div class="pd-stat"><i>A</i><small>Chest</small><b><span id="pdSpotA"></span><em>in</em></b></div>' +
              '<div class="pd-stat"><i>B</i><small>Length</small><b><span id="pdSpotB"></span><em>in</em></b></div>' +
            '</div></div>' +
          '<div><div class="pd-tablewrap"><table class="pd-table"><thead><tr><th>Size</th><th><i>A</i>Chest</th><th><i>B</i>Length</th></tr></thead><tbody id="pdChart">' +
          chartRows.map(function (r) {
            return '<tr data-size="' + esc(r.size) + '"><td><span class="pd-sz">' + esc(r.size) + '</span></td>' +
              r.d.map(function (v) { return '<td data-in="' + v + '">' + v + '</td>'; }).join('') + '</tr>';
          }).join('') +
          '</tbody></table></div>' +
          '<p class="pd-chart-note">Measurements are of the garment, laid flat. ' +
            (chartKey === 'oversized' ? 'This piece is cut boxy and oversized, so take your usual size. ' : 'Between sizes? Go one up for a relaxed fit. ') +
            'Fit can vary slightly between pieces.</p></div>' +
        '</div></section>';

    function paintChart(){
      var rows = document.querySelectorAll('#pdChart tr');
      for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('on', rows[i].getAttribute('data-size') === state.size);
      document.querySelectorAll('#pdChart td[data-in]').forEach(function (td) {
        td.textContent = val(Number(td.getAttribute('data-in')));
      });
      var row = chartRows.filter(function (r) { return r.size === state.size; })[0] || chartRows[0];
      if (!row) return;
      var ids = ['pdSpotA', 'pdSpotB'];
      for (var k = 0; k < 2; k++) { var el = document.getElementById(ids[k]); if (el) el.textContent = val(row.d[k]); }
      var sz = document.getElementById('pdSpotSize'); if (sz) sz.textContent = row.size;
      document.querySelectorAll('.pd-stat em').forEach(function (e) { e.textContent = unit; });
    }

    var buyHTML = out
      ? '<div class="pd-buy"><button class="btn btn-outline pd-now" type="button" disabled><span>SOLD OUT</span></button></div>'
      : '<div class="pd-buy">' +
          '<div class="pd-qty"><button type="button" id="pdMinus" aria-label="Less">−</button><span id="pdQty">1</span><button type="button" id="pdPlus" aria-label="More">+</button></div>' +
          '<button class="btn btn-solid" type="button" id="pdAdd"><span>ADD TO CART</span></button>' +
          '<button class="btn btn-outline pd-now" type="button" id="pdBuy"><span>BUY NOW</span></button>' +
          '<div class="pd-sub"><span>Total</span><b id="pdTotal">' + money(p.price) + '</b></div>' +
        '</div>';

    host.innerHTML =
    '<div class="wrap"><div class="pd">' +
      '<nav class="pd-crumbs"><a href="#/home">Home</a><i>/</i><a href="#/shop">Shop</a><i>/</i>' +
        (catObj ? '<a href="#/shop/' + esc(catObj.id) + '">' + esc(catObj.label) + '</a><i>/</i>' : '') +
        '<b>' + esc(p.name) + '</b></nav>' +
      '<div class="pd-grid">' +
        '<div class="pd-media"><div class="pd-frame">' +
          '<div class="pd-flip" id="pdFlip" tabindex="0" role="button" aria-label="Flip to see front or back">' +
            '<div class="pd-flip-in">' +
              '<div class="tex tex-' + esc(p.tex) + ' pd-face"' + faceStyle(frontImg) + '></div>' +
              '<div class="tex tex-' + esc(p.tex) + ' pd-face bk"' + faceStyle(backImg) + '>' +
                (backImg ? '' : '<em class="pd-soon">Back view coming soon</em>') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="pd-views" id="pdViews"><button type="button" class="on" data-v="front">FRONT</button><button type="button" data-v="back">BACK</button></div>' +
          (badge ? '<span class="badge' + (out ? ' out' : '') + '">' + badge + '</span>' : '') +
          '<button type="button" id="pdWish" class="pd-wish' + (wished ? ' on' : '') + '" aria-label="Wishlist">' + (wished ? '♥' : '♡') + '</button>' +
        '</div></div>' +
        '<div class="pd-info">' +
          (mainTag ? '<div class="pd-eyebrow">' + esc(catObj ? catObj.label : pretty(mainTag)) + '</div>' : '') +
          '<h1>' + esc(p.name) + '</h1>' +
          '<div class="pd-priceline"><span class="pd-price">' + money(p.price) + '</span>' + stockHTML + '</div>' +
          (desc ? '<p class="pd-desc">' + esc(desc) + '</p>' : '') +
          (tags.length ? '<div class="pd-chips">' + tags.map(function (t) { return '<span>' + esc(pretty(t)) + '</span>'; }).join('') + '</div>' : '') +
          '<hr class="pd-rule">' +
          (colors.length ? '<div class="pd-block"><div class="pd-label">Color <b id="pdColorName">' + esc(state.color) + '</b></div><div class="pd-swatches" id="pdColors">' +
            colors.map(function (c) {
              return '<button type="button" class="pd-swatch' + (c === state.color ? ' on' : '') + '" data-color="' + esc(c) + '" title="' + esc(c) + '" aria-label="' + esc(c) + '" style="background:' + colorHex(c) + '"></button>';
            }).join('') + '</div></div>' : '') +
          (sizes.length ? '<div class="pd-block"><div class="pd-label">Size <b id="pdSizeName">' + esc(state.size) + '</b></div><div class="pd-sizes" id="pdSizes">' +
            sizes.map(function (s) {
              return '<button type="button" class="pd-size' + (s === state.size ? ' on' : '') + '" data-size="' + esc(s) + '">' + esc(s) + '</button>';
            }).join('') + '</div></div>' : '') +
          buyHTML +
          '<div class="pd-perks">' +
            '<div class="pd-perk">' + ICON.truck + '<div><b>Free delivery</b><small>On orders of ' + money(freeShip()) + ' or more</small></div></div>' +
            '<div class="pd-perk">' + ICON.swap + '<div><b>Easy exchange</b><small>Wrong size? Swap within 7 days</small></div></div>' +
            '<div class="pd-perk">' + ICON.wallet + '<div><b>Pay your way</b><small>Cash on delivery, bKash, Nagad</small></div></div>' +
          '</div>' +
          '<div class="pd-acc">' +
            '<details open><summary>Size help</summary><p>Between sizes? Go one up for a relaxed fit. Oversized pieces are cut boxy, so take your usual size.</p></details>' +
            '<details><summary>Delivery</summary><p>1–2 days inside Rajshahi and 3–5 days elsewhere in Bangladesh. Delivery is ' + money(shipFee()) + ' per order and free on orders of ' + money(freeShip()) + ' or more.</p></details>' +
            '<details><summary>Returns &amp; exchange</summary><p>Wrong size? You can swap it within 7 days of delivery. The piece must be unworn and unwashed, with tags attached. <a href="#/help/returns" style="color:var(--orange-deep,#9B5BD6)">Read the full policy</a>.</p></details>' +
          '</div>' +
        '</div>' +
      '</div>' +
      chartHTML +
      '<section class="pd-rel"><div class="pd-rel-head"><h2>You may also like</h2><a href="#/shop">View all →</a></div><div class="grid">' + relGrid + '</div></section>' +
    '</div></div>';

    /* ----- interactions ----- */
    function sync(){
      var q = document.getElementById('pdQty'); if (q) q.textContent = state.qty;
      var t = document.getElementById('pdTotal'); if (t) t.textContent = money(p.price * state.qty);
      var cn = document.getElementById('pdColorName'); if (cn) cn.textContent = state.color;
      var sn = document.getElementById('pdSizeName'); if (sn) sn.textContent = state.size;
      paintChart();
    }

    var colorBox = document.getElementById('pdColors');
    if (colorBox) colorBox.addEventListener('click', function (e) {
      var b = e.target.closest('.pd-swatch'); if (!b) return;
      colorBox.querySelectorAll('.pd-swatch').forEach(function (x) { x.classList.toggle('on', x === b); });
      state.color = b.getAttribute('data-color'); sync();
    });

    var sizeBox = document.getElementById('pdSizes');
    if (sizeBox) sizeBox.addEventListener('click', function (e) {
      var b = e.target.closest('.pd-size'); if (!b) return;
      sizeBox.querySelectorAll('.pd-size').forEach(function (x) { x.classList.toggle('on', x === b); });
      state.size = b.getAttribute('data-size'); sync();
    });

    var unitBox = document.getElementById('pdUnit');
    if (unitBox) unitBox.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      unit = b.getAttribute('data-u') === 'cm' ? 'cm' : 'in';
      unitBox.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      paintChart();
    });
    var chartBody = document.getElementById('pdChart');
    if (chartBody) chartBody.addEventListener('click', function (e) {
      var tr = e.target.closest('tr'); if (!tr) return;
      var sz = tr.getAttribute('data-size');
      if (sizeBox) sizeBox.querySelectorAll('.pd-size').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-size') === sz); });
      state.size = sz; sync();
    });
    paintChart();

    var minus = document.getElementById('pdMinus'), plus = document.getElementById('pdPlus');
    if (minus) minus.addEventListener('click', function () { if (state.qty > 1) { state.qty--; sync(); } });
    if (plus)  plus.addEventListener('click',  function () { if (state.qty < maxQty) { state.qty++; sync(); } });

    function add(){
      return (typeof addToCart === 'function') ? addToCart(p.id, state.size, state.color, state.qty) : null;
    }
    var addBtn = document.getElementById('pdAdd');
    if (addBtn) addBtn.addEventListener('click', function () {
      var r = add();
      if (r && typeof showToast === 'function') showToast(esc(p.name) + (state.qty > 1 ? ' ×' + state.qty : '') + ' added to cart', true);
    });
    var buyBtn = document.getElementById('pdBuy');
    if (buyBtn) buyBtn.addEventListener('click', function () {
      if (add()) location.hash = '#/checkout';
    });

    /* front / back flip */
    var flip = document.getElementById('pdFlip'), views = document.getElementById('pdViews');
    function setSide(back){
      flip.classList.toggle('back', back);
      views.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', (b.getAttribute('data-v') === 'back') === back);
      });
    }
    flip.addEventListener('click', function () { setSide(!flip.classList.contains('back')); });
    flip.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSide(!flip.classList.contains('back')); }
    });
    views.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      setSide(b.getAttribute('data-v') === 'back');
    });

    var wishBtn = document.getElementById('pdWish');
    wishBtn.addEventListener('click', function () {
      if (wishlist.has(p.id)) wishlist.delete(p.id); else wishlist.add(p.id);
      var on = wishlist.has(p.id);
      wishBtn.classList.toggle('on', on);
      wishBtn.textContent = on ? '♥' : '♡';
      try { localStorage.setItem('tb_wish', JSON.stringify(Array.from(wishlist))); } catch (err) {}
    });
  }

  /* ---------- keep everything below the navbar ---------- */
  function fixTop(){
    try {
      var nav = document.querySelector('nav');
      var pd = host.querySelector('.pd');
      if (!nav || !pd) return;
      var need = Math.max(0, nav.getBoundingClientRect().bottom - host.getBoundingClientRect().top);
      pd.style.paddingTop = (need + 28) + 'px';
      pd.style.setProperty('--pd-top', (nav.offsetHeight + 24) + 'px');
    } catch (err) {}
  }
  window.addEventListener('resize', function () { if (shown) fixTop(); });

  /* ---------- route handling: #/product/<id> ---------- */
  var shown = false;
  function route(){
    var m = location.hash.match(/^#\/product\/([^\/?#]+)/);
    if (m) {
      document.querySelectorAll('.page').forEach(function (pg) { pg.classList.toggle('active', pg === host); });
      try {
        render(decodeURIComponent(m[1]));
      } catch (err) {
        console.error(err);
        host.innerHTML = '<div class="wrap"><div class="pd-404"><h1>Something went wrong</h1><p>' + esc(err && err.message) + '</p><a href="#/shop">BACK TO SHOP</a></div></div>';
      }
      window.scrollTo(0, 0);
      shown = true;
      fixTop();
      requestAnimationFrame(fixTop);
    } else if (shown) {
      host.innerHTML = '';
      document.title = baseTitle;
      shown = false;
    }
  }
  window.addEventListener('hashchange', route);
  route();
})();