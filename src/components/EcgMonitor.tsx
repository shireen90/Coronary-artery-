import { useEffect, useState, useRef, useId } from "react";

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
  const clipId = useId();
  const gradId = useId();

  // Animation loop to simulate the sweep line or wave motion with realistic speed (approx. 25 units/second or 0.05 units/ms)
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      // Sweep across 500 units slowly and smoothly (approx. 10 seconds per full sweep)
      setOffset((prev) => (prev + delta * 0.05) % 500);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Generate SVG path where the heartbeat waveform and interval are physiologically modeled
  const generateEcgPath = (width: number, height: number): string => {
    const centerY = height / 2;
    
    // Scale factors
    const stShift = stElevation * 12; // 1mm = ~12px vertical shift
    const tMult = tInversion ? -1 : 1;
    const isAfib = arrhythmia === "Atrial Fibrillation";
    
    // Calibrate horizontal units per millisecond (based on sweep speed of 0.05 units/ms)
    const scaleX = 0.05; 
    const hr = Math.max(30, Math.min(220, heartRate));
    
    // R-R interval in units
    const rrInterval = (60000 / hr) * scaleX;
    
    // Generate deterministic R-peak positions across the full width
    const rPeaks: number[] = [];
    let currentR = 30; // start first R peak at 30 units
    rPeaks.push(currentR);
    
    for (let i = 0; i < 50; i++) {
      let interval = rrInterval;
      if (isAfib) {
        // AFib: irregularly irregular R-R intervals
        const noise = Math.sin(i * 1.7) * 0.22 + Math.cos(i * 3.1) * 0.08;
        interval = rrInterval * (1 + noise);
      }
      currentR += interval;
      rPeaks.push(currentR);
      if (currentR > width + 100) break;
    }
    
    const points: string[] = [];
    let isFirst = true;

    // Draw continuous waveform across the screen horizontal coordinates
    for (let x = 0; x < width; x++) {
      const globalX = x;
      
      // Find the nearest R-peak to determine wave morphology at this position
      let nearestR = rPeaks[0];
      let minDist = Math.abs(globalX - rPeaks[0]);
      for (let i = 1; i < rPeaks.length; i++) {
        const dist = Math.abs(globalX - rPeaks[i]);
        if (dist < minDist) {
          minDist = dist;
          nearestR = rPeaks[i];
        }
      }
      
      const dx = globalX - nearestR;
      // Convert distance in units to time in milliseconds relative to R-peak
      const dt = dx / scaleX;
      
      // Heart rate dependent duration scaling factor (Bazett's-like formula to compress waves at high HR)
      const rateFactor = Math.sqrt(60 / hr);
      
      const currentQrs = qrsDuration * rateFactor;
      
      let y = centerY;

      // Apply AFib baseline fibrillatory ("f") waves if present
      if (isAfib) {
        y += Math.sin(globalX * 0.45) * 2.8 + Math.cos(globalX * 0.95) * 1.2;
      }

      // Physiological Waveform Timings (relative to R-peak at 0 ms)
      const pStart = -160 * rateFactor;
      const pEnd = -70 * rateFactor;
      
      const qrsStart = -currentQrs / 2;
      const qPeakTime = -currentQrs / 4;
      const rPeakTime = 0;
      const sPeakTime = currentQrs / 4;
      const qrsEnd = currentQrs / 2;
      
      const stStart = qrsEnd;
      const stEnd = qrsEnd + 80 * rateFactor;
      
      const tStart = stEnd;
      const tEnd = qrsEnd + 260 * rateFactor;

      if (!isAfib && dt >= pStart && dt <= pEnd) {
        // P Wave: elegant smooth half-sine curve
        const pProgress = (dt - pStart) / (pEnd - pStart);
        const pHeight = 7; 
        y -= Math.sin(pProgress * Math.PI) * pHeight;
      } else if (dt >= qrsStart && dt < qPeakTime) {
        // Q Wave: brief small dip
        const qProgress = (dt - qrsStart) / (qPeakTime - qrsStart);
        const qDepth = 6;
        y += qProgress * qDepth;
      } else if (dt >= qPeakTime && dt < rPeakTime) {
        // R Wave: tall sharp upstroke
        const rProgress = (dt - qPeakTime) / (rPeakTime - qPeakTime);
        const qDepth = 6;
        const rHeight = 55; 
        y += qDepth - rProgress * (qDepth + rHeight);
      } else if (dt >= rPeakTime && dt < sPeakTime) {
        // S Wave: rapid downstroke below baseline
        const sProgress = (dt - rPeakTime) / (sPeakTime - rPeakTime);
        const rHeight = 55;
        const sDepth = 12;
        y += -rHeight + sProgress * (rHeight + sDepth);
      } else if (dt >= sPeakTime && dt < qrsEnd) {
        // S-to-ST return: transition to ST level
        const stProgress = (dt - sPeakTime) / (qrsEnd - sPeakTime);
        const sDepth = 12;
        y += sDepth - stProgress * (sDepth + stShift);
      } else if (dt >= stStart && dt < stEnd) {
        // ST Segment: flat line at shift level
        y -= stShift;
      } else if (dt >= tStart && dt <= tEnd) {
        // T Wave: smooth rounded repolarization curve
        const tProgress = (dt - tStart) / (tEnd - tStart);
        const tHeight = 14 * tMult;
        const baseT = Math.sin(tProgress * Math.PI) * tHeight;
        const stInterpolation = (1 - tProgress) * stShift;
        y -= (baseT + stInterpolation);
      }

      // Add high-frequency electrode contact micro-tremor noise (highly realistic clinical look)
      const liveJitter = Math.sin(globalX * 1.8) * 0.25 + Math.cos(globalX * 3.4) * 0.1;
      y += liveJitter;

      if (isFirst) {
        points.push(`M ${globalX} ${y}`);
        isFirst = false;
      } else {
        points.push(`L ${globalX} ${y}`);
      }
    }

    return points.join(" ");
  };

  const pathString = generateEcgPath(500, 160);

  // High contrast medical styling for alert state
  const isCritical = Math.abs(stElevation) >= 1.5 || (arrhythmia === "Atrial Fibrillation" && heartRate > 100);
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

  // Calculate sweep-erase visible zones (Continuous cathode-ray trace)
  const eraseWidth = 35;
  const showRects: { x: number; width: number }[] = [];
  if (offset + eraseWidth <= 500) {
    showRects.push({ x: 0, width: offset });
    showRects.push({ x: offset + eraseWidth, width: 500 - (offset + eraseWidth) });
  } else {
    const wrappedEnd = (offset + eraseWidth) % 500;
    showRects.push({ x: wrappedEnd, width: offset - wrappedEnd });
  }

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
          <span>25 mm/s</span>
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
          {/* Real Sweep wave trace using clipPath */}
          <path
            d={pathString}
            fill="none"
            className={`${themeColor} transition-colors duration-500`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            clipPath={`url(#${clipId})`}
          />

          {/* Sweeper sweep block mimicking fluorescent cathode ray tubes */}
          <rect
            x={offset - 40}
            y="0"
            width="40"
            height="160"
            fill={`url(#${gradId})`}
            className="pointer-events-none opacity-40 mix-blend-plus-lighter"
          />

          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0" />
              <stop offset="100%" stopColor={isCritical ? "#f43f5e" : isHigh ? "#f59e0b" : "#10b981"} stopOpacity="0.4" />
            </linearGradient>
            <clipPath id={clipId}>
              {showRects.map((r, idx) => (
                <rect key={idx} x={r.x} y="0" width={r.width} height="160" />
              ))}
            </clipPath>
          </defs>
        </svg>

        {/* Sweep line highlight matching alert states */}
        <div 
          className={`absolute top-0 bottom-0 w-[2px] pointer-events-none transition-transform duration-75 ${
            isCritical ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' :
            isHigh ? 'bg-amber-500 shadow-[0_0_12px_#f59e0b]' :
            'bg-emerald-400 shadow-[0_0_12px_#34d399]'
          }`}
          style={{ 
            left: `${(offset / 500) * 100}%`,
            opacity: offset > 495 ? 0 : 0.8
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
