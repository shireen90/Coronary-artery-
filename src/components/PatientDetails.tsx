import React, { useState, useTransition } from "react";
import { PatientRecord } from "../types";
import { EcgMonitor } from "./EcgMonitor";
import { EchoVisualizer } from "./EchoVisualizer";
import { predictCadFromClinicalTrial } from "../dataset";
import { 
  Heart, 
  Activity, 
  Trash2, 
  Save, 
  Plus, 
  Check, 
  Sparkles, 
  Clock, 
  AlertOctagon, 
  AlertTriangle,
  Info,
  CheckCircle2,
  FileSpreadsheet
} from "lucide-react";

interface PatientDetailsProps {
  key?: string | null;
  patient: PatientRecord;
  onDelete: (id: string) => void;
  onUpdateInsights: (id: string, updates: Partial<PatientRecord>) => void;
}

export function PatientDetails({ patient, onDelete, onUpdateInsights }: PatientDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [clinicalSummary, setClinicalSummary] = useState(patient.clinicalSummary || "");
  const [recommendations, setRecommendations] = useState<string[]>(patient.recommendations || []);
  const [newRecommendation, setNewRecommendation] = useState("");
  const [isPending, startTransition] = useTransition();

  // Run KNN similarity search on current patient parameter values against the provided clinical trial dataset
  const matchResults = predictCadFromClinicalTrial({
    age: patient.age,
    gender: patient.gender,
    systolicBp: patient.systolicBp,
    cholesterol: patient.cholesterol,
    diabetes: patient.diabetes,
    smoking: patient.smoking,
    echoLvef: patient.echoLvef,
    echoLvedd: patient.echoLvedd ? patient.echoLvedd / 10 : 5.0 // Convert mm to cm for the dataset model
  });

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

  const handleSaveInsights = () => {
    if (!patient.id) return;
    startTransition(async () => {
      await onUpdateInsights(patient.id!, {
        clinicalSummary,
        recommendations
      });
      setIsEditing(false);
    });
  };

  const handleAddRec = () => {
    if (!newRecommendation.trim()) return;
    setRecommendations([...recommendations, newRecommendation.trim()]);
    setNewRecommendation("");
  };

  const handleRemoveRec = (index: number) => {
    setRecommendations(recommendations.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Risk Alert Speedometer Top Bar */}
      <div className={`p-4 rounded-xl border ${alertConfig.bg} transition-all duration-300`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {alertConfig.icon}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-slate-100 text-lg">{patient.name}</span>
                <span className="text-[10px] font-mono bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded">
                  {patient.mrn}
                </span>
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Electrical (ECG) and Mechanical (Echo) Telemetries */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Electrocardiogram (ECG) Diagnostic
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

          <div>
            <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Ventricular Systolic & Wall Contractility (Echo)
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
        </div>

        {/* RIGHT COLUMN: AI Clinical Insights & Pathophysiology Reports */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 shadow-lg flex flex-col justify-between h-full min-h-[500px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-yellow-400 animate-pulse" />
                <h3 className="font-display font-medium text-slate-200 text-sm tracking-wide uppercase">
                  Secure AI Clinical Consultation Report
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(patient.predictedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-mono bg-slate-950 hover:bg-slate-850 border border-slate-850 text-sky-400 px-2.5 py-1 rounded transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit Insights"}
                </button>
              </div>
            </div>

            {/* Pathophysiology Correlation text */}
            <div className="space-y-4">
              {isEditing ? (
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-slate-500 uppercase mb-1.5">
                    Refine AI Consultation Summary
                  </label>
                  <textarea
                    value={clinicalSummary}
                    onChange={(e) => setClinicalSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed h-32"
                  />
                </div>
              ) : (
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-900 relative">
                  <span className="absolute top-2 right-3 text-[8px] font-mono text-emerald-500/60 uppercase tracking-widest font-bold">
                    DECISION ASSIST ENGINE
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                    {patient.clinicalSummary || "No clinical consult notes generated yet. Submit patient data or enter manual consult records."}
                  </p>
                </div>
              )}

              {/* Actionable recommendations checklist */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                  Actionable Intervention Checklist
                </span>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recommendations.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 bg-slate-950/30 p-2.5 rounded border border-slate-900 text-xs text-slate-300 leading-relaxed"
                    >
                      <span className="flex-shrink-0 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-[9px]">
                        {idx + 1}
                      </span>
                      <span className="flex-grow font-sans font-medium text-slate-300">{rec}</span>
                      
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRec(idx)}
                          className="text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="flex bg-slate-950 rounded border border-slate-850 overflow-hidden mt-3">
                    <input
                      type="text"
                      placeholder="Add diagnostic or prescription step..."
                      value={newRecommendation}
                      onChange={(e) => setNewRecommendation(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRec(); } }}
                      className="bg-transparent text-xs text-slate-300 px-3 py-2 flex-grow focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddRec}
                      className="bg-slate-900 border-l border-slate-850 text-slate-400 hover:text-emerald-400 px-3 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dataset Trial Patient Profile Matching */}
              <div className="pt-4 border-t border-slate-900 mt-4 space-y-3">
                <span className="block text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Clinical Trial Database Match Telemetry
                </span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Matched closest historical biometric outcomes from the coronary artery disease reference study:
                </p>

                <div className="space-y-2">
                  {matchResults.closestMatches.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="bg-slate-950/40 p-2.5 rounded border border-slate-900 text-[11px] flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                          <span>Study Case Match #{idx + 1}</span>
                          <span className="text-slate-600">•</span>
                          <span>Similarity: <strong className="text-slate-200">{Math.round((1 - item.distance) * 100)}%</strong></span>
                        </div>
                        <div className="font-mono text-slate-500 text-[10px] flex gap-2">
                          <span>Age: <strong className="text-slate-300">{item.record.age}y</strong></span>
                          <span>Sex: <strong className="text-slate-300">{item.record.gender[0]}</strong></span>
                          <span>LVEF: <strong className="text-slate-300">{item.record.lvef}%</strong></span>
                          <span>BP: <strong className="text-slate-300">{item.record.bp}</strong></span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${item.record.cadRisk ? 'bg-rose-950/20 border-rose-900/30 text-rose-400' : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'}`}>
                        {item.record.cadRisk ? "CAD" : "Normal"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer controls: Save updates & Delete */}
          <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
            <button
              onClick={() => { if (confirm("Confirm permanent removal of this diagnostic record from cloud database?")) onDelete(patient.id!); }}
              className="text-xs font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge MRN Record</span>
            </button>

            {isEditing && (
              <button
                onClick={handleSaveInsights}
                disabled={isPending}
                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 px-3.5 py-1.5 rounded-md font-mono text-xs font-bold transition-all"
              >
                {isPending ? (
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-slate-950 border-t-transparent" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Commit Updates</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
