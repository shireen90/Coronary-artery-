import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Helper to calculate baseline risk score mathematically on the server
function calculateRiskScore(data: any): { score: number; level: 'Critical' | 'High' | 'Moderate' | 'Low' } {
  let scorePoints = 0;

  // 1. Traditional Factors (Max 40 points)
  // Age
  if (data.age > 75) scorePoints += 10;
  else if (data.age > 60) scorePoints += 8;
  else if (data.age > 45) scorePoints += 5;
  else if (data.age > 30) scorePoints += 2;

  // Gender
  if (data.gender === 'Male') scorePoints += 3; // Male gender is an independent hazard factor
  
  // Blood Pressure
  const sbp = data.systolicBp || 120;
  const dbp = data.diastolicBp || 80;
  if (sbp >= 160 || dbp >= 100) scorePoints += 8;
  else if (sbp >= 140 || dbp >= 90) scorePoints += 5;
  else if (sbp >= 130 || dbp >= 80) scorePoints += 3;

  // Lipids (Total Cholesterol / HDL Ratio approximation)
  const chol = data.cholesterol || 200;
  const hdl = data.hdl || 50;
  const ratio = hdl > 0 ? (chol / hdl) : 4;
  if (ratio >= 6) scorePoints += 7;
  else if (ratio >= 5) scorePoints += 5;
  else if (ratio >= 3.5) scorePoints += 2;

  // Comorbidities
  if (data.diabetes) scorePoints += 8;
  if (data.hypertension) scorePoints += 6;
  if (data.smoking) scorePoints += 6;
  if (data.familyHistory) scorePoints += 6;

  // 2. ECG Factors (Max 30 points)
  // ST-segment changes (critical sign of ischemia/infarction)
  const absSt = Math.abs(data.ecgStElevation || 0);
  if (absSt >= 2) scorePoints += 12; // severe elevation or depression
  else if (absSt >= 1) scorePoints += 8;
  else if (absSt >= 0.5) scorePoints += 4;

  // T-wave inversion
  if (data.ecgTInversion) scorePoints += 6;

  // QRS duration (bundle branch block / delay)
  if (data.ecgQrsDuration > 120) scorePoints += 4;

  // Arrhythmias
  if (data.ecgArrhythmia === 'Atrial Fibrillation') scorePoints += 8;
  else if (data.ecgArrhythmia === 'PVCs') scorePoints += 5;
  else if (data.ecgArrhythmia === 'Sinus Tachycardia') scorePoints += 3;

  // Heart Rate
  if (data.ecgHeartRate > 100) scorePoints += 3;
  else if (data.ecgHeartRate < 50) scorePoints += 2;

  // 3. Echocardiogram Factors (Max 30 points)
  // Left Ventricular Ejection Fraction (LVEF) - Primary indicator of systolic function
  const lvef = data.echoLvef || 60;
  if (lvef < 35) scorePoints += 15; // Severe dysfunction
  else if (lvef < 45) scorePoints += 10; // Moderate dysfunction
  else if (lvef < 50) scorePoints += 6; // Mild dysfunction
  else if (lvef < 55) scorePoints += 2; // Low normal

  // Regional Wall Motion Abnormalities (RWMA) - Hallmark of prior/current localized ischemia
  if (data.echoRwma) scorePoints += 12;

  // Left Ventricular End-Diastolic Dimension (LVEDD) - dilation indicator
  const lvedd = data.echoLvedd || 45;
  if (lvedd > 56) scorePoints += 4;

  // Septal wall thickness
  const septal = data.echoSeptalThickness || 10;
  if (septal > 12) scorePoints += 3;

  // Mitral E/A Ratio (diastolic dysfunction indicator)
  const ea = data.echoMitralEtoA || 1.2;
  if (ea < 0.8 || ea > 2.0) scorePoints += 3;

  // Aortic Jet Velocity
  const velocity = data.echoAorticJetVelocity || 1.5;
  if (velocity > 4.0) scorePoints += 4; // Severe aortic stenosis contributes to risk
  else if (velocity > 3.0) scorePoints += 2;

  // Normalize final score to a percentage (maximum raw points is around 100)
  const finalScore = Math.min(Math.max(Math.round(scorePoints), 5), 99);

  // Determine alert category
  let level: 'Critical' | 'High' | 'Moderate' | 'Low' = 'Low';
  if (finalScore >= 75) level = 'Critical';
  else if (finalScore >= 50) level = 'High';
  else if (finalScore >= 25) level = 'Moderate';

  return { score: finalScore, level };
}

