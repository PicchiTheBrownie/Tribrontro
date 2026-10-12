/* FILE: js/scroll-links.js
   Smooth-scroll links */

document.addEventListener('click', e => {
  const a = e.target.closest('[data-scroll]'); if (!a) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.scroll);
  if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
});
