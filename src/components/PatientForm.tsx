import React, { useState, useTransition } from "react";
import { PatientRecord } from "../types";
import { FileHeart, Activity, Star, Eye, ShieldAlert, Sparkles, Wand2 } from "lucide-react";

interface PatientFormProps {
  onSubmit: (data: PatientRecord) => void;
  isAnalyzing: boolean;
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

export function PatientForm({ onSubmit, isAnalyzing }: PatientFormProps) {
  const [activeTab, setActiveTab] = useState<"demographics" | "ecg" | "echo">("demographics");
  const [formData, setFormData] = useState<Omit<PatientRecord, "id" | "riskScore" | "riskLevel" | "predictedAt">>({
    name: "",
    mrn: "",
    age: 55,
    gender: "Male",
    systolicBp: 128,
    diastolicBp: 82,
    cholesterol: 195,
    hdl: 48,
    diabetes: false,
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

  const generateMrn = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({ ...prev, mrn: `MRN-${num}-${code}` }));
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]["data"]) => {
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = Math.floor(100 + Math.random() * 900);
    setFormData({
      ...preset,
      mrn: `MRN-${num}-${code}`
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
    if (!formData.mrn) {
      formData.mrn = `MRN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    }
    
    // Pass complete form state back
    onSubmit({
      ...formData,
      riskScore: 0, // Calculated server-side
      riskLevel: "Low", // Calculated server-side
      predictedAt: new Date().toISOString()
    });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1 font-semibold flex justify-between">
                  <span>Medical Record Number (MRN)</span>
                  <button
                    type="button"
                    onClick={generateMrn}
                    className="text-[10px] text-sky-400 hover:underline"
                  >
                    Auto-Generate
                  </button>
                </label>
                <input
                  type="text"
                  name="mrn"
                  value={formData.mrn}
                  onChange={handleChange}
                  placeholder="e.g. MRN-3984-291"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/40 p-3 rounded border border-slate-850">
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