// REST API for Clinical CAD Risk Prediction
app.post("/api/analyze", async (req, res) => {
  try {
    const patientData = req.body;
    
    if (!patientData || !patientData.name) {
      return res.status(400).json({ error: "Patient name is required" });
    }

    // 1. Calculate baseline predictive metrics
    const { score, level } = calculateRiskScore(patientData);

    // 2. Prepare context for Gemini AI evaluation
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in environment variables. Falling back to rule-based summary.");
      return res.json({
        ...patientData,
        riskScore: score,
        riskLevel: level,
        predictedAt: new Date().toISOString(),
        clinicalSummary: `A statistical baseline CAD risk calculation has placed this patient in the ${level.toUpperCase()} category with a score of ${score}%. The major contributing factors are LVEF of ${patientData.echoLvef}%, blood pressure of ${patientData.systolicBp}/${patientData.diastolicBp} mmHg, and ECG ST-deviation of ${patientData.ecgStElevation}mm. This baseline evaluation should be verified by a cardiologist.`,
        recommendations: [
          `Schedule specialized cardiology evaluation based on the ${level} risk profile.`,
          patientData.echoLvef < 50 ? "Initiate standard guideline-directed medical therapy (GDMT) for reduced ejection fraction." : "Monitor ventricular function closely.",
          Math.abs(patientData.ecgStElevation) >= 1 ? "Perform immediate urgent 12-lead ECG monitor and check serial troponins to rule out acute coronary syndrome (ACS)." : "Consider ambulatory ECG monitoring.",
          patientData.smoking ? "Provide smoking cessation resources and immediate counseling." : "Maintain cardiac-healthy lifestyle habits.",
          "Perform standard lipid panel verification and optimize statin therapy."
        ]
      });
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
      You are a Board-Certified Cardiologist AI Assistant integrated into a secure clinical hospital portal.
      Analyze the following patient cardiovascular and diagnostic metrics to predict the risk of Coronary Artery Disease (CAD).
      
      Patient Profile:
      - Name: ${patientData.name}
      - Age: ${patientData.age} | Gender: ${patientData.gender}
      - BP: ${patientData.systolicBp}/${patientData.diastolicBp} mmHg
      - Total Cholesterol: ${patientData.cholesterol} mg/dL | HDL: ${patientData.hdl} mg/dL
      - Comorbidities: Diabetes: ${patientData.diabetes ? 'Yes' : 'No'}, Hypertension: ${patientData.hypertension ? 'Yes' : 'No'}, Smoking: ${patientData.smoking ? 'Yes' : 'No'}, Family History: ${patientData.familyHistory ? 'Yes' : 'No'}
      
      Diagnostic ECG Parameters:
      - Heart Rate: ${patientData.ecgHeartRate} bpm
      - QT Interval: ${patientData.ecgQtInterval} ms | QRS Duration: ${patientData.ecgQrsDuration} ms
      - ST Segment Deviation: ${patientData.ecgStElevation} mm (Note: non-zero values suggest ischemia or acute injury)
      - T-wave Inversion: ${patientData.ecgTInversion ? 'Present' : 'Absent'}
      - Cardiac Rhythm: ${patientData.ecgArrhythmia}
      
      Diagnostic Echocardiogram (Echo) Parameters:
      - Left Ventricular Ejection Fraction (LVEF): ${patientData.echoLvef}% (Normal is 50-70%)
      - Left Ventricular End-Diastolic Dimension (LVEDD): ${patientData.echoLvedd} mm
      - Septal Thickness: ${patientData.echoSeptalThickness} mm
      - Mitral E/A Ratio: ${patientData.echoMitralEtoA}
      - Aortic Jet Velocity: ${patientData.echoAorticJetVelocity} m/s
      - Regional Wall Motion Abnormalities (RWMA): ${patientData.echoRwma ? 'Present' : 'Absent'}
      
      Predictive Analytics Score:
      - Custom algorithm risk score calculated: ${score}% (${level} risk category)

      Based on these parameters, construct a professional clinical consultation report.
      Ensure you point out the physiological correlations, specifically how the ECG abnormality (e.g. ST segment deviation of ${patientData.ecgStElevation}mm or T-wave inversion) correlates with the Echocardiogram findings (like ${patientData.echoRwma ? 'Regional Wall Motion Abnormalities' : 'absence of localized hypokinesis'} or ejection fraction of ${patientData.echoLvef}%).
      
      CRITICAL CONSTRAINT: Do NOT mention "Google", "Gemini", "AI", "model", "assistant", or any technology or software brand. The entire report and recommendations must read as if written directly by a human board-certified cardiologist in a clinical setting.
      
      You must respond strictly with a valid JSON object in this format. No other text, no markdown blockquotes (do NOT wrap in \`\`\`json ... \`\`\`):
      {
        "clinicalSummary": "Write a professional, 2-3 sentence clinical overview explaining the risk level and the physiological alignment between ECG ischemia evidence and Echo contractility data.",
        "recommendations": [
          "Clinical recommendation 1 (prioritized, e.g. urgent catheterization, outpatient myocardial perfusion imaging, etc.)",
          "Clinical recommendation 2",
          "Clinical recommendation 3",
          "Clinical recommendation 4",
          "Clinical recommendation 5"
        ]
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json"
      }
    });

    const aiText = aiResponse.text?.trim() || "{}";
    
    // Parse response
    let aiJson = { clinicalSummary: "", recommendations: [] };
    try {
      aiJson = JSON.parse(aiText);
    } catch (e) {
      // In case formatting fails, extract from standard markdown tags
      const match = aiText.match(/\{[\s\S]*\}/);
      if (match) {
        aiJson = JSON.parse(match[0]);
      } else {
        throw new Error("Unable to parse AI JSON response");
      }
    }

    return res.json({
      ...patientData,
      riskScore: score,
      riskLevel: level,
      predictedAt: new Date().toISOString(),
      clinicalSummary: aiJson.clinicalSummary || `Baseline CAD risk category is assessed as ${level} (${score}%) based on standard cardiovascular parameters, reduction in ejection fraction to ${patientData.echoLvef}%, and ECG abnormalities.`,
      recommendations: aiJson.recommendations?.length ? aiJson.recommendations : [
        "Refer for direct cardiological consultation.",
        "Optimize anti-anginal and lipid-lowering medical regimens.",
        "Recommend regular ambulatory or stress monitoring based on overall profile."
      ]
    });

  } catch (error: any) {
    console.error("Error running CAD analysis:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

async function startServer() {
  // Vite integration for asset rendering
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CAD Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
