# AI Health Simplifier 🧠

## About the Project
**AI Health Analyzer** is a web-based prototype designed to make medical lab reports **easy to understand for everyone**, especially for users with minimal medical knowledge.  
This hackathon progress version implements **manual entry of medical parameters** and provides **personalized advice on what to consume or avoid** based on the entered values.  

> This is the **first milestone** of our project. The next milestone will add **OCR-based automatic report scanning** with AI explanation.

---

## Features Implemented (Phase 1)
- **Manual entry** of medical parameters:  
  - Hemoglobin, Glucose, Cholesterol, Blood Group, etc.
- **Backend analysis** using Node.js & Express.js  
- **Consume / Avoid advice** generated for each parameter  
- **Visual representation** of parameter values using **bar charts** (Chart.js)  
- **User-friendly interface** with basic styling for quick testing  

---

## Tech Stack
- **Frontend:** HTML, CSS, JavaScript, Chart.js  
- **Backend:** Node.js, Express.js  
- **Data:** JSON-based advice logic (for quick prototyping)  
- **Future:** OCR integration (Tesseract.js) for automatic report scanning  

---

## How to Run (Local Setup)
1. Clone the repository:
   ```bash
   git clone <your-repo-url>

## install dependencies
npm install
## start backend server 
node server.js
