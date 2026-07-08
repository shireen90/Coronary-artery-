import React from "react";
import { PatientRecord } from "../types";
import { EcgMonitor } from "./EcgMonitor";
import { EchoVisualizer } from "./EchoVisualizer";
import { 
  Heart, 
  Activity, 
  Trash2, 
  AlertOctagon, 
  AlertTriangle,
  Info,
  CheckCircle2,
  User,
  Flame,
  Droplet,
  FileText,
  Dna,
  Printer,
  PlusCircle
} from "lucide-react";

interface PatientDetailsProps {
  key?: string | null;
  patient: PatientRecord;
  onDelete: (id: string) => void;
  onUpdateInsights?: (id: string, updates: Partial<PatientRecord>) => void;
  onNavigateToTab?: (tab: "cardiovision" | "new-evaluation" | "clinical-suite") => void;
}

export function PatientDetails({ patient, onDelete, onNavigateToTab }: PatientDetailsProps) {
  const handlePrintReport = () => {
    const reportContent = `
==================================================
        ANGIOPULSE AI CAD RISK REPORT
==================================================
Patient Name: ${patient.name}
Record ID: ${patient.id || "N/A"}
Date Compiled: ${new Date().toLocaleDateString()}
--------------------------------------------------

CLINICAL BIOMETRICS & RISK ASSESSMENT
--------------------------------------------------
Risk Level: ${patient.riskLevel.toUpperCase()} RISK
CAD Risk Score: ${patient.riskScore}%
Age / Gender: ${patient.age} Yrs / ${patient.gender}
Diabetes Mellitus: ${patient.diabetes ? "Positive" : "Negative"}
Systemic Hypertension: ${patient.hypertension ? "Positive" : "Negative"}
Tobacco Smoking: ${patient.smoking ? "Active" : "None"}
Hypercholesterolemia: ${patient.cholesterol} mg/dL
Systolic/Diastolic BP: ${patient.systolicBp}/${patient.diastolicBp} mmHg

ELECTROCARDIOGRAM (ECG) TELEMETRY
--------------------------------------------------
Heart Rate: ${patient.ecgHeartRate} BPM
ST Segment Elevation/Deviation: ${patient.ecgStElevation} mm
T-Wave Inversion: ${patient.ecgTInversion ? "Present" : "Absent"}
Cardiac Rhythm: ${patient.ecgArrhythmia}
QRS Duration: ${patient.ecgQrsDuration} ms
QT Interval: ${patient.ecgQtInterval} ms

ECHOCARDIOGRAPHIC STRUCTURAL INDICES
--------------------------------------------------
LV Ejection Fraction (LVEF): ${patient.echoLvef}%
LV End-Diastolic Dimension (LVEDD): ${patient.echoLvedd} mm
Interventricular Septal Thickness: ${patient.echoSeptalThickness} mm
Mitral Valve E/A Ratio: ${patient.echoMitralEtoA}
Aortic Jet Velocity: ${patient.echoAorticJetVelocity} m/s
Regional Wall Motion Abnormality (RWMA): ${patient.echoRwma ? "DETECTED" : "Normal global kinetics"}

CLINICAL SUMMARY & AI INSIGHTS
--------------------------------------------------
${patient.clinicalSummary || "No clinical summary text generated."}

==================================================
Generated securely via AngioPulse AI Diagnostic Portals
==================================================
`;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AngioPulse_Report_${patient.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Color alerts mapper
  const alertConfig = {
    Critical: {
      bg: "bg-rose-950/20 border-rose-900/50 text-rose-400",
      pill: "bg-rose-500 text-slate-950",
      icon: <AlertOctagon className="w-5 h-5 text-rose-500 animate-pulse" />,
      gauge: "from-rose-600 to-rose-400 shadow-rose-900/30",
      banner: "An immediate intervention and intensive hospital care are advised. Elevated acute cardiac event risk."
    },
    High: {
      bg: "bg-amber-950/20 border-amber-900/50 text-amber-400",
      pill: "bg-amber-500 text-slate-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      gauge: "from-amber-500 to-amber-300 shadow-amber-900/30",
      banner: "Urgent cardiovascular referral and diagnostic verification recommended. High risk of coronary disease."
    },
    Moderate: {
      bg: "bg-yellow-950/25 border-yellow-900/30 text-yellow-400",
      pill: "bg-yellow-500 text-slate-950",
      icon: <Info className="w-5 h-5 text-yellow-400" />,
      gauge: "from-yellow-400 to-yellow-300 shadow-yellow-900/10",
      banner: "Standard preventative clinical guidelines and close risk modifier counseling are warranted."
    },
    Low: {
      bg: "bg-emerald-950/20 border-emerald-900/30 text-emerald-400",
      pill: "bg-emerald-500 text-slate-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      gauge: "from-emerald-500 to-emerald-300 shadow-emerald-900/10",
      banner: "Patient presents normal cardiac indices. Continue standard periodic wellness screenings."
    }
  }[patient.riskLevel];

  return (
    <div className="space-y-6 animate-fadeIn" id="patient-details-root">
      {/* Risk Alert Speedometer Top Bar */}
      <div className={`p-4 rounded-xl border ${alertConfig.bg} transition-all duration-300`} id="patient-risk-banner">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {alertConfig.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-slate-100 text-lg">{patient.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{alertConfig.banner}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/50 px-4 py-2 rounded-lg border border-slate-900 w-full md:w-auto justify-between md:justify-start">
            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">CAD Risk Level</span>
              <span className={`text-xs font-bold uppercase font-mono tracking-wider ${patient.riskLevel === 'Critical' ? 'text-rose-400' : patient.riskLevel === 'High' ? 'text-amber-400' : patient.riskLevel === 'Moderate' ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {patient.riskLevel}
              </span>
            </div>
            
            {/* Tiny color-coded gauge visualizer */}
            <div className="relative flex items-center justify-center w-14 h-14">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="22" className="stroke-slate-800 fill-transparent" strokeWidth="4" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="22" 
                  className={`stroke-current ${patient.riskLevel === 'Critical' ? 'text-rose-500' : patient.riskLevel === 'High' ? 'text-amber-500' : patient.riskLevel === 'Moderate' ? 'text-yellow-500' : 'text-emerald-500'} fill-transparent`}
                  strokeWidth="4" 
                  strokeDasharray={2 * Math.PI * 22} 
                  strokeDashoffset={2 * Math.PI * 22 - (patient.riskScore / 100) * (2 * Math.PI * 22)} 
                />
              </svg>
              <span className="absolute text-sm font-bold font-display text-slate-100">{patient.riskScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Clinical Diagnostic Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="patient-workspace-grid">
        
        {/* COLUMN 1: PATIENT PROFILE DETAILS (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-lg space-y-5 flex flex-col justify-between h-full" id="patient-biometric-card">
            <div>
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <User className="w-4.5 h-4.5 text-sky-400" />
                <h3 className="font-display font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Patient Biometric Profile
                </h3>
              </div>

              {/* Bio Grid */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/40 p-2.5 rounded border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Age</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{patient.age} Years</span>
                  </div>
                  <div className="bg-slate-950/40 p-2.5 rounded border border-slate-900">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Gender</span>
                    <span className="text-xs font-bold text-slate-200 font-mono">{patient.gender}</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Hemodynamics
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">Systolic BP</span>
                      <strong className="text-slate-300 font-mono">{patient.systolicBp} <span className="text-[9px] text-slate-600 font-normal">mmHg</span></strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">Diastolic BP</span>
                      <strong className="text-slate-300 font-mono">{patient.diastolicBp} <span className="text-[9px] text-slate-600 font-normal">mmHg</span></strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-rose-500" />
                    Lipid Panel
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">Total Cholesterol</span>
                      <strong className="text-slate-300 font-mono">{patient.cholesterol} <span className="text-[9px] text-slate-600 font-normal">mg/dL</span></strong>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block">HDL Cholesterol</span>
                      <strong className="text-slate-300 font-mono">{patient.hdl} <span className="text-[9px] text-slate-600 font-normal">mg/dL</span></strong>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3 rounded border border-slate-900 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    Risk Factor Co-morbidities
                  </span>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                      <span className="text-slate-500 text-[10px]">Diabetes Mellitus</span>
                      <span className={`text-[10px] font-bold ${patient.diabetes ? "text-rose-400" : "text-slate-500"}`}>
                        {patient.diabetes ? "PRESENT" : "NEGATIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                      <span className="text-slate-500 text-[10px]">Hypertension</span>
                      <span className={`text-[10px] font-bold ${patient.hypertension ? "text-rose-400" : "text-slate-500"}`}>
                        {patient.hypertension ? "PRESENT" : "NEGATIVE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                      <span className="text-slate-500 text-[10px]">Active Smoking</span>
                      <span className={`text-[10px] font-bold ${patient.smoking ? "text-rose-400" : "text-slate-500"}`}>
                        {patient.smoking ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/30 px-2 py-1 rounded">
                      <span className="text-slate-500 text-[10px]">Family History of CAD</span>
                      <span className={`text-[10px] font-bold ${patient.familyHistory ? "text-rose-400" : "text-slate-500"}`}>
                        {patient.familyHistory ? "POSITIVE" : "NEGATIVE"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer controls: Purge */}
            <div className="border-t border-slate-800 pt-4 mt-6">
              <button
                onClick={() => { if (confirm("Confirm permanent removal of this diagnostic record from cloud database?")) onDelete(patient.id!); }}
                className="text-xs font-mono text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-colors w-full py-2 bg-slate-950/40 hover:bg-rose-950/10 border border-slate-900 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
                <span>Purge Patient Diagnostic Record</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* COLUMN 2: TELEMETRY & STRUCTURAL CARDS (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6">
          {/* ECG Real-Time Telemetry */}
          <div id="patient-ecg-card">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Real-Time Telemetry (ECG)
            </h4>
            <EcgMonitor
              heartRate={patient.ecgHeartRate}
              stElevation={patient.ecgStElevation}
              tInversion={patient.ecgTInversion}
              arrhythmia={patient.ecgArrhythmia}
              qrsDuration={patient.ecgQrsDuration}
              qtInterval={patient.ecgQtInterval}
            />
          </div>

          {/* Echo Structural & Wall Motion (LV Motion) */}
          <div id="patient-echo-card">
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Echocardiogram Left Ventricle (LV) Wall Motion
            </h4>
            <EchoVisualizer
              lvef={patient.echoLvef}
              lvedd={patient.echoLvedd}
              septalThickness={patient.echoSeptalThickness}
              mitralEtoA={patient.echoMitralEtoA}
              aorticJetVelocity={patient.echoAorticJetVelocity}
              rwma={patient.echoRwma}
            />
          </div>

          {/* Prints & Intake shortcuts - "after telemetry add bottom" */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-900/60 mt-4">
            <button
              onClick={handlePrintReport}
              className="flex-1 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-950/20 active:scale-[0.98]"
            >
              <Printer className="w-4 h-4" />
              <span>Print Clinical File</span>
            </button>
            
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab("new-evaluation")}
                className="flex-1 px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 text-slate-300 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New Patient</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
