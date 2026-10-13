/* auth */
$("loginForm").onsubmit=async e=>{
  e.preventDefault();$("loginErr").textContent="";
  const b=$("loginForm").querySelector("button[type=submit]");
  b.disabled=true;b.textContent="Signing in…";
  const {error}=await sb.auth.signInWithPassword({email:$("em").value.trim(),password:$("pw").value});
  b.disabled=false;b.textContent="Sign in";
  if(error)return $("loginErr").textContent=error.message;
  start();
};
$("pwToggle").onclick=()=>{
  const p=$("pw"),show=p.type==="password";
  p.type=show?"text":"password";
  $("pwToggle").innerHTML=I(show?"eyeoff":"eye","ic");
  $("pwToggle").setAttribute("aria-label",show?"Hide password":"Show password");
};
$("logout").onclick=async()=>{await sb.auth.signOut();$("app").classList.add("hidden");$("login").classList.remove("hidden");$("pw").value=""};
async function start(){
  $("login").classList.add("hidden");$("app").classList.remove("hidden");
  const {data}=await sb.auth.getUser();me=(data&&data.user&&data.user.email)||"";
  await load();
}

