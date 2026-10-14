/* ---------- render all ---------- */
function render(){renderDash();renderOrders();renderProducts();renderCustomers();renderInventory();renderPayments();renderAnalytics();renderAdmin()}
$("f").innerHTML='<option value="">All statuses</option>'+STATUSES.map(s=>`<option value="${s}">${s}</option>`).join("");
$("q").oninput=renderOrders;$("f").onchange=renderOrders;$("pm").onchange=renderOrders;
$("cq").oninput=renderCustomers;$("iq").oninput=renderInventory;$("istock").onchange=renderInventory;

/* shared actions */
async function saveField(t){
  const type=t.dataset.type;
  const v=type==="num"?num(t.value):type==="bool"?t.value==="true":t.value;
  const {error}=await sb.from(t.dataset.tbl).update({[t.dataset.f]:v}).eq("id",t.dataset.id);
  if(error){toast("Update failed: "+error.message);return load()}
  const row=({products,admins,categories})[t.dataset.tbl].find(x=>String(x.id)===t.dataset.id);
  if(row)row[t.dataset.f]=v;
  render();toast("Saved");
}
document.addEventListener("change",e=>{
  const t=e.target;
  if(t.matches("select[data-key]"))return setStatus(t.dataset.key,t.value);
  if(t.matches("[data-tbl]"))saveField(t);
});
document.addEventListener("click",async e=>{
  const s=e.target.closest("[data-ship]");
  if(s)return setStatus(s.dataset.ship,"shipped");
  const d=e.target.closest("[data-del]");
  if(!d)return;
  if(!confirm("Delete this item? This can't be undone."))return;
  const gone=d.dataset.del==="products"?products.find(p=>String(p.id)===d.dataset.id):null;
  const {error}=await sb.from(d.dataset.del).delete().eq("id",d.dataset.id);
  if(error)return toast("Delete failed: "+error.message);
  if(gone){dropPhotos([gone.img,gone.img_back]);if(PF&&String(PF.id)===d.dataset.id)pfReset()}
  await load();toast("Deleted");
});

