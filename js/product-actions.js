/* FILE: js/product-actions.js
   Quick-add buttons and wishlist hearts */
document.addEventListener('click', e => {
  const add = e.target.closest('.js-add');
  if (add) {
    const r = addToCart(normId(add.dataset.id));
    if (r) {
      showToast('<b>' + r.p.name + '</b><small>' + r.color + ' / ' + r.size + ' · added to cart</small>', true);
      const old = add.textContent; add.textContent = 'ADDED ✓';
      setTimeout(() => add.textContent = old, 1100);
    }
  }
  const wish = e.target.closest('.wish');
  if (wish) {
    const id = normId(wish.dataset.id);
    wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
    try { localStorage.setItem('tb_wish', JSON.stringify([...wishlist])); } catch (err) {}
    document.querySelectorAll('.wish[data-id="' + id + '"]').forEach(w => {
      const on = wishlist.has(id); w.classList.toggle('on', on); w.textContent = on ? '♥' : '♡';
    });
  }
});

