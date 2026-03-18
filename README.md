<div align="center">



# 🩺 Health Simplifier AI

### Complete Health Report Analyzer — Blood · Heart · Brain

**Understand your medical reports in plain, simple language — instantly.**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)](https://chartjs.org)
[![Tesseract.js](https://img.shields.io/badge/Tesseract.js-5.0-blue?style=flat-square)](https://tesseract.projectnaptha.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<br/>





</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
- [Blood Parameters Analyzed](#blood-parameters-analyzed)
- [Heart & Brain Conditions](#heart--brain-conditions)
- [Sample Reports for Testing](#sample-reports-for-testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## 🔬 About the Project

**Health Simplifier AI** is a full-stack web application that transforms confusing medical reports into clear, actionable health insights. Instead of Googling medical terms in panic, users get instant plain-language explanations of every blood value — along with what to eat, what to avoid, and when to see a doctor.

> *"Have you ever received a blood test report and had no idea what the numbers mean? Health Simplifier AI solves exactly that."*

### Why Health Simplifier?

| Problem | Health Simplifier Solution |
|---------|-------------------|
| Medical jargon is incomprehensible to most patients | Plain-language explanations written at a Grade 6 reading level |
| Patients wait days to ask their doctor what values mean | Instant analysis — results in under 60 seconds |
| Rural/semi-urban populations lack medical interpretation access | Works offline (after load), no specialist needed |
| Generic apps show numbers but no guidance | Specific food advice, lifestyle tips, and urgency flags per parameter |

---

## ✨ Features

### 🩸 Blood Report Analysis
- **17 blood parameters** analyzed with clinical reference ranges
- **14+ health conditions** detected using cross-parameter logic
- Color-coded results: 🟢 Normal · 🟡 Borderline · 🔴 Critical
- Food to eat and food to avoid for every parameter
- Visual Chart.js bar charts with normal limit indicators

### 📄 Smart OCR Upload
- Drag & drop any lab report **image (JPG/PNG) or PDF**
- **Tesseract.js** reads and extracts values automatically — no manual typing
- Works with messy, real-world lab report formats

### 🫀 Heart Conditions (10)
Complete ECG findings, real-world statistics, symptoms, treatments and lifestyle advice for:
AFib · Heart Attack · Heart Failure · Angina · Bradycardia · Tachycardia · LVH · Bundle Branch Block · Mitral Valve Disease · Acute Coronary Syndrome

### 🧠 Brain Conditions (9)
MRI/EEG findings, real-world data, symptoms, treatments and lifestyle advice for:
Stroke · Epilepsy · Alzheimer's · Parkinson's · Brain Tumor · Migraines · Multiple Sclerosis · TIA · Meningitis

### 🎨 UI/UX
- Cinematic hero video homepage with scroll animations
- Dark medical theme with teal + coral accents
- Compact fixed navbar — 5 pages (Home, Manual Entry, Upload, Heart, Brain)
- Fully responsive — tested from 320px to 1440px+
- iOS safe-area support, touch-optimized tap targets

---



## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| HTML5 + CSS3 | — | Structure & styling (no framework) |
| Vanilla JavaScript | ES6+ | All interactivity, page routing |
| [Chart.js](https://chartjs.org) | 4.4.0 | Blood parameter bar charts |
| [Tesseract.js](https://tesseract.projectnaptha.com) | 5.0 | In-browser OCR for report images |
| [PDF.js](https://mozilla.github.io/pdf.js/) | 3.11 | PDF-to-image conversion for OCR |
| Google Fonts | — | Syne (display) + Inter (body) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| [Node.js](https://nodejs.org) | 18+ | Runtime |
| [Express.js](https://expressjs.com) | 4.18.2 | REST API + static file serving |
| [CORS](https://www.npmjs.com/package/cors) | 2.8.5 | Cross-origin resource sharing |

### Architecture
```
Browser (HTML/CSS/JS)
     │
     ├── Tesseract.js OCR (runs in browser)
     │
     └── HTTP Requests
          │
          └── Express.js Server (server.js)
               │
               ├── POST /analyze        → Blood analysis engine
               ├── POST /analyze-hb     → Heart/Brain OCR analysis
               ├── GET  /conditions/:type → Condition database
               └── GET  /health         → Health check
```

---

## 📁 Project Structure

```
Health Simplifier-ai/
│
├── 📄 server.js                    # Express server — all API logic
├── 📦 package.json                 # Dependencies and scripts
├── 📝 README.md                    # This file
│
└── 📂 public/                      # Static files served by Express
    ├── 🌐 index.html               # Complete single-page frontend
    └── 🎬 hero-video.mp4 
    └──  script.js        
```

### `server.js` — What's Inside

```
server.js
│
├── Blood Parameter Analyzers (17 functions)
│   ├── analyzeHemoglobin()         Hb < 8 / 8-12 / 12-17.5 / >17.5
│   ├── analyzeGlucose()            <70 / 70-100 / 101-125 / >125 mg/dL
│   ├── analyzeCholesterol()        <150 / ≤200 / ≤239 / >240 mg/dL
│   ├── analyzeLDL()                <100 / <130 / <160 / ≥160 mg/dL
│   ├── analyzeHDL()                <40 / 40-60 / ≥60 mg/dL
│   ├── analyzeTriglycerides()      <150 / <200 / <500 / ≥500 mg/dL
│   ├── analyzeBUN()                <7 / 7-20 / >20 mg/dL
│   ├── analyzeCreatinine()         <0.6 / 0.6-1.2 / >1.2 mg/dL
│   ├── analyzeUricAcid()           <3.4 / 3.4-7.0 / >7.0 mg/dL
│   ├── analyzeSodium()             <136 / 136-145 / >145 mEq/L
│   ├── analyzePotassium()          <3.5 / 3.5-5.0 / >5.0 mEq/L
│   ├── analyzeCalcium()            <8.5 / 8.5-10.5 / >10.5 mg/dL
│   ├── analyzeVitaminD()           <20 / 20-30 / ≥30 ng/mL
│   ├── analyzeWBC()                <4000 / 4000-11000 / >11000 cells/µL
│   ├── analyzeRBC()                <4.0 / 4.0-5.5 / >5.5 million/µL
│   ├── analyzePlatelets()          <150K / 150K-400K / >400K cells/µL
│   └── analyzeTSH()                <0.4 / 0.4-4.0 / >4.0 mIU/L
│
├── Condition Detection (detectConditions)
│   └── Cross-parameter logic for 14 health conditions
│
├── Heart Conditions Database (HEART_CONDITIONS)
│   └── 10 conditions with ECG findings, stats, symptoms, treatment
│
├── Brain Conditions Database (BRAIN_CONDITIONS)
│   └── 9 conditions with MRI/EEG findings, stats, symptoms, treatment
│
└── API Routes
    ├── POST /analyze
    ├── POST /analyze-hb
    ├── GET  /conditions/:type
    └── GET  /health
```

### `public/index.html` — Frontend Architecture

```
index.html (single file, ~84KB)
│
├── CSS Design System (~500 lines)
│   ├── CSS Variables (colors, typography, spacing)
│   ├── Navbar styles
│   ├── Home page (hero video, stats, features, how-it-works, CTA)
│   ├── Manual entry page styles
│   ├── Upload page styles
│   ├── Condition browser styles
│   ├── Results rendering styles
│   └── Responsive breakpoints (320px → 1440px)
│
├── HTML Markup
│   ├── #navbar          — Fixed compact navbar
│   ├── #page-home       — Hero video + feature showcase
│   ├── #page-manual     — Dropdown parameter entry
│   ├── #page-upload     — Drag & drop OCR upload
│   ├── #page-heart      — Heart conditions browser
│   └── #page-brain      — Brain conditions browser
│
└── JavaScript (~700 lines)
    ├── PARAM_META       — Parameter labels, units, ranges
    ├── BOUNDS           — Physiological validity ranges
    ├── OCR_PAT          — Regex patterns for value extraction
    ├── Navigation       — goPage(), scroll animations
    ├── Manual Entry     — addParam(), renderChips()
    ├── Upload / OCR     — drag-drop, Tesseract, PDF.js
    ├── Blood Analysis   — runAnalysis(), renderResults()
    ├── Charts           — drawChart() via Chart.js
    └── Conditions       — renderConditions(), toggleCond()
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

```bash
node --version    # v18.0.0 or higher
npm --version     # v8.0.0 or higher
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Health Simplifier-ai.git
   cd Health Simplifier-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   > Installs: `express`, `cors`, `nodemon` (dev)

3. **Add the hero video** *(optional — homepage background)*
   ```bash
   # Place your video file in the public folder:
   cp /path/to/your-video.mp4 public/hero-video.mp4
   ```
   > Without the video, the homepage hero section shows a dark background. All other features work perfectly.

### Running Locally

**Development mode** (auto-restarts on file changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

**Open in browser:**
```
http://localhost:3000
```

---

## 📡 API Reference

### `POST /analyze`
Analyze blood parameters. Accepts any combination of the 17 supported parameters.

**Request:**
```json
{
  "hemoglobin": 9.4,
  "glucose": 148,
  "cholesterol": 244,
  "ldl": 168,
  "hdl": 36,
  "triglycerides": 204,
  "bun": 14,
  "creatinine": 0.9,
  "uricAcid": 5.5,
  "sodium": 140,
  "potassium": 4.2,
  "calcium": 9.5,
  "vitaminD": 14.2,
  "wbc": 7500,
  "rbc": 3.9,
  "platelets": 210000,
  "tsh": 5.8
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "hemoglobin": {
      "value": 9.4,
      "status": "Low (Anemia)",
      "color": "danger",
      "explanation": "Hemoglobin is below normal — anemia...",
      "consume": ["🥩 Red meat, chicken, fish 3x/week", "..."],
      "avoid":   ["☕ Tea/coffee immediately after meals", "..."]
    }
  },
  "conditions": [
    {
      "name": "Anemia",
      "icon": "🩸",
      "severity": "danger",
      "summary": "Low hemoglobin — blood cannot carry enough oxygen.",
      "action": "Eat iron-rich foods with Vitamin C. Consult doctor."
    }
  ],
  "summary": {
    "overall": "Your report shows some important health markers...",
    "overallColor": "warning",
    "total": 3,
    "danger": 2,
    "warning": 1,
    "normal": 0
  },
  "provided": ["hemoglobin", "glucose", "cholesterol"],
  "missing": ["bun", "creatinine", "..."]
}
```

---



**Response:**
```json
{
  "success": true,
  "conditions": [
    {
      "name": "Atrial Fibrillation (AFib)",
      "icon": "💓",
      "category": "heart",
      "ecgFindings": "Irregularly irregular rhythm, absence of P waves...",
      "realWorldData": "AFib affects 33 million people worldwide...",
      "explanation": "Atrial fibrillation is a chaotic electrical activity...",
      "symptoms": ["💓 Irregular, rapid heartbeat", "..."],
      "riskFactors": ["🫀 High blood pressure", "..."],
      "treatment": ["💊 Rate control medication", "..."],
      "lifestyle": ["🧘 Stress reduction", "..."],
      "severity": "danger"
    }
  ]
}
```

---

### `POST /analyze-hb`
Analyze OCR text from a heart/brain report.

**Request:**
```json
{
  "text": "ECG findings: Atrial fibrillation, irregular rhythm...",
  "type": "heart"
}
```

---

### `GET /health`
Server health check.

**Response:** `{ "status": "ok" }`

---

## ⚙️ How It Works

### Blood Analysis Flow
```
User Input (manual / OCR)
        │
        ▼
POST /analyze
        │
        ▼
17 Parameter Analyzers
  → Each checks value against clinical ranges
  → Returns: status, color, explanation, consume, avoid
        │
        ▼
detectConditions()
  → Cross-parameter logic (e.g., high BUN + high creatinine → "Kidney Problems")
  → Returns array of detected health conditions
        │
        ▼
generateSummary()
  → Counts danger/warning/normal
  → Returns overall health status
        │
        ▼
JSON Response → Frontend renders charts + cards
```

### OCR Extraction Flow
```
User uploads image/PDF
        │
        ▼
PDF.js converts PDF → image (if needed)
        │
        ▼
Tesseract.js runs OCR → raw text
        │
        ▼
17 Regex patterns extract each parameter value
  → Physiological bounds check (e.g., hemoglobin must be 2–22 g/dL)
  → Invalid values discarded
        │
        ▼
Valid values populate the parameter chips
        │
        ▼
POST /analyze with extracted values
```

---

## 🩸 Blood Parameters Analyzed

| Parameter | Unit | Low Threshold | Normal Range | High Threshold |
|-----------|------|--------------|--------------|----------------|
| Hemoglobin (Hb) | g/dL | < 12.0 | 12.0 – 17.5 | > 17.5 |
| Blood Glucose | mg/dL | < 70 | 70 – 100 | > 100 |
| Total Cholesterol | mg/dL | < 150 | < 200 | > 200 |
| LDL Cholesterol | mg/dL | — | < 100 (optimal) | > 160 |
| HDL Cholesterol | mg/dL | < 40 | > 60 (protective) | — |
| Triglycerides | mg/dL | — | < 150 | > 150 |
| BUN | mg/dL | < 7 | 7 – 20 | > 20 |
| Creatinine | mg/dL | < 0.6 | 0.6 – 1.2 | > 1.2 |
| Uric Acid | mg/dL | < 3.4 | 3.4 – 7.0 | > 7.0 |
| Sodium (Na⁺) | mEq/L | < 136 | 136 – 145 | > 145 |
| Potassium (K⁺) | mEq/L | < 3.5 | 3.5 – 5.0 | > 5.0 |
| Calcium (Ca²⁺) | mg/dL | < 8.5 | 8.5 – 10.5 | > 10.5 |
| Vitamin D | ng/mL | < 20 | 30 – 50 | > 100 |
| WBC Count | cells/µL | < 4,000 | 4,000 – 11,000 | > 11,000 |
| RBC Count | million/µL | < 4.0 | 4.0 – 5.5 | > 5.5 |
| Platelets (PLT) | cells/µL | < 150,000 | 150,000 – 400,000 | > 400,000 |
| TSH (Thyroid) | mIU/L | < 0.4 | 0.4 – 4.0 | > 4.0 |

### Detected Health Conditions (14)

| Condition | Triggered By |
|-----------|-------------|
| Anemia | Low Hb or low RBC |
| Polycythemia | High Hb or high RBC |
| Diabetes | Glucose ≥ 126 mg/dL |
| Prediabetes | Glucose 101–125 mg/dL |
| Heart Disease Risk | High cholesterol / LDL / TG or low HDL |
| Kidney Problems | High BUN + high creatinine |
| Gout / High Uric Acid | Uric acid > 7.0 mg/dL |
| Thyroid Disorder | TSH < 0.4 or > 4.0 mIU/L |
| Vitamin D Deficiency | Vitamin D < 20 ng/mL |
| Electrolyte Imbalance | Abnormal Na⁺ / K⁺ / Ca²⁺ |
| Active Infection | WBC > 11,000 |
| Weakened Immunity | Low WBC or Vitamin D |
| Blood Clotting Issues | Platelets < 150,000 |
| Osteoporosis Risk | Low calcium + low Vitamin D |

---

## 🫀 Heart & Brain Conditions

### Heart Conditions (10)
| Condition | ECG Finding |
|-----------|------------|
| Atrial Fibrillation (AFib) | Absent P waves, irregularly irregular rhythm |
| Myocardial Infarction | ST elevation / pathological Q waves |
| Congestive Heart Failure | LVH pattern, bundle branch blocks |
| Angina Pectoris | ST depression during exercise |
| Bradycardia | HR < 60 bpm, AV block patterns |
| Tachycardia / SVT | HR > 150 bpm, narrow QRS |
| Left Ventricular Hypertrophy | Sokolow-Lyon voltage criteria > 35mm |
| Bundle Branch Block | Wide QRS > 120ms (LBBB/RBBB) |
| Mitral Valve Disease | P mitrale, left atrial enlargement |
| Acute Coronary Syndrome | ST depression, T-wave inversion |

### Brain Conditions (9)
| Condition | Scan/EEG Finding |
|-----------|----------------|
| Ischemic Stroke | DWI restricted diffusion, MCA territory |
| Epilepsy | Left temporal spike-wave on EEG |
| Alzheimer's Disease | Hippocampal atrophy on MRI |
| Parkinson's Disease | Dopamine pathway changes on DaT scan |
| Brain Tumor | Mass lesion with gadolinium enhancement |
| Chronic Migraines | PFO association, cortical spreading depression |
| Multiple Sclerosis | White matter plaques on T2/FLAIR MRI |
| TIA (Mini-Stroke) | Often normal MRI, MCA stenosis on MRA |
| Meningitis | CSF pleocytosis on lumbar puncture |

---

## 🧪 Sample Reports for Testing

Six sample reports are included to test all features:

| File | Parameters | Use With |
|------|-----------|---------|
| `report1_blood_anemia_diabetes_cholesterol.png` | Hb, Glucose, Cholesterol, LDL, HDL, VitD, TSH | Upload tab |
| `report2_kidney_electrolytes_uric_acid.png` | BUN, Creatinine, Uric Acid, Na, K, Ca | Upload tab |
| `report3_ecg_afib_lvh.png` | ECG with AFib + LVH | Heart section |
| `report4_cardiac_heart_attack_markers.png` | Troponin, CK-MB, BNP | Heart section |
| `report5_brain_mri_stroke_alzheimer.png` | MRI with stroke + Alzheimer's | Brain section |
| `report6_eeg_epilepsy_blood.png` | EEG epilepsy + VitD, Magnesium | Brain section |

**Quick test values for manual entry:**
```
Hemoglobin:    9.4     → Anemia (critical)
Glucose:       148     → Diabetic range
Cholesterol:   244     → High (heart risk)
TSH:           5.8     → Hypothyroidism
Vitamin D:     14.2    → Severe deficiency
```

---


## 🤝 Contributing

Contributions make the open-source community amazing! Any contributions are **greatly appreciated**.

1. Fork the project
2. Create your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes
   ```bash
   git commit -m 'Add: AmazingFeature'
   ```
4. Push to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

### Adding a New Blood Parameter

1. Add analyzer function in `server.js`:
   ```javascript
   function analyzeNewParam(v) {
     const val = +v; if (isNaN(val)) return null;
     // Return { value, status, color, explanation, consume, avoid }
   }
   ```
2. Add to the `analyzers` object in `POST /analyze`
3. Add `PARAM_META` entry in `public/index.html`
4. Add `BOUNDS` and `OCR_PAT` entries
5. Add `<option>` to the dropdown in `#paramSelect`

---

## ⚠️ Disclaimer

> **Health Simplifier AI is for educational and informational purposes only.**
>
> This application does **not** provide medical advice, diagnosis, or treatment. The information provided is intended to help users understand their medical reports in plain language — it is **not** a substitute for professional medical advice from a qualified doctor.
>
> Always consult a licensed healthcare professional before making any medical decisions. In case of a medical emergency, call your local emergency number immediately.
>
> Reference ranges used are general guidelines. Individual ranges may vary based on age, gender, lab equipment, and clinical context.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

Built with heart for making healthcare accessible to everyone.

---

<div align="center">

**⭐ Star this repo if Health Simplifier AI helped you!**

*Making medical reports understandable for everyone — not just doctors.*

</div>