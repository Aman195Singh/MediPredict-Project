export interface FormField {
  name: string;
  label: string;
  type: 'number' | 'select' | 'radio';
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  section: string;
}

export const diabetesFields: FormField[] = [
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g. 45', tooltip: 'Patient age in years', section: 'Patient Info' },
  { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }], tooltip: 'Biological sex', section: 'Patient Info' },
  { name: 'bmi', label: 'BMI', type: 'number', min: 10, max: 70, step: 0.1, placeholder: 'e.g. 25.5', tooltip: 'Body Mass Index (weight in kg / height in m²)', section: 'Patient Info' },
  { name: 'hypertension', label: 'Hypertension', type: 'select', options: [{ label: 'No', value: '0' }, { label: 'Yes', value: '1' }], tooltip: 'History of high blood pressure', section: 'Medical History' },
  { name: 'heart_disease', label: 'Heart Disease History', type: 'select', options: [{ label: 'No', value: '0' }, { label: 'Yes', value: '1' }], tooltip: 'History of heart disease', section: 'Medical History' },
  { name: 'smoking_history', label: 'Smoking History', type: 'select', options: [{ label: 'Never', value: 'never' }, { label: 'Former', value: 'former' }, { label: 'Current', value: 'current' }, { label: 'Not Current', value: 'not current' }, { label: 'Ever', value: 'ever' }, { label: 'No Info', value: 'No Info' }], tooltip: 'Smoking status', section: 'Lifestyle' },
  { name: 'HbA1c_level', label: 'HbA1c Level', type: 'number', min: 3, max: 15, step: 0.1, placeholder: 'e.g. 5.7', tooltip: 'Hemoglobin A1c — average blood sugar over 2-3 months (%)', section: 'Blood & Glucose' },
  { name: 'blood_glucose_level', label: 'Blood Glucose Level', type: 'number', min: 50, max: 500, placeholder: 'e.g. 140', tooltip: 'Current blood glucose level (mg/dL)', section: 'Blood & Glucose' },
];

export const heartDiseaseFields: FormField[] = [
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g. 55', tooltip: 'Patient age in years', section: 'Patient Info' },
  { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }], section: 'Patient Info' },
  { name: 'chest_pain_type', label: 'Chest Pain Type', type: 'select', options: [{ label: 'Typical Angina', value: 'Typical angina' }, { label: 'Atypical Angina', value: 'Atypical angina' }, { label: 'Non-anginal Pain', value: 'Non-anginal pain' }, { label: 'Asymptomatic', value: 'Asymptomatic' }], tooltip: 'Type of chest pain experienced', section: 'Cardiovascular' },
  { name: 'resting_blood_pressure', label: 'Resting Blood Pressure', type: 'number', min: 60, max: 250, placeholder: 'e.g. 120', tooltip: 'Resting blood pressure in mm Hg', section: 'Cardiovascular' },
  { name: 'cholestoral', label: 'Serum Cholesterol', type: 'number', min: 100, max: 600, placeholder: 'e.g. 200', tooltip: 'Serum cholesterol in mg/dL', section: 'Cardiovascular' },
  { name: 'fasting_blood_sugar', label: 'Fasting Blood Sugar', type: 'select', options: [{ label: '< 120 mg/ml', value: 'Lower than 120 mg/ml' }, { label: '> 120 mg/ml', value: 'Greater than 120 mg/ml' }], tooltip: 'Fasting blood sugar level', section: 'Blood & Glucose' },
  { name: 'rest_ecg', label: 'Resting ECG', type: 'select', options: [{ label: 'Normal', value: 'Normal' }, { label: 'ST-T Wave Abnormality', value: 'ST-T wave abnormality' }, { label: 'Left Ventricular Hypertrophy', value: 'Left ventricular hypertrophy' }], tooltip: 'Resting electrocardiographic results', section: 'Cardiovascular' },
  { name: 'max_heart_rate', label: 'Max Heart Rate', type: 'number', min: 60, max: 220, placeholder: 'e.g. 150', tooltip: 'Maximum heart rate achieved during exercise', section: 'Cardiovascular' },
  { name: 'exercise_induced_angina', label: 'Exercise-Induced Angina', type: 'select', options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], tooltip: 'Angina induced by exercise', section: 'Cardiovascular' },
  { name: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number', min: 0, max: 10, step: 0.1, placeholder: 'e.g. 1.5', tooltip: 'ST depression induced by exercise relative to rest', section: 'Cardiovascular' },
  { name: 'slope', label: 'Slope of ST Segment', type: 'select', options: [{ label: 'Upsloping', value: 'Upsloping' }, { label: 'Flat', value: 'Flat' }, { label: 'Downsloping', value: 'Downsloping' }], tooltip: 'Slope of the peak exercise ST segment', section: 'Cardiovascular' },
  { name: 'vessels_colored_by_flourosopy', label: 'Major Vessels (0-3)', type: 'select', options: [{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }], tooltip: 'Number of major vessels colored by fluoroscopy', section: 'Cardiovascular' },
  { name: 'thalassemia', label: 'Thalassemia', type: 'select', options: [{ label: 'Normal', value: 'Normal' }, { label: 'Fixed Defect', value: 'Fixed Defect' }, { label: 'Reversable Defect', value: 'Reversable Defect' }], tooltip: 'Blood disorder classification', section: 'Other' },
];

