/* ============================================================
   NEXUS AI — APP v2.4
   Auto-detects deployed server and enables backend mode
   ============================================================ */

const MODULES = ["home","chatbot","generator","sentiment","academiq","projects","about","settings"];
let currentModule = "home";

/* ── Navigation ──────────────────────────────────────────── */
function navigateTo(module) {
  if (!MODULES.includes(module)) return;
  MODULES.forEach(m => {
    document.getElementById(`${m}-section`)?.classList.remove("active","entering");
    document.querySelector(`[data-nav="${m}"]`)?.classList.remove("active");
  });
  const target = document.getElementById(`${module}-section`);
  if (target) { target.classList.add("active"); requestAnimationFrame(()=>target.classList.add("entering")); }
  document.querySelector(`[data-nav="${module}"]`)?.classList.add("active");
  currentModule = module;
  window.scrollTo({top:0,behavior:"smooth"});
  const T={home:"NEXUS AI",chatbot:"EduChat | NEXUS AI",generator:"StudyForge | NEXUS AI",
    sentiment:"EmpathyLens | NEXUS AI",academiq:"AcademIQ | NEXUS AI",
    projects:"ML Projects | NEXUS AI",about:"About | NEXUS AI",settings:"Settings | NEXUS AI"};
  document.title = T[module]||"NEXUS AI";
}

function initNavScroll() {
  const nav = document.getElementById("main-nav");
  window.addEventListener("scroll",()=>nav?.classList.toggle("scrolled",scrollY>10));
}

function animateCounter(el,target,suffix="",dur=1800) {
  const start=performance.now();
  function tick(now){
    const p=Math.min((now-start)/dur,1);
    el.textContent=Math.round(target*(1-Math.pow(1-p,3)))+suffix;
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounters() {
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){
      animateCounter(e.target,parseInt(e.target.dataset.counter),e.target.dataset.suffix||"");
      obs.unobserve(e.target);
    }});
  },{threshold:0.4});
  document.querySelectorAll("[data-counter]").forEach(c=>obs.observe(c));
}

function initModuleCards() {
  document.querySelectorAll(".module-card[data-module]").forEach(c=>{
    c.addEventListener("click",()=>navigateTo(c.dataset.module));
    c.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")navigateTo(c.dataset.module);});
  });
}

function initNavButtons() {
  document.querySelectorAll("[data-nav]").forEach(b=>b.addEventListener("click",()=>navigateTo(b.dataset.nav)));
}

function initKeyboardShortcuts() {
  const map={"1":"home","2":"chatbot","3":"generator","4":"sentiment","5":"academiq","6":"projects","7":"about","8":"settings"};
  document.addEventListener("keydown",e=>{
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    const t=document.activeElement?.tagName;
    if(t==="TEXTAREA"||t==="INPUT"||t==="SELECT") return;
    if(map[e.key]) navigateTo(map[e.key]);
  });
}

/* ── Status Banner ───────────────────────────────────────── */
function showStatusBanner(type,message,action) {
  document.getElementById("status-banner")?.remove();
  const c={
    info:   {bg:"rgba(0,229,255,0.08)",  border:"rgba(0,229,255,0.25)",  icon:"ℹ️"},
    warn:   {bg:"rgba(255,182,39,0.08)", border:"rgba(255,182,39,0.3)",  icon:"⚠️"},
    error:  {bg:"rgba(255,69,58,0.08)",  border:"rgba(255,69,58,0.25)",  icon:"❌"},
    success:{bg:"rgba(48,209,88,0.08)",  border:"rgba(48,209,88,0.25)",  icon:"✅"},
  }[type]||{bg:"rgba(0,229,255,0.08)",border:"rgba(0,229,255,0.25)",icon:"ℹ️"};
  const banner=document.createElement("div");
  banner.id="status-banner";
  banner.style.cssText=`position:fixed;top:68px;left:0;right:0;z-index:90;
    background:${c.bg};border-bottom:1px solid ${c.border};
    backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    display:flex;align-items:center;gap:10px;padding:10px 32px;
    font-size:0.83rem;animation:fadeSlideDown 0.3s ease both;`;
  banner.innerHTML=`
    <span style="font-size:1rem">${c.icon}</span>
    <span style="flex:1;color:var(--text-primary)">${message}</span>
    ${action?`<button onclick="${action.fn}()" style="padding:5px 14px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:20px;color:var(--text-primary);font-size:0.78rem;cursor:pointer;font-family:var(--font-body)">${action.label}</button>`:""}
    <button onclick="document.getElementById('status-banner')?.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:2px 6px">✕</button>`;
  document.body.appendChild(banner);
  if(type==="success") setTimeout(()=>banner.remove(),4000);
}

