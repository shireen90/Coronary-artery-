import { useMemo } from "react";

interface EchoVisualizerProps {
  lvef: number; // Left Ventricular Ejection Fraction (%)
  lvedd: number; // End-diastolic dimension (mm)
  septalThickness: number; // Septal wall thickness (mm)
  mitralEtoA: number; // Mitral E/A ratio
  aorticJetVelocity: number; // Aortic jet velocity (m/s)
  rwma: boolean; // Regional Wall Motion Abnormality
}

export function EchoVisualizer({
  lvef,
  lvedd,
  septalThickness,
  mitralEtoA,
  aorticJetVelocity,
  rwma
}: EchoVisualizerProps) {
  // LVEF Classification
  const lvefInfo = useMemo(() => {
    if (lvef >= 55) return { label: "Preserved (Normal)", color: "text-emerald-400 stroke-emerald-400", bg: "bg-emerald-950/30" };
    if (lvef >= 45) return { label: "Mildly Depressed", color: "text-yellow-400 stroke-yellow-400", bg: "bg-yellow-950/20" };
    if (lvef >= 35) return { label: "Moderately Depressed", color: "text-orange-400 stroke-orange-400", bg: "bg-orange-950/30" };
    return { label: "Severely Depressed", color: "text-rose-500 stroke-rose-500", bg: "bg-rose-950/40" };
  }, [lvef]);

  // Generate SVGs or arcs
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (lvef / 100) * circumference;

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-full">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
        <h3 className="font-display font-medium text-slate-200 text-sm tracking-wide uppercase">
          Echocardiogram Diagnostic Model
        </h3>
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold tracking-wider ${lvefInfo.bg} ${lvefInfo.color} border border-current/20`}>
          ECHO STUDY V2
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Radial LVEF Circle Gauge */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-lg border border-slate-800/40 relative h-40">
          <svg className="w-28 h-28 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-slate-800 fill-transparent"
              strokeWidth="8"
            />
            {/* Active LVEF Arc */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className={`${lvefInfo.color} fill-transparent transition-all duration-1000 ease-out`}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Central Percentage */}
          <div className="absolute flex flex-col items-center justify-center mt-[-10px]">
            <span className="text-2xl font-bold font-display text-slate-100">{lvef}%</span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">LVEF</span>
          </div>

          <div className="text-[10px] font-mono text-slate-400 mt-2 text-center font-medium truncate w-full">
            {lvefInfo.label}
          </div>
        </div>

        {/* Local Myocardial Wall Cross-Section Diagram */}
        <div className="flex flex-col items-center justify-center p-3 bg-slate-950/40 rounded-lg border border-slate-800/40 relative h-40">
          <div className="text-[10px] font-mono text-slate-400 absolute top-2 left-3 font-semibold uppercase tracking-wider">
            LV Wall Motion Segment
          </div>
          
          <svg viewBox="0 0 100 100" className="w-24 h-24 mt-2">
            {/* LV Wall segments (ring representing left ventricle cross-section) */}
            {/* Septal Segment */}
            <path
              d="M 50 15 A 35 35 0 0 0 15 50 L 25 50 A 25 25 0 0 1 50 25 Z"
              className={rwma ? "fill-rose-500/80 stroke-rose-400 animate-pulse" : "fill-emerald-500/15 stroke-emerald-500/40"}
              strokeWidth="1.5"
            />
            {/* Anterior Segment */}
            <path
              d="M 50 15 A 35 35 0 0 1 85 50 L 75 50 A 25 25 0 0 0 50 25 Z"
              className={rwma ? "fill-rose-500/80 stroke-rose-400 animate-pulse" : "fill-emerald-500/15 stroke-emerald-500/40"}
              strokeWidth="1.5"
            />
            {/* Lateral Segment */}
            <path
              d="M 85 50 A 35 35 0 0 1 50 85 L 50 75 A 25 25 0 0 0 75 50 Z"
              className="fill-emerald-500/15 stroke-emerald-500/40"
              strokeWidth="1.5"
            />
            {/* Inferior/Posterior Segment */}
            <path
              d="M 15 50 A 35 35 0 0 0 50 85 L 50 75 A 25 25 0 0 1 25 50 Z"
              className="fill-emerald-500/15 stroke-emerald-500/40"
              strokeWidth="1.5"
            />

            {/* Central Blood Pool */}
            <circle cx="50" cy="50" r="18" className="fill-slate-950 stroke-slate-800" strokeWidth="1" />
            <text x="50" y="53" textAnchor="middle" className="fill-slate-400 font-mono font-bold text-[8px]">
              {rwma ? "RWMA" : "NORMAL"}
            </text>
          </svg>

          {/* Wall Segment Labels */}
          <div className="text-[9px] font-mono mt-1 text-center w-full">
            {rwma ? (
              <span className="text-rose-400 font-semibold animate-pulse">
                ⚠️ Anterior-Septal Hypokinesis Detected
              </span>
            ) : (
              <span className="text-emerald-400">All Myocardial Walls Normokinetic</span>
            )}
          </div>
        </div>
      </div>

      {/* Numerical Metrics Bento-grid list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider leading-none">LVEDD</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {lvedd} <span className="text-[10px] font-normal text-slate-500">mm</span>
          </span>
          <span className="text-[8px] text-slate-600 font-mono truncate">
            {lvedd > 56 ? "⚠️ Dilated" : "Normal Size"}
          </span>
        </div>

        <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider leading-none">Septum</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {septalThickness} <span className="text-[10px] font-normal text-slate-500">mm</span>
          </span>
          <span className="text-[8px] text-slate-600 font-mono truncate">
            {septalThickness > 12 ? "⚠️ Hypertrophied" : "Normal"}
          </span>
        </div>

        <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider leading-none">E/A Ratio</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {mitralEtoA.toFixed(2)}
          </span>
          <span className="text-[8px] text-slate-600 font-mono truncate">
            {mitralEtoA < 0.8 ? "⚠️ Diastolic Dysf." : "Normal Profile"}
          </span>
        </div>

        <div className="bg-slate-950/50 p-2 rounded border border-slate-800/50 flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 font-mono font-semibold uppercase tracking-wider leading-none">Aortic Jet</span>
          <span className="text-sm font-bold text-slate-200 mt-1">
            {aorticJetVelocity.toFixed(1)} <span className="text-[10px] font-normal text-slate-500">m/s</span>
          </span>
          <span className="text-[8px] text-slate-600 font-mono truncate">
            {aorticJetVelocity > 3.0 ? "⚠️ Stenosis risk" : "Physiological"}
          </span>
        </div>
      </div>
    </div>
  );
}
