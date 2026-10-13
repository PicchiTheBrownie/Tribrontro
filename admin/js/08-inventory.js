/* ---------- Inventory ---------- */
function renderInventory(){
  const out=products.filter(p=>num(p.stock)<=0).length;
  const low=products.filter(p=>num(p.stock)>0&&num(p.stock)<=LOW).length;
  $("invStats").innerHTML=stat("tag","",products.length,"Products")+stat("stack","t-confirmed",sum(products,p=>p.stock),"Units in stock")+stat("clock","t-pending",low,`Low stock (${LOW} or fewer)`)+stat("x","t-cancelled",out,"Out of stock");
  const q=$("iq").value.trim().toLowerCase(),lv=$("istock").value;
  const rows=products.filter(p=>(!q||String(p.name).toLowerCase().includes(q))&&(!lv||(lv==="out"?num(p.stock)<=0:num(p.stock)>0&&num(p.stock)<=LOW))).sort((a,b)=>num(a.stock)-num(b.stock));
  $("invList").innerHTML=missing.products?miss("products"):!rows.length?none("stack","No products to show."):
    `<table class="slim"><thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Level</th></tr></thead><tbody>`+
    rows.map(p=>{const s=num(p.stock);const lvl=s<=0?'<span class="pill bad">Out of stock</span>':s<=LOW?'<span class="pill warn">Low stock</span>':'<span class="pill good">In stock</span>';
      return `<tr><td><b>${esc(p.name)}</b></td><td>${esc(catName(p.category_id))}</td><td><input class="field num" type="number" min="0" value="${s}" data-tbl="products" data-id="${esc(p.id)}" data-f="stock" data-type="num" aria-label="Stock for ${esc(p.name)}"></td><td>${lvl}</td></tr>`}).join("")+`</tbody></table>`;
}

