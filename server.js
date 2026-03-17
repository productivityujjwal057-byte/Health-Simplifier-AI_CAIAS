/**
 * HealthLens AI — Full Edition Server
 * 17 Parameters + Condition Detection + Detailed Advice
 */

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ══════════════════════════════════════════════════════════
// PARAMETER ANALYZERS
// ══════════════════════════════════════════════════════════

function analyzeHemoglobin(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 8) {
    status = "Severely Low"; color = "danger";
    explanation = "Your hemoglobin is very severely low — this is severe anemia. Your blood cannot carry enough oxygen. You may feel extremely exhausted, breathless even at rest, dizzy, and very pale. This is a medical emergency. A doctor may recommend iron injections or a blood transfusion.";
    consume = ["🏥 See a doctor immediately","🥩 Liver, red meat, chicken","🫘 Lentils, rajma, chickpeas","🌿 Spinach, drumstick leaves, methi","🍊 Amla, oranges — Vitamin C helps iron absorb better","🥚 2 eggs daily","💊 Iron + Folic acid supplements as prescribed"];
    avoid   = ["☕ Tea/coffee within 1 hour of meals","🥛 Excess dairy with iron-rich meals","🍺 Alcohol","🚬 Smoking"];
  } else if (val < 12) {
    status = "Low (Anemia)"; color = "danger";
    explanation = "Your hemoglobin is below normal — this is anemia. Your blood is not carrying enough oxygen. You may feel tired, weak, breathless, and have pale skin. Very common, especially in women and children. Treatable with diet and supplements.";
    consume = ["🥩 Red meat, chicken, fish 3x/week","🫘 Dal, rajma, chana daily","🌿 Palak, methi, drumstick leaves","🥕 Beetroot juice","🍊 Vitamin C food with every iron-rich meal","🥚 2 eggs daily","💊 Iron supplement — consult doctor"];
    avoid   = ["☕ Tea/coffee immediately after meals","🥛 Milk with iron foods","🍺 Alcohol","🚬 Smoking"];
  } else if (val <= 17.5) {
    status = "Normal"; color = "success";
    explanation = "Your hemoglobin is in the healthy range. Your blood is carrying oxygen well throughout your body. You do not have anemia. Maintain your balanced diet.";
    consume = ["🥗 Continue balanced diet","🍎 Fresh fruits and vegetables","💧 8–10 glasses water daily","🫘 Pulses and leafy greens regularly"];
    avoid   = ["🍺 Excessive alcohol","🚬 Smoking","🍔 Processed junk food"];
  } else {
    status = "High (Polycythemia Risk)"; color = "warning";
    explanation = "Your hemoglobin is above normal. This makes blood thicker and harder to pump, raising risk of blood clots, stroke, and heart attack. Common causes: dehydration, smoking, or a bone marrow disorder. Please see a doctor.";
    consume = ["💧 10–12 glasses water daily","🍎 Fresh fruits and vegetables","🫐 Antioxidant-rich berries, pomegranate","🥦 Green vegetables"];
    avoid   = ["🚬 Smoking — top cause of high Hb","🍺 Alcohol","💊 Iron supplements without need","🥩 Excess red meat"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeGlucose(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 70) {
    status = "Low (Hypoglycemia)"; color = "warning";
    explanation = "Your blood sugar is too low — hypoglycemia. Symptoms: shaking, sweating, confusion, pounding heart. Eat something sweet immediately if symptomatic, then a proper meal. Common causes: skipping meals, over-exercise, or too much diabetes medication.";
    consume = ["🍬 Glucose tablet or sugar immediately if symptomatic","🍌 Banana or 4–5 dates","🧃 Fruit juice (100 ml)","🍚 Rice, roti, oats — complex carbs","🕐 Eat every 3–4 hours — never skip meals"];
    avoid   = ["⏩ Skipping meals especially breakfast","🏋️ Intense exercise on empty stomach","🍺 Alcohol on empty stomach","☕ Excess caffeine"];
  } else if (val <= 100) {
    status = "Normal (Fasting)"; color = "success";
    explanation = "Your fasting glucose is ideal. Your body is managing sugar well. You are not at risk for diabetes right now. Maintain your lifestyle to keep it that way.";
    consume = ["🥗 Vegetables, whole grains, pulses","🍎 Low-sugar fruits: apple, guava, papaya","💧 8 glasses water","🚶 30 min walk daily","🌾 Brown rice, oats, millets"];
    avoid   = ["🍭 Sweets and sugary drinks","🍟 Fried snacks","🍞 Refined carbs — white bread, biscuits, maida"];
  } else if (val <= 125) {
    status = "Prediabetes"; color = "warning";
    explanation = "Your glucose is in the prediabetes range — a serious warning sign. Without lifestyle changes, this can become Type 2 Diabetes within 5 years. With the right diet and 30 minutes of daily exercise, you can reverse it. Act NOW.";
    consume = ["🥦 Bitter gourd (karela), lauki, tinda, cucumber","🌾 Oats, barley, ragi, jowar","🫘 Moong dal, masoor dal","🥜 Handful of almonds before meals","🍋 Lemon water or methi water every morning","🚶 30–45 min brisk walk every day"];
    avoid   = ["🍚 Large white rice — switch to millets","🥤 Soft drinks, packaged juices, sweet chai","🍰 All sweets and pastries","🥐 Maida products","🛋️ Sitting for hours without movement"];
  } else {
    status = "High (Diabetic Range)"; color = "danger";
    explanation = "Your glucose is in the diabetic range. Your body cannot regulate blood sugar properly. Over time, high sugar silently damages kidneys, eyes, nerves, and heart. Please see a doctor immediately. With medication and strict diet, diabetes is very manageable.";
    consume = ["🥬 Karela — nature's insulin","🌿 Methi seeds soaked overnight — drink water in morning","🧅 Raw onion and garlic","🫘 Moong, masoor, chana — low glycemic","🍵 Cinnamon tea (no sugar), turmeric milk (no sugar)","🥒 Unlimited non-starchy vegetables","🚶 45 min walk daily — most important"];
    avoid   = ["🍚 White rice — switch to millets completely","🧃 ALL sugary drinks including fruit juice","🍰 All sweets, mithai, ice cream","🥐 All maida products","🥔 Potato, yam — very high glycemic","🍺 Alcohol","😴 Irregular sleep — directly raises blood sugar"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeCholesterol(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 150) {
    status = "Very Low"; color = "warning";
    explanation = "Unusually low cholesterol. Very low values can indicate malnutrition, liver disease, or hyperthyroidism. Consult a doctor.";
    consume = ["🥚 Eggs","🥑 Avocado","🌰 Nuts","🐟 Fatty fish","🥛 Whole dairy in moderation"];
    avoid   = ["🥗 Extreme fat-restriction diets","🍺 Alcohol"];
  } else if (val <= 200) {
    status = "Optimal"; color = "success";
    explanation = "Your total cholesterol is optimal — below 200 is ideal. This significantly reduces your risk of heart disease, heart attack, and stroke. Excellent result.";
    consume = ["🐟 Fish 2x/week","🥑 Olive oil for cooking","🌰 Walnuts, almonds daily","🫘 Oats and pulses","🍎 Apples, pears"];
    avoid   = ["🍟 Deep-fried foods","🥩 Excess red meat","🧀 Processed cheese","🚬 Smoking"];
  } else if (val <= 239) {
    status = "Borderline High"; color = "warning";
    explanation = "Your cholesterol is borderline high. Cholesterol deposits build slowly in arteries over years. Lifestyle changes now can prevent medication later.";
    consume = ["🌾 Oats every morning — proven cholesterol reducer","🐟 Salmon, mackerel, sardines","🌰 Walnuts or flaxseeds daily","🫘 Beans, lentils, chickpeas","🫚 Replace butter with olive oil","🧄 2 raw garlic cloves daily"];
    avoid   = ["🧈 Butter and ghee in excess","🍟 All fried snacks","🥩 Fatty meats","🍰 Pastries and bakery items","🚬 Smoking"];
  } else {
    status = "High (Heart Risk)"; color = "danger";
    explanation = "Your cholesterol is dangerously high. Fatty plaques are actively building up in your arteries, raising risk of heart attack and stroke. See a doctor immediately and start strict dietary changes today.";
    consume = ["🌾 Oatmeal every single morning","🐟 Omega-3 fish 3x/week","🧄 2–3 raw garlic cloves daily","🫘 All pulses and legumes","🍵 Green tea 2 cups/day","🥦 Cruciferous vegetables","🚶 45 min brisk walk daily"];
    avoid   = ["🍟 ALL fried food — completely banned","🧈 Butter, margarine, vanaspati — banned","🥩 Red meat and organ meats","🥛 Full-fat dairy — switch to skimmed","🍺 Alcohol","🚬 Smoking — STOP immediately"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeLDL(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 100) {
    status = "Optimal"; color = "success";
    explanation = "Your LDL (bad cholesterol) is at an optimal level. LDL sticks to artery walls and causes blockages. Below 100 is ideal and puts you at low risk for heart disease.";
    consume = ["🫘 Fiber-rich foods","🐟 Fatty fish weekly","🌰 Nuts and seeds","🥑 Healthy fats"];
    avoid   = ["🍟 Trans fats and fried food","🥩 Excess saturated fat from red meat"];
  } else if (val < 130) {
    status = "Near Optimal"; color = "success";
    explanation = "Your LDL is near optimal. A good level with a small room for improvement. More fiber and omega-3 foods will keep heart risk very low.";
    consume = ["🌾 Oats daily","🐟 Fish 2x/week","🌰 Walnuts and almonds","🫘 Beans and lentils"];
    avoid   = ["🍟 Fried foods","🧈 Excess butter/ghee"];
  } else if (val < 160) {
    status = "Borderline High"; color = "warning";
    explanation = "Your LDL is borderline high. LDL builds plaque in arteries. Actively reduce it through diet and exercise before medication is needed.";
    consume = ["🌾 Oatmeal every morning","🧄 Raw garlic daily","🫘 Lentils and beans","🌰 Ground flaxseeds","🐟 Fatty fish 2–3x/week"];
    avoid   = ["🧈 Ghee and butter","🥩 Red meat","🍰 Baked goods with trans fat","🍟 Fried snacks"];
  } else {
    status = "High"; color = "danger";
    explanation = "Your LDL is high — the primary driver of arterial plaque. This is a major heart attack and stroke risk factor. You need both strict diet changes and a doctor's evaluation for statin medication.";
    consume = ["🌾 Oats, barley, psyllium husk daily","🐟 Omega-3 fish 3x/week","🫘 All pulses","🧄 Raw garlic 2–3 cloves","🍵 Green tea","🌰 Walnuts"];
    avoid   = ["🍟 Complete ban on fried food","🧈 All saturated fats","🥩 Red meat and organ meats","🍺 Alcohol","🚬 Smoking"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeHDL(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 40) {
    status = "Low (Heart Risk)"; color = "danger";
    explanation = "Your HDL (good cholesterol) is too low. HDL removes bad cholesterol from arteries. Low HDL is a major independent risk factor for heart attack even if total cholesterol looks acceptable.";
    consume = ["🫚 Olive oil — best food to raise HDL","🐟 Fatty fish — omega-3 raises HDL","🥑 Avocado daily","🌰 Walnuts, almonds, pistachios","🫐 Berries — antioxidants support HDL","🚴 Aerobic exercise is #1 way to raise HDL"];
    avoid   = ["🚬 Smoking — biggest cause of low HDL","🍟 Trans fats completely","🛋️ Sedentary lifestyle","🍺 Excess alcohol","🍭 High-sugar foods — lower HDL"];
  } else if (val < 60) {
    status = "Acceptable"; color = "warning";
    explanation = "Your HDL is acceptable but not ideal. 60+ mg/dL is the protective level. Increase it through exercise and healthy fats.";
    consume = ["🫚 Olive oil for cooking","🐟 Fish 2–3x/week","🥑 Avocado","🌰 Mixed nuts daily","🚴 Daily aerobic exercise (most effective)"];
    avoid   = ["🚬 Smoking","🍟 Trans fats","🛋️ Prolonged sitting"];
  } else {
    status = "Protective Level"; color = "success";
    explanation = "Excellent! Your HDL is at 60+ mg/dL — the protective level that actually reduces overall heart disease risk. This is one of the best cholesterol results you can have.";
    consume = ["🥑 Continue healthy fat intake","🐟 Fish weekly","🌰 Nuts and seeds","🚴 Keep up aerobic exercise"];
    avoid   = ["🚬 Smoking — will rapidly lower HDL","🍟 Trans fats"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeTriglycerides(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 150) {
    status = "Normal"; color = "success";
    explanation = "Your triglycerides are normal. These are blood fats produced when you eat excess calories, especially from carbs and sugar. Normal levels mean fat metabolism is working properly.";
    consume = ["🫘 High-fiber diet","🐟 Fish regularly","💧 Stay well hydrated","🌰 Nuts in moderation"];
    avoid   = ["🍭 Excess sugar","🍺 Alcohol — rapidly raises TG","🍟 Fried foods"];
  } else if (val < 200) {
    status = "Borderline High"; color = "warning";
    explanation = "Borderline high triglycerides. Associated with fatty liver, metabolic syndrome, and heart disease. Primary causes: sugar, refined carbs, and alcohol. Diet changes work dramatically within weeks.";
    consume = ["🐟 Omega-3 fish 3x/week — most effective","🌰 Walnuts and flaxseeds","🫘 Beans and lentils","🥦 Vegetables over grains","💧 Water only — no sweetened drinks"];
    avoid   = ["🍭 ALL sweets — biggest TG raiser","🍺 Alcohol — even moderate amounts significantly raise TG","🍞 Refined carbs, white rice, maida","🥤 Packaged juices and soft drinks"];
  } else if (val < 500) {
    status = "High"; color = "danger";
    explanation = "Your triglycerides are high — significant risk for heart disease, fatty liver, and pancreatitis (painful pancreas inflammation). See a doctor for evaluation and possible medication.";
    consume = ["🐟 Fatty fish or omega-3 supplement daily","🌰 Ground flaxseeds in food","🥦 Non-starchy vegetables as main food","🌾 Millets — ragi, jowar, bajra","🚶 45 min exercise daily — essential"];
    avoid   = ["🍭 Zero sugar — eliminate completely","🍺 Absolute zero alcohol","🍚 White rice — switch to millets","🥐 All refined carbs","🧃 All fruit juices","🍟 All fried food"];
  } else {
    status = "Very High (Danger)"; color = "danger";
    explanation = "Extremely high triglycerides. Above 500 puts you at risk of acute pancreatitis — a very dangerous condition. See a doctor TODAY for urgent medication.";
    consume = ["🏥 See doctor today — medication needed","🐟 Omega-3 supplements (4g/day as prescribed)","🥦 Only non-starchy vegetables and lean protein","💧 Water only"];
    avoid   = ["🍭 Zero sugar completely","🍺 Zero alcohol completely","🍚 All refined carbohydrates","🍟 Zero fried food","🧃 Zero fruit juice"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeBUN(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 7) {
    status = "Low"; color = "warning";
    explanation = "BUN (Blood Urea Nitrogen) is lower than normal. Low BUN can indicate low protein intake, malnutrition, liver disease, or overhydration. Usually less serious than high BUN but worth monitoring.";
    consume = ["🥚 Eggs and lean protein","🥛 Milk and dairy","🫘 Pulses and legumes","🐟 Fish and chicken"];
    avoid   = ["🥗 Extreme low-protein diets","💧 Overdrinking plain water"];
  } else if (val <= 20) {
    status = "Normal"; color = "success";
    explanation = "Your BUN is normal — your kidneys are filtering waste products effectively. BUN is a key marker of kidney health, and normal results confirm your kidneys are working well.";
    consume = ["💧 8 glasses water daily","🥗 Balanced diet with moderate protein","🍎 Fresh fruits and vegetables"];
    avoid   = ["💊 NSAIDs/painkillers in excess","🍺 Alcohol","🥤 Dehydrating drinks"];
  } else {
    status = "High (Kidney Concern)"; color = "danger";
    explanation = "Elevated BUN suggests your kidneys may not be filtering waste efficiently. Can result from dehydration, high protein diet, kidney disease, or heart failure. Combined with high creatinine, this strongly indicates kidney problems. See a doctor promptly.";
    consume = ["💧 10–12 glasses water/day","🍎 Apple, pear (low potassium fruits)","🥒 Cucumber, lauki, tinda","🌾 Rice and wheat in moderation (low protein grains)"];
    avoid   = ["🥩 High-protein diet — strains kidneys","💊 Painkillers (ibuprofen, aspirin) — damage kidneys","🧂 Excess salt","🍺 Alcohol"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeCreatinine(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 0.6) {
    status = "Low"; color = "warning";
    explanation = "Creatinine is slightly low. Usually indicates low muscle mass or malnutrition. Less concerning than high creatinine but worth monitoring if combined with other abnormal values.";
    consume = ["🥩 Lean protein to build muscle","🥚 Eggs","🥛 Dairy","💪 Light resistance exercise"];
    avoid   = ["🥗 Very low protein diets"];
  } else if (val <= 1.2) {
    status = "Normal"; color = "success";
    explanation = "Your creatinine is normal — a good indicator that your kidneys are functioning well. Creatinine is a muscle waste product filtered by healthy kidneys. Normal levels confirm they are doing their job effectively.";
    consume = ["💧 Good hydration daily","🥗 Balanced diet","🍎 Fruits and vegetables"];
    avoid   = ["💊 Excess NSAIDs","🍺 Alcohol","🥩 Extreme protein overloading"];
  } else {
    status = "High (Kidney Strain)"; color = "danger";
    explanation = "Elevated creatinine is a warning that your kidneys are under stress. When kidneys are damaged, creatinine builds up in the blood. Combined with high BUN, this strongly indicates kidney disease. See a doctor — this is important.";
    consume = ["💧 10–12 glasses water daily","🍎 Apples, berries, grapes","🫐 Cranberries — support kidney health","🥒 Cucumber and lauki","🧅 Onion and garlic — kidney protective"];
    avoid   = ["🥩 Excess protein especially red meat","🧂 High salt","💊 Painkillers regularly — very damaging","🍺 Alcohol","☕ Excess caffeine"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeUricAcid(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 3.4) {
    status = "Low"; color = "warning";
    explanation = "Your uric acid is slightly low. Generally not dangerous. Rarely indicates certain conditions. Usually not a concern unless you have other abnormal values.";
    consume = ["🫘 Moderate purine foods are fine","🥗 Balanced diet"];
    avoid   = ["No specific restrictions needed"];
  } else if (val <= 7.0) {
    status = "Normal"; color = "success";
    explanation = "Your uric acid is normal. Uric acid is a waste product from purines in food, filtered by kidneys. Normal levels mean your body is processing and eliminating it efficiently. You are not at risk for gout.";
    consume = ["💧 Drink plenty of water","🍒 Cherries — naturally lower uric acid","🥗 Vegetables and low-purine foods"];
    avoid   = ["🥩 Very high amounts of red meat","🍺 Beer — raises uric acid most"];
  } else {
    status = "High (Gout Risk)"; color = "danger";
    explanation = "Your uric acid is high — hyperuricemia. When uric acid builds up, it forms sharp crystals in joints causing extremely painful gout attacks (worst in big toe, ankles, knees). Also increases kidney stone risk. Start dietary changes and consult a doctor.";
    consume = ["💧 10–12 glasses water daily — most important","🍒 Cherries and cherry juice — proven to reduce gout attacks","🥒 Cucumber, lauki — alkaline foods reduce uric acid","🍋 Lemon water every morning","🥛 Low-fat dairy — reduces uric acid","🥦 All vegetables (except cauliflower/spinach in excess)"];
    avoid   = ["🥩 Red meat, organ meats (liver, kidney) — very high purine","🍺 Beer — worst food for uric acid","🦐 Seafood — shrimp, crab, sardines","🍭 Fructose corn syrup in sodas","🍟 Fried food","💊 Aspirin — raises uric acid"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeSodium(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 136) {
    status = "Low (Hyponatremia)"; color = "danger";
    explanation = "Your sodium is below normal — hyponatremia. Sodium regulates fluid balance. Low sodium causes headache, nausea, confusion, muscle cramps, and in severe cases seizures. Can result from excessive water intake, kidney problems, or adrenal issues. Seek medical evaluation.";
    consume = ["🧂 Moderate salt as doctor directs","🥛 Electrolyte drinks (ORS) if directed","🫘 Foods with natural sodium"];
    avoid   = ["💧 Overdrinking plain water without electrolytes","🍺 Alcohol — causes sodium loss","💊 Certain BP medications — discuss with doctor"];
  } else if (val <= 145) {
    status = "Normal"; color = "success";
    explanation = "Your sodium level is normal. Sodium is essential for fluid balance, nerve function, and muscle contractions. Normal levels mean your electrolyte balance is healthy.";
    consume = ["💧 8 glasses water/day","🥗 Balanced diet with moderate salt","🍌 Potassium-rich foods for balance"];
    avoid   = ["🧂 Excess salt — raises blood pressure","🥫 Processed/packaged foods — high in hidden sodium"];
  } else {
    status = "High (Hypernatremia)"; color = "danger";
    explanation = "Your sodium is elevated — hypernatremia. High sodium causes cells to shrink. Symptoms: intense thirst, dry mouth, confusion, muscle twitching. Most common cause: dehydration. Drink water and seek medical advice.";
    consume = ["💧 Increase water intake significantly","🍉 Water-rich fruits: watermelon, cucumber","🍌 Potassium-rich foods to balance sodium","🥦 Fresh vegetables"];
    avoid   = ["🧂 Salt — reduce significantly","🥫 All processed/packaged foods","🥜 Salted nuts and chips","🧀 Processed cheese","🥩 Cured meats, pickles"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzePotassium(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 3.5) {
    status = "Low (Hypokalemia)"; color = "danger";
    explanation = "Your potassium is too low — hypokalemia. Potassium is vital for regular heartbeat and muscle contractions. Low potassium causes dangerous heart rhythm irregularities, muscle weakness, cramps, and fatigue. Needs medical attention, especially if you take diuretics.";
    consume = ["🍌 Bananas — best potassium source","🥔 Boiled potato with skin","🥑 Avocado","🍊 Oranges and orange juice","🥦 Spinach, sweet potato","🫘 Lentils and kidney beans","🥛 Milk and yogurt","🌰 Almonds"];
    avoid   = ["🍺 Alcohol — depletes potassium","☕ Excess caffeine — promotes potassium loss","🍭 Sugar and processed foods"];
  } else if (val <= 5.0) {
    status = "Normal"; color = "success";
    explanation = "Your potassium is normal. Potassium is essential for heart rhythm, muscle function, and nerve transmission. Normal levels mean your heart and muscles have adequate electrolyte support.";
    consume = ["🍌 Bananas, oranges, potatoes","🥗 Vegetables daily","🫘 Pulses and legumes","🥛 Dairy products"];
    avoid   = ["💊 Potassium supplements without need","🍺 Alcohol"];
  } else {
    status = "High (Hyperkalemia)"; color = "danger";
    explanation = "Your potassium is elevated — hyperkalemia. High potassium can cause dangerous heart arrhythmias including fatal cardiac arrest. Usually caused by kidney disease (kidneys can't excrete potassium), certain medications, or severe dehydration. Needs immediate medical evaluation.";
    consume = ["🍎 Apples, pears (low potassium)","🍚 White rice, pasta","💧 Adequate hydration"];
    avoid   = ["🍌 Bananas — very high potassium","🥔 Potatoes and sweet potatoes","🥑 Avocado","💊 Potassium supplements — absolutely do not take","🧂 Salt substitutes — contain potassium chloride"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeCalcium(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 8.5) {
    status = "Low (Hypocalcemia)"; color = "danger";
    explanation = "Your calcium is below normal — hypocalcemia. Calcium is essential for strong bones, muscle contractions, nerve function, and blood clotting. Low calcium causes muscle cramps, numbness/tingling, brittle bones, dental problems, and potentially seizures. Often caused by Vitamin D deficiency which blocks calcium absorption.";
    consume = ["🥛 Milk 2–3 glasses daily","🧀 Cheese and yogurt (dahi)","🥦 Broccoli, kale","🌰 Sesame seeds (til) — highest plant calcium","🐟 Small fish with edible bones (sardines)","☀️ Sunlight 20 min/day — Vitamin D enables calcium absorption","💊 Calcium + Vitamin D supplement if prescribed"];
    avoid   = ["☕ Excess coffee — blocks calcium absorption","🍺 Alcohol","🚬 Smoking — weakens bones","🥤 Excess soft drinks (phosphoric acid leaches calcium)","🧂 Very high salt diet — causes calcium loss in urine"];
  } else if (val <= 10.5) {
    status = "Normal"; color = "success";
    explanation = "Your calcium is normal. Calcium is the most abundant mineral in the body, essential for strong bones and teeth, proper muscle function, and nerve signaling. Normal levels mean your bone health is supported.";
    consume = ["🥛 Dairy 2–3 servings daily","☀️ Sunlight for Vitamin D","🥦 Green vegetables","🌰 Sesame seeds and almonds"];
    avoid   = ["🍺 Excess alcohol","🚬 Smoking","🥤 Excess soft drinks"];
  } else {
    status = "High (Hypercalcemia)"; color = "warning";
    explanation = "Your calcium is elevated — hypercalcemia. High calcium causes kidney stones, constipation, excessive thirst, frequent urination, and fatigue. Usually caused by overactive parathyroid glands, excessive Vitamin D supplements, or certain cancers. Needs medical evaluation.";
    consume = ["💧 Drink lots of water — helps kidneys excrete excess","🥒 Water-rich vegetables","🍋 Lemon water"];
    avoid   = ["🥛 Reduce dairy temporarily","💊 Calcium and Vitamin D supplements — stop if taking","🧀 Reduce cheese until levels normalize"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeVitaminD(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 20) {
    status = "Deficient"; color = "danger";
    explanation = "Your Vitamin D is severely deficient — very common in India due to indoor lifestyles and darker skin. Vitamin D deficiency causes bone pain, muscle weakness, fatigue, depression, frequent infections, and poor calcium absorption. Also linked to diabetes, heart disease, and cancer. Sunlight and supplements are essential.";
    consume = ["☀️ Sunlight 20–30 min daily between 10am–2pm (most important)","🐟 Fatty fish: salmon, mackerel, sardines","🥚 Egg yolk daily","🍄 Sun-dried mushrooms","🥛 Fortified milk","💊 Vitamin D3 supplement 1000–2000 IU daily — ask doctor for exact dose"];
    avoid   = ["🏠 Staying indoors all day","🚬 Smoking — impairs Vitamin D metabolism","🍺 Alcohol — affects Vitamin D storage in liver","☀️ Covering entire body outdoors — some sunlight needed"];
  } else if (val < 30) {
    status = "Insufficient"; color = "warning";
    explanation = "Your Vitamin D is insufficient — not quite deficient but below ideal. You may notice mild fatigue, occasional bone aches, or slightly reduced immunity. Easily corrected with more sunlight and diet.";
    consume = ["☀️ 15–20 min sunlight daily","🐟 Fish 2x/week","🥚 Eggs daily","🥛 Fortified milk","💊 Consider Vitamin D3 500–1000 IU supplement"];
    avoid   = ["🏠 Prolonged indoor confinement","🚬 Smoking","🍺 Alcohol"];
  } else {
    status = "Sufficient"; color = "success";
    explanation = "Your Vitamin D is sufficient. Vitamin D is crucial for calcium absorption, bone strength, immune function, mood regulation, and muscle health. Adequate Vitamin D protects against osteoporosis, frequent infections, and depression. Excellent result.";
    consume = ["☀️ Continue regular sunlight","🐟 Fish and eggs","🥛 Fortified dairy","💊 Maintain supplement if already taking"];
    avoid   = ["💊 Very high dose supplements without monitoring — can cause toxicity above 150 ng/mL"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeWBC(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 4000) {
    status = "Low (Leukopenia)"; color = "danger";
    explanation = "Your white blood cell count is low — leukopenia. WBCs are your immune system's soldiers. Low WBC means your immunity is weakened and you are very susceptible to infections. Common causes: dengue, typhoid, chemotherapy, autoimmune disease, or bone marrow problems. See a doctor urgently.";
    consume = ["🧄 Garlic — powerful natural immune booster","🫐 Berries — antioxidants","🥦 Broccoli, cauliflower — immune vitamins","🥕 Carrots — beta carotene","🍵 Green tea","🌰 Almonds — Vitamin E for immunity","🍊 Citrus — Vitamin C","🥛 Yogurt with probiotics"];
    avoid   = ["🚬 Smoking — suppresses immunity","🍺 Alcohol","😰 Excessive stress — weakens immunity","👥 Crowded places when count is very low"];
  } else if (val <= 11000) {
    status = "Normal"; color = "success";
    explanation = "Your white blood cell count is normal. WBCs defend against infections and disease. A normal count means your immune system is healthy and ready to fight pathogens. No sign of active infection or immune suppression.";
    consume = ["🍊 Vitamin C foods: citrus, amla, guava","🧄 Garlic — maintain immunity","🥗 Rainbow vegetables","💧 Good hydration","😴 7–8 hours sleep — crucial for immune health"];
    avoid   = ["🚬 Smoking","🍺 Alcohol","😰 Chronic stress"];
  } else {
    status = "High (Infection Risk)"; color = "danger";
    explanation = "Your WBC count is elevated. High WBC means your immune system is actively fighting something — usually a bacterial or viral infection, inflammation, or rarely leukemia. Common causes: pneumonia, UTI, appendicitis, or any active infection. A doctor needs to identify and treat the cause.";
    consume = ["💧 10–12 glasses water","🍵 Ginger tea — anti-inflammatory","🧅 Turmeric milk — anti-inflammatory","🫐 Berries — antioxidants reduce inflammation","🍊 Vitamin C to support immune response","😴 Rest — your body is fighting infection"];
    avoid   = ["🍟 Inflammatory foods: fried, processed","🍭 Sugar — suppresses immune cell activity","🍺 Alcohol — impairs immune response","🚬 Smoking"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeRBC(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 4.0) {
    status = "Low"; color = "danger";
    explanation = "Your red blood cell count is low. RBCs carry oxygen from lungs to every organ. Low RBC causes fatigue, weakness, shortness of breath, pale skin, dizziness, and poor concentration. Combined with low hemoglobin, this confirms anemia. Treatment involves finding the cause and supplementation.";
    consume = ["🥩 Iron-rich: red meat, liver, chicken","🌿 Leafy greens: palak, methi","🫘 All dal and legumes","🍊 Vitamin C with iron foods","🥚 Eggs","🌰 Pumpkin seeds","💊 Iron + B12 + Folic acid supplements"];
    avoid   = ["☕ Tea/coffee within 1 hour of meals","🥛 Excess dairy during iron-rich meals","🚬 Smoking"];
  } else if (val <= 5.5) {
    status = "Normal"; color = "success";
    explanation = "Your red blood cell count is normal. RBCs contain hemoglobin which carries oxygen. A normal RBC count confirms your blood is effectively transporting oxygen to all organs, supporting energy and vitality.";
    consume = ["🥗 Balanced iron-rich diet","🍊 Vitamin C foods","💧 Good hydration","🥦 Green vegetables"];
    avoid   = ["🚬 Smoking","🍺 Excess alcohol — impairs RBC production"];
  } else {
    status = "High (Polycythemia Risk)"; color = "warning";
    explanation = "Your RBC count is higher than normal — polycythemia. Excess RBCs make blood thicker, increasing risk of blood clots, stroke, and heart attack. Causes include dehydration, smoking, high altitude, or a bone marrow disorder. Consult a doctor.";
    consume = ["💧 10–12 glasses water daily","🍎 Fresh fruits","🥦 Vegetables"];
    avoid   = ["🚬 Smoking — top cause","💊 Iron supplements — will worsen this","🥩 Excess red meat"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzePlatelets(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 150000) {
    status = "Low (Thrombocytopenia)"; color = "danger";
    explanation = "Your platelet count is low — thrombocytopenia. Platelets form blood clots to stop bleeding. Low platelets cause easy bruising and prolonged bleeding. Very low counts (below 50,000) risk spontaneous internal bleeding. Common causes: dengue fever, viral infections, ITP, liver disease. See a doctor now.";
    consume = ["🥝 Kiwi fruit — shown to raise platelets","🥦 Broccoli and leafy greens — Vitamin K for clotting","🎃 Pumpkin and pumpkin seeds","🍈 Papaya leaf extract (papita patta) — shown to raise platelets in dengue","🥛 Milk (Vitamin K)","🐟 Fatty fish — omega-3 supports platelet function"];
    avoid   = ["🍺 Alcohol — suppresses platelet production","💊 Aspirin and ibuprofen — thin blood and reduce platelet function","🚬 Smoking"];
  } else if (val <= 400000) {
    status = "Normal"; color = "success";
    explanation = "Your platelet count is normal. Platelets are tiny blood cells that clump together to form clots when you bleed. A normal count means your clotting ability is healthy — wounds close properly and bruising is normal.";
    consume = ["🥗 Balanced diet with Vitamin K (green vegetables)","🥦 Leafy greens","🐟 Fish","🥛 Dairy"];
    avoid   = ["🍺 Excess alcohol","💊 Blood thinners without prescription"];
  } else {
    status = "High (Thrombocytosis)"; color = "warning";
    explanation = "Your platelet count is elevated — thrombocytosis. Very high platelets can cause inappropriate blood clots, risking stroke, heart attack, or DVT. Can be caused by iron deficiency, infections, inflammatory conditions, or rarely a bone marrow disorder. Consult a doctor.";
    consume = ["💧 Plenty of water — reduces clot risk","🍊 Omega-3 foods: fish, walnuts, flaxseed","🧄 Garlic and ginger — natural anti-platelet properties","🍵 Green tea"];
    avoid   = ["🚬 Smoking — raises clot risk dramatically","💊 Iron supplements if not actually iron deficient","🛋️ Prolonged immobility — clot risk"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

function analyzeTSH(v) {
  const val = +v; if (isNaN(val)) return null;
  let status, color, explanation, consume, avoid;
  if (val < 0.4) {
    status = "Low (Hyperthyroidism)"; color = "danger";
    explanation = "Your TSH is too low — your thyroid may be overactive (hyperthyroidism). The thyroid is producing too much hormone, speeding up your metabolism. Causes: unintended weight loss, rapid heartbeat, anxiety, tremors, sweating, and sleep problems. Graves' disease is a common cause. See an endocrinologist urgently.";
    consume = ["🥦 Cruciferous vegetables: broccoli, cabbage, cauliflower — naturally slow thyroid","🌰 Flaxseeds","🍓 Berries — antioxidants","😴 Adequate sleep and stress management","💊 See endocrinologist for treatment"];
    avoid   = ["🍵 Excess caffeine — worsens palpitations","💊 Iodine supplements — can worsen hyperthyroidism","🧂 Iodized salt in excess","🏋️ Intense exercise if heart rate is already high"];
  } else if (val <= 4.0) {
    status = "Normal"; color = "success";
    explanation = "Your TSH is normal. TSH (Thyroid Stimulating Hormone) controls how much thyroid hormone is produced. A normal TSH means your thyroid is functioning properly, regulating your metabolism, energy, weight, and mood correctly. Excellent result.";
    consume = ["🐟 Iodine-rich fish","🧂 Iodized salt","🌰 Brazil nuts — selenium for thyroid","🥚 Eggs","🥛 Dairy"];
    avoid   = ["💊 Thyroid supplements without need","🥦 Excessive raw cruciferous vegetables"];
  } else {
    status = "High (Hypothyroidism)"; color = "danger";
    explanation = "Your TSH is elevated — your thyroid may be underactive (hypothyroidism). High TSH means the pituitary is sending distress signals because the thyroid isn't producing enough hormone. This slows everything down: causes fatigue, unexplained weight gain, hair loss, dry skin, constipation, feeling cold, depression, and brain fog. Hashimoto's thyroiditis is very common especially in women. Medication (levothyroxine) is very effective.";
    consume = ["🌰 Brazil nuts — selenium (thyroid essential mineral)","🐟 Fish and seafood — iodine for thyroid","🧂 Iodized salt","🥚 Eggs","🫘 Pumpkin seeds — zinc for thyroid","☀️ Sunlight for Vitamin D (low D worsens hypothyroidism)","💊 See doctor for levothyroxine prescription"];
    avoid   = ["🥦 Raw cruciferous vegetables in large amounts — goitrogens inhibit thyroid","🌱 Soy in large amounts — interferes with thyroid medication","🍺 Alcohol"];
  }
  return { value: val, status, color, explanation, consume, avoid };
}

// ══════════════════════════════════════════════════════════
// CONDITION DETECTION
// ══════════════════════════════════════════════════════════
function detectConditions(params, results) {
  const r = results;
  const conditions = [];

  const get = (key) => r[key] ? r[key].value : null;

  // Anemia
  const hb  = get("hemoglobin"); const rbc = get("rbc");
  if ((hb && hb < 12) || (rbc && rbc < 4.0)) {
    conditions.push({ name:"Anemia", icon:"🩸", severity:"danger",
      summary:"Low hemoglobin or RBC count. Your blood cannot carry enough oxygen. You may feel constantly tired, weak, and look pale.",
      action:"Eat iron-rich foods with Vitamin C. Consult doctor for iron/B12 supplements. Identify the underlying cause (nutritional, blood loss, or chronic disease)." });
  }
  // Polycythemia
  if ((hb && hb > 17.5) || (rbc && rbc > 5.5)) {
    conditions.push({ name:"Polycythemia / High RBC", icon:"🔴", severity:"warning",
      summary:"High hemoglobin or RBC makes your blood thicker, raising risk of blood clots, stroke, and heart attack.",
      action:"Stop smoking, hydrate well (10+ glasses water/day), and see a doctor to rule out bone marrow disorders." });
  }
  // Diabetes
  const glu = get("glucose");
  if (glu && glu >= 126) {
    conditions.push({ name:"Diabetes / High Blood Sugar", icon:"🍬", severity:"danger",
      summary:"Fasting glucose in diabetic range. Uncontrolled blood sugar silently damages kidneys, eyes, nerves, and heart over years.",
      action:"See a doctor immediately for HbA1c test and treatment plan. Start low-glycemic diet. Walk 30–45 min daily. Medication is likely needed." });
  } else if (glu && glu >= 101) {
    conditions.push({ name:"Prediabetes — Act Now", icon:"⚠️", severity:"warning",
      summary:"Glucose is in prediabetes range. Without lifestyle changes, this will progress to Type 2 Diabetes within 3–5 years.",
      action:"Eliminate refined carbs and sugar. Walk 30 min daily. Retest in 3 months. This is still reversible!" });
  }
  // Heart Risk
  const chol = get("cholesterol"); const ldl = get("ldl"); const hdl = get("hdl"); const tg = get("triglycerides");
  if ((chol && chol > 200) || (ldl && ldl > 130) || (tg && tg > 150) || (hdl && hdl < 40)) {
    conditions.push({ name:"Heart Disease Risk", icon:"🫀", severity:"danger",
      summary:"Abnormal lipid panel: high cholesterol/LDL/triglycerides or low HDL significantly raises risk of heart attack and stroke.",
      action:"Daily oats, omega-3 fish, eliminate fried food and trans fats, walk 45 min/day. Consult doctor for statin assessment." });
  }
  // Kidney Problems
  const bun = get("bun"); const crea = get("creatinine"); const ua = get("uricAcid");
  if ((bun && bun > 20) || (crea && crea > 1.2)) {
    conditions.push({ name:"Kidney Problems", icon:"🫘", severity:"danger",
      summary:"Elevated BUN and/or creatinine suggests kidneys are not filtering waste efficiently. Can progress to chronic kidney disease.",
      action:"Hydrate well (10+ glasses water). Avoid NSAIDs (ibuprofen, aspirin). Reduce protein intake. See a nephrologist (kidney doctor) urgently." });
  }
  // Gout / Uric Acid
  if (ua && ua > 7.0) {
    conditions.push({ name:"Gout / High Uric Acid", icon:"🦴", severity:"warning",
      summary:"High uric acid can crystallize in joints causing extremely painful gout attacks and increases kidney stone risk.",
      action:"Drink 10–12 glasses water, eat cherries daily, eliminate red meat/beer/organ meats. Doctor can prescribe allopurinol." });
  }
  // Thyroid
  const tsh = get("tsh");
  if (tsh !== null && (tsh < 0.4 || tsh > 4.0)) {
    const type = tsh < 0.4 ? "overactive (hyperthyroidism)" : "underactive (hypothyroidism)";
    conditions.push({ name:"Thyroid Disorder", icon:"🦋", severity:"danger",
      summary:`Your TSH suggests your thyroid is ${type}. Thyroid problems affect metabolism, weight, energy, mood, hair, and heart rate.`,
      action:"See a doctor (endocrinologist) for T3/T4 tests and treatment. Hypothyroidism is very treatable with daily levothyroxine medication." });
  }
  // Vitamin D
  const vitd = get("vitaminD");
  if (vitd && vitd < 20) {
    conditions.push({ name:"Vitamin D Deficiency", icon:"☀️", severity:"warning",
      summary:"Severe Vitamin D deficiency weakens bones, suppresses immunity, causes fatigue and muscle pain, and worsens diabetes and depression.",
      action:"Get 20 min sunlight daily (10am–2pm). Take Vitamin D3 supplement 1000–2000 IU/day. Retest in 3 months." });
  }
  // Electrolyte Imbalance
  const na = get("sodium"); const k = get("potassium"); const ca = get("calcium");
  if ((na && (na < 136 || na > 145)) || (k && (k < 3.5 || k > 5.0)) || (ca && (ca < 8.5 || ca > 10.5))) {
    conditions.push({ name:"Electrolyte Imbalance", icon:"⚡", severity:"warning",
      summary:"Abnormal sodium, potassium, or calcium levels can cause heart rhythm disturbances, muscle cramps, weakness, and nerve problems.",
      action:"Eat varied fresh fruits, vegetables, and dairy. Avoid extreme diets. See doctor if palpitations, cramps, or confusion occur." });
  }
  // Infection
  const wbc = get("wbc");
  if (wbc && wbc > 11000) {
    conditions.push({ name:"Active Infection / Inflammation", icon:"🦠", severity:"danger",
      summary:"High WBC count means your immune system is fighting an active infection or inflammation.",
      action:"See a doctor to identify the source. Rest, hydrate well, complete any antibiotic course as prescribed." });
  }
  // Immune Weakness
  if ((wbc && wbc < 4000) || (vitd && vitd < 20)) {
    conditions.push({ name:"Weakened Immunity", icon:"🛡️", severity:"warning",
      summary:"Low WBC or Vitamin D indicates a weakened immune system. You may be more prone to frequent infections and slow recovery.",
      action:"Eat immune-boosting foods: garlic, berries, citrus, zinc-rich seeds. Get sunlight. Reduce stress. Improve sleep quality." });
  }
  // Blood Clotting
  const plt = get("platelets");
  if (plt && plt < 150000) {
    conditions.push({ name:"Blood Clotting Issues", icon:"🩹", severity:"danger",
      summary:"Low platelet count means blood cannot clot properly. Even minor injuries may cause prolonged bleeding or easy bruising.",
      action:"Avoid aspirin and NSAIDs. Eat papaya leaf extract and kiwi. See doctor immediately — dengue and other causes must be ruled out." });
  }
  // Bone Health
  const lowCa = ca && ca < 8.5; const lowVitD = vitd && vitd < 20;
  if (lowCa && lowVitD) {
    conditions.push({ name:"Osteoporosis Risk", icon:"💀", severity:"danger",
      summary:"Both calcium and Vitamin D are low — double risk for bone loss, fractures, osteoporosis, and dental problems.",
      action:"Start Vitamin D3 supplement, increase dairy and sesame seeds, get daily sunlight. Bone density scan (DEXA) recommended." });
  } else if (lowCa || lowVitD) {
    conditions.push({ name:"Bone Health Concern", icon:"🦴", severity:"warning",
      summary:"Low calcium or Vitamin D risks weakening bones over time. Early action prevents osteoporosis.",
      action:"Increase calcium-rich foods (dairy, sesame), get daily sunlight, and consider Vitamin D supplement." });
  }

  return conditions;
}

// ══════════════════════════════════════════════════════════
// OVERALL SUMMARY
// ══════════════════════════════════════════════════════════
function generateSummary(results) {
  const total   = Object.keys(results).length;
  const danger  = Object.values(results).filter(r => r.color === "danger").length;
  const warning = Object.values(results).filter(r => r.color === "warning").length;
  const normal  = Object.values(results).filter(r => r.color === "success").length;

  let overall, overallColor;
  if (danger >= 3) { overall = "Your report shows multiple serious health concerns that require prompt medical attention. Please see a doctor soon."; overallColor = "danger"; }
  else if (danger >= 1) { overall = "Your report shows some important health markers that need attention and possibly medical care."; overallColor = "warning"; }
  else if (warning >= 2) { overall = "Your report is mostly okay but has a few borderline values that are worth monitoring closely."; overallColor = "warning"; }
  else { overall = "Your report looks generally healthy! Keep up your good habits to maintain this."; overallColor = "success"; }

  return { overall, overallColor, total, danger, warning, normal };
}

// ══════════════════════════════════════════════════════════
// POST /analyze
// ══════════════════════════════════════════════════════════
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

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`\n✅ HealthLens AI Server → http://localhost:${PORT}\n`));