import React, { useState, useMemo, useRef } from "react";
import { 
  Heart, 
  Activity, 
  Sparkles, 
  Upload, 
  Printer, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  ShieldAlert, 
  Lightbulb, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  Database
} from "lucide-react";
import { predictCadFromClinicalTrial } from "../dataset";

interface CardioVisionAIProps {
  onSavePatient?: (patientData: any) => void;
  onNavigateToTab?: (tab: "cardiovision" | "new-evaluation" | "clinical-suite") => void;
}

export function CardioVisionAI({ onSavePatient, onNavigateToTab }: CardioVisionAIProps) {
  // Wizard steps: 1 = Clinical, 2 = Echo Analysis, 3 = ECG Analysis, 4 = Result Report
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Form State
  const [patientName, setPatientName] = useState("Patient A");
  const [assessmentDate, setAssessmentDate] = useState("2026-06-30");

  // Step 1: Clinical Parameters
  const [chestPainType, setChestPainType] = useState<"Typical Angina" | "Atypical Angina" | "Non-Anginal" | "Asymptomatic">("Typical Angina");
  const [bloodPressure, setBloodPressure] = useState<number>(135);
  const [cholesterol, setCholesterol] = useState<number>(244);
  const [maxHeartRate, setMaxHeartRate] = useState<number>(142);
  const [exerciseAngina, setExerciseAngina] = useState<"Yes" | "No">("No");
  const [oldPeak, setOldPeak] = useState<number>(1.2);
  const [smoking, setSmoking] = useState<"Yes" | "No">("No");
  const [diabetes, setDiabetes] = useState<"Yes" | "No">("No");
  const [age, setAge] = useState<number>(58);
  const [gender, setGender] = useState<"Male" | "Female">("Male");

  // Step 2: Echo Analysis Parameters
  const [lvef, setLvef] = useState<number>(45);
  const [lvedd, setLvedd] = useState<number>(54); // in mm
  const [septalThickness, setSeptalThickness] = useState<number>(12.5); // in mm
  const [mitralEtoA, setMitralEtoA] = useState<number>(0.8);
  const [aorticJetVelocity, setAorticJetVelocity] = useState<number>(1.8);
  const [rwma, setRwma] = useState<"Yes" | "No">("No");

  // Step 3: ECG Calibration & Parameters
  const [ecgHeartRate, setEcgHeartRate] = useState<number>(75);
  const [ecgStElevation, setEcgStElevation] = useState<number>(0.8); // mm
  const [ecgTInversion, setEcgTInversion] = useState<"Yes" | "No">("No");

  // Perform multi-model predictions dynamically from dataset and inputs
  const predictions = useMemo(() => {
    // 1. Clinical Model Calculation
    let clinicalBase = 15;
    if (chestPainType === "Typical Angina") clinicalBase += 35;
    else if (chestPainType === "Atypical Angina") clinicalBase += 20;
    else if (chestPainType === "Non-Anginal") clinicalBase += 10;
    else clinicalBase += 3;

    clinicalBase += (bloodPressure > 140 ? 12 : bloodPressure > 130 ? 6 : 0);
    clinicalBase += (cholesterol > 240 ? 15 : cholesterol > 200 ? 8 : 0);
    clinicalBase += (maxHeartRate < 130 ? 10 : 0);
    if (exerciseAngina === "Yes") clinicalBase += 18;
    clinicalBase += (oldPeak > 1.5 ? 15 : oldPeak > 0.5 ? 8 : 0);
    if (smoking === "Yes") clinicalBase += 12;
    if (diabetes === "Yes") clinicalBase += 15;
    if (age > 60) clinicalBase += 10;
    else if (age > 45) clinicalBase += 5;
    if (gender === "Male") clinicalBase += 4;

    const clinicalScore = Math.max(8, Math.min(95, clinicalBase));

    // 2. Echo Model Calculation
    let echoBase = 10;
    if (lvef < 35) echoBase += 45;
    else if (lvef < 50) echoBase += 25;
    else if (lvef < 60) echoBase += 8;

    if (lvedd > 60) echoBase += 15;
    else if (lvedd > 52) echoBase += 8;

    if (septalThickness > 12) echoBase += 10;
    if (mitralEtoA < 0.8) echoBase += 12;
    if (aorticJetVelocity > 2.5) echoBase += 15;
    if (rwma === "Yes") echoBase += 28;

    const echoScore = Math.max(5, Math.min(95, echoBase));

    // 3. Clinical Trial Dataset Model Prediction using k-NN
    const knnRes = predictCadFromClinicalTrial({
      age,
      gender,
      systolicBp: bloodPressure,
      cholesterol,
      diabetes: diabetes === "Yes",
      smoking: smoking === "Yes",
      echoLvef: lvef,
      echoLvedd: lvedd
    });

    const datasetScore = knnRes.predictedScore;

    // Combined AI CAD Prediction (average or weighted)
    // 35% Clinical, 30% Echo, 35% KNN Dataset
    const combinedScore = parseFloat(((clinicalScore * 0.35) + (echoScore * 0.3) + (datasetScore * 0.35)).toFixed(1));

    // Determine Risk level
    let riskLevel: "Low" | "Moderate" | "High" | "Critical" = "Low";
    if (combinedScore >= 75) riskLevel = "Critical";
    else if (combinedScore >= 50) riskLevel = "High";
    else if (combinedScore >= 35) riskLevel = "Moderate";
    else riskLevel = "Low";

    return {
      clinical: parseFloat(clinicalScore.toFixed(1)),
      echo: parseFloat(echoScore.toFixed(1)),
      dataset: datasetScore,
      combined: combinedScore,
      level: riskLevel,
      closestMatches: knnRes.closestMatches
    };
  }, [
    chestPainType, bloodPressure, cholesterol, maxHeartRate, exerciseAngina, oldPeak, smoking, diabetes, age, gender,
    lvef, lvedd, septalThickness, mitralEtoA, aorticJetVelocity, rwma
  ]);

  // Dynamically calibrate/tweak ECG parameters based on the closest dataset match to make it smart
  React.useEffect(() => {
    if (predictions.closestMatches && predictions.closestMatches.length > 0) {
      const bestMatch = predictions.closestMatches[0].record;
      // Synthesize ECG parameters corresponding to the clinical outcomes of the match
      if (bestMatch.cadRisk) {
        setEcgHeartRate(82);
        setEcgStElevation(1.4);
        setEcgTInversion("Yes");
      } else {
        setEcgHeartRate(68);
        setEcgStElevation(0.1);
        setEcgTInversion("No");
      }
    }
  }, [predictions.closestMatches]);

  // AI Recommendations text matching screenshots
  const aiRecommendationText = useMemo(() => {
    if (predictions.level === "Low") {
      return "Low probability of Coronary Artery Disease. Maintain a healthy lifestyle, exercise regularly, eat a balanced diet, avoid smoking, and continue routine medical check-ups.";
    } else if (predictions.level === "Moderate") {
      return "Moderate probability of Coronary Artery Disease. Consult a physician, monitor clinical parameters such as blood pressure and lipid panel, and schedule regular non-invasive follow-ups.";
    } else {
      return "High probability of significant Coronary Artery Disease. Immediate specialist referral to a cardiologist is strongly recommended. Arrange further diagnostic testing such as a myocardial perfusion scan or coronary angiography.";
    }
  }, [predictions.level]);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Simulate PDF Download
  const handleDownloadPDF = () => {
    const reportContent = `
AngioPulse AI CAD Risk Report
=================================
Patient Name: ${patientName}
Date: ${assessmentDate}
Age: ${age} | Gender: ${gender}

Risk Scores:
- Combined CAD Prediction: ${predictions.combined}% [${predictions.level.toUpperCase()} RISK]

Clinical Metrics:
- Chest Pain: ${chestPainType}
- Blood Pressure: ${bloodPressure} mmHg
- Cholesterol: ${cholesterol} mg/dL
- Max HR: ${maxHeartRate} bpm
- Exercise Angina: ${exerciseAngina}
- Old Peak: ${oldPeak} mm

Echo Parameters:
- LVEF: ${lvef}%
- LVEDD: ${lvedd} mm
- Septal Thickness: ${septalThickness} mm
- Mitral E/A: ${mitralEtoA}
- RWMA: ${rwma}

ECG Parameters:
- ST segment: ${ecgStElevation} mm
- T-Wave Inversion: ${ecgTInversion}

Recommendation:
${aiRecommendationText}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AngioPulse_Report_${patientName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run new assessment
  const handleNewAssessment = () => {
    setStep(1);
  };

  return (
    <div id="cardiovision-panel" className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-100 max-w-4xl mx-auto my-4 relative overflow-hidden transition-all duration-300">
      
      {/* Decorative Radial glow matching images */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Title Header with Pulse Icon */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="bg-red-500/20 p-2.5 rounded-full border border-red-500/30 shadow-inner">
            <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold font-display tracking-tight bg-gradient-to-r from-slate-100 via-slate-50 to-slate-200 bg-clip-text text-transparent flex items-center gap-1.5">
            AngioPulse <span className="text-red-500">AI</span>
          </h2>
        </div>
        <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">
          {step === 4 
            ? "Intelligent Coronary Artery Disease Risk Report" 
            : "Intelligent Coronary Artery Disease Risk Assessment"}
        </p>

        {/* Progress bar matching screenshots */}
        {step < 4 && (
          <div className="w-full max-w-2xl mx-auto bg-slate-950 h-1.5 rounded-full mt-6 overflow-hidden border border-slate-850">
            <div 
              className="bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* STEP 1: CLINICAL PARAMETERS */}
      {step === 1 && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold text-sm text-slate-200 tracking-wider font-mono uppercase">
                Clinical Parameters
              </h3>
            </div>
            <div className="text-[10px] bg-slate-950 px-2.5 py-1 rounded font-mono text-slate-500 border border-slate-900">
              Step 1 of 3
            </div>
          </div>

          {/* Demographic Setup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 mb-2">
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Patient Full Name
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full bg-slate-950 border border-slate-800 rounded pl-8 pr-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 55)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("Male")}
                  className={`py-2 rounded text-xs font-mono transition-colors border ${gender === "Male" ? "bg-red-500/10 border-red-500/40 text-red-400 font-bold" : "bg-slate-950 border-slate-850 text-slate-500"}`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender("Female")}
                  className={`py-2 rounded text-xs font-mono transition-colors border ${gender === "Female" ? "bg-red-500/10 border-red-500/40 text-red-400 font-bold" : "bg-slate-950 border-slate-850 text-slate-500"}`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Chest Pain Type */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Chest Pain Type
              </label>
              <select
                value={chestPainType}
                onChange={(e: any) => setChestPainType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="Typical Angina">Typical Angina</option>
                <option value="Atypical Angina">Atypical Angina</option>
                <option value="Non-Anginal">Non-Anginal</option>
                <option value="Asymptomatic">Asymptomatic</option>
              </select>
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Blood Pressure (mmHg)
              </label>
              <input
                type="number"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Cholesterol */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Cholesterol (mg/dL)
              </label>
              <input
                type="number"
                value={cholesterol}
                onChange={(e) => setCholesterol(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Max HR */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Maximum Heart Rate
              </label>
              <input
                type="number"
                value={maxHeartRate}
                onChange={(e) => setMaxHeartRate(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Exercise Angina */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Exercise Induced Angina
              </label>
              <select
                value={exerciseAngina}
                onChange={(e: any) => setExerciseAngina(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Old Peak */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Old Peak
              </label>
              <input
                type="number"
                step="0.1"
                value={oldPeak}
                onChange={(e) => setOldPeak(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* Smoking */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Smoking
              </label>
              <select
                value={smoking}
                onChange={(e: any) => setSmoking(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            {/* Diabetes */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Diabetes
              </label>
              <select
                value={diabetes}
                onChange={(e: any) => setDiabetes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-850 mt-8">
            <button
              disabled
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors bg-slate-800/40 text-slate-600 cursor-not-allowed border border-transparent"
            >
              ← Previous
            </button>
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-100 flex items-center gap-1 shadow-lg shadow-blue-950/20 hover:scale-[1.02]"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ECHO ANALYSIS */}
      {step === 2 && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-400" />
              <h3 className="font-semibold text-sm text-slate-200 tracking-wider font-mono uppercase">
                Echocardiogram Metrics
              </h3>
            </div>
            <div className="text-[10px] bg-slate-950 px-2.5 py-1 rounded font-mono text-slate-500 border border-slate-900">
              Step 2 of 3
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/30 p-5 rounded-xl border border-slate-850">
            {/* LVEF */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                  LV Ejection Fraction (LVEF %)
                </label>
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/40 border border-sky-900/30 px-2 py-0.5 rounded">
                  {lvef}%
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="75"
                value={lvef}
                onChange={(e) => setLvef(parseInt(e.target.value) || 55)}
                className="w-full accent-sky-500 h-1.5 cursor-pointer bg-slate-800 rounded"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Severe (15%)</span>
                <span>Borderline (45%)</span>
                <span>Normal (55%+)</span>
              </div>
            </div>

            {/* LVEDD */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                End-Diastolic Dimension (LVEDD mm)
              </label>
              <input
                type="number"
                value={lvedd}
                onChange={(e) => setLvedd(parseInt(e.target.value) || 48)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Septal Wall Thickness */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Septal Wall Thickness (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={septalThickness}
                onChange={(e) => setSeptalThickness(parseFloat(e.target.value) || 10)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Mitral E/A Ratio */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Mitral Valve E/A Ratio
              </label>
              <input
                type="number"
                step="0.05"
                value={mitralEtoA}
                onChange={(e) => setMitralEtoA(parseFloat(e.target.value) || 1.0)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* Aortic Jet Velocity */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Aortic Jet Velocity (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={aorticJetVelocity}
                onChange={(e) => setAorticJetVelocity(parseFloat(e.target.value) || 1.5)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            {/* RWMA */}
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1 font-bold">
                Regional Wall Motion Abnormality
              </label>
              <select
                value={rwma}
                onChange={(e: any) => setRwma(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
              >
                <option value="No">No (Normal)</option>
                <option value="Yes">Yes (Regional hypokinesis/akinesis)</option>
              </select>
            </div>
          </div>

          {/* Next / Previous */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-850 mt-8">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750"
            >
              ← Previous
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-100 flex items-center gap-1 shadow-lg shadow-blue-950/20 hover:scale-[1.02]"
            >
              Next Step →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: ECG CALIBRATION */}
      {step === 3 && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          
          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-semibold text-sm text-slate-200 tracking-wider font-mono uppercase">
                ECG Calibration & Parameters
              </h3>
            </div>
            <div className="text-[10px] bg-slate-950 px-2.5 py-1 rounded font-mono text-slate-500 border border-slate-900">
              Step 3 of 3
            </div>
          </div>

          {/* ECG Fine-tuning parameters panel */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
                ECG Clinical Override Parameters
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/20 p-4 rounded-xl border border-slate-850">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-bold">
                  Rhythm Rate (bpm)
                </label>
                <input
                  type="number"
                  value={ecgHeartRate}
                  onChange={(e) => setEcgHeartRate(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-bold">
                  ST Deviation (mm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={ecgStElevation}
                  onChange={(e) => setEcgStElevation(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-bold">
                  T-Wave Inversion
                </label>
                <select
                  value={ecgTInversion}
                  onChange={(e: any) => setEcgTInversion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes (Ischemia Indicator)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-850 mt-8">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-750"
            >
              ← Previous
            </button>
            <button
              onClick={() => {
                setStep(4);
                // Also trigger optional save logic to list in workspace
                if (onSavePatient) {
                  onSavePatient({
                    name: patientName,
                    mrn: `MRN-${Math.floor(1000 + Math.random() * 9000)}`,
                    age,
                    gender,
                    systolicBp: bloodPressure,
                    diastolicBp: 80,
                    cholesterol,
                    hdl: 45,
                    diabetes: diabetes === "Yes",
                    smoking: smoking === "Yes",
                    familyHistory: false,
                    ecgHeartRate,
                    ecgQtInterval: 410,
                    ecgStElevation,
                    ecgTInversion: ecgTInversion === "Yes",
                    ecgQrsDuration: 90,
                    ecgArrhythmia: "Normal Sinus",
                    echoLvef: lvef,
                    echoLvedd: lvedd,
                    echoSeptalThickness: septalThickness,
                    echoMitralEtoA: mitralEtoA,
                    echoAorticJetVelocity: aorticJetVelocity,
                    echoRwma: rwma === "Yes",
                    riskScore: Math.round(predictions.combined),
                    riskLevel: predictions.level === "Low" ? "Low" : predictions.level === "Moderate" ? "Moderate" : predictions.level === "High" ? "High" : "Critical"
                  });
                }
              }}
              className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/20 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Predict CAD Risk
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DIAGNOSTIC REPORT RESULTS */}
      {step === 4 && (
        <div className="space-y-6 relative z-10 animate-fadeIn">
          
          {/* Patient Information Panel matching Image 3 */}
          <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1">
                Patient Clinical Profile
              </span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-red-400" />
                <h4 className="font-display font-extrabold text-lg text-slate-200">
                  {patientName}
                </h4>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Age: <strong className="text-slate-300">{age}y</strong> | Gender: <strong className="text-slate-300">{gender}</strong> | BP: <strong className="text-slate-300">{bloodPressure} mmHg</strong>
              </p>
            </div>

            <div className="sm:text-right font-mono text-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Report Generated</span>
              <div className="flex items-center sm:justify-end gap-1 text-slate-300 mt-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{assessmentDate}</span>
              </div>
            </div>
          </div>

          {/* Core Assessment Predictions layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left Col: Patient Evaluated Metrics */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold border-b border-slate-900 pb-2">
                  Patient Parameters Registry
                </span>
                
                {/* Biometrics */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">1. Biometric Registry</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Age:</span>
                      <strong className="text-slate-300">{age} Yrs</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Sex:</span>
                      <strong className="text-slate-300">{gender}</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Diabetes:</span>
                      <strong className={diabetes === "Yes" ? "text-rose-400" : "text-slate-400"}>{diabetes}</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Hypertension:</span>
                      <strong className={bloodPressure >= 140 ? "text-rose-400" : "text-slate-400"}>{bloodPressure >= 140 ? "Yes" : "No"}</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Smoking Status:</span>
                      <strong className={smoking === "Yes" ? "text-rose-400" : "text-slate-400"}>{smoking}</strong>
                    </div>
                  </div>
                </div>

                {/* ECG Metrics */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">2. ECG Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Heart Rate:</span>
                      <strong className="text-slate-300">{ecgHeartRate} bpm</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">ST Deviation:</span>
                      <strong className={Math.abs(ecgStElevation) >= 1.0 ? "text-rose-400" : "text-slate-300"}>{ecgStElevation > 0 ? `+${ecgStElevation}` : ecgStElevation} mm</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">T-Wave Inversion:</span>
                      <strong className={ecgTInversion === "Yes" ? "text-rose-400" : "text-slate-400"}>{ecgTInversion}</strong>
                    </div>
                  </div>
                </div>

                {/* Echo Metrics */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">3. Echo Metrics</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">LVEF:</span>
                      <strong className={lvef < 50 ? "text-rose-400" : "text-emerald-400"}>{lvef}%</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">LVEDD:</span>
                      <strong className="text-slate-300">{lvedd} mm</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">Mitral E/A Ratio:</span>
                      <strong className="text-slate-300">{mitralEtoA}</strong>
                    </div>
                    <div className="bg-slate-900/40 p-2 rounded border border-slate-900 flex justify-between">
                      <span className="text-slate-500">RWMA:</span>
                      <strong className={rwma === "Yes" ? "text-rose-400" : "text-slate-400"}>{rwma}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: AI CAD Prediction Circular Gauge matching Image 3 */}
            <div className="lg:col-span-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-850 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block mb-4 font-bold flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                AI CAD Prediction
              </span>

              {/* Large Circular Gauge Ring */}
              <div className="relative flex items-center justify-center w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="68" className="stroke-slate-900 fill-transparent" strokeWidth="8" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="68" 
                    className={`stroke-current ${
                      predictions.level === "Low" 
                        ? "text-emerald-500" 
                        : predictions.level === "Moderate" 
                          ? "text-amber-500" 
                          : "text-red-500"
                    } fill-transparent transition-all duration-500`}
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 68} 
                    strokeDashoffset={2 * Math.PI * 68 - (predictions.combined / 100) * (2 * Math.PI * 68)} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-display text-slate-50">
                    {predictions.combined}%
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                    Aggregated Risk
                  </span>
                </div>
              </div>

              {/* Risk interpretation text matching screenshots */}
              <div className="mt-4">
                <span className={`text-xs font-mono font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                  predictions.level === "Low" 
                    ? "bg-emerald-950/30 border-emerald-900/40 text-emerald-400" 
                    : predictions.level === "Moderate" 
                      ? "bg-amber-950/30 border-amber-900/40 text-amber-400" 
                      : "bg-red-950/30 border-red-900/40 text-red-400 animate-pulse"
                }`}>
                  {predictions.level.toUpperCase()} RISK
                </span>
              </div>
            </div>

          </div>

          {/* AI Recommendation Box matching Image 1 */}
          <div className="bg-gradient-to-r from-blue-950/40 to-slate-950/40 p-5 rounded-2xl border border-blue-900/20 mt-4 space-y-2">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 uppercase font-display">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              AI Recommendation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {aiRecommendationText}
            </p>
          </div>

          {/* Risk Interpretation Tier Box matching Image 1 */}
          <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Info className="w-4 h-4 text-slate-400" />
              Risk Interpretation Guidelines
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-emerald-400 font-mono">Low Risk</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Maintain a healthy lifestyle, regular exercise, balanced diet, and annual health check-ups.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-amber-400 font-mono">Moderate Risk</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Consult a cardiologist, monitor blood pressure and cholesterol, and consider additional tests.
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-red-400 font-mono">High Risk</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Immediate medical consultation is recommended. Further cardiac evaluation and treatment may be required.
                </p>
              </div>
            </div>
          </div>

          {/* Three bottom buttons matching Image 1 */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 pt-6 border-t border-slate-850 mt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab("new-evaluation");
                  } else {
                    handleNewAssessment();
                  }
                }}
                className="px-5 py-2.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-900 flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Add New Patient Details
              </button>
              
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab("clinical-suite")}
                  className="px-6 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/20 hover:scale-[1.02]"
                >
                  <span>Evolve to Live Telemetry Workspace</span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
