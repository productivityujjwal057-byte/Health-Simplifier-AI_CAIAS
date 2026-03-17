/**
 * HealthLens AI — Frontend Script
 * Handles: OCR extraction, manual input, API calls, Chart.js visuals, results rendering
 */

// ── State ─────────────────────────────────────────────────────────────────
let currentTab = "manual";
let healthChart = null;
let extractedOCR = { hemoglobin: null, glucose: null, cholesterol: null };

// ── Tab Switching ─────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.getElementById("panelManual").classList.toggle("hidden", tab !== "manual");
  document.getElementById("panelUpload").classList.toggle("hidden", tab !== "upload");
  document.getElementById("tabManual").classList.toggle("active", tab === "manual");
  document.getElementById("tabUpload").classList.toggle("active", tab === "upload");
  hideError();
}

// ── Drag & Drop ───────────────────────────────────────────────────────────
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

// ── OCR Processing ────────────────────────────────────────────────────────
async function processFile(file) {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    showError("Please upload a JPG, PNG, or PDF file.");
    return;
  }

  // Show progress
  showEl("ocrProgress");
  hideEl("ocrPreview");
  hideEl("extractedValues");
  setProgress(5, `Loading file: ${file.name}…`);

  try {
    let imageDataUrl;

    if (file.type === "application/pdf") {
      // For PDF: render first page using PDF.js CDN
      imageDataUrl = await renderPdfToImage(file);
    } else {
      imageDataUrl = await fileToDataUrl(file);
    }

    setProgress(20, "OCR engine starting…");

    // Run Tesseract OCR
    const worker = await Tesseract.createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const pct = Math.round(m.progress * 60) + 25;
          setProgress(pct, `Scanning text… ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    setProgress(85, "Extracting values…");
    const { data: { text } } = await worker.recognize(imageDataUrl);
    await worker.terminate();

    setProgress(95, "Parsing health values…");

    // Show raw OCR text
    showEl("ocrPreview");
    document.getElementById("ocrRawText").textContent = text.trim() || "(No text detected)";

    // Extract values
    const vals = extractHealthValues(text);
    extractedOCR = vals;

    // Populate manual fields
    if (vals.hemoglobin) document.getElementById("inputHemoglobin").value = vals.hemoglobin;
    if (vals.glucose)    document.getElementById("inputGlucose").value    = vals.glucose;
    if (vals.cholesterol) document.getElementById("inputCholesterol").value = vals.cholesterol;

    // Show chips
    renderExtractedChips(vals);

    setProgress(100, "Done!");
    setTimeout(() => hideEl("ocrProgress"), 800);

    if (!vals.hemoglobin && !vals.glucose && !vals.cholesterol) {
      showError(
        "⚠️ Could not detect health values automatically. The image may be unclear or in an unsupported format. Please enter values manually in the fields below, then click Analyze."
      );
      switchTab("manual");
    }

  } catch (err) {
    console.error("OCR Error:", err);
    hideEl("ocrProgress");
    showError("OCR failed: " + (err.message || "Unknown error. Try a clearer image."));
  }
}

// Convert File to base64 data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Render PDF first page to canvas image
async function renderPdfToImage(file) {
  return new Promise(async (resolve, reject) => {
    try {
      // Load PDF.js dynamically
      if (!window.pdfjsLib) {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const ab = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x for better OCR

      const canvas = document.createElement("canvas");
      canvas.width  = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      await page.render({ canvasContext: ctx, viewport }).promise;
      resolve(canvas.toDataURL("image/png"));
    } catch (e) {
      reject(e);
    }
  });
}

function loadScript(src) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── Value Extraction (regex-based, robust for messy lab reports) ──────────
function extractHealthValues(text) {
  const vals = { hemoglobin: null, glucose: null, cholesterol: null };

  // Clean up text
  const t = text
    .replace(/[|l]/g, "1")     // common OCR confusion
    .replace(/O/g, "0")         // O → 0 in numeric contexts (careful)
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ");

  // ── Hemoglobin patterns ──────────────────────────────────────────────────
  // Matches: "Hemoglobin 13.5", "Hb: 12.4 g/dL", "HGB 14", "Haemoglobin(g/dL) 11.2"
  const hbPatterns = [
    /(?:haemo?globin|h[bg]b?)\s*[:\-\(\/]?\s*[\(\[]?\s*(?:g\/dl)?\s*[\)\]]?\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i,
    /(\d{1,2}(?:\.\d{1,2})?)\s*(?:g\/dl)?\s*(?:haemo?globin|h[gb]b?)/i,
  ];
  for (const p of hbPatterns) {
    const m = t.match(p);
    if (m) { vals.hemoglobin = parseFloat(m[1]); break; }
  }

  // ── Glucose patterns ─────────────────────────────────────────────────────
  // Matches: "Glucose 95", "Blood Sugar: 110 mg/dL", "FBS 88", "RBS: 130", "Fasting Glucose 102"
  const glPatterns = [
    /(?:fasting\s+)?(?:blood\s+)?(?:glucose|sugar|f\.?b\.?s\.?|r\.?b\.?s\.?|f\.?p\.?g\.?)\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i,
    /(\d{2,3}(?:\.\d)?)\s*(?:mg\/dl)?\s*(?:glucose|sugar|f\.?b\.?s\.?|r\.?b\.?s\.?)/i,
  ];
  for (const p of glPatterns) {
    const m = t.match(p);
    if (m) { vals.glucose = parseFloat(m[1]); break; }
  }

  // ── Cholesterol patterns ─────────────────────────────────────────────────
  // Matches: "Total Cholesterol 185", "Chol: 220 mg/dL", "T. Cholesterol 199"
  const chPatterns = [
    /(?:total\s+)?(?:t\.?\s*)?cholesterol\s*[:\-\(]?\s*(?:mg\/dl)?\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)/i,
    /(\d{2,3}(?:\.\d)?)\s*(?:mg\/dl)?\s*(?:total\s+)?cholesterol/i,
  ];
  for (const p of chPatterns) {
    const m = t.match(p);
    if (m) { vals.cholesterol = parseFloat(m[1]); break; }
  }

  // Sanity checks — discard values outside physiological ranges
  if (vals.hemoglobin && (vals.hemoglobin < 2 || vals.hemoglobin > 22))   vals.hemoglobin = null;
  if (vals.glucose    && (vals.glucose    < 30 || vals.glucose    > 700)) vals.glucose    = null;
  if (vals.cholesterol && (vals.cholesterol < 50 || vals.cholesterol > 700)) vals.cholesterol = null;

  return vals;
}

// ── Render extracted value chips ──────────────────────────────────────────
function renderExtractedChips(vals) {
  const grid = document.getElementById("extractedGrid");
  const labels = { hemoglobin: "🩸 Hemoglobin", glucose: "🍬 Glucose", cholesterol: "🫀 Cholesterol" };
  const units  = { hemoglobin: "g/dL", glucose: "mg/dL", cholesterol: "mg/dL" };

  grid.innerHTML = "";
  let found = false;

  for (const [key, label] of Object.entries(labels)) {
    const val = vals[key];
    const chip = document.createElement("div");
    chip.className = "extracted-chip";
    chip.innerHTML = `
      <span class="chip-label">${label}</span>
      <span class="chip-val">${val ? val + " " + units[key] : "—  Not found"}</span>
    `;
    grid.appendChild(chip);
    if (val) found = true;
  }

  if (found) showEl("extractedValues");
}

// ── Progress helper ───────────────────────────────────────────────────────
function setProgress(pct, msg) {
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("ocrStatus").textContent = msg;
}

// ── Main Analyze ──────────────────────────────────────────────────────────
async function analyzeReport() {
  hideError();

  // Gather values
  const hemoglobin  = parseValue(document.getElementById("inputHemoglobin").value);
  const glucose     = parseValue(document.getElementById("inputGlucose").value);
  const cholesterol = parseValue(document.getElementById("inputCholesterol").value);

  if (!hemoglobin && !glucose && !cholesterol) {
    showError("Please enter at least one value (Hemoglobin, Glucose, or Cholesterol) to analyze.");
    return;
  }

  // Show loading
  hideEl("inputSection");
  showEl("loadingSection");
  hideEl("resultsSection");

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hemoglobin, glucose, cholesterol }),
    });

    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();

    hideEl("loadingSection");
    showEl("resultsSection");

    renderResults(data);

  } catch (err) {
    hideEl("loadingSection");
    showEl("inputSection");
    showError("Could not connect to the server. Make sure the backend is running on port 3000.\n" + err.message);
  }
}

function parseValue(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

// ── Render Results ────────────────────────────────────────────────────────
function renderResults(data) {
  const { advice, missingFields } = data;

  // Draw chart
  drawChart(advice);

  // Draw param cards
  const container = document.getElementById("paramCards");
  container.innerHTML = "";

  const configs = [
    { key: "hemoglobin",  icon: "🩸", label: "Hemoglobin", unit: "g/dL",  max: 20,  normalMin: 12,  normalMax: 17.5 },
    { key: "glucose",     icon: "🍬", label: "Blood Glucose", unit: "mg/dL", max: 400, normalMin: 70, normalMax: 100 },
    { key: "cholesterol", icon: "🫀", label: "Total Cholesterol", unit: "mg/dL", max: 400, normalMin: 0, normalMax: 200 },
  ];

  for (const cfg of configs) {
    const a = advice[cfg.key];
    if (!a) {
      // Missing — show small placeholder
      const div = document.createElement("div");
      div.className = "param-card";
      div.innerHTML = `
        <div class="param-header" style="background:#f5f5f5;">
          <span class="param-icon">${cfg.icon}</span>
          <div class="param-info">
            <div class="param-name">${cfg.label}</div>
            <span class="param-badge" style="background:#e0e0e0;color:#888;">Not provided</span>
          </div>
        </div>
        <div class="param-body">
          <p style="color:var(--text-muted);font-size:0.88rem;">No value was entered for ${cfg.label}. Enter a value and re-analyze to get advice.</p>
        </div>
      `;
      container.appendChild(div);
      continue;
    }

    const pct = Math.min((a.value / cfg.max) * 100, 100);
    const normalMinPct = (cfg.normalMin / cfg.max) * 100;
    const normalMaxPct = (cfg.normalMax / cfg.max) * 100;

    const card = document.createElement("div");
    card.className = "param-card";
    card.innerHTML = `
      <div class="param-header ${a.color}">
        <span class="param-icon">${cfg.icon}</span>
        <div class="param-info">
          <div class="param-name">${cfg.label}</div>
          <span class="param-badge badge-${a.color}">${a.status}</span>
        </div>
        <div class="param-value-box">
          <div class="param-value-num color-${a.color}">${a.value}</div>
          <div class="param-value-unit">${cfg.unit}</div>
        </div>
      </div>
      <div class="param-body">
        <p class="param-explanation">${a.explanation}</p>

        <!-- Mini progress bar -->
        <div class="mini-bar-wrap">
          <label>
            <span>0</span>
            <span>Normal range: ${cfg.normalMin}–${cfg.normalMax} ${cfg.unit}</span>
            <span>${cfg.max}+</span>
          </label>
          <div class="mini-bar-bg">
            <div class="mini-bar-fill ${a.color}" style="width:0%" data-target="${pct}"></div>
            <div class="mini-bar-marker" style="left:${normalMinPct}%" title="Normal min"></div>
            <div class="mini-bar-marker" style="left:${normalMaxPct}%" title="Normal max"></div>
          </div>
        </div>

        <!-- Advice -->
        <div class="advice-grid">
          <div class="advice-box eat">
            <div class="advice-title">✅ What to Eat</div>
            <ul class="advice-list">
              ${a.consume.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
          <div class="advice-box avoid">
            <div class="advice-title">🚫 What to Avoid</div>
            <ul class="advice-list">
              ${a.avoid.map(item => `<li>${item}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  }

  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll(".mini-bar-fill[data-target]").forEach(el => {
      el.style.width = el.dataset.target + "%";
    });
  }, 100);
}

// ── Chart.js ──────────────────────────────────────────────────────────────
function drawChart(advice) {
  const canvas = document.getElementById("healthChart");
  if (!canvas) return;

  // Destroy previous chart instance
  if (healthChart) { healthChart.destroy(); healthChart = null; }

  const labels = [], values = [], colors = [], maxVals = [];
  const thresholds = { hemoglobin: [12, 17.5], glucose: [70, 100], cholesterol: [0, 200] };
  const fullLabels = { hemoglobin: "Hemoglobin (g/dL)", glucose: "Glucose (mg/dL)", cholesterol: "Cholesterol (mg/dL)" };
  const colorMap = { success: "#3bb56c", warning: "#e8913a", danger: "#d94f4f" };
  const normalLineVals = [];

  for (const [key, a] of Object.entries(advice)) {
    labels.push(fullLabels[key]);
    values.push(a.value);
    colors.push(colorMap[a.color]);
    normalLineVals.push(thresholds[key][1]);
  }

  if (labels.length === 0) return;

  healthChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Your Value",
          data: values,
          backgroundColor: colors.map(c => c + "cc"),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "Upper Normal Limit",
          data: normalLineVals,
          type: "line",
          borderColor: "#aaa",
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointStyle: false,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.datasetIndex === 0) return ` Your value: ${ctx.raw}`;
              return ` Upper normal: ${ctx.raw}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#e8eee9" },
          ticks: { font: { family: "'DM Sans', sans-serif", size: 11 } },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: "'DM Sans', sans-serif", size: 11 } },
        },
      },
    },
  });

  // Legend
  const legendEl = document.getElementById("chartLegend");
  legendEl.innerHTML = `
    <div class="legend-item"><span class="legend-dot" style="background:#3bb56c"></span> Normal</div>
    <div class="legend-item"><span class="legend-dot" style="background:#e8913a"></span> Borderline</div>
    <div class="legend-item"><span class="legend-dot" style="background:#d94f4f"></span> High Risk</div>
    <div class="legend-item"><span class="legend-dot" style="background:#aaa;border-radius:2px;width:16px;height:3px;margin:auto 0"></span> Normal limit (dashed)</div>
  `;
}

// ── Reset ─────────────────────────────────────────────────────────────────
function resetApp() {
  // Clear inputs
  ["inputHemoglobin", "inputGlucose", "inputCholesterol"].forEach(id => {
    document.getElementById(id).value = "";
  });
  // Clear OCR state
  extractedOCR = { hemoglobin: null, glucose: null, cholesterol: null };
  document.getElementById("fileInput").value = "";
  hideEl("ocrPreview");
  hideEl("ocrProgress");
  hideEl("extractedValues");

  // Switch views
  hideEl("resultsSection");
  showEl("inputSection");
  hideError();
  switchTab("manual");

  // Destroy chart
  if (healthChart) { healthChart.destroy(); healthChart = null; }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Utilities ─────────────────────────────────────────────────────────────
function showEl(id) { document.getElementById(id)?.classList.remove("hidden"); }
function hideEl(id) { document.getElementById(id)?.classList.add("hidden"); }
function showError(msg) {
  const el = document.getElementById("errorMsg");
  el.textContent = msg;
  el.classList.remove("hidden");
}
function hideError() { hideEl("errorMsg"); }