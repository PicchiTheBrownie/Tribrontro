/* TRIBRONTRO customer accounts: optional sign-in, guest checkout always works.
   - A guest who clicks "Buy now" / "Order now" or heads to Checkout sees the "create account / sign in" popup FIRST,
     then carries on to what they clicked. "Continue as guest" just closes it. It shows once per visit
     (closing the website and coming back shows it again).
   - Orders can still be placed without an account.
   - Signed-in customers get: their name on the navbar, checkout auto-fill, and an ACCOUNT PAGE section (#/profile) showing
     their name, email, phone, an editable "My information" form (saved to their account) and their orders (with Sign out).

   HOW TO LOAD (in index.html, AFTER supabase-js and your own client):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
     <script>
       const sb = supabase.createClient('URL', 'PUBLISHABLE_KEY');
       window.TRIB_SB = sb;            // <- share ONE client, so login is visible to the rest of your code
     </script>
     <script src="js/supabase.js"></script>
     <script src="js/customer-auth.js"></script>

   For your own code (e.g. when you insert an order):
     user_id: window.TribAuth && window.TribAuth.user ? window.TribAuth.user.id : null
*/
(function () {
  "use strict";
  var SUPABASE_URL = "https://bhhqaarbhpslpwsfmxdl.supabase.co";
  var SUPABASE_KEY = "sb_publishable_xFUgjtsBKKC5zYc4s1bRzg_FjfllZEJ";
  var BUY_PROMPT = "session";   // when a guest clicks Buy now / Checkout: "session" = ask once per visit, "always" = ask every time, "off" = never

  if (!window.supabase) { console.error("customer-auth: load supabase-js first"); return; }
  var sb = window.TRIB_SB || window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  var A = (window.TribAuth = { sb: sb, user: null, profile: null });
  var listeners = [], root = null, view = "signup", recovery = false, btnEl = null, btnBound = false, lastFocus = null, menuEl = null, ready = false, coCtx = false, resume = null, bypass = false;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }

  /* ---------- state ---------- */
  A.onChange = function (f) { listeners.push(f); f(A.user, A.profile); };
  function emit() {
    listeners.forEach(function (f) { try { f(A.user, A.profile); } catch (e) { console.error(e); } });
    ready = true; if (!A.user) closeMenu();
    updateBtn(); prefillForms(); updateCheckoutHint(); renderAcctBox();
    if (root && view === "account") render();
  }
  function loadProfile() {
    if (!A.user) { A.profile = null; return Promise.resolve(); }
    return sb.from("customer_profiles").select("*").eq("id", A.user.id).maybeSingle()
      .then(function (r) { A.profile = r.data || {}; });
  }
  A.saveProfile = function (p) {
    if (!A.user) return Promise.resolve({ error: null });
    return sb.from("customer_profiles").upsert(Object.assign({ id: A.user.id }, p)).then(function (r) {
      if (!r.error) { A.profile = Object.assign({}, A.profile, p); prefillForms(); }
      return r;
    });
  };
  function setUser(u) {
    var changed = (A.user && A.user.id) !== (u && u.id);
    A.user = u || null;
    return (changed ? loadProfile() : Promise.resolve()).then(emit);
  }
  A.signOut = function () { return sb.auth.signOut(); };

  /* ---------- styles: colours are COPIED FROM YOUR SITE (its primary button + checkout card), so the login UI always matches the theme ---------- */
  function firstRgb(str) { var m = /rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(str || ""); return m ? [+m[1], +m[2], +m[3]] : null; }
  function isClear(c) { return !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c); }
  function rgba(c, a) { return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
  function lighten(c, t) { return "rgb(" + c.map(function (v) { return Math.round(v + (255 - v) * t); }).join(",") + ")"; }
  function siteTheme() {
    /* fallback = deep purple/black (the original palette of this file) */
    var T = { btn: "linear-gradient(135deg,#7E2BB5,#44106B)", fg: "#FFFFFF", accent: [126, 43, 181], card: "linear-gradient(165deg,#1A1222,#0B080F 75%)" };
    try {
      var tmp = document.createElement("div");
      tmp.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none";
      tmp.innerHTML = '<a class="btn btn-solid"><span>x</span></a><div class="co-card"><h3>x</h3></div>';
      document.body.appendChild(tmp);
      var b = getComputedStyle(tmp.firstChild), c = getComputedStyle(tmp.lastChild), bd = getComputedStyle(document.body);
      var fill = b.backgroundImage && b.backgroundImage !== "none" ? b.backgroundImage : (isClear(b.backgroundColor) ? "" : b.backgroundColor);
      if (fill) {
        T.btn = fill; T.fg = b.color || T.fg;
        T.accent = firstRgb(fill) || T.accent;
      }
      var cardFill = c.backgroundImage && c.backgroundImage !== "none" ? c.backgroundImage : (isClear(c.backgroundColor) ? "" : c.backgroundColor);
      var base = isClear(c.backgroundColor) ? bd.backgroundColor : c.backgroundColor;
      if (cardFill) T.card = cardFill + (c.backgroundImage !== "none" && !isClear(base) ? "," + base : "");
      else if (!isClear(bd.backgroundColor)) T.card = bd.backgroundColor;
      tmp.remove();
    } catch (e) {}
    return T;
  }
  var T = siteTheme(), AC = T.accent;
  var css = [
    ":root{--tb-btn:" + T.btn + ";--tb-fg:" + T.fg + ";--tb-ac:" + rgba(AC, 1) + ";--tb-ac-soft:" + rgba(AC, .3) + ";--tb-glow:" + rgba(AC, .22) + ";--tb-link:" + lighten(AC, .55) + "}",
    ".tb-ov{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(4,3,2,.7);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);font-family:inherit}",
    ".tb-card{position:relative;width:100%;max-width:420px;max-height:92vh;overflow:auto;padding:36px 30px 26px;border-radius:28px;color:#F4EDE3;background:radial-gradient(120% 70% at 100% 0%,var(--tb-glow),transparent 60%)," + T.card + ";border:1px solid rgba(244,237,227,.13);box-shadow:0 50px 90px -40px #000,inset 0 1px 0 rgba(244,237,227,.12)}",
    ".tb-card h3{margin:0;font-family:'Cormorant Garamond','Fraunces',serif;font-size:34px;line-height:1.05;font-weight:500;letter-spacing:-.01em;color:#F4EDE3}",
    ".tb-card p{margin:10px 0 0;color:rgba(244,237,227,.66);font-size:14px;line-height:1.55}",
    ".tb-x{position:absolute;right:14px;top:14px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(244,237,227,.07);color:#F4EDE3;font-size:18px;cursor:pointer}",
    ".tb-x:hover{background:rgba(244,237,227,.16)}",
    ".tb-tabs{display:flex;gap:6px;margin:22px 0 4px;padding:4px;border-radius:999px;background:rgba(244,237,227,.07)}",
    ".tb-tabs button{flex:1;border:0;border-radius:999px;padding:9px 10px;background:none;color:rgba(244,237,227,.7);font:inherit;font-size:13.5px;cursor:pointer;transition:.2s}",
    ".tb-tabs button.on{background:var(--tb-btn);color:var(--tb-fg);font-weight:600}",
    ".tb-card label{display:block;margin:14px 0 6px;font-size:12px;letter-spacing:.04em;color:rgba(244,237,227,.66)}",
    ".tb-card input{width:100%;box-sizing:border-box;padding:12px 16px;border-radius:14px;border:1px solid rgba(244,237,227,.14);background:rgba(244,237,227,.05);color:#F4EDE3;font:inherit;font-size:15px}",
    ".tb-card input::placeholder{color:rgba(244,237,227,.3)}",
    ".tb-card input:focus{outline:none;border-color:var(--tb-ac);box-shadow:0 0 0 3px var(--tb-ac-soft)}",
    ".tb-btn{display:block;width:100%;margin-top:20px;padding:14px;border:0;border-radius:999px;background:var(--tb-btn);color:var(--tb-fg);font:inherit;font-size:12.5px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;cursor:pointer;box-shadow:0 14px 30px -14px var(--tb-ac);transition:filter .2s}",
    ".tb-btn:hover{filter:brightness(1.12)}",
    ".tb-btn:disabled{opacity:.7;cursor:progress}",
    ".tb-ghost{display:block;width:100%;margin-top:10px;padding:13px;border-radius:999px;border:1px solid rgba(244,237,227,.26);background:none;color:#F4EDE3;font:inherit;font-size:13.5px;cursor:pointer}",
    ".tb-ghost:hover{background:rgba(244,237,227,.09)}",
    ".tb-link{margin-top:12px;border:0;background:none;color:var(--tb-link);font:inherit;font-size:13px;cursor:pointer;padding:0}",
    ".tb-msg{min-height:20px;margin-top:12px;font-size:13.5px;color:#FF8F8F}",
    ".tb-msg.ok{color:#8fe3b0}",
    ".tb-note{margin-top:14px;font-size:12.5px;color:rgba(244,237,227,.5);text-align:center}",
    ".tb-orders{margin-top:2px;display:grid;gap:8px}",
    ".tb-ord{display:flex;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:14px;background:rgba(244,237,227,.05);border:1px solid rgba(244,237,227,.08);font-size:13.5px}",
    ".tb-ord small{display:block;color:rgba(244,237,227,.55)}",
    ".tb-pill{position:fixed;left:16px;bottom:16px;z-index:9999;padding:10px 18px;border-radius:999px;border:1px solid rgba(244,237,227,.2);background:rgba(10,9,8,.88);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);color:#F4EDE3;font:inherit;font-size:13.5px;cursor:pointer}",
    ".tb-pill:hover{border-color:var(--tb-ac)}",
    ".tb-menu{position:fixed;z-index:99998;width:280px;padding:16px;border-radius:22px;color:#F4EDE3;background:radial-gradient(120% 70% at 100% 0%,var(--tb-glow),transparent 60%)," + T.card + ";border:1px solid rgba(244,237,227,.14);box-shadow:0 40px 80px -30px #000;font-family:inherit;animation:tbIn .22s ease}",
    "@keyframes tbIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}",
    ".tb-m-head{display:flex;gap:12px;align-items:center;padding:4px 4px 14px;border-bottom:1px solid rgba(244,237,227,.1);margin-bottom:8px}",
    ".tb-av{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;font-size:17px;font-weight:600;color:var(--tb-fg);background:var(--tb-btn)}",
    ".tb-m-head b{display:block;font-size:15px;font-weight:600;word-break:break-word}",
    ".tb-m-head small{display:block;margin-top:2px;font-size:12.5px;color:rgba(244,237,227,.6);word-break:break-all}",
    ".tb-menu button{display:block;width:100%;text-align:left;padding:11px 12px;border:0;border-radius:12px;background:none;color:#F4EDE3;font:inherit;font-size:14px;cursor:pointer}",
    ".tb-menu button:hover{background:rgba(244,237,227,.08)}",
    ".tb-menu button.out{color:#FF8F8F}",
    ".tb-acct{margin:0 0 28px}",
    ".tb-acct-card{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:20px 22px;border-radius:24px;color:#F4EDE3;background:radial-gradient(120% 90% at 100% 0%,var(--tb-glow),transparent 60%)," + T.card + ";border:1px solid rgba(244,237,227,.13)}",
    ".tb-acct-info{flex:1;min-width:180px}",
    ".tb-acct-info b{display:block;font-size:18px;font-weight:600;word-break:break-word}",
    ".tb-acct-info span{display:block;margin-top:3px;font-size:13.5px;color:rgba(244,237,227,.65);word-break:break-all}",
    ".tb-acct-btns{display:flex;gap:8px;flex-wrap:wrap}",
    ".tb-sm{padding:10px 18px;border-radius:999px;border:1px solid rgba(244,237,227,.26);background:none;color:#F4EDE3;font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;transition:.2s}",
    ".tb-sm:hover{background:rgba(244,237,227,.1)}",
    ".tb-sm.solid{background:var(--tb-btn);color:var(--tb-fg);border-color:transparent}",
    ".tb-sm.solid:hover{filter:brightness(1.12);background:var(--tb-btn)}",
    ".tb-acct-orders{margin-top:18px}",
    ".tb-acct-orders h4{margin:0 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:rgba(244,237,227,.6);font-weight:600}",
    ".tb-hint{margin-top:14px;font-size:14px;color:rgba(244,237,227,.7)}",
    ".tb-hint button{border:0;background:none;color:var(--tb-link);font:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:0}",
    /* account information form */
    ".tb-form{margin-top:18px;padding:22px;border-radius:24px;color:#F4EDE3;background:radial-gradient(120% 90% at 100% 0%,var(--tb-glow),transparent 60%)," + T.card + ";border:1px solid rgba(244,237,227,.13)}",
    ".tb-form h4{margin:0 0 4px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:rgba(244,237,227,.6);font-weight:600}",
    ".tb-form .tb-fine{margin:0 0 6px;font-size:13px;color:rgba(244,237,227,.55)}",
    ".tb-form .tb-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}",
    "@media(max-width:560px){.tb-form .tb-row{grid-template-columns:1fr}}",
    ".tb-form label{display:block;margin:14px 0 6px;font-size:12px;letter-spacing:.04em;color:rgba(244,237,227,.66)}",
    ".tb-form input,.tb-form textarea{width:100%;box-sizing:border-box;padding:12px 16px;border-radius:14px;border:1px solid rgba(244,237,227,.14);background:rgba(244,237,227,.05);color:#F4EDE3;font:inherit;font-size:15px;resize:vertical}",
    ".tb-form input[readonly]{opacity:.55;cursor:not-allowed}",
    ".tb-form input::placeholder,.tb-form textarea::placeholder{color:rgba(244,237,227,.3)}",
    ".tb-form input:focus,.tb-form textarea:focus{outline:none;border-color:var(--tb-ac);box-shadow:0 0 0 3px var(--tb-ac-soft)}",
    ".tb-form .tb-pmsg{min-height:20px;margin-top:12px;font-size:13.5px;color:#FF8F8F}",
    ".tb-form .tb-pmsg.ok{color:#8fe3b0}",
    ".tb-form .tb-btn{width:auto;padding:13px 28px;margin-top:16px}"
  ].join("\n");
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- modal ---------- */
  function tabs() {
    return '<div class="tb-tabs"><button type="button" data-act="signup" class="' + (view === "signup" ? "on" : "") + '">Create account</button><button type="button" data-act="signin" class="' + (view === "signin" ? "on" : "") + '">Sign in</button></div>';
  }
  var guest = '<button type="button" class="tb-ghost" data-act="guest">Continue as guest</button><div class="tb-note">No account needed. You can order as a guest.</div>';
  function accountHtml() {
    var n = (A.profile && A.profile.name) || "";
    return '<h3>' + (n ? "Hi, " + esc(n.split(" ")[0]) : "Your account") + '</h3><p>' + esc(A.user.email) + '</p>' +
      '<label>Recent orders</label><div class="tb-orders" id="tbOrders"><p>Loading…</p></div>' +
      '<button type="button" class="tb-ghost" data-act="signout">Sign out</button>';
  }
  function render(msgText, kind) {
    var h = "";
    if (view === "account" && A.user) {
      h = accountHtml();
    } else if (view === "reset") {
      h = '<h3>New password</h3><p>Choose a new password for your account.</p><form data-form="reset"><label>New password</label><input name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="At least 6 characters"><button class="tb-btn" type="submit">Save new password</button></form>';
    } else if (view === "signin") {
      h = '<h3>Welcome back</h3><p>' + (coCtx ? 'Sign in to attach this order to your account. Or continue as a guest.' : 'Sign in to see your orders and check out faster.') + '</p>' + tabs() +
        '<form data-form="signin"><label>Email</label><input name="email" type="email" autocomplete="username" required placeholder="you@example.com"><label>Password</label><input name="password" type="password" autocomplete="current-password" required placeholder="Your password"><button class="tb-btn" type="submit">Sign in</button><button type="button" class="tb-link" data-act="forgot">Forgot password?</button></form>' + guest;
    } else {
      view = "signup";
      h = '<h3>' + (coCtx ? 'Before you order' : 'Create an account') + '</h3><p>' + (coCtx ? 'Create an account to track this order and check out faster next time. Or just continue as a guest, your choice.' : 'Save your details and track your orders. It takes a minute.') + '</p>' + tabs() +
        '<form data-form="signup"><label>Name</label><input name="name" autocomplete="name" required placeholder="Your name"><label>Email</label><input name="email" type="email" autocomplete="username" required placeholder="you@example.com"><label>Phone (optional)</label><input name="phone" type="tel" autocomplete="tel" placeholder="01XXXXXXXXX"><label>Password</label><input name="password" type="password" autocomplete="new-password" minlength="6" required placeholder="At least 6 characters"><button class="tb-btn" type="submit">Create account</button></form>' + guest;
    }
    root.querySelector(".tb-body").innerHTML = h + '<div class="tb-msg' + (kind === "ok" ? " ok" : "") + '" role="alert">' + esc(msgText || "") + '</div>';
    if (view === "account" && A.user) loadOrders();
  }
  function msg(t, kind) {
    var m = root && root.querySelector(".tb-msg");
    if (m) { m.textContent = t; m.className = "tb-msg" + (kind === "ok" ? " ok" : ""); }
  }
  function loadOrders(boxId) {
    if (!A.user) return;
    sb.from("orders").select("*").eq("user_id", A.user.id).order("created_at", { ascending: false }).limit(10).then(function (r) {
      var box = document.getElementById(boxId || "tbOrders"); if (!box) return;
      var rows = r.data || [];
      if (r.error || !rows.length) { box.innerHTML = "<p>No orders yet.</p>"; return; }
      var ks = Object.keys(rows[0]);
      var key = ["order_no", "order_number", "ordern_no", "order_id", "id"].filter(function (k) { return ks.indexOf(k) > -1; })[0];
      box.innerHTML = rows.map(function (o) {
        var s = String(o.status || "pending").toLowerCase(); if (s === "placed") s = "pending";
        var d = o.created_at ? new Date(o.created_at).toLocaleDateString([], { dateStyle: "medium" }) : "";
        return '<div class="tb-ord"><div>#' + esc(key ? o[key] : "") + '<small>' + esc(d) + '</small></div><div style="text-align:right">৳' + esc(Number(o.total) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small>' + esc(s) + '</small></div></div>';
      }).join("");
    });
  }
  A.open = function (v, opts) {
    view = v || (A.user ? "account" : "signup");
    coCtx = !!(opts && opts.checkout);
    if (!root) {
      lastFocus = document.activeElement;
      root = document.createElement("div");
      root.className = "tb-ov";
      root.innerHTML = '<div class="tb-card" role="dialog" aria-modal="true"><button type="button" class="tb-x" data-act="close" aria-label="Close">&times;</button><div class="tb-body"></div></div>';
      document.body.appendChild(root);
      var downOnBack = false;
      root.addEventListener("mousedown", function (e) { downOnBack = e.target === root; });
      root.addEventListener("click", function (e) {
        if (e.target === root) { if (downOnBack) A.close(); return; }   // ignore drags that start inside the card
        var b = e.target.closest("[data-act]"); if (!b) return;
        var a = b.getAttribute("data-act");
        if (a === "close") A.close();
        else if (a === "guest") A.close();
        else if (a === "signup" || a === "signin") { view = a; render(); focusFirst(); }
        else if (a === "signout") { A.signOut().then(function () { A.close(true); }); }
        else if (a === "forgot") {
          var em = root.querySelector('[name="email"]'); var v = em && em.value.trim();
          if (!v) return msg("Type your email above first.");
          sb.auth.resetPasswordForEmail(v, { redirectTo: location.origin + location.pathname }).then(function (r) {
            r.error ? msg(r.error.message) : msg("Reset link sent. Check your email.", "ok");
          });
        }
      });
      root.addEventListener("submit", onSubmit);
    }
    render(); focusFirst();
  };
  function focusFirst() { var i = root && root.querySelector("input"); if (i) try { i.focus({ preventScroll: true }); } catch (e) {} }
  A.close = function (noSkip) {
    if (root) { root.remove(); root = null; }
    coCtx = false;
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
    if (resume) { var go = resume; resume = null; setTimeout(go, 0); }   /* continue what the customer clicked (Buy now / Checkout) */
  };

  function onSubmit(e) {
    e.preventDefault();
    var f = e.target, act = f.getAttribute("data-form");
    var v = function (n) { return ((f.elements[n] && f.elements[n].value) || "").trim(); };
    var btn = f.querySelector("button[type=submit]"), label = btn.textContent;
    btn.disabled = true; btn.textContent = "Please wait…";
    var done = function () { btn.disabled = false; btn.textContent = label; };
    if (act === "signup") {
      sb.auth.signUp({ email: v("email"), password: v("password"), options: { data: { name: v("name"), phone: v("phone") } } }).then(function (r) {
        done();
        if (r.error) return msg(r.error.message);
        if (r.data.user && r.data.user.identities && !r.data.user.identities.length) return msg("This email already has an account. Try signing in.");
        if (r.data.session) A.close(true); else msg("Account created. Check your email to confirm it, then sign in.", "ok");
      });
    } else if (act === "signin") {
      sb.auth.signInWithPassword({ email: v("email"), password: v("password") }).then(function (r) {
        done(); r.error ? msg(r.error.message) : A.close(true);
      });
    } else if (act === "reset") {
      sb.auth.updateUser({ password: v("password") }).then(function (r) {
        done(); if (r.error) return msg(r.error.message);
        recovery = false; view = "account"; msg("Password updated.", "ok"); setTimeout(function () { A.close(true); }, 900);
      });
    }
  }

  /* ---------- navbar item: "Sign in"  ->  after login: name + dropdown with account info ---------- */
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } if (btnEl) btnEl.setAttribute("aria-expanded", "false"); }
  function toggleMenu() {
    if (menuEl) return closeMenu();
    if (!A.user) return;
    var p = A.profile || {}, md = A.user.user_metadata || {};
    var name = p.name || md.name || "", phone = p.phone || md.phone || "";
    menuEl = document.createElement("div");
    menuEl.className = "tb-menu"; menuEl.setAttribute("role", "menu");
    menuEl.innerHTML =
      '<div class="tb-m-head"><span class="tb-av">' + esc((name || A.user.email || "?").charAt(0).toUpperCase()) + '</span><div><b>' + esc(name || "My account") + '</b><small>' + esc(A.user.email) + '</small>' + (phone ? '<small>' + esc(phone) + '</small>' : '') + '</div></div>' +
      '<button type="button" data-m="profile">My account</button>' +
      '<button type="button" data-m="orders">My orders</button>' +
      '<button type="button" data-m="out" class="out">Sign out</button>';
    document.body.appendChild(menuEl);
    var r = btnEl.getBoundingClientRect(), w = Math.min(280, window.innerWidth - 24);
    menuEl.style.width = w + "px";
    menuEl.style.left = Math.max(12, Math.min(r.right - w, window.innerWidth - w - 12)) + "px";
    menuEl.style.top = Math.min(r.bottom + 10, window.innerHeight - 260) + "px";
    btnEl.setAttribute("aria-expanded", "true");
    menuEl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-m]"); if (!b) return;
      var m = b.getAttribute("data-m"); closeMenu();
      if (m === "orders" || m === "profile") goAccount(m === "orders");
      else if (m === "out") A.signOut();
    });
  }
  function updateBtn() {
    if (!document.body) return;
    if (!btnEl) {
      btnEl = document.querySelector("#accountBtn,[data-account]");
      if (!btnEl) {
        var links = document.getElementById("navLinks");
        if (links) {                       /* put "Sign in" inside the navbar, just before Cart */
          btnEl = document.createElement("a"); btnEl.href = "#"; btnEl.id = "accountBtn"; btnEl.className = "tb-nav";
          links.insertBefore(btnEl, links.querySelector("[data-cart]"));
        } else {                           /* no navbar found: floating pill fallback */
          btnEl = document.createElement("button"); btnEl.className = "tb-pill"; btnEl.type = "button"; document.body.appendChild(btnEl);
        }
      }
    }
    if (!btnBound) {
      btnBound = true;
      btnEl.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); if (A.user) toggleMenu(); else A.open("signin"); });
      document.addEventListener("click", function (e) { if (menuEl && !menuEl.contains(e.target) && !btnEl.contains(e.target)) closeMenu(); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (root) A.close(); closeMenu(); } });
      window.addEventListener("hashchange", closeMenu);
      window.addEventListener("resize", closeMenu);
    }
    var n = A.user && ((A.profile && A.profile.name) || (A.user.user_metadata && A.user.user_metadata.name) || "").split(" ")[0];
    btnEl.textContent = A.user ? (n || "Account") + " ▾" : "Sign in";
    btnEl.style.visibility = ready ? "" : "hidden";   /* avoid flashing "Sign in" for people who are already logged in */
  }

  /* ---------- ACCOUNT PAGE (#/profile): signed-in info, "My information" form + orders live inside the Account section ---------- */
  function goAccount(toOrders) {
    if (!document.getElementById("page-profile")) return A.open("account");   /* no account page found: use the popup */
    if (location.hash === "#/profile") { renderAcctBox(); scrollBox(); } else { location.hash = "#/profile"; }
    if (toOrders) setTimeout(scrollBox, 350);
  }
  function scrollBox() { var b = document.getElementById("tbAcctBox"); if (b && b.scrollIntoView) b.scrollIntoView({ behavior: "smooth", block: "start" }); }
  var headTextOrig = null;
  function renderAcctBox() {
    var page = document.getElementById("page-profile"); if (!page) return;
    renderAcctOrders();
    var host = page.querySelector(".acct") || page.querySelector(".wrap:last-child");
    var intro = page.querySelector(".page-head p");
    if (intro) {
      if (headTextOrig === null) headTextOrig = intro.textContent;
      intro.textContent = A.user ? "You are signed in. Your details and orders are saved to your account." : headTextOrig;
    }
    if (!host) return;
    var box = document.getElementById("tbAcctBox");
    if (!box) {
      box = document.createElement("div"); box.id = "tbAcctBox"; box.className = "tb-acct"; host.insertBefore(box, host.firstChild || null);
      box.addEventListener("click", function (e) {
        var b = e.target.closest("[data-a]"); if (!b) return;
        var a = b.getAttribute("data-a");
        if (a === "out") A.signOut(); else if (a === "in") A.open("signin"); else if (a === "up") A.open("signup");
      });
      box.addEventListener("submit", function (e) {
        var f = e.target; if (f.id !== "tbProfForm") return;
        e.preventDefault();
        var v = function (n) { return ((f.elements[n] && f.elements[n].value) || "").trim(); };
        var pm = box.querySelector(".tb-pmsg");
        var say = function (t, ok) { pm.textContent = t; pm.className = "tb-pmsg" + (ok ? " ok" : ""); };
        if (!v("name")) return say("Please enter your name.");
        if (v("phone") && !/^(\+?88)?01\d{9}$/.test(v("phone").replace(/[\s-]/g, ""))) return say("Enter a valid phone number, like 01XXXXXXXXX.");
        var btn = f.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Saving…";
        A.saveProfile({ name: v("name"), phone: v("phone"), district: v("district"), address: v("address") }).then(function (r) {
          btn.disabled = false; btn.textContent = "Save information";
          if (r.error) return say(r.error.message);
          say("Saved to your account.", true);
          var b = box.querySelector(".tb-acct-info b"); if (b) b.textContent = v("name");
          var av = box.querySelector(".tb-av"); if (av) av.textContent = v("name").charAt(0).toUpperCase();
          updateBtn();
        });
      });
    }
    if (!A.user) {
      box.removeAttribute("data-uid");
      box.innerHTML = '<div class="tb-acct-card"><div class="tb-acct-info"><b>Have an account?</b><span>Sign in to see your orders and saved details on any device.</span></div><div class="tb-acct-btns"><button type="button" class="tb-sm solid" data-a="in">Sign in</button><button type="button" class="tb-sm" data-a="up">Create account</button></div></div>';
      return;
    }
    /* already showing this user: don't re-render, or we'd wipe what they are typing */
    if (box.getAttribute("data-uid") === A.user.id) return;
    box.setAttribute("data-uid", A.user.id);
    var p = A.profile || {}, md = A.user.user_metadata || {};
    var name = p.name || md.name || "", phone = p.phone || md.phone || "";
    box.innerHTML = '<div class="tb-acct-card"><span class="tb-av">' + esc((name || A.user.email || "?").charAt(0).toUpperCase()) + '</span>' +
      '<div class="tb-acct-info"><b>' + esc(name || "My account") + '</b><span>' + esc(A.user.email) + '</span></div>' +
      '<div class="tb-acct-btns"><button type="button" class="tb-sm" data-a="out">Sign out</button></div></div>' +
      '<form class="tb-form" id="tbProfForm" novalidate>' +
        '<h4>My information</h4><p class="tb-fine">Saved to your account. We use it to fill in checkout for you.</p>' +
        '<div class="tb-row"><div><label for="tbp-name">Full name *</label><input id="tbp-name" name="name" autocomplete="name" placeholder="Your name" value="' + esc(name) + '"></div>' +
        '<div><label for="tbp-phone">Phone</label><input id="tbp-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="01XXXXXXXXX" value="' + esc(phone) + '"></div></div>' +
        '<label for="tbp-email">Email</label><input id="tbp-email" type="email" value="' + esc(A.user.email) + '" readonly>' +
        '<label for="tbp-district">District / area</label><input id="tbp-district" name="district" placeholder="e.g. Rajshahi, Dhanmondi" value="' + esc(p.district || "") + '">' +
        '<label for="tbp-address">Full address</label><textarea id="tbp-address" name="address" rows="3" placeholder="House, road, area, landmark">' + esc(p.address || "") + '</textarea>' +
        '<div class="tb-pmsg" role="alert"></div>' +
        '<button class="tb-btn" type="submit">Save information</button>' +
      '</form>';
  }
  /* ORDERS tab: show ONLY orders saved to the signed-in account (never orders stored on this device) */
  var ordersObs = null;
  function renderAcctOrders() {
    var p = document.getElementById("acct-orders"); if (!p) return;
    if (!ordersObs && window.MutationObserver) {
      ordersObs = new MutationObserver(function () { renderAcctOrders(); });   /* if the old code re-draws the tab, put ours back */
      ordersObs.observe(p, { childList: true });
    }
    var uid = A.user ? A.user.id : "guest";
    if (p.getAttribute("data-tb") === uid && p.querySelector("[data-tb-orders]")) return;
    p.setAttribute("data-tb", uid);
    if (!A.user) {
      p.innerHTML = '<div data-tb-orders class="tb-hint">Sign in to see the orders placed with your account. <button type="button" data-tb-in>Sign in</button></div>';
      return;
    }
    p.innerHTML = '<div data-tb-orders class="tb-orders" id="tbAcctOrders"><p>Loading…</p></div>';
    loadOrders("tbAcctOrders");
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-tb-in]"); if (b) A.open("signin");
  });
  window.addEventListener("hashchange", function () { if (location.hash.indexOf("#/profile") === 0) renderAcctBox(); });
  /* details saved on the Account page's old "MY DETAILS" tab also go to the customer's account (so they follow them to other devices) */
  document.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "pfForm" || !A.user) return;
    var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
    A.saveProfile({ name: g("pf-name"), phone: g("pf-phone"), district: g("pf-district"), address: g("pf-address") });
  }, true);

  /* ---------- checkout / profile helpers (only fill EMPTY fields, never overwrite typing) ---------- */
  function fill(id, val) { var el = document.getElementById(id); if (el && val && !el.value) el.value = val; }
  function prefillForms() {
    if (!A.user) return;
    var p = A.profile || {}, name = p.name || (A.user.user_metadata && A.user.user_metadata.name) || "", phone = p.phone || (A.user.user_metadata && A.user.user_metadata.phone) || "";
    ["co", "pf"].forEach(function (k) {
      fill(k + "-name", name); fill(k + "-phone", phone); fill(k + "-email", A.user.email);
      fill(k + "-district", p.district); fill(k + "-address", p.address);
    });
  }
  function updateCheckoutHint() {
    var head = document.querySelector("#page-checkout .page-head");
    var old = document.getElementById("tbCoHint");
    if (A.user) { if (old) old.remove(); return; }
    if (!head || old) return;
    var d = document.createElement("div"); d.id = "tbCoHint"; d.className = "tb-hint";
    d.innerHTML = 'Ordering as a guest. <button type="button">Sign in or create an account</button> to save your details.';
    d.querySelector("button").addEventListener("click", function () { A.open("signin"); });
    head.appendChild(d);
  }

  /* ---------- ask guests (once per visit) when they head to checkout ---------- */
  var CO_KEY = "trib_co_prompt";   // remembered for this visit only (sessionStorage), so closing the site and coming back asks again
  function shouldAsk() {
    if (BUY_PROMPT === "off" || !ready || A.user || root || recovery) return false;
    if (BUY_PROMPT === "session") { try { if (sessionStorage.getItem(CO_KEY)) return false; } catch (e) {} }
    return true;
  }
  function askBuyer() {
    if (!shouldAsk()) return false;
    try { sessionStorage.setItem(CO_KEY, "1"); } catch (e) {}
    A.open("signup", { checkout: true });
    return true;
  }
  /* typed the checkout address / refreshed on it: popup appears on top of the page */
  function maybeCheckoutPrompt() { if (/^#\/checkout/.test(location.hash)) askBuyer(); }
  window.addEventListener("hashchange", maybeCheckoutPrompt);

  /* "Buy now", "Order now" and "Checkout" buttons/links: popup FIRST, then the click carries on.
     (Quick Add / Add to cart do NOT show it.) Works on any element by its text or by an #/checkout link. */
  var BUY_RE = /^\s*(buy\s*now|order\s*now|(proceed\s*to\s*)?check\s*out)\s*[→>›»]?\s*$/i;
  document.addEventListener("click", function (e) {
    if (bypass || A.user || root) return;
    var b = e.target.closest && e.target.closest("button, a, [role=button]");
    if (!b || b.disabled || b.getAttribute("aria-disabled") === "true" || (b.closest && b.closest(".tb-ov,.tb-menu"))) return;
    var href = b.getAttribute && b.getAttribute("href");
    if (!(BUY_RE.test(b.textContent || "") || /#\/checkout/.test(href || ""))) return;
    if (!shouldAsk()) return;
    e.preventDefault(); e.stopImmediatePropagation();
    resume = function () { bypass = true; try { b.click(); } finally { bypass = false; } };
    askBuyer();
  }, true);

  /* ---------- boot ---------- */
  function boot() {
    updateBtn(); updateCheckoutHint();
    setTimeout(function () { if (!ready) { ready = true; updateBtn(); } }, 2500);   /* if Supabase is slow, still show the button */
    sb.auth.getSession().then(function (r) {
      return setUser(r.data.session && r.data.session.user);
    }).then(function () {
      maybeCheckoutPrompt();     /* landed straight on the checkout page */
    });
    sb.auth.onAuthStateChange(function (ev, s) {
      setTimeout(function () {
        if (ev === "PASSWORD_RECOVERY") { recovery = true; setUser(s && s.user).then(function () { A.open("reset"); }); return; }
        setUser(s && s.user);
      }, 0);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();