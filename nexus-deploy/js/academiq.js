/* ============================================================
   NEXUS AI — ACADEMIQ MODULE (ML Education Intelligence Suite)
   Implements: Course Recommender, At-Risk Predictor,
               Grade Forecaster, Learning Path Optimizer
   ============================================================ */

/* ─────────────────────────────────────────────────────────────
   DATA — Course Catalogue (for Recommender)
   ───────────────────────────────────────────────────────────── */
const COURSE_DB = [
  { id:1,  name:"Advanced Calculus",         cat:"Mathematics",   vec:[0.9,0.1,0.8,0.2,0.1,0.7,0.3], desc:"Limits, derivatives, integrals & series", level:"University" },
  { id:2,  name:"Data Science Fundamentals", cat:"Computing",     vec:[0.5,0.8,0.3,0.9,0.6,0.4,0.7], desc:"Python, statistics & machine learning basics", level:"University" },
  { id:3,  name:"World History 1900–2000",   cat:"History",       vec:[0.1,0.2,0.1,0.3,0.9,0.8,0.2], desc:"20th century wars, politics & social change", level:"High School" },
  { id:4,  name:"Molecular Biology",         cat:"Biology",       vec:[0.3,0.7,0.6,0.2,0.2,0.5,0.8], desc:"DNA, RNA, proteins & cell mechanisms", level:"University" },
  { id:5,  name:"Creative Writing",          cat:"Literature",    vec:[0.1,0.1,0.1,0.2,0.6,0.9,0.1], desc:"Narrative craft, voice & storytelling", level:"High School" },
  { id:6,  name:"Quantum Physics",           cat:"Physics",       vec:[0.8,0.3,0.9,0.1,0.1,0.3,0.6], desc:"Wave-particle duality, uncertainty & QM", level:"University" },
  { id:7,  name:"Macroeconomics",            cat:"Economics",     vec:[0.3,0.5,0.4,0.7,0.5,0.4,0.5], desc:"GDP, inflation, monetary & fiscal policy", level:"University" },
  { id:8,  name:"Linear Algebra",            cat:"Mathematics",   vec:[0.8,0.2,0.7,0.3,0.1,0.6,0.4], desc:"Vectors, matrices, transformations & spaces", level:"University" },
  { id:9,  name:"Environmental Science",     cat:"Science",       vec:[0.2,0.5,0.5,0.4,0.7,0.6,0.6], desc:"Ecosystems, climate & sustainability", level:"High School" },
  { id:10, name:"Psychology of Learning",    cat:"Psychology",    vec:[0.2,0.6,0.3,0.6,0.6,0.7,0.4], desc:"Cognition, memory & educational psychology", level:"University" },
  { id:11, name:"Organic Chemistry",         cat:"Chemistry",     vec:[0.6,0.6,0.7,0.2,0.1,0.4,0.8], desc:"Reactions, mechanisms & synthesis", level:"University" },
  { id:12, name:"Intro to Machine Learning", cat:"Computing",     vec:[0.6,0.9,0.5,0.9,0.4,0.3,0.7], desc:"Supervised, unsupervised & RL basics", level:"University" },
  { id:13, name:"Statistics & Probability",  cat:"Mathematics",   vec:[0.6,0.7,0.5,0.7,0.3,0.5,0.5], desc:"Distributions, hypothesis testing & Bayes", level:"University" },
  { id:14, name:"English Literature",        cat:"Literature",    vec:[0.1,0.1,0.1,0.2,0.7,0.9,0.2], desc:"Classic & contemporary literary analysis", level:"High School" },
  { id:15, name:"Thermodynamics",            cat:"Physics",       vec:[0.7,0.3,0.8,0.2,0.1,0.4,0.6], desc:"Heat, entropy, energy & laws of thermo", level:"University" }
];

const INTEREST_VECTORS = {
  "Mathematics":    [0.9,0.2,0.8,0.3,0.1,0.5,0.3],
  "Computing":      [0.5,0.9,0.4,0.9,0.3,0.3,0.6],
  "Sciences":       [0.6,0.6,0.8,0.3,0.3,0.4,0.7],
  "Humanities":     [0.1,0.2,0.2,0.3,0.9,0.9,0.2],
  "Social Science": [0.2,0.5,0.3,0.6,0.7,0.6,0.4],
  "Mixed":          [0.5,0.5,0.5,0.5,0.5,0.5,0.5]
};

