/* FILE: js/progress-bar.js
   Scroll progress bar at the top */

(function(){
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const prog = document.getElementById('prog');
  addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    prog.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
  }, { passive:true });


})();
