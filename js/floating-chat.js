/* FILE: js/floating-chat.js
   Floating chat menu (Instagram / Facebook / WhatsApp) */

/* Floating chat menu */
(function(){
  const fab = document.getElementById('fab') || document.querySelector('.fab');
  const btn = document.getElementById('fabChat'); if (!fab || !btn) return;
  const set = open => { fab.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); btn.setAttribute('aria-label', open ? 'Close chat options' : 'Open chat options'); };
  btn.addEventListener('click', e => { e.stopPropagation(); set(!fab.classList.contains('open')); });
  document.addEventListener('click', e => { if (!e.target.closest('.fab')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  fab.querySelectorAll('.fab-menu a').forEach(a => a.addEventListener('click', () => set(false)));
  addEventListener('hashchange', () => set(false));
})();
