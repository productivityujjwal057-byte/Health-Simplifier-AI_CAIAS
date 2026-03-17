/**
 * AI Health Analyzer — Backend Server
 * Node.js + Express.js
 * POST /analyze → accepts { hemoglobin, glucose, cholesterol }
 *               → returns { advice, explanation, extractedValues }
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// ── Reference ranges (WHO / standard lab norms) ────────────────────────────
const RANGES = {
  hemoglobin: {
    lowMale: 13.5,
    lowFemale: 12.0,
    high: 17.5,
    unit: "g/dL",
    label: "Hemoglobin",
  },
  glucose: {
    low: 70,
    normalMax: 100,
    prediabetes: 125,
    high: 140, // post-meal / fasting high
    unit: "mg/dL",
    label: "Blood Glucose",
  },
  cholesterol: {
    optimal: 200,
    borderline: 239,
    high: 240,
    unit: "mg/dL",
    label: "Total Cholesterol",
  },
};

// ── Advice Logic ────────────────────────────────────────────────────────────
function analyzeHemoglobin(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return null;

  let status, color, explanation, consume, avoid;

  if (val < RANGES.hemoglobin.lowFemale) {
    status = "Low (Anemia Risk)";
    color = "danger";
    explanation =
      "Your hemoglobin is below the normal range. This means your blood may not be carrying enough oxygen to your body. You may feel tired, dizzy, or short of breath. This is called anemia and is very common — it is treatable with the right diet and sometimes supplements.";
    consume = [
      "🥩 Red meat (mutton, beef) — rich in iron",
      "🐟 Fish and chicken liver",
      "🫘 Lentils, rajma (kidney beans), chana (chickpeas)",
      "🌿 Spinach, methi (fenugreek), drumstick leaves",
      "🌰 Pumpkin seeds, sesame seeds (til)",
      "🍊 Vitamin C foods (amla, oranges) — helps absorb iron better",
      "🥚 Eggs",
      "💊 Consider iron supplements after consulting your doctor",
    ];
    avoid = [
      "☕ Tea and coffee immediately after meals — blocks iron absorption",
      "🥛 Excess milk/dairy with iron-rich meals",
      "🍞 Refined flour (maida) items",
      "🚬 Smoking — reduces oxygen in blood",
      "🍺 Alcohol — interferes with iron absorption",
    ];
  } else if (val > RANGES.hemoglobin.high) {
    status = "High";
    color = "warning";
    explanation =
      "Your hemoglobin is slightly higher than normal. High hemoglobin can thicken the blood and increase risk of clots. This could be due to dehydration, smoking, or a condition called polycythemia. Please consult a doctor.";
    consume = [
      "💧 Drink plenty of water — 8–10 glasses daily",
      "🍎 Fresh fruits and vegetables",
      "🥦 Green leafy vegetables",
      "🫐 Antioxidant-rich berries",
    ];
    avoid = [
      "🚬 Smoking",
      "🍺 Alcohol",
      "🥩 Excess red meat",
      "💊 Iron supplements without doctor advice",
    ];
  } else {
    status = "Normal";
    color = "success";
    explanation =
      "Your hemoglobin level is within the healthy range. Your blood is carrying oxygen well. Keep up your balanced diet to maintain this.";
    consume = [
      "🥗 Continue a balanced diet with iron-rich foods",
      "🍎 Fresh fruits and vegetables",
      "💧 Stay well hydrated",
    ];
    avoid = [
      "🍺 Excessive alcohol",
      "🚬 Smoking",
      "🍔 Highly processed junk food",
    ];
  }

  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeGlucose(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return null;

  let status, color, explanation, consume, avoid;

  if (val < RANGES.glucose.low) {
    status = "Low (Hypoglycemia)";
    color = "warning";
    explanation =
      "Your blood sugar is too low. This is called hypoglycemia. You may feel shaky, sweaty, confused, or very hungry. Eat something sweet immediately if you feel these symptoms, then have a proper meal. Consult a doctor if this happens often.";
    consume = [
      "🍬 Glucose tablet or a spoon of sugar immediately if symptomatic",
      "🍌 Banana, dates, or fruit juice for quick sugar",
      "🍚 Rice, roti, oats — complex carbs for sustained energy",
      "🥜 Peanut butter on toast",
      "🥛 A glass of milk",
      "🕐 Eat small meals every 3–4 hours",
    ];
    avoid = [
      "⏩ Skipping meals — especially breakfast",
      "🏋️ Heavy exercise on an empty stomach",
      "🍺 Alcohol on an empty stomach",
      "☕ Excessive caffeine",
    ];
  } else if (val <= RANGES.glucose.normalMax) {
    status = "Normal (Fasting)";
    color = "success";
    explanation =
      "Your fasting blood glucose is in the healthy range. Your body is managing sugar well. Keep maintaining a healthy lifestyle to prevent diabetes.";
    consume = [
      "🥗 Vegetables, whole grains, pulses",
      "🍎 Low-sugar fruits like apple, guava, papaya",
      "💧 Water — 8 glasses daily",
      "🚶 30 minutes of walking daily",
    ];
    avoid = [
      "🍭 Excess sweets and sugary drinks",
      "🍟 Fried and processed foods",
      "🍞 Refined carbs (white bread, maida)",
    ];
  } else if (val <= RANGES.glucose.prediabetes) {
    status = "Prediabetes Range";
    color = "warning";
    explanation =
      "Your glucose is in the prediabetes range. This means your blood sugar is higher than normal but not yet diabetes. This is a warning sign. With diet changes and exercise, you can bring it back to normal. Act now — do not ignore this.";
    consume = [
      "🥦 Non-starchy vegetables (broccoli, spinach, bitter gourd/karela)",
      "🫘 High-fiber foods — oats, lentils, barley",
      "🐟 Lean proteins — fish, chicken, tofu",
      "🌰 Nuts and seeds in moderation",
      "🍋 Lemon water before meals",
      "💊 Consult doctor about folic acid and Vitamin D",
    ];
    avoid = [
      "🍚 Large portions of white rice",
      "🥤 Soft drinks, packaged juices, chai with lots of sugar",
      "🍰 Sweets, mithai, pastries",
      "🥐 White bread, biscuits, maida products",
      "🛋️ Sitting for long hours without movement",
    ];
  } else {
    status = "High (Diabetic Range)";
    color = "danger";
    explanation =
      "Your blood glucose is in the diabetic range. This means your body is not managing sugar properly. High blood sugar over time can damage your kidneys, eyes, nerves, and heart. Please see a doctor soon. With the right treatment and diet, this can be controlled.";
    consume = [
      "🥬 Bitter gourd (karela) — natural blood sugar reducer",
      "🌿 Fenugreek (methi) seeds soaked overnight",
      "🥒 Cucumber, lauki (bottle gourd), tinda",
      "🫘 Moong dal, masoor dal — low glycemic",
      "🍵 Cinnamon tea or turmeric milk (no sugar)",
      "🚶 Walk for at least 30–45 minutes every day",
    ];
    avoid = [
      "🍚 White rice — switch to brown rice or millets",
      "🧃 All sugary drinks including fruit juices",
      "🍰 All sweets, desserts, mithai",
      "🥐 Maida products (bread, biscuits, naan)",
      "🥔 Potatoes, yam (high glycemic)",
      "🍺 Alcohol",
      "😴 Irregular sleep — affects blood sugar levels",
    ];
  }

  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeCholesterol(value) {
  const val = parseFloat(value);
  if (isNaN(val)) return null;

  let status, color, explanation, consume, avoid;

  if (val < 150) {
    status = "Very Low";
    color = "warning";
    explanation =
      "Your cholesterol is unusually low. Very low cholesterol can sometimes be associated with malnutrition, liver problems, or other conditions. While low cholesterol is often seen as good, very low levels need evaluation by a doctor.";
    consume = [
      "🥚 Eggs",
      "🥛 Full-fat dairy in moderation",
      "🥑 Avocado",
      "🌰 Nuts",
      "🐟 Fatty fish",
    ];
    avoid = [
      "🥗 Extreme low-fat diets",
      "🍺 Alcohol — can lower cholesterol dangerously",
    ];
  } else if (val <= RANGES.cholesterol.optimal) {
    status = "Normal / Optimal";
    color = "success";
    explanation =
      "Your cholesterol level is in the healthy range. This is great news for your heart health! Cholesterol below 200 mg/dL is considered optimal and reduces your risk of heart disease. Keep up the good work.";
    consume = [
      "🐟 Fish twice a week (omega-3 rich)",
      "🥑 Healthy fats — avocado, olive oil",
      "🌰 Walnuts, almonds",
      "🫐 Berries and colorful vegetables",
      "🫘 Oats and pulses",
    ];
    avoid = [
      "🍟 Deep fried foods",
      "🥩 Excess red meat",
      "🧀 Processed cheese and butter in excess",
      "🚬 Smoking",
    ];
  } else if (val <= RANGES.cholesterol.borderline) {
    status = "Borderline High";
    color = "warning";
    explanation =
      "Your cholesterol is borderline high. This means you are at moderate risk for heart disease. The good news is that lifestyle changes can significantly bring this down. Focus on diet and exercise before it becomes a bigger problem.";
    consume = [
      "🌾 Oats and oat bran every morning — reduces LDL cholesterol",
      "🐟 Fatty fish — salmon, mackerel, sardines",
      "🌰 A handful of walnuts or flaxseeds daily",
      "🫘 Beans, lentils, chickpeas",
      "🫚 Replace butter with olive oil for cooking",
      "🍎 Apple, pear — soluble fiber lowers cholesterol",
      "🧄 Garlic — natural cholesterol reducer",
    ];
    avoid = [
      "🧈 Butter, ghee in excess",
      "🍟 Fried snacks — samosa, pakoda, chips",
      "🥩 Fatty meats and organ meats",
      "🥛 Full-fat dairy in large amounts",
      "🍰 Pastries, cakes, cookies",
      "🚬 Smoking — lowers good cholesterol (HDL)",
    ];
  } else {
    status = "High (Risk Zone)";
    color = "danger";
    explanation =
      "Your cholesterol is in the high-risk zone. High cholesterol causes fatty deposits in your blood vessels, which can lead to heart attack or stroke. This needs immediate attention. Please see a doctor and start a heart-healthy diet today. Do not wait.";
    consume = [
      "🌾 Oatmeal daily — most effective natural LDL reducer",
      "🐟 Omega-3 rich fish 3x/week (mackerel, sardines, tuna)",
      "🧄 2 raw garlic cloves daily",
      "🫘 All varieties of beans and lentils",
      "🌿 Coriander seed water (dhaniya pani) — traditional remedy",
      "🍵 Green tea — 2 cups daily",
      "🥦 Cruciferous vegetables (cauliflower, broccoli)",
      "🚶 45 min brisk walk every day",
    ];
    avoid = [
      "🍟 ALL fried food — ban completely",
      "🧈 Butter, margarine, vanaspati",
      "🥩 Red meat and organ meats",
      "🥛 Full-fat dairy (switch to skimmed milk)",
      "🍰 All baked goods with trans fats",
      "🥥 Coconut oil in large amounts",
      "🍺 Alcohol",
      "🚬 Smoking — MUST STOP immediately",
      "🛋️ Sedentary lifestyle",
    ];
  }

  return { value: val, status, color, explanation, consume, avoid };
}

// ── POST /analyze ───────────────────────────────────────────────────────────
app.post("/analyze", (req, res) => {
  const { hemoglobin, glucose, cholesterol } = req.body;

  // Validate — at least one value must be present
  if (
    hemoglobin === undefined &&
    glucose === undefined &&
    cholesterol === undefined
  ) {
    return res.status(400).json({
      error: "Please provide at least one value to analyze.",
    });
  }

  const results = {};
  const missingFields = [];

  // Analyze each value
  if (hemoglobin !== undefined && hemoglobin !== null && hemoglobin !== "") {
    const result = analyzeHemoglobin(hemoglobin);
    if (result) results.hemoglobin = result;
    else missingFields.push("hemoglobin");
  } else {
    missingFields.push("hemoglobin");
  }

  if (glucose !== undefined && glucose !== null && glucose !== "") {
    const result = analyzeGlucose(glucose);
    if (result) results.glucose = result;
    else missingFields.push("glucose");
  } else {
    missingFields.push("glucose");
  }

  if (cholesterol !== undefined && cholesterol !== null && cholesterol !== "") {
    const result = analyzeCholesterol(cholesterol);
    if (result) results.cholesterol = result;
    else missingFields.push("cholesterol");
  } else {
    missingFields.push("cholesterol");
  }

  return res.json({
    success: true,
    extractedValues: {
      hemoglobin: hemoglobin || null,
      glucose: glucose || null,
      cholesterol: cholesterol || null,
    },
    advice: results,
    missingFields,
    ranges: RANGES,
  });
});

// ── Health check ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => res.json({ status: "ok" }));

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Health Analyzer Server running at http://localhost:${PORT}`);
  console.log(`   Open http://localhost:${PORT} in your browser\n`);
});