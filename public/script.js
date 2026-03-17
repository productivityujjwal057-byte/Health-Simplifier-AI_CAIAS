/**
 * HealthLens AI — Full Edition script.js
 * 17-parameter OCR extraction, API calls, Chart.js, results rendering
 */

// ── Config ─────────────────────────────────────────────────────────────────
const PARAM_META = {
  hemoglobin:    { label: "Hemoglobin",       icon: "🩸", unit: "g/dL",     max: 22,   normalMin: 12,    normalMax: 17.5 },
  glucose:       { label: "Blood Glucose",    icon: "🍬", unit: "mg/dL",    max: 400,  normalMin: 70,    normalMax: 100  },
  cholesterol:   { label: "Total Cholesterol",icon: "🫀", unit: "mg/dL",    max: 400,  normalMin: 0,     normalMax: 200  },
  ldl:           { label: "LDL Cholesterol",  icon: "⚠️", unit: "mg/dL",    max: 300,  normalMin: 0,     normalMax: 100  },
  hdl:           { label: "HDL Cholesterol",  icon: "💛", unit: "mg/dL",    max: 120,  normalMin: 40,    normalMax: 60   },
  triglycerides: { label: "Triglycerides",    icon: "🧈", unit: "mg/dL",    max: 600,  normalMin: 0,     normalMax: 150  },
  bun:           { label: "BUN",              icon: "🫘", unit: "mg/dL",    max: 60,   normalMin: 7,     normalMax: 20   },
  creatinine:    { label: "Creatinine",       icon: "🧪", unit: "mg/dL",    max: 5,    normalMin: 0.6,   normalMax: 1.2  },
  uricAcid:      { label: "Uric Acid",        icon: "🦴", unit: "mg/dL",    max: 12,   normalMin: 3.4,   normalMax: 7.0  },
  sodium:        { label: "Sodium",           icon: "🧂", unit: "mEq/L",    max: 160,  normalMin: 136,   normalMax: 145  },
  potassium:     { label: "Potassium",        icon: "⚡", unit: "mEq/L",    max: 7,    normalMin: 3.5,   normalMax: 5.0  },
  calcium:       { label: "Calcium",          icon: "🦷", unit: "mg/dL",    max: 15,   normalMin: 8.5,   normalMax: 10.5 },
  vitaminD:      { label: "Vitamin D",        icon: "☀️", unit: "ng/mL",    max: 100,  normalMin: 20,    normalMax: 50   },
  wbc:           { label: "WBC Count",        icon: "🦠", unit: "cells/µL", max: 15000,normalMin: 4000,  normalMax: 11000},
  rbc:           { label: "RBC Count",        icon: "🔴", unit: "M/µL",     max: 7,    normalMin: 4.0,   normalMax: 5.5  },
  platelets:     { label: "Platelets",        icon: "🩹", unit: "cells/µL", max: 500000,normalMin:150000,normalMax:400000},
  tsh:           { label: "TSH (Thyroid)",    icon: "🦋", unit: "mIU/L",    max: 10,   normalMin: 0.4,   normalMax: 4.0  },
};

