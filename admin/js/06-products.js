/* ---------- Products & Categories ---------- */
function renderProducts(){
  const cv=$("pCat").value;
  $("pCat").innerHTML='<option value="">No category</option>'+categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  $("pCat").value=cv;
  $("catList").innerHTML=missing.categories?miss("categories"):!categories.length?none("tag","No categories yet. Add your first one above."):
    `<table class="slim"><thead><tr><th>Name</th><th>Products</th><th></th></tr></thead><tbody>`+
    categories.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${products.filter(p=>String(p.category_id)===String(c.id)).length}</td><td style="text-align:right"><button class="btn ghost sm" data-del="categories" data-id="${esc(c.id)}" aria-label="Delete category">${I("trash","ic sm")}Delete</button></td></tr>`).join("")+`</tbody></table>`;
  $("prodList").innerHTML=missing.products?miss("products"):!products.length?none("bag","No products yet. Add your first one above."):
    `<table><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Visible</th><th></th></tr></thead><tbody>`+
    products.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(catName(p.category_id))}</td><td><input class="field num" style="width:110px" type="number" min="0" value="${esc(p.price)}" data-tbl="products" data-id="${esc(p.id)}" data-f="price" data-type="num" aria-label="Price"></td><td>${esc(p.stock)}</td><td><select class="field" data-tbl="products" data-id="${esc(p.id)}" data-f="active" data-type="bool" aria-label="Visible"><option value="true" ${p.active?"selected":""}>Visible</option><option value="false" ${!p.active?"selected":""}>Hidden</option></select></td><td style="text-align:right"><button class="btn ghost sm" data-del="products" data-id="${esc(p.id)}" aria-label="Delete product">${I("trash","ic sm")}Delete</button></td></tr>`).join("")+`</tbody></table>`;
}
$("addCat").onclick=async()=>{
  const name=$("catName").value.trim();if(!name)return toast("Enter a category name");
  const {error}=await sb.from("categories").insert({name});
  if(error)return toast("Could not add: "+error.message);
  $("catName").value="";await load();toast("Category added");
};
$("addProd").onclick=async()=>{
  const name=$("pName").value.trim();if(!name)return toast("Enter a product name");
  const row={name,price:num($("pPrice").value),stock:parseInt($("pStock").value)||0,active:true};
  if($("pCat").value)row.category_id=$("pCat").value;
  const {error}=await sb.from("products").insert(row);
  if(error)return toast("Could not add: "+error.message);
  $("pName").value=$("pPrice").value=$("pStock").value="";await load();toast("Product added");
};

