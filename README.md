# AI Health Analyzer 🧠

## 🚀 Project Overview
AI Health Analyzer is a smart web application that simplifies medical reports and helps users understand their health in simple language.

It supports:
- Manual parameter entry (dynamic selection)
- OCR-based report scanning (AI-powered)

---

## ✨ Features

### 🧪 Phase 1: Smart Manual Entry (Enhanced ✅)
- Select health parameters from a dropdown
- Enter values dynamically (no fixed inputs)
- Supports multiple categories:
  - Blood Count
  - Glucose & Lipids
  - Kidney Function
  - Electrolytes
- Add multiple parameters before analysis
- Get:
  - What to **consume**
  - What to **avoid**
  - Clean visual charts

---

### 🤖 Phase 2: AI Report Scanner
- Upload medical report (image/PDF)
- Extract text using OCR (Tesseract.js)
- Detect parameters automatically
- Provide:
  - Simple explanation (easy English)
  - Food suggestions (consume/avoid)

---

## 🧠 Problem Statement
Medical reports are hard to understand for non-medical users. Many people cannot interpret parameters like cholesterol, glucose, etc.

---

## 💡 Solution
This system:
- Converts complex reports into **simple advice**
- Uses **AI + OCR** to automate analysis
- Helps users take **actionable health decisions**

---

## 🛠️ Tech Stack
- Frontend: HTML, CSS, JavaScript  
- Backend: Node.js, Express.js  
- OCR: Tesseract.js  
- Charts: Chart.js  

---

## ⚙️ How to Run

```bash
npm install
node server.js