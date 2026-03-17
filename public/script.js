/**
 * HealthLens AI v3 — script.js
 * Tab 1: Dropdown + value manual entry
 * Tab 2: OCR blood report upload
 * Tab 3: Heart & Brain ECG/MRI analysis
 */

// ── Param Meta ─────────────────────────────────────────────────────────────
const PARAM_META = {
  hemoglobin:    { label:"Hemoglobin",        icon:"🩸", unit:"g/dL",      max:22,    nMin:12,     nMax:17.5,  ref:"Normal: 12–17.5 g/dL" },
  glucose:       { label:"Blood Glucose",     icon:"🍬", unit:"mg/dL",     max:400,   nMin:70,     nMax:100,   ref:"Fasting normal: 70–100 mg/dL" },
  cholesterol:   { label:"Total Cholesterol", icon:"🫀", unit:"mg/dL",     max:400,   nMin:0,      nMax:200,   ref:"Optimal: below 200 mg/dL" },
  ldl:           { label:"LDL Cholesterol",   icon:"⚠️", unit:"mg/dL",     max:300,   nMin:0,      nMax:100,   ref:"Optimal: below 100 mg/dL" },
  hdl:           { label:"HDL Cholesterol",   icon:"💛", unit:"mg/dL",     max:120,   nMin:40,     nMax:60,    ref:"Good: above 60 mg/dL" },
  triglycerides: { label:"Triglycerides",     icon:"🧈", unit:"mg/dL",     max:600,   nMin:0,      nMax:150,   ref:"Normal: below 150 mg/dL" },
  bun:           { label:"BUN",               icon:"🫘", unit:"mg/dL",     max:60,    nMin:7,      nMax:20,    ref:"Normal: 7–20 mg/dL" },
  creatinine:    { label:"Creatinine",        icon:"🧪", unit:"mg/dL",     max:5,     nMin:0.6,    nMax:1.2,   ref:"Normal: 0.6–1.2 mg/dL" },
  uricAcid:      { label:"Uric Acid",         icon:"🦴", unit:"mg/dL",     max:12,    nMin:3.4,    nMax:7.0,   ref:"Normal: 3.4–7.0 mg/dL" },
  sodium:        { label:"Sodium (Na⁺)",      icon:"🧂", unit:"mEq/L",     max:160,   nMin:136,    nMax:145,   ref:"Normal: 136–145 mEq/L" },
  potassium:     { label:"Potassium (K⁺)",    icon:"⚡", unit:"mEq/L",     max:7,     nMin:3.5,    nMax:5.0,   ref:"Normal: 3.5–5.0 mEq/L" },
  calcium:       { label:"Calcium (Ca²⁺)",    icon:"🦷", unit:"mg/dL",     max:15,    nMin:8.5,    nMax:10.5,  ref:"Normal: 8.5–10.5 mg/dL" },
  vitaminD:      { label:"Vitamin D",         icon:"☀️", unit:"ng/mL",     max:100,   nMin:20,     nMax:50,    ref:"Sufficient: above 30 ng/mL" },
  wbc:           { label:"WBC Count",         icon:"🦠", unit:"cells/µL",  max:15000, nMin:4000,   nMax:11000, ref:"Normal: 4000–11000 cells/µL" },
  rbc:           { label:"RBC Count",         icon:"🔴", unit:"M/µL",      max:7,     nMin:4.0,    nMax:5.5,   ref:"Normal: 4.0–5.5 million/µL" },
  platelets:     { label:"Platelets (PLT)",   icon:"🩹", unit:"cells/µL",  max:500000,nMin:150000, nMax:400000,ref:"Normal: 150,000–400,000 cells/µL" },
  tsh:           { label:"TSH (Thyroid)",     icon:"🦋", unit:"mIU/L",     max:10,    nMin:0.4,    nMax:4.0,   ref:"Normal: 0.4–4.0 mIU/L" },
};

