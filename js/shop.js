/* FILE: js/shop.js
   Shop page: product cards, filters, sorting, search hooks */
const fmt = n => '৳' + n.toLocaleString('en-US');
let wishlist = new Set();
try { wishlist = new Set(JSON.parse(localStorage.getItem('tb_wish') || '[]')); } catch (err) {}
const shop = { cat:'all', size:new Set(), color:new Set(), price:new Set(), avail:new Set(), sort:'featured', q:'' };

function badgeFor(p){
  if (p.stock === 0) return 'Sold out';
  if (p.tags.includes('limited-drop')) return 'Limited';
  if (p.tags.includes('new-arrivals')) return 'New';
  return '';
}
function cardHTML(p, mini){
  const b = badgeFor(p), out = p.stock === 0, on = wishlist.has(p.id);
  return '<div class="product' + (mini ? ' mini' : '') + '" data-id="' + p.id + '">' +
    '<div class="tex tex-' + p.tex + '"' + (p.img ? ' style="background-image:url(\'' + p.img + '\')"' : '') + '></div>' +
    '<span class="qv-hint">QUICK VIEW</span>' +
    (b ? '<span class="badge' + (out ? ' out' : '') + '">' + b + '</span>' : '') +
    '<button class="wish' + (on ? ' on' : '') + '" data-id="' + p.id + '" aria-label="Wishlist">' + (on ? '♥' : '♡') + '</button>' +
    '<div class="p-row"><span class="p-name">' + p.name + '</span><span class="p-price">' + fmt(p.price) + '</span></div>' +
    '<div class="p-colors">' + p.colors.map(c => '<span title="' + c + '" style="background:' + (COLORS[c] || '#ccc') + '"></span>').join('') + '</div>' +
    '<div class="p-actions">' +
      '<a class="view-details" href="#/product/' + encodeURIComponent(p.id) + '">VIEW DETAILS</a>' +
      '<button class="quick-add' + (out ? '' : ' js-add') + '" data-id="' + p.id + '"' + (out ? ' disabled' : '') + '>' + (out ? 'SOLD OUT' : 'ADD TO CART') + '</button>' +
    '</div>' +
  '</div>';
}
function filteredProducts(){
  const list = PRODUCTS.filter(p =>
    (shop.cat === 'all' || p.tags.includes(shop.cat)) &&
    (!shop.q || p.name.toLowerCase().includes(shop.q)) &&
    (!shop.size.size  || p.sizes.some(x => shop.size.has(x))) &&
    (!shop.color.size || p.colors.some(x => shop.color.has(x))) &&
    (!shop.price.size || [...shop.price].some(k => PRICE_RANGES[k].test(p.price))) &&
    (!shop.avail.size || (shop.avail.has('in') && p.stock > 0) || (shop.avail.has('out') && p.stock === 0))
  );
  if (shop.sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (shop.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (shop.sort === 'new')        list.sort((a, b) => b.tags.includes('new-arrivals') - a.tags.includes('new-arrivals'));
  return list;
}
function activeFilterCount(){ return shop.size.size + shop.color.size + shop.price.size + shop.avail.size + (shop.q ? 1 : 0); }
function renderShop(){
  document.getElementById('shopCats').innerHTML = CATEGORIES.map(c =>
    '<button class="pill' + (c.id === shop.cat ? ' active' : '') + '" data-cat="' + c.id + '">' + c.label + '</button>').join('');
  const list = filteredProducts();
  document.getElementById('shopGrid').innerHTML = list.map(p => cardHTML(p, false)).join('');
  document.getElementById('shopEmpty').classList.toggle('show', list.length === 0);
  document.getElementById('resultCount').textContent = list.length + (list.length === 1 ? ' piece' : ' pieces');
  const n = activeFilterCount();
  document.getElementById('filterToggle').textContent = 'Filters' + (n ? ' (' + n + ')' : '');
  document.getElementById('clearFilters').hidden = n === 0;
  document.querySelectorAll('#filterPanel .chip').forEach(ch => ch.classList.toggle('on', shop[ch.dataset.group].has(ch.dataset.val)));
}
function buildFilterPanel(){
  const sizes = SIZE_ORDER.filter(x => PRODUCTS.some(p => p.sizes.includes(x)));
  const colors = Object.keys(COLORS).filter(c => PRODUCTS.some(p => p.colors.includes(c)));
  const group = (title, group, items) => '<div class="fgroup"><h4>' + title + '</h4><div class="fchips">' +
    items.map(i => '<button class="chip" data-group="' + group + '" data-val="' + i.val + '">' + i.html + '</button>').join('') + '</div></div>';
  document.getElementById('filterPanel').innerHTML =
    group('Size', 'size', sizes.map(x => ({ val:x, html:x }))) +
    group('Color', 'color', colors.map(c => ({ val:c, html:'<span class="dot" style="background:' + COLORS[c] + '"></span>' + c }))) +
    group('Price', 'price', Object.keys(PRICE_RANGES).map(k => ({ val:k, html:PRICE_RANGES[k].label }))) +
    group('Availability', 'avail', [{ val:'in', html:'In stock' }, { val:'out', html:'Sold out' }]);
}
function setShopCat(id){ shop.cat = CATEGORIES.some(c => c.id === id) ? id : 'all'; renderShop(); }
function renderCategoryRails(){
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = PRODUCTS.filter(p => p.tags.includes(el.dataset.count)).length;
    el.textContent = n + (n === 1 ? ' piece' : ' pieces');
  });
}
buildFilterPanel(); renderShop(); renderCategoryRails();

document.getElementById('shopCats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) setShopCat(b.dataset.cat); });
document.getElementById('filterToggle').addEventListener('click', e => {
  const open = document.getElementById('filterPanel').classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', open);
});
document.getElementById('filterPanel').addEventListener('click', e => {
  const ch = e.target.closest('.chip'); if (!ch) return;
  const set = shop[ch.dataset.group];
  set.has(ch.dataset.val) ? set.delete(ch.dataset.val) : set.add(ch.dataset.val);
  renderShop();
});
document.getElementById('sortSel').addEventListener('change', e => { shop.sort = e.target.value; renderShop(); });
document.getElementById('clearFilters').addEventListener('click', () => { ['size','color','price','avail'].forEach(k => shop[k].clear()); shop.q = ''; document.getElementById('shopSearch').value = ''; renderShop(); });

/* "View Details" link: go straight to the product page, never open the Quick View popup.
   Capture phase so the card's popup click handler never sees this click. */
document.addEventListener('click', e => {
  if (e.target.closest('.view-details')) e.stopPropagation();
}, true);