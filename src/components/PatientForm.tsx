import React, { useState, useTransition } from "react";
import { PatientRecord } from "../types";
import { FileHeart, Activity, Star, Eye, ShieldAlert, Sparkles, Wand2, Heart, Shield, CheckCircle } from "lucide-react";
import { EcgMonitor } from "./EcgMonitor";
import { EchoVisualizer } from "./EchoVisualizer";

interface PatientFormProps {
  onSubmit: (data: PatientRecord) => void;
  isAnalyzing: boolean;
  onChange?: (data: any) => void;
}

const PRESETS = [
  {
    name: "Acute Ischemia (Anteroseptal)",
    desc: "Severe LAD stenosis mimic",
    data: {
      name: "Arthur Pendelton",
      age: 63,
      gender: "Male",
      systolicBp: 165,
      diastolicBp: 98,
      cholesterol: 260,
      hdl: 32,
      diabetes: true,
      smoking: true,
      familyHistory: true,
      ecgHeartRate: 95,
      ecgQtInterval: 440,
      ecgStElevation: -2.2, // severe ST depression
      ecgTInversion: true,
      ecgQrsDuration: 118,
      ecgArrhythmia: "PVCs",
      echoLvef: 34, // severe systolic dysfunction
      echoLvedd: 60, // dilated LV
      echoSeptalThickness: 13.5, // hypertrophied
      echoMitralEtoA: 0.58, // restrictive filling
      echoAorticJetVelocity: 2.2,
      echoRwma: true // yes, regional wall motion abnormality
    }
  },
  {
    name: "Moderate Cardiomyopathy",
    desc: "Compromised LVEF & hypertension",
    data: {
      name: "Gwendolyn Vance",
      age: 70,
      gender: "Female",
      systolicBp: 148,
      diastolicBp: 92,
      cholesterol: 218,
      hdl: 42,
      diabetes: false,
      smoking: false,
      familyHistory: true,
      ecgHeartRate: 82,
      ecgQtInterval: 425,
      ecgStElevation: -0.4,
      ecgTInversion: true,
      ecgQrsDuration: 105,
      ecgArrhythmia: "Normal Sinus",
      echoLvef: 45, // mildly depressed LVEF
      echoLvedd: 54,
      echoSeptalThickness: 12.0,
      echoMitralEtoA: 0.78,
      echoAorticJetVelocity: 1.9,
      echoRwma: false
    }
  },
  {
    name: "Aortic Stenosis & LVH",
    desc: "Increased septal wall & high aortic jet",
    data: {
      name: "Henry Sterling",
      age: 77,
      gender: "Male",
      systolicBp: 155,
      diastolicBp: 86,
      cholesterol: 234,
      hdl: 48,
      diabetes: true,
      smoking: false,
      familyHistory: false,
      ecgHeartRate: 78,
      ecgQtInterval: 450,
      ecgStElevation: 0.0,
      ecgTInversion: false,
      ecgQrsDuration: 128, // delayed conduction
      ecgArrhythmia: "Normal Sinus",
      echoLvef: 52, // borderline normal LVEF
      echoLvedd: 50,
      echoSeptalThickness: 15.5, // severe hypertrophy
      echoMitralEtoA: 0.62,
      echoAorticJetVelocity: 4.2, // high velocity indicative of severe stenosis
      echoRwma: false
    }
  },
  {
    name: "Physiological Normal (Athlete)",
    desc: "Optimal metabolic & performance indicators",
    data: {
      name: "Chloe Harrison",
      age: 26,
      gender: "Female",
      systolicBp: 110,
      diastolicBp: 70,
      cholesterol: 155,
      hdl: 64,
      diabetes: false,
      smoking: false,
      familyHistory: false,
      ecgHeartRate: 52, // healthy resting bradycardia
      ecgQtInterval: 380,
      ecgStElevation: 0.0,
      ecgTInversion: false,
      ecgQrsDuration: 85,
      ecgArrhythmia: "Normal Sinus",
      echoLvef: 68, // excellent LVEF
      echoLvedd: 42,
      echoSeptalThickness: 8.5,
      echoMitralEtoA: 1.5,
      echoAorticJetVelocity: 1.1,
      echoRwma: false
    }
  }
];

