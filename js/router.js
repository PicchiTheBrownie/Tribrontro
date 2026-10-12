/* FILE: js/router.js
   Page router (#/home, #/shop, #/product/ID ...) and mobile menu */
const PAGES = ['home','shop','category','profile','cart','checkout','success','help','product'];
const HOME_ANCHORS = { about:'about', campaign:'campaign' };
const navLinks = document.getElementById('navLinks');
const menuBtn  = document.getElementById('menuBtn');
function route(){
  const parts = (location.hash.replace(/^#\/?/, '') || 'home').split('/');
  const key = parts[0] || 'home';
  let page = key, target = parts[1] || null;
  if (HOME_ANCHORS[key]) { target = HOME_ANCHORS[key]; page = 'home'; }
  if (!PAGES.includes(page)) return;
  if (page === 'shop') { setShopCat(parts[1] || 'all'); target = null; }
  if (page === 'product') target = null;
  /* product pages keep "Shop" highlighted in the menu */
  const navKey = key === 'product' ? 'shop' : key;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
  document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === navKey));
  navLinks.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false');
  if (window.onPage) window.onPage(page, parts);
  requestAnimationFrame(() => {
    const el = target && document.getElementById(target);
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' }); else window.scrollTo(0, 0);
  });
}
window.addEventListener('hashchange', route); route();
menuBtn.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', open); });