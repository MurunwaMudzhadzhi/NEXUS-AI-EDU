/* ============================================================
   NEXUS AI — SETTINGS v2.4
   Shows server-mode info when deployed, key field when local
   ============================================================ */
const SK = {
  GROQ_KEY   :"nexq_groq_key",
  BACKEND_URL:"nexus_backend_url",
  USE_BACKEND:"nexus_use_backend",
  THEME      :"nexus_theme"
};

function getSettings() {
  return {
    groqKey   :(localStorage.getItem(SK.GROQ_KEY)    ||"").trim(),
    backendUrl:(localStorage.getItem(SK.BACKEND_URL) ||"http://localhost:3001").trim(),
    useBackend:localStorage.getItem(SK.USE_BACKEND)  ==="true",
    theme     :localStorage.getItem(SK.THEME)        ||"dark"
  };
}
function saveSettings(s) {
  localStorage.setItem(SK.GROQ_KEY,   (s.groqKey    ||"").trim());
  localStorage.setItem(SK.BACKEND_URL,(s.backendUrl ||"http://localhost:3001").trim());
  localStorage.setItem(SK.USE_BACKEND,s.useBackend?"true":"false");
  localStorage.setItem(SK.THEME,      s.theme||"dark");
}

/* ── Themes ──────────────────────────────────────────────── */
function applyTheme(theme) {
  const r=document.documentElement;
  const T={
    dark:    {"--bg-base":"#04040E","--bg-deep":"#080816","--bg-surface":"#0D0D22","--bg-card":"rgba(12,12,30,0.82)","--bg-card-hover":"rgba(18,18,42,0.92)","--bg-input":"rgba(255,255,255,0.04)","--accent-teal":"#00E5FF","--accent-amber":"#FFB627","--accent-purple":"#BF5AF2","--accent-green":"#30D158","--accent-red":"#FF453A","--text-primary":"#E8EAFF","--text-secondary":"#8890C4","--text-muted":"#4A4E7A","--border-subtle":"rgba(255,255,255,0.06)","--shadow-card":"0 8px 40px rgba(0,0,0,0.5)"},
    midnight:{"--bg-base":"#000000","--bg-deep":"#060608","--bg-surface":"#0A0A10","--bg-card":"rgba(8,8,14,0.9)","--bg-card-hover":"rgba(14,14,24,0.95)","--bg-input":"rgba(255,255,255,0.03)","--accent-teal":"#00E5FF","--accent-amber":"#FFB627","--accent-purple":"#BF5AF2","--accent-green":"#30D158","--accent-red":"#FF453A","--text-primary":"#E8EAFF","--text-secondary":"#6870A8","--text-muted":"#353760","--border-subtle":"rgba(255,255,255,0.04)","--shadow-card":"0 8px 40px rgba(0,0,0,0.8)"},
    light:   {"--bg-base":"#F0F2FF","--bg-deep":"#E8EAFF","--bg-surface":"#DDE0F8","--bg-card":"rgba(255,255,255,0.82)","--bg-card-hover":"rgba(255,255,255,0.96)","--bg-input":"rgba(0,0,0,0.04)","--accent-teal":"#0077FF","--accent-amber":"#E08800","--accent-purple":"#7C3AED","--accent-green":"#1A9E3F","--accent-red":"#D93025","--text-primary":"#0D0F2E","--text-secondary":"#3A3D6B","--text-muted":"#7880B4","--border-subtle":"rgba(0,0,0,0.08)","--shadow-card":"0 8px 40px rgba(0,0,0,0.12)"},
    forest:  {"--bg-base":"#040E06","--bg-deep":"#071309","--bg-surface":"#0C1A0E","--bg-card":"rgba(8,20,10,0.85)","--bg-card-hover":"rgba(12,28,14,0.92)","--bg-input":"rgba(255,255,255,0.04)","--accent-teal":"#00FF88","--accent-amber":"#AAFF44","--accent-purple":"#00E5A0","--accent-green":"#00FF88","--accent-red":"#FF453A","--text-primary":"#DFFFEC","--text-secondary":"#6FAB80","--text-muted":"#2E5E3A","--border-subtle":"rgba(0,255,136,0.07)","--shadow-card":"0 8px 40px rgba(0,0,0,0.6)"},
    amber:   {"--bg-base":"#0E0800","--bg-deep":"#140C00","--bg-surface":"#1C1100","--bg-card":"rgba(20,12,0,0.85)","--bg-card-hover":"rgba(28,17,0,0.92)","--bg-input":"rgba(255,255,255,0.04)","--accent-teal":"#FFB627","--accent-amber":"#FF7A00","--accent-purple":"#FFD700","--accent-green":"#AAFF44","--accent-red":"#FF453A","--text-primary":"#FFF8EC","--text-secondary":"#AA8050","--text-muted":"#5A3C10","--border-subtle":"rgba(255,182,39,0.07)","--shadow-card":"0 8px 40px rgba(0,0,0,0.6)"}
  };
  const vars=T[theme]||T.dark;
  for(const [k,v] of Object.entries(vars)) r.style.setProperty(k,v);
  r.setAttribute("data-theme",theme);
  localStorage.setItem(SK.THEME,theme);
  document.querySelectorAll(".theme-chip").forEach(c=>c.classList.toggle("active",c.dataset.theme===theme));
}
window.applyTheme=applyTheme;

