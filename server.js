/**
 * HealthLens AI v3 — Full Server
 * Blood (17 params) + Heart & Brain (ECG/Neuro AI summarizer)
 */

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ═══════════════════════════════════════════════════════════════════
//  BLOOD PARAMETER ANALYZERS (unchanged from v2)
// ═══════════════════════════════════════════════════════════════════

function analyzeHemoglobin(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 8) {
    status="Severely Low";color="danger";
    explanation="Your hemoglobin is critically low — severe anemia. Blood cannot carry enough oxygen. You may be extremely exhausted, breathless at rest, very pale. This is a medical emergency. A doctor may recommend iron injections or a blood transfusion.";
    consume=["🏥 See doctor immediately","🥩 Liver, red meat, chicken","🫘 Lentils, rajma, chickpeas","🌿 Spinach, drumstick leaves, methi","🍊 Amla, oranges — Vitamin C helps iron absorption","🥚 2 eggs daily","💊 Iron + Folic acid as prescribed"];
    avoid=["☕ Tea/coffee within 1 hour of meals","🥛 Excess dairy with iron-rich meals","🍺 Alcohol","🚬 Smoking"];
  } else if (val < 12) {
    status="Low (Anemia)";color="danger";
    explanation="Hemoglobin is below normal — anemia. Blood is not carrying enough oxygen causing tiredness, weakness, breathlessness, and pale skin. Very common, especially in women. Treatable with diet and supplements.";
    consume=["🥩 Red meat, chicken, fish 3x/week","🫘 Dal, rajma, chana daily","🌿 Palak, methi, drumstick leaves","🍊 Vitamin C with every iron-rich meal","🥚 2 eggs daily","💊 Iron supplement — consult doctor"];
    avoid=["☕ Tea/coffee immediately after meals","🥛 Milk with iron foods","🍺 Alcohol","🚬 Smoking"];
  } else if (val <= 17.5) {
    status="Normal";color="success";
    explanation="Hemoglobin is in the healthy range. Blood is carrying oxygen well. You do not have anemia. Maintain your balanced diet.";
    consume=["🥗 Continue balanced diet","🍎 Fresh fruits and vegetables","💧 8–10 glasses water daily","🫘 Pulses and leafy greens"];
    avoid=["🍺 Excessive alcohol","🚬 Smoking","🍔 Processed junk food"];
  } else {
    status="High (Polycythemia Risk)";color="warning";
    explanation="Hemoglobin is above normal — blood is thicker, raising risk of clots, stroke, and heart attack. Common causes: dehydration, smoking, or bone marrow disorder. See a doctor.";
    consume=["💧 10–12 glasses water daily","🍎 Fresh fruits and vegetables","🫐 Antioxidant-rich berries"];
    avoid=["🚬 Smoking — top cause","🍺 Alcohol","💊 Iron supplements without need"];
  }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeGlucose(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 70) {
    status="Low (Hypoglycemia)";color="warning";
    explanation="Blood sugar is too low — hypoglycemia. Symptoms: shaking, sweating, confusion, pounding heart. Eat something sweet immediately if symptomatic, then a proper meal. Common causes: skipping meals, over-exercise, or too much diabetes medication.";
    consume=["🍬 Glucose tablet or sugar immediately if symptomatic","🍌 Banana or 4–5 dates","🍚 Rice, roti, oats — complex carbs","🕐 Eat every 3–4 hours — never skip meals"];
    avoid=["⏩ Skipping meals especially breakfast","🏋️ Intense exercise on empty stomach","🍺 Alcohol on empty stomach"];
  } else if (val <= 100) {
    status="Normal (Fasting)";color="success";
    explanation="Fasting glucose is ideal. Your body manages sugar well. Not at risk for diabetes right now. Maintain your lifestyle to keep it that way.";
    consume=["🥗 Vegetables, whole grains, pulses","🍎 Low-sugar fruits: apple, guava, papaya","💧 8 glasses water","🚶 30 min walk daily"];
    avoid=["🍭 Sweets and sugary drinks","🍟 Fried snacks","🍞 Refined carbs — white bread, biscuits"];
  } else if (val <= 125) {
    status="Prediabetes";color="warning";
    explanation="Glucose is in the prediabetes range — a serious warning sign. Without lifestyle changes, this can become Type 2 Diabetes within 5 years. With the right diet and 30 min daily exercise, you can reverse it. Act NOW.";
    consume=["🥦 Bitter gourd (karela), lauki, cucumber","🌾 Oats, barley, ragi, jowar","🫘 Moong dal, masoor dal","🍋 Lemon water every morning","🚶 30–45 min brisk walk every day"];
    avoid=["🍚 Large white rice — switch to millets","🥤 Soft drinks, packaged juices","🍰 All sweets and pastries","🥐 Maida products"];
  } else {
    status="High (Diabetic Range)";color="danger";
    explanation="Glucose is in the diabetic range. Body cannot regulate blood sugar properly. High sugar silently damages kidneys, eyes, nerves, and heart. Please see a doctor immediately. With medication and strict diet, diabetes is very manageable.";
    consume=["🥬 Karela — nature's insulin","🌿 Methi seeds soaked overnight — drink water in morning","🫘 Moong, masoor, chana — low glycemic","🍵 Cinnamon tea (no sugar), turmeric milk","🚶 45 min walk daily — most important"];
    avoid=["🍚 White rice — switch to millets completely","🧃 ALL sugary drinks including fruit juice","🍰 All sweets and mithai","🥔 Potato, yam — very high glycemic","🍺 Alcohol"];
  }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeCholesterol(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 150) {
    status="Very Low";color="warning";
    explanation="Unusually low total cholesterol. Very low values can indicate malnutrition, liver disease, or hyperthyroidism. Consult a doctor.";
    consume=["🥚 Eggs","🥑 Avocado","🌰 Nuts","🐟 Fatty fish","🥛 Whole dairy in moderation"];
    avoid=["🥗 Extreme fat-restriction diets","🍺 Alcohol"];
  } else if (val <= 200) {
    status="Optimal";color="success";
    explanation="Total cholesterol is optimal — below 200 is ideal. This significantly reduces your risk of heart disease, heart attack, and stroke. Excellent result.";
    consume=["🐟 Fish 2x/week","🥑 Olive oil for cooking","🌰 Walnuts, almonds daily","🫘 Oats and pulses"];
    avoid=["🍟 Deep-fried foods","🥩 Excess red meat","🧀 Processed cheese","🚬 Smoking"];
  } else if (val <= 239) {
    status="Borderline High";color="warning";
    explanation="Cholesterol is borderline high. Cholesterol deposits build slowly in arteries over years. Lifestyle changes now can prevent medication later.";
    consume=["🌾 Oats every morning","🐟 Salmon, mackerel, sardines","🌰 Walnuts or flaxseeds daily","🫘 Beans, lentils, chickpeas","🧄 2 raw garlic cloves daily"];
    avoid=["🧈 Butter and ghee in excess","🍟 All fried snacks","🥩 Fatty meats","🍰 Pastries","🚬 Smoking"];
  } else {
    status="High (Heart Risk)";color="danger";
    explanation="Cholesterol is dangerously high. Fatty plaques are building up in your arteries, raising risk of heart attack and stroke. See a doctor immediately and start strict dietary changes today.";
    consume=["🌾 Oatmeal every single morning","🐟 Omega-3 fish 3x/week","🧄 2–3 raw garlic cloves daily","🫘 All pulses and legumes","🍵 Green tea 2 cups/day","🚶 45 min brisk walk daily"];
    avoid=["🍟 ALL fried food — completely banned","🧈 Butter, margarine — banned","🥩 Red meat and organ meats","🍺 Alcohol","🚬 Smoking — STOP immediately"];
  }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeLDL(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 100) { status="Optimal";color="success"; explanation="LDL (bad cholesterol) is at optimal level. Below 100 is ideal and puts you at low risk for heart disease."; consume=["🫘 Fiber-rich foods","🐟 Fatty fish weekly","🌰 Nuts and seeds","🥑 Healthy fats"]; avoid=["🍟 Trans fats and fried food","🥩 Excess saturated fat"]; }
  else if (val < 130) { status="Near Optimal";color="success"; explanation="LDL is near optimal. Good level with small room for improvement."; consume=["🌾 Oats daily","🐟 Fish 2x/week","🌰 Walnuts and almonds"]; avoid=["🍟 Fried foods","🧈 Excess butter"]; }
  else if (val < 160) { status="Borderline High";color="warning"; explanation="LDL is borderline high. Actively reduce through diet and exercise before medication is needed."; consume=["🌾 Oatmeal every morning","🧄 Raw garlic daily","🫘 Lentils and beans","🐟 Fatty fish 2–3x/week"]; avoid=["🧈 Ghee and butter","🥩 Red meat","🍟 Fried snacks"]; }
  else { status="High";color="danger"; explanation="LDL is high — primary driver of arterial plaque. Major heart attack and stroke risk. Strict diet changes and doctor evaluation needed for statin medication."; consume=["🌾 Oats, barley daily","🐟 Omega-3 fish 3x/week","🫘 All pulses","🧄 Raw garlic","🍵 Green tea"]; avoid=["🍟 Complete ban on fried food","🧈 All saturated fats","🥩 Red and organ meats","🚬 Smoking"]; }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeHDL(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 40) { status="Low (Heart Risk)";color="danger"; explanation="HDL (good cholesterol) is too low. HDL removes bad cholesterol from arteries. Low HDL is a major independent risk factor for heart attack even if total cholesterol looks acceptable."; consume=["🫚 Olive oil — best food to raise HDL","🐟 Fatty fish — omega-3 raises HDL","🥑 Avocado daily","🌰 Walnuts, almonds","🚴 Aerobic exercise is #1 way to raise HDL"]; avoid=["🚬 Smoking — biggest cause of low HDL","🍟 Trans fats completely","🛋️ Sedentary lifestyle","🍺 Excess alcohol"]; }
  else if (val < 60) { status="Acceptable";color="warning"; explanation="HDL is acceptable but not ideal. 60+ mg/dL is the protective level. Increase through exercise and healthy fats."; consume=["🫚 Olive oil for cooking","🐟 Fish 2–3x/week","🥑 Avocado","🌰 Mixed nuts daily","🚴 Daily aerobic exercise"]; avoid=["🚬 Smoking","🍟 Trans fats","🛋️ Prolonged sitting"]; }
  else { status="Protective Level";color="success"; explanation="Excellent! HDL at 60+ mg/dL — the protective level that reduces overall heart disease risk. One of the best cholesterol results you can have."; consume=["🥑 Continue healthy fat intake","🐟 Fish weekly","🌰 Nuts","🚴 Keep up aerobic exercise"]; avoid=["🚬 Smoking — will rapidly lower HDL","🍟 Trans fats"]; }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeTriglycerides(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 150) { status="Normal";color="success"; explanation="Triglycerides are normal. Fat metabolism is working properly. Normal levels mean low risk for heart disease and fatty liver."; consume=["🫘 High-fiber diet","🐟 Fish regularly","💧 Good hydration"]; avoid=["🍭 Excess sugar","🍺 Alcohol","🍟 Fried foods"]; }
  else if (val < 200) { status="Borderline High";color="warning"; explanation="Borderline high triglycerides. Associated with fatty liver, metabolic syndrome, and heart disease. Diet changes work dramatically within weeks."; consume=["🐟 Omega-3 fish 3x/week — most effective","🌰 Walnuts and flaxseeds","🫘 Beans and lentils","💧 Water only — no sweetened drinks"]; avoid=["🍭 ALL sweets — biggest TG raiser","🍺 Alcohol","🍞 Refined carbs","🥤 Packaged juices and soft drinks"]; }
  else if (val < 500) { status="High";color="danger"; explanation="High triglycerides — significant risk for heart disease, fatty liver, and pancreatitis. See a doctor for evaluation and possible medication."; consume=["🐟 Fatty fish or omega-3 supplement daily","🥦 Non-starchy vegetables as main food","🌾 Millets — ragi, jowar, bajra","🚶 45 min exercise daily"]; avoid=["🍭 Zero sugar","🍺 Zero alcohol","🍚 White rice","🍟 All fried food"]; }
  else { status="Very High (Danger)";color="danger"; explanation="Extremely high triglycerides. Above 500 puts you at risk of acute pancreatitis — a very dangerous condition. See a doctor TODAY."; consume=["🏥 See doctor today","🥦 Only non-starchy vegetables and lean protein","💧 Water only"]; avoid=["🍭 Zero sugar","🍺 Zero alcohol","🍚 All refined carbohydrates","🍟 Zero fried food"]; }
  return { value:val, status, color, explanation, consume, avoid };
}