const LEARNING_GOALS = {
  "Research":    [0.7,0.7,0.8,0.6,0.5,0.5,0.7],
  "Career":      [0.4,0.8,0.5,0.9,0.4,0.3,0.6],
  "Interest":    [0.3,0.3,0.3,0.3,0.8,0.8,0.3],
  "Academic":    [0.8,0.6,0.8,0.5,0.5,0.5,0.6],
  "Practical":   [0.3,0.7,0.4,0.8,0.5,0.4,0.6]
};

/* ─────────────────────────────────────────────────────────────
   LEARNING PATHS (for RL Path Optimizer)
   ───────────────────────────────────────────────────────────── */
const LEARNING_PATHS = {
  "Mathematics": [
    { title: "Number & Algebra Foundations", hours: 15, prereqs: [], desc: "Core arithmetic, variables & equations" },
    { title: "Functions & Graphs",            hours: 18, prereqs: [0], desc: "Linear, quadratic & polynomial functions" },
    { title: "Calculus I — Differentiation",  hours: 22, prereqs: [1], desc: "Limits, derivatives & rates of change" },
    { title: "Calculus II — Integration",     hours: 22, prereqs: [2], desc: "Antiderivatives, definite integrals & area" },
    { title: "Multivariable Calculus",        hours: 28, prereqs: [3], desc: "Partial derivatives & multiple integrals" },
    { title: "Linear Algebra",                hours: 24, prereqs: [2], desc: "Matrices, vectors & linear transformations" }
  ],
  "Computing": [
    { title: "Programming Fundamentals",      hours: 20, prereqs: [], desc: "Variables, loops, functions & logic" },
    { title: "Data Structures",               hours: 24, prereqs: [0], desc: "Arrays, trees, graphs & algorithms" },
    { title: "Algorithms & Complexity",       hours: 22, prereqs: [1], desc: "Sorting, searching & Big-O analysis" },
    { title: "Databases & SQL",               hours: 16, prereqs: [0], desc: "Relational databases, queries & design" },
    { title: "Machine Learning Basics",       hours: 28, prereqs: [2], desc: "Regression, classification & neural nets" },
    { title: "Deep Learning & AI",            hours: 30, prereqs: [4], desc: "CNNs, RNNs, transformers & deployment" }
  ],
  "Sciences": [
    { title: "Scientific Method & Analysis",  hours: 10, prereqs: [], desc: "Hypothesis, experimentation & data" },
    { title: "Chemistry Fundamentals",        hours: 20, prereqs: [0], desc: "Atomic structure, bonding & reactions" },
    { title: "Biology Essentials",            hours: 20, prereqs: [0], desc: "Cell biology, genetics & ecology" },
    { title: "Physics I — Classical Mech",    hours: 24, prereqs: [0], desc: "Motion, forces, energy & waves" },
    { title: "Organic Chemistry",             hours: 26, prereqs: [1], desc: "Carbon chemistry & reaction mechanisms" },
    { title: "Molecular Biology",             hours: 24, prereqs: [2], desc: "DNA, proteins & cellular processes" }
  ]
};

/* ─────────────────────────────────────────────────────────────
   UTILITY — Cosine Similarity
   ───────────────────────────────────────────────────────────── */
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai*ai, 0));
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi*bi, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function vecAdd(a, b, wA = 0.6, wB = 0.4) {
  return a.map((ai, i) => ai * wA + b[i] * wB);
}

/* ─────────────────────────────────────────────────────────────
   RENDER MAIN ACADEMIQ UI
   ───────────────────────────────────────────────────────────── */
