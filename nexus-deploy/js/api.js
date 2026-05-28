/* ============================================================
   NEXUS AI — API HELPER v2.4
   KEY FIX: Auto-detects deployed server vs localhost
   - On Render/production → always uses backend (key in env vars)
   - On localhost → uses localStorage key (direct mode)
   ============================================================ */

window.NEXUS_CONFIG = window.NEXUS_CONFIG || {
  useBackend: false,
  backendUrl: "",
  groqKey: ""
};

const GROQ_API   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama3-70b-8192",
  "llama-3.1-70b-versatile",
  "mixtral-8x7b-32768",
  "llama3-8b-8192"
];

/* ── Core: detect deployed vs local ──────────────────────── */
function isDeployedServer() {
  const h = window.location.hostname;
  return (
    h !== "localhost" &&
    h !== "127.0.0.1" &&
    h !== "" &&
    !h.startsWith("192.168.") &&
    !h.startsWith("10.") &&
    window.location.protocol !== "file:"
  );
}

function getCfg() {
  const deployed = isDeployedServer();

  // If deployed on Render/VPS → always backend (key lives in server env)
  // If localhost → check localStorage setting
  const useBackend = deployed || localStorage.getItem("nexus_use_backend") === "true";

  // Deployed: same-origin (no port needed). Local: stored URL or default.
  const backendUrl = deployed
    ? window.location.origin
    : (localStorage.getItem("nexus_backend_url") || "http://localhost:3001").trim();

  // Direct-mode key (only used when NOT deployed)
  const groqKey = (localStorage.getItem("nexq_groq_key") || window.NEXUS_CONFIG.groqKey || "").trim();

  return { useBackend, backendUrl, groqKey, deployed };
}

/* ── Multi-turn chat ──────────────────────────────────────── */
async function callClaudeChat(systemPrompt, messages, maxTokens = 1000) {
  const cfg = getCfg();
  if (cfg.useBackend) return _backendPost(cfg, "/api/chat", { messages, system: systemPrompt }, "reply");
  return _groqDirect(systemPrompt, messages, maxTokens, cfg.groqKey);
}

async function callClaude(systemPrompt, userMessage, maxTokens = 1000) {
  return callClaudeChat(systemPrompt, [{ role: "user", content: userMessage }], maxTokens);
}

/* ── StudyForge ───────────────────────────────────────────── */
async function callClaudeGenerate({ topic, contentType, level, context }) {
  const cfg = getCfg();
  if (cfg.useBackend) return _backendPost(cfg, "/api/generate", { topic, contentType, level, context }, "content");
  const sys = "You are an expert educational content creator. Use clear markdown. End with ## Key Takeaways.";
  return callClaude(sys, `Create a ${contentType} about "${topic}" for ${level} level. ${context || ""}`, 1500);
}

/* ── EmpathyLens ──────────────────────────────────────────── */
async function callClaudeSentiment(text) {
  const cfg = getCfg();
  if (cfg.useBackend) return _backendPost(cfg, "/api/sentiment", { text }, "_raw_");
  const sys = `Return ONLY valid JSON, no markdown:
{"overall":"positive"|"negative"|"neutral"|"mixed","score":<0-100>,"confidence":<60-98>,"verdict":"<2-4 words>","emotions":{"joy":<0-100>,"frustration":<0-100>,"confusion":<0-100>,"motivation":<0-100>,"anxiety":<0-100>,"satisfaction":<0-100>},"keywords":["w1","w2","w3","w4","w5"],"insights":["i1","i2","i3"],"summary":"<1-2 sentences>"}`;
  const raw = await callClaude(sys, `Analyse this student feedback: "${text}"`, 700);
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("Could not parse response. Please try again.");
  return JSON.parse(m[0]);
}

/* ── Backend proxy ────────────────────────────────────────── */
async function _backendPost(cfg, path, body, resultKey) {
  let res;
  try {
    res = await fetch(`${cfg.backendUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new Error(`Cannot reach backend at ${cfg.backendUrl}. ${cfg.deployed ? "Check Render logs." : "Run: npm start"}`);
  }
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `Backend error ${res.status}`);
  }
  const data = await res.json();
  if (resultKey === "_raw_") return data.analysis ?? data;
  return data[resultKey] ?? Object.values(data)[0] ?? "";
}

/* ── Direct Groq (local / no backend) ────────────────────── */
async function _groqDirect(systemPrompt, messages, maxTokens, key) {
  const cleanKey = (key || "").trim();
  if (!cleanKey)
    throw new Error("Groq API key is empty. Go to ⚙️ Settings and enter your gsk_... key.");
  if (!cleanKey.startsWith("gsk_"))
    throw new Error(`Key format wrong — got "${cleanKey.slice(0,8)}..." — expected "gsk_...". Check Settings.`);

  const body = {
    max_tokens: maxTokens, temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ]
  };

  let lastError = null;
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cleanKey}` },
        body: JSON.stringify({ ...body, model })
      });
      if (res.status === 401) {
        const e = await res.json().catch(() => ({}));
        throw new Error(`Invalid Groq key (401): ${e.error?.message || "Key rejected. Regenerate at console.groq.com."}`);
      }
      if (res.status === 403) {
        const e = await res.json().catch(() => ({}));
        throw new Error(`Forbidden (403): ${e.error?.message || "Check your Groq account."}`);
      }
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        lastError = new Error(`${model} failed (${res.status}): ${e.error?.message || "unknown"}`);
        continue;
      }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) { lastError = new Error(`${model} returned empty response`); continue; }
      window._groqWorkingModel = model;
      return text;
    } catch (err) {
      if (err.message.includes("401") || err.message.includes("403") ||
          err.message.includes("Invalid Groq") || err.message.includes("Forbidden")) throw err;
      lastError = err;
    }
  }
  throw lastError || new Error("All Groq models failed. Check console.groq.com for status.");
}

/* ── Key test ─────────────────────────────────────────────── */
async function testGroqKeyDetailed(key) {
  const cleanKey = (key || "").trim();
  if (!cleanKey) return { ok: false, msg: "Key is empty." };
  if (!cleanKey.startsWith("gsk_")) return { ok: false, msg: `Bad format — starts with "${cleanKey.slice(0,6)}" not "gsk_"` };
  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch(GROQ_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${cleanKey}` },
        body: JSON.stringify({ model, max_tokens: 5, temperature: 0, messages: [{ role: "user", content: "Hi" }] })
      });
      const data = await res.json();
      if (res.ok) return { ok: true, msg: `✅ Key valid — using ${model}`, model };
      if (res.status === 401) return { ok: false, msg: `❌ Key rejected (401): ${data.error?.message || "Invalid API key"}` };
      if (res.status === 403) return { ok: false, msg: `❌ Forbidden (403): ${data.error?.message || "Access denied"}` };
      if (res.status === 429) return { ok: true,  msg: `⚠️ Rate limited — key is valid but quota hit. Wait and retry.` };
    } catch (err) {
      return { ok: false, msg: `❌ Network error: ${err.message}` };
    }
  }
  return { ok: false, msg: "❌ No working models found on your Groq account." };
}
window.testGroqKeyDetailed = testGroqKeyDetailed;

/* ── Neural Canvas ────────────────────────────────────────── */
function initNeuralCanvas() {
  const canvas = document.getElementById("neural-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, nodes, raf;
  const C = { n:72, dist:145, r:1.8, spd:0.28, ca:"0,229,255", cb:"191,90,242", cc:"255,182,39" };
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  function spawn() {
    nodes = Array.from({length:C.n}, ()=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*C.spd, vy:(Math.random()-.5)*C.spd,
      r:Math.random()*C.r+.8,
      col:Math.random()<.55?C.ca:Math.random()<.65?C.cb:C.cc,
      p:Math.random()*Math.PI*2
    }));
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for(const n of nodes){ n.x+=n.vx; n.y+=n.vy; n.p+=.018;
      if(n.x<0||n.x>W)n.vx*=-1; if(n.y<0||n.y>H)n.vy*=-1; }
    for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
      const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<C.dist){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(${a.col},${(1-d/C.dist)*.16})`;ctx.lineWidth=.6;ctx.stroke();}
    }
    for(const n of nodes){ const p=.72+Math.sin(n.p)*.28;
      ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,Math.PI*2);
      ctx.fillStyle=`rgba(${n.col},.75)`;ctx.fill(); }
    raf = requestAnimationFrame(draw);
  }
  window.addEventListener("resize",()=>{resize();spawn();});
  resize(); spawn(); cancelAnimationFrame(raf); draw();
}

/* ── Utils ────────────────────────────────────────────────── */
function formatTime() { return new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}); }
function showLoading(container) {
  container.innerHTML=`<div style="padding:28px 0">
    <div class="shimmer-line full"></div><div class="shimmer-line med"></div>
    <div class="shimmer-line full"></div><div class="shimmer-line short"></div>
    <div class="shimmer-line full" style="margin-top:20px"></div>
    <div class="shimmer-line med"></div><div class="shimmer-line full"></div>
  </div>`;
}

/* ── Theme cycler ─────────────────────────────────────────── */
const THEMES=["dark","midnight","light","forest","amber"];
let _ti=0;
function cycleTheme(){_ti=(_ti+1)%THEMES.length;window.applyTheme?.(THEMES[_ti]);}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded",()=>{
  initNeuralCanvas();
  const cfg = getCfg();
  Object.assign(window.NEXUS_CONFIG, cfg);

  const nav = document.getElementById("main-nav");
  if (nav) {
    const btn = document.createElement("button");
    btn.id="theme-quick-btn"; btn.title="Cycle theme"; btn.innerHTML="🎨 Theme"; btn.onclick=cycleTheme;
    nav.appendChild(btn);
  }

  // Expose getCfg globally so app.js can use it
  window.getCfg = getCfg;
  window.isDeployedServer = isDeployedServer;
});
