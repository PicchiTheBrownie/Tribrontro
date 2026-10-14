/* FILE: js/home-carousel.js
   Home page swipeable product carousel */

/* Home: swipeable product carousel */
(function(){
  const rail = document.getElementById('homeRail'); if (!rail) return;
  function fill(){
    const list = PRODUCTS.slice().sort((a, b) =>
      (b.tags.includes('oversized') - a.tags.includes('oversized')) || ((b.stock > 0) - (a.stock > 0)));
    rail.innerHTML = list.map(p => cardHTML(p, true)).join('');
  }
  fill();
  const btns = Array.from(document.querySelectorAll('[data-rail]'));
  const step = () => { const c = rail.querySelector('.product'); return (c ? c.getBoundingClientRect().width : 250) + 20; };
  function upd(){
    if (btns.length < 2) return;
    btns[0].disabled = rail.scrollLeft <= 4;
    btns[1].disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 4;
  }
  btns.forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: Number(b.dataset.rail) * step() * 2, behavior:'smooth' })));
  rail.addEventListener('scroll', upd, { passive:true });
  addEventListener('resize', upd);
  setTimeout(upd, 150);
  /* products arrive from the admin panel after the page opens */
  window.addEventListener('products-ready', () => { fill(); rail.scrollLeft = 0; setTimeout(upd, 60); });
  /* mouse drag to scroll (touch uses normal swipe) */
  let down = false, moved = false, sx = 0, sl = 0;
  rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = rail.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) { moved = true; rail.classList.add('drag'); }
    if (moved) rail.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => rail.classList.remove('drag'), 0); });
  rail.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
})();