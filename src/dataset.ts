export interface ClinicalTrialRecord {
  age: number;
  gender: "Male" | "Female";
  bp: number;
  cholesterol: number;
  diabetes: boolean;
  smoking: boolean;
  lvef: number;
  lvedd: number; // in cm
  lvesd: number; // in cm
  ivsd: number;  // in cm (septal wall thickness)
  lpwd: number;  // in cm (posterior wall thickness)
  eaRatio: number;
  strokeVolume: number;
  cadRisk: boolean; // 1 or 0
}

export interface ClevelandRecord {
  age: number;
  gender: "Male" | "Female";
  cp: number; // chest pain type (1-4)
  trestbps: number; // resting blood pressure
  chol: number; // cholesterol
  fbs: boolean; // fasting blood sugar > 120
  restecg: number; // resting ECG (0-2)
  thalach: number; // max heart rate
  exang: boolean; // exercise induced angina
  oldpeak: number; // ST depression
  slope: number; // slope of peak exercise ST segment
  ca: number; // number of major vessels
  thal: number; // thalassemia
  smoking: boolean;
  diabetes: boolean;
  bmi: number;
  heartDisease: boolean;
}

// Echo & ECG Clinical Trial Dataset provided by user
export const CLINICAL_TRIAL_DATASET: ClinicalTrialRecord[] = [
  { age: 73, gender: "Male", bp: 117, cholesterol: 196, diabetes: true, smoking: false, lvef: 44, lvedd: 5.8, lvesd: 4.0, ivsd: 1.3, lpwd: 1.2, eaRatio: 1.6, strokeVolume: 50, cadRisk: true },
  { age: 63, gender: "Male", bp: 159, cholesterol: 219, diabetes: true, smoking: true, lvef: 44, lvedd: 6.5, lvesd: 5.3, ivsd: 1.3, lpwd: 1.0, eaRatio: 1.3, strokeVolume: 82, cadRisk: true },
  { age: 49, gender: "Female", bp: 137, cholesterol: 197, diabetes: false, smoking: true, lvef: 33, lvedd: 5.4, lvesd: 4.1, ivsd: 1.1, lpwd: 1.4, eaRatio: 0.7, strokeVolume: 47, cadRisk: true },
  { age: 42, gender: "Male", bp: 129, cholesterol: 234, diabetes: false, smoking: false, lvef: 61, lvedd: 5.9, lvesd: 3.7, ivsd: 0.8, lpwd: 1.3, eaRatio: 0.5, strokeVolume: 56, cadRisk: false },
  { age: 55, gender: "Female", bp: 156, cholesterol: 252, diabetes: false, smoking: true, lvef: 52, lvedd: 5.7, lvesd: 4.4, ivsd: 1.3, lpwd: 1.2, eaRatio: 1.0, strokeVolume: 80, cadRisk: true },
  { age: 73, gender: "Female", bp: 168, cholesterol: 204, diabetes: false, smoking: true, lvef: 35, lvedd: 5.2, lvesd: 3.3, ivsd: 0.8, lpwd: 1.0, eaRatio: 1.1, strokeVolume: 77, cadRisk: true },
  { age: 53, gender: "Female", bp: 116, cholesterol: 283, diabetes: false, smoking: false, lvef: 53, lvedd: 5.6, lvesd: 4.5, ivsd: 1.2, lpwd: 1.0, eaRatio: 0.8, strokeVolume: 80, cadRisk: true },
  { age: 57, gender: "Male", bp: 120, cholesterol: 238, diabetes: true, smoking: true, lvef: 49, lvedd: 5.7, lvesd: 4.4, ivsd: 0.9, lpwd: 1.2, eaRatio: 0.6, strokeVolume: 77, cadRisk: true },
  { age: 45, gender: "Female", bp: 129, cholesterol: 257, diabetes: true, smoking: true, lvef: 49, lvedd: 5.0, lvesd: 5.0, ivsd: 1.2, lpwd: 0.8, eaRatio: 1.1, strokeVolume: 75, cadRisk: true },
  { age: 45, gender: "Female", bp: 125, cholesterol: 268, diabetes: true, smoking: false, lvef: 41, lvedd: 5.2, lvesd: 5.5, ivsd: 1.2, lpwd: 1.0, eaRatio: 1.3, strokeVolume: 65, cadRisk: true },
  { age: 58, gender: "Male", bp: 113, cholesterol: 293, diabetes: true, smoking: false, lvef: 62, lvedd: 6.3, lvesd: 3.6, ivsd: 0.8, lpwd: 1.2, eaRatio: 1.6, strokeVolume: 71, cadRisk: true },
  { age: 70, gender: "Male", bp: 115, cholesterol: 201, diabetes: true, smoking: true, lvef: 57, lvedd: 6.6, lvesd: 4.3, ivsd: 1.1, lpwd: 1.1, eaRatio: 1.3, strokeVolume: 71, cadRisk: true },
  { age: 74, gender: "Male", bp: 167, cholesterol: 295, diabetes: true, smoking: false, lvef: 37, lvedd: 5.3, lvesd: 5.3, ivsd: 1.2, lpwd: 1.0, eaRatio: 1.4, strokeVolume: 52, cadRisk: true },
  { age: 58, gender: "Male", bp: 131, cholesterol: 209, diabetes: true, smoking: true, lvef: 30, lvedd: 5.2, lvesd: 5.0, ivsd: 1.4, lpwd: 0.9, eaRatio: 1.2, strokeVolume: 81, cadRisk: true },
  { age: 37, gender: "Female", bp: 135, cholesterol: 263, diabetes: false, smoking: false, lvef: 51, lvedd: 4.9, lvesd: 4.2, ivsd: 1.4, lpwd: 1.1, eaRatio: 1.6, strokeVolume: 76, cadRisk: true },
  { age: 56, gender: "Female", bp: 112, cholesterol: 264, diabetes: false, smoking: true, lvef: 35, lvedd: 6.1, lvesd: 5.4, ivsd: 1.1, lpwd: 1.3, eaRatio: 1.2, strokeVolume: 70, cadRisk: true },
  { age: 36, gender: "Female", bp: 150, cholesterol: 223, diabetes: true, smoking: false, lvef: 50, lvedd: 5.2, lvesd: 3.1, ivsd: 1.3, lpwd: 1.0, eaRatio: 1.4, strokeVolume: 46, cadRisk: true },
  { age: 58, gender: "Female", bp: 169, cholesterol: 211, diabetes: true, smoking: true, lvef: 61, lvedd: 6.8, lvesd: 5.3, ivsd: 1.0, lpwd: 0.8, eaRatio: 1.5, strokeVolume: 56, cadRisk: true },
  { age: 64, gender: "Male", bp: 151, cholesterol: 230, diabetes: false, smoking: true, lvef: 64, lvedd: 5.2, lvesd: 3.1, ivsd: 1.0, lpwd: 1.2, eaRatio: 1.5, strokeVolume: 66, cadRisk: true },
  { age: 72, gender: "Female", bp: 123, cholesterol: 225, diabetes: false, smoking: true, lvef: 44, lvedd: 5.4, lvesd: 4.4, ivsd: 0.9, lpwd: 1.4, eaRatio: 0.9, strokeVolume: 61, cadRisk: true },
  { age: 36, gender: "Female", bp: 120, cholesterol: 292, diabetes: false, smoking: false, lvef: 34, lvedd: 5.9, lvesd: 5.2, ivsd: 1.2, lpwd: 1.2, eaRatio: 0.6, strokeVolume: 51, cadRisk: true },
  { age: 55, gender: "Male", bp: 127, cholesterol: 299, diabetes: false, smoking: false, lvef: 35, lvedd: 6.3, lvesd: 3.7, ivsd: 1.0, lpwd: 0.9, eaRatio: 0.7, strokeVolume: 48, cadRisk: true },
  { age: 67, gender: "Female", bp: 163, cholesterol: 200, diabetes: true, smoking: true, lvef: 54, lvedd: 5.6, lvesd: 4.2, ivsd: 0.9, lpwd: 1.0, eaRatio: 0.6, strokeVolume: 81, cadRisk: true },
  { age: 46, gender: "Female", bp: 121, cholesterol: 278, diabetes: false, smoking: true, lvef: 58, lvedd: 5.5, lvesd: 3.8, ivsd: 1.3, lpwd: 1.3, eaRatio: 0.6, strokeVolume: 82, cadRisk: true },
  { age: 56, gender: "Female", bp: 132, cholesterol: 211, diabetes: true, smoking: false, lvef: 36, lvedd: 6.8, lvesd: 5.4, ivsd: 1.3, lpwd: 0.9, eaRatio: 0.7, strokeVolume: 76, cadRisk: true },
  { age: 59, gender: "Female", bp: 121, cholesterol: 273, diabetes: true, smoking: false, lvef: 42, lvedd: 4.5, lvesd: 5.1, ivsd: 1.1, lpwd: 1.2, eaRatio: 0.9, strokeVolume: 55, cadRisk: true },
  { age: 61, gender: "Female", bp: 122, cholesterol: 298, diabetes: true, smoking: false, lvef: 47, lvedd: 6.6, lvesd: 4.8, ivsd: 0.9, lpwd: 1.0, eaRatio: 1.1, strokeVolume: 45, cadRisk: true },
  { age: 62, gender: "Female", bp: 134, cholesterol: 218, diabetes: false, smoking: false, lvef: 31, lvedd: 4.8, lvesd: 4.5, ivsd: 1.1, lpwd: 0.9, eaRatio: 1.3, strokeVolume: 69, cadRisk: true },
  { age: 50, gender: "Male", bp: 154, cholesterol: 292, diabetes: false, smoking: false, lvef: 37, lvedd: 6.3, lvesd: 5.1, ivsd: 1.1, lpwd: 1.3, eaRatio: 0.7, strokeVolume: 68, cadRisk: true },
  { age: 49, gender: "Male", bp: 160, cholesterol: 191, diabetes: true, smoking: false, lvef: 40, lvedd: 5.9, lvesd: 4.0, ivsd: 1.3, lpwd: 1.2, eaRatio: 1.2, strokeVolume: 61, cadRisk: true },
  { age: 37, gender: "Female", bp: 167, cholesterol: 284, diabetes: true, smoking: true, lvef: 62, lvedd: 5.3, lvesd: 4.1, ivsd: 1.0, lpwd: 1.2, eaRatio: 1.3, strokeVolume: 52, cadRisk: true },
  { age: 71, gender: "Female", bp: 128, cholesterol: 226, diabetes: true, smoking: false, lvef: 56, lvedd: 6.5, lvesd: 4.8, ivsd: 1.3, lpwd: 0.9, eaRatio: 1.1, strokeVolume: 71, cadRisk: true },
  { age: 41, gender: "Male", bp: 164, cholesterol: 197, diabetes: false, smoking: true, lvef: 49, lvedd: 4.5, lvesd: 3.9, ivsd: 1.4, lpwd: 0.9, eaRatio: 1.5, strokeVolume: 62, cadRisk: true },
  { age: 55, gender: "Female", bp: 155, cholesterol: 200, diabetes: true, smoking: false, lvef: 41, lvedd: 5.0, lvesd: 3.2, ivsd: 1.0, lpwd: 1.1, eaRatio: 0.6, strokeVolume: 71, cadRisk: true },
  { age: 43, gender: "Female", bp: 145, cholesterol: 192, diabetes: false, smoking: false, lvef: 60, lvedd: 5.8, lvesd: 3.2, ivsd: 1.5, lpwd: 1.1, eaRatio: 0.7, strokeVolume: 66, cadRisk: true },
  { age: 73, gender: "Female", bp: 154, cholesterol: 200, diabetes: true, smoking: true, lvef: 56, lvedd: 5.3, lvesd: 3.3, ivsd: 1.1, lpwd: 0.9, eaRatio: 1.0, strokeVolume: 60, cadRisk: true },
  { age: 52, gender: "Male", bp: 117, cholesterol: 187, diabetes: true, smoking: true, lvef: 61, lvedd: 5.9, lvesd: 5.2, ivsd: 1.0, lpwd: 0.8, eaRatio: 0.6, strokeVolume: 46, cadRisk: true },
  { age: 38, gender: "Female", bp: 138, cholesterol: 225, diabetes: true, smoking: false, lvef: 39, lvedd: 4.6, lvesd: 4.2, ivsd: 1.1, lpwd: 0.8, eaRatio: 1.1, strokeVolume: 49, cadRisk: true },
  { age: 59, gender: "Male", bp: 164, cholesterol: 283, diabetes: false, smoking: true, lvef: 32, lvedd: 4.8, lvesd: 4.8, ivsd: 0.9, lpwd: 1.4, eaRatio: 0.9, strokeVolume: 62, cadRisk: true },
  { age: 48, gender: "Female", bp: 162, cholesterol: 289, diabetes: false, smoking: true, lvef: 56, lvedd: 4.8, lvesd: 4.0, ivsd: 0.9, lpwd: 1.3, eaRatio: 0.8, strokeVolume: 47, cadRisk: true },
  { age: 43, gender: "Male", bp: 164, cholesterol: 186, diabetes: true, smoking: true, lvef: 64, lvedd: 4.9, lvesd: 3.6, ivsd: 1.1, lpwd: 1.4, eaRatio: 0.7, strokeVolume: 71, cadRisk: true },
  { age: 60, gender: "Male", bp: 141, cholesterol: 202, diabetes: false, smoking: true, lvef: 60, lvedd: 5.6, lvesd: 3.9, ivsd: 1.3, lpwd: 0.9, eaRatio: 0.9, strokeVolume: 61, cadRisk: true },
  { age: 36, gender: "Female", bp: 160, cholesterol: 287, diabetes: true, smoking: false, lvef: 44, lvedd: 6.2, lvesd: 5.0, ivsd: 1.4, lpwd: 1.4, eaRatio: 1.2, strokeVolume: 60, cadRisk: true },
  { age: 54, gender: "Male", bp: 153, cholesterol: 275, diabetes: false, smoking: true, lvef: 45, lvedd: 6.6, lvesd: 4.6, ivsd: 1.3, lpwd: 0.9, eaRatio: 1.1, strokeVolume: 50, cadRisk: true },
  { age: 62, gender: "Female", bp: 127, cholesterol: 254, diabetes: false, smoking: false, lvef: 42, lvedd: 6.4, lvesd: 5.3, ivsd: 0.9, lpwd: 1.1, eaRatio: 0.7, strokeVolume: 51, cadRisk: true },
  { age: 41, gender: "Male", bp: 115, cholesterol: 265, diabetes: false, smoking: false, lvef: 64, lvedd: 5.0, lvesd: 4.7, ivsd: 1.3, lpwd: 1.3, eaRatio: 0.6, strokeVolume: 58, cadRisk: true },
  { age: 42, gender: "Female", bp: 127, cholesterol: 201, diabetes: true, smoking: false, lvef: 40, lvedd: 5.5, lvesd: 4.4, ivsd: 1.2, lpwd: 1.0, eaRatio: 0.5, strokeVolume: 82, cadRisk: true },
  { age: 69, gender: "Female", bp: 128, cholesterol: 286, diabetes: false, smoking: false, lvef: 50, lvedd: 5.0, lvesd: 4.5, ivsd: 1.4, lpwd: 1.1, eaRatio: 0.5, strokeVolume: 84, cadRisk: true },
  { age: 48, gender: "Male", bp: 131, cholesterol: 268, diabetes: false, smoking: true, lvef: 40, lvedd: 5.1, lvesd: 5.4, ivsd: 1.4, lpwd: 0.9, eaRatio: 1.5, strokeVolume: 59, cadRisk: true },
  { age: 51, gender: "Female", bp: 146, cholesterol: 201, diabetes: true, smoking: true, lvef: 59, lvedd: 5.7, lvesd: 3.8, ivsd: 1.4, lpwd: 1.0, eaRatio: 0.9, strokeVolume: 77, cadRisk: true },
  { age: 70, gender: "Female", bp: 141, cholesterol: 271, diabetes: true, smoking: false, lvef: 64, lvedd: 4.7, lvesd: 3.1, ivsd: 1.1, lpwd: 1.2, eaRatio: 1.3, strokeVolume: 71, cadRisk: true },
  { age: 74, gender: "Male", bp: 165, cholesterol: 208, diabetes: true, smoking: false, lvef: 51, lvedd: 5.0, lvesd: 4.3, ivsd: 1.3, lpwd: 1.2, eaRatio: 1.5, strokeVolume: 73, cadRisk: true },
  { age: 38, gender: "Female", bp: 150, cholesterol: 192, diabetes: true, smoking: false, lvef: 60, lvedd: 6.7, lvesd: 4.7, ivsd: 1.0, lpwd: 1.3, eaRatio: 0.6, strokeVolume: 81, cadRisk: true },
  { age: 36, gender: "Female", bp: 168, cholesterol: 261, diabetes: false, smoking: false, lvef: 43, lvedd: 5.6, lvesd: 4.9, ivsd: 1.5, lpwd: 1.1, eaRatio: 1.0, strokeVolume: 49, cadRisk: true },
  { age: 40, gender: "Male", bp: 112, cholesterol: 181, diabetes: false, smoking: true, lvef: 53, lvedd: 5.5, lvesd: 3.5, ivsd: 0.9, lpwd: 1.2, eaRatio: 1.6, strokeVolume: 73, cadRisk: true },
  { age: 38, gender: "Male", bp: 137, cholesterol: 208, diabetes: false, smoking: false, lvef: 61, lvedd: 4.5, lvesd: 5.2, ivsd: 0.8, lpwd: 0.8, eaRatio: 1.4, strokeVolume: 76, cadRisk: false },
  { age: 63, gender: "Female", bp: 119, cholesterol: 264, diabetes: false, smoking: true, lvef: 61, lvedd: 5.1, lvesd: 5.4, ivsd: 0.9, lpwd: 0.9, eaRatio: 1.0, strokeVolume: 50, cadRisk: true },
  { age: 52, gender: "Female", bp: 160, cholesterol: 258, diabetes: false, smoking: false, lvef: 44, lvedd: 6.5, lvesd: 3.6, ivsd: 1.3, lpwd: 1.4, eaRatio: 1.3, strokeVolume: 46, cadRisk: true },
  { age: 60, gender: "Male", bp: 144, cholesterol: 231, diabetes: true, smoking: false, lvef: 64, lvedd: 4.9, lvesd: 5.2, ivsd: 1.1, lpwd: 0.8, eaRatio: 1.4, strokeVolume: 50, cadRisk: true },
  { age: 68, gender: "Male", bp: 138, cholesterol: 206, diabetes: false, smoking: false, lvef: 32, lvedd: 5.5, lvesd: 3.2, ivsd: 1.1, lpwd: 1.2, eaRatio: 0.9, strokeVolume: 48, cadRisk: true }
];

// Traditional & Demographic Heart Disease Dataset provided by user
export const CLEVELAND_DIABETES_DATASET: ClevelandRecord[] = [
  { age: 67, gender: "Male", cp: 2, trestbps: 111, chol: 536, fbs: false, restecg: 2, thalach: 88, exang: false, oldpeak: 1.3, slope: 3, ca: 2, thal: 3, smoking: true, diabetes: false, bmi: 23.4, heartDisease: true },
  { age: 57, gender: "Male", cp: 3, trestbps: 109, chol: 107, fbs: false, restecg: 2, thalach: 119, exang: false, oldpeak: 5.4, slope: 2, ca: 0, thal: 3, smoking: false, diabetes: true, bmi: 35.4, heartDisease: false },
  { age: 43, gender: "Male", cp: 4, trestbps: 171, chol: 508, fbs: false, restecg: 1, thalach: 113, exang: false, oldpeak: 3.7, slope: 3, ca: 0, thal: 7, smoking: true, diabetes: true, bmi: 29.9, heartDisease: false },
  { age: 71, gender: "Female", cp: 4, trestbps: 90, chol: 523, fbs: false, restecg: 2, thalach: 152, exang: false, oldpeak: 4.7, slope: 2, ca: 1, thal: 3, smoking: true, diabetes: false, bmi: 15.2, heartDisease: true },
  { age: 36, gender: "Male", cp: 2, trestbps: 119, chol: 131, fbs: false, restecg: 2, thalach: 128, exang: false, oldpeak: 5.9, slope: 3, ca: 1, thal: 3, smoking: true, diabetes: false, bmi: 16.7, heartDisease: true },
  { age: 49, gender: "Male", cp: 1, trestbps: 186, chol: 571, fbs: false, restecg: 0, thalach: 176, exang: false, oldpeak: 4, slope: 3, ca: 0, thal: 3, smoking: true, diabetes: false, bmi: 33.8, heartDisease: false },
  { age: 67, gender: "Male", cp: 1, trestbps: 113, chol: 127, fbs: true, restecg: 0, thalach: 68, exang: false, oldpeak: 6.1, slope: 2, ca: 3, thal: 3, smoking: true, diabetes: false, bmi: 26.2, heartDisease: false },
  { age: 47, gender: "Male", cp: 2, trestbps: 103, chol: 305, fbs: false, restecg: 0, thalach: 185, exang: false, oldpeak: 1.9, slope: 2, ca: 0, thal: 3, smoking: true, diabetes: false, bmi: 25.1, heartDisease: false },
  { age: 51, gender: "Female", cp: 4, trestbps: 91, chol: 402, fbs: false, restecg: 1, thalach: 132, exang: false, oldpeak: 2.2, slope: 3, ca: 0, thal: 7, smoking: false, diabetes: false, bmi: 31.3, heartDisease: false },
  { age: 39, gender: "Female", cp: 2, trestbps: 103, chol: 491, fbs: false, restecg: 1, thalach: 106, exang: false, oldpeak: 2, slope: 1, ca: 2, thal: 3, smoking: true, diabetes: false, bmi: 27.6, heartDisease: true }
];

/**
 * Predict risk based on dataset using a k-Nearest Neighbors (KNN) classification metric.
 * It searches the CLINICAL_TRIAL_DATASET to find patients with the closest diagnostic profile.
 */
export function predictCadFromClinicalTrial(patient: {
  age: number;
  gender: string;
  systolicBp: number;
  cholesterol: number;
  diabetes: boolean;
  smoking: boolean;
  echoLvef: number;
  echoLvedd: number;
}): {
  predictedScore: number;
  closestMatches: Array<{ record: ClinicalTrialRecord; distance: number }>;
} {
  // Normalize patient features to create a standardized feature vector [0-1] for distance
  const targetVector = [
    patient.age / 90, // Normalizer for age
    patient.gender === "Male" ? 1 : 0,
    patient.systolicBp / 220,
    patient.cholesterol / 450,
    patient.diabetes ? 1 : 0,
    patient.smoking ? 1 : 0,
    patient.echoLvef / 75,
    (patient.echoLvedd || 50) / 80
  ];

  // Calculate Euclidean distances over clinical trial dataset records
  const distances = CLINICAL_TRIAL_DATASET.map(row => {
    // Normalizer mapping
    const rowVector = [
      row.age / 90,
      row.gender === "Male" ? 1 : 0,
      row.bp / 220,
      row.cholesterol / 450,
      row.diabetes ? 1 : 0,
      row.smoking ? 1 : 0,
      row.lvef / 75,
      (row.lvedd * 10 || 50) / 80 // cm to mm translation helper
    ];

    // Compute Euclidean distance
    let sumSq = 0;
    for (let i = 0; i < targetVector.length; i++) {
      const diff = targetVector[i] - rowVector[i];
      sumSq += diff * diff;
    }
    const dist = Math.sqrt(sumSq);

    return {
      record: row,
      distance: dist
    };
  });

  // Sort by ascending distance (closest profile first)
  distances.sort((a, b) => a.distance - b.distance);

  // Take top-5 neighbors
  const kNeighbors = distances.slice(0, 5);

  // Calculate percentage of positive risk cases among neighbors
  const positiveCount = kNeighbors.filter(n => n.record.cadRisk).length;
  
  // Predict risk proportion (e.g. 4/5 = 80%) with a base clinical scaling factor
  let predictedScore = Math.round((positiveCount / 5) * 100);
  
  // Ensure non-zero boundaries for safety
  if (predictedScore === 0 && (patient.echoLvef < 45 || Math.abs(patient.systolicBp - 120) > 40)) {
    predictedScore = 20; // safe baseline clinical floor
  } else if (predictedScore === 100 && patient.echoLvef >= 55) {
    predictedScore = 85; // safe clinical ceiling if contractility is fully preserved
  }

  return {
    predictedScore: Math.max(5, Math.min(99, predictedScore)),
    closestMatches: kNeighbors
  };
}
