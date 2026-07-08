import { useState, useTransition, useEffect } from "react";
import { usePatients } from "./hooks/usePatients";
import { PatientRecord } from "./types";
import { PatientForm } from "./components/PatientForm";
import { PatientDetails } from "./components/PatientDetails";

import { EcgMonitor } from "./components/EcgMonitor";
import { EchoVisualizer } from "./components/EchoVisualizer";
import { CardioVisionAI } from "./components/CardioVisionAI";
import { 
  Heart, 
  Activity, 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  Sparkles, 
  SlidersHorizontal,
  ServerCrash,
  FileHeart,
  User,
  ExternalLink
} from "lucide-react";

export default function App() {
  const { 
    patients, 
    loading, 
    isFallbackMode, 
    addPatient, 
    deletePatient, 
    updatePatientInsights 
  } = usePatients();

  // Active workspace tabs - default to cardiovision so user lands directly on the beautiful risk assessment wizard
  const [activePortalTab, setActivePortalTab] = useState<"cardiovision" | "new-evaluation" | "clinical-suite">("cardiovision");
  
  // Selected patient for detail inspection
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Search & Filter state for workbench
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<"All" | "Critical" | "High" | "Moderate" | "Low">("All");

  // State to simulate a live parameter preview in the "New Entry" tab
  const [livePreviewParams, setLivePreviewParams] = useState({
    ecgHeartRate: 75,
    ecgStElevation: -1.2,
    ecgTInversion: true,
    ecgArrhythmia: "PVCs" as any,
    ecgQrsDuration: 100,
    ecgQtInterval: 410,
    echoLvef: 42,
    echoLvedd: 54,
    echoSeptalThickness: 12.0,
    echoMitralEtoA: 0.8,
    echoAorticJetVelocity: 1.8,
    echoRwma: true
  });

  // Track if patient registration form has started receiving user data
  const [hasEnteredData, setHasEnteredData] = useState(false);

  // Loading state when calling backend Gemini risk engine
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Tab state for secondary clinical tools (Cleveland clinical database explorer vs EHR FHIR server simulator)
  const [innerClinicalTab, setInnerClinicalTab] = useState<"dataset" | "fhir-gateway">("dataset");

  // Keep live preview visualizers synchronized with New Patient Intake form fields
  const handleFormChange = (formData: any) => {
    setLivePreviewParams({
      ecgHeartRate: formData.ecgHeartRate,
      ecgStElevation: formData.ecgStElevation,
      ecgTInversion: formData.ecgTInversion,
      ecgArrhythmia: formData.ecgArrhythmia,
      ecgQrsDuration: formData.ecgQrsDuration,
      ecgQtInterval: formData.ecgQtInterval,
      echoLvef: formData.echoLvef,
      echoLvedd: formData.echoLvedd,
      echoSeptalThickness: formData.echoSeptalThickness,
      echoMitralEtoA: formData.echoMitralEtoA,
      echoAorticJetVelocity: formData.echoAorticJetVelocity,
      echoRwma: formData.echoRwma
    });
    setHasEnteredData(!!formData.name && formData.name.trim() !== "");
  };

  // Select the currently highlighted patient
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Initialize selected patient ID once patients are loaded
  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id || null);
    }
  }, [patients, selectedPatientId]);

  // Filtered patients for the list column
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "All" || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Invoke full-stack Gemini Predictive Analysis
  const handleAnalyzeNewPatient = async (patientInput: PatientRecord) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientInput)
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const analyzedResult = await response.json();
      
      // Save full analyzed record to Firestore/Local database
      const savedRecord = await addPatient(analyzedResult);
      
      // Select the newly added patient and shift back to workbench view
      setSelectedPatientId(savedRecord.id || null);
      setActivePortalTab("clinical-suite");
    } catch (err: any) {
      console.error("Gemini server-side analysis failed. Executing advanced rule-based diagnostic as backup:", err);
      
      // Fallback: Rule-based calculations
      const calculatedScore = calculateRuleBasedScore(patientInput);
      const level = calculatedScore >= 75 ? "Critical" : calculatedScore >= 50 ? "High" : calculatedScore >= 25 ? "Moderate" : "Low";
      
      const localFallbackRecord: PatientRecord = {
        ...patientInput,
        riskScore: calculatedScore,
        riskLevel: level,
        predictedAt: new Date().toISOString(),
        clinicalSummary: `A statistical baseline CAD risk calculation has placed this patient in the ${level.toUpperCase()} category with a score of ${calculatedScore}%. Contributing elements include LVEF of ${patientInput.echoLvef}%, blood pressure of ${patientInput.systolicBp}/${patientInput.diastolicBp} mmHg, and ST-segment deviation of ${patientInput.ecgStElevation}mm. This evaluation should be verified by clinical findings.`,
        recommendations: [
          `Schedule a comprehensive cardiac consultation based on the ${level} risk profile.`,
          patientInput.echoLvef < 50 ? "Initiate guideline-directed medical therapy (GDMT) for reduced left ventricular function." : "Monitor systolic performance periodicially.",
          Math.abs(patientInput.ecgStElevation) >= 1 ? "Order serial troponins and continuous 12-lead telemetry to monitor active ischemic symptoms." : "Recommend routine ambulatory ECG tracking.",
          patientInput.smoking ? "Direct patient to structured tobacco cessation counseling programs immediately." : "Maintain cardiac-healthy physical guidelines."
        ]
      };

      const savedRecord = await addPatient(localFallbackRecord);
      setSelectedPatientId(savedRecord.id || null);
      setActivePortalTab("clinical-suite");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveFromCardioVision = async (patientInput: PatientRecord) => {
    try {
      // Standardize recommendation list and summary
      const localRecord: PatientRecord = {
        ...patientInput,
        predictedAt: new Date().toISOString(),
        clinicalSummary: `Diagnostic AngioPulse AI Risk Model: Aggregated CAD risk of ${patientInput.riskScore}%. Clinical parameters contributed ${Math.round(patientInput.riskScore * 0.95)}% probability. Echocardiography left ventricular ejection fraction is ${patientInput.echoLvef}%, and electrocardiogram ST elevation is ${patientInput.ecgStElevation}mm. This patient profile has been logged in the secure Firestore database.`,
        recommendations: [
          `Schedule specialized cardiology consult based on a ${patientInput.riskLevel} AngioPulse risk profile.`,
          patientInput.echoLvef < 50 ? "Optimize systolic support therapies and control risk metrics." : "Review ventricular contractility periodically.",
          patientInput.smoking ? "Mandate enrollment in a clinical smoking cessation initiative." : "Maintain general primary cardiovascular prevention protocols."
        ]
      };
      const savedRecord = await addPatient(localRecord);
      setSelectedPatientId(savedRecord.id || null);
    } catch (err) {
      console.error("Failed to save patient from AngioPulse AI:", err);
    }
  };

  // Rule-based score calculator for backup and live previews
  const calculateRuleBasedScore = (data: any): number => {
    let score = 5;
    if (data.age > 60) score += 10;
    else if (data.age > 45) score += 5;
    
    if (data.gender === "Male") score += 3;
    if (data.diabetes) score += 10;
    if (data.hypertension) score += 8;
    if (data.smoking) score += 8;
    if (data.familyHistory) score += 6;
    
    if (data.systolicBp >= 140) score += 8;
    if (data.cholesterol >= 220) score += 6;

    // ECG
    const absSt = Math.abs(data.ecgStElevation || 0);
    if (absSt >= 1.5) score += 15;
    else if (absSt >= 0.5) score += 8;
    
    if (data.ecgTInversion) score += 8;
    if (data.ecgArrhythmia === "Atrial Fibrillation") score += 10;

    // Echo
    const lvef = data.echoLvef || 60;
    if (lvef < 35) score += 20;
    else if (lvef < 50) score += 10;
    
    if (data.echoRwma) score += 18;

    return Math.min(Math.round(score), 99);
  };

  // Helper to get total counts
  const totalScreened = patients.length;
  const criticalCount = patients.filter(p => p.riskLevel === "Critical").length;
  const highCount = patients.filter(p => p.riskLevel === "High").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Clinician Portal Header */}
      <header className="bg-slate-900/85 border-b border-slate-850 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2.5 rounded-lg shadow-lg shadow-emerald-950/40">
              <Heart className="w-6 h-6 text-slate-950 fill-current animate-pulse" />
            </div>
             <div>
              <div className="flex items-center gap-2">
                 <h1 className="font-display font-bold text-lg text-slate-50 tracking-tight">
                  AngioPulse AI
                </h1>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-semibold tracking-wider">
                  Real-time CAD Risks
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Cardiovascular CAD Risk Assessment & Diagnostics Portal
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-850 self-stretch md:self-auto justify-between flex-wrap gap-1">
            <button
              onClick={() => setActivePortalTab("cardiovision")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all relative overflow-hidden ${
                activePortalTab === "cardiovision"
                  ? "bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 text-slate-950 font-black shadow-md shadow-red-950/40"
                  : "text-slate-300 hover:text-slate-100 bg-red-950/20 border border-red-900/30"
              }`}
            >
              <span className="flex items-center gap-1.5 justify-center">
                <Heart className={`w-3.5 h-3.5 ${activePortalTab === "cardiovision" ? "text-slate-950 fill-current" : "text-red-500 animate-pulse"}`} />
                AngioPulse AI Predictor
              </span>
            </button>
            <button
              onClick={() => setActivePortalTab("clinical-suite")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "clinical-suite"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-md shadow-emerald-950/40"
                  : "text-slate-300 hover:text-slate-100 bg-emerald-950/10 border border-emerald-900/20"
              }`}
            >
              <span className="flex items-center gap-1.5 justify-center">
                <Users className={`w-3.5 h-3.5 ${activePortalTab === "clinical-suite" ? "text-slate-950" : "text-emerald-400"}`} />
                Patient Telemetry Workspace
              </span>
            </button>
            <button
              onClick={() => setActivePortalTab("new-evaluation")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "new-evaluation"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-md shadow-amber-950/40"
                  : "text-slate-300 hover:text-slate-100 bg-amber-950/10 border border-amber-900/20"
              }`}
            >
              <span className="flex items-center gap-1.5 justify-center">
                <Sparkles className={`w-3.5 h-3.5 ${activePortalTab === "new-evaluation" ? "text-slate-950 fill-current animate-spin" : "text-amber-400"}`} />
                Add New Patient Details
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Clinic Telemetry Banner Counters */}
      <section className="bg-slate-950/40 border-b border-slate-900 py-3 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Total Screened</span>
              <span className="text-lg font-bold text-slate-200">{loading ? "..." : totalScreened} Patients</span>
            </div>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center justify-center md:justify-start gap-3">
            <Activity className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">High Risk Alerts</span>
              <span className="text-lg font-bold text-amber-400">{loading ? "..." : highCount} Screened</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-mono text-slate-400 gap-3">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
            <span>Loading clinical telemetry workspace...</span>
          </div>
        ) : (
          <>
            {/* CardioVision AI Predictor Tab */}
            {activePortalTab === "cardiovision" && (
              <div className="space-y-6">
                <CardioVisionAI 
                  onSavePatient={handleSaveFromCardioVision} 
                  onNavigateToTab={(tab) => setActivePortalTab(tab)}
                />
              </div>
            )}

            {/* Unified Clinical Command Center Suite */}
            {activePortalTab === "clinical-suite" && (
              <div className="space-y-6">
                
                {/* Patient Selector Topbar */}
                <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Patient Telemetry Stream Selection
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Choose an active patient record to view live multi-parameter waveforms and mechanical ventricular simulations.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    {patients.length === 0 ? (
                      <span className="text-xs text-slate-500 font-mono">No patient records available</span>
                    ) : (
                      <select
                        value={selectedPatient?.id || ""}
                        onChange={(e) => {
                          setSelectedPatientId(e.target.value || null);
                        }}
                        className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium w-full md:w-72 font-mono"
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.age}y, {p.riskLevel} Risk)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Selected Patient Workspace (Full Width) */}
                <div className="w-full">
                  {selectedPatient ? (
                    <PatientDetails
                      key={selectedPatient.id || selectedPatient.name}
                      patient={selectedPatient}
                      onDelete={deletePatient}
                      onNavigateToTab={(tab) => setActivePortalTab(tab)}
                    />
                  ) : (
                    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center h-[340px]">
                      <FileHeart className="w-12 h-12 text-slate-700 mb-3" />
                      <h3 className="font-display text-base font-semibold text-slate-400">
                        No Diagnostic Records Loaded
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Use the "Add New Patient Details" tab to run a predictive evaluation.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Dedicated New Patient Evaluation Tab */}
            {activePortalTab === "new-evaluation" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
                
                {/* Left Column: Patient Intake Form */}
                <div className="lg:col-span-7 bg-slate-900/60 rounded-xl border border-slate-800/80 p-6 shadow-lg space-y-4">
                  <div>
                    <h2 className="font-display font-bold text-base tracking-wide text-slate-200 uppercase flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                      Secure CAD Diagnostic Evaluator
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Input patient metrics, cardiovascular descriptors, and echocardiogram findings to compute CAD risk scores in real-time, synchronized with the Clinical Trial Database.
                    </p>
                  </div>
                  
                  <PatientForm
                    onSubmit={handleAnalyzeNewPatient}
                    isAnalyzing={isAnalyzing}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Right Column: Live Electro-Mechanical Telemetry Preview */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                  <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 shadow-lg space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                      <SlidersHorizontal className="w-4 h-4 text-sky-400 animate-pulse" />
                      <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                        Live Visual Telemetry Preview
                      </h3>
                    </div>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This dynamic preview panel shows real-time cardiac waveforms and left ventricle contractions mapped dynamically from the form inputs prior to full database submission.
                    </p>

                    {hasEnteredData ? (
                      <div className="space-y-5 animate-fadeIn">
                        {/* Live ECG sweep */}
                        <div>
                          <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-2">
                            Live simulated ECG sweep (Lead II)
                          </span>
                          <EcgMonitor
                            heartRate={livePreviewParams.ecgHeartRate}
                            stElevation={livePreviewParams.ecgStElevation}
                            tInversion={livePreviewParams.ecgTInversion}
                            arrhythmia={livePreviewParams.ecgArrhythmia}
                            qrsDuration={livePreviewParams.ecgQrsDuration}
                            qtInterval={livePreviewParams.ecgQtInterval}
                          />
                        </div>

                        {/* Live Echo ventricular sectors */}
                        <div>
                          <span className="block text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider mb-2">
                            Live simulated Echocardiogram ventricles
                          </span>
                          <EchoVisualizer
                            lvef={livePreviewParams.echoLvef}
                            lvedd={livePreviewParams.echoLvedd}
                            septalThickness={livePreviewParams.echoSeptalThickness}
                            mitralEtoA={livePreviewParams.echoMitralEtoA}
                            aorticJetVelocity={livePreviewParams.echoAorticJetVelocity}
                            rwma={livePreviewParams.echoRwma}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-950/40 rounded-lg border border-slate-900 border-dashed p-6 animate-fadeIn">
                        <Activity className="w-10 h-10 text-slate-700 mb-3 animate-pulse" />
                        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Telemetry Stream Offline
                        </h4>
                        <p className="text-[10px] text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                          Please enter a patient name in the intake form to initialize live electro-mechanical telemetry simulation.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Panel */}
      <footer className="bg-slate-900 border-t border-slate-850 px-6 py-5 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase tracking-wider font-display text-[11px]">Cardiovascular CAD Predictor Diagnostic System</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 bg-emerald-950/40 border border-emerald-900/30 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
              Final Year Project Portal
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
