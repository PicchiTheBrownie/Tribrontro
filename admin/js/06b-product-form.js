/* ---------- Product form: add / edit, sizes, colors, photos, live preview ---------- */
const BUCKET="product-images";
const SIZE_LIST=["XS","S","M","L","XL","XXL"];
const COLOR_PRESETS=[["Black","#18140F"],["Purple","#6A1B9A"],["Off-white","#F3EEE4"],["Brown","#7C6A55"],["Charcoal","#3A352D"]];
const blankPF=()=>({id:null,tags:new Set(),sizes:["S","M","L","XL"],colors:[],img:"",imgBack:"",busy:0});
let PF=blankPF();

/* ----- chips (shop sections, sizes, colors) ----- */
function pfChips(){
  $("pTags").innerHTML=SITE_TAGS.map(([id,l])=>`<button type="button" class="chipx ${PF.tags.has(id)?"on":""}" data-tag="${id}">${esc(l)}</button>`).join("");
  const extra=PF.sizes.filter(s=>!SIZE_LIST.includes(s));
  $("pSizes").innerHTML=[...SIZE_LIST,...extra].map(s=>`<button type="button" class="chipx ${PF.sizes.includes(s)?"on":""}" data-size="${esc(s)}">${esc(s)}</button>`).join("");
  const have=n=>PF.colors.find(c=>c.name===n);
  const custom=PF.colors.filter(c=>!COLOR_PRESETS.some(p=>p[0]===c.name));
  $("pColors").innerHTML=[...COLOR_PRESETS.map(([n,h])=>({name:n,hex:(have(n)||{}).hex||h})),...custom].map(c=>`<button type="button" class="chipx ${have(c.name)?"on":""}" data-col="${esc(c.name)}" data-hex="${esc(c.hex)}"><i style="background:${esc(c.hex)}"></i>${esc(c.name)}</button>`).join("");
}
$("pTags").onclick=e=>{const b=e.target.closest("[data-tag]");if(!b)return;PF.tags.has(b.dataset.tag)?PF.tags.delete(b.dataset.tag):PF.tags.add(b.dataset.tag);pfChips();pfPreview()};
$("pSizes").onclick=e=>{const b=e.target.closest("[data-size]");if(!b)return;const s=b.dataset.size;PF.sizes=PF.sizes.includes(s)?PF.sizes.filter(x=>x!==s):[...PF.sizes,s];pfSortSizes();pfChips()};
$("pColors").onclick=e=>{const b=e.target.closest("[data-col]");if(!b)return;const n=b.dataset.col;PF.colors=PF.colors.find(c=>c.name===n)?PF.colors.filter(c=>c.name!==n):[...PF.colors,{name:n,hex:b.dataset.hex}];pfChips();pfPreview()};
function pfSortSizes(){const k=s=>{const i=SIZE_LIST.indexOf(s);return i<0?99:i};PF.sizes.sort((a,b)=>k(a)-k(b)||a.localeCompare(b))}
$("sAdd").onclick=()=>{const s=$("sName").value.trim().toUpperCase();if(!s)return;if(!PF.sizes.includes(s))PF.sizes.push(s);pfSortSizes();$("sName").value="";pfChips()};
$("cAdd").onclick=()=>{
  const n=$("cName").value.trim();if(!n)return toast("Type a color name first");
  const hex=$("cHex").value,i=PF.colors.findIndex(c=>c.name.toLowerCase()===n.toLowerCase());
  if(i>-1)PF.colors[i].hex=hex;else PF.colors.push({name:n,hex});
  $("cName").value="";pfChips();pfPreview();
};
["sName","cName"].forEach(id=>$(id).addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();$(id==="sName"?"sAdd":"cAdd").click()}}));