export function PatientForm({ onSubmit, isAnalyzing, onChange }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState<"demographics" | "ecg" | "echo">("demographics");
  const [formData, setFormData] = useState<Omit<PatientRecord, "id" | "riskScore" | "riskLevel" | "predictedAt">>({
    name: "",
    age: 55,
    gender: "Male",
    systolicBp: 128,
    diastolicBp: 82,
    cholesterol: 195,
    hdl: 48,
    diabetes: false,
    hypertension: false,
    smoking: false,
    familyHistory: false,
    ecgHeartRate: 72,
    ecgQtInterval: 410,
    ecgStElevation: 0,
    ecgTInversion: false,
    ecgQrsDuration: 90,
    ecgArrhythmia: "Normal Sinus",
    echoLvef: 55,
    echoLvedd: 48,
    echoSeptalThickness: 10,
    echoMitralEtoA: 1.1,
    echoAorticJetVelocity: 1.5,
    echoRwma: false
  });

  React.useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const handleApplyPreset = (preset: typeof PRESETS[0]["data"]) => {
    setFormData({
      ...preset,
      hypertension: preset.systolicBp >= 140 || preset.diastolicBp >= 90
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Please specify patient identity");
      return;
    }
    
    // Pass complete form state back
    onSubmit({
      ...formData,
      riskScore: 0, // Calculated server-side
      riskLevel: "Low", // Calculated server-side
      predictedAt: new Date().toISOString()
    });
  };

  const calculateLocalScore = (data: typeof formData): { score: number; level: "Low" | "Moderate" | "High" | "Critical" } => {
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

    const finalScore = Math.min(Math.round(score), 99);
    let level: "Low" | "Moderate" | "High" | "Critical" = "Low";
    if (finalScore >= 75) level = "Critical";
    else if (finalScore >= 50) level = "High";
    else if (finalScore >= 35) level = "Moderate";
    else level = "Low";

    return { score: finalScore, level };
  };

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-xl relative overflow-hidden">
      
      {/* Clinician Preset Shortcuts bar */}
      <div className="mb-5 bg-slate-950/80 p-3 rounded-lg border border-slate-900">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
          <Wand2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Quick Diagnostic Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleApplyPreset(p.data)}
              className="text-[11px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md transition-all text-left flex flex-col gap-0.5"
            >
              <span className="font-bold text-slate-200">{p.name}</span>
              <span className="text-[9px] text-slate-500 font-normal">{p.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Navigation Tabs for input panels */}
        <div className="flex border-b border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("demographics")}
            className={`flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
              activeTab === "demographics"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            1. Profile & Risks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ecg")}
            className={`flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
              activeTab === "ecg"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            2. ECG Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("echo")}
            className={`flex-1 py-2 text-xs font-mono font-semibold uppercase tracking-wider border-b-2 text-center transition-all ${
              activeTab === "echo"
                ? "border-emerald-500 text-emerald-400 bg-emerald-950/10"
                : "border-transparent text-slate-400 hover:text-slate-300"
            }`}
          >
            3. Echo. Metrics
          </button>
        </div>

        {/* Tab Content 1: Demographics & Risks */}
        {activeTab === "demographics" && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                Patient Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Marcus Vance"
                className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Age (Years)
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Biological Sex
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Total Chol. (mg/dL)
                </label>
                <input
                  type="number"
                  name="cholesterol"
                  min="50"
                  max="500"
                  value={formData.cholesterol}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Systolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="systolicBp"
                  min="70"
                  max="240"
                  value={formData.systolicBp}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Diastolic BP (mmHg)
                </label>
                <input
                  type="number"
                  name="diastolicBp"
                  min="40"
                  max="140"
                  value={formData.diastolicBp}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  HDL (mg/dL)
                </label>
                <input
                  type="number"
                  name="hdl"
                  min="10"
                  max="120"
                  value={formData.hdl}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Comorbidities checkboxes */}
            <div className="pt-2">
              <span className="block text-[11px] font-mono text-slate-400 uppercase mb-2 font-semibold">
                Anamnesis / Risk Modifiers
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3 rounded border border-slate-850">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="diabetes"
                    checked={formData.diabetes}
                    onChange={(e) => handleCheckboxChange("diabetes", e.target.checked)}
                    className="accent-emerald-500 h-4 w-4"
                  />
                  <span>Diabetes Mellitus</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="hypertension"
                    checked={formData.hypertension}
                    onChange={(e) => handleCheckboxChange("hypertension", e.target.checked)}
                    className="accent-emerald-500 h-4 w-4"
                  />
                  <span>Hypertension</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="smoking"
                    checked={formData.smoking}
                    onChange={(e) => handleCheckboxChange("smoking", e.target.checked)}
                    className="accent-emerald-500 h-4 w-4"
                  />
                  <span>Active Tobacco Use</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    name="familyHistory"
                    checked={formData.familyHistory}
                    onChange={(e) => handleCheckboxChange("familyHistory", e.target.checked)}
                    className="accent-emerald-500 h-4 w-4"
                  />
                  <span>Premature Family CAD</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content 2: ECG Parameters */}
        {activeTab === "ecg" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Resting Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  name="ecgHeartRate"
                  min="30"
                  max="220"
                  value={formData.ecgHeartRate}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  QT Interval (ms)
                </label>
                <input
                  type="number"
                  name="ecgQtInterval"
                  min="200"
                  max="600"
                  value={formData.ecgQtInterval}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  QRS Duration (ms)
                </label>
                <input
                  type="number"
                  name="ecgQrsDuration"
                  min="50"
                  max="220"
                  value={formData.ecgQrsDuration}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Resting Rhythm
                </label>
                <select
                  name="ecgArrhythmia"
                  value={formData.ecgArrhythmia}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Normal Sinus">Normal Sinus</option>
                  <option value="Atrial Fibrillation">Atrial Fibrillation</option>
                  <option value="Sinus Tachycardia">Sinus Tachycardia</option>
                  <option value="Sinus Bradycardia">Sinus Bradycardia</option>
                  <option value="PVCs">Frequent PVCs</option>
                </select>
              </div>
            </div>

            {/* ST Segment Elevation Slider */}
            <div>
              <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                <span>ST Segment Deviation (mm)</span>
                <span className={`font-mono font-bold ${formData.ecgStElevation === 0 ? 'text-slate-400' : formData.ecgStElevation > 0 ? 'text-rose-400' : 'text-sky-400'}`}>
                  {formData.ecgStElevation > 0 ? `+${formData.ecgStElevation.toFixed(1)} mm` : `${formData.ecgStElevation.toFixed(1)} mm`}
                </span>
              </div>
              <div className="bg-slate-950/40 p-3 rounded border border-slate-850">
                <input
                  type="range"
                  name="ecgStElevation"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={formData.ecgStElevation}
                  onChange={handleChange}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>-3.0 mm (Severe Ischemia)</span>
                  <span>0.0 mm (Flat)</span>
                  <span>+3.0 mm (Acute Injury / STEMI)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/40 p-3 rounded border border-slate-850 text-xs text-slate-300">
                <input
                  type="checkbox"
                  name="ecgTInversion"
                  checked={formData.ecgTInversion}
                  onChange={(e) => handleCheckboxChange("ecgTInversion", e.target.checked)}
                  className="accent-emerald-500 h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-200">T-Wave Inversion</span>
                  <span className="text-[10px] text-slate-500">Often aligns with epicardial ischemia or strain patterns.</span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab Content 3: Echo Parameters */}
        {activeTab === "echo" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold flex justify-between">
                  <span>LV Ejection Fraction (LVEF %)</span>
                  <span className="font-mono text-emerald-400 font-bold">{formData.echoLvef}%</span>
                </label>
                <input
                  type="range"
                  name="echoLvef"
                  min="15"
                  max="75"
                  value={formData.echoLvef}
                  onChange={handleChange}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                  <span>15% (Severe HF)</span>
                  <span>55% (Normal Limit)</span>
                  <span>75% (Hyperdynamic)</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  LV End-Diastolic Dimension (LVEDD mm)
                </label>
                <input
                  type="number"
                  name="echoLvedd"
                  min="30"
                  max="80"
                  value={formData.echoLvedd}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Septal Thickness (mm)
                </label>
                <input
                  type="number"
                  name="echoSeptalThickness"
                  min="5"
                  max="25"
                  step="0.1"
                  value={formData.echoSeptalThickness}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Mitral E/A Ratio
                </label>
                <input
                  type="number"
                  name="echoMitralEtoA"
                  min="0.2"
                  max="4.0"
                  step="0.05"
                  value={formData.echoMitralEtoA}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold">
                  Aortic Jet Velocity (m/s)
                </label>
                <input
                  type="number"
                  name="echoAorticJetVelocity"
                  min="0.5"
                  max="6.0"
                  step="0.1"
                  value={formData.echoAorticJetVelocity}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/40 p-3 rounded border border-slate-850 text-xs text-slate-300">
                <input
                  type="checkbox"
                  name="echoRwma"
                  checked={formData.echoRwma}
                  onChange={(e) => handleCheckboxChange("echoRwma", e.target.checked)}
                  className="accent-emerald-500 h-4 w-4"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-rose-400">Regional Wall Motion Abnormality (RWMA)</span>
                  <span className="text-[10px] text-slate-500">Highly specific marker for epicardial CAD ischemia in localized coronary branches.</span>
                </div>
              </label>
            </div>

            {/* Live assessment dashboard at Step 3 */}
            <div className="mt-6 border-t border-slate-850 pt-6">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Clinical Evaluation & Telemetry Preview (Step 3)
              </h3>
              
              <div className="space-y-4">
                {/* Grid of AI CAD Prediction & Biometrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Live AI CAD Prediction */}
                  {(() => {
                    const { score, level } = calculateLocalScore(formData);
                    return (
                      <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                            AI CAD Risk Prediction
                          </span>
                          <div className="flex items-baseline gap-2 mt-2">
                            <span className="text-4xl font-extrabold font-display text-slate-50">{score}%</span>
                            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                              level === 'Critical' ? 'bg-rose-950/40 text-rose-400 animate-pulse' :
                              level === 'High' ? 'bg-amber-950/40 text-amber-400' :
                              level === 'Moderate' ? 'bg-yellow-950/20 text-yellow-400' :
                              'bg-emerald-950/40 text-emerald-400'
                            }`}>
                              {level.toUpperCase()} RISK
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono mt-2 leading-relaxed">
                            Calculated dynamically based on real-time biometrics, hemodynamic readings, ischemic ECG markers, and echocardiographic function inputs.
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Patients Biometrics */}
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Patient Biometric Registry
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900/60">
                        <span className="text-[9px] text-slate-500 block">Age / Sex</span>
                        <strong className="text-slate-300">{formData.age} Yrs / {formData.gender}</strong>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900/60">
                        <span className="text-[9px] text-slate-500 block">Diabetes</span>
                        <strong className={formData.diabetes ? "text-rose-400" : "text-slate-400"}>
                          {formData.diabetes ? "Yes (Positive)" : "No (Negative)"}
                        </strong>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900/60">
                        <span className="text-[9px] text-slate-500 block">Hypertension</span>
                        <strong className={formData.hypertension ? "text-rose-400" : "text-slate-400"}>
                          {formData.hypertension ? "Yes (Positive)" : "No (Negative)"}
                        </strong>
                      </div>
                      <div className="bg-slate-900/40 p-1.5 rounded border border-slate-900/60">
                        <span className="text-[9px] text-slate-500 block">Smoking Status</span>
                        <strong className={formData.smoking ? "text-rose-400" : "text-slate-400"}>
                          {formData.smoking ? "Yes (Active)" : "No (None)"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid of ECG and Echo visualizers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* ECG wave sweep */}
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2">
                      ECG Wave Trace Sweep
                    </span>
                    <EcgMonitor
                      heartRate={formData.ecgHeartRate}
                      stElevation={formData.ecgStElevation}
                      tInversion={formData.ecgTInversion}
                      arrhythmia={formData.ecgArrhythmia}
                      qrsDuration={formData.ecgQrsDuration}
                      qtInterval={formData.ecgQtInterval}
                    />
                  </div>

                  {/* Echo chamber */}
                  <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold mb-2">
                      Echocardiographic Ventricular Chamber
                    </span>
                    <EchoVisualizer
                      lvef={formData.echoLvef}
                      lvedd={formData.echoLvedd}
                      septalThickness={formData.echoSeptalThickness}
                      mitralEtoA={formData.echoMitralEtoA}
                      aorticJetVelocity={formData.echoAorticJetVelocity}
                      rwma={formData.echoRwma}
                    />
                  </div>
                </div>

                {/* Wall Motion Description of this particular patient */}
                <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="w-full">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                      Wall Motion Analysis Summary
                    </span>
                    <p className="text-[11px] text-slate-300 font-mono mt-1 leading-relaxed">
                      {formData.echoRwma ? (
                        <span className="text-rose-400">
                          <strong>RWMA POSITIVE:</strong> Segmental hypokinesis/akinesis detected. Ventricular chamber wall shows localized contraction deficit during systole (typical localized coronary perfusion deficit of LAD or RCA branches).
                        </span>
                      ) : (
                        <span className="text-emerald-400">
                          <strong>RWMA NEGATIVE:</strong> Symmetrical global ventricular contractility. No regional wall motion abnormalities detected. Global perfusion of the epicardium is stable.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit action */}
        <div className="border-t border-slate-800 pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isAnalyzing || !formData.name}
            className="flex-grow flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold font-display text-xs uppercase py-2.5 rounded-lg shadow-lg shadow-emerald-950/20 tracking-wider transition-all disabled:text-slate-600"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-slate-950 border-t-transparent" />
                Synthesizing Clinical Analysis...
              </>
            ) : (
              <>
                <FileHeart className="w-4 h-4 text-slate-950" />
                Evaluate Cardiovascular Risk
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