function analyzeBUN(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 7) return { value:val, status:"Low", color:"warning", explanation:"BUN is below normal. Can indicate low protein intake, malnutrition, or liver disease. Usually less serious than high BUN.", consume:["🥚 Eggs","🫘 Pulses","🐟 Fish"], avoid:["🥗 Extreme low-protein diets"] };
  if (val <= 20) return { value:val, status:"Normal", color:"success", explanation:"BUN is normal — kidneys are filtering waste effectively. Good kidney health marker.", consume:["💧 8 glasses water","🥗 Balanced diet"], avoid:["💊 NSAIDs in excess","🍺 Alcohol"] };
  return { value:val, status:"High (Kidney Concern)", color:"danger", explanation:"Elevated BUN suggests kidneys may not be filtering waste efficiently. Can result from dehydration, high protein diet, kidney disease, or heart failure. See a doctor promptly.", consume:["💧 10–12 glasses water/day","🍎 Apple, pear","🥒 Cucumber, lauki"], avoid:["🥩 High-protein diet","💊 Painkillers (ibuprofen, aspirin)","🧂 Excess salt","🍺 Alcohol"] };
}

function analyzeCreatinine(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 0.6) return { value:val, status:"Low", color:"warning", explanation:"Creatinine is low. Usually indicates low muscle mass or malnutrition. Less concerning than high creatinine.", consume:["🥩 Lean protein","🥚 Eggs","💪 Light exercise"], avoid:["🥗 Very low protein diets"] };
  if (val <= 1.2) return { value:val, status:"Normal", color:"success", explanation:"Creatinine is normal — a good indicator your kidneys are functioning well. Normal levels confirm they are effectively filtering waste.", consume:["💧 Good hydration","🥗 Balanced diet"], avoid:["💊 Excess NSAIDs","🍺 Alcohol"] };
  return { value:val, status:"High (Kidney Strain)", color:"danger", explanation:"Elevated creatinine is a warning that kidneys are under stress. When kidneys are damaged, creatinine builds up in the blood. Combined with high BUN, this strongly indicates kidney disease. See a doctor.", consume:["💧 10–12 glasses water","🍎 Apples, berries","🫐 Cranberries","🥒 Cucumber and lauki"], avoid:["🥩 Excess red meat","🧂 High salt","💊 Painkillers regularly","🍺 Alcohol"] };
}

function analyzeUricAcid(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 3.4) return { value:val, status:"Low", color:"warning", explanation:"Uric acid is slightly below normal. Generally not dangerous. Usually not a concern unless combined with other abnormal values.", consume:["🫘 Moderate purine foods","🥗 Balanced diet"], avoid:["No specific restrictions"] };
  if (val <= 7.0) return { value:val, status:"Normal", color:"success", explanation:"Uric acid is normal. Body is processing and eliminating it efficiently. Not at risk for gout.", consume:["💧 Drink plenty of water","🍒 Cherries — naturally lower uric acid"], avoid:["🥩 Very high red meat","🍺 Beer — raises uric acid most"] };
  return { value:val, status:"High (Gout Risk)", color:"danger", explanation:"Uric acid is high — hyperuricemia. When it builds up, it forms sharp crystals in joints causing extremely painful gout attacks (worst in big toe, ankles, knees). Also increases kidney stone risk.", consume:["💧 10–12 glasses water daily","🍒 Cherries and cherry juice","🥒 Cucumber, lauki","🍋 Lemon water every morning","🥛 Low-fat dairy"], avoid:["🥩 Red meat, organ meats (liver, kidney)","🍺 Beer — worst for uric acid","🦐 Seafood","🍟 Fried food","💊 Aspirin — raises uric acid"] };
}

function analyzeSodium(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 136) return { value:val, status:"Low (Hyponatremia)", color:"danger", explanation:"Sodium is below normal — hyponatremia. Sodium regulates fluid balance. Low sodium causes headache, nausea, confusion, muscle cramps, and in severe cases seizures. Seek medical evaluation.", consume:["🧂 Moderate salt as doctor directs","🥛 Electrolyte drinks (ORS) if directed"], avoid:["💧 Overdrinking plain water without electrolytes","🍺 Alcohol — causes sodium loss"] };
  if (val <= 145) return { value:val, status:"Normal", color:"success", explanation:"Sodium level is normal. Essential for fluid balance, nerve function, and muscle contractions. Normal levels mean your electrolyte balance is healthy.", consume:["💧 8 glasses water/day","🥗 Balanced diet with moderate salt"], avoid:["🧂 Excess salt","🥫 Processed foods — high in hidden sodium"] };
  return { value:val, status:"High (Hypernatremia)", color:"danger", explanation:"Sodium is elevated — hypernatremia. Causes cells to shrink. Symptoms: intense thirst, dry mouth, confusion, muscle twitching. Most common cause: dehydration.", consume:["💧 Increase water intake significantly","🍉 Watermelon, cucumber","🥦 Fresh vegetables"], avoid:["🧂 Salt — reduce significantly","🥫 All processed/packaged foods","🥜 Salted nuts and chips"] };
}

function analyzePotassium(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 3.5) return { value:val, status:"Low (Hypokalemia)", color:"danger", explanation:"Potassium is too low — hypokalemia. Potassium is vital for regular heartbeat and muscle contractions. Low potassium causes dangerous heart rhythm irregularities, muscle weakness, and cramps.", consume:["🍌 Bananas — best potassium source","🥔 Boiled potato with skin","🥑 Avocado","🍊 Oranges","🫘 Lentils and kidney beans","🥛 Milk and yogurt"], avoid:["🍺 Alcohol — depletes potassium","☕ Excess caffeine","🍭 Sugar and processed foods"] };
  if (val <= 5.0) return { value:val, status:"Normal", color:"success", explanation:"Potassium is normal. Essential for heart rhythm, muscle function, and nerve transmission. Normal levels mean adequate electrolyte support.", consume:["🍌 Bananas, oranges","🥗 Vegetables","🫘 Pulses","🥛 Dairy"], avoid:["💊 Potassium supplements without need","🍺 Alcohol"] };
  return { value:val, status:"High (Hyperkalemia)", color:"danger", explanation:"Potassium is elevated — hyperkalemia. Can cause dangerous heart arrhythmias including fatal cardiac arrest. Usually caused by kidney disease, certain medications, or severe dehydration. Immediate medical evaluation needed.", consume:["🍎 Apples, pears (low potassium)","🍚 White rice, pasta","💧 Adequate hydration"], avoid:["🍌 Bananas — very high potassium","🥔 Potatoes","🥑 Avocado","💊 Potassium supplements — absolutely do not take","🧂 Salt substitutes — contain potassium chloride"] };
}

function analyzeCalcium(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 8.5) return { value:val, status:"Low (Hypocalcemia)", color:"danger", explanation:"Calcium is below normal — hypocalcemia. Essential for strong bones, muscle contractions, nerve function, and blood clotting. Low calcium causes muscle cramps, numbness, brittle bones, dental problems, and potentially seizures. Often caused by Vitamin D deficiency.", consume:["🥛 Milk 2–3 glasses daily","🧀 Cheese and yogurt","🌰 Sesame seeds (til) — highest plant calcium","🐟 Small fish with edible bones","☀️ Sunlight 20 min/day","💊 Calcium + Vitamin D supplement if prescribed"], avoid:["☕ Excess coffee","🍺 Alcohol","🚬 Smoking — weakens bones","🥤 Excess soft drinks"] };
  if (val <= 10.5) return { value:val, status:"Normal", color:"success", explanation:"Calcium is normal. Essential for strong bones and teeth, muscle function, and nerve signaling. Normal levels mean bone health is supported.", consume:["🥛 Dairy 2–3 servings daily","☀️ Sunlight for Vitamin D","🥦 Green vegetables","🌰 Sesame seeds"], avoid:["🍺 Excess alcohol","🚬 Smoking","🥤 Excess soft drinks"] };
  return { value:val, status:"High (Hypercalcemia)", color:"warning", explanation:"Calcium is elevated — hypercalcemia. Can cause kidney stones, constipation, excessive thirst, frequent urination, and fatigue. Usually caused by overactive parathyroid or excessive Vitamin D supplements.", consume:["💧 Lots of water","🥒 Water-rich vegetables","🍋 Lemon water"], avoid:["🥛 Reduce dairy temporarily","💊 Calcium and Vitamin D supplements — stop if taking"] };
}

function analyzeVitaminD(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 20) return { value:val, status:"Deficient", color:"danger", explanation:"Vitamin D is severely deficient — very common in India due to indoor lifestyles. Causes bone pain, muscle weakness, fatigue, depression, frequent infections, and poor calcium absorption. Also linked to diabetes, heart disease, and cancer.", consume:["☀️ Sunlight 20–30 min daily between 10am–2pm (most important)","🐟 Fatty fish: salmon, mackerel, sardines","🥚 Egg yolk daily","🥛 Fortified milk","💊 Vitamin D3 supplement 1000–2000 IU daily"], avoid:["🏠 Staying indoors all day","🚬 Smoking — impairs Vitamin D metabolism","🍺 Alcohol"] };
  if (val < 30) return { value:val, status:"Insufficient", color:"warning", explanation:"Vitamin D is insufficient — not quite deficient but below ideal. May notice mild fatigue, bone aches, or reduced immunity. Easily corrected with more sunlight and diet.", consume:["☀️ 15–20 min sunlight daily","🐟 Fish 2x/week","🥚 Eggs","🥛 Fortified milk","💊 Vitamin D3 500–1000 IU supplement"], avoid:["🏠 Prolonged indoor confinement","🚬 Smoking","🍺 Alcohol"] };
  return { value:val, status:"Sufficient", color:"success", explanation:"Vitamin D is sufficient. Crucial for calcium absorption, bone strength, immune function, mood regulation, and muscle health. Excellent result.", consume:["☀️ Continue regular sunlight","🐟 Fish and eggs","🥛 Fortified dairy"], avoid:["💊 Very high dose supplements without monitoring — toxicity above 150 ng/mL"] };
}

