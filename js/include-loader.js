/* js/include-loader.js
   Builds the page from the section files, so index.html only needs a few placeholders.

   <div data-include="pages/shop.html"></div>  ->  replaced by src/html/pages/shop.html
   Section files can include other section files with  <!-- @include path -->
   After the HTML is in place, the scripts listed in the "scripts" file are loaded one by one, in order.

   Needs a web server (VS Code Live Server, npm run dev, or any host). It cannot run by double-clicking
   the file, because browsers block fetch() on file:// pages. For that case use index.single.html
   (made with: node build-html.js).

   Options on the <script> tag:  data-base="src/html/"   data-scripts="sections/scripts.html"          */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = me.getAttribute('data-base') || 'src/html/';
  var SCRIPTS = me.getAttribute('data-scripts') || 'sections/scripts.html';
  var MARK = /<!--\s*@include\s+(\S+)\s*-->/;
  var cache = {};

  function get(path) {
    if (!cache[path]) {
      cache[path] = fetch(BASE + path).then(function (r) {
        if (!r.ok) throw new Error('Missing section file: ' + BASE + path);
        return r.text();
      });
    }
    return cache[path];
  }

  /* fetch a section file and swap its @include lines for the files they name */
  function expand(path, stack) {
    stack = (stack || []).concat(path);
    return get(path).then(function (text) {
      var parts = text.replace(/\r\n/g, '\n').split(new RegExp(MARK.source, 'g'));   /* [text, name, text, name, ...] */
      var jobs = parts.map(function (p, i) {
        if (i % 2 === 0) return p;
        if (stack.indexOf(p) > -1) throw new Error('Include loop: ' + stack.concat(p).join(' -> '));
        return expand(p, stack);
      });
      return Promise.all(jobs).then(function (done) { return done.join(''); });
    });
  }

  function loadScripts(list, i) {
    if (i >= list.length) return;
    var s = document.createElement('script');
    s.src = list[i];
    s.onload = function () { loadScripts(list, i + 1); };
    s.onerror = function () { console.error('Could not load script: ' + list[i]); loadScripts(list, i + 1); };
    document.body.appendChild(s);
  }

  function fail(err) {
    console.error(err);
    var box = document.createElement('div');
    box.style.cssText = 'font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:80px auto;padding:24px;color:#EFE8F3';
    box.innerHTML = '<b>The page could not be built.</b><br>' + String(err && err.message || err).replace(/</g, '&lt;') +
      '<br><br>Open this site with a local server (VS Code: right click index.html, Open with Live Server). ' +
      'Double-clicking the file will not work. If you must double-click, use index.single.html.';
    document.body.appendChild(box);
  }

  var holes = Array.prototype.slice.call(document.querySelectorAll('[data-include]'));
  Promise.all(holes.map(function (h) { return expand(h.getAttribute('data-include')); }))
    .then(function (html) {
      holes.forEach(function (h, i) { h.insertAdjacentHTML('beforebegin', html[i]); h.remove(); });
      return get(SCRIPTS);
    })
    .then(function (text) {
      var clean = text.replace(/<!--[\s\S]*?-->/g, '');
      var list = [], re = /<script[^>]*\ssrc\s*=\s*["']([^"']+)["']/g, m;
      while ((m = re.exec(clean))) list.push(m[1]);
      loadScripts(list, 0);
    })
    .catch(fail);
})();
