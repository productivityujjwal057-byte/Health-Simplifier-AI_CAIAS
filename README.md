# AI Health Simplifier 🧠

## 🚀 Project Overview
AI Health simplifier is a web-based application designed to simplify medical lab reports and make healthcare insights accessible to everyone.

The system allows users to:
1. Manually enter medical parameters
2. Upload lab reports (image/PDF) for automatic analysis using OCR

The goal is to convert complex medical data into **simple, understandable advice** for users, especially in rural and non-technical environments.

---

## ✨ Features

### ✅ Phase 1: Manual Entry
- Enter parameters like Hemoglobin, Glucose, Cholesterol
- Get instant analysis
- Receive:
  - What to **consume**
  - What to **avoid**
- Visual charts for better understanding

---

### 🤖 Phase 2: AI Report Scanner (NEW)
- Upload medical report (image/PDF)
- Extract text using **Tesseract.js OCR**
- Automatically detect key parameters
- Analyze report instantly
- Generate:
  - Simple explanation (easy English)
  - Consume / Avoid suggestions
  - Visual representation

---

## 🧠 Problem Statement
Medical reports are difficult to understand for common people. Many patients, especially in rural areas, cannot interpret values like hemoglobin or cholesterol.

---

## 💡 Solution
Our system:
- Converts reports into **simple language**
- Gives **actionable advice**
- Removes dependency on technical medical knowledge

---

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **OCR:** Tesseract.js  
- **Visualization:** Chart.js  
- **Data Handling:** JSON-based logic  

---

##  How to Run

## install dependencies
npm install
## start backend server 
node server.js