function analyzeWBC(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 4000) return { value:val, status:"Low (Leukopenia)", color:"danger", explanation:"White blood cell count is low — leukopenia. WBCs are your immune system's soldiers. Low WBC means your immunity is weakened and you are very susceptible to infections. Common causes: dengue, typhoid, chemotherapy, autoimmune disease, or bone marrow problems. See a doctor urgently.", consume:["🧄 Garlic — powerful immune booster","🫐 Berries","🥦 Broccoli","🍵 Green tea","🌰 Almonds — Vitamin E for immunity","🍊 Citrus — Vitamin C","🥛 Yogurt with probiotics"], avoid:["🚬 Smoking","🍺 Alcohol","😰 Excessive stress","👥 Crowded places when count is very low"] };
  if (val <= 11000) return { value:val, status:"Normal", color:"success", explanation:"White blood cell count is normal. Immune system is healthy and ready to fight pathogens. No sign of active infection or immune suppression.", consume:["🍊 Vitamin C foods","🧄 Garlic","🥗 Rainbow vegetables","💧 Good hydration","😴 7–8 hours sleep"], avoid:["🚬 Smoking","🍺 Alcohol","😰 Chronic stress"] };
  return { value:val, status:"High (Infection Risk)", color:"danger", explanation:"WBC count is elevated. High WBC means your immune system is actively fighting something — usually a bacterial or viral infection, inflammation, or rarely leukemia. Common causes: pneumonia, UTI, appendicitis, or any active infection. See a doctor to identify and treat the cause.", consume:["💧 10–12 glasses water","🍵 Ginger tea — anti-inflammatory","🧅 Turmeric milk","🫐 Berries","🍊 Vitamin C","😴 Rest — your body is fighting infection"], avoid:["🍟 Inflammatory foods","🍭 Sugar — suppresses immune cell activity","🍺 Alcohol","🚬 Smoking"] };
}

function analyzeRBC(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 4.0) return { value:val, status:"Low", color:"danger", explanation:"Red blood cell count is low. RBCs carry oxygen from lungs to every organ. Low RBC causes fatigue, weakness, shortness of breath, pale skin, dizziness. Combined with low hemoglobin, this confirms anemia.", consume:["🥩 Iron-rich: red meat, liver","🌿 Leafy greens: palak, methi","🫘 All dal and legumes","🍊 Vitamin C with iron foods","💊 Iron + B12 + Folic acid supplements"], avoid:["☕ Tea/coffee within 1 hour of meals","🚬 Smoking"] };
  if (val <= 5.5) return { value:val, status:"Normal", color:"success", explanation:"Red blood cell count is normal. RBCs contain hemoglobin that carries oxygen. Normal count confirms blood is effectively transporting oxygen to all organs, supporting energy and vitality.", consume:["🥗 Balanced iron-rich diet","🍊 Vitamin C foods","💧 Good hydration"], avoid:["🚬 Smoking","🍺 Excess alcohol"] };
  return { value:val, status:"High (Polycythemia Risk)", color:"warning", explanation:"RBC count is higher than normal — polycythemia. Excess RBCs make blood thicker, increasing risk of blood clots, stroke, and heart attack. Causes include dehydration, smoking, high altitude, or bone marrow disorder.", consume:["💧 10–12 glasses water daily","🍎 Fresh fruits","🥦 Vegetables"], avoid:["🚬 Smoking — top cause","💊 Iron supplements — will worsen this","🥩 Excess red meat"] };
}

function analyzePlatelets(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 150000) return { value:val, status:"Low (Thrombocytopenia)", color:"danger", explanation:"Platelet count is low — thrombocytopenia. Platelets form blood clots to stop bleeding. Low platelets cause easy bruising and prolonged bleeding. Very low counts (below 50,000) risk spontaneous internal bleeding. Common causes: dengue fever, viral infections, ITP, liver disease. See a doctor now.", consume:["🥝 Kiwi fruit — shown to raise platelets","🥦 Broccoli and leafy greens — Vitamin K","🍈 Papaya leaf extract — raises platelets in dengue","🥛 Milk (Vitamin K)","🐟 Fatty fish"], avoid:["🍺 Alcohol — suppresses platelet production","💊 Aspirin and ibuprofen","🚬 Smoking"] };
  if (val <= 400000) return { value:val, status:"Normal", color:"success", explanation:"Platelet count is normal. Platelets clump together to form clots when you bleed. Normal count means clotting ability is healthy — wounds close properly and bruising is normal.", consume:["🥗 Balanced diet with Vitamin K (green vegetables)","🥦 Leafy greens","🐟 Fish","🥛 Dairy"], avoid:["🍺 Excess alcohol","💊 Blood thinners without prescription"] };
  return { value:val, status:"High (Thrombocytosis)", color:"warning", explanation:"Platelet count is elevated — thrombocytosis. Very high platelets can cause inappropriate blood clots, risking stroke, heart attack, or DVT. Can be caused by iron deficiency, infections, or inflammatory conditions.", consume:["💧 Plenty of water","🧄 Garlic and ginger — natural anti-platelet","🍵 Green tea","🐟 Omega-3 fish"], avoid:["🚬 Smoking — raises clot risk dramatically","🛋️ Prolonged immobility"] };
}

function analyzeTSH(v) {
  const val = +v; if (isNaN(val)) return null;
  if (val < 0.4) return { value:val, status:"Low (Hyperthyroidism)", color:"danger", explanation:"TSH is too low — thyroid may be overactive (hyperthyroidism). Thyroid is producing too much hormone, speeding up metabolism. Symptoms: unintended weight loss, rapid heartbeat, anxiety, tremors, sweating. Graves' disease is a common cause. See an endocrinologist urgently.", consume:["🥦 Cruciferous vegetables: broccoli, cabbage, cauliflower — naturally slow thyroid","🌰 Flaxseeds","🍓 Berries — antioxidants","😴 Adequate sleep and stress management"], avoid:["🍵 Excess caffeine — worsens palpitations","💊 Iodine supplements","🏋️ Intense exercise if heart rate is already high"] };
  if (val <= 4.0) return { value:val, status:"Normal", color:"success", explanation:"TSH is normal. Thyroid is functioning properly, regulating your metabolism, energy, weight, and mood correctly. Excellent result.", consume:["🐟 Iodine-rich fish","🧂 Iodized salt","🌰 Brazil nuts — selenium for thyroid","🥚 Eggs","🥛 Dairy"], avoid:["💊 Thyroid supplements without need","🥦 Excessive raw cruciferous vegetables"] };
  return { value:val, status:"High (Hypothyroidism)", color:"danger", explanation:"TSH is elevated — thyroid may be underactive (hypothyroidism). High TSH means pituitary is sending distress signals because thyroid isn't producing enough hormone. Slows everything down: fatigue, unexplained weight gain, hair loss, dry skin, constipation, feeling cold, depression, brain fog. Hashimoto's thyroiditis is very common especially in women. Medication (levothyroxine) is very effective.", consume:["🌰 Brazil nuts — selenium (thyroid essential)","🐟 Fish and seafood — iodine","🧂 Iodized salt","🥚 Eggs","🫘 Pumpkin seeds — zinc","☀️ Sunlight for Vitamin D","💊 See doctor for levothyroxine prescription"], avoid:["🥦 Raw cruciferous vegetables in large amounts — goitrogens inhibit thyroid","🌱 Soy in large amounts","🍺 Alcohol"] };
}

// ═══════════════════════════════════════════════════════════════════
//  CONDITION DETECTION (blood parameters)
// ═══════════════════════════════════════════════════════════════════
function detectConditions(body, results) {
  const r = results;
  const g = key => r[key] ? r[key].value : null;
  const conditions = [];

  const hb=g("hemoglobin"),rbc=g("rbc"),glu=g("glucose"),chol=g("cholesterol"),
        ldl=g("ldl"),hdl=g("hdl"),tg=g("triglycerides"),bun=g("bun"),
        crea=g("creatinine"),ua=g("uricAcid"),na=g("sodium"),k=g("potassium"),
        ca=g("calcium"),vitd=g("vitaminD"),wbc=g("wbc"),plt=g("platelets"),tsh=g("tsh");

  if ((hb&&hb<12)||(rbc&&rbc<4.0)) conditions.push({name:"Anemia",icon:"🩸",severity:"danger",summary:"Low hemoglobin or RBC count. Blood cannot carry enough oxygen. You may feel constantly tired, weak, and look pale.",action:"Eat iron-rich foods with Vitamin C. Consult doctor for iron/B12 supplements."});
  if ((hb&&hb>17.5)||(rbc&&rbc>5.5)) conditions.push({name:"Polycythemia / High RBC",icon:"🔴",severity:"warning",summary:"High hemoglobin or RBC makes blood thicker, raising risk of blood clots, stroke, and heart attack.",action:"Stop smoking, hydrate well (10+ glasses water/day), and see a doctor to rule out bone marrow disorders."});
  if (glu&&glu>=126) conditions.push({name:"Diabetes / High Blood Sugar",icon:"🍬",severity:"danger",summary:"Fasting glucose in diabetic range. Uncontrolled blood sugar silently damages kidneys, eyes, nerves, and heart over years.",action:"See a doctor immediately for HbA1c test and treatment plan. Start low-glycemic diet. Walk 30–45 min daily."});
  else if (glu&&glu>=101) conditions.push({name:"Prediabetes — Act Now",icon:"⚠️",severity:"warning",summary:"Glucose is in prediabetes range. Without lifestyle changes, this will progress to Type 2 Diabetes within 3–5 years.",action:"Eliminate refined carbs and sugar. Walk 30 min daily. Retest in 3 months. Still reversible!"});
  if ((chol&&chol>200)||(ldl&&ldl>130)||(tg&&tg>150)||(hdl&&hdl<40)) conditions.push({name:"Heart Disease Risk",icon:"🫀",severity:"danger",summary:"Abnormal lipid panel — high cholesterol/LDL/triglycerides or low HDL significantly raises risk of heart attack and stroke.",action:"Daily oats, omega-3 fish, eliminate fried food and trans fats, walk 45 min/day. Consult doctor for statin assessment."});
  if ((bun&&bun>20)||(crea&&crea>1.2)) conditions.push({name:"Kidney Problems",icon:"🫘",severity:"danger",summary:"Elevated BUN and/or creatinine suggests kidneys are not filtering waste efficiently. Can progress to chronic kidney disease.",action:"Hydrate well (10+ glasses water). Avoid NSAIDs. Reduce protein. See a nephrologist urgently."});
  if (ua&&ua>7.0) conditions.push({name:"Gout / High Uric Acid",icon:"🦴",severity:"warning",summary:"High uric acid can crystallize in joints causing extremely painful gout attacks and increases kidney stone risk.",action:"Drink 10–12 glasses water, eat cherries daily, eliminate red meat/beer/organ meats. Doctor can prescribe allopurinol."});
  if (tsh!==null&&(tsh<0.4||tsh>4.0)) conditions.push({name:"Thyroid Disorder",icon:"🦋",severity:"danger",summary:`Your TSH suggests thyroid is ${tsh<0.4?"overactive (hyperthyroidism)":"underactive (hypothyroidism)"}. Thyroid problems affect metabolism, weight, energy, mood, hair, and heart rate.`,action:"See a doctor (endocrinologist) for T3/T4 tests and treatment. Hypothyroidism is very treatable with daily levothyroxine medication."});
  if (vitd&&vitd<20) conditions.push({name:"Vitamin D Deficiency",icon:"☀️",severity:"warning",summary:"Severe Vitamin D deficiency weakens bones, suppresses immunity, causes fatigue and muscle pain.",action:"Get 20 min sunlight daily (10am–2pm). Take Vitamin D3 supplement 1000–2000 IU/day. Retest in 3 months."});
  if ((na&&(na<136||na>145))||(k&&(k<3.5||k>5.0))||(ca&&(ca<8.5||ca>10.5))) conditions.push({name:"Electrolyte Imbalance",icon:"⚡",severity:"warning",summary:"Abnormal sodium, potassium, or calcium levels can cause heart rhythm disturbances, muscle cramps, weakness, and nerve problems.",action:"Eat varied fresh fruits, vegetables, and dairy. See doctor if palpitations, cramps, or confusion occur."});
  if (wbc&&wbc>11000) conditions.push({name:"Active Infection / Inflammation",icon:"🦠",severity:"danger",summary:"High WBC count means your immune system is fighting an active infection or inflammation.",action:"See a doctor to identify the source. Rest, hydrate well, complete any antibiotic course as prescribed."});
  if ((wbc&&wbc<4000)||(vitd&&vitd<20)) conditions.push({name:"Weakened Immunity",icon:"🛡️",severity:"warning",summary:"Low WBC or Vitamin D indicates a weakened immune system. You may be more prone to frequent infections and slow recovery.",action:"Eat immune-boosting foods: garlic, berries, citrus, zinc-rich seeds. Get sunlight. Reduce stress. Improve sleep quality."});
  if (plt&&plt<150000) conditions.push({name:"Blood Clotting Issues",icon:"🩹",severity:"danger",summary:"Low platelet count means blood cannot clot properly. Even minor injuries may cause prolonged bleeding or easy bruising.",action:"Avoid aspirin and NSAIDs. Eat papaya leaf extract and kiwi. See doctor immediately."});
  if ((ca&&ca<8.5)&&(vitd&&vitd<20)) conditions.push({name:"Osteoporosis Risk",icon:"💀",severity:"danger",summary:"Both calcium and Vitamin D are low — double risk for bone loss, fractures, and osteoporosis.",action:"Start Vitamin D3 supplement, increase dairy and sesame seeds, get daily sunlight. Bone density scan (DEXA) recommended."});
  else if ((ca&&ca<8.5)||(vitd&&vitd<20)) conditions.push({name:"Bone Health Concern",icon:"🦴",severity:"warning",summary:"Low calcium or Vitamin D risks weakening bones over time. Early action prevents osteoporosis.",action:"Increase calcium-rich foods (dairy, sesame), get daily sunlight, and consider Vitamin D supplement."});

  return conditions;
}

function generateSummary(results) {
  const total=Object.keys(results).length;
  const danger=Object.values(results).filter(r=>r.color==="danger").length;
  const warning=Object.values(results).filter(r=>r.color==="warning").length;
  const normal=Object.values(results).filter(r=>r.color==="success").length;
  let overall,overallColor;
  if (danger>=3){overall="Your report shows multiple serious health concerns that require prompt medical attention. Please see a doctor soon.";overallColor="danger";}
  else if (danger>=1){overall="Your report shows some important health markers that need attention and possibly medical care.";overallColor="warning";}
  else if (warning>=2){overall="Your report is mostly okay but has a few borderline values worth monitoring closely.";overallColor="warning";}
  else{overall="Your report looks generally healthy! Keep up your good habits to maintain this.";overallColor="success";}
  return {overall,overallColor,total,danger,warning,normal};
}

// ═══════════════════════════════════════════════════════════════════
//  HEART & BRAIN CONDITIONS DATABASE
// ═══════════════════════════════════════════════════════════════════

const HEART_CONDITIONS = {
  afib: {
    name: "Atrial Fibrillation (AFib)",
    icon: "💓",
    category: "heart",
    ecgFindings: "Irregularly irregular rhythm, absence of distinct P waves, fibrillatory baseline (350–600 bpm atrial rate), variable ventricular rate (60–160 bpm), narrow QRS complexes unless aberrant conduction.",
    realWorldData: "AFib affects 33 million people worldwide. It is the most common sustained cardiac arrhythmia. Annual stroke risk is 5x higher than normal. The CHADS2-VASc score determines stroke prevention strategy.",
    explanation: "Atrial fibrillation is a chaotic electrical activity in the upper chambers (atria) of the heart. Instead of a coordinated heartbeat, the atria quiver irregularly — this is why the pulse feels irregular. AFib itself is rarely immediately life-threatening, but it dramatically increases the risk of stroke because blood pools in the quivering atria and can form clots that travel to the brain.",
    symptoms: ["💓 Irregular, rapid, or fluttering heartbeat (palpitations)","😮‍💨 Shortness of breath, especially during activity","😴 Fatigue and reduced exercise tolerance","😵 Dizziness or lightheadedness","💢 Chest discomfort or pressure","🧠 Stroke symptoms (if clot forms — emergency!)"],
    riskFactors: ["🫀 High blood pressure (most common cause)","❤️ Heart disease or prior heart attack","🫁 Heart failure","🍺 Excessive alcohol (holiday heart syndrome)","🦋 Thyroid problems (hyperthyroidism)","😴 Sleep apnea","☕ Stimulants: caffeine, energy drinks"],
    treatment: ["💊 Rate control medication (beta-blockers, digoxin)","💊 Blood thinners (anticoagulants) to prevent stroke","⚡ Electrical cardioversion to restore normal rhythm","🔌 Catheter ablation — permanent cure in many cases","🩺 Regular cardiology follow-up"],
    lifestyle: ["🧘 Stress reduction — stress triggers AFib episodes","☕ Limit caffeine and alcohol","😴 Treat sleep apnea — major AFib trigger","🏃 Regular moderate exercise (not excessive)","🧂 Low-salt diet for blood pressure control","🚬 Stop smoking completely","💧 Stay well hydrated"],
    severity: "danger"
  },
  heartAttack: {
    name: "Myocardial Infarction (Heart Attack)",
    icon: "🚨",
    category: "heart",
    ecgFindings: "ST elevation in ≥2 contiguous leads (STEMI), or ST depression/T-wave inversion (NSTEMI), pathological Q waves (>40ms wide, >25% of QRS height), reciprocal ST depression in opposite leads.",
    realWorldData: "Heart attack kills 17.9 million people annually worldwide (WHO, 2023). In India, 28% of deaths are from cardiovascular disease. Average age of first heart attack in Indian men is 53 years — younger than global average of 65.",
    explanation: "A myocardial infarction occurs when a blood clot completely or partially blocks a coronary artery, cutting off blood supply to part of the heart muscle. The longer the blockage lasts, the more heart muscle dies. This is a medical emergency — every minute counts. Prompt treatment (within 90 minutes) can save the heart muscle.",
    symptoms: ["💢 Crushing chest pain — like an elephant sitting on chest","🫁 Pain radiating to left arm, jaw, neck, or back","😰 Profuse sweating (cold sweat)","🤢 Nausea and vomiting","😮‍💨 Severe shortness of breath","😵 Extreme fatigue, sense of impending doom","⚠️ Women may have atypical symptoms: fatigue, jaw pain, indigestion"],
    riskFactors: ["🩸 High cholesterol (LDL >130)","🍬 Diabetes","🫀 High blood pressure","🚬 Smoking — doubles risk","🛋️ Physical inactivity","⚖️ Obesity","👨‍👩‍👦 Family history of early heart disease"],
    treatment: ["🚑 CALL 999/112 IMMEDIATELY — do not drive yourself","💊 Aspirin 325mg to chew immediately (if not allergic)","⚡ Angioplasty (PCI) — opens blocked artery with stent","🔌 Thrombolysis — clot-busting medication if PCI unavailable","💊 Long-term: aspirin, statins, beta-blockers, ACE inhibitors"],
    lifestyle: ["🚬 Stop smoking — reduces risk by 50% within 1 year","🏃 Cardiac rehabilitation — supervised exercise program","🥗 Mediterranean diet: fish, vegetables, olive oil, nuts","🧂 Strict low-sodium diet","🍭 No sugar or refined carbs","😴 7–8 hours quality sleep","🧘 Stress management — type A personality is a risk factor"],
    severity: "danger"
  },
  heartFailure: {
    name: "Congestive Heart Failure (CHF)",
    icon: "🫀",
    category: "heart",
    ecgFindings: "Left ventricular hypertrophy (LVH): tall R waves in V5-V6, deep S waves in V1-V2, QRS >11mm sum. Bundle branch blocks, tachycardia, signs of prior MI (Q waves), T-wave changes.",
    realWorldData: "Heart failure affects 64 million people worldwide. 5-year mortality is 50% — worse than most cancers. In India, ischemic heart disease and hypertension are the leading causes. Average age at diagnosis: 60 years.",
    explanation: "Congestive heart failure (CHF) means the heart muscle has become too weak or stiff to pump enough blood to meet the body's needs. As a result, fluid backs up into the lungs (causing breathlessness) and legs (causing swelling). It is a chronic condition that can be managed but not usually cured. The heart is still beating — it is just not pumping efficiently.",
    symptoms: ["😮‍💨 Shortness of breath — especially when lying flat or at night","🦵 Swollen legs, ankles, and feet (pitting edema)","😴 Extreme fatigue — exhausted by minimal activity","💨 Persistent cough or wheezing (pink frothy sputum)","⚖️ Rapid weight gain (fluid retention — 2kg in 2 days)","💓 Rapid or irregular heartbeat","🤢 Nausea, loss of appetite, bloating"],
    riskFactors: ["🫀 Coronary artery disease and prior heart attack","🩸 High blood pressure (longstanding, uncontrolled)","🍬 Diabetes","🦋 Valve disease","🧬 Cardiomyopathy (heart muscle disease)","🍺 Alcohol — toxic to heart muscle","🦠 Viral myocarditis"],
    treatment: ["💊 ACE inhibitors/ARBs — reduce heart workload","💊 Beta-blockers — slow heart, reduce death risk","💊 Diuretics (water pills) — remove excess fluid","💊 Aldosterone antagonists (spironolactone)","🔌 ICD/CRT device — pacemaker for severe cases","❤️ Heart transplant — last resort for end-stage HF"],
    lifestyle: ["🧂 Strict fluid restriction — <1.5L water/day if severe","🧂 Very low sodium diet — <2g/day","⚖️ Weigh yourself every morning — >2kg gain = call doctor","💊 Take ALL medications exactly as prescribed — never skip","😴 Sleep at 30-45° angle if breathless at night — 2 pillows","🚫 No alcohol — even small amounts worsen heart failure","🏃 Very gentle exercise as tolerated — cardiac rehab"],
    severity: "danger"
  },
  angina: {
    name: "Angina Pectoris",
    icon: "💔",
    category: "heart",
    ecgFindings: "Often normal at rest. During pain: ST depression (horizontal or downsloping), T-wave inversion in lateral leads (V4-V6, I, aVL). Exercise stress test shows ST changes. Prinzmetal's angina shows transient ST elevation.",
    realWorldData: "Angina affects over 112 million people worldwide. In India, prevalence is 4-6% in adults. Unstable angina carries 30-day mortality of 5-10%. Stable angina is reversible with treatment — 90% of cases improve significantly.",
    explanation: "Angina is chest pain or discomfort that occurs when part of your heart muscle doesn't get enough oxygenated blood. It is a warning signal that the arteries supplying the heart are narrowed (but not completely blocked). Stable angina occurs predictably during exertion and goes away with rest. Unstable angina occurs at rest and is an emergency — it can progress to a heart attack.",
    symptoms: ["💢 Chest pain/pressure/tightness during exertion","🏃 Pain triggered by walking, climbing stairs, or emotional stress","😌 Pain goes away within 5–10 minutes with rest (stable angina)","🫁 Pain accompanied by shortness of breath","💦 Sweating during episodes","⚠️ Unstable angina: pain at rest, lasting >20 min = EMERGENCY"],
    riskFactors: ["🩸 High cholesterol","🩸 High blood pressure","🍬 Diabetes","🚬 Smoking — major modifiable risk factor","⚖️ Obesity","🛋️ Sedentary lifestyle","😰 Stress and anxiety"],
    treatment: ["💊 Nitroglycerine (GTN spray/tablet) — immediate relief during episode","💊 Long-acting nitrates for prevention","💊 Aspirin + statins + beta-blockers","🔌 Angioplasty with stent — opens narrowed arteries","🔪 Bypass surgery (CABG) for severe multi-vessel disease"],
    lifestyle: ["🚬 Stop smoking — single most effective intervention","🥗 Heart-healthy diet: oats, fish, vegetables, olive oil, nuts","🏃 Gradual regular exercise — do NOT push through pain","🧂 Low salt diet","🍭 No processed sugar","😴 Manage stress — meditation, yoga","🌡️ Avoid extreme cold or heat — triggers attacks"],
    severity: "warning"
  },
  bradycardia: {
    name: "Bradycardia (Slow Heart Rate)",
    icon: "🐢",
    category: "heart",
    ecgFindings: "Heart rate < 60 bpm. Regular or irregular P waves depending on cause. Sinus bradycardia: P before every QRS, normal morphology. Heart block (1st degree): prolonged PR >200ms. 2nd degree: intermittent dropped beats. 3rd degree (complete): P and QRS dissociated.",
    realWorldData: "Sinus bradycardia is normal in athletes (rate 40–60 bpm). Symptomatic bradycardia due to heart disease requires pacemaker in 600,000+ patients/year globally. Complete heart block (3rd degree) carries mortality of 50% without pacemaker.",
    explanation: "Bradycardia means the heart is beating slower than normal (less than 60 beats per minute). In athletes, a slow heart rate is perfectly normal and healthy — the heart is efficient. But in other people, it can mean the heart's electrical system is damaged (sick sinus syndrome or heart block). The danger is if the heart beats so slowly that not enough blood reaches the brain — causing fainting, or worse.",
    symptoms: ["😵 Fainting or near-fainting (syncope)","😴 Extreme fatigue and weakness","😮‍💨 Shortness of breath","💓 Slow, irregular pulse you can feel","🤔 Difficulty concentrating — brain not getting enough blood","😰 Dizziness, especially when standing up"],
    riskFactors: ["🏋️ Athletic training — normal benign bradycardia","🫀 Aging — SA node degenerates with age","🫀 Prior heart attack damaging conduction system","🦋 Hypothyroidism — slows heart","💊 Medications: beta-blockers, digoxin, calcium channel blockers","😴 Severe sleep apnea"],
    treatment: ["🏋️ If athletic bradycardia with no symptoms — no treatment needed","💊 Review and adjust medications causing bradycardia","🔌 Pacemaker implant — gold standard for symptomatic bradycardia","💊 Atropine — emergency IV drug to speed heart rate acutely","🦋 Treat hypothyroidism if present"],
    lifestyle: ["⏱️ Check pulse regularly if diagnosed","💊 Never stop beta-blockers suddenly — can cause rebound tachycardia","😴 Treat sleep apnea — causes nighttime bradycardia","🏃 Regular mild exercise as cardiologist advises","🚫 Avoid medications that slow heart without doctor's guidance"],
    severity: "warning"
  },
  tachycardia: {
    name: "Tachycardia (Fast Heart Rate / SVT)",
    icon: "⚡",
    category: "heart",
    ecgFindings: "Heart rate >100 bpm. SVT: rate 150–250 bpm, narrow QRS (<120ms), P waves may be hidden in QRS or T waves. VT: rate 100–250 bpm, wide bizarre QRS (>120ms), AV dissociation. VF: chaotic baseline — cardiac arrest.",
    realWorldData: "SVT affects 2.29 per 1000 persons. VT/VF causes 50% of sudden cardiac deaths (300,000 annually in USA). Adenosine terminates 90% of SVT episodes. ICD (implantable defibrillator) reduces sudden death in VT by 50%.",
    explanation: "Tachycardia means the heart is beating too fast at rest (over 100 beats per minute). There are many types: supraventricular tachycardia (SVT) starts above the ventricles — usually episodic and rarely life-threatening. Ventricular tachycardia (VT) is more serious and can degenerate into ventricular fibrillation (VF) — a cardiac arrest. The type determines the urgency.",
    symptoms: ["💓 Sudden onset racing heartbeat — feels like pounding in chest","😵 Dizziness or lightheadedness","😮‍💨 Shortness of breath","💢 Chest tightness or discomfort","😰 Anxiety and sense of doom","🤢 Nausea during episodes","😌 Sudden termination (SVT stops abruptly)"],
    riskFactors: ["☕ Excessive caffeine or energy drinks","🍺 Alcohol","🚬 Smoking","😰 Anxiety and panic attacks","🫀 Heart disease or cardiomyopathy","🦋 Thyroid disorders","💊 Stimulant medications"],
    treatment: ["💊 Vagal maneuvers for SVT: Valsalva (bear down), cold water on face","💊 Adenosine IV — terminates SVT immediately","💊 Beta-blockers or calcium channel blockers — prevention","🔌 Catheter ablation — permanent cure for SVT (95% success)","🔌 ICD implant for ventricular tachycardia"],
    lifestyle: ["☕ Eliminate caffeine — coffee, tea, energy drinks, cola","🍺 Stop alcohol — major trigger","🚬 Stop smoking","😴 Prioritize sleep — fatigue triggers episodes","🧘 Stress management: yoga, meditation, deep breathing","💧 Stay well hydrated — dehydration triggers SVT","📱 Track episodes with a smartwatch/Holter monitor"],
    severity: "warning"
  },
  lvh: {
    name: "Left Ventricular Hypertrophy (LVH)",
    icon: "💪",
    category: "heart",
    ecgFindings: "Sokolow-Lyon criteria: S in V1 + R in V5 or V6 > 35mm. Cornell criteria: R in aVL + S in V3 > 28mm (men) or >20mm (women). ST-T strain pattern: ST depression and T-wave inversion in V5-V6, I, aVL (lateral leads).",
    realWorldData: "LVH is present in 15–20% of hypertensive patients. It is an independent risk factor for heart failure, sudden death, and stroke. Echo-detected LVH confers 3x higher cardiovascular risk than ECG-detected LVH. Regression of LVH with BP control reduces death by 30%.",
    explanation: "Left ventricular hypertrophy means the main pumping chamber of the heart (left ventricle) has become abnormally thick. This usually develops because the heart has been working against high resistance — most commonly from untreated high blood pressure. A thicker wall does not mean a stronger heart — it actually becomes stiffer and less efficient, and raises risk of heart failure, heart attack, and sudden death.",
    symptoms: ["😮‍💨 Shortness of breath on exertion","💢 Chest pain or discomfort","💓 Heart palpitations","😵 Dizziness or fainting","😴 Fatigue and reduced exercise tolerance","⚠️ Often NO symptoms until complications develop"],
    riskFactors: ["🩸 Long-standing high blood pressure — most common cause","🫀 Aortic valve stenosis (narrowed valve)","⚖️ Obesity","🍬 Diabetes","😴 Sleep apnea — repeated nocturnal hypertension","🏋️ Extreme athletic training (athlete's heart — benign)"],
    treatment: ["💊 Strict blood pressure control — ACE inhibitors/ARBs most effective at reversing LVH","💊 Amlodipine (calcium channel blocker)","🫀 Treat underlying valve disease if present","😴 CPAP for sleep apnea","📊 Regular echo/ECG monitoring every 6-12 months"],
    lifestyle: ["🧂 Strict low-sodium diet — <2g/day — single most important change","💊 Take blood pressure medication every day without fail","⚖️ Lose weight — every 10kg loss reduces BP by 5-10mmHg","🏃 Aerobic exercise 150 min/week — walking, swimming","😴 Treat sleep apnea","🚬 Stop smoking","🍺 Limit alcohol","😰 Stress management"],
    severity: "warning"
  },
  qrsProlongation: {
    name: "Bundle Branch Block / QRS Prolongation",
    icon: "🔌",
    category: "heart",
    ecgFindings: "LBBB: QRS ≥120ms, broad notched R wave in I, V5, V6; absence of septal Q waves; QS or rS in V1. RBBB: QRS ≥120ms, RSR' (rabbit ears) pattern in V1-V2, slurred S in I, V5-V6. RBBB often benign; LBBB more concerning — treat as STEMI equivalent in acute chest pain.",
    realWorldData: "LBBB occurs in 0.1-0.5% of general population. New LBBB with chest pain = call it a STEMI until proven otherwise (Sgarbossa criteria). RBBB is present in 2% of adults — often normal but can indicate pulmonary embolism or right heart disease.",
    explanation: "Bundle branch blocks occur when the electrical pathway that normally activates one side of the heart is blocked or delayed. The heart still beats but activation has to travel an indirect route, making the QRS wider. Left bundle branch block (LBBB) is more clinically significant — it can mask a heart attack and is associated with heart failure. Right bundle branch block (RBBB) is often found incidentally and may be completely normal.",
    symptoms: ["⚠️ Often completely asymptomatic — found incidentally on ECG","😵 Fainting or dizziness (if associated with heart disease)","😮‍💨 Shortness of breath","💓 Palpitations or slow heart rate","💢 Chest discomfort","🤔 May be first sign of underlying heart disease"],
    riskFactors: ["🫀 Heart disease — coronary artery disease, cardiomyopathy","🩸 High blood pressure","🫁 Pulmonary embolism (blood clot in lung — causes RBBB)","🫀 Congenital heart defects","🧬 Normal variant in older adults (degenerative)"],
    treatment: ["⚠️ LBBB with symptoms or new onset: urgent cardiac evaluation","🔌 Pacemaker if associated with symptomatic bradycardia","🔌 CRT (Cardiac Resynchronization Therapy) for LBBB + heart failure","💊 Treat underlying cause (BP, heart disease)","📊 Annual ECG and echo monitoring for LBBB"],
    lifestyle: ["💊 Take BP medication every day","🫀 Regular cardiology follow-up","🏃 Exercise as cardiologist advises","🧂 Low-salt diet","🚬 Stop smoking","🍺 Limit alcohol"],
    severity: "warning"
  },
  mitralRegurgitation: {
    name: "Mitral Valve Disease",
    icon: "🔄",
    category: "heart",
    ecgFindings: "Left atrial enlargement: P mitrale (broad notched P wave >120ms in II, biphasic P in V1). Left ventricular enlargement patterns. Atrial fibrillation is a common complication (absent P waves). Axis deviation.",
    realWorldData: "Mitral regurgitation is the most common valve disease — affecting 2.5% of US population. Severe MR doubles mortality at 5 years without treatment. Rheumatic fever (from untreated strep throat) is the leading cause in developing countries including India.",
    explanation: "Mitral valve disease (most commonly mitral regurgitation — leakage) means the mitral valve between the left atrium and left ventricle is not sealing properly. With each heartbeat, blood leaks backwards into the lungs instead of being pushed forward to the body. Over time, the heart enlarges to compensate. Once the heart starts to enlarge significantly, symptoms develop and surgery becomes necessary.",
    symptoms: ["😮‍💨 Shortness of breath — initially only with exertion, later at rest","😴 Fatigue and decreased exercise tolerance","💓 Heart palpitations (often atrial fibrillation)","🫁 Dry cough","🦵 Ankle swelling (late sign)","🔊 Heart murmur detected by doctor"],
    riskFactors: ["🦠 Rheumatic fever (post-streptococcal) — most common in India","🫀 Mitral valve prolapse","🫀 Prior heart attack affecting papillary muscles","🦠 Infective endocarditis (IV drug use, dental procedures)","🧬 Connective tissue disorders (Marfan syndrome)"],
    treatment: ["💊 Medical management: diuretics for fluid, beta-blockers","🔌 Treat AFib if present — anticoagulation important","🔪 Mitral valve repair — preferred over replacement","🔪 Mitral valve replacement (mechanical or bioprosthetic)","🔌 MitraClip — minimally invasive clip procedure for high-risk patients"],
    lifestyle: ["🦷 Strict dental hygiene and antibiotics before dental procedures — prevents endocarditis","🦠 Treat strep throat immediately — prevents rheumatic fever","💊 Take all medications exactly as prescribed","📊 Regular echo every 1–2 years to monitor valve progression","🏃 Moderate exercise as cardiologist advises","🧂 Low-salt diet if fluid retention is a problem"],
    severity: "warning"
  },
  acs: {
    name: "Acute Coronary Syndrome (Unstable Angina / NSTEMI)",
    icon: "⚠️",
    category: "heart",
    ecgFindings: "ST depression ≥0.5mm in ≥2 contiguous leads, T-wave inversion in relevant leads, normal ECG does NOT rule out ACS (30% of cases), dynamic ST changes are most diagnostic, compare with previous ECGs.",
    realWorldData: "ACS causes 7.4 million deaths/year globally. Troponin (blood test) is 99% sensitive for myocardial injury when done 3–6 hours after pain onset. GRACE score predicts 6-month mortality. Door-to-balloon time < 90 min saves 1 life per 100 patients treated.",
    explanation: "Acute coronary syndrome (ACS) is an umbrella term for conditions where coronary blood flow is suddenly reduced — including unstable angina and non-ST elevation MI (NSTEMI). Unlike a full STEMI, the artery is not completely blocked, but the blockage is dynamic and unstable, with risk of progressing to a complete heart attack at any moment. This is a hospital emergency.",
    symptoms: ["💢 Chest pain/pressure at rest — not going away with GTN","😰 Worsening or new angina with minimal exertion","😮‍💨 Sudden severe shortness of breath","💦 Cold sweat, nausea, pallor","🤢 Associated jaw, arm, or neck pain","⚠️ Diabetics may have NO chest pain — 'silent' ACS"],
    riskFactors: ["🚬 Smoking — most powerful modifiable risk factor","🩸 Poorly controlled blood pressure and cholesterol","🍬 Diabetes (silent ischemia is common)","⚖️ Obesity + sedentary lifestyle","👨‍👩‍👦 Family history of early coronary disease","😰 Extreme physical or emotional stress"],
    treatment: ["🚑 CALL 112/999 IMMEDIATELY","💊 Dual antiplatelet therapy: aspirin + ticagrelor/clopidogrel","💉 Low-molecular weight heparin (anticoagulant)","⚡ Urgent angiography within 2–24 hours","🔌 Angioplasty + stent (PCI) to open culprit artery","💊 Post-discharge: aspirin + statin + beta-blocker + ACE inhibitor"],
    lifestyle: ["🚬 Quit smoking immediately — 50% risk reduction","🥗 Strict heart-healthy diet from day 1 post-discharge","🏃 Cardiac rehabilitation: supervised exercise program","💊 100% medication compliance — non-adherence doubles re-admission","😰 Stress reduction: type A behaviour is a real risk factor","🍭 No sugar or trans fats","🧂 <2g sodium/day"],
    severity: "danger"
  }
};