/* ── Render Page ─────────────────────────────────────────── */
function renderSettingsPage() {
  const section=document.getElementById("settings-section");
  if(!section) return;
  const s=getSettings();
  const deployed=window.isDeployedServer?window.isDeployedServer():false;

  section.innerHTML=`
    <div class="module-inner" style="max-width:720px">
      <div class="module-header">
        <div class="module-header-icon" style="background:rgba(255,182,39,0.12)">⚙️</div>
        <div class="module-header-text">
          <h1>Settings <span style="color:var(--accent-amber)">&amp; Config</span></h1>
          <p>${deployed?"Deployed on server — key managed via Render environment variables":"Local mode — configure your Groq key below"}</p>
        </div>
      </div>

      <!-- ── API KEY SECTION ──────────────────────────────── -->
      ${deployed ? _renderDeployedKeySection() : _renderLocalKeySection(s)}

      <!-- ── THEME ───────────────────────────────────────── -->
      <div class="settings-card" style="margin-bottom:20px">
        <div class="settings-card-header">
          <span class="settings-card-icon">🎨</span>
          <span class="settings-card-title">Theme</span>
        </div>
        <p class="settings-card-desc">Choose a visual theme. Also click <strong>🎨 Theme</strong> in the nav to cycle.</p>
        <div class="theme-grid">
          ${[
            {id:"dark",    label:"Obsidian", bg:"#04040E", accent:"#00E5FF"},
            {id:"midnight",label:"Midnight", bg:"#000000", accent:"#6C63FF"},
            {id:"light",   label:"Daylight", bg:"#F0F2FF", accent:"#0077FF"},
            {id:"forest",  label:"Forest",   bg:"#040E06", accent:"#00FF88"},
            {id:"amber",   label:"Ember",    bg:"#0E0800", accent:"#FFB627"}
          ].map(t=>`
            <button class="theme-chip ${s.theme===t.id?"active":""}" data-theme="${t.id}" onclick="applyTheme('${t.id}')">
              <span class="theme-chip-swatch" style="background:${t.bg};border:2px solid ${t.accent}">
                <span style="background:${t.accent}"></span>
              </span>
              <span class="theme-chip-label">${t.label}</span>
            </button>
          `).join("")}
        </div>
      </div>

      <!-- ── LOCAL BACKEND (only shown when NOT deployed) ── -->
      ${!deployed ? _renderBackendSection(s) : ""}

      <div id="save-msg" style="text-align:center;font-size:0.88rem;min-height:20px"></div>
    </div>`;

  if(!deployed) attachSettingsEvents();
}

/* ── Deployed server panel ───────────────────────────────── */
function _renderDeployedKeySection() {
  return `
    <div class="settings-card" style="margin-bottom:20px;border-color:rgba(48,209,88,0.2)">
      <div class="settings-card-header">
        <span class="settings-card-icon">🖥️</span>
        <span class="settings-card-title">Server Mode — Key Managed by Render</span>
      </div>
      <p class="settings-card-desc">
        You're on a deployed server. The Groq key is stored in <strong>Render's environment variables</strong>,
        not the browser. The backend reads it automatically on every request.
      </p>

      <div style="display:flex;flex-direction:column;gap:10px">
        <button class="action-btn action-btn-green" onclick="testServerKey()" id="server-test-btn" style="align-self:flex-start">
          ▶ Test Server Connection
        </button>
        <div id="server-test-result" style="font-size:0.83rem;color:var(--text-muted)"></div>
      </div>

      <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.02);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:12px">
          If the key is missing or wrong — fix it on Render:
        </div>
        ${[
          "Go to dashboard.render.com → NEXUS-AI-EDU",
          "Click <strong>Environment</strong> in the left sidebar",
          "Click <strong>Edit</strong> → update <code class='inline-code'>GROQ_API_KEY</code> value",
          "Click <strong>Save Changes</strong> — Render redeploys automatically"
        ].map((s,i)=>`
          <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">
            <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent-amber);background:rgba(255,182,39,0.12);border-radius:4px;padding:2px 7px;flex-shrink:0">${i+1}</span>
            <span style="font-size:0.8rem;color:var(--text-secondary)">${s}</span>
          </div>
        `).join("")}
      </div>
    </div>`;
}

/* ── Local key panel ─────────────────────────────────────── */
function _renderLocalKeySection(s) {
  return `
    <div class="settings-card" style="margin-bottom:20px">
      <div class="settings-card-header">
        <span class="settings-card-icon">⚡</span>
        <span class="settings-card-title">Groq API Key</span>
      </div>
      <p class="settings-card-desc">
        Powers all AI features using LLaMA 3.3 70B.
        Get a free key at <a href="https://console.groq.com" target="_blank" class="key-link">console.groq.com</a>.
      </p>
      <div class="form-group" style="margin-bottom:14px">
        <div class="key-input-wrap">
          <input type="password" class="form-input" id="groq-key"
                 value="${s.groqKey}" placeholder="gsk_xxxxxxxxxxxxxxxxxxxx"
                 autocomplete="off" spellcheck="false"
                 style="padding-right:80px;font-family:var(--font-mono);font-size:0.88rem"/>
          <button class="key-toggle-btn" onclick="toggleKey()">
            <span id="toggle-icon">👁</span>
          </button>
        </div>
        <div id="key-format-hint" style="font-size:0.75rem;margin-top:5px;min-height:18px;color:var(--text-muted)">
          ${s.groqKey?(s.groqKey.startsWith("gsk_")?'<span style="color:var(--accent-green)">✓ Format valid</span>':'<span style="color:var(--accent-amber)">⚠ Should start with gsk_</span>'):"Paste your gsk_... key above"}
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px">
        <button class="action-btn action-btn-amber" onclick="saveAndTest()" id="save-test-btn" style="flex:1;min-width:160px">
          💾 Save &amp; Test Key
        </button>
        <button class="action-btn action-btn-ghost" onclick="clearKey()" style="padding:10px 16px">✕ Clear</button>
      </div>
      <div id="test-result-box" style="display:none;padding:14px 16px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);background:rgba(255,255,255,0.02);font-size:0.83rem;line-height:1.6"></div>

      <details style="margin-top:16px">
        <summary style="cursor:pointer;font-size:0.82rem;color:var(--text-secondary);user-select:none;padding:4px 0">📖 How to get a free Groq key</summary>
        <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px">
          ${[
            {n:"1",t:"Open console.groq.com",d:"Go to <a href='https://console.groq.com' target='_blank' class='key-link'>console.groq.com</a> and sign up free"},
            {n:"2",t:"Create an API key",d:"Click <strong>API Keys</strong> → <strong>Create API Key</strong>"},
            {n:"3",t:"Copy the key",d:"Copy the full key starting with <code class='inline-code'>gsk_</code>"},
            {n:"4",t:"Paste &amp; Save",d:"Paste above and click <strong>Save &amp; Test Key</strong>"}
          ].map(s=>`
            <div style="display:flex;gap:12px;align-items:flex-start;padding:10px;background:rgba(255,255,255,0.02);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
              <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--accent-amber);background:rgba(255,182,39,0.12);border-radius:4px;padding:2px 7px;flex-shrink:0;margin-top:1px">${s.n}</span>
              <div><div style="font-size:0.82rem;font-weight:600;margin-bottom:2px">${s.t}</div><div style="font-size:0.76rem;color:var(--text-secondary)">${s.d}</div></div>
            </div>
          `).join("")}
        </div>
      </details>
    </div>`;
}

