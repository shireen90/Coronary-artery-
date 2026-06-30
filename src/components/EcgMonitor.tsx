import { useEffect, useState, useRef } from "react";

interface EcgMonitorProps {
  heartRate: number;
  stElevation: number; // in mm
  tInversion: boolean;
  arrhythmia: string;
  qrsDuration: number;
  qtInterval: number;
}

export function EcgMonitor({
  heartRate,
  stElevation,
  tInversion,
  arrhythmia,
  qrsDuration,
  qtInterval
}: EcgMonitorProps) {
  const [offset, setOffset] = useState(0);
  const requestRef = useRef<number | null>(null);

  // Animation loop to simulate the sweep line or wave motion
  useEffect(() => {
    const animate = () => {
      setOffset((prev) => (prev + 0.6) % 300);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Generate SVG path for 3 cardiac cycles based on patient properties
  const generateEcgPath = (width: number, height: number): string => {
    const cycles = 3;
    const points: string[] = [];
    const centerY = height / 2;
    
    // Scale factors
    const stShift = stElevation * 12; // 1mm = ~12px vertical shift
    const tMult = tInversion ? -1 : 1;
    const isAfib = arrhythmia === "Atrial Fibrillation";
    
    points.push(`M 0 ${centerY}`);

    const segmentWidth = width / cycles;
    for (let c = 0; c < cycles; c++) {
      const startX = c * segmentWidth;
      
      // AFib introduces baseline fibrillatory oscillations (f-waves) and irregular spacing
      const afibNoise = (x: number) => {
        if (!isAfib) return 0;
        return Math.sin(x * 0.5) * 3 + Math.cos(x * 1.1) * 2;
      };

      // Define standard interval fractions
      const pStart = 0.15 * segmentWidth;
      const pPeak = 0.20 * segmentWidth;
      const pEnd = 0.25 * segmentWidth;
      
      const qStart = 0.35 * segmentWidth;
      const qPeak = 0.38 * segmentWidth;
      
      const rPeak = 0.41 * segmentWidth;
      const sPeak = 0.44 * segmentWidth;
      
      const stStart = 0.48 * segmentWidth;
      const stEnd = 0.62 * segmentWidth;
      
      const tPeak = 0.72 * segmentWidth;
      const tEnd = 0.82 * segmentWidth;

      // Draw segment points
      for (let x = 0; x < segmentWidth; x++) {
        const globalX = startX + x;
        let y = centerY;

        // Apply AFib baseline tremor if present
        y += afibNoise(globalX);

        if (x >= pStart && x <= pEnd) {
          // P Wave (frequently absent or replaced by f-waves in AFib)
          if (isAfib) {
            y += Math.sin(globalX * 1.5) * 3;
          } else {
            const pProgress = (x - pStart) / (pEnd - pStart);
            y -= Math.sin(pProgress * Math.PI) * 12;
          }
        } else if (x > qStart && x <= qPeak) {
          // Q Wave
          const qProgress = (x - qStart) / (qPeak - qStart);
          y += qProgress * 10;
        } else if (x > qPeak && x <= rPeak) {
          // R Wave peak (widened slightly if QRS duration is high)
          const rProgress = (x - qPeak) / (rPeak - qPeak);
          const widthFactor = qrsDuration > 120 ? 1.3 : 1.0;
          y -= rProgress * 65 * widthFactor;
        } else if (x > rPeak && x <= sPeak) {
          // S Wave
          const sProgress = (x - rPeak) / (sPeak - rPeak);
          y += sProgress * 25;
        } else if (globalX >= (startX + stStart) && globalX <= (startX + stEnd)) {
          // ST Segment (Shifted up or down)
          y -= stShift;
        } else if (x > stEnd && x <= tEnd) {
          // T Wave
          const tProgress = (x - stEnd) / (tEnd - stEnd);
          const baseT = Math.sin(tProgress * Math.PI) * 18 * tMult;
          // Transition from ST elevation level to normal
          const stInterpolation = (1 - tProgress) * stShift;
          y -= (baseT + stInterpolation);
        }

        points.push(`L ${globalX} ${y}`);
      }
    }

    return points.join(" ");
  };

  const pathString = generateEcgPath(500, 160);

  // High contrast medical styling for alert state
  const isCritical = Math.abs(stElevation) >= 1.5 || arrhythmia === "Atrial Fibrillation" && heartRate > 100;
  const isHigh = Math.abs(stElevation) >= 0.8 || tInversion || heartRate > 100;
  const themeColor = isCritical 
    ? "text-rose-500 stroke-rose-500" 
    : isHigh 
      ? "text-amber-500 stroke-amber-500" 
      : "text-emerald-400 stroke-emerald-400";

  const glowColor = isCritical 
    ? "shadow-rose-950/40 border-rose-900/50" 
    : isHigh 
      ? "shadow-amber-950/40 border-amber-900/50" 
      : "shadow-emerald-950/30 border-emerald-900/50";

  return (
    <div className={`relative bg-slate-950 rounded-xl border ${glowColor} overflow-hidden shadow-2xl p-4 font-mono transition-all duration-300`}>
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #10b981 1px, transparent 1px),
            linear-gradient(to bottom, #10b981 1px, transparent 1px),
            linear-gradient(to right, rgba(16, 185, 129, 0.3) 5px, transparent 5px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.3) 5px, transparent 5px)
          `,
          backgroundSize: '40px 40px, 40px 40px, 8px 8px, 8px 8px'
        }}
      />

      {/* Screen Header */}
      <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-900 pb-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isCritical ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
          </span>
          <span className="font-bold tracking-wider text-slate-400 uppercase">Lead II Real-Time Telemetry</span>
        </div>
        <div className="flex items-center gap-4">
          <span>FILTER: LPF 40Hz</span>
          <span>50 mm/s</span>
          <span>10 mm/mV</span>
        </div>
      </div>

      {/* ECG SVG Viewport */}
      <div className="relative h-40 w-full bg-slate-950/50 rounded-md overflow-hidden flex items-center justify-center">
        <svg 
          viewBox="0 0 500 160" 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Static wave trace */}
          <path
            d={pathString}
            fill="none"
            className={`${themeColor} transition-colors duration-500`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sweeper sweep block mimicking fluorescent cathode ray tubes */}
          <rect
            x={offset}
            y="0"
            width="40"
            height="160"
            fill="url(#sweepGrad)"
            className="pointer-events-none opacity-40 mix-blend-plus-lighter"
          />

          <defs>
            <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" stopOpacity="1" />
              <stop offset="90%" stopColor="#020617" stopOpacity="0" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sweep line highlight */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-emerald-400 shadow-[0_0_12px_#10b981] pointer-events-none transition-transform duration-75"
          style={{ 
            left: `${(offset / 300) * 100}%`,
            opacity: offset > 295 ? 0 : 0.8
          }}
        />
      </div>

      {/* Vital readouts */}
      <div className="grid grid-cols-4 gap-3 mt-4 relative z-10 text-center">
        <div className="bg-slate-900/70 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">HR (Pulse)</div>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className={`text-xl font-bold tracking-tight ${themeColor}`}>{heartRate}</span>
            <span className="text-[10px] text-slate-600">BPM</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">ST Dev</div>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className={`text-xl font-bold tracking-tight ${stElevation !== 0 ? themeColor : 'text-slate-300'}`}>
              {stElevation > 0 ? `+${stElevation.toFixed(1)}` : stElevation.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-600">mm</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">QRS Duration</div>
          <div className="flex items-baseline justify-center gap-1 mt-1">
            <span className="text-xl font-bold tracking-tight text-slate-300">{qrsDuration}</span>
            <span className="text-[10px] text-slate-600">ms</span>
          </div>
        </div>

        <div className="bg-slate-900/70 p-2 rounded border border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Rhythm</div>
          <div className="text-xs font-bold truncate mt-2 text-slate-300 leading-none">
            {arrhythmia}
          </div>
        </div>
      </div>
    </div>
  );
}