// OCR patterns for every parameter
const OCR_PATTERNS = {
  hemoglobin:    [/(?:h(?:a?e?mo?)?globin|hgb?|hb)\s*[:\-\(\/]?\s*(?:g\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i,  /(\d{1,2}(?:\.\d{1,2})?)\s*g\/dl\s*(?:h(?:a?e?mo?)?globin|hgb?|hb)/i],
  glucose:       [/(?:fasting\s+)?(?:blood\s+)?(?:glucose|sugar|f\.?b\.?s\.?|r\.?b\.?s\.?|f\.?p\.?g\.?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i, /(\d{2,3}(?:\.\d)?)\s*mg\/dl\s*(?:glucose|sugar|fbs|rbs)/i],
  cholesterol:   [/(?:total\s+)?(?:t\.?\s*)?cholesterol\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i, /(\d{2,3}(?:\.\d)?)\s*mg\/dl\s*(?:total\s+)?cholesterol/i],
  ldl:           [/l\.?d\.?l\.?\s*(?:cholesterol)?\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i, /(\d{2,3}(?:\.\d)?)\s*mg\/dl\s*ldl/i],
  hdl:           [/h\.?d\.?l\.?\s*(?:cholesterol)?\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i, /(\d{1,3}(?:\.\d)?)\s*mg\/dl\s*hdl/i],
  triglycerides: [/(?:triglycerides?|tg|vldl)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,4}(?:\.\d)?)/i, /(\d{2,4}(?:\.\d)?)\s*mg\/dl\s*triglycerides?/i],
  bun:           [/(?:blood\s+urea\s+nitrogen|b\.?u\.?n\.?|urea\s+nitrogen)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i],
  creatinine:    [/creatinine\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i, /(\d\.\d{1,2})\s*mg\/dl\s*creatinine/i],
  uricAcid:      [/uric\s*acid\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i, /(\d{1,2}(?:\.\d{1,2})?)\s*mg\/dl\s*uric/i],
  sodium:        [/(?:sodium|na\+?)\s*[:\-\(]?\s*(?:m[e]?q\/l)?\s*[:\-]?\s*(\d{3}(?:\.\d)?)/i],
  potassium:     [/(?:potassium|k\+?)\s*[:\-\(]?\s*(?:m[e]?q\/l)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i],
  calcium:       [/(?:calcium|ca\+?\+?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i],
  vitaminD:      [/(?:vitamin\s*d|vit\.?\s*d|25-?oh|25\s*hydroxy)\s*[:\-\(]?\s*(?:ng\/ml)?\s*[:\-]?\s*(\d{1,3}(?:\.\d)?)/i],
  wbc:           [/(?:wbc|w\.b\.c|white\s*blood\s*cells?|total\s*(?:wbc|leukocyte))\s*(?:count)?\s*[:\-\(]?\s*(?:cells?\/[µu]?l|\/cmm)?\s*[:\-]?\s*(\d{3,6}(?:\.\d)?)/i],
  rbc:           [/(?:rbc|r\.b\.c|red\s*blood\s*cells?)\s*(?:count)?\s*[:\-\(]?\s*(?:million\/[µu]?l|M\/[µu]?l|\/cmm)?\s*[:\-]?\s*(\d{1}(?:\.\d{1,2})?)/i],
  platelets:     [/(?:platelet|plt|thrombocyte)\s*(?:count)?\s*[:\-\(]?\s*(?:cells?\/[µu]?l|\/cmm|thou\/[µu]?l|x10)?\s*[:\-]?\s*(\d{3,7}(?:\.\d)?)/i],
  tsh:           [/(?:t\.?s\.?h\.?|thyroid\s*stimulating\s*hormone)\s*[:\-\(]?\s*(?:m[i]?u\/l|[µu]iu\/ml)?\s*[:\-]?\s*(\d{1,3}(?:\.\d{1,3})?)/i],
};

// Physiological sanity bounds
const BOUNDS = {
  hemoglobin:    [2, 22],
  glucose:       [30, 700],
  cholesterol:   [50, 700],
  ldl:           [20, 500],
  hdl:           [10, 120],
  triglycerides: [30, 2000],
  bun:           [2, 150],
  creatinine:    [0.2, 20],
  uricAcid:      [1, 20],
  sodium:        [110, 175],
  potassium:     [1.5, 9],
  calcium:       [4, 18],
  vitaminD:      [2, 200],
  wbc:           [500, 100000],
  rbc:           [1, 8],
  platelets:     [5000, 1500000],
  tsh:           [0.01, 50],
};

let healthChart = null;
let currentTab  = "manual";

// ── Tab Switching ───────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("panelManual").classList.toggle("hidden", tab !== "manual");
  document.getElementById("panelUpload").classList.toggle("hidden", tab !== "upload");
  document.getElementById("tabManual").classList.toggle("active", tab === "manual");
  document.getElementById("tabUpload").classList.toggle("active", tab === "upload");
  hideError();
}

// ── Drag & Drop ─────────────────────────────────────────────────────────────
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("uploadZone").classList.add("dragover");
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById("uploadZone").classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) processFile(file);
}
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

// ── OCR ─────────────────────────────────────────────────────────────────────
async function processFile(file) {
  const valid = ["image/jpeg","image/png","image/gif","image/webp","application/pdf"];
  if (!valid.includes(file.type)) { showError("Please upload a JPG, PNG, or PDF file."); return; }

  show("ocrProgress"); hide("ocrPreview"); hide("extractedValues");
  setProgress(5, `Reading: ${file.name}…`);

  try {
    let imgUrl;
    if (file.type === "application/pdf") {
      imgUrl = await pdfToImage(file);
    } else {
      imgUrl = await fileToDataUrl(file);
    }

    setProgress(20, "OCR engine loading…");

    const worker = await Tesseract.createWorker("eng", 1, {
      logger: m => {
        if (m.status === "recognizing text") {
          setProgress(Math.round(m.progress * 60) + 25, `Scanning… ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    setProgress(85, "Extracting values…");
    const { data: { text } } = await worker.recognize(imgUrl);
    await worker.terminate();

    setProgress(95, "Parsing report…");
    document.getElementById("ocrRawText").textContent = text.trim() || "(No text detected)";
    show("ocrPreview");

    const extracted = extractAllValues(text);
    populateFields(extracted);
    renderExtractedChips(extracted);

    setProgress(100, "Done!");
    setTimeout(() => hide("ocrProgress"), 700);

    const count = Object.values(extracted).filter(v => v !== null).length;
    if (count === 0) {
      showError("⚠️ Could not automatically detect values. The image may be unclear. Please enter values manually in the form above.");
      switchTab("manual");
    }
  } catch (err) {
    hide("ocrProgress");
    showError("OCR failed: " + (err.message || "Unknown error. Try a clearer image."));
  }
}

function fileToDataUrl(file) {
  return new Promise((res, rej) => {
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
  const ab  = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const page= await pdf.getPage(1);
  const vp  = page.getViewport({ scale: 2.0 });
  const can = document.createElement("canvas");
  can.width = vp.width; can.height = vp.height;
  await page.render({ canvasContext: can.getContext("2d"), viewport: vp }).promise;
  return can.toDataURL("image/png");
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── Value Extraction ────────────────────────────────────────────────────────
function extractAllValues(text) {
  // Normalize OCR noise
  const t = text.replace(/\n+/g, " ").replace(/\s+/g, " ").replace(/[|l](?=\d)/g, "1").replace(/O(?=\d)/g, "0");
  const result = {};

  for (const [key, patterns] of Object.entries(OCR_PATTERNS)) {
    result[key] = null;
    for (const pat of patterns) {
      const m = t.match(pat);
      if (m) {
        const val = parseFloat(m[1]);
        const [lo, hi] = BOUNDS[key];
        if (!isNaN(val) && val >= lo && val <= hi) {
          result[key] = val;
          break;
        }
      }
    }
  }
  return result;
}

// ── Populate Fields ─────────────────────────────────────────────────────────
function populateFields(vals) {
  for (const [key, val] of Object.entries(vals)) {
    const el = document.getElementById("f_" + key);
    if (el && val !== null) el.value = val;
  }
}

// ── Extracted Chips ─────────────────────────────────────────────────────────
function renderExtractedChips(vals) {
  const grid = document.getElementById("extractedGrid");
  grid.innerHTML = "";
  let any = false;
  for (const [key, val] of Object.entries(vals)) {
    if (val === null) continue;
    any = true;
    const m = PARAM_META[key];
    const chip = document.createElement("div");
    chip.className = "ext-chip";
    chip.innerHTML = `<div class="cl">${m.icon} ${m.label}</div><div class="cv">${val} ${m.unit}</div>`;
    grid.appendChild(chip);
  }
  if (any) show("extractedValues");
}

// ── OCR Helpers ─────────────────────────────────────────────────────────────
function setProgress(pct, msg) {
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("ocrStatus").textContent = msg;
}

// ── Read all form fields ─────────────────────────────────────────────────────
function readFields() {
  const data = {};
  for (const key of Object.keys(PARAM_META)) {
    const el = document.getElementById("f_" + key);
    if (el && el.value.trim() !== "") {
      const n = parseFloat(el.value);
      if (!isNaN(n)) data[key] = n;
    }
  }
  return data;
}

// ── Run Analysis ─────────────────────────────────────────────────────────────
async function runAnalysis() {
  hideError();
  const data = readFields();

  if (Object.keys(data).length === 0) {
    showError("Please enter at least one value before analyzing.");
    return;
  }

  hide("inputSection");
  show("loadingSection");
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
    renderResults(json);

  } catch (err) {
    hide("loadingSection");
    show("inputSection");
    showError("Cannot connect to server. Make sure the backend is running on port 3000.\n" + err.message);
  }
}

// ── Render Results ────────────────────────────────────────────────────────────
function renderResults(data) {
  const { results, conditions, summary } = data;

  renderSummaryBanner(summary, results);
  renderConditions(conditions);
  renderChart(results);
  renderParamCards(results);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderSummaryBanner(summary, results) {
  const el = document.getElementById("summaryBanner");
  const icons = { danger: "🚨", warning: "⚠️", success: "✅" };

  const danger  = Object.values(results).filter(r => r.color === "danger").length;
  const warning = Object.values(results).filter(r => r.color === "warning").length;
  const normal  = Object.values(results).filter(r => r.color === "success").length;

  el.className = `summary-banner ${summary.overallColor}`;
  el.innerHTML = `
    <div class="sb-icon">${icons[summary.overallColor]}</div>
    <div class="sb-text">
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

function renderConditions(conditions) {
  const sec = document.getElementById("conditionSection");
  const grid = document.getElementById("conditionCards");

  if (!conditions || conditions.length === 0) {
    sec.classList.add("hidden");
    return;
  }
  sec.classList.remove("hidden");
  grid.innerHTML = "";

  conditions.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = `cond-card ${c.severity}`;
    div.style.animationDelay = (i * 0.07) + "s";
    div.innerHTML = `
      <div class="cond-head">
        <span class="cond-icon">${c.icon}</span>
        <span class="cond-name">${c.name}</span>
        <span class="cond-sev">${c.severity === "danger" ? "URGENT" : "MONITOR"}</span>
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

  const labels = [], vals = [], colors = [], normals = [];
  const colorMap = { success: "#34c97a", warning: "#f5a623", danger: "#e05252" };

  for (const [key, r] of Object.entries(results)) {
    const m = PARAM_META[key];
    if (!m) continue;
    const pct = Math.min((r.value / m.max) * 100, 100);
    labels.push(m.label);
    vals.push(r.value);
    colors.push(colorMap[r.color]);
    normals.push(m.normalMax);
  }

  // Dynamically size chart width based on number of bars
  const w = Math.max(500, labels.length * 68);
  document.getElementById("chartContainer").style.width = w + "px";

  healthChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Your Value",
          data: vals,
          backgroundColor: colors.map(c => c + "bb"),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: "Upper Normal Limit",
          data: normals,
          type: "line",
          borderColor: "rgba(160,180,200,0.5)",
          borderWidth: 1.5,
          borderDash: [6,4],
          pointStyle: false,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 0
              ? ` Your value: ${ctx.raw}`
              : ` Upper normal: ${ctx.raw}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid:  { color: "rgba(50,80,110,0.35)" },
          ticks: { color: "#5a7a96", font: { family: "'Outfit', sans-serif", size: 11 } },
        },
        x: {
          grid:  { display: false },
          ticks: { color: "#5a7a96", font: { family: "'Outfit', sans-serif", size: 10 }, maxRotation: 45 },
        }
      }
    }
  });
}

function renderParamCards(results) {
  const container = document.getElementById("paramResults");
  container.innerHTML = "";

  // Order: first critical, then warning, then normal
  const ordered = Object.entries(results).sort((a, b) => {
    const rank = { danger: 0, warning: 1, success: 2 };
    return rank[a[1].color] - rank[b[1].color];
  });

  ordered.forEach(([key, r], i) => {
    const m = PARAM_META[key];
    if (!m) return;

    const pct = Math.min((r.value / m.max) * 100, 100).toFixed(1);
    const normalMinPct = ((m.normalMin / m.max) * 100).toFixed(1);
    const normalMaxPct = ((m.normalMax / m.max) * 100).toFixed(1);

    const card = document.createElement("div");
    card.className = "pr-card";
    card.style.animationDelay = (i * 0.06) + "s";

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
          <div class="mini-bar-label">
            <span>0</span>
            <span>Normal: ${m.normalMin}–${m.normalMax} ${m.unit}</span>
            <span>${m.max}+</span>
          </div>
          <div class="mini-bar-bg">
            <div class="mini-bar-fill ${r.color}" style="width:0%" data-target="${pct}%"></div>
          </div>
        </div>

        <div class="advice-grid">
          <div class="advice-box advice-eat">
            <div class="advice-box-title">✅ What to Consume</div>
            <ul class="advice-list">${r.consume.map(x => `<li>${x}</li>`).join("")}</ul>
          </div>
          <div class="advice-box advice-avoid">
            <div class="advice-box-title">🚫 What to Avoid</div>
            <ul class="advice-list">${r.avoid.map(x => `<li>${x}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll(".mini-bar-fill[data-target]").forEach(el => {
      el.style.width = el.dataset.target;
    });
  }, 120);
}

// ── Reset ─────────────────────────────────────────────────────────────────────
function resetAll() {
  // Clear all fields
  for (const key of Object.keys(PARAM_META)) {
    const el = document.getElementById("f_" + key);
    if (el) el.value = "";
  }
  document.getElementById("fileInput").value = "";
  hide("ocrPreview"); hide("ocrProgress"); hide("extractedValues");
  hide("resultsSection");
  show("inputSection");
  hideError();
  switchTab("manual");
  if (healthChart) { healthChart.destroy(); healthChart = null; }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function show(id) { document.getElementById(id)?.classList.remove("hidden"); }
function hide(id) { document.getElementById(id)?.classList.add("hidden"); }
function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg; el.classList.remove("hidden");
}
function hideError() { hide("errorMsg"); }