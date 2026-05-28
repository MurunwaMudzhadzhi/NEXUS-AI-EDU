/* ============================================================
   NEXUS AI — ABOUT PAGE
   ============================================================ */
function renderAboutPage() {
  const section = document.getElementById("about-section");
  section.innerHTML = `
    <div class="module-inner" style="max-width:1000px">

      <div class="module-header">
        <div class="module-header-icon" style="background:rgba(0,229,255,0.1)">🌐</div>
        <div class="module-header-text">
          <h1>About <span style="color:var(--accent-teal)">NEXUS AI</span></h1>
          <p>Education Intelligence Platform — Portfolio Project</p>
        </div>
      </div>

      <!-- Hero card -->
      <div class="glass-panel" style="padding:36px;margin-bottom:24px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-30px;width:200px;height:200px;background:radial-gradient(circle,rgba(0,229,255,0.06) 0%,transparent 70%);pointer-events:none"></div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:32px;align-items:start">
          <div>
            <div style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--accent-teal);margin-bottom:12px">Platform Overview</div>
            <h2 style="font-family:var(--font-display);font-size:1.8rem;font-weight:700;margin-bottom:16px;line-height:1.2">
              Intelligent Education,<br><span style="color:var(--accent-amber)">Powered by Groq LLaMA 3.3</span>
            </h2>
            <p style="color:var(--text-secondary);line-height:1.75;font-size:0.95rem;max-width:560px">
              NEXUS AI is a comprehensive AI-powered education platform combining Natural Language Processing,
              Generative AI, Sentiment Analysis, and four Machine Learning paradigms into a single unified system.
            </p>
            <p style="color:var(--text-secondary);line-height:1.75;font-size:0.95rem;max-width:560px;margin-top:12px">
              All AI features run on <strong style="color:var(--accent-teal)">Groq's ultra-fast inference API</strong>
              using LLaMA 3.3 70B — demonstrating real-world application of Supervised, Unsupervised, and
              Reinforcement Learning in the education domain.
            </p>
          </div>
          <div style="text-align:center;flex-shrink:0">
            <img src="assets/icon.svg" alt="NEXUS AI" style="width:100px;height:100px;filter:drop-shadow(0 0 24px rgba(0,229,255,0.35))"/>
            <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:800;margin-top:10px;background:linear-gradient(135deg,var(--accent-teal),var(--accent-purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">NEXUS AI</div>
            <div style="font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.14em;color:var(--accent-amber);margin-top:2px">v2.2 · 2025</div>
          </div>
        </div>
      </div>

      <!-- Four modules -->
      <div style="margin-bottom:24px">
        <div style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:16px">The Four Modules</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          ${[
            {icon:"🎓",title:"EduChat",color:"var(--accent-teal)",border:"rgba(0,229,255,0.3)",
              desc:"Multi-subject AI tutor using LLaMA 3.3 70B via Groq. Multi-turn conversation, context tracking, level-adaptive explanations.",
              tags:["NLP","LLM","Groq"]},
            {icon:"📝",title:"StudyForge",color:"var(--accent-amber)",border:"rgba(255,182,39,0.3)",
              desc:"Generates 6 content types across 4 education levels — lesson plans, quizzes, flashcards, study notes, essay outlines, summaries.",
              tags:["Generative AI","Prompt Engineering"]},
            {icon:"💡",title:"EmpathyLens",color:"var(--accent-purple)",border:"rgba(191,90,242,0.3)",
              desc:"Structured JSON sentiment analysis with 6-emotion breakdown, keyword extraction, confidence scoring, educator insights.",
              tags:["Sentiment Analysis","NLP"]},
            {icon:"🧠",title:"AcademIQ",color:"var(--accent-green)",border:"rgba(48,209,88,0.3)",
              desc:"Four ML models: collaborative filtering recommender, multi-feature classifier, multiple linear regression, Q-value RL path optimizer.",
              tags:["Supervised ML","Unsupervised","RL"]}
          ].map(m=>`
            <div class="glass-panel" style="padding:20px;border-left:3px solid ${m.border}">
              <div style="display:flex;gap:12px;align-items:flex-start">
                <span style="font-size:1.5rem">${m.icon}</span>
                <div>
                  <div style="font-family:var(--font-display);font-weight:600;margin-bottom:4px">${m.title}</div>
                  <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.6">${m.desc}</div>
                  <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
                    ${m.tags.map(t=>`<span class="tag-pill tag-info" style="font-size:0.65rem">${t}</span>`).join("")}
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="glass-panel" style="padding:28px;margin-bottom:24px">
        <div style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:18px">Tech Stack</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
          ${[
            {cat:"Frontend",     items:["HTML5 / CSS3 / Vanilla JS","CSS Custom Properties","Canvas 2D (neural bg)","CSS Animations","Responsive Design"]},
            {cat:"AI / Backend", items:["Groq LLaMA 3.3 70B","Node.js 18+ / Express","Secure API Proxy","Rate Limiting & Helmet","Render deployment"]},
            {cat:"ML Algorithms",items:["Cosine Similarity (Recommender)","Multi-Feature Classification","Multiple Linear Regression","Q-Value RL Optimisation","Feature Normalisation"]}
          ].map(b=>`
            <div>
              <div style="font-size:0.78rem;font-weight:600;color:var(--accent-teal);margin-bottom:10px">${b.cat}</div>
              <ul style="list-style:none;display:flex;flex-direction:column;gap:5px">
                ${b.items.map(i=>`<li style="font-size:0.78rem;color:var(--text-secondary);display:flex;gap:7px;align-items:center"><span style="color:var(--accent-amber)">▸</span>${i}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Coursera Alignment -->
      <div class="glass-panel" style="padding:28px">
        <div style="font-family:var(--font-mono);font-size:0.68rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--text-muted);margin-bottom:18px">Coursera ML Curriculum Alignment</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          ${[
            {course:"Supervised ML — Regression",     module:"Grade Forecaster",    algo:"Multiple Linear Regression",       color:"var(--accent-green)"},
            {course:"Supervised ML — Classification", module:"At-Risk Predictor",   algo:"Multi-Feature Weighted Classifier", color:"var(--accent-teal)"},
            {course:"Unsupervised — Recommenders",    module:"Course Recommender",  algo:"Collaborative Filtering",           color:"var(--accent-amber)"},
            {course:"Reinforcement Learning",         module:"Learning Path",       algo:"Q-Value Policy Optimisation",       color:"var(--accent-purple)"}
          ].map(r=>`
            <div style="padding:14px;background:rgba(255,255,255,0.02);border:1px solid var(--border-subtle);border-radius:var(--radius-md)">
              <div style="font-size:0.7rem;color:${r.color};font-family:var(--font-mono);letter-spacing:0.08em;margin-bottom:6px">${r.course}</div>
              <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px">AcademIQ: ${r.module}</div>
              <div style="font-size:0.76rem;color:var(--text-muted)">${r.algo}</div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `;
}

document.addEventListener("DOMContentLoaded",()=>{ if(document.getElementById("about-section")) renderAboutPage(); });
