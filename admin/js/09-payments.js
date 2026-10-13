/* ---------- Payments & Shipping ---------- */
function renderPayments(){
  const l=live();
  const cod=orders.filter(isCod).length;
  const ready=orders.filter(o=>o.status==="confirmed");
  $("payStats").innerHTML=stat("wallet","t-delivered",tk(sum(l,o=>o.total)),"Revenue")+stat("truck","t-shipped",tk(sum(l,o=>o.shipping)),"Shipping charged")+stat("card","t-confirmed",`${cod} / ${orders.length-cod}`,"COD / online orders")+stat("clock","t-pending",ready.length,"Ready to ship");
  const g=[...grp(orders,o=>o.pay_method||"COD").entries()].map(([m,a])=>[m,a.length,sum(live(a),o=>o.total)]).sort((x,y)=>y[2]-x[2]);
  $("payMethods").innerHTML=!g.length?none("card","No orders yet."):`<table class="slim"><thead><tr><th>Method</th><th>Orders</th><th>Revenue</th></tr></thead><tbody>`+g.map(([m,n,r])=>`<tr><td><span class="pill">${I("card")}${esc(m)}</span></td><td>${n}</td><td><b>${tk(r)}</b></td></tr>`).join("")+`</tbody></table>`;
  $("toShip").innerHTML=!ready.length?none("truck","Nothing waiting. Confirmed orders show up here."):`<table class="slim"><thead><tr><th>Order</th><th>Deliver to</th><th></th></tr></thead><tbody>`+ready.map(o=>`<tr><td><span class="ord">#${esc(o.ordern_no)}</span><small>${esc(o.name)}</small></td><td>${esc(o.district)}<small>${esc(o.address)}</small></td><td style="text-align:right"><button class="btn sm" data-ship="${esc(o[KEY])}">Mark shipped</button></td></tr>`).join("")+`</tbody></table>`;
  const t=orders.filter(o=>o.trx_id);
  $("trxList").innerHTML=!t.length?none("wallet","No mobile payments recorded."):`<table class="slim"><thead><tr><th>Order</th><th>Method</th><th>TrxID</th><th>Amount</th><th>Status</th></tr></thead><tbody>`+t.map(o=>`<tr><td><span class="ord">#${esc(o.ordern_no)}</span><small>${esc(o.name)}</small></td><td>${esc(o.pay_method)}</td><td><b>${esc(o.trx_id)}</b></td><td>${tk(o.total)}</td><td><span class="stt s-${esc(o.status)}">${esc(o.status)}</span></td></tr>`).join("")+`</tbody></table>`;
  const d=[...grp(l,o=>o.district||"—").entries()].map(([k,a])=>[k,a.length,sum(a,o=>o.shipping),a.filter(o=>o.status==="delivered").length]).sort((x,y)=>y[1]-x[1]);
  $("distList").innerHTML=!d.length?none("pin","No orders yet."):`<table class="slim"><thead><tr><th>District</th><th>Orders</th><th>Shipping charged</th><th>Delivered</th></tr></thead><tbody>`+d.map(([k,n,s,dl])=>`<tr><td>${I("pin")}${esc(k)}</td><td>${n}</td><td>${tk(s)}</td><td>${dl}</td></tr>`).join("")+`</tbody></table>`;
}