/* ── Nav dot ─────────────────────────────────────────────── */
function updateNavStatus(status) {
  let dot=document.getElementById("nav-status-dot");
  if(!dot){
    dot=document.createElement("div");
    dot.id="nav-status-dot";
    dot.style.cssText="width:7px;height:7px;border-radius:50%;flex-shrink:0;transition:background 0.4s,box-shadow 0.4s;margin-right:4px;";
    document.querySelector(".nav-logo")?.appendChild(dot);
  }
  const s={
    online: {bg:"#30D158",glow:"rgba(48,209,88,0.6)"},
    direct: {bg:"#FFB627",glow:"rgba(255,182,39,0.6)"},
    offline:{bg:"#FF453A",glow:"rgba(255,69,58,0.6)"},
    idle:   {bg:"#4A4E7A",glow:"transparent"}
  }[status]||{bg:"#4A4E7A",glow:"transparent"};
  dot.style.background=s.bg;
  dot.style.boxShadow=`0 0 6px ${s.glow}`;
  dot.title=`Mode: ${status}`;
}

window.openSettings=()=>{navigateTo("settings");document.getElementById("status-banner")?.remove();sessionStorage.setItem("nexus_setup_dismissed","1");};
window.goToAbout=()=>navigateTo("about");

/* ── Health check — uses auto-detect logic ───────────────── */
async function checkBackendHealth() {
  updateNavStatus("idle");

  // getCfg() is defined in api.js and auto-detects deployed vs local
  const cfg = window.getCfg ? window.getCfg() : { useBackend:false, backendUrl:"", groqKey:"", deployed:false };

  if (cfg.deployed) {
    // Running on Render or a real server — backend IS the server
    // Just ping health endpoint on same origin
    try {
      const res  = await fetch(`${cfg.backendUrl}/api/health`, {signal:AbortSignal.timeout(5000)});
      const data = await res.json();
      if (data.status==="ok") {
        if (data.groqKeySet) {
          updateNavStatus("online");
          showStatusBanner("success","Backend ready — LLaMA 3.3 70B via Groq is live.",null);
        } else {
          updateNavStatus("offline");
          showStatusBanner("error",
            "GROQ_API_KEY not found on server. Add it in Render → Environment Variables.",
            {label:"How to fix",fn:"goToAbout"}
          );
        }
      } else throw new Error("bad");
    } catch {
      updateNavStatus("offline");
      showStatusBanner("error","Server health check failed. Check Render logs.","");
    }
    return;
  }

  // Running locally
  if (cfg.useBackend) {
    try {
      const res  = await fetch(`${cfg.backendUrl}/api/health`,{signal:AbortSignal.timeout(3000)});
      const data = await res.json();
      if (data.status==="ok") {
        updateNavStatus(data.groqKeySet?"online":"direct");
        showStatusBanner(data.groqKeySet?"success":"warn",
          data.groqKeySet?"Backend connected — Groq ready.":"Backend running but GROQ_API_KEY missing in .env.",
          data.groqKeySet?null:{label:"View Guide",fn:"goToAbout"}
        );
      } else throw new Error("bad");
    } catch {
      if(window.NEXUS_CONFIG) window.NEXUS_CONFIG.useBackend=false;
      localStorage.setItem("nexus_use_backend","false");
      _fallbackToDirectMode(cfg.groqKey);
    }
    return;
  }

  // Direct mode (localStorage key)
  _fallbackToDirectMode(cfg.groqKey);
}

function _fallbackToDirectMode(groqKey) {
  if (groqKey && groqKey.startsWith("gsk_")) {
    updateNavStatus("direct");
    showStatusBanner("info","Direct mode — Groq key found, AI features ready.",null);
    setTimeout(()=>document.getElementById("status-banner")?.remove(),3500);
  } else if (!sessionStorage.getItem("nexus_setup_dismissed")) {
    updateNavStatus("offline");
    setTimeout(()=>showStatusBanner("warn",
      "No Groq API key found — AI features need a key to work.",
      {label:"⚙️ Add Key",fn:"openSettings"}
    ),2600);
  } else {
    updateNavStatus("offline");
  }
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded",()=>{
  initNavScroll();
  initModuleCards();
  initNavButtons();
  initCounters();
  initKeyboardShortcuts();
  navigateTo("home");
  // Wait for api.js to initialise getCfg before health check
  setTimeout(checkBackendHealth, 100);
  window.navigateTo         = navigateTo;
  window.checkBackendHealth = checkBackendHealth;
  window.showStatusBanner   = showStatusBanner;
  window.updateNavStatus    = updateNavStatus;
  console.log("%c NEXUS AI v2.4 ","background:#FFB627;color:#04040E;font-weight:bold;font-size:12px;padding:4px 8px;");
});
