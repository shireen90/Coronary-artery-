import { PatientRecord, HospitalPortalInfo } from "./types";

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    name: "Marcus Vance",
    age: 67,
    gender: "Male",
    systolicBp: 158,
    diastolicBp: 94,
    cholesterol: 245,
    hdl: 38,
    diabetes: true,
    hypertension: true,
    smoking: true,
    familyHistory: true,
    
    // ECG: Anteroseptal Ischemia signs
    ecgHeartRate: 88,
    ecgQtInterval: 420,
    ecgStElevation: -1.8, // ST depression (subendocardial ischemia)
    ecgTInversion: true,
    ecgQrsDuration: 114,
    ecgArrhythmia: "PVCs",
    
    // Echo: Severe anterior wall hypokinesis
    echoLvef: 38, // reduced
    echoLvedd: 58, // enlarged
    echoSeptalThickness: 13, // hypertrophied
    echoMitralEtoA: 0.65, // diastolic dysfunction
    echoAorticJetVelocity: 2.1,
    echoRwma: true, // Yes! Regional Wall Motion Abnormality
    
    riskScore: 88,
    riskLevel: "Critical",
    predictedAt: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    clinicalSummary: "Patient presents with multiple high-risk factors including Type 2 Diabetes, hypertension, and active tobacco abuse. Electrocardiogram reveals significant ST-segment depression in leads V3-V6 coupled with lateral T-wave inversions. Corresponding transthoracic echocardiogram confirms a severely reduced LVEF of 38% with a dilated left ventricle (LVEDD 58mm) and distinct antero-apical regional wall motion abnormalities. This physiological alignment strongly points toward significant left anterior descending (LAD) coronary artery disease.",
    recommendations: [
      "Immediate cardiology consultation for urgent diagnostic coronary angiography.",
      "Initiate high-intensity statin therapy (Atorvastatin 80mg daily) and dual antiplatelet therapy (DAPT) assuming no contraindications.",
      "Optimize guideline-directed medical therapy (GDMT) including a low-dose beta-blocker (Metoprolol Succinate) and an ACE inhibitor (Lisinopril).",
      "Continuous cardiac telemetry and serial troponin monitoring to rule out active Non-ST-elevation myocardial infarction (NSTEMI).",
      "Strict lifestyle counseling regarding immediate tobacco cessation and tight glycemic control."
    ]
  },
  {
    name: "Dr. Richard Chen",
    age: 51,
    gender: "Male",
    systolicBp: 134,
    diastolicBp: 84,
    cholesterol: 198,
    hdl: 52,
    diabetes: false,
    hypertension: true,
    smoking: false,
    familyHistory: false,
    
    // ECG: Normal resting state
    ecgHeartRate: 72,
    ecgQtInterval: 410,
    ecgStElevation: 0.0,
    ecgTInversion: false,
    ecgQrsDuration: 92,
    ecgArrhythmia: "Normal Sinus",
    
    // Echo: Good contractility
    echoLvef: 58,
    echoLvedd: 48,
    echoSeptalThickness: 10,
    echoMitralEtoA: 1.1,
    echoAorticJetVelocity: 1.4,
    echoRwma: false,
    
    riskScore: 28,
    riskLevel: "Moderate",
    predictedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    clinicalSummary: "Middle-aged male with pre-hypertensive resting blood pressure, otherwise displaying favorable metabolic markers. Normal electrocardiogram without ischemic changes or conduction defects. Transthoracic echocardiogram demonstrates normal LV size, normal wall thickness, and preserved systolic function (LVEF 58%) with no regional wall motion abnormalities. Low-moderate risk level is driven primarily by age and moderate systolic blood pressure.",
    recommendations: [
      "Routine annual cardiovascular physical and screening lipid panel checkup.",
      "Counsel on low-sodium, Mediterranean-style diet to optimize resting blood pressure.",
      "Incorporate regular moderate-intensity cardiovascular exercise (minimum 150 minutes per week).",
      "No immediate specialized cardiac testing or imaging warranted at this time unless symptoms of angina develop."
    ]
  },
  {
    name: "Sienna Martinez",
    age: 29,
    gender: "Female",
    systolicBp: 112,
    diastolicBp: 72,
    cholesterol: 165,
    hdl: 58,
    diabetes: false,
    hypertension: false,
    smoking: false,
    familyHistory: false,
    
    // ECG: Optimal athletic function
    ecgHeartRate: 58,
    ecgQtInterval: 395,
    ecgStElevation: 0.0,
    ecgTInversion: false,
    ecgQrsDuration: 88,
    ecgArrhythmia: "Normal Sinus",
    
    // Echo: Athletic heart parameters
    echoLvef: 64,
    echoLvedd: 44,
    echoSeptalThickness: 9,
    echoMitralEtoA: 1.4,
    echoAorticJetVelocity: 1.1,
    echoRwma: false,
    
    riskScore: 8,
    riskLevel: "Low",
    predictedAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    clinicalSummary: "Young female presenting with excellent hemodynamics and athletic resting bradycardia (58 bpm). Normal sinus rhythm on electrocardiogram. Echocardiogram demonstrates hyperdynamic left ventricular systolic function with an LVEF of 64% and standard dimensions. Absolutely zero indicators for cardiovascular or coronary artery disease risk.",
    recommendations: [
      "Maintain active exercise regimen and healthy balanced nutrition.",
      "Re-evaluate cardiovascular metrics in 3-5 years as part of general wellness screening.",
      "Reassure patient of highly optimal cardiac performance indicators."
    ]
  }
];