const BRAIN_CONDITIONS = {
  stroke: {
    name: "Ischemic Stroke",
    icon: "🧠",
    category: "brain",
    ecgFindings: "Stroke can CAUSE ECG changes (not vice versa): diffuse deep T-wave inversions ('cerebral T waves'), QT prolongation, new atrial fibrillation (in 20% of stroke patients — both cause and consequence), U waves, sinus tachycardia from sympathetic activation.",
    realWorldData: "Stroke is the 2nd leading cause of death worldwide (5.5 million deaths/year). In India, incidence is 119–145 per 100,000/year — 1 Indian has a stroke every 40 seconds. 'Time is brain' — 1.9 million neurons die every minute of untreated stroke. thrombolysis within 4.5 hours doubles chance of good recovery.",
    explanation: "An ischemic stroke occurs when a blood clot blocks an artery supplying the brain, cutting off blood and oxygen to brain tissue. Brain cells start dying within minutes. The effect depends entirely on which part of the brain is affected — strokes can cause paralysis, speech problems, blindness, or memory loss. Immediate treatment (clot-busting drug or thrombectomy) can reverse damage if given within hours. FAST recognition saves lives.",
    symptoms: ["👁️ Sudden vision loss or double vision","🗣️ Sudden slurred speech or inability to speak (aphasia)","🦾 Sudden weakness or numbness — one side of face, arm, or leg","😵 Sudden severe headache — 'worst headache of my life'","🚶 Sudden loss of balance, coordination, dizziness","🤔 Sudden confusion, memory loss, or difficulty understanding","⚠️ FAST: Face drooping, Arm weakness, Speech difficulty, Time to call 112"],
    riskFactors: ["🩸 High blood pressure — #1 modifiable risk factor","💓 Atrial fibrillation — 5x stroke risk","🍬 Diabetes — 2x stroke risk","🩸 High cholesterol","🚬 Smoking","⚖️ Obesity","🛋️ Sedentary lifestyle","🍺 Heavy alcohol use"],
    treatment: ["🚑 CALL 112 IMMEDIATELY — stroke is a TIME-CRITICAL emergency","💉 IV tPA (alteplase) — clot-busting drug within 4.5 hours of symptom onset","🔌 Mechanical thrombectomy — catheter to remove clot, up to 24 hours","💊 Aspirin + statin after clot is treated","💊 Anticoagulants (warfarin/DOAC) if AFib-related stroke","🏥 Stroke unit care improves outcomes by 25%"],
    lifestyle: ["🩸 STRICT blood pressure control — target <130/80 mmHg","💓 Treat AFib with anticoagulation","🍬 Control diabetes rigorously","🚬 Stop smoking — 50% stroke risk reduction in 1 year","🏃 30 min aerobic exercise daily","🥗 DASH diet: rich in fruits, vegetables, whole grains, low salt","🧂 Strict low-sodium diet","🍺 Limit alcohol strictly","😴 Treat sleep apnea"],
    severity: "danger"
  },
  epilepsy: {
    name: "Epilepsy / Seizure Disorder",
    icon: "⚡",
    category: "brain",
    ecgFindings: "ECG during tonic-clonic seizure: muscle artifact obscures ECG. Post-ictal: sinus tachycardia (100–170 bpm), prolonged QT, transient ST changes. Critical: prolonged QT in epilepsy = risk of Sudden Unexpected Death in Epilepsy (SUDEP). Long QT syndrome can mimic seizures (cardiac syncope).",
    realWorldData: "Epilepsy affects 50 million people worldwide — 80% in low/middle income countries. India has 10–12 million people with epilepsy — largest absolute number globally. 70% of cases are well-controlled with medication. SUDEP (sudden unexpected death) occurs in 1:1000 epilepsy patients/year.",
    explanation: "Epilepsy is a neurological condition characterized by recurrent unprovoked seizures — sudden bursts of abnormal electrical activity in the brain. Seizures can range from brief staring spells (absence seizures) to full convulsions (tonic-clonic seizures). Most people with epilepsy live completely normal lives with medication. The main concerns are safety during a seizure, driving restrictions, and rare risk of SUDEP.",
    symptoms: ["🔌 Generalized tonic-clonic: stiffening then rhythmic jerking of all limbs","👁️ Absence seizures: blank staring, unresponsive for seconds (often missed)","🦾 Focal seizures: jerking of one limb, strange sensations","👁️ Visual or sensory aura before seizure (warning sign)","😴 Post-ictal confusion, fatigue, headache after seizure","🤔 Temporary memory loss, speech difficulty after complex focal seizure"],
    riskFactors: ["🧬 Family history of epilepsy","🧠 Prior brain injury, stroke, or brain tumor","🦠 Brain infections: meningitis, encephalitis","🍺 Alcohol withdrawal — classic trigger","😴 Sleep deprivation — major trigger","💊 Certain medications that lower seizure threshold","🩸 Low blood sugar or sodium (metabolic triggers)"],
    treatment: ["💊 Antiepileptic drugs (AEDs): sodium valproate, carbamazepine, levetiracetam, lamotrigine","⚠️ Never stop AED medication suddenly — causes rebound seizures","🔪 Epilepsy surgery — curative in 60% of focal cases","🔌 Vagal nerve stimulator (VNS) for drug-resistant cases","🌾 Ketogenic diet — high fat, very low carb — reduces seizures in children"],
    lifestyle: ["😴 Prioritize sleep — sleep deprivation is the #1 trigger","🍺 Zero alcohol — major seizure trigger","💊 Never miss medication — set daily alarms","🚗 Follow driving regulations — usually no driving for 1–2 seizure-free years","🚿 Shower instead of bath — drowning risk during seizure","🏊 Never swim alone","🧘 Stress management — emotional stress triggers seizures","📱 Seizure diary app to track triggers and frequency"],
    severity: "warning"
  },
  alzheimers: {
    name: "Alzheimer's Disease / Dementia",
    icon: "🧩",
    category: "brain",
    ecgFindings: "ECG is not a primary diagnostic tool for Alzheimer's. However: autonomic dysfunction is common — reduced heart rate variability (HRV), orthostatic hypotension on changing position, QT prolongation from antipsychotic medications. Research shows afib increases dementia risk by 40%.",
    realWorldData: "Alzheimer's affects 55 million people globally — expected to triple to 153 million by 2050. In India, 8.8 million people over 60 have dementia. Average survival after diagnosis: 4–8 years. Aducanumab (2021) and Lecanemab (2023) are the first disease-modifying drugs — reduce amyloid by 35%.",
    explanation: "Alzheimer's disease is the most common cause of dementia — a progressive brain disease where abnormal proteins (amyloid plaques and tau tangles) accumulate and kill nerve cells. Memory is usually affected first, then language, judgment, and finally physical functions. It is NOT a normal part of aging — it is a disease. There is currently no cure, but medications slow progression and lifestyle significantly reduces risk.",
    symptoms: ["🤔 Memory loss disrupting daily life — forgetting recent events, names, appointments","🔑 Misplacing items — putting them in illogical places","💬 Difficulty finding words or following conversations","🗓️ Losing track of dates, seasons, or time passage","🗺️ Getting lost in familiar places","😕 Changes in mood, personality, or behavior","🛒 Difficulty with familiar tasks: cooking, driving, finances"],
    riskFactors: ["👴 Age — risk doubles every 5 years after 65","🧬 APOE4 gene — 3-4x increased risk","👨‍👩‍👦 Family history (1st degree relative)","🧠 Low educational and cognitive activity","🩸 Cardiovascular risk factors: BP, diabetes, cholesterol","😴 Poor sleep — amyloid clears during sleep","😔 Social isolation and depression","🏋️ Physical inactivity"],
    treatment: ["💊 Cholinesterase inhibitors (donepezil, rivastigmine) — improve symptoms","💊 Memantine — for moderate to severe stages","💊 Lecanemab/aducanumab (anti-amyloid biologics) — slow progression","🧠 Cognitive stimulation therapy — preserves function longer","🤝 Caregiver support and respite care","🏥 Memory clinic evaluation and monitoring"],
    lifestyle: ["🏃 Exercise is the #1 proven brain protector — 150 min/week of aerobic exercise","🧠 'Use it or lose it' — learn new skills, read, do puzzles, learn a language","🫂 Social engagement — loneliness accelerates decline","😴 7–8 hours quality sleep — brain clears amyloid during sleep","🥗 MIND diet: berries, leafy greens, fish, olive oil, nuts, whole grains","🍺 Minimal alcohol — alcohol directly kills brain cells","🩸 Control blood pressure and diabetes — vascular health = brain health","🚬 Stop smoking"],
    severity: "warning"
  },
  parkinson: {
    name: "Parkinson's Disease",
    icon: "🤲",
    category: "brain",
    ecgFindings: "ECG changes in Parkinson's are indirect. Autonomic dysfunction (present in 70% of PD): orthostatic hypotension on standing (>20mmHg drop), reduced heart rate variability, parasympathetic denervation. Lewy bodies in cardiac ganglia cause cardiac autonomic neuropathy, detectable on MIBG scan.",
    realWorldData: "Parkinson's affects 10 million people globally — second most common neurodegenerative disease after Alzheimer's. In India, prevalence is 14–15 per 100,000. Average age at onset: 62 years. Young-onset PD (before 50) accounts for 5–10% of cases. Levodopa remains gold standard after 50 years.",
    explanation: "Parkinson's disease occurs when neurons in the substantia nigra region of the brain gradually die, reducing production of dopamine — the chemical that controls smooth, coordinated movement. The classic 'TRAP' symptoms — Tremor, Rigidity, Akinesia (slowness), and Postural instability — develop slowly over years. Parkinson's is not immediately life-threatening but progressively disabling. With treatment, most people maintain good quality of life for many years.",
    symptoms: ["🤲 Resting tremor — usually starts in one hand ('pill-rolling' motion)","🐌 Slowness of movement (bradykinesia) — shuffling gait, small handwriting","💪 Muscle rigidity — stiffness in arms, legs, or trunk","🧍 Stooped posture, balance problems, freezing of gait","🗣️ Soft, monotone voice (hypophonia)","😐 Reduced facial expression ('masked face')","💤 REM sleep behavior disorder — acting out dreams (early warning sign, years before motor symptoms)"],
    riskFactors: ["👴 Age — risk increases significantly after 60","🧬 Genetic mutations: LRRK2, PARK7, PINK1 (5-10% of cases)","☠️ Pesticide and herbicide exposure (farmers)","💊 Antipsychotic medications (drug-induced parkinsonism)","🫁 Air pollution — emerging evidence","🤕 Repeated head trauma"],
    treatment: ["💊 Levodopa/carbidopa — gold standard, most effective","💊 Dopamine agonists (ropinirole, pramipexole) — early disease or adjunct","🔌 Deep Brain Stimulation (DBS) — highly effective for motor symptoms","💊 MAO-B inhibitors (rasagiline, selegiline)","🏃 Exercise — neuroprotective and improves all motor symptoms","🎯 Speech, occupational, and physical therapy"],
    lifestyle: ["🏃 Exercise DAILY — boxing, cycling, tai chi, yoga — strongest neuroprotective effect","🎯 Physical therapy — gait training, balance exercises","🗣️ Speech therapy — LOUD voice exercises (LSVT LOUD program)","😴 Regular sleep — REM sleep disorder management","🥗 Mediterranean diet — associated with slower progression","☕ Interestingly, coffee consumption is associated with 30% lower Parkinson's risk","💊 Never suddenly stop medications — can cause neuroleptic malignant syndrome","🏠 Home safety modifications to prevent falls"],
    severity: "warning"
  },
  brainTumor: {
    name: "Brain Tumor Indicators",
    icon: "🔬",
    category: "brain",
    ecgFindings: "Increased intracranial pressure (ICP) causes Cushing's reflex: bradycardia + hypertension + irregular breathing. ECG may show: T-wave inversions, QT prolongation, arrhythmias from sympathetic storm. Temporal lobe tumors can cause seizures, which show ictal artifact on ECG.",
    realWorldData: "Primary brain tumors affect 308,000 people/year globally. Glioblastoma (GBM) is most malignant — median survival 15 months despite treatment. Meningiomas (benign) are most common — 90% 5-year survival. MRI with gadolinium is gold standard. In India, 40,000 new brain tumor cases/year.",
    explanation: "Brain tumors are abnormal growths of cells within the brain. They can be primary (originating in brain) or secondary/metastatic (spread from lung, breast, or skin cancer). Benign tumors grow slowly and can often be cured with surgery. Malignant gliomas grow aggressively and invade normal brain tissue. Symptoms depend entirely on tumor location — a small tumor in a critical area can cause more problems than a large tumor in a silent area.",
    symptoms: ["🤕 Progressive headache — worst in morning, awakens from sleep","🤢 Nausea and vomiting without nausea preceding (projectile vomiting)","🔌 New-onset seizures in an adult — ALWAYS needs brain MRI","👁️ Vision changes: blurring, double vision, visual field loss","😵 Personality or behavior changes","🦾 Progressive weakness of one side of body","🗣️ Speech difficulties or confusion","⚠️ Any progressive neurological deficit needs urgent MRI"],
    riskFactors: ["☢️ Ionizing radiation exposure (prior brain/head radiotherapy)","🧬 Neurofibromatosis, Li-Fraumeni syndrome","📱 Evidence for mobile phones is inconclusive (No proven link)","🦠 Prior EBV infection — associated with CNS lymphoma","🧬 Family history of brain tumor (rare)"],
    treatment: ["🔪 Surgical resection — primary treatment, extent of removal is prognostic","🔌 Radiotherapy — postoperative for malignant tumors","💊 Temozolomide chemotherapy — standard for GBM","💊 Bevacizumab (Avastin) — anti-angiogenic for recurrent GBM","🔬 Tumor treating fields (Optune device)","💊 Dexamethasone — steroid to reduce brain swelling"],
    lifestyle: ["💊 Take anti-seizure medications exactly as prescribed","🚗 No driving until seizure-free for prescribed period","😴 Adequate sleep — recovery and neuroplasticity","🏃 Gentle exercise as tolerated — improves mood and cognitive function","🧠 Cognitive rehabilitation for memory and concentration","🤝 Caregiver and family support — essential for quality of life","🍎 Nutritious balanced diet — no specific 'anti-tumor diet' proven","📱 Regular neurological follow-up and MRI surveillance"],
    severity: "danger"
  },
  migraines: {
    name: "Chronic Migraines",
    icon: "🌩️",
    category: "brain",
    ecgFindings: "During migraine attack: sinus tachycardia, ECG changes are rare. Triptan medications (sumatriptan) can cause vasospasm — patients with coronary disease should avoid. PFO (Patent Foramen Ovale) — hole in heart — is 3x more common in migraine with aura patients; closure reduces migraines in some cases.",
    realWorldData: "Migraines affect 1 billion people worldwide — 3rd most common disease globally. Women are 3x more affected than men. In India, 14% of population affected. Global economic burden: $232 billion/year. Migraine with aura doubles stroke risk in young women, especially smokers on oral contraceptives.",
    explanation: "Migraines are severe, disabling headaches involving neurological symptoms. They are caused by abnormal brain activity affecting nerve signals, chemicals, and blood vessels. The pathophysiology involves cortical spreading depression — a wave of electrical activity across the brain. Migraines are NOT 'just bad headaches' — they are a neurological disease. Effective prevention and acute treatments exist but are underutilized.",
    symptoms: ["🌩️ Moderate-severe throbbing/pulsating headache — usually one-sided","🤢 Nausea and vomiting","💡 Extreme light sensitivity (photophobia)","🔊 Sound sensitivity (phonophobia)","🌫️ Aura: visual zigzag lines, blind spots, flashing lights (30% of cases)","🖐️ Sensory aura: tingling or numbness in face/hand","🗣️ Speech difficulty during aura","😴 Post-drome: 'migraine hangover' — fatigue, brain fog for 24 hours"],
    riskFactors: ["🧬 Genetics — runs in families in 60-70% of cases","👩 Female sex — hormonal influence (menstrual migraines)","😰 Stress — most common trigger","😴 Sleep disruption — too much or too little","🍷 Red wine, aged cheese, processed meat (tyramine)","☕ Caffeine — both trigger and remedy","🌤️ Weather changes, bright lights, strong smells"],
    treatment: ["💊 Acute: triptans (sumatriptan) — most effective, abort attack within 2 hours","💊 Acute: NSAIDs (ibuprofen, naproxen) for milder attacks","💊 Prevention (if ≥4/month): topiramate, beta-blockers, amitriptyline","💉 CGRP inhibitors (erenumab, fremanezumab) — new highly effective monthly injections","💉 Botox injections — 15 minutes of injections, prevents 15+ migraines/month in chronic cases"],
    lifestyle: ["📱 Migraine diary — identify and avoid personal triggers","😴 Consistent sleep schedule — same bedtime/wake time every day","💧 Drink 2–3 litres water daily — dehydration is a major trigger","🏃 Regular aerobic exercise 3–5x/week — reduces frequency by 50%","🧘 Biofeedback and relaxation training — as effective as medication for prevention","😎 Sunglasses outdoors, blue-light blocking glasses for screens","🍷 Identify food triggers: alcohol, tyramine foods, caffeine","☕ Regular caffeine intake — sudden withdrawal triggers migraines"],
    severity: "warning"
  },
  multiplesclerosis: {
    name: "Multiple Sclerosis (MS)",
    icon: "🔗",
    category: "brain",
    ecgFindings: "MS itself does not directly cause ECG changes. However: autonomic dysfunction in MS causes heart rate variability changes, orthostatic hypotension. Uhthoff's phenomenon (symptom worsening with heat) can be confused with cardiac syncope. Certain MS medications (fingolimod, siponimod) cause first-dose bradycardia requiring ECG monitoring.",
    realWorldData: "MS affects 2.8 million people worldwide. Average age at diagnosis: 30 years — primarily affects young adults. Women are 3x more likely affected. In India, MS prevalence is rising — 8–15 per 100,000. Disease-modifying therapies have transformed MS — relapsing-remitting MS now has 90% chance of remaining ambulatory at 10 years.",
    explanation: "Multiple sclerosis is an autoimmune disease where the immune system attacks myelin — the protective coating around nerve fibers in the brain and spinal cord. Damage to myelin slows or blocks nerve signals. MS is unpredictable: some people have mild symptoms and never become disabled; others progress more rapidly. It is not directly hereditary but genetics plays a role. The most common form (RRMS) has relapses followed by recovery periods.",
    symptoms: ["🦾 Muscle weakness or paralysis — often one limb or one side","👁️ Optic neuritis: painful vision loss in one eye (classic first symptom)","🖐️ Numbness or tingling — face, arms, legs, or trunk","⚡ Lhermitte's sign: electric shock sensation on bending neck forward","😵 Balance problems, coordination difficulty","🚽 Bladder urgency or urinary incontinence","🧠 Cognitive changes: memory, concentration, processing speed","😴 Fatigue — profound, disproportionate to activity (most common symptom)"],
    riskFactors: ["🧬 HLA-DRB1 gene variant","👩 Female sex","🌍 Distance from equator — low Vitamin D exposure","🚬 Smoking — doubles MS risk","🦠 EBV (Epstein-Barr virus) infection — strong association","☀️ Vitamin D deficiency","⚖️ Obesity in adolescence"],
    treatment: ["💊 Beta-interferons (interferon beta-1a, 1b) — first line","💊 Glatiramer acetate","💊 Natalizumab, ocrelizumab — high-efficacy agents for aggressive MS","💊 Siponimod, cladribine — for progressive MS","🧪 Stem cell therapy (HSCT) — highly effective in young patients with active disease","🏃 Rehabilitation: physiotherapy, occupational therapy, speech therapy"],
    lifestyle: ["☀️ Vitamin D — very strong evidence for supplementation: 4000–5000 IU/day","🚬 Stop smoking — reduces conversion to progressive MS and relapse rate","🏃 Regular exercise — counterintuitive but does NOT worsen MS; reduces fatigue","🌡️ Avoid overheating — shower not hot bath, air conditioning in summer","🥗 Low saturated fat, anti-inflammatory diet (Swank diet)","😔 Treat depression — affects 50% of MS patients; worsens disability","🤝 MS support groups — peer support improves quality of life"],
    severity: "warning"
  },
  tia: {
    name: "Transient Ischemic Attack (TIA / Mini-Stroke)",
    icon: "⏱️",
    category: "brain",
    ecgFindings: "Same as stroke: new AFib is present in 15–20% of TIA patients. QT prolongation post-TIA. T-wave changes from autonomic disturbance. Critically: a normal ECG does NOT rule out cardiac embolism — 24-48 hour Holter monitoring is essential after TIA to detect paroxysmal AFib.",
    realWorldData: "TIA affects 200,000–500,000 Americans/year. 10–15% of TIA patients have a major stroke within 90 days — 50% within the first 48 hours. ABCD2 score predicts stroke risk after TIA. Urgent TIA clinic assessment within 24 hours reduces subsequent stroke by 80%. TIA is NOT 'nothing happened' — it is a serious warning.",
    explanation: "A transient ischemic attack (TIA) is like a stroke, except the blood clot dissolves on its own and symptoms resolve completely — usually within an hour. It used to be called a 'mini-stroke' but this minimizes its seriousness. A TIA is a MEDICAL EMERGENCY and a critical warning sign — the chance of having a full stroke in the next 48 hours is extremely high without immediate treatment. Every TIA patient needs same-day hospital evaluation.",
    symptoms: ["🦾 Sudden weakness or numbness — one side, resolves in <1 hour","🗣️ Sudden speech difficulty or slurring — resolves completely","👁️ Sudden vision loss in one eye (amaurosis fugax)","😵 Sudden dizziness or loss of balance","🤔 Sudden confusion — brief episode","⚠️ CRITICAL: Symptoms have COMPLETELY RESOLVED — this does NOT mean it was nothing!"],
    riskFactors: ["💓 Atrial fibrillation — clots form in heart and travel to brain","🩸 High blood pressure — most important risk factor","🩸 Carotid artery stenosis — narrowing in neck arteries","🍬 Diabetes","🚬 Smoking","🩸 High cholesterol","⚖️ Obesity"],
    treatment: ["🚑 CALL 112 IMMEDIATELY — even if symptoms have resolved","💊 Aspirin 300mg immediately on suspicion","💊 Dual antiplatelet therapy (aspirin + clopidogrel) for first 21 days","💊 Anticoagulation if AFib detected — DOAC (apixaban, rivaroxaban)","🔪 Carotid endarterectomy if carotid stenosis >70% is found","🩸 Aggressive risk factor management: BP, cholesterol, diabetes"],
    lifestyle: ["🩸 STRICT blood pressure control — target <130/80 every single day","🚬 Stop smoking immediately — 50% stroke risk reduction in 1 year","💊 Take antiplatelets and statins exactly as prescribed — NEVER skip","🍭 No sugar, no refined carbs","🧂 Very low salt diet","🏃 30 min aerobic exercise daily as tolerated","💓 Monitor for AFib: smartwatch with ECG, regular Holter monitoring"],
    severity: "danger"
  },
  meningitis: {
    name: "Meningitis / Encephalitis",
    icon: "🦠",
    category: "brain",
    ecgFindings: "Septic meningitis causes: sinus tachycardia (fever response), myocarditis from septicemia causing ST changes, QT prolongation from electrolyte disturbances, atrial and ventricular arrhythmias. DIC (disseminated intravascular coagulation) in severe bacterial meningitis can cause ischemic ECG changes.",
    realWorldData: "Bacterial meningitis kills 1 in 10 people who develop it despite treatment. 1 in 5 survivors have permanent disability (deafness, brain damage). Meningococcal disease can kill a healthy person within 24 hours. In India, 50% of cases are caused by N. meningitidis, H. influenzae, and S. pneumoniae. Vaccination reduces bacterial meningitis by 90%.",
    explanation: "Meningitis is inflammation of the membranes (meninges) surrounding the brain and spinal cord — caused by bacteria, viruses, or fungi. Bacterial meningitis is a life-threatening emergency — without treatment within hours, it can cause brain damage, deafness, loss of limbs (from septicemia), or death. Viral meningitis is much milder — most people recover fully. Encephalitis is inflammation of the brain itself — usually viral — and can cause seizures, confusion, and coma.",
    symptoms: ["🤕 Severe sudden headache — 'worst headache of my life'","🌡️ High fever with chills","🤢 Nausea and vomiting","🦮 Neck stiffness — cannot touch chin to chest","💡 Extreme light sensitivity (photophobia)","🔊 Sound sensitivity (phonophobia)","🔴 Non-blanching rash — purple/red spots = EMERGENCY (meningococcemia)","😵 Altered consciousness, confusion, seizures (encephalitis)","⚠️ In infants: bulging fontanelle, high-pitched cry, refusal to eat"],
    riskFactors: ["👶 Age — infants and young adults (college students)","🦠 Close contact with case (dormitories, military barracks)","🤧 Absent or damaged spleen (higher risk of pneumococcal meningitis)","💉 Immune deficiency: HIV, steroids, chemotherapy","🌍 Travel to meningitis belt (sub-Saharan Africa)","🦷 Untreated ear or sinus infection (direct spread)"],
    treatment: ["🚑 CALL 112 IMMEDIATELY if meningitis suspected","💉 IV antibiotics within 1 HOUR — every hour of delay increases death/disability","💉 Ceftriaxone + dexamethasone — standard regimen","💉 Acyclovir for viral encephalitis (herpes)","🏥 ICU care for severe cases","💉 Prevention: MenACWY, MenB, PCV13, Hib vaccines"],
    lifestyle: ["💉 GET VACCINATED — meningococcal vaccine for teenagers and college students","💊 Complete full antibiotic course","🤸 Long rehabilitation period — physiotherapy, speech therapy, hearing aids if needed","🧠 Neuropsychological support for cognitive effects","👁️ Regular audiology follow-up — deafness is most common complication","🤝 Support groups for survivors and families"],
    severity: "danger"
  }
};