/* ----- photos ----- */
const SLOT={front:{key:"img",file:"fileFront",img:"imgFront",st:"stFront",url:"urlFront",drop:"dropFront"},back:{key:"imgBack",file:"fileBack",img:"imgBack",st:"stBack",url:"urlBack",drop:"dropBack"}};
function pfSlotDraw(slot){
  const S=SLOT[slot],src=PF[S.key],im=$(S.img),box=$(S.drop);
  if(src){im.src=src;im.classList.remove("hidden");box.classList.add("has")}else{im.removeAttribute("src");im.classList.add("hidden");box.classList.remove("has")}
  $(S.url).value=/^data:/.test(src)?"":src;
}
async function shrink(file,max=1600){
  const bmp=await createImageBitmap(file);
  const k=Math.min(1,max/Math.max(bmp.width,bmp.height));
  const c=document.createElement("canvas");c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);
  c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
  let blob=await new Promise(r=>c.toBlob(r,"image/webp",.86));
  if(!blob||blob.type!=="image/webp")blob=await new Promise(r=>c.toBlob(r,"image/jpeg",.86));
  return blob;
}
async function uploadImage(file){
  if(!/^image\//.test(file.type))throw new Error("Please choose an image file");
  if(file.size>15*1024*1024)throw new Error("That photo is over 15 MB");
  const blob=await shrink(file);
  const ext=blob.type==="image/webp"?"webp":"jpg";
  const path=`products/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
  const {error}=await sb.storage.from(BUCKET).upload(path,blob,{contentType:blob.type,cacheControl:"31536000"});
  if(error)throw error;
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
async function pfFile(slot,file){
  if(!file)return;const S=SLOT[slot];
  $(S.st).textContent="Uploading…";PF.busy++;$("pSave").disabled=true;
  try{PF[S.key]=await uploadImage(file);$(S.st).textContent="Uploaded ✓"}
  catch(err){$(S.st).textContent="Upload failed";pfError(err,true)}
  finally{PF.busy--;$("pSave").disabled=PF.busy>0;pfSlotDraw(slot);pfPreview()}
}
Object.entries(SLOT).forEach(([slot,S])=>{
  const drop=$(S.drop),inp=$(S.file);
  drop.onclick=()=>inp.click();
  drop.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();inp.click()}};
  inp.onchange=()=>{pfFile(slot,inp.files[0]);inp.value=""};
  ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add("over")}));
  ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove("over")}));
  drop.addEventListener("drop",e=>pfFile(slot,e.dataTransfer.files[0]));
  $(S.url).onchange=()=>{PF[S.key]=$(S.url).value.trim();$(S.st).textContent=PF[S.key]?"Link added":"No photo";pfSlotDraw(slot);pfPreview()};
});
document.querySelectorAll("[data-clear]").forEach(b=>b.onclick=()=>{const S=SLOT[b.dataset.clear];PF[S.key]="";$(S.st).textContent="No photo";pfSlotDraw(b.dataset.clear);pfPreview()});

/* ----- live preview (looks like a card on the website) ----- */
function pfPreview(){
  const name=$("pName").value.trim()||"Product name",price=num($("pPrice").value),stock=$("pStock").value===""?1:num($("pStock").value);
  const badge=stock<=0?"Sold out":PF.tags.has("limited-drop")?"Limited":PF.tags.has("new-arrivals")?"New":"";
  const dots=PF.colors.map(c=>`<span style="background:${esc(c.hex)}" title="${esc(c.name)}"></span>`).join("");
  $("pv").innerHTML=`<div class="pv-img ${PF.img?"":"ph"}" ${PF.img?`style="background-image:url('${esc(PF.img)}')"`:""}>${PF.img?"":esc(ini(name))}${badge?`<em>${badge}</em>`:""}</div><div class="pv-row"><b>${esc(name)}</b><span>${tk(price)}</span></div><div class="pv-dots">${dots}</div><small>${PF.sizes.map(esc).join(" · ")||"No sizes yet"}</small>`;
}
["pName","pPrice","pStock"].forEach(id=>$(id).addEventListener("input",pfPreview));

/* ----- category dropdown (called by renderProducts) ----- */
function pfRefresh(){
  const v=$("pCat").value;
  $("pCat").innerHTML='<option value="">No category</option>'+categories.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  $("pCat").value=v;pfPreview();
}

/* ----- fill / clear the form ----- */
function pfMode(){
  const edit=PF.id!=null;
  $("pfTitle").textContent=edit?"Edit product":"Add a product";
  $("pSave").querySelector("span").textContent=edit?"Update product":"Save product";
  $("pCancel").classList.toggle("hidden",!edit);
  $("pEditor").classList.toggle("editing",edit);
}
function pfReset(){
  PF=blankPF();
  ["pName","pDesc","pPrice","pStock","sName","cName"].forEach(id=>$(id).value="");
  $("pCat").value="";$("pTex").value="1";$("pActive").value="true";
  $("stFront").textContent=$("stBack").textContent="No photo";
  pfChips();pfSlotDraw("front");pfSlotDraw("back");pfPreview();pfMode();
}
function pfLoad(p){
  PF=blankPF();PF.id=p.id;
  PF.tags=new Set(arr(p.tags));PF.sizes=arr(p.sizes);pfSortSizes();
  const hx=(p.color_hex&&typeof p.color_hex==="object")?p.color_hex:{};
  PF.colors=arr(p.colors).map(n=>({name:n,hex:hx[n]||(COLOR_PRESETS.find(c=>c[0]===n)||[0,"#888888"])[1]}));
  PF.img=p.img||"";PF.imgBack=p.img_back||"";
  $("pName").value=p.name||"";$("pDesc").value=p.description||"";
  $("pPrice").value=num(p.price)||"";$("pStock").value=p.stock==null?"":num(p.stock);
  $("pCat").value=p.category_id==null?"":String(p.category_id);$("pTex").value=String(p.tex||1);
  $("pActive").value=p.active===false?"false":"true";
  $("stFront").textContent=PF.img?"Photo added":"No photo";$("stBack").textContent=PF.imgBack?"Photo added":"No photo";
  pfChips();pfSlotDraw("front");pfSlotDraw("back");pfPreview();pfMode();
  $("pEditor").scrollIntoView({behavior:"smooth",block:"start"});
}
$("pReset").onclick=pfReset;
$("pCancel").onclick=pfReset;
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-edit]");if(!b)return;
  const p=products.find(x=>String(x.id)===b.dataset.edit);if(p)pfLoad(p);
});

/* ----- errors that need a fix in Supabase get a clear message ----- */
function pfError(err,quiet){
  const m=String((err&&err.message)||err||"");
  let hint="";
  if(/column|schema cache/i.test(m))hint="Your products table is missing some columns. Run supabase/setup-products.sql in the Supabase SQL editor, then refresh this page.";
  else if(/row-level security|permission|not authorized|policy/i.test(m))hint="Saving was blocked. Make sure your email is in the admins table and that supabase/setup-products.sql has been run.";
  else if(/bucket|not found/i.test(m))hint="The photo storage is not set up yet. Run supabase/setup-products.sql in the Supabase SQL editor, then refresh.";
  const box=$("pfHelp");
  if(hint){box.innerHTML=I("note","ic")+"<span>"+esc(hint)+"</span>";box.classList.remove("hidden");box.scrollIntoView({behavior:"smooth",block:"center"})}
  toast(quiet?("Photo: "+(m||"upload failed")):("Could not save: "+m));
}

/* ----- save ----- */
function pfCollect(){
  const name=$("pName").value.trim();
  if(!name){toast("Enter a product name");$("pName").focus();return null}
  const price=num($("pPrice").value);
  if(!(price>0)){toast("Enter a price");$("pPrice").focus();return null}
  if($("pStock").value===""){toast("Enter the stock (0 if sold out)");$("pStock").focus();return null}
  if(!PF.sizes.length){toast("Pick at least one size");return null}
  if(!PF.colors.length){toast("Pick at least one color");return null}
  const hex={};PF.colors.forEach(c=>hex[c.name]=c.hex);
  return {name,description:$("pDesc").value.trim()||null,price,stock:Math.max(0,parseInt($("pStock").value)||0),
    active:$("pActive").value==="true",category_id:$("pCat").value||null,tex:Number($("pTex").value)||1,
    tags:[...PF.tags],sizes:[...PF.sizes],colors:PF.colors.map(c=>c.name),color_hex:hex,img:PF.img||null,img_back:PF.imgBack||null};
}
$("pSave").onclick=async()=>{
  if(PF.busy>0)return toast("Wait for the photo to finish uploading");
  const row=pfCollect();if(!row)return;
  const btn=$("pSave");btn.disabled=true;
  const editing=PF.id!=null;
  const r=editing?await sb.from("products").update(row).eq("id",PF.id).select():await sb.from("products").insert(row).select();
  btn.disabled=false;
  if(r.error)return pfError(r.error);
  if(editing&&(!r.data||!r.data.length))return pfError("row-level security: nothing was updated");
  $("pfHelp").classList.add("hidden");
  pfReset();await load();
  toast(editing?"Product updated":"Product added. It is now on the website.");
};

/* when a product is deleted, remove its photos from storage too (see 12-render-actions.js) */
async function dropPhotos(urls){
  const paths=(urls||[]).filter(Boolean).map(u=>{const i=String(u).indexOf("/"+BUCKET+"/");return i<0?null:decodeURIComponent(String(u).slice(i+BUCKET.length+2).split("?")[0])}).filter(Boolean);
  if(paths.length){try{await sb.storage.from(BUCKET).remove(paths)}catch(e){}}
}

pfReset();