export const MOCK_ECG_WAVEFORMS = {
  normal: Array.from({ length: 120 }, (_, i) => {
    // Generate a beautiful simulated P-Q-R-S-T curve
    const x = i % 40;
    let y = 0;
    if (x >= 5 && x <= 8) { // P wave
      y = Math.sin(((x - 5) / 3) * Math.PI) * 0.15;
    } else if (x === 12) { // Q wave
      y = -0.15;
    } else if (x === 13) { // R wave
      y = 1.0;
    } else if (x === 14) { // S wave
      y = -0.3;
    } else if (x >= 15 && x <= 18) { // ST segment (Flat is normal)
      y = 0;
    } else if (x >= 19 && x <= 25) { // T wave
      y = Math.sin(((x - 19) / 6) * Math.PI) * 0.25;
    }
    return { name: i, value: y };
  }),
  stDepression: Array.from({ length: 120 }, (_, i) => {
    const x = i % 40;
    let y = 0;
    if (x >= 5 && x <= 8) { // P wave
      y = Math.sin(((x - 5) / 3) * Math.PI) * 0.15;
    } else if (x === 12) { // Q wave
      y = -0.15;
    } else if (x === 13) { // R wave
      y = 1.0;
    } else if (x === 14) { // S wave
      y = -0.4;
    } else if (x >= 15 && x <= 18) { // ST segment (Depressed)
      y = -0.25; // ST Depression!
    } else if (x >= 19 && x <= 25) { // T wave (Inverted)
      y = -Math.sin(((x - 19) / 6) * Math.PI) * 0.2; // T-wave inversion!
    }
    return { name: i, value: y };
  }),
  stElevation: Array.from({ length: 120 }, (_, i) => {
    const x = i % 40;
    let y = 0;
    if (x >= 5 && x <= 8) { // P wave
      y = Math.sin(((x - 5) / 3) * Math.PI) * 0.15;
    } else if (x === 12) { // Q wave
      y = -0.1;
    } else if (x === 13) { // R wave
      y = 1.0;
    } else if (x === 14) { // S wave (Elevated baseline)
      y = 0.2;
    } else if (x >= 15 && x <= 18) { // ST segment (Elevated)
      y = 0.35; // ST Elevation!
    } else if (x >= 19 && x <= 25) { // T wave (Fused)
      y = Math.sin(((x - 19) / 6) * Math.PI) * 0.4;
    }
    return { name: i, value: y };
  })
};

export const HOSPITAL_INTEGRATION_INFO: HospitalPortalInfo = {
  hospitalName: "Metropolitan Cardiac Care Center",
  departmentName: "Cardiovascular Telemetry & Predictive Medicine",
  apiEndpoint: "https://fhir.metropolitan-heart.org/v4/Patient/$cad-evaluate",
  authToken: "Bearer fhir_cad_token_39da857b_839d_42cb",
  status: "Connected"
};

export const HL7_JSON_TEMPLATE = `{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "patient",
      "valueReference": { "reference": "Patient/pat-009841" }
    },
    {
      "name": "ecg-observation",
      "resource": {
        "resourceType": "Observation",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "8601-7", "display": "EKG 12 lead panel" }] },
        "component": [
          { "code": { "text": "Heart Rate" }, "valueQuantity": { "value": 88, "unit": "bpm" } },
          { "code": { "text": "ST Deviation" }, "valueQuantity": { "value": -1.8, "unit": "mm" } }
        ]
      }
    },
    {
      "name": "echo-observation",
      "resource": {
        "resourceType": "Observation",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "10230-1", "display": "Echocardiogram study" }] },
        "component": [
          { "code": { "text": "LVEF" }, "valueQuantity": { "value": 38, "unit": "%" } },
          { "code": { "text": "RWMA" }, "valueBoolean": true }
        ]
      }
    }
  ]
}`;
