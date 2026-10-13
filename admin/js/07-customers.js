/* ---------- Customers ---------- */
function renderCustomers(){
  const all=[...grp(orders,o=>o.phone||o.email||o.name||"unknown").values()].map(a=>({name:a[0].name,phone:a[0].phone,email:a[0].email,district:a[0].district,n:a.length,spent:sum(live(a),o=>o.total),last:a[0].created_at})).sort((x,y)=>y.spent-x.spent);
  const repeat=all.filter(c=>c.n>1).length;
  $("custStats").innerHTML=stat("users","",all.length,"Customers")+stat("refresh","t-confirmed",repeat,"Repeat buyers")+stat("wallet","t-delivered",tk(all.length?sum(all,c=>c.spent)/all.length:0),"Avg. spend per customer")+stat("bag","t-shipped",all.length?(orders.length/all.length).toFixed(1):"0","Orders per customer");
  const q=$("cq").value.trim().toLowerCase();
  const rows=all.filter(c=>!q||[c.name,c.phone,c.email,c.district].some(v=>String(v??"").toLowerCase().includes(q)));
  $("custList").innerHTML=!rows.length?none("users","No customers yet."):
    `<table><thead><tr><th>Customer</th><th>District</th><th>Orders</th><th>Total spent</th><th>Last order</th></tr></thead><tbody>`+
    rows.map(c=>`<tr><td><div class="who"><span class="av">${esc(ini(c.name))}</span><div>${esc(c.name)}<small>${I("phone")}${esc(c.phone)}</small><small>${I("mail")}${esc(c.email)}</small></div></div></td><td>${esc(c.district)}</td><td>${c.n}</td><td><b>${tk(c.spent)}</b></td><td>${fmtDay(c.last)}</td></tr>`).join("")+`</tbody></table>`;
}

