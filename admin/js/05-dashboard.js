/* ---------- Dashboard ---------- */
function renderDash(){
  const c=s=>orders.filter(o=>o.status===s).length;
  const revenue=sum(live(),o=>o.total);
  const SI={pending:"clock",confirmed:"check",shipped:"truck",delivered:"box",cancelled:"x"};
  $("stats").innerHTML=STATUSES.map(s=>`<div class="stat"><span class="ico t-${s}">${I(SI[s],"ic")}</span><b>${c(s)}</b><span>${s[0].toUpperCase()+s.slice(1)}</span></div>`).join("");
  const odd=orders.filter(o=>!STATUSES.includes(o.status));
  $("warn").classList.toggle("hidden",!odd.length);
  $("warn").innerHTML=odd.length?`${I("note","ic")}<span>${odd.length} ${odd.length===1?"order has":"orders have"} a status this panel doesn't count: <b>${[...new Set(odd.map(o=>o.status))].map(esc).join(", ")}</b>. Change them from the Orders page.</span>`:"";
  const h=new Date().getHours();
  $("greet").textContent=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
  $("heroSub").textContent=c("pending")?`${c("pending")} ${c("pending")===1?"order is":"orders are"} waiting for confirmation.`:"You're all caught up. No orders are waiting.";
  $("heroRev").textContent=tk(revenue);
  $("heroLbl").textContent=`Revenue from ${orders.length} orders, cancelled excluded`;
  $("tag1").innerHTML=I("clock")+c("pending")+" pending";
  $("tag2").innerHTML=I("box")+c("delivered")+" delivered";
  const mq=orders.slice(0,10).map(o=>`<span>#${esc(o.ordern_no)} · ${esc(o.name)} · ${tk(o.total)}</span>`).join("")||"<span>No orders yet</span>";
  $("marq").innerHTML=mq+mq;
  $("recent").innerHTML=orders.length?orders.slice(0,8).map(o=>`<div class="rail-card" data-no="${esc(o.ordern_no)}"><div class="tex"><span class="mono">${esc(ini(o.name))}</span><span class="price-float">${tk(o.total)}</span></div><b>${esc(o.name)}</b><div class="meta">#${esc(o.ordern_no)} · ${esc(o.district)}</div><div class="meta"><span class="stt s-${esc(o.status)}">${esc(o.status)}</span></div></div>`).join(""):`<div class="empty" style="width:100%">${I("bag","ic")}No orders yet.</div>`;
}
function renderOrders(){
  const q=$("q").value.trim().toLowerCase(),f=$("f").value,pm=$("pm").value;
  const rows=orders.filter(o=>(!f||o.status===f)&&(!pm||o.pay_method===pm)&&(!q||[o.ordern_no,o.name,o.phone,o.email,o.district,o.trx_id].some(v=>String(v??"").toLowerCase().includes(q))));
  $("list").innerHTML=table(rows);
}

