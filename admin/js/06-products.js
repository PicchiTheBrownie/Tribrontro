/* ---------- Products & Categories (lists) ---------- */
/* the shop sections the website understands (same ids as CATEGORIES in js/data.js) */
const SITE_TAGS=[["t-shirts","T-Shirts"],["oversized","Oversized"],["graphic","Graphic"],["essentials","Essentials"],["new-arrivals","New arrivals"],["limited-drop","Limited drop"]];
const tagLabel=t=>(SITE_TAGS.find(x=>x[0]===t)||[0,t])[1];
const arr=v=>Array.isArray(v)?v:(typeof v==="string"&&v.trim()?v.split(",").map(s=>s.trim()).filter(Boolean):[]);
const thumb=p=>p.img?`<img class="thumb" src="${esc(p.img)}" alt="" loading="lazy">`:`<span class="thumb ph">${esc(ini(p.name))}</span>`;

function renderProducts(){
  if(typeof pfRefresh==="function")pfRefresh();   /* category dropdown + preview, see 06b-product-form.js */
  $("catList").innerHTML=missing.categories?miss("categories"):!categories.length?none("tag","No categories yet. Add your first one above."):
    `<table class="slim"><thead><tr><th>Name</th><th>Products</th><th></th></tr></thead><tbody>`+
    categories.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${products.filter(p=>String(p.category_id)===String(c.id)).length}</td><td style="text-align:right"><button class="btn ghost sm" data-del="categories" data-id="${esc(c.id)}" aria-label="Delete category">${I("trash","ic sm")}Delete</button></td></tr>`).join("")+`</tbody></table>`;
  $("prodList").innerHTML=missing.products?miss("products"):!products.length?none("bag","No products yet. Add your first one above."):
    `<table><thead><tr><th>Product</th><th>Shop sections</th><th>Variants</th><th>Price</th><th>Stock</th><th>Website</th><th></th></tr></thead><tbody>`+
    products.map(p=>{
      const tg=arr(p.tags).map(t=>`<span class="pill">${esc(tagLabel(t))}</span>`).join(" ")||"—";
      return `<tr><td><div class="who">${thumb(p)}<div><b>${esc(p.name)}</b><small>${esc(catName(p.category_id))}</small></div></div></td>`+
      `<td class="tagcell">${tg}</td>`+
      `<td><small>${arr(p.sizes).map(esc).join(", ")||"No sizes"}</small><small>${arr(p.colors).map(esc).join(", ")||"No colors"}</small></td>`+
      `<td><input class="field num" style="width:100px" type="number" min="0" value="${esc(p.price)}" data-tbl="products" data-id="${esc(p.id)}" data-f="price" data-type="num" aria-label="Price"></td>`+
      `<td><input class="field num" type="number" min="0" value="${esc(p.stock)}" data-tbl="products" data-id="${esc(p.id)}" data-f="stock" data-type="num" aria-label="Stock"></td>`+
      `<td><select class="field" data-tbl="products" data-id="${esc(p.id)}" data-f="active" data-type="bool" aria-label="Visible"><option value="true" ${p.active!==false?"selected":""}>Visible</option><option value="false" ${p.active===false?"selected":""}>Hidden</option></select></td>`+
      `<td style="text-align:right;white-space:nowrap"><button class="btn ghost sm" data-edit="${esc(p.id)}" aria-label="Edit product">${I("pencil","ic sm")}Edit</button> <button class="btn ghost sm" data-del="products" data-id="${esc(p.id)}" aria-label="Delete product">${I("trash","ic sm")}Delete</button></td></tr>`}).join("")+`</tbody></table>`;
}
$("addCat").onclick=async()=>{
  const name=$("catName").value.trim();if(!name)return toast("Enter a category name");
  const {error}=await sb.from("categories").insert({name});
  if(error)return toast("Could not add: "+error.message);
  $("catName").value="";await load();toast("Category added");
};