function _renderBackendSection(s) {
  return `
    <div class="settings-card" style="margin-bottom:24px">
      <div class="settings-card-header">
        <span class="settings-card-icon">🖥️</span>
        <span class="settings-card-title">Local Backend <span style="font-size:0.72rem;color:var(--text-muted);font-weight:400">(optional)</span></span>
      </div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <label class="toggle-switch">
          <input type="checkbox" id="use-backend-toggle" ${s.useBackend?"checked":""}/>
          <span class="toggle-track"></span>
        </label>
        <span style="font-size:0.9rem">Use local backend server</span>
        <span id="backend-label" class="tag-pill ${s.useBackend?"tag-positive":"tag-neutral"}" style="font-size:0.68rem">${s.useBackend?"Active":"Off"}</span>
      </div>
      <div id="backend-url-group" style="display:${s.useBackend?"block":"none"}">
        <div class="form-group" style="margin-bottom:12px">
          <label class="form-label">Server URL</label>
          <input type="text" class="form-input" id="backend-url" value="${s.backendUrl}" placeholder="http://localhost:3001"/>
        </div>
        <div style="display:flex;gap:10px;align-items:center">
          <button class="action-btn action-btn-ghost" onclick="testBackend()" style="font-size:0.8rem;padding:9px 16px">▶ Test</button>
          <div id="backend-result" style="font-size:0.82rem;color:var(--text-muted)"></div>
        </div>
        <div class="quick-start-block" style="margin-top:14px">
          ${["cp .env.example .env","npm install","npm start  # → http://localhost:3001"].map((c,i)=>`
            <div class="cmd-line"><span class="cmd-num">${i+1}</span><code class="cmd-code">${c}</code></div>
          `).join("")}
        </div>
      </div>
    </div>`;
}

/* ── Events ──────────────────────────────────────────────── */
function attachSettingsEvents() {
  document.getElementById("use-backend-toggle")?.addEventListener("change",function(){
    document.getElementById("backend-url-group").style.display=this.checked?"block":"none";
    const lbl=document.getElementById("backend-label");
    lbl.textContent=this.checked?"Active":"Off";
    lbl.className=`tag-pill ${this.checked?"tag-positive":"tag-neutral"}`;
    lbl.style.fontSize="0.68rem";
  });
  document.getElementById("groq-key")?.addEventListener("input",function(){
    const v=this.value.trim(),el=document.getElementById("key-format-hint");
    if(!v){el.innerHTML='<span style="color:var(--text-muted)">Paste your key above</span>';return;}
    el.innerHTML=v.startsWith("gsk_")
      ?'<span style="color:var(--accent-green)">✓ Format valid</span>'
      :`<span style="color:var(--accent-amber)">⚠ Starts with "${v.slice(0,6)}..." — should be gsk_...</span>`;
  });
}

function toggleKey(){
  const inp=document.getElementById("groq-key"),ico=document.getElementById("toggle-icon");
  inp.type=inp.type==="password"?"text":"password";
  ico.textContent=inp.type==="password"?"👁":"🙈";
}

/* ── Server-side test (deployed) ─────────────────────────── */
async function testServerKey() {
  const btn=document.getElementById("server-test-btn");
  const el =document.getElementById("server-test-result");
  btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Testing...`;
  el.innerHTML=`<span style="color:var(--text-muted)">Contacting server...</span>`;
  try {
    const res =await fetch("/api/health",{signal:AbortSignal.timeout(6000)});
    const data=await res.json();
    if(data.status==="ok"){
      if(data.groqKeySet){
        el.innerHTML=`<span style="color:var(--accent-green)">✅ Server connected — Groq key is set. All AI features are live!</span>`;
        window.updateNavStatus?.("online");
        document.getElementById("status-banner")?.remove();
      } else {
        el.innerHTML=`<span style="color:var(--accent-red)">❌ Server running but GROQ_API_KEY is missing.<br>
          Go to Render → Environment → add GROQ_API_KEY → Save Changes.</span>`;
      }
    } else throw new Error("bad response");
  } catch(err) {
    el.innerHTML=`<span style="color:var(--accent-red)">❌ ${err.message}</span>`;
  }
  btn.disabled=false; btn.innerHTML="▶ Test Server Connection";
}

/* ── Local key save + test ───────────────────────────────── */
async function saveAndTest() {
  const key=(document.getElementById("groq-key")?.value||"").trim();
  _doSave();
  const btn=document.getElementById("save-test-btn");
  const box=document.getElementById("test-result-box");
  btn.disabled=true; btn.innerHTML=`<div class="spinner"></div> Testing...`;
  box.style.display="block"; box.style.borderColor="var(--border-subtle)";
  box.innerHTML=`<span style="color:var(--text-muted)">⏳ Testing ${key.slice(0,8)}... with Groq...</span>`;
  if(!key){
    box.style.borderColor="rgba(255,69,58,0.3)";
    box.innerHTML=`<strong style="color:var(--accent-red)">❌ No key entered.</strong> Paste your gsk_... key above.`;
    btn.disabled=false; btn.innerHTML="💾 Save &amp; Test Key"; return;
  }
  try {
    const result=await window.testGroqKeyDetailed(key);
    if(result.ok){
      box.style.borderColor="rgba(48,209,88,0.35)";
      box.innerHTML=`<div style="color:var(--accent-green);font-weight:600;margin-bottom:6px">${result.msg}</div>
        <div style="color:var(--text-secondary);font-size:0.8rem">Key saved. All AI features ready — try EduChat!</div>`;
      window.NEXUS_CONFIG.groqKey=key;
      document.getElementById("status-banner")?.remove();
      window.updateNavStatus?.("direct");
      sessionStorage.setItem("nexus_setup_dismissed","1");
      const msg=document.getElementById("save-msg");
      msg.innerHTML=`<span style="color:var(--accent-green)">✅ Groq key saved and verified</span>`;
      setTimeout(()=>{msg.textContent="";},3000);
    } else {
      box.style.borderColor="rgba(255,69,58,0.35)";
      box.innerHTML=`<div style="color:var(--accent-red);font-weight:600;margin-bottom:8px">${result.msg}</div>
        <div style="color:var(--text-secondary);font-size:0.79rem;line-height:1.65">${_troubleshoot(result.msg)}</div>`;
    }
  } catch(err){
    box.style.borderColor="rgba(255,69,58,0.35)";
    box.innerHTML=`<strong style="color:var(--accent-red)">❌</strong> <span style="color:var(--text-secondary)">${err.message}</span>`;
  }
  btn.disabled=false; btn.innerHTML="💾 Save &amp; Test Key";
}

function _troubleshoot(msg){
  if(msg.includes("401")||msg.includes("Invalid")) return `Key was <strong>rejected</strong>. Try: regenerate at <a href="https://console.groq.com/keys" target="_blank" class="key-link">console.groq.com/keys</a>, paste fresh copy with no spaces.`;
  if(msg.includes("429")||msg.includes("Rate"))    return `Key works but <strong>rate limited</strong>. Wait 1 minute and retry.`;
  if(msg.includes("403"))                          return `<strong>Access denied</strong>. Key may be restricted — check your Groq account.`;
  return `Check <a href="https://console.groq.com" target="_blank" class="key-link">console.groq.com</a> to verify key is active.`;
}

function _doSave(){
  const s={
    groqKey:   (document.getElementById("groq-key")?.value||"").trim(),
    backendUrl:(document.getElementById("backend-url")?.value||"http://localhost:3001").trim(),
    useBackend:document.getElementById("use-backend-toggle")?.checked||false,
    theme:     localStorage.getItem(SK.THEME)||"dark"
  };
  saveSettings(s);
  window.NEXUS_CONFIG={useBackend:s.useBackend,backendUrl:s.backendUrl,groqKey:s.groqKey};
}

function clearKey(){
  document.getElementById("groq-key").value="";
  document.getElementById("key-format-hint").innerHTML='<span style="color:var(--text-muted)">Paste your key above</span>';
  document.getElementById("test-result-box").style.display="none";
}

async function testBackend(){
  const url=(document.getElementById("backend-url")?.value||"http://localhost:3001").trim();
  const el=document.getElementById("backend-result");
  el.innerHTML=`<span style="color:var(--text-muted)">Testing...</span>`;
  try{
    const res=await fetch(`${url}/api/health`,{signal:AbortSignal.timeout(4000)});
    const d=await res.json();
    el.innerHTML=d.status==="ok"
      ?`<span style="color:var(--accent-green)">✅ Connected · Groq ${d.groqKeySet?"✓":"✗ missing in .env"}</span>`
      :`<span style="color:var(--accent-red)">❌ Bad response</span>`;
  }catch{el.innerHTML=`<span style="color:var(--accent-red)">❌ Not reachable — run npm start</span>`;}
}

function loadConfigFromStorage(){
  const s=getSettings();
  window.NEXUS_CONFIG={useBackend:s.useBackend,backendUrl:s.backendUrl,groqKey:s.groqKey};
  applyTheme(s.theme);
}

document.addEventListener("DOMContentLoaded",()=>{
  loadConfigFromStorage();
  renderSettingsPage();
});
