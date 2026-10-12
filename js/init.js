/* FILE: js/init.js
   Start-up: first cart render and scroll-reveal animation */
updateCartUI();

try {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
} catch (err) { document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); }