// OCR patterns for blood parameters
const OCR_PATTERNS = {
  hemoglobin:    [/(?:h(?:a?e?mo?)?globin|hgb?|hb)\s*[:\-\(\/]?\s*(?:g\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i],
  glucose:       [/(?:fasting\s+)?(?:blood\s+)?(?:glucose|sugar|f\.?b\.?s\.?|r\.?b\.?s\.?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i],
  cholesterol:   [/(?:total\s+)?(?:t\.?\s*)?cholesterol\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i],
  ldl:           [/l\.?d\.?l\.?\s*(?:cholesterol)?\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i],
  hdl:           [/h\.?d\.?l\.?\s*(?:cholesterol)?\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i],
  triglycerides: [/(?:triglycerides?|tg)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,4}(?:\.\d)?)/i],
  bun:           [/(?:blood\s+urea\s+nitrogen|b\.?u\.?n\.?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i],
  creatinine:    [/creatinine\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i],
  uricAcid:      [/uric\s*acid\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i],
  sodium:        [/(?:sodium|na\+?)\s*[:\-\(]?\s*(?:m[e]?q\/l)?\s*[:\-]?\s*(\d{3}(?:\.\d)?)/i],
  potassium:     [/(?:potassium|k\+?)\s*[:\-\(]?\s*(?:m[e]?q\/l)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i],
  calcium:       [/(?:calcium|ca\+?\+?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i],
  vitaminD:      [/(?:vitamin\s*d|vit\.?\s*d|25-?oh)\s*[:\-\(]?\s*(?:ng\/ml)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i],
  wbc:           [/(?:wbc|white\s*blood\s*cells?|total\s*wbc)\s*(?:count)?\s*[:\-\(]?\s*(?:cells?\/[µu]?l|\/cmm)?\s*[:\-]?\s*(\d{3,6}(?:\.\d)?)/i],
  rbc:           [/(?:rbc|red\s*blood\s*cells?)\s*(?:count)?\s*[:\-\(]?\s*(?:million\/[µu]?l|\/cmm)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i],
  platelets:     [/(?:platelet|plt)\s*(?:count)?\s*[:\-\(]?\s*(?:cells?\/[µu]?l|\/cmm)?\s*[:\-]?\s*(\d{3,7}(?:\.\d)?)/i],
  tsh:           [/(?:t\.?s\.?h\.?|thyroid\s*stimulating)\s*[:\-\(]?\s*(?:m[i]?u\/l)?\s*[:\-]?\s*(\d{1,3}(?:\.\d{1,3})?)/i],
};

const BOUNDS = {
  hemoglobin:[2,22], glucose:[30,700], cholesterol:[50,700], ldl:[20,500], hdl:[10,120],
  triglycerides:[30,2000], bun:[2,150], creatinine:[0.2,20], uricAcid:[1,20],
  sodium:[110,175], potassium:[1.5,9], calcium:[4,18], vitaminD:[2,200],
  wbc:[500,100000], rbc:[1,8], platelets:[5000,1500000], tsh:[0.01,50],
};

// ── State ──────────────────────────────────────────────────────────────────
let currentTab = "manual";
let addedParams = {}; // key → value
let healthChart = null;
let hbType = "heart";

// ── Dropdown Change Handler ──────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("paramSelect");
  if (sel) {
    sel.addEventListener("change", function() {
      const m = PARAM_META[this.value];
      document.getElementById("refHint").textContent = m ? m.ref : "Select a parameter to see reference range";
      document.getElementById("paramValue").placeholder = m ? "Enter value in "+m.unit+"…" : "Enter value…";
      document.getElementById("paramValue").focus();
    });
  }
  // Init HB switcher styling
  const hs = document.getElementById("hbsSwitchHeart");
  const bs = document.getElementById("hbsSwitchBrain");
  if (hs) hs.classList.add("heart");
  if (bs) bs.classList.add("brain");
});

// ── Add Parameter (manual entry dropdown) ────────────────────────────────────
function addParam() {
  const key    = document.getElementById("paramSelect").value;
  const rawVal = document.getElementById("paramValue").value.trim();
  const errEl  = document.getElementById("manualError");
  errEl.classList.add("hidden");

  if (!key)    { errEl.textContent="Please select a parameter from the dropdown."; errEl.classList.remove("hidden"); return; }
  if (!rawVal) { errEl.textContent="Please enter a value."; errEl.classList.remove("hidden"); return; }

  const val = parseFloat(rawVal);
  if (isNaN(val)) { errEl.textContent="Please enter a valid number."; errEl.classList.remove("hidden"); return; }

  const [lo, hi] = BOUNDS[key];
  if (val < lo || val > hi) {
    errEl.textContent="Value "+val+" is outside the valid range ("+lo+"–"+hi+") for "+PARAM_META[key].label+". Please check.";
    errEl.classList.remove("hidden"); return;
  }

  addedParams[key] = val;
  renderChips();
  document.getElementById("paramSelect").value = "";
  document.getElementById("paramValue").value  = "";
  document.getElementById("refHint").textContent = "Select a parameter to see reference range";
}

function removeParam(key) { delete addedParams[key]; renderChips(); }
function clearAllParams() { addedParams = {}; renderChips(); }

function renderChips() {
  const container = document.getElementById("addedParams");
  const chips     = document.getElementById("paramChips");
  if (!chips) return;
  chips.innerHTML = "";
  if (Object.keys(addedParams).length === 0) { container.classList.add("hidden"); return; }
  container.classList.remove("hidden");
  for (const [key, val] of Object.entries(addedParams)) {
    const m = PARAM_META[key];
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.innerHTML = `<span class="chip-name">${m.icon} ${m.label}</span><span class="chip-val">${val}</span><span class="chip-unit">${m.unit}</span><button class="chip-del" onclick="removeParam('${key}')" title="Remove">✕</button>`;
    chips.appendChild(chip);
  }
}

// ── Tab Switching ───────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;

  // Explicitly show/hide each panel using exact IDs
  const panels = { manual: "panelManual", upload: "panelUpload", hb: "panelHB" };
  const tabs   = { manual: "tabManual",   upload: "tabUpload",   hb: "tabHB"   };

  Object.keys(panels).forEach(t => {
    const panel = document.getElementById(panels[t]);
    const btn   = document.getElementById(tabs[t]);
    if (panel) panel.style.display = (t === tab) ? "block" : "none";
    if (btn)   btn.classList.toggle("active", t === tab);
  });

  // Show/hide analyze button
  const analyzeBtn = document.getElementById("btnAnalyze");
  if (analyzeBtn) {
    analyzeBtn.style.display = (tab === "hb") ? "none" : "block";
    analyzeBtn.textContent = tab === "upload" ? "🔬 Analyze Detected Values" : "🔬 Analyze My Blood Report";
  }
  hideError();
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ── HB Type ─────────────────────────────────────────────────────────────────
// ── HB Section Switcher ─────────────────────────────────────────────────────
let currentHBSection = 'heart';
let pendingFiles = { heart: null, brain: null };

function switchHBSection(sec) {
  currentHBSection = sec;
  hbType = sec;

  // Switcher buttons
  const hBtn = document.getElementById('hbsSwitchHeart');
  const bBtn = document.getElementById('hbsSwitchBrain');
  if (hBtn) hBtn.className = 'hbs-btn' + (sec === 'heart' ? ' active heart' : '');
  if (bBtn) bBtn.className = 'hbs-btn' + (sec === 'brain' ? ' active brain' : '');

  // Sections — use inline style for reliability
  const heartSec = document.getElementById('hbSectionHeart');
  const brainSec = document.getElementById('hbSectionBrain');
  if (heartSec) heartSec.style.display = (sec === 'heart') ? 'block' : 'none';
  if (brainSec) brainSec.style.display = (sec === 'brain') ? 'block' : 'none';
}

// Keep old setHBType for backward compat (called from nowhere now)
function setHBType(type) { switchHBSection(type); }

// ── Per-section drag & drop ──────────────────────────────────────────────────
function secDragEnter(e, sec) {
  e.preventDefault();
  document.getElementById(sec+'DropZone').classList.add('dz-active');
  document.getElementById(sec+'DZOverlay').classList.remove('hidden');
}
function secDragOver(e, sec) {
  e.preventDefault();
  document.getElementById(sec+'DropZone').classList.add('dz-active');
  document.getElementById(sec+'DZOverlay').classList.remove('hidden');
}
function secDragLeave(e, sec) {
  const zone = document.getElementById(sec+'DropZone');
  if (!zone.contains(e.relatedTarget)) {
    zone.classList.remove('dz-active');
    document.getElementById(sec+'DZOverlay').classList.add('hidden');
  }
}
function secDrop(e, sec) {
  e.preventDefault();
  document.getElementById(sec+'DropZone').classList.remove('dz-active');
  document.getElementById(sec+'DZOverlay').classList.add('hidden');
  const f = e.dataTransfer.files[0];
  if (f) secSetFile(f, sec);
}
function secFileSelect(e, sec) {
  const f = e.target.files[0];
  if (f) secSetFile(f, sec);
}

function secSetFile(file, sec) {
  const valid = ['image/jpeg','image/png','image/gif','image/webp','application/pdf'];
  if (!valid.includes(file.type)) { showError('Please upload a JPG, PNG, or PDF file.'); return; }
  pendingFiles[sec] = file;

  const card = document.getElementById(sec+'FileCard');
  document.getElementById(sec+'FCIcon').textContent = file.type==='application/pdf' ? '📋' : '🖼️';
  document.getElementById(sec+'FCName').textContent = file.name;
  document.getElementById(sec+'FCSize').textContent = formatFileSize(file.size);
  card.classList.remove('hidden');
  hideError();
}

function secRemove(sec) {
  pendingFiles[sec] = null;
  document.getElementById(sec+'FileCard').classList.add('hidden');
  document.getElementById('fileInput'+capitalize(sec)).value = '';
  hide(sec+'OCRProgress'); hide(sec+'OCRPreview');
  hideError();
}

async function secAnalyze(sec) {
  const file = pendingFiles[sec];
  if (!file) { showError('No file selected.'); return; }
  hbType = sec;
  await secProcessFile(file, sec);
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

async function secProcessFile(file, sec) {
  show(sec+'OCRProgress'); hide(sec+'OCRPreview');
  document.getElementById(sec+'OCRBar').style.width = '5%';
  document.getElementById(sec+'OCRStatus').textContent = 'Reading: '+file.name+'…';

  try {
    const imgUrl = file.type==='application/pdf' ? await pdfToImage(file) : await fileToDataUrl(file);
    document.getElementById(sec+'OCRBar').style.width = '20%';
    document.getElementById(sec+'OCRStatus').textContent = 'OCR engine loading…';

    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status==='recognizing text') {
          const pct = Math.round(m.progress*60)+25;
          document.getElementById(sec+'OCRBar').style.width = pct+'%';
          document.getElementById(sec+'OCRStatus').textContent = 'Scanning… '+Math.round(m.progress*100)+'%';
        }
      }
    });
    document.getElementById(sec+'OCRBar').style.width = '88%';
    document.getElementById(sec+'OCRStatus').textContent = 'Analyzing…';
    const { data:{ text } } = await worker.recognize(imgUrl);
    await worker.terminate();

    document.getElementById(sec+'OCRText').textContent = text.trim() || '(No text detected)';
    show(sec+'OCRPreview');
    document.getElementById(sec+'OCRBar').style.width = '100%';
    document.getElementById(sec+'OCRStatus').textContent = 'Done!';
    setTimeout(() => hide(sec+'OCRProgress'), 700);

    await sendHBForAnalysis(text);
  } catch(err) {
    hide(sec+'OCRProgress');
    showError('OCR failed: '+(err.message || 'Unknown error.'));
  }
}

// ── Legacy handlers (still referenced from old HTML in case) ─────────────────
function handleDragOverHB(e) { e.preventDefault(); }
function handleDropHB(e) { e.preventDefault(); }
function handleFileUploadHB(e) {}
function hbDragEnter(e) { e.preventDefault(); }
function hbDragLeave(e) {}

// Keep for old file card
let pendingHBFile = null;
function removeHBFile() {}
async function analyzeHBFile() {}

// Toggle test card expand/collapse
function toggleTestCard(card) {
  card.classList.toggle('open');
}


async function sendHBForAnalysis(text) {
  hide("inputSection");
  show("loadingSection");
  document.getElementById("loadingText").textContent = `Analyzing ${hbType === "heart" ? "cardiac" : "neurological"} report…`;

  try {
    const res = await fetch("/analyze-hb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, type: hbType }),
    });
    const data = await res.json();
    hide("loadingSection");
    show("hbResultsSection");
    renderHBResults(data);
  } catch(err) {
    hide("loadingSection");
    show("inputSection");
    showError("Server error: " + err.message);
  }
}

async function browseAllConditions() {
  hide("inputSection");
  show("loadingSection");
  document.getElementById("loadingText").textContent = `Loading all ${hbType} conditions…`;
  try {
    const res  = await fetch(`/conditions/${hbType}`);
    const data = await res.json();
    hide("loadingSection");
    show("hbResultsSection");
    renderHBResults({ conditions: data.conditions, detected: false, detectedCount: 0 });
  } catch(err) {
    hide("loadingSection"); show("inputSection");
    showError("Server error: " + err.message);
  }
}

// ── HB Results Render ───────────────────────────────────────────────────────
function renderHBResults(data) {
  const { conditions, detected, detectedCount } = data;
  const isHeart = hbType === "heart";

  document.getElementById("hbResultsTitle").textContent = isHeart ? "🫀 Heart & ECG Analysis" : "🧠 Brain & Neurology Analysis";

  // Banner
  const banner = document.getElementById("hbDetectedBanner");
  if (detected && detectedCount > 0) {
    banner.classList.remove("hidden");
    banner.className = "hb-banner";
    banner.innerHTML = `
      <div class="hb-banner-icon">${isHeart ? "🫀" : "🧠"}</div>
      <div class="hb-banner-text">
        <h3>${detectedCount} condition${detectedCount>1?"s":""} detected in your report</h3>
        <p>The following conditions were identified in your uploaded report. Expand each card for detailed clinical information, symptoms, treatment, and lifestyle advice.</p>
      </div>
    `;
  } else {
    banner.classList.add("hidden");
  }

  const list = document.getElementById("hbConditionList");
  list.innerHTML = "";

  conditions.forEach((cond, i) => {
    const card = document.createElement("div");
    card.className = `hb-card ${cond.category}${cond.detected ? " detected" : ""}`;
    card.style.animationDelay = (i * 0.07) + "s";
    card.id = `hbc-${i}`;

    card.innerHTML = `
      <div class="hb-card-head" onclick="toggleHBCard(${i})">
        <span class="hb-icon">${cond.icon}</span>
        <div class="hb-info">
          <div class="hb-name">${cond.name}</div>
          <div class="hb-cat">${isHeart ? "Cardiology / ECG" : "Neurology / Brain"} • ${cond.severity === "danger" ? "Serious Condition" : "Important Condition"}</div>
          <div class="hb-badges">
            <span class="hb-badge ${cond.severity}">${cond.severity === "danger" ? "🔴 SERIOUS" : "🟡 IMPORTANT"}</span>
            ${cond.detected ? '<span class="hb-badge detected">✅ Detected in Report</span>' : ""}
          </div>
        </div>
        <div class="hb-toggle">▼</div>
      </div>

      <div class="hb-body">
        <!-- ECG / Scan Findings -->
        <div class="hb-ecg-box">
          <div class="hb-ecg-title">📊 ${isHeart ? "ECG FINDINGS / DIAGNOSTIC CRITERIA" : "SCAN / EEG FINDINGS"}</div>
          <div class="hb-ecg-text">${cond.ecgFindings}</div>
        </div>

        <!-- Real-world data -->
        <div class="hb-real-data">
          <div class="hb-real-title">📰 REAL-WORLD DATA & STATISTICS</div>
          <div class="hb-real-text">${cond.realWorldData}</div>
        </div>

        <!-- Explanation -->
        <div class="hb-explanation">${cond.explanation}</div>

        <!-- 4-section grid -->
        <div class="hb-full-grid">
          <div class="hb-section hb-s-symptoms">
            <div class="hb-s-title">🔴 Symptoms to Watch For</div>
            <ul class="hb-list">${cond.symptoms.map(s=>`<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="hb-section hb-s-risk">
            <div class="hb-s-title">⚠️ Risk Factors</div>
            <ul class="hb-list">${cond.riskFactors.map(s=>`<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="hb-section hb-s-treatment">
            <div class="hb-s-title">💊 Treatment Options</div>
            <ul class="hb-list">${cond.treatment.map(s=>`<li>${s}</li>`).join("")}</ul>
          </div>
          <div class="hb-section hb-s-lifestyle">
            <div class="hb-s-title">🌿 Lifestyle & Prevention</div>
            <ul class="hb-list">${cond.lifestyle.map(s=>`<li>${s}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    `;

    // Auto-open detected conditions
    if (cond.detected) {
      setTimeout(() => { card.classList.add("open"); }, 100 + i * 80);
    }

    list.appendChild(card);
  });
}

function toggleHBCard(i) {
  document.getElementById(`hbc-${i}`).classList.toggle("open");
}

function resetHB() {
  pendingHBFile = null;
  pendingFiles = { heart: null, brain: null };
  hide("hbResultsSection");
  show("inputSection");
  switchTab("hb");
  // Reset heart section
  ["heart","brain"].forEach(sec => {
    const fc = document.getElementById(sec+"FileCard");
    if (fc) fc.classList.add("hidden");
    const fi = document.getElementById("fileInput"+sec.charAt(0).toUpperCase()+sec.slice(1));
    if (fi) fi.value = "";
    hide(sec+"OCRPreview"); hide(sec+"OCRProgress");
  });
  hideError();
  window.scrollTo({ top:0, behavior:"smooth" });
}

// ── Blood Analysis ──────────────────────────────────────────────────────────
async function runAnalysis() {
  hideError();
  document.getElementById("manualError").classList.add("hidden");

  // If upload tab, use addedParams already populated by OCR
  const data = { ...addedParams };

  if (Object.keys(data).length === 0) {
    if (currentTab === "manual") {
      document.getElementById("manualError").textContent = "Please add at least one parameter using the dropdown above, then click Analyze.";
      document.getElementById("manualError").classList.remove("hidden");
    } else {
      showError("No values detected. Please upload a blood report or switch to Manual Entry.");
    }
    return;
  }

  hide("inputSection");
  show("loadingSection");
  document.getElementById("loadingText").textContent = "Analyzing your blood report…";
  hide("resultsSection");

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const json = await res.json();
    hide("loadingSection");
    show("resultsSection");
    renderBloodResults(json);
  } catch(err) {
    hide("loadingSection"); show("inputSection");
    showError("Cannot connect to server. Make sure the backend is running on port 3000.\n" + err.message);
  }
}

// ── Blood Results ────────────────────────────────────────────────────────────
function renderBloodResults(data) {
  const { results, conditions, summary } = data;
  renderSummaryBanner(summary, results);
  renderBloodConditions(conditions);
  renderChart(results);
  renderParamCards(results);
  window.scrollTo({ top:0, behavior:"smooth" });
}

function renderSummaryBanner(summary, results) {
  const el = document.getElementById("summaryBanner");
  const icons = { danger:"🚨", warning:"⚠️", success:"✅" };
  const danger  = Object.values(results).filter(r=>r.color==="danger").length;
  const warning = Object.values(results).filter(r=>r.color==="warning").length;
  const normal  = Object.values(results).filter(r=>r.color==="success").length;
  el.className = `summary-banner ${summary.overallColor}`;
  el.innerHTML = `
    <div class="sb-icon">${icons[summary.overallColor]}</div>
    <div>
      <div class="sb-title">Overall Health Summary</div>
      <div class="sb-desc">${summary.overall} Out of <strong>${summary.total}</strong> parameters analyzed.</div>
      <div class="sb-stats">
        ${danger  ? `<span class="sb-stat danger">${danger} Critical</span>` : ""}
        ${warning ? `<span class="sb-stat warning">${warning} Borderline</span>` : ""}
        ${normal  ? `<span class="sb-stat success">${normal} Normal</span>` : ""}
      </div>
    </div>
  `;
}

function renderBloodConditions(conditions) {
  const sec = document.getElementById("conditionSection");
  const grid = document.getElementById("conditionCards");
  if (!conditions || conditions.length === 0) { sec.classList.add("hidden"); return; }
  sec.classList.remove("hidden");
  grid.innerHTML = "";
  conditions.forEach((c,i) => {
    const div = document.createElement("div");
    div.className = `cond-card ${c.severity}`;
    div.style.animationDelay = (i*0.07)+"s";
    div.innerHTML = `
      <div class="cond-head">
        <span class="cond-icon">${c.icon}</span>
        <span class="cond-name">${c.name}</span>
        <span class="cond-sev">${c.severity==="danger"?"URGENT":"MONITOR"}</span>
      </div>
      <div class="cond-summary">${c.summary}</div>
      <div class="cond-action">💡 ${c.action}</div>
    `;
    grid.appendChild(div);
  });
}

function renderChart(results) {
  const canvas = document.getElementById("healthChart");
  if (!canvas) return;
  if (healthChart) { healthChart.destroy(); healthChart = null; }
  const labels=[], vals=[], colors=[], normals=[];
  const colorMap = { success:"#2dd878", warning:"#f5a72a", danger:"#e84545" };
  for (const [key,r] of Object.entries(results)) {
    const m = PARAM_META[key]; if (!m) continue;
    labels.push(m.label); vals.push(r.value);
    colors.push(colorMap[r.color]); normals.push(m.nMax);
  }
  const w = Math.max(480, labels.length * 70);
  document.getElementById("chartContainer").style.width = w + "px";
  healthChart = new Chart(canvas, {
    type:"bar",
    data:{
      labels,
      datasets:[
        { label:"Your Value", data:vals, backgroundColor:colors.map(c=>c+"bb"), borderColor:colors, borderWidth:2, borderRadius:6, borderSkipped:false },
        { label:"Upper Normal", data:normals, type:"line", borderColor:"rgba(140,170,200,0.45)", borderWidth:1.5, borderDash:[6,4], pointStyle:false, fill:false, tension:0 },
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:ctx=>ctx.datasetIndex===0?` Your value: ${ctx.raw}`:` Upper normal: ${ctx.raw}` } } },
      scales:{
        y:{ beginAtZero:true, grid:{ color:"rgba(38,57,79,0.6)" }, ticks:{ color:"#4a6a88", font:{ family:"'Outfit', sans-serif", size:11 } } },
        x:{ grid:{ display:false }, ticks:{ color:"#4a6a88", font:{ family:"'Outfit', sans-serif", size:10 }, maxRotation:45 } }
      }
    }
  });
}

function renderParamCards(results) {
  const container = document.getElementById("paramResults");
  container.innerHTML = "";
  const ordered = Object.entries(results).sort((a,b)=>({ danger:0, warning:1, success:2 }[a[1].color] - { danger:0, warning:1, success:2 }[b[1].color]));
  ordered.forEach(([key,r], i) => {
    const m = PARAM_META[key]; if (!m) return;
    const pct = Math.min((r.value / m.max)*100, 100).toFixed(1);
    const card = document.createElement("div");
    card.className = "pr-card";
    card.style.animationDelay = (i*0.06)+"s";
    card.innerHTML = `
      <div class="pr-header ${r.color}">
        <span class="pr-icon">${m.icon}</span>
        <div class="pr-info">
          <div class="pr-name">${m.label}</div>
          <span class="pr-badge badge-${r.color}">${r.status}</span>
        </div>
        <div class="pr-val">
          <div class="pr-num ${r.color}">${r.value}</div>
          <div class="pr-unit">${m.unit}</div>
        </div>
      </div>
      <div class="pr-body">
        <div class="pr-explanation ${r.color}">${r.explanation}</div>
        <div class="mini-bar">
          <div class="mini-bar-label"><span>0</span><span>Normal: ${m.nMin}–${m.nMax} ${m.unit}</span><span>${m.max}+</span></div>
          <div class="mini-bar-bg"><div class="mini-bar-fill ${r.color}" style="width:0%" data-target="${pct}%"></div></div>
        </div>
        <div class="advice-grid">
          <div class="advice-box advice-eat"><div class="advice-title">✅ What to Consume</div><ul class="advice-list">${r.consume.map(x=>`<li>${x}</li>`).join("")}</ul></div>
          <div class="advice-box advice-avoid"><div class="advice-title">🚫 What to Avoid</div><ul class="advice-list">${r.avoid.map(x=>`<li>${x}</li>`).join("")}</ul></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  setTimeout(() => {
    document.querySelectorAll(".mini-bar-fill[data-target]").forEach(el => el.style.width = el.dataset.target);
  }, 120);
}

function resetAll() {
  hide("resultsSection");
  show("inputSection");
  hideError();
  switchTab("manual");
  if (healthChart) { healthChart.destroy(); healthChart = null; }
  window.scrollTo({ top:0, behavior:"smooth" });
}

// ── OCR Helpers ─────────────────────────────────────────────────────────────
function extractBloodValues(text) {
  const t = text.replace(/\n+/g," ").replace(/\s+/g," ").replace(/[|l](?=\d)/g,"1");
  const result = {};
  for (const [key, patterns] of Object.entries(OCR_PATTERNS)) {
    result[key] = null;
    for (const pat of patterns) {
      const m = t.match(pat);
      if (m) {
        const val = parseFloat(m[1]);
        const [lo,hi] = BOUNDS[key];
        if (!isNaN(val) && val>=lo && val<=hi) { result[key]=val; break; }
      }
    }
  }
  return result;
}

function renderExtractedChips(vals) {
  const grid = document.getElementById("extractedGrid");
  grid.innerHTML = "";
  let any = false;
  for (const [key,val] of Object.entries(vals)) {
    if (val===null) continue;
    any = true;
    const m = PARAM_META[key];
    const chip = document.createElement("div");
    chip.className = "ext-chip";
    chip.innerHTML = `<div class="cl">${m.icon} ${m.label}</div><div class="cv">${val} ${m.unit}</div>`;
    grid.appendChild(chip);
  }
  if (any) show("extractedValues");
}

function setOCRProgress(barId, statusId, pct, msg) {
  document.getElementById(barId).style.width = pct + "%";
  document.getElementById(statusId).textContent = msg;
}

async function fileToDataUrl(file) {
  return new Promise((res,rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

async function pdfToImage(file) {
  if (!window.pdfjsLib) {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
  const ab = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data:ab }).promise;
  const page = await pdf.getPage(1);
  const vp = page.getViewport({ scale:2.0 });
  const can = document.createElement("canvas");
  can.width = vp.width; can.height = vp.height;
  await page.render({ canvasContext:can.getContext("2d"), viewport:vp }).promise;
  return can.toDataURL("image/png");
}

function loadScript(src) {
  return new Promise((res,rej) => {
    const s = document.createElement("script");
    s.src=src; s.onload=res; s.onerror=rej;
    document.head.appendChild(s);
  });
}

function show(id) { document.getElementById(id)?.classList.remove("hidden"); }
function hide(id) { document.getElementById(id)?.classList.add("hidden"); }
function showError(msg) { const el=document.getElementById("errorMsg"); el.textContent=msg; el.classList.remove("hidden"); }
function hideError() { hide("errorMsg"); }