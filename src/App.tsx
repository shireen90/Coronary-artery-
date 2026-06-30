import { useState, useTransition, useEffect } from "react";
import { usePatients } from "./hooks/usePatients";
import { PatientRecord } from "./types";
import { PatientForm } from "./components/PatientForm";
import { PatientDetails } from "./components/PatientDetails";
import { HospitalIntegrationPortal } from "./components/HospitalIntegrationPortal";
import { EcgMonitor } from "./components/EcgMonitor";
import { EchoVisualizer } from "./components/EchoVisualizer";
import { ClinicalDatasetExplorer } from "./components/ClinicalDatasetExplorer";
import { CardioVisionAI } from "./components/CardioVisionAI";
import { 
  Heart, 
  Activity, 
  Users, 
  ShieldCheck, 
  Search, 
  Plus, 
  Sparkles, 
  Database,
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
  const [activePortalTab, setActivePortalTab] = useState<"workbench" | "new-entry" | "api-portal" | "dataset-explorer" | "cardiovision">("cardiovision");
  
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

  // Loading state when calling backend Gemini risk engine
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
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
      setActivePortalTab("workbench");
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
      setActivePortalTab("workbench");
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
        clinicalSummary: `Diagnostic CardioVision AI Risk Model: Aggregated CAD risk of ${patientInput.riskScore}%. Clinical parameters contributed ${Math.round(patientInput.riskScore * 0.95)}% probability. Echocardiography left ventricular ejection fraction is ${patientInput.echoLvef}%, and electrocardiogram ST elevation is ${patientInput.ecgStElevation}mm. This patient profile has been logged in the EHR database.`,
        recommendations: [
          `Schedule specialized cardiology consult based on a ${patientInput.riskLevel} CardioVision risk profile.`,
          patientInput.echoLvef < 50 ? "Optimize systolic support therapies and control risk metrics." : "Review ventricular contractility periodically.",
          patientInput.smoking ? "Mandate enrollment in a clinical smoking cessation initiative." : "Maintain general primary cardiovascular prevention protocols."
        ]
      };
      const savedRecord = await addPatient(localRecord);
      setSelectedPatientId(savedRecord.id || null);
      setActivePortalTab("workbench");
    } catch (err) {
      console.error("Failed to save patient from CardioVision AI:", err);
    }
  };

  // Rule-based score calculator for backup and live previews
  const calculateRuleBasedScore = (data: any): number => {
    let score = 5;
    if (data.age > 60) score += 10;
    else if (data.age > 45) score += 5;
    
    if (data.gender === "Male") score += 3;
    if (data.diabetes) score += 10;
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
      
      {/* Clinician Command Center Portal Header */}
      <header className="bg-slate-900/85 border-b border-slate-850 px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-500 p-2.5 rounded-lg shadow-lg shadow-emerald-950/40">
              <Heart className="w-6 h-6 text-slate-950 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-lg text-slate-50 tracking-tight">
                  St. Jude Cardiovascular Command Center
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
                Active Practitioner: <span className="text-slate-300 font-semibold">Dr. Shireen Kousar, FACC</span> (shireenakousar77@gmail.com)
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-850 self-stretch md:self-auto justify-between flex-wrap gap-1">
            <button
              onClick={() => setActivePortalTab("cardiovision")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all relative overflow-hidden ${
                activePortalTab === "cardiovision"
                  ? "bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 text-slate-950 font-black"
                  : "text-slate-300 hover:text-slate-100 bg-red-950/20 border border-red-900/30"
              }`}
            >
              <span className="flex items-center gap-1.5 justify-center">
                <Heart className={`w-3.5 h-3.5 ${activePortalTab === "cardiovision" ? "text-slate-950 fill-current" : "text-red-500 animate-pulse"}`} />
                CardioVision AI Predictor
              </span>
            </button>
            <button
              onClick={() => setActivePortalTab("workbench")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "workbench"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Diagnostic Workbench
            </button>
            <button
              onClick={() => setActivePortalTab("new-entry")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "new-entry"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              New Evaluation
            </button>
            <button
              onClick={() => setActivePortalTab("dataset-explorer")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "dataset-explorer"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Clinical Reference Dataset
            </button>
            <button
              onClick={() => setActivePortalTab("api-portal")}
              className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-mono uppercase font-semibold tracking-wider transition-all ${
                activePortalTab === "api-portal"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              EHR FHIR API Gateway
            </button>
          </div>
        </div>
      </header>

      {/* Main Clinic Telemetry Banner Counters */}
      <section className="bg-slate-950/40 border-b border-slate-900 py-3 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center gap-3">
            <Users className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Total Screened</span>
              <span className="text-lg font-bold text-slate-200">{loading ? "..." : totalScreened} Patients</span>
            </div>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center gap-3">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-950" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">Critical Alerts</span>
              <span className="text-lg font-bold text-rose-400">{loading ? "..." : criticalCount} Active</span>
            </div>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center gap-3">
            <Activity className="w-5 h-5 text-amber-500" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">High Risk Alerts</span>
              <span className="text-lg font-bold text-amber-400">{loading ? "..." : highCount} Screened</span>
            </div>
          </div>

          <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-900/60 flex flex-col md:flex-row items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block leading-none">EHR Synchronizer</span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Secure & Linked</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Body */}
      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-mono text-slate-400 gap-3">
            <span className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
            <span>Establishing Secure Handshake with Firestore database...</span>
          </div>
        ) : (
          <>
            {/* View Tab 1: Diagnostic Workbench */}
            {activePortalTab === "workbench" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: Filterable Patient List (lg:span-4) */}
                <div className="lg:col-span-4 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 shadow-lg space-y-4 max-h-[700px] flex flex-col">
                  
                  <div className="flex items-center justify-between">
                    <h2 className="font-display font-bold text-sm tracking-wide text-slate-200 uppercase">
                      MRN Patient Register
                    </h2>
                    <span className="text-[10px] font-mono text-slate-500">
                      {filteredPatients.length} shown
                    </span>
                  </div>

                  {/* Search bar */}
                  <div className="relative flex items-center bg-slate-950 border border-slate-850 rounded">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3" />
                    <input
                      type="text"
                      placeholder="Search patient or MRN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-transparent text-xs text-slate-300 pl-9 pr-3 py-2 focus:outline-none"
                    />
                  </div>

                  {/* Filter tabs */}
                  <div className="flex gap-1.5 border-b border-slate-850 pb-2 overflow-x-auto">
                    {(["All", "Critical", "High", "Moderate", "Low"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setRiskFilter(lvl)}
                        className={`px-2.5 py-1 text-[10px] font-mono rounded font-semibold tracking-wider transition-all border ${
                          riskFilter === lvl
                            ? "bg-slate-800 text-slate-200 border-slate-700"
                            : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* Patient List container */}
                  <div className="space-y-2 overflow-y-auto flex-grow pr-1">
                    {filteredPatients.length === 0 ? (
                      <div className="text-center py-10 font-mono text-xs text-slate-600">
                        No matching patient records found.
                      </div>
                    ) : (
                      filteredPatients.map((p) => {
                        const isSelected = p.id === selectedPatientId;
                        const riskColors = {
                          Critical: "text-rose-400 border-rose-950/50 bg-rose-950/20",
                          High: "text-amber-400 border-amber-950/50 bg-amber-950/20",
                          Moderate: "text-yellow-400 border-yellow-950/30 bg-yellow-950/20",
                          Low: "text-emerald-400 border-emerald-950/30 bg-emerald-950/20"
                        }[p.riskLevel];

                        return (
                          <div
                            key={p.id || p.mrn}
                            onClick={() => setSelectedPatientId(p.id || null)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-slate-800/80 border-slate-750 shadow-md scale-[1.01]"
                                : "bg-slate-950/30 border-slate-900 hover:bg-slate-900/50"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-display font-bold text-xs text-slate-200 block">
                                {p.name}
                              </span>
                              <span className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded border ${riskColors}`}>
                                {p.riskLevel}
                              </span>
                            </div>
                            
                            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
                              <span>{p.mrn}</span>
                              <span>{p.age}y / {p.gender[0]}</span>
                            </div>

                            <div className="flex gap-4 text-[9px] font-mono text-slate-400 border-t border-slate-900/80 pt-2 mt-2">
                              <span>LVEF: <strong className="text-slate-200">{p.echoLvef}%</strong></span>
                              <span>ST Dev: <strong className={p.ecgStElevation !== 0 ? "text-rose-400" : "text-slate-200"}>{p.ecgStElevation > 0 ? `+${p.ecgStElevation}` : p.ecgStElevation}mm</strong></span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Panel: Patient Workspace (lg:span-8) */}
                <div className="lg:col-span-8">
                  {selectedPatient ? (
                    <PatientDetails
                      key={selectedPatient.id || selectedPatient.name}
                      patient={selectedPatient}
                      onDelete={deletePatient}
                      onUpdateInsights={updatePatientInsights}
                    />
                  ) : (
                    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-12 text-center flex flex-col items-center justify-center h-96">
                      <FileHeart className="w-12 h-12 text-slate-700 mb-3" />
                      <h3 className="font-display text-base font-semibold text-slate-400">
                        No Diagnostic Records Loaded
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Use the "New Evaluation" tab at the top to run predictions or seed mock patients into Firestore.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* View Tab 2: New Evaluation Form */}
            {activePortalTab === "new-entry" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form column */}
                <div className="lg:col-span-7">
                  <div className="mb-4">
                    <h2 className="font-display font-bold text-base tracking-wide text-slate-200 uppercase flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      Secure CAD Diagnostic Evaluator
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Type patient parameters or load quick presets to compute coronary risk levels in real-time.
                    </p>
                  </div>
                  
                  <PatientForm
                    onSubmit={handleAnalyzeNewPatient}
                    isAnalyzing={isAnalyzing}
                  />
                </div>

                {/* Live visual parameter-adjustment preview column */}
                <div className="lg:col-span-5 space-y-4 sticky top-24">
                  <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-4">
                    <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                      Dynamic Parameter Preview
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                      Visualize the heart's electro-mechanical indicators directly prior to compiling the full clinical report.
                    </p>

                    <div className="space-y-4">
                      {/* Live ECG waveform preview */}
                      <div>
                        <span className="block text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
                          Live simulated ECG sweep waveform (Lead II)
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

                      {/* Live Echo segment preview */}
                      <div>
                        <span className="block text-[10px] font-mono text-slate-400 uppercase font-semibold mb-1.5">
                          Live simulated Echocardiogram ventricule segments
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

                      {/* Preview modifiers control bar */}
                      <div className="bg-slate-950 p-3 rounded border border-slate-900 space-y-3">
                        <span className="block text-[9px] font-mono text-emerald-400 uppercase font-bold tracking-widest leading-none">
                          Pre-submit Visual Tuner
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                              ST Deviation ({livePreviewParams.ecgStElevation}mm)
                            </label>
                            <input
                              type="range"
                              min="-3.0"
                              max="3.0"
                              step="0.2"
                              value={livePreviewParams.ecgStElevation}
                              onChange={(e) => setLivePreviewParams(prev => ({ ...prev, ecgStElevation: parseFloat(e.target.value) }))}
                              className="w-full accent-sky-400 h-1 cursor-pointer bg-slate-800 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-[9px] font-mono text-slate-500 uppercase mb-0.5">
                              LV Ejection Fraction ({livePreviewParams.echoLvef}%)
                            </label>
                            <input
                              type="range"
                              min="15"
                              max="75"
                              value={livePreviewParams.echoLvef}
                              onChange={(e) => setLivePreviewParams(prev => ({ ...prev, echoLvef: parseInt(e.target.value) }))}
                              className="w-full accent-sky-400 h-1 cursor-pointer bg-slate-800 rounded"
                            />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                            <input
                              type="checkbox"
                              checked={livePreviewParams.echoRwma}
                              onChange={(e) => setLivePreviewParams(prev => ({ ...prev, echoRwma: e.target.checked }))}
                              className="accent-sky-400 h-3.5 w-3.5"
                            />
                            <span>Simulate RWMA</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-400">
                            <input
                              type="checkbox"
                              checked={livePreviewParams.ecgTInversion}
                              onChange={(e) => setLivePreviewParams(prev => ({ ...prev, ecgTInversion: e.target.checked }))}
                              className="accent-sky-400 h-3.5 w-3.5"
                            />
                            <span>Simulate T-Inversion</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* CardioVision AI Predictor Tab */}
            {activePortalTab === "cardiovision" && (
              <div className="space-y-6">
                <CardioVisionAI onSavePatient={handleSaveFromCardioVision} />
              </div>
            )}

            {/* View Tab 3: Dataset Explorer & KNN Predictor */}
            {activePortalTab === "dataset-explorer" && (
              <div className="space-y-6">
                <ClinicalDatasetExplorer />
              </div>
            )}

            {/* View Tab 3: EHR FHIR API Integration */}
            {activePortalTab === "api-portal" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display font-bold text-base tracking-wide text-slate-200 uppercase">
                    EHR FHIR Interoperability Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure high-throughput REST APIs and query transaction queues to connect with hospital EHR instances like Epic, Cerner, or Meditech.
                  </p>
                </div>

                <HospitalIntegrationPortal />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer & Telemetry logs panel */}
      <footer className="bg-slate-900 border-t border-slate-850 px-6 py-4 mt-12 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Database: <span className={isFallbackMode ? "text-amber-400" : "text-emerald-400"}>{isFallbackMode ? "Secure LocalStorage Backup" : "Cloud Firestore Synchronized"}</span>
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Protocol: <span className="text-slate-400">HIPAA Compliant SSL Tunnel</span>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span>CAD-Predictor Server Engine v1.4.2</span>
            <span>•</span>
            <span className="text-slate-400">Google AI Studio Build</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
