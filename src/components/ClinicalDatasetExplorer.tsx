import React, { useState, useMemo } from "react";
import { 
  CLINICAL_TRIAL_DATASET, 
  CLEVELAND_DIABETES_DATASET, 
  predictCadFromClinicalTrial,
  ClinicalTrialRecord,
  ClevelandRecord
} from "../dataset";
import { 
  Search, 
  Sparkles, 
  Database, 
  Activity, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Layers3,
  Flame,
  CheckCircle,
  HelpCircle,
  HelpCircle as ShieldAlert,
  ArrowRight
} from "lucide-react";

export function ClinicalDatasetExplorer() {
  const [activeTab, setActiveTab] = useState<"classifier" | "clinical-dataset" | "cleveland-dataset">("classifier");
  
  // Interactive Classifier State (Tuned parameters)
  const [testParams, setTestParams] = useState({
    age: 58,
    gender: "Male" as "Male" | "Female",
    bp: 145,
    cholesterol: 240,
    diabetes: true,
    smoking: true,
    lvef: 42,
    lvedd: 5.4 // in cm
  });

  // Calculate prediction and closest matches in real time
  const predictionResult = useMemo(() => {
    return predictCadFromClinicalTrial({
      age: testParams.age,
      gender: testParams.gender,
      systolicBp: testParams.bp,
      cholesterol: testParams.cholesterol,
      diabetes: testParams.diabetes,
      smoking: testParams.smoking,
      echoLvef: testParams.lvef,
      echoLvedd: testParams.lvedd
    });
  }, [testParams]);

  // Pagination and search states for Clinical Trial Dataset Table
  const [clinicalSearch, setClinicalSearch] = useState("");
  const [clinicalRiskFilter, setClinicalRiskFilter] = useState<"All" | "CAD" | "Normal">("All");
  const [clinicalPage, setClinicalPage] = useState(1);
  const itemsPerPage = 8;

  const filteredClinicalData = useMemo(() => {
    return CLINICAL_TRIAL_DATASET.filter(row => {
      const matchesSearch = row.gender.toLowerCase().includes(clinicalSearch.toLowerCase()) ||
                            row.age.toString().includes(clinicalSearch) ||
                            row.bp.toString().includes(clinicalSearch) ||
                            row.cholesterol.toString().includes(clinicalSearch);
      
      const matchesRisk = clinicalRiskFilter === "All" ||
                          (clinicalRiskFilter === "CAD" && row.cadRisk) ||
                          (clinicalRiskFilter === "Normal" && !row.cadRisk);

      return matchesSearch && matchesRisk;
    });
  }, [clinicalSearch, clinicalRiskFilter]);

  const clinicalPageCount = Math.ceil(filteredClinicalData.length / itemsPerPage);
  const paginatedClinicalData = useMemo(() => {
    const start = (clinicalPage - 1) * itemsPerPage;
    return filteredClinicalData.slice(start, start + itemsPerPage);
  }, [filteredClinicalData, clinicalPage]);


  // Pagination and search states for Cleveland Dataset Table
  const [clevelandSearch, setClevelandSearch] = useState("");
  const [clevelandRiskFilter, setClevelandRiskFilter] = useState<"All" | "CAD" | "Normal">("All");
  const [clevelandPage, setClevelandPage] = useState(1);

  const filteredClevelandData = useMemo(() => {
    return CLEVELAND_DIABETES_DATASET.filter(row => {
      const matchesSearch = row.gender.toLowerCase().includes(clevelandSearch.toLowerCase()) ||
                            row.age.toString().includes(clevelandSearch) ||
                            row.trestbps.toString().includes(clevelandSearch) ||
                            row.chol.toString().includes(clevelandSearch) ||
                            row.bmi.toString().includes(clevelandSearch);
      
      const matchesRisk = clevelandRiskFilter === "All" ||
                          (clevelandRiskFilter === "CAD" && row.heartDisease) ||
                          (clevelandRiskFilter === "Normal" && !row.heartDisease);

      return matchesSearch && matchesRisk;
    });
  }, [clevelandSearch, clevelandRiskFilter]);

  const clevelandPageCount = Math.ceil(filteredClevelandData.length / itemsPerPage);
  const paginatedClevelandData = useMemo(() => {
    const start = (clevelandPage - 1) * itemsPerPage;
    return filteredClevelandData.slice(start, start + itemsPerPage);
  }, [filteredClevelandData, clevelandPage]);

  // Aggregate stats calculation from Clinical Dataset
  const stats = useMemo(() => {
    const cadCohort = CLINICAL_TRIAL_DATASET.filter(r => r.cadRisk);
    const normalCohort = CLINICAL_TRIAL_DATASET.filter(r => !r.cadRisk);

    const avgLvefCad = cadCohort.reduce((sum, r) => sum + r.lvef, 0) / (cadCohort.length || 1);
    const avgLvefNormal = normalCohort.reduce((sum, r) => sum + r.lvef, 0) / (normalCohort.length || 1);

    const avgCholCad = cadCohort.reduce((sum, r) => sum + r.cholesterol, 0) / (cadCohort.length || 1);
    const avgCholNormal = normalCohort.reduce((sum, r) => sum + r.cholesterol, 0) / (normalCohort.length || 1);

    const dbPrevalenceCad = (cadCohort.filter(r => r.diabetes).length / (cadCohort.length || 1)) * 100;
    const dbPrevalenceNormal = (normalCohort.filter(r => r.diabetes).length / (normalCohort.length || 1)) * 100;

    const smPrevalenceCad = (cadCohort.filter(r => r.smoking).length / (cadCohort.length || 1)) * 100;
    const smPrevalenceNormal = (normalCohort.filter(r => r.smoking).length / (normalCohort.length || 1)) * 100;

    return {
      avgLvefCad: Math.round(avgLvefCad),
      avgLvefNormal: Math.round(avgLvefNormal),
      avgCholCad: Math.round(avgCholCad),
      avgCholNormal: Math.round(avgCholNormal),
      dbPrevalenceCad: Math.round(dbPrevalenceCad),
      dbPrevalenceNormal: Math.round(dbPrevalenceNormal),
      smPrevalenceCad: Math.round(smPrevalenceCad),
      smPrevalenceNormal: Math.round(smPrevalenceNormal),
    };
  }, []);

  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
      
      {/* Tab Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Layers3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-base text-slate-100 uppercase tracking-tight">
              Clinical Dataset & ML Analyzer
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse and query reference data, view statistical correlations, and test predictive vectors.
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 self-stretch sm:self-auto justify-between">
          <button
            onClick={() => setActiveTab("classifier")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              activeTab === "classifier"
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Predictive Model
          </button>
          <button
            onClick={() => setActiveTab("clinical-dataset")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              activeTab === "clinical-dataset"
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Echo Trial ({CLINICAL_TRIAL_DATASET.length})
          </button>
          <button
            onClick={() => setActiveTab("cleveland-dataset")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              activeTab === "cleveland-dataset"
                ? "bg-slate-800 text-slate-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Cleveland ({CLEVELAND_DIABETES_DATASET.length})
          </button>
        </div>
      </div>

      {/* RENDER VIEW 1: INTERACTIVE MODEL & PREDICTOR */}
      {activeTab === "classifier" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sliders Input Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-4">
                Clinical Feature Tuning Vector
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Age */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono">Age:</span>
                    <span className="text-slate-200 font-bold">{testParams.age} years</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={testParams.age}
                    onChange={(e) => setTestParams(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 cursor-pointer bg-slate-800 rounded"
                  />
                </div>

                {/* Gender Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1 font-semibold">
                    Biological Sex
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTestParams(prev => ({ ...prev, gender: "Male" }))}
                      className={`py-1 rounded text-xs font-mono transition-colors ${testParams.gender === "Male" ? "bg-slate-800 border border-slate-700 text-emerald-400 font-bold" : "bg-slate-950 border border-transparent text-slate-500"}`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setTestParams(prev => ({ ...prev, gender: "Female" }))}
                      className={`py-1 rounded text-xs font-mono transition-colors ${testParams.gender === "Female" ? "bg-slate-800 border border-slate-700 text-emerald-400 font-bold" : "bg-slate-950 border border-transparent text-slate-500"}`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Systolic BP */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono">Systolic BP:</span>
                    <span className="text-slate-200 font-bold">{testParams.bp} mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="200"
                    value={testParams.bp}
                    onChange={(e) => setTestParams(prev => ({ ...prev, bp: parseInt(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 cursor-pointer bg-slate-800 rounded"
                  />
                </div>

                {/* Cholesterol */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono">Total Cholesterol:</span>
                    <span className="text-slate-200 font-bold">{testParams.cholesterol} mg/dL</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="400"
                    value={testParams.cholesterol}
                    onChange={(e) => setTestParams(prev => ({ ...prev, cholesterol: parseInt(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 cursor-pointer bg-slate-800 rounded"
                  />
                </div>

                {/* LVEF */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono">LV Ejection Fraction (LVEF):</span>
                    <span className="text-rose-400 font-bold">{testParams.lvef}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    value={testParams.lvef}
                    onChange={(e) => setTestParams(prev => ({ ...prev, lvef: parseInt(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 cursor-pointer bg-slate-800 rounded"
                  />
                </div>

                {/* LVEDD */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-mono">LVEDD (Diastolic Dimension):</span>
                    <span className="text-slate-200 font-bold">{testParams.lvedd} cm ({Math.round(testParams.lvedd * 10)} mm)</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="8.0"
                    step="0.1"
                    value={testParams.lvedd}
                    onChange={(e) => setTestParams(prev => ({ ...prev, lvedd: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-500 h-1.5 cursor-pointer bg-slate-800 rounded"
                  />
                </div>
              </div>

              {/* Lifestyle Risks checkboxes */}
              <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-900">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={testParams.diabetes}
                    onChange={(e) => setTestParams(prev => ({ ...prev, diabetes: e.target.checked }))}
                    className="accent-emerald-500 h-4 w-4 rounded"
                  />
                  <div>
                    <span className="font-semibold block leading-none">Diabetes Mellitus</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Increases vascular atherosclerosis</span>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={testParams.smoking}
                    onChange={(e) => setTestParams(prev => ({ ...prev, smoking: e.target.checked }))}
                    className="accent-emerald-500 h-4 w-4 rounded"
                  />
                  <div>
                    <span className="font-semibold block leading-none">Active Tobacco Abuse</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">Accelerates coronary calcification</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Trial Dataset statistics comparisons */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850/60 space-y-3">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-widest block">
                Statistical Cohort Analytics (Reference Study Dataset)
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Analyzing the historical data shows critical biometric shifts between patients diagnosed with CAD and healthy subjects:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none">Avg LVEF</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xs text-rose-400 font-bold">{stats.avgLvefCad}%</span>
                    <span className="text-[9px] text-slate-500">vs</span>
                    <span className="text-xs text-emerald-400 font-bold">{stats.avgLvefNormal}%</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">(CAD vs Normal)</span>
                </div>

                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none">Avg Cholesterol</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xs text-rose-400 font-bold">{stats.avgCholCad}</span>
                    <span className="text-[9px] text-slate-500">vs</span>
                    <span className="text-xs text-emerald-400 font-bold">{stats.avgCholNormal}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">mg/dL</span>
                </div>

                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none">Diabetes rate</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xs text-rose-400 font-bold">{stats.dbPrevalenceCad}%</span>
                    <span className="text-[9px] text-slate-500">vs</span>
                    <span className="text-xs text-emerald-400 font-bold">{stats.dbPrevalenceNormal}%</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">(CAD vs Normal)</span>
                </div>

                <div className="bg-slate-900/40 p-2.5 rounded border border-slate-900 text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-mono block leading-none">Smoking rate</span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-xs text-rose-400 font-bold">{stats.smPrevalenceCad}%</span>
                    <span className="text-[9px] text-slate-500">vs</span>
                    <span className="text-xs text-emerald-400 font-bold">{stats.smPrevalenceNormal}%</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1">(CAD vs Normal)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Predictor Gauge & Nearest Case Match Display */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Classification Gauge */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-850 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-4">
                KNN Dataset Probability Score
              </span>

              {/* Large Circular Gauge */}
              <div className="relative flex items-center justify-center w-36 h-36">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" className="stroke-slate-900 fill-transparent" strokeWidth="8" />
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="62" 
                    className={`stroke-current ${predictionResult.predictedScore >= 75 ? 'text-rose-500' : predictionResult.predictedScore >= 50 ? 'text-amber-500' : 'text-yellow-500'} fill-transparent transition-all duration-500`}
                    strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 62} 
                    strokeDashoffset={2 * Math.PI * 62 - (predictionResult.predictedScore / 100) * (2 * Math.PI * 62)} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-display text-slate-50">{predictionResult.predictedScore}%</span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">CAD Risk</span>
                </div>
              </div>

              <div className="mt-4">
                <span className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded border ${predictionResult.predictedScore >= 75 ? 'bg-rose-950/30 border-rose-900/40 text-rose-400' : predictionResult.predictedScore >= 50 ? 'bg-amber-950/30 border-amber-900/40 text-amber-400' : 'bg-yellow-950/30 border-yellow-900/20 text-yellow-400'}`}>
                  {predictionResult.predictedScore >= 75 ? 'Critical Risk Category' : predictionResult.predictedScore >= 50 ? 'High Risk Category' : 'Moderate/Low Risk'}
                </span>
                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed max-w-xs font-medium">
                  This calculation is mathematical matching of tuned parameters against the closest clinical trial samples.
                </p>
              </div>
            </div>

            {/* Nearest Neighbors Case Matches */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Top Closest Study Matches
              </h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                These are real exact matched patients from the trial, verifying how the parameters align with actual study findings.
              </p>

              <div className="space-y-2 pt-1">
                {predictionResult.closestMatches.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-2.5 rounded border border-slate-900/80 text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] text-slate-400">
                        Match #{idx + 1} (Similarity: <strong className="text-slate-200">{Math.round((1 - item.distance) * 100)}%</strong>)
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${item.record.cadRisk ? 'bg-rose-950/30 border-rose-900/30 text-rose-400' : 'bg-emerald-950/30 border-emerald-900/30 text-emerald-400'}`}>
                        {item.record.cadRisk ? 'CAD POSITIVE' : 'CAD NORMAL'}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-slate-500">
                      <div>Age: <strong className="text-slate-300">{item.record.age}</strong></div>
                      <div>Sex: <strong className="text-slate-300">{item.record.gender[0]}</strong></div>
                      <div>LVEF: <strong className="text-rose-300">{item.record.lvef}%</strong></div>
                      <div>BP: <strong className="text-slate-300">{item.record.bp}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER VIEW 2: CLINICAL TRIAL DATASET */}
      {activeTab === "clinical-dataset" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            {/* Search */}
            <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="text"
                placeholder="Search trial rows (e.g. Female, 73)..."
                value={clinicalSearch}
                onChange={(e) => { setClinicalSearch(e.target.value); setClinicalPage(1); }}
                className="w-full bg-transparent text-xs text-slate-300 pl-9 pr-3 py-1.5 focus:outline-none"
              />
            </div>

            {/* Risk filter */}
            <div className="flex gap-1.5 w-full sm:w-auto">
              {(["All", "CAD", "Normal"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setClinicalRiskFilter(f); setClinicalPage(1); }}
                  className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-mono rounded font-semibold tracking-wider transition-all border ${
                    clinicalRiskFilter === f
                      ? "bg-slate-800 text-slate-200 border-slate-700"
                      : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  {f === "All" ? "All Cohorts" : f === "CAD" ? "CAD Risk" : "CAD Normal"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-850 rounded-lg bg-slate-950/20">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase text-[9px] tracking-wider font-semibold">
                  <th className="p-3">Age</th>
                  <th className="p-3">Sex</th>
                  <th className="p-3">BP</th>
                  <th className="p-3">Chol.</th>
                  <th className="p-3">Diab.</th>
                  <th className="p-3">Smok.</th>
                  <th className="p-3">LVEF</th>
                  <th className="p-3">LVEDD</th>
                  <th className="p-3">E/A Ratio</th>
                  <th className="p-3 text-right">CAD OUTCOME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {paginatedClinicalData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-500">
                      No matching trial rows found.
                    </td>
                  </tr>
                ) : (
                  paginatedClinicalData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-slate-200">{row.age}y</td>
                      <td className="p-3">{row.gender}</td>
                      <td className="p-3">{row.bp} mmHg</td>
                      <td className="p-3">{row.cholesterol} mg/dL</td>
                      <td className="p-3">{row.diabetes ? "Yes" : "No"}</td>
                      <td className="p-3">{row.smoking ? "Yes" : "No"}</td>
                      <td className="p-3 text-rose-400 font-bold">{row.lvef}%</td>
                      <td className="p-3">{row.lvedd} cm</td>
                      <td className="p-3">{row.eaRatio}</td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${row.cadRisk ? 'bg-rose-950/30 border-rose-900/30 text-rose-400' : 'bg-emerald-950/30 border-emerald-900/30 text-emerald-400'}`}>
                          {row.cadRisk ? "CAD Risk" : "Normal"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clinicalPageCount > 1 && (
            <div className="flex justify-between items-center font-mono text-[10px] text-slate-400 pt-2">
              <span>Showing Page {clinicalPage} of {clinicalPageCount} ({filteredClinicalData.length} records)</span>
              
              <div className="flex gap-2">
                <button
                  disabled={clinicalPage === 1}
                  onClick={() => setClinicalPage(p => p - 1)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 disabled:opacity-30 disabled:hover:bg-transparent px-2 py-1 rounded transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={clinicalPage === clinicalPageCount}
                  onClick={() => setClinicalPage(p => p + 1)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 disabled:opacity-30 disabled:hover:bg-transparent px-2 py-1 rounded transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER VIEW 3: CLEVELAND LIFESTYLE DATASET */}
      {activeTab === "cleveland-dataset" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40 p-4 rounded-lg border border-slate-850">
            {/* Search */}
            <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3" />
              <input
                type="text"
                placeholder="Search Cleveland rows (e.g. Male, 67)..."
                value={clevelandSearch}
                onChange={(e) => { setClevelandSearch(e.target.value); setClevelandPage(1); }}
                className="w-full bg-transparent text-xs text-slate-300 pl-9 pr-3 py-1.5 focus:outline-none"
              />
            </div>

            {/* Risk filter */}
            <div className="flex gap-1.5 w-full sm:w-auto">
              {(["All", "CAD", "Normal"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => { setClevelandRiskFilter(f); setClevelandPage(1); }}
                  className={`flex-1 sm:flex-initial px-3 py-1 text-[10px] font-mono rounded font-semibold tracking-wider transition-all border ${
                    clevelandRiskFilter === f
                      ? "bg-slate-800 text-slate-200 border-slate-700"
                      : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                  }`}
                >
                  {f === "All" ? "All Cohorts" : f === "CAD" ? "CAD Risk" : "CAD Normal"}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-850 rounded-lg bg-slate-950/20">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 uppercase text-[9px] tracking-wider font-semibold">
                  <th className="p-3">Age</th>
                  <th className="p-3">Sex</th>
                  <th className="p-3">Chest Pain Type</th>
                  <th className="p-3">BP</th>
                  <th className="p-3">Cholesterol</th>
                  <th className="p-3">FBS</th>
                  <th className="p-3">Resting ECG</th>
                  <th className="p-3">Max HR</th>
                  <th className="p-3">BMI</th>
                  <th className="p-3 text-right">HEART DISEASE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {paginatedClevelandData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-500">
                      No matching Cleveland rows found.
                    </td>
                  </tr>
                ) : (
                  paginatedClevelandData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-900/30">
                      <td className="p-3 font-semibold text-slate-200">{row.age}y</td>
                      <td className="p-3">{row.gender}</td>
                      <td className="p-3">
                        {{
                          1: "Typical Angina",
                          2: "Atypical Angina",
                          3: "Non-Anginal",
                          4: "Asymptomatic"
                        }[row.cp]}
                      </td>
                      <td className="p-3">{row.trestbps} mmHg</td>
                      <td className="p-3">{row.chol} mg/dL</td>
                      <td className="p-3">{row.fbs ? "> 120" : "< 120"}</td>
                      <td className="p-3">
                        {{
                          0: "Normal",
                          1: "ST-T wave abnormality",
                          2: "LV hypertrophy"
                        }[row.restecg]}
                      </td>
                      <td className="p-3">{row.thalach} bpm</td>
                      <td className="p-3">{row.bmi}</td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${row.heartDisease ? 'bg-rose-950/30 border-rose-900/30 text-rose-400' : 'bg-emerald-950/30 border-emerald-900/30 text-emerald-400'}`}>
                          {row.heartDisease ? "Present" : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {clevelandPageCount > 1 && (
            <div className="flex justify-between items-center font-mono text-[10px] text-slate-400 pt-2">
              <span>Showing Page {clevelandPage} of {clevelandPageCount} ({filteredClevelandData.length} records)</span>
              
              <div className="flex gap-2">
                <button
                  disabled={clevelandPage === 1}
                  onClick={() => setClevelandPage(p => p - 1)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 disabled:opacity-30 disabled:hover:bg-transparent px-2 py-1 rounded transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={clevelandPage === clevelandPageCount}
                  onClick={() => setClevelandPage(p => p + 1)}
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 disabled:opacity-30 disabled:hover:bg-transparent px-2 py-1 rounded transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
