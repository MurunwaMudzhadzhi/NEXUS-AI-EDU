/* ============================================================
   NEXUS AI — PROJECTS PAGE
   Deep-dive showcase of all four ML models
   ============================================================ */

const PROJECTS_DATA = [
  {
    id:       "recommender",
    module:   "AcademIQ",
    title:    "Course Recommender System",
    subtitle: "Unsupervised Learning · Collaborative Filtering",
    icon:     "📚",
    color:    "var(--accent-green)",
    colorRgb: "48,209,88",
    badges:   ["Unsupervised","Collaborative Filtering","Cosine Similarity"],
    problem:  "Students struggle to discover relevant courses from large catalogues. A personalised recommender reduces cognitive overload and improves course completion rates.",
    approach: "Each course is encoded as a 7-dimensional feature vector across academic domains. A student profile vector is constructed by weighting their declared interests and learning goals. Recommendations are ranked by cosine similarity between the student vector and each course vector.",
    formula:  "similarity(A, B) = (A · B) / (‖A‖ × ‖B‖)",
    formulaNote: "Where A = student profile vector, B = course feature vector",
    metrics: [
      { label:"Catalogue Size",    value:"15 courses" },
      { label:"Feature Dimensions",value:"7D vectors" },
      { label:"Similarity Metric", value:"Cosine" },
      { label:"Results Returned",  value:"Top 6" }
    ],
    steps: [
      "Build 7D domain vectors for each course (math, computing, science, data, humanities, language, lab)",
      "Construct student profile vector from interest area + learning goal using weighted combination",
      "Compute cosine similarity between profile and every uncompleted course",
      "Apply domain-match boost (+0.08) for courses matching primary interest",
      "Rank and return top 6 courses with percentage match scores"
    ]
  },
  {
    id:       "atrisk",
    module:   "AcademIQ",
    title:    "At-Risk Student Predictor",
    subtitle: "Supervised Learning · Multi-Feature Classification",
    icon:     "⚠️",
    color:    "var(--accent-teal)",
    colorRgb: "0,229,255",
    badges:   ["Supervised","Classification","Feature Weighting"],
    problem:  "Identifying at-risk students early enough to intervene is critical. Traditional approaches rely on end-of-term grades — too late for effective support.",
    approach: "Six academic metrics are normalised against empirically-derived performance thresholds. Each metric is weighted by its research-backed predictive importance. The combined risk score maps to four categorical risk levels with corresponding intervention recommendations.",
    formula:  "RiskScore = Σ wᵢ × max(0, (thresholdᵢ − metricᵢ) / thresholdᵢ)",
    formulaNote: "Where wᵢ are learned feature weights summing to 1.0",
    metrics: [
      { label:"Features",       value:"6 metrics" },
      { label:"Output Classes", value:"4 levels" },
      { label:"Top Feature",    value:"Attendance" },
      { label:"Response Time",  value:"< 50ms" }
    ],
    steps: [
      "Collect 6 student metrics: attendance, assignment rate, current grade, engagement, study hours, late submissions",
      "Normalise each metric against its performance threshold (e.g. attendance threshold = 75%)",
      "Apply domain-specific weights: attendance(25%), grade(25%), assignments(20%), engagement(12%), study(10%), punctuality(8%)",
      "Sum weighted risk factors to get overall risk score (0–1)",
      "Map score to: Low (<0.25) → Moderate (<0.50) → High (<0.72) → Critical (≥0.72)"
    ]
  },
  {
    id:       "grade",
    module:   "AcademIQ",
    title:    "Grade Forecaster",
    subtitle: "Supervised Learning · Multiple Linear Regression",
    icon:     "📈",
    color:    "var(--accent-amber)",
    colorRgb: "255,182,39",
    badges:   ["Supervised","Regression","MLR","Confidence Intervals"],
    problem:  "Students and instructors need an early estimate of final grades to adjust study strategies. A regression model trained on past performance factors provides actionable forecasts.",
    approach: "Multiple Linear Regression models the linear relationship between five academic input variables and the predicted final grade. Coefficients represent the partial effect of each variable. A confidence interval is computed from residual standard error.",
    formula:  "Ŷ = β₀ + β₁·StudyHrs + β₂·Attendance + β₃·PrevGrade + β₄·AssignAvg + β₅·GPA",
    formulaNote: "Coefficients: β₁=0.48, β₂=0.22, β₃=0.31, β₄=0.28, β₅=0.85, β₀=−12.4",
    metrics: [
      { label:"Predictors",      value:"5 features" },
      { label:"Output",          value:"0–100 grade" },
      { label:"Uncertainty",     value:"±4–9%" },
      { label:"Grade Bands",     value:"4 categories" }
    ],
    steps: [
      "Collect five predictor variables: weekly study hours, attendance %, previous module grade, assignment average, prior GPA",
      "Apply MLR equation with pre-trained coefficients reflecting research on academic performance",
      "Clamp output to [0, 100] and round to nearest integer",
      "Compute uncertainty band (±4–9%) based on residual standard error estimate",
      "Map prediction to grade band: <50 At Risk / 50–64 Pass / 65–74 Merit / 75+ Distinction"
    ]
  },
  {
    id:       "path",
    module:   "AcademIQ",
    title:    "Learning Path Optimizer",
    subtitle: "Reinforcement Learning · Q-Value Policy",
    icon:     "🗺️",
    color:    "var(--accent-purple)",
    colorRgb: "191,90,242",
    badges:   ["Reinforcement Learning","Q-Learning","Policy Optimisation","Sequential Decision"],
    problem:  "Choosing the optimal sequence of learning topics is a sequential decision problem. An RL agent can learn to order modules to maximise knowledge gain per hour while respecting prerequisites.",
    approach: "Each learning node is modelled as a state. The agent estimates Q-values representing expected cumulative knowledge gain for taking each action (proceeding to a node) from the current state. The policy selects actions that maximise Q, subject to prerequisite constraints and available study time.",
    formula:  "Q(s,a) ← Q(s,a) + α[r + γ·maxₐ'Q(s',a') − Q(s,a)]",
    formulaNote: "α = learning rate, γ = discount factor, r = immediate knowledge reward",
    metrics: [
      { label:"Domains",          value:"3 tracks" },
      { label:"Max Nodes/Path",   value:"6 modules" },
      { label:"Learning Styles",  value:"3 modes" },
      { label:"Output",           value:"Ordered sequence + ETA" }
    ],
    steps: [
      "Define state space: each learning node is a state with prerequisites and estimated hours",
      "Initialise Q-table with estimated knowledge gain values per state transition",
      "Apply learning style multiplier (Thorough: ×1.3 / Fast Track: ×0.75 / Practical: ×1.0)",
      "Run policy: select actions that maximise Q-value while satisfying prerequisite constraints",
      "Output optimal path with estimated weeks per node given available study hours/week"
    ]
  }
];

