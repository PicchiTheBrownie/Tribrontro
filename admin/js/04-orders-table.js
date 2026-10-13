/* ---------- Orders ---------- */
function table(rows){
  if(!rows.length)return none("bag","No orders match yet.");
  return `<table><thead><tr><th>Order</th><th>Customer</th><th>Delivery</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th></tr></thead><tbody>`+
  rows.map(o=>`<tr>
    <td><span class="ord">#${esc(o.ordern_no)}</span><small>${fmt(o.created_at)}</small></td>
    <td><div class="who"><span class="av">${esc(ini(o.name))}</span><div>${esc(o.name)}<small>${I("phone")}${esc(o.phone)}</small><small>${I("mail")}${esc(o.email)}</small></div></div></td>
    <td>${I("pin")}${esc(o.district)}${o.area?", "+esc(o.area):""}<small>${esc(o.address)}</small>${o.note?`<small class="note">${I("note")}${esc(o.note)}</small>`:""}</td>
    <td>${I("bag")}${esc(o.product_variant)}<small>Qty ${esc(o.quantity)}</small>${o.iteam?`<small>${esc(typeof o.iteam==="object"?JSON.stringify(o.iteam):o.iteam)}</small>`:""}</td>
    <td><span class="pill">${I("card")}${esc(o.pay_method||"COD")}</span>${o.trx_id?`<small>TrxID: ${esc(o.trx_id)}</small>`:""}</td>
    <td><b>${tk(o.total)}</b><small>Subtotal ${tk(o.subtotal)} + Ship ${tk(o.shipping)}${num(o.discount)?` − Disc ${tk(o.discount)}`:""}</small>${o.promo?`<small>${I("tag")}${esc(o.promo)}</small>`:""}</td>
    <td><select class="field s-${esc(o.status)}" data-key="${esc(o[KEY])}" aria-label="Order status">${(STATUSES.includes(o.status)?STATUSES:[o.status,...STATUSES]).map(s=>`<option value="${esc(s)}" ${s===o.status?"selected":""}>${esc(s)}</option>`).join("")}</select></td>
  </tr>`).join("")+`</tbody></table>`;
}

