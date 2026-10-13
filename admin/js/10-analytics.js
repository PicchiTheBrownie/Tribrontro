/* ---------- Analytics ---------- */
function renderAnalytics(){
  const l=live(),rev=sum(l,o=>o.total),n=orders.length;
  const pct=x=>n?Math.round(x/n*100)+"%":"0%";
  $("anStats").innerHTML=stat("wallet","t-delivered",tk(l.length?rev/l.length:0),"Average order value")+stat("bag","",n,"Total orders")+stat("check","t-delivered",pct(orders.filter(o=>o.status==="delivered").length),"Delivered rate")+stat("x","t-cancelled",pct(orders.filter(o=>o.status==="cancelled").length),"Cancel rate");
  const key=d=>new Date(d).toLocaleDateString("en-CA");
  const byDay=grp(l,o=>key(o.created_at));
  const days=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const a=byDay.get(key(d))||[];return{d,v:sum(a,o=>o.total)}});
  const mx=Math.max(1,...days.map(x=>x.v));
  $("anDays").innerHTML=days.map(x=>`<div class="day" title="${x.d.toLocaleDateString([], {dateStyle:"medium"})}: ${tk(x.v)}"><i style="height:${x.v/mx*100}%"></i><span>${x.d.getDate()}</span></div>`).join("");
  $("anStatus").innerHTML=bars(STATUSES.map(s=>[s,orders.filter(o=>o.status===s).length]));
  $("anDist").innerHTML=bars([...grp(l,o=>o.district||"—").entries()].map(([k,a])=>[k,sum(a,o=>o.total)]).sort((a,b)=>b[1]-a[1]).slice(0,6),tk);
  $("anProd").innerHTML=bars([...grp(l,o=>o.product_variant||"—").entries()].map(([k,a])=>[k,sum(a,o=>o.quantity||1)]).sort((a,b)=>b[1]-a[1]).slice(0,8),v=>v+" sold");
}