function renderProjectsPage() {
  const section = document.getElementById("projects-section");
  section.innerHTML = `
    <div class="module-inner" style="max-width:1100px">

      <div class="module-header">
        <div class="module-header-icon" style="background:rgba(255,182,39,0.1)">🔬</div>
        <div class="module-header-text">
          <h1>ML <span style="color:var(--accent-amber)">Projects</span></h1>
          <p>Deep-dive into each machine learning model — algorithms, formulas, and implementation</p>
        </div>
      </div>

      <!-- Projects list -->
      <div style="display:flex;flex-direction:column;gap:28px">
        ${PROJECTS_DATA.map((p, idx) => renderProjectCard(p, idx)).join("")}
      </div>

    </div>
  `;
}

function renderProjectCard(p, idx) {
  return `
    <div class="glass-panel animate-fade-up" style="padding:32px;animation-delay:${idx*0.1}s;border-top:3px solid ${p.color}">

      <!-- Project header -->
      <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:24px">
        <div style="width:52px;height:52px;border-radius:var(--radius-lg);background:rgba(${p.colorRgb},0.1);display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">
          ${p.icon}
        </div>
        <div style="flex:1">
          <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;color:${p.color};margin-bottom:5px">${p.module}</div>
          <h3 style="font-family:var(--font-display);font-size:1.3rem;font-weight:700;margin-bottom:4px">${p.title}</h3>
          <div style="font-size:0.82rem;color:var(--text-secondary)">${p.subtitle}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0">
          ${p.badges.map(b => `<span class="tag-pill tag-info" style="font-size:0.65rem">${b}</span>`).join("")}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">

        <!-- Left column -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Problem -->
          <div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px">Problem Statement</div>
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7">${p.problem}</p>
          </div>

          <!-- Approach -->
          <div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px">Approach</div>
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.7">${p.approach}</p>
          </div>

          <!-- Formula -->
          <div style="background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:16px">
            <div style="font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Core Formula</div>
            <div style="font-family:var(--font-mono);font-size:0.88rem;color:${p.color};margin-bottom:6px;word-break:break-word">${p.formula}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);line-height:1.5">${p.formulaNote}</div>
          </div>

        </div>

        <!-- Right column -->
        <div style="display:flex;flex-direction:column;gap:16px">

          <!-- Metrics -->
          <div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Model Specs</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              ${p.metrics.map(m => `
                <div style="padding:12px;background:rgba(${p.colorRgb},0.05);border:1px solid rgba(${p.colorRgb},0.15);border-radius:var(--radius-md);text-align:center">
                  <div style="font-family:var(--font-display);font-size:0.95rem;font-weight:700;color:${p.color};margin-bottom:2px">${m.value}</div>
                  <div style="font-size:0.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em">${m.label}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Implementation steps -->
          <div>
            <div style="font-family:var(--font-mono);font-size:0.62rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Implementation Steps</div>
            <div style="display:flex;flex-direction:column;gap:7px">
              ${p.steps.map((step, i) => `
                <div style="display:flex;gap:10px;align-items:flex-start;font-size:0.78rem;color:var(--text-secondary);line-height:1.5">
                  <span style="font-family:var(--font-mono);font-size:0.68rem;color:${p.color};background:rgba(${p.colorRgb},0.1);border-radius:4px;padding:2px 6px;flex-shrink:0;margin-top:1px">${i+1}</span>
                  <span>${step}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Launch button -->
          <button class="action-btn action-btn-ghost" style="margin-top:auto;font-size:0.82rem;border-color:rgba(${p.colorRgb},0.25);color:${p.color}"
                  onclick="navigateTo('academiq');setTimeout(()=>{
                    const tabs=document.querySelectorAll('#academiq-tabs .tab-btn');
                    const idx=${['recommender','atrisk','grade','path'].indexOf(p.id)};
                    if(tabs[idx])tabs[idx].click();
                  },200)">
            <span>Try ${p.title.split(' ')[0]} →</span>
          </button>

        </div>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("projects-section")) renderProjectsPage();
});