export const kidneyDiseaseFields: FormField[] = [
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g. 50', section: 'Patient Info' },
  { name: 'bp', label: 'Blood Pressure', type: 'number', min: 40, max: 200, placeholder: 'e.g. 80', tooltip: 'Blood pressure in mm Hg', section: 'Cardiovascular' },
  { name: 'sg', label: 'Specific Gravity', type: 'select', options: [{ label: '1.005', value: '1.005' }, { label: '1.010', value: '1.010' }, { label: '1.015', value: '1.015' }, { label: '1.020', value: '1.020' }, { label: '1.025', value: '1.025' }], tooltip: 'Urine specific gravity', section: 'Urine Tests' },
  { name: 'al', label: 'Albumin', type: 'select', options: [{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }], tooltip: 'Albumin level in urine', section: 'Urine Tests' },
  { name: 'su', label: 'Sugar', type: 'select', options: [{ label: '0', value: '0' }, { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }], tooltip: 'Sugar level in urine', section: 'Urine Tests' },
  { name: 'rbc', label: 'Red Blood Cells', type: 'select', options: [{ label: 'Normal', value: 'normal' }, { label: 'Abnormal', value: 'abnormal' }], section: 'Blood' },
  { name: 'pc', label: 'Pus Cells', type: 'select', options: [{ label: 'Normal', value: 'normal' }, { label: 'Abnormal', value: 'abnormal' }], section: 'Urine Tests' },
  { name: 'pcc', label: 'Pus Cell Clumps', type: 'select', options: [{ label: 'Not Present', value: 'notpresent' }, { label: 'Present', value: 'present' }], section: 'Urine Tests' },
  { name: 'ba', label: 'Bacteria', type: 'select', options: [{ label: 'Not Present', value: 'notpresent' }, { label: 'Present', value: 'present' }], section: 'Urine Tests' },
  { name: 'bgr', label: 'Blood Glucose Random', type: 'number', min: 50, max: 500, placeholder: 'e.g. 120', section: 'Blood & Glucose' },
  { name: 'bu', label: 'Blood Urea', type: 'number', min: 5, max: 400, placeholder: 'e.g. 40', tooltip: 'Blood urea level in mg/dL', section: 'Blood' },
  { name: 'sc', label: 'Serum Creatinine', type: 'number', min: 0.1, max: 80, step: 0.1, placeholder: 'e.g. 1.2', section: 'Blood' },
  { name: 'sod', label: 'Sodium', type: 'number', min: 100, max: 170, placeholder: 'e.g. 137', section: 'Blood' },
  { name: 'pot', label: 'Potassium', type: 'number', min: 2, max: 8, step: 0.1, placeholder: 'e.g. 4.5', section: 'Blood' },
  { name: 'hemo', label: 'Hemoglobin', type: 'number', min: 3, max: 20, step: 0.1, placeholder: 'e.g. 14.0', section: 'Blood' },
  { name: 'pcv', label: 'Packed Cell Volume', type: 'number', min: 10, max: 60, placeholder: 'e.g. 40', section: 'Blood' },
  { name: 'wc', label: 'White Blood Cell Count', type: 'number', min: 2000, max: 30000, placeholder: 'e.g. 8000', section: 'Blood' },
  { name: 'rc', label: 'Red Blood Cell Count', type: 'number', min: 2, max: 8, step: 0.1, placeholder: 'e.g. 5.0', section: 'Blood' },
  { name: 'htn', label: 'Hypertension', type: 'select', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], section: 'Medical History' },
  { name: 'dm', label: 'Diabetes Mellitus', type: 'select', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], section: 'Medical History' },
  { name: 'cad', label: 'Coronary Artery Disease', type: 'select', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], section: 'Medical History' },
  { name: 'appet', label: 'Appetite', type: 'select', options: [{ label: 'Good', value: 'good' }, { label: 'Poor', value: 'poor' }], section: 'Symptoms' },
  { name: 'pe', label: 'Pedal Edema', type: 'select', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], tooltip: 'Swelling in feet/legs', section: 'Symptoms' },
  { name: 'ane', label: 'Anemia', type: 'select', options: [{ label: 'No', value: 'no' }, { label: 'Yes', value: 'yes' }], section: 'Blood' },
];

export const liverDiseaseFields: FormField[] = [
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, placeholder: 'e.g. 45', section: 'Patient Info' },
  { name: 'gender', label: 'Gender', type: 'select', options: [{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }], section: 'Patient Info' },
  { name: 'tot_bilirubin', label: 'Total Bilirubin', type: 'number', min: 0, max: 80, step: 0.1, placeholder: 'e.g. 1.0', tooltip: 'Total bilirubin level in mg/dL', section: 'Liver Markers' },
  { name: 'direct_bilirubin', label: 'Direct Bilirubin', type: 'number', min: 0, max: 20, step: 0.1, placeholder: 'e.g. 0.3', section: 'Liver Markers' },
  { name: 'alkphos', label: 'Alkaline Phosphatase', type: 'number', min: 40, max: 2000, placeholder: 'e.g. 200', tooltip: 'Alkaline phosphatase enzyme level (IU/L)', section: 'Liver Markers' },
  { name: 'sgpt', label: 'SGPT (ALT)', type: 'number', min: 5, max: 2000, placeholder: 'e.g. 25', tooltip: 'Alanine aminotransferase level (IU/L)', section: 'Liver Markers' },
  { name: 'sgot', label: 'SGOT (AST)', type: 'number', min: 5, max: 5000, placeholder: 'e.g. 30', tooltip: 'Aspartate aminotransferase level (IU/L)', section: 'Liver Markers' },
  { name: 'tot_proteins', label: 'Total Proteins', type: 'number', min: 2, max: 10, step: 0.1, placeholder: 'e.g. 6.5', tooltip: 'Total serum proteins (g/dL)', section: 'Blood' },
  { name: 'albumin', label: 'Albumin', type: 'number', min: 1, max: 6, step: 0.1, placeholder: 'e.g. 3.5', tooltip: 'Serum albumin level (g/dL)', section: 'Blood' },
  { name: 'ag_ratio', label: 'Albumin/Globulin Ratio', type: 'number', min: 0.1, max: 3, step: 0.01, placeholder: 'e.g. 1.0', tooltip: 'Ratio of albumin to globulin proteins', section: 'Blood' },
];

export const diseaseFieldsMap: Record<string, FormField[]> = {
  diabetes: diabetesFields,
  heart: heartDiseaseFields,
  kidney: kidneyDiseaseFields,
  liver: liverDiseaseFields,
};

export const allDiseaseFields: FormField[] = (() => {
  const seen = new Set<string>();
  const merged: FormField[] = [];
  const allFields = [...diabetesFields, ...heartDiseaseFields, ...kidneyDiseaseFields, ...liverDiseaseFields];
  for (const f of allFields) {
    if (!seen.has(f.name)) {
      seen.add(f.name);
      merged.push(f);
    }
  }
  return merged;
})();

export const diseaseNames = ['Diabetes', 'Heart Disease', 'Kidney Disease', 'Liver Disease'] as const;
export const diseaseKeys = ['diabetes', 'heart', 'kidney', 'liver'] as const;
export const diseaseIcons: Record<string, string> = {
  diabetes: '/icons/diabetes.png',
  heart: '/icons/heart.png',
  kidney: '/icons/kidney.png',
  liver: '/icons/liver.png',
};
