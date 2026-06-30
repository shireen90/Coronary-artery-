export interface PatientRecord {
  id?: string;
  name: string;
  mrn: string; // Medical Record Number
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  
  // Demographics & Traditional Risk Factors
  systolicBp: number;
  diastolicBp: number;
  cholesterol: number; // Total Cholesterol in mg/dL
  hdl: number; // HDL in mg/dL
  diabetes: boolean;
  smoking: boolean;
  familyHistory: boolean;
  
  // ECG Parameters
  ecgHeartRate: number;
  ecgQtInterval: number; // in ms
  ecgStElevation: number; // in mm (positive for elevation, negative for depression)
  ecgTInversion: boolean;
  ecgQrsDuration: number; // in ms
  ecgArrhythmia: 'Normal Sinus' | 'Atrial Fibrillation' | 'Sinus Tachycardia' | 'Sinus Bradycardia' | 'PVCs';
  
  // Echocardiogram Parameters
  echoLvef: number; // Left Ventricular Ejection Fraction (%)
  echoLvedd: number; // Left Ventricular End-Diastolic Dimension (mm)
  echoSeptalThickness: number; // Septal Wall Thickness (mm)
  echoMitralEtoA: number; // Mitral E/A Ratio
  echoAorticJetVelocity: number; // Aortic Jet Velocity (m/s)
  echoRwma: boolean; // Regional Wall Motion Abnormalities
  
  // Risk Analytics Outcome
  riskScore: number; // 0 - 100%
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  predictedAt: string; // ISO date string
  
  // AI Clinical Insights
  clinicalSummary?: string;
  recommendations?: string[];
}

export interface HospitalPortalInfo {
  hospitalName: string;
  departmentName: string;
  apiEndpoint: string;
  authToken: string;
  status: 'Connected' | 'Degraded' | 'Offline';
}