// ═══════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════

// Blood analysis
app.post("/analyze", (req, res) => {
  const body = req.body;
  const analyzers = {
    hemoglobin:    analyzeHemoglobin,
    glucose:       analyzeGlucose,
    cholesterol:   analyzeCholesterol,
    ldl:           analyzeLDL,
    hdl:           analyzeHDL,
    triglycerides: analyzeTriglycerides,
    bun:           analyzeBUN,
    creatinine:    analyzeCreatinine,
    uricAcid:      analyzeUricAcid,
    sodium:        analyzeSodium,
    potassium:     analyzePotassium,
    calcium:       analyzeCalcium,
    vitaminD:      analyzeVitaminD,
    wbc:           analyzeWBC,
    rbc:           analyzeRBC,
    platelets:     analyzePlatelets,
    tsh:           analyzeTSH,
  };

  const results = {};
  const provided = [], missing = [];

  for (const [key, fn] of Object.entries(analyzers)) {
    const raw = body[key];
    if (raw !== undefined && raw !== null && raw !== "") {
      const result = fn(raw);
      if (result) { results[key] = result; provided.push(key); }
      else missing.push(key);
    } else {
      missing.push(key);
    }
  }

  if (provided.length === 0) return res.status(400).json({ error: "Please provide at least one value." });

  const conditions = detectConditions(body, results);
  const summary    = generateSummary(results);

  return res.json({ success: true, results, conditions, summary, provided, missing });
});

