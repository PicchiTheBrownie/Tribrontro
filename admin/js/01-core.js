const SUPABASE_URL="https://bhhqaarbhpslpwsfmxdl.supabase.co";
const SUPABASE_KEY="sb_publishable_xFUgjtsBKKC5zYc4s1bRzg_FjfllZEJ";
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const STATUSES=["pending","confirmed","shipped","delivered","cancelled"];
const VIEWS=["dash","products","orders","customers","inventory","payments","analytics","settings"];
const KEY="ordern_no"; /* in-memory field the panel displays */
let DBKEY="ordern_no"; /* real database column; auto-detected on load */
const LOW=5;          /* stock at or below this counts as low */
const $=id=>document.getElementById(id);
let orders=[],products=[],categories=[],admins=[],me="";
const missing={};

const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const I=(n,c="ic sm")=>`<svg class="${c}"><use href="#i-${n}"/></svg>`;
const ini=n=>String(n||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const num=v=>typeof v==="number"?(isFinite(v)?v:0):(Number(String(v??"").replace(/[^0-9.\-]/g,""))||0);
const normStatus=s=>{const v=String(s??"").trim().toLowerCase();return !v||v==="placed"?"pending":v==="canceled"?"cancelled":v};
const tk=v=>"৳"+num(v).toLocaleString("en-US");
const fmt=d=>d?new Date(d).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}):"";
const fmtDay=d=>d?new Date(d).toLocaleDateString([], {dateStyle:"medium"}):"—";
function toast(t){const e=document.createElement("div");e.className="toast";e.innerHTML=I("check","ic")+esc(t);document.body.append(e);setTimeout(()=>e.remove(),2400)}

/* helpers */
const grp=(arr,fn)=>{const m=new Map();arr.forEach(x=>{const k=fn(x);if(!m.has(k))m.set(k,[]);m.get(k).push(x)});return m};
const live=a=>(a||orders).filter(o=>o.status!=="cancelled");
const sum=(a,f)=>a.reduce((s,x)=>s+num(f(x)),0);
const isCod=o=>!o.pay_method||/cod|cash/i.test(o.pay_method);
const stat=(ic,cls,v,l)=>`<div class="stat"><span class="ico ${cls||""}">${I(ic,"ic")}</span><b>${v}</b><span>${esc(l)}</span></div>`;
const bars=(items,f=String)=>{const mx=Math.max(1,...items.map(i=>i[1]));return items.length?items.map(([l,v])=>`<div class="brow"><span title="${esc(l)}">${esc(l)}</span><div class="btrack"><i style="width:${v/mx*100}%"></i></div><b>${f(v)}</b></div>`).join(""):`<div class="empty">No data yet.</div>`};
const miss=n=>`<div class="empty">${I("lock","ic")}Table <b>${n}</b> not found yet. Run <b>setup.sql</b> in the Supabase SQL editor, then refresh.</div>`;
const none=(ic,t)=>`<div class="empty">${I(ic,"ic")}${t}</div>`;
const catName=id=>(categories.find(c=>String(c.id)===String(id))||{}).name||"—";

/* app name */
function getName(){try{return localStorage.getItem("appName")||"Order Desk"}catch(e){return "Order Desk"}}
function applyName(){const n=getName();document.querySelectorAll(".appname").forEach(e=>e.textContent=n);document.title=n;$("nm").value=n}
$("saveNm").onclick=()=>{const v=$("nm").value.trim();if(!v)return toast("Enter a name first");try{localStorage.setItem("appName",v)}catch(e){}applyName();toast("Name saved")};

