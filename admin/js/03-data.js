/* data */
async function getTable(t,col){
  const r=await sb.from(t).select("*").order(col,{ascending:true});
  missing[t]=!!r.error;
  return r.error?[]:(r.data||[]);
}
async function fetchOrders(){
  let all=[],from=0;const step=1000;
  for(;;){
    const {data,error}=await sb.from("orders").select("*").order("created_at",{ascending:false}).range(from,from+step-1);
    if(error)return {error};
    all=all.concat(data||[]);
    if(!data||data.length<step)break;
    from+=step;
  }
  const seen=new Set();
  all=all.filter(o=>{const k=JSON.stringify(o);if(seen.has(k))return false;seen.add(k);return true});
  return {data:all};
}
function detectKey(rows){
  const r=rows&&rows[0];if(!r)return;
  const ks=Object.keys(r);
  const c=["ordern_no","order_no","order_number","orderno","order_num","order_id","id"].find(k=>ks.includes(k))||ks.find(k=>/^order.*(no|num|id)/i.test(k));
  if(c)DBKEY=c;else toast("Order number column not found. Columns: "+ks.join(", "));
}
async function load(){
  const {data,error}=await fetchOrders();
  if(error)return toast("Could not load orders: "+error.message);
  detectKey(data);
  orders=(data||[]).map(o=>({...o,ordern_no:o[DBKEY],status:normStatus(o.status)}));
  [categories,products,admins]=await Promise.all([getTable("categories","name"),getTable("products","name"),getTable("admins","email")]);
  const cur=$("pm").value;
  const methods=[...new Set(orders.map(o=>o.pay_method).filter(Boolean))];
  $("pm").innerHTML='<option value="">All payments</option>'+methods.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join("");
  $("pm").value=cur;
  render();
}
async function setStatus(key,status){
  const {data,error}=await sb.from("orders").update({status}).eq(DBKEY,key).select();
  if(error){toast("Update failed: "+error.message);return render()}
  if(!data||!data.length){toast("Not saved. Check the update policy on the orders table.");return load()}
  const o=orders.find(x=>String(x[KEY])===String(key));if(o)o.status=status;
  render();toast("Status updated");
}

