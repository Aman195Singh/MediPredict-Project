export interface FeatureImportance {
  feature: string;
  displayName: string;
  value: number;
  impact: number; // positive = increases risk, negative = decreases risk
}

export interface PredictionResult {
  disease: string;
  riskPercentage: number;
  riskLevel: 'low' | 'moderate' | 'high';
  featureImportances: FeatureImportance[];
  inputParams: Record<string, string | number>;
  explanation: string;
  suggestions: string[];
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getRiskLevel(pct: number): 'low' | 'moderate' | 'high' {
  if (pct >= 60) return 'high';
  if (pct >= 30) return 'moderate';
  return 'low';
}

function jitter(base: number, range = 5): number {
  return base + (Math.random() - 0.5) * range;
}

export function predictDiabetes(params: Record<string, any>): PredictionResult {
  const glucose = Number(params.blood_glucose_level) || 100;
  const hba1c = Number(params.HbA1c_level) || 5.0;
  const bmi = Number(params.bmi) || 25;
  const age = Number(params.age) || 30;
  const hypertension = Number(params.hypertension) || 0;
  const heartDisease = Number(params.heart_disease) || 0;

  let score = 0;
  if (glucose > 200) score += 28; else if (glucose > 140) score += 18; else if (glucose > 100) score += 6;
  if (hba1c > 6.5) score += 28; else if (hba1c > 5.7) score += 14; else score += 2;
  if (bmi > 35) score += 14; else if (bmi > 30) score += 9; else if (bmi > 25) score += 4;
  if (age > 60) score += 8; else if (age > 45) score += 4;
  if (hypertension) score += 7;
  if (heartDisease) score += 6;

  const risk = clamp(jitter(score, 8), 5, 95);

  const featureImportances: FeatureImportance[] = [
    { feature: 'blood_glucose_level', displayName: 'Blood Glucose', value: glucose, impact: glucose > 140 ? 0.35 : -0.1 },
    { feature: 'HbA1c_level', displayName: 'HbA1c Level', value: hba1c, impact: hba1c > 5.7 ? 0.3 : -0.15 },
    { feature: 'bmi', displayName: 'BMI', value: bmi, impact: bmi > 30 ? 0.15 : -0.05 },
    { feature: 'age', displayName: 'Age', value: age, impact: age > 45 ? 0.1 : -0.05 },
    { feature: 'hypertension', displayName: 'Hypertension', value: hypertension, impact: hypertension ? 0.08 : -0.03 },
    { feature: 'heart_disease', displayName: 'Heart Disease', value: heartDisease, impact: heartDisease ? 0.06 : -0.02 },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    disease: 'Diabetes',
    riskPercentage: Math.round(risk),
    riskLevel: getRiskLevel(risk),
    featureImportances,
    inputParams: params,
    explanation: `Based on your medical parameters, your diabetes risk is ${Math.round(risk)}%. ${glucose > 140 ? 'Your elevated blood glucose level is a significant factor.' : ''} ${hba1c > 5.7 ? 'Your HbA1c level indicates pre-diabetic or diabetic range.' : ''} ${bmi > 30 ? 'Your BMI suggests obesity, which increases diabetes risk.' : ''}`.trim(),
    suggestions: [
      'Monitor blood glucose levels regularly and maintain a log.',
      'Follow a balanced diet low in refined sugars and processed carbs.',
      'Engage in at least 150 minutes of moderate exercise per week.',
      'Maintain a healthy BMI through portion control and regular activity.',
      'Schedule regular check-ups with your healthcare provider.',
      'Manage stress through meditation, yoga, or relaxation techniques.',
    ],
  };
}

export function predictHeartDisease(params: Record<string, any>): PredictionResult {
  const age = Number(params.age) || 50;
  const bp = Number(params.resting_blood_pressure) || 120;
  const chol = Number(params.cholestoral) || 200;
  const maxHR = Number(params.max_heart_rate) || 150;
  const oldpeak = Number(params.oldpeak) || 0;
  const vessels = Number(params.vessels_colored_by_flourosopy) || 0;
  const chestPain = params.chest_pain_type || 'Typical angina';

  let score = 0;
  if (age > 65) score += 15; else if (age > 50) score += 8;
  if (bp > 160) score += 15; else if (bp > 140) score += 10; else if (bp > 120) score += 4;
  if (chol > 280) score += 15; else if (chol > 240) score += 10; else if (chol > 200) score += 5;
  if (maxHR < 120) score += 10; else if (maxHR < 140) score += 5;
  if (oldpeak > 2) score += 12; else if (oldpeak > 1) score += 6;
  score += vessels * 8;
  if (chestPain === 'Typical angina') score += 10;

  const risk = clamp(jitter(score, 8), 5, 95);

  const featureImportances: FeatureImportance[] = [
    { feature: 'cholestoral', displayName: 'Cholesterol', value: chol, impact: chol > 240 ? 0.25 : -0.1 },
    { feature: 'resting_blood_pressure', displayName: 'Resting BP', value: bp, impact: bp > 140 ? 0.2 : -0.05 },
    { feature: 'oldpeak', displayName: 'ST Depression', value: oldpeak, impact: oldpeak > 1 ? 0.18 : -0.05 },
    { feature: 'vessels_colored_by_flourosopy', displayName: 'Vessels Colored', value: vessels, impact: vessels > 0 ? 0.15 : -0.05 },
    { feature: 'max_heart_rate', displayName: 'Max Heart Rate', value: maxHR, impact: maxHR < 140 ? 0.12 : -0.08 },
    { feature: 'age', displayName: 'Age', value: age, impact: age > 50 ? 0.1 : -0.05 },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    disease: 'Heart Disease',
    riskPercentage: Math.round(risk),
    riskLevel: getRiskLevel(risk),
    featureImportances,
    inputParams: params,
    explanation: `Your heart disease risk assessment shows ${Math.round(risk)}% risk. ${chol > 240 ? 'High cholesterol is a major contributing factor.' : ''} ${bp > 140 ? 'Elevated blood pressure increases cardiovascular risk.' : ''} ${oldpeak > 1 ? 'ST depression during exercise suggests potential cardiac stress.' : ''}`.trim(),
    suggestions: [
      'Maintain cholesterol levels within healthy range through diet and medication if prescribed.',
      'Monitor blood pressure regularly and take prescribed medications.',
      'Follow a heart-healthy diet rich in fruits, vegetables, and omega-3 fatty acids.',
      'Engage in regular cardiovascular exercise as recommended by your doctor.',
      'Avoid smoking and limit alcohol consumption.',
      'Manage stress and get adequate sleep (7-8 hours nightly).',
    ],
  };
}

export function predictKidneyDisease(params: Record<string, any>): PredictionResult {
  const age = Number(params.age) || 50;
  const bp = Number(params.bp) || 80;
  const albumin = Number(params.al) || 0;
  const sugar = Number(params.su) || 0;
  const bu = Number(params.bu) || 40;
  const sc = Number(params.sc) || 1.0;
  const hemo = Number(params.hemo) || 14;
  const bgr = Number(params.bgr) || 120;

  let score = 0;
  if (albumin > 3) score += 20; else if (albumin > 1) score += 10;
  if (sc > 3) score += 20; else if (sc > 1.5) score += 12;
  if (bu > 80) score += 15; else if (bu > 50) score += 8;
  if (hemo < 10) score += 12; else if (hemo < 12) score += 5;
  if (bp > 100) score += 8; else if (bp > 90) score += 4;
  if (bgr > 200) score += 8; else if (bgr > 140) score += 4;
  if (sugar > 2) score += 6;
  if (age > 60) score += 5;

  const risk = clamp(jitter(score, 8), 5, 95);

  const featureImportances: FeatureImportance[] = [
    { feature: 'sc', displayName: 'Serum Creatinine', value: sc, impact: sc > 1.5 ? 0.3 : -0.1 },
    { feature: 'al', displayName: 'Albumin in Urine', value: albumin, impact: albumin > 1 ? 0.25 : -0.05 },
    { feature: 'bu', displayName: 'Blood Urea', value: bu, impact: bu > 50 ? 0.2 : -0.05 },
    { feature: 'hemo', displayName: 'Hemoglobin', value: hemo, impact: hemo < 12 ? 0.15 : -0.1 },
    { feature: 'bp', displayName: 'Blood Pressure', value: bp, impact: bp > 90 ? 0.1 : -0.05 },
    { feature: 'bgr', displayName: 'Blood Glucose', value: bgr, impact: bgr > 140 ? 0.08 : -0.03 },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    disease: 'Kidney Disease',
    riskPercentage: Math.round(risk),
    riskLevel: getRiskLevel(risk),
    featureImportances,
    inputParams: params,
    explanation: `Your kidney disease risk is estimated at ${Math.round(risk)}%. ${sc > 1.5 ? 'Elevated serum creatinine indicates reduced kidney filtration.' : ''} ${albumin > 1 ? 'Albumin in urine suggests kidney damage.' : ''} ${bu > 50 ? 'High blood urea indicates impaired kidney function.' : ''}`.trim(),
    suggestions: [
      'Stay well-hydrated by drinking adequate water daily.',
      'Limit sodium and potassium intake as recommended.',
      'Control blood pressure and blood sugar levels.',
      'Avoid over-the-counter painkillers that may harm kidneys.',
      'Follow a kidney-friendly diet with moderate protein intake.',
      'Get regular kidney function tests (GFR, creatinine, urine analysis).',
    ],
  };
}

export function predictLiverDisease(params: Record<string, any>): PredictionResult {
  const age = Number(params.age) || 45;
  const totBili = Number(params.tot_bilirubin) || 1.0;
  const directBili = Number(params.direct_bilirubin) || 0.3;
  const alkphos = Number(params.alkphos) || 200;
  const sgpt = Number(params.sgpt) || 25;
  const sgot = Number(params.sgot) || 30;
  const totProteins = Number(params.tot_proteins) || 6.5;
  const albumin = Number(params.albumin) || 3.5;
  const agRatio = Number(params.ag_ratio) || 1.0;

  let score = 0;
  if (totBili > 5) score += 20; else if (totBili > 2) score += 12; else if (totBili > 1.2) score += 5;
  if (sgpt > 100) score += 18; else if (sgpt > 40) score += 10;
  if (sgot > 100) score += 15; else if (sgot > 40) score += 8;
  if (alkphos > 400) score += 12; else if (alkphos > 200) score += 6;
  if (albumin < 2.5) score += 10; else if (albumin < 3.5) score += 5;
  if (agRatio < 0.8) score += 8; else if (agRatio < 1.0) score += 3;
  if (age > 55) score += 5;

  const risk = clamp(jitter(score, 8), 5, 95);

  const featureImportances: FeatureImportance[] = [
    { feature: 'tot_bilirubin', displayName: 'Total Bilirubin', value: totBili, impact: totBili > 1.2 ? 0.28 : -0.1 },
    { feature: 'sgpt', displayName: 'SGPT (ALT)', value: sgpt, impact: sgpt > 40 ? 0.22 : -0.05 },
    { feature: 'sgot', displayName: 'SGOT (AST)', value: sgot, impact: sgot > 40 ? 0.18 : -0.05 },
    { feature: 'alkphos', displayName: 'Alkaline Phosphatase', value: alkphos, impact: alkphos > 200 ? 0.12 : -0.05 },
    { feature: 'albumin', displayName: 'Albumin', value: albumin, impact: albumin < 3.5 ? 0.12 : -0.08 },
    { feature: 'ag_ratio', displayName: 'A/G Ratio', value: agRatio, impact: agRatio < 1.0 ? 0.08 : -0.05 },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    disease: 'Liver Disease',
    riskPercentage: Math.round(risk),
    riskLevel: getRiskLevel(risk),
    featureImportances,
    inputParams: params,
    explanation: `Your liver disease risk is ${Math.round(risk)}%. ${totBili > 2 ? 'Elevated bilirubin levels suggest liver dysfunction.' : ''} ${sgpt > 40 ? 'High SGPT indicates potential liver cell damage.' : ''} ${albumin < 3.5 ? 'Low albumin may indicate impaired liver protein synthesis.' : ''}`.trim(),
    suggestions: [
      'Limit alcohol consumption or abstain completely.',
      'Maintain a balanced diet rich in fruits, vegetables, and whole grains.',
      'Avoid unnecessary medications and supplements that burden the liver.',
      'Get vaccinated for Hepatitis A and B if not already done.',
      'Exercise regularly to maintain a healthy weight.',
      'Get liver function tests done periodically.',
    ],
  };
}

export function predictAll(params: Record<string, any>): PredictionResult[] {
  return [
    predictDiabetes(params),
    predictHeartDisease(params),
    predictKidneyDisease(params),
    predictLiverDisease(params),
  ];
}
