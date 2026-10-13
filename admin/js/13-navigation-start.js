/* navigation */
function go(v){
  document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("on",x.dataset.view===v));
  VIEWS.forEach(x=>$("v-"+x).classList.toggle("hidden",x!==v));
  window.scrollTo(0,0);
}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>go(b.dataset.view));
document.querySelectorAll(".refresh:not(#saveNm)").forEach(b=>b.onclick=async()=>{b.classList.add("spin");await load();setTimeout(()=>b.classList.remove("spin"),800)});
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
$("recent").onclick=e=>{const c=e.target.closest(".rail-card");if(!c)return;$("q").value=c.dataset.no;renderOrders();go("orders")};
const appOpen=()=>!$("app").classList.contains("hidden");
const typing=()=>/INPUT|SELECT|TEXTAREA/.test((document.activeElement||{}).tagName||"");
setInterval(()=>{if(appOpen()&&!document.hidden&&!typing())load()},60000);
document.addEventListener("visibilitychange",()=>{if(appOpen()&&!document.hidden&&!typing())load()});
applyName();
sb.auth.getSession().then(({data})=>{if(data.session)start()});