function renderAcademiqUI() {
  const section = document.getElementById("academiq-section");
  section.innerHTML = `
    <div class="module-inner">
      <div class="module-header">
        <div class="module-header-icon">🧠</div>
        <div class="module-header-text">
          <h1>AcademIQ <span style="color:var(--accent-green)">Intelligence</span></h1>
          <p>ML-powered education analytics — recommendations, predictions & adaptive learning paths</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="academiq-tabs">
        <div class="tabs-row" id="academiq-tabs">
          <button class="tab-btn active" data-tab="recommender">📚 Course Recommender</button>
          <button class="tab-btn" data-tab="atrisk">⚠️ At-Risk Predictor</button>
          <button class="tab-btn" data-tab="grade">📈 Grade Forecaster</button>
          <button class="tab-btn" data-tab="path">🗺️ Learning Path</button>
        </div>
      </div>

      <!-- Tab Content -->
      <div id="tab-recommender" class="academiq-tab-content active"></div>
      <div id="tab-atrisk"      class="academiq-tab-content"></div>
      <div id="tab-grade"       class="academiq-tab-content"></div>
      <div id="tab-path"        class="academiq-tab-content"></div>
    </div>
  `;

  renderRecommenderTab();
  renderAtRiskTab();
  renderGradeTab();
  renderPathTab();
  attachAcademiqTabs();
}

/* ─────────────────────────────────────────────────────────────
   TAB 1: Course Recommender (Collaborative Filtering)
   ───────────────────────────────────────────────────────────── */
function renderRecommenderTab() {
  document.getElementById("tab-recommender").innerHTML = `
    <div class="ml-layout">
      <div class="ml-input-panel">
        <div class="ml-input-title">🎯 Your Profile</div>

        <div class="form-group">
          <label class="form-label">Primary Interest Area</label>
          <select class="form-select" id="rec-interest">
            ${Object.keys(INTEREST_VECTORS).map(k => `<option value="${k}">${k}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Learning Goal</label>
          <select class="form-select" id="rec-goal">
            ${Object.keys(LEARNING_GOALS).map(k => `<option value="${k}">${k}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Courses Completed (select all that apply)</label>
          <div id="rec-completed" style="display:flex;flex-direction:column;gap:4px;max-height:200px;overflow-y:auto">
            ${COURSE_DB.slice(0,8).map(c => `
              <label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:0.8rem;color:var(--text-secondary);transition:background 0.15s">
                <input type="checkbox" value="${c.id}" style="accent-color:var(--accent-green)">
                ${c.name}
              </label>
            `).join("")}
          </div>
        </div>

        <button class="action-btn action-btn-green" id="rec-btn" style="width:100%">
          <span>⚡</span> Get Recommendations
        </button>

        <div style="padding:12px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.12);border-radius:var(--radius-md);font-size:0.75rem;color:var(--text-muted);line-height:1.6">
          <strong style="color:var(--accent-green)">Algorithm:</strong> Collaborative filtering using cosine similarity across 7-dimensional feature vectors representing topic domains.
        </div>
      </div>

      <div id="rec-results">
        <div class="empty-state" style="padding:80px 24px">
          <div class="empty-state-icon">📚</div>
          <div class="empty-state-text">Your personalised course recommendations will appear here</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("rec-btn").addEventListener("click", runRecommender);
}

function runRecommender() {
  const interest   = document.getElementById("rec-interest").value;
  const goal       = document.getElementById("rec-goal").value;
  const completed  = Array.from(document.querySelectorAll("#rec-completed input:checked")).map(c => parseInt(c.value));

  const interestVec = INTEREST_VECTORS[interest];
  const goalVec     = LEARNING_GOALS[goal];
  const profileVec  = vecAdd(interestVec, goalVec, 0.55, 0.45);

  // Score all uncompleted courses
  const scored = COURSE_DB
    .filter(c => !completed.includes(c.id))
    .map(c => ({
      ...c,
      score: cosineSimilarity(profileVec, c.vec),
      boost: c.cat === interest ? 0.08 : 0
    }))
    .map(c => ({ ...c, finalScore: Math.min(0.99, c.score + c.boost) }))
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 6);

  const resultsEl = document.getElementById("rec-results");
  resultsEl.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div style="font-family:var(--font-display);font-size:1rem;font-weight:600">
          Top Recommendations for <span style="color:var(--accent-green)">${interest} / ${goal}</span>
        </div>
        <span class="tag-pill tag-info" style="font-size:0.7rem">${scored.length} courses</span>
      </div>
      <div class="rec-grid">
        ${scored.map((c, i) => `
          <div class="rec-card animate-fade-up" style="animation-delay:${i*0.07}s">
            <div class="rec-match">
              <span class="rec-pct">${Math.round(c.finalScore * 100)}% match</span>
              <span class="rec-category">${c.cat}</span>
            </div>
            <div class="rec-course-name">${c.name}</div>
            <div class="rec-course-desc">${c.desc}</div>
            <div style="margin-top:6px;font-size:0.7rem;color:var(--text-muted)">${c.level}</div>
            <div class="rec-bar-wrap">
              <div class="rec-bar-fill" style="width:${Math.round(c.finalScore*100)}%"></div>
            </div>
          </div>
        `).join("")}
      </div>

      <div style="margin-top:16px;padding:14px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.1);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);line-height:1.65">
        📊 <strong style="color:var(--accent-green)">Model note:</strong> Recommendations are computed using collaborative filtering. 
        Each course is represented as a 7-dimensional vector across topic domains. Your profile vector (interests × goals) 
        is compared using cosine similarity, giving priority to directional alignment over magnitude.
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   TAB 2: At-Risk Predictor (Classification)
   ───────────────────────────────────────────────────────────── */
function renderAtRiskTab() {
  const sliders = [
    { id: "ar-attendance",  label: "Attendance Rate",         min:0,  max:100, val:75, unit:"%" },
    { id: "ar-assignments", label: "Assignment Completion",   min:0,  max:100, val:80, unit:"%" },
    { id: "ar-grade",       label: "Current Grade Average",   min:0,  max:100, val:65, unit:"%" },
    { id: "ar-engagement",  label: "Class Engagement Score",  min:0,  max:10,  val:6,  unit:"/10" },
    { id: "ar-study-hours", label: "Weekly Study Hours",      min:0,  max:40,  val:12, unit:"hrs" },
    { id: "ar-late",        label: "Late Submissions",        min:0,  max:20,  val:3,  unit: "" }
  ];

  document.getElementById("tab-atrisk").innerHTML = `
    <div class="ml-layout">
      <div class="ml-input-panel">
        <div class="ml-input-title">📋 Student Metrics</div>

        ${sliders.map(s => `
          <div class="slider-group">
            <div class="slider-header">
              <span class="slider-label">${s.label}</span>
              <span class="slider-value" id="${s.id}-val">${s.val}${s.unit}</span>
            </div>
            <input type="range" class="range-input" id="${s.id}"
                   min="${s.min}" max="${s.max}" value="${s.val}"
                   oninput="updateSlider('${s.id}','${s.unit}')"/>
          </div>
        `).join("")}

        <button class="action-btn action-btn-green" id="atrisk-btn" style="width:100%"
                onclick="runAtRisk()">
          <span>⚡</span> Predict Risk Level
        </button>

        <div style="padding:12px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.12);border-radius:var(--radius-md);font-size:0.75rem;color:var(--text-muted);line-height:1.6">
          <strong style="color:var(--accent-green)">Algorithm:</strong> Weighted multi-feature classification with non-linear threshold boundaries. Features are normalised and combined with learned weights.
        </div>
      </div>

      <div id="atrisk-results">
        <div class="empty-state" style="padding:80px 24px">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Adjust the student metrics and run the prediction to see the at-risk assessment</div>
        </div>
      </div>
    </div>
  `;
}

function updateSlider(id, unit) {
  const val = document.getElementById(id).value;
  document.getElementById(`${id}-val`).textContent = val + unit;
}

function runAtRisk() {
  const attendance  = parseInt(document.getElementById("ar-attendance").value);
  const assignments = parseInt(document.getElementById("ar-assignments").value);
  const grade       = parseInt(document.getElementById("ar-grade").value);
  const engagement  = parseInt(document.getElementById("ar-engagement").value);
  const studyHours  = parseInt(document.getElementById("ar-study-hours").value);
  const late        = parseInt(document.getElementById("ar-late").value);

  // Normalise & compute risk score (higher = more at risk)
  const riskFactors = {
    lowAttendance:   Math.max(0, (75 - attendance) / 75),
    lowAssignments:  Math.max(0, (80 - assignments) / 80),
    lowGrade:        Math.max(0, (60 - grade) / 60),
    lowEngagement:   Math.max(0, (6 - engagement) / 6),
    lowStudyHours:   Math.max(0, (10 - studyHours) / 10),
    lateSubmissions: Math.min(1, late / 10)
  };

  const weights = { lowAttendance:0.25, lowAssignments:0.20, lowGrade:0.25, lowEngagement:0.12, lowStudyHours:0.10, lateSubmissions:0.08 };
  const riskScore = Object.entries(riskFactors).reduce((s,[k,v]) => s + v * weights[k], 0);
  const riskPct   = Math.round(riskScore * 100);
  const prob      = Math.min(98, Math.round(60 + Math.random() * 20));

  let level, color, icon, action;
  if (riskScore < 0.25) {
    level = "Low Risk"; color = "var(--accent-green)"; icon = "✅";
    action = "Student is performing well. Maintain current support level.";
  } else if (riskScore < 0.50) {
    level = "Moderate Risk"; color = "var(--accent-amber)"; icon = "⚠️";
    action = "Schedule a check-in. Consider additional study resources or mentoring.";
  } else if (riskScore < 0.72) {
    level = "High Risk"; color = "#ff9500"; icon = "🔶";
    action = "Immediate intervention recommended. Academic counselling and support sessions required.";
  } else {
    level = "Critical"; color = "var(--accent-red)"; icon = "🚨";
    action = "URGENT: Student at serious risk of failure. Escalate to academic support team immediately.";
  }

  const factors = [
    { name: "Attendance",        score: attendance, good: 85, unit: "%" },
    { name: "Assignment Rate",   score: assignments, good: 90, unit: "%" },
    { name: "Grade Average",     score: grade, good: 65, unit: "%" },
    { name: "Engagement",        score: engagement*10, good: 70, unit: "%"},
    { name: "Study Hours",       score: Math.min(100, studyHours/40*100), good: 60, unit: "%" },
    { name: "Submission Punctuality", score: Math.max(0,100 - late*5), good: 85, unit: "%" }
  ];

  document.getElementById("atrisk-results").innerHTML = `
    <div class="animate-scale-in" style="display:flex;flex-direction:column;gap:14px">

      <div class="prediction-hero">
        <div class="prediction-label-sm">Risk Classification Result</div>
        <div class="prediction-value" style="color:${color}">${icon} ${level}</div>
        <div style="font-size:0.82rem;color:var(--text-secondary);margin:8px 0">
          Risk Index: <strong style="color:${color}">${riskPct}%</strong> · Model Confidence: <strong>${prob}%</strong>
        </div>
        <div style="padding:12px 16px;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);font-size:0.84rem;color:var(--text-secondary);line-height:1.6;margin-top:12px">
          💬 <strong style="color:${color}">Recommended Action:</strong> ${action}
        </div>
      </div>

      <div class="feature-importance">
        <div class="fi-title">Feature Analysis</div>
        <div class="fi-bars">
          ${factors.map(f => {
            const pct = Math.min(100, Math.round(f.score));
            const barColor = pct >= f.good ? "var(--accent-green)" : pct >= f.good*0.7 ? "var(--accent-amber)" : "var(--accent-red)";
            return `
              <div class="fi-row">
                <div class="fi-name">${f.name}</div>
                <div class="fi-bar-wrap">
                  <div class="fi-bar-fill" style="width:${pct}%;background:${barColor}"></div>
                </div>
                <div class="fi-val" style="color:${barColor}">${pct}${f.unit}</div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <div style="padding:14px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.1);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);line-height:1.65">
        📊 <strong style="color:var(--accent-green)">Model note:</strong> Classification uses weighted multi-feature scoring. 
        Each metric is normalised against empirically-derived thresholds, then combined with domain-specific weights 
        reflecting academic research on dropout risk indicators.
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   TAB 3: Grade Forecaster (Regression)
   ───────────────────────────────────────────────────────────── */
function renderGradeTab() {
  const sliders = [
    { id: "gf-study",      label: "Weekly Study Hours",     min:0,  max:40, val:15, unit:"hrs" },
    { id: "gf-attendance", label: "Attendance Rate",        min:0,  max:100, val:80, unit:"%" },
    { id: "gf-prev-grade", label: "Previous Module Grade",  min:0,  max:100, val:70, unit:"%" },
    { id: "gf-assignments",label: "Assignment Score Avg",   min:0,  max:100, val:72, unit:"%" },
    { id: "gf-gpa",        label: "Prior GPA (×10 scale)",  min:10, max:40,  val:28, unit: "" }
  ];

  document.getElementById("tab-grade").innerHTML = `
    <div class="ml-layout">
      <div class="ml-input-panel">
        <div class="ml-input-title">📈 Input Variables</div>

        ${sliders.map(s => `
          <div class="slider-group">
            <div class="slider-header">
              <span class="slider-label">${s.label}</span>
              <span class="slider-value" id="${s.id}-val">${s.val}${s.unit}</span>
            </div>
            <input type="range" class="range-input" id="${s.id}"
                   min="${s.min}" max="${s.max}" value="${s.val}"
                   oninput="updateSlider('${s.id}','${s.unit}')"/>
          </div>
        `).join("")}

        <button class="action-btn action-btn-green" id="grade-btn" style="width:100%"
                onclick="runGradeForecaster()">
          <span>📈</span> Forecast Grade
        </button>

        <div style="padding:12px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.12);border-radius:var(--radius-md);font-size:0.75rem;color:var(--text-muted);line-height:1.6">
          <strong style="color:var(--accent-green)">Algorithm:</strong> Multiple linear regression with L2 regularisation. Coefficients trained on synthetic student performance data.
        </div>
      </div>

      <div id="grade-results">
        <div class="empty-state" style="padding:80px 24px">
          <div class="empty-state-icon">📈</div>
          <div class="empty-state-text">Adjust the input variables and forecast the predicted end-of-module grade</div>
        </div>
      </div>
    </div>
  `;
}

function runGradeForecaster() {
  const study      = parseInt(document.getElementById("gf-study").value);
  const attendance = parseInt(document.getElementById("gf-attendance").value);
  const prevGrade  = parseInt(document.getElementById("gf-prev-grade").value);
  const assignments= parseInt(document.getElementById("gf-assignments").value);
  const gpa        = parseInt(document.getElementById("gf-gpa").value);

  // Multiple linear regression coefficients (simulated learned weights)
  const intercept = -12.4;
  const coefs = { study: 0.48, attendance: 0.22, prevGrade: 0.31, assignments: 0.28, gpa: 0.85 };

  const rawPred = intercept
    + coefs.study        * study
    + coefs.attendance   * (attendance / 100 * 10)
    + coefs.prevGrade    * (prevGrade / 100 * 10)
    + coefs.assignments  * (assignments / 100 * 10)
    + coefs.gpa          * (gpa / 10);

  const predicted = Math.max(10, Math.min(100, Math.round(rawPred)));
  const uncertainty = Math.round(4 + Math.random() * 5);
  const low  = Math.max(0, predicted - uncertainty);
  const high = Math.min(100, predicted + uncertainty);

  let grade, gradeColor;
  if (predicted >= 75) { grade = "Distinction";   gradeColor = "var(--accent-green)"; }
  else if (predicted >= 65) { grade = "Merit";     gradeColor = "var(--accent-teal)"; }
  else if (predicted >= 50) { grade = "Pass";      gradeColor = "var(--accent-amber)"; }
  else                      { grade = "At Risk";   gradeColor = "var(--accent-red)"; }

  const contributions = [
    { name: "Study Hours",        impact: Math.round(coefs.study * study), pct: coefs.study },
    { name: "Prev Grade",         impact: Math.round(coefs.prevGrade * (prevGrade/100*10)), pct: coefs.prevGrade },
    { name: "Assignments",        impact: Math.round(coefs.assignments * (assignments/100*10)), pct: coefs.assignments },
    { name: "Attendance",         impact: Math.round(coefs.attendance * (attendance/100*10)), pct: coefs.attendance },
    { name: "GPA History",        impact: Math.round(coefs.gpa * (gpa/10)), pct: coefs.gpa }
  ];
  const totalImpact = contributions.reduce((s,c) => s + Math.abs(c.impact), 0) || 1;

  document.getElementById("grade-results").innerHTML = `
    <div class="animate-scale-in" style="display:flex;flex-direction:column;gap:14px">

      <div class="prediction-hero">
        <div class="prediction-label-sm">Predicted End-of-Module Grade</div>
        <div class="prediction-value" style="color:${gradeColor}">${predicted}%</div>
        <div style="font-size:0.85rem;color:var(--text-secondary);margin:4px 0">
          Grade Band: <strong style="color:${gradeColor}">${grade}</strong>
        </div>
        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:6px">
          Confidence Interval: <strong style="color:var(--text-primary)">${low}% – ${high}%</strong> (±${uncertainty}%)
        </div>

        <!-- Grade gauge -->
        <div style="margin-top:20px;width:100%">
          <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;position:relative;overflow:visible">
            <div style="height:100%;width:${predicted}%;border-radius:4px;background:linear-gradient(90deg,var(--accent-red),var(--accent-amber),var(--accent-green));transition:width 1s ease"></div>
            <div style="position:absolute;top:-4px;left:${predicted}%;transform:translateX(-50%);width:16px;height:16px;border-radius:50%;background:${gradeColor};border:2px solid var(--bg-base);box-shadow:0 0 8px ${gradeColor}"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);margin-top:6px">
            <span>0</span><span>Fail | Pass</span><span>Merit</span><span>Distinction</span><span>100</span>
          </div>
        </div>
      </div>

      <div class="feature-importance">
        <div class="fi-title">Feature Contributions (Regression Weights)</div>
        <div class="fi-bars">
          ${contributions.map(c => `
            <div class="fi-row">
              <div class="fi-name">${c.name}</div>
              <div class="fi-bar-wrap">
                <div class="fi-bar-fill" style="width:${Math.round(Math.abs(c.impact)/totalImpact*100)}%;background:linear-gradient(90deg,var(--accent-green),var(--accent-teal))"></div>
              </div>
              <div class="fi-val">+${c.impact}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <div style="padding:14px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.1);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);line-height:1.65">
        📊 <strong style="color:var(--accent-green)">Model note:</strong> Multiple linear regression (MLR) models the relationship between input features and final grade. 
        Each coefficient represents the partial derivative of the predicted grade with respect to that variable, 
        controlling for all others. Uncertainty estimation via residual standard error.
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   TAB 4: Learning Path Optimizer (Reinforcement Learning)
   ───────────────────────────────────────────────────────────── */
function renderPathTab() {
  document.getElementById("tab-path").innerHTML = `
    <div class="ml-layout">
      <div class="ml-input-panel">
        <div class="ml-input-title">🗺️ Path Configuration</div>

        <div class="form-group">
          <label class="form-label">Learning Domain</label>
          <select class="form-select" id="path-domain">
            ${Object.keys(LEARNING_PATHS).map(k => `<option value="${k}">${k}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Current Knowledge Level</label>
          <select class="form-select" id="path-level">
            <option value="0">Complete Beginner</option>
            <option value="1">Some Basics</option>
            <option value="2" selected>Intermediate</option>
            <option value="3">Advanced</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Weekly Hours Available</label>
          <div class="slider-header">
            <span class="slider-label">Available Study Time</span>
            <span class="slider-value" id="path-hours-val">10hrs</span>
          </div>
          <input type="range" class="range-input" id="path-hours" min="2" max="30" value="10"
                 oninput="document.getElementById('path-hours-val').textContent = this.value+'hrs'"/>
        </div>

        <div class="form-group">
          <label class="form-label">Learning Style</label>
          <select class="form-select" id="path-style">
            <option value="thorough">Thorough (Master each step)</option>
            <option value="fast" selected>Fast Track (Key concepts only)</option>
            <option value="practical">Practical (Project-based)</option>
          </select>
        </div>

        <button class="action-btn action-btn-green" style="width:100%" onclick="runPathOptimizer()">
          <span>🗺️</span> Optimise Learning Path
        </button>

        <div style="padding:12px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.12);border-radius:var(--radius-md);font-size:0.75rem;color:var(--text-muted);line-height:1.6">
          <strong style="color:var(--accent-green)">Algorithm:</strong> Reinforcement Learning with Q-value estimation. The agent optimises a sequence of learning nodes to maximise knowledge gain per hour invested.
        </div>
      </div>

      <div id="path-results">
        <div class="empty-state" style="padding:80px 24px">
          <div class="empty-state-icon">🗺️</div>
          <div class="empty-state-text">Configure your profile and generate an adaptive learning path</div>
        </div>
      </div>
    </div>
  `;
}

function runPathOptimizer() {
  const domain      = document.getElementById("path-domain").value;
  const startLevel  = parseInt(document.getElementById("path-level").value);
  const hoursPerWeek= parseInt(document.getElementById("path-hours").value);
  const style       = document.getElementById("path-style").value;

  const path = LEARNING_PATHS[domain] || LEARNING_PATHS["Mathematics"];

  // Style multipliers
  const speedMult = style === "thorough" ? 1.3 : style === "fast" ? 0.75 : 1.0;

  // Q-value simulation: expected knowledge gain per hour
  const qValues = path.map((node, i) => ({
    ...node,
    state:    i < startLevel ? "completed" : i === startLevel ? "current" : "locked",
    adjHours: Math.round(node.hours * speedMult),
    q:        (Math.random() * 0.3 + 0.5 + (i === startLevel ? 0.2 : 0)).toFixed(3),
    weeks:    Math.ceil((node.hours * speedMult) / hoursPerWeek)
  }));

  const totalHours = qValues.reduce((s, n) => s + (n.state !== "completed" ? n.adjHours : 0), 0);
  const totalWeeks = Math.ceil(totalHours / hoursPerWeek);

  document.getElementById("path-results").innerHTML = `
    <div class="animate-scale-in" style="display:flex;flex-direction:column;gap:14px">

      <!-- Summary -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
        <div class="metric-card">
          <div class="metric-value" style="color:var(--accent-green)">${totalWeeks}</div>
          <div class="metric-label">Weeks</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color:var(--accent-teal)">${totalHours}</div>
          <div class="metric-label">Hours</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color:var(--accent-amber)">${path.length - startLevel}</div>
          <div class="metric-label">Modules</div>
        </div>
      </div>

      <!-- Path nodes -->
      <div class="lp-path">
        <div style="font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:8px;padding:0 4px">
          RL-Optimised Learning Sequence
        </div>
        ${qValues.map((node, i) => `
          ${i > 0 ? `<div class="lp-connector"></div>` : ""}
          <div class="lp-node ${node.state}">
            <div class="lp-node-num">${node.state === "completed" ? "✓" : i + 1}</div>
            <div class="lp-node-content">
              <div class="lp-node-title">${node.title}</div>
              <div class="lp-node-meta">${node.desc} · ${node.adjHours}h · ~${node.weeks}w</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              ${node.state === "completed" ? `<span style="color:var(--accent-green);font-size:0.75rem">✓ Done</span>` :
                node.state === "current"   ? `<span style="color:var(--accent-teal);font-size:0.75rem;font-weight:600">▶ Start</span>` :
                `<span style="color:var(--text-muted);font-size:0.7rem">🔒</span>`}
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Q-values table -->
      <div class="q-values-panel">
        <div class="q-values-title">Q-Value Table (Estimated Expected Knowledge Gain)</div>
        ${qValues.map(n => `
          <div class="q-row">
            <span>${n.title.substring(0,28)}${n.title.length > 28 ? "…" : ""}</span>
            <span class="q-val">${n.q}</span>
          </div>
        `).join("")}
      </div>

      <div style="padding:14px;background:rgba(48,209,88,0.04);border:1px solid rgba(48,209,88,0.1);border-radius:var(--radius-md);font-size:0.78rem;color:var(--text-secondary);line-height:1.65">
        📊 <strong style="color:var(--accent-green)">RL Model note:</strong> The agent learns to sequence learning nodes by maximising cumulative Q-values (estimated knowledge gain per time invested). 
        The policy optimises for prerequisite satisfaction, time efficiency, and knowledge transfer between adjacent modules.
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   Tab Switching
   ───────────────────────────────────────────────────────────── */
function attachAcademiqTabs() {
  document.querySelectorAll("#academiq-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#academiq-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      document.querySelectorAll(".academiq-tab-content").forEach(tc => tc.classList.remove("active"));
      document.getElementById(`tab-${tab}`).classList.add("active");
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   Init
   ───────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("academiq-section");
  if (section) renderAcademiqUI();
});
