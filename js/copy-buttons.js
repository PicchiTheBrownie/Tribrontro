/* FILE: js/copy-buttons.js
   COPY buttons in payment instructions */

/* Copy buttons in payment instructions */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  const v = b.dataset.copy;
  const done = () => { b.textContent = 'COPIED'; showToast('Copied: ' + v, false); setTimeout(() => b.textContent = 'COPY', 1600); };
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = v; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (err) {} ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(done, fallback); else fallback();
});
