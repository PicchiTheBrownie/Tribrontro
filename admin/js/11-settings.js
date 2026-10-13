/* ---------- Settings & Admin Roles ---------- */
function renderAdmin(){
  $("me").textContent=me||"—";
  $("adminList").innerHTML=missing.admins?miss("admins"):!admins.length?none("shield","No admins listed yet. Add the people who can manage the store."):
    `<table class="slim"><thead><tr><th>Email</th><th>Role</th><th></th></tr></thead><tbody>`+
    admins.map(a=>`<tr><td><b>${esc(a.email)}</b>${a.email===me?'<small>You</small>':""}</td><td><select class="field" data-tbl="admins" data-id="${esc(a.id)}" data-f="role" aria-label="Role">${["admin","manager","staff"].map(r=>`<option value="${r}" ${r===a.role?"selected":""}>${r}</option>`).join("")}</select></td><td style="text-align:right"><button class="btn ghost sm" data-del="admins" data-id="${esc(a.id)}" aria-label="Remove admin">${I("trash","ic sm")}Remove</button></td></tr>`).join("")+`</tbody></table>`;
}
$("addAdmin").onclick=async()=>{
  const email=$("aEmail").value.trim().toLowerCase();if(!email)return toast("Enter an email");
  const {error}=await sb.from("admins").insert({email,role:$("aRole").value});
  if(error)return toast("Could not add: "+error.message);
  $("aEmail").value="";await load();toast("Admin added");
};