// Heart & Brain analysis — returns condition data by keywords from OCR text
app.post("/analyze-hb", (req, res) => {
  const { text, type } = req.body; // type = "heart" | "brain"
  if (!text) return res.status(400).json({ error: "No text provided." });

  const t = (text || "").toLowerCase();
  const db = type === "brain" ? BRAIN_CONDITIONS : HEART_CONDITIONS;
  const detected = [];
  const all = [];

  // Keyword matching per condition
  const keywords = {
    // Heart
    afib:             ["atrial fibrillation","afib","a.fib","irregularly irregular","fibrillatory","absent p wave","no p wave"],
    heartAttack:      ["myocardial infarction","heart attack","mi ","stemi","nstemi","st elevation","st-elevation","q wave","infarction"],
    heartFailure:     ["heart failure","chf","congestive","pulmonary edema","cardiomegaly","ejection fraction","lvef","reduced ef"],
    angina:           ["angina","chest pain","stable angina","unstable angina","ischemia","ischaemia","stress test","exercise ecg"],
    bradycardia:      ["bradycardia","slow heart","heart rate 3","heart rate 4","heart rate 5","hr 3","hr 4","hr 5","heart block","sa node","sinus bradycardia"],
    tachycardia:      ["tachycardia","svt","supraventricular","ventricular tachycardia","vt ","rapid heart","palpitations","fast heart"],
    lvh:              ["left ventricular hypertrophy","lvh","ventricular hypertrophy","sokolow","cornell","voltage criteria","strain pattern"],
    qrsProlongation:  ["bundle branch","lbbb","rbbb","qrs prolongation","wide qrs","block"],
    mitralRegurgitation:["mitral","valve","regurgitation","prolapse","stenosis","murmur","rheumatic"],
    acs:              ["acute coronary","acs","nstemi","unstable angina","troponin","st depression","t wave inversion"],
    // Brain
    stroke:           ["stroke","ischemic stroke","cerebrovascular","infarct","mri brain","ct head","diffusion weighted","dwi","tpa","thrombolysis"],
    epilepsy:         ["epilepsy","seizure","eeg","convulsion","tonic clonic","absence","anticonvulsant","sodium valproate","carbamazepine","levetiracetam"],
    alzheimers:       ["alzheimer","dementia","cognitive decline","memory loss","mmse","moca","amyloid","tau","cholinesterase","donepezil"],
    parkinson:        ["parkinson","tremor","bradykinesia","rigidity","substantia nigra","dopamine","levodopa","dbs","deep brain"],
    brainTumor:       ["brain tumor","brain tumour","glioma","glioblastoma","meningioma","mass lesion","space occupying","soh","brain mri","gadolinium","radiation","radiotherapy"],
    migraines:        ["migraine","headache","aura","photophobia","sumatriptan","triptan","cgrp","botox","topiramate"],
    multiplesclerosis:["multiple sclerosis","ms ","demyelination","white matter","optic neuritis","lhermitte","interferon","natalizumab","mri spine"],
    tia:              ["tia","transient ischemic","mini stroke","amaurosis","fugax","carotid","abcd2"],
    meningitis:       ["meningitis","encephalitis","meningococcal","bacterial meningitis","ceftriaxone","csf","lumbar puncture","kernig","brudzinski"],
  };

  // Detect matches
  for (const [key, cond] of Object.entries(db)) {
    const kws = keywords[key] || [];
    const matched = kws.some(kw => t.includes(kw));
    const condData = {
      key,
      ...cond,
      detected: matched,
    };
    all.push(condData);
    if (matched) detected.push(condData);
  }

  // If nothing detected, return all conditions (user manually browsing)
  const toReturn = detected.length > 0 ? detected : all;

  return res.json({
    success: true,
    detected: detected.length > 0,
    detectedCount: detected.length,
    conditions: toReturn,
    allConditions: all,
    ocrText: text.substring(0, 500),
  });
});

// Get all heart OR brain conditions (for browsing)
app.get("/conditions/:type", (req, res) => {
  const type = req.params.type;
  const db = type === "brain" ? BRAIN_CONDITIONS : HEART_CONDITIONS;
  return res.json({ success: true, conditions: Object.values(db) });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`\n✅ HealthLens AI v3 → http://localhost:${PORT}\n`));