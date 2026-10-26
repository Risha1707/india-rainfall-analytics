import React, { useState, useEffect } from 'react';
import { Cpu, Sliders, RefreshCw, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { SUBDIVISION_STATS } from '../data/climateData';
import { predictRainfall } from '../services/predictor';

export default function PredictiveModelStudio({ initialSubdivision = 'KERALA' }) {
  const [subdivision, setSubdivision] = useState(initialSubdivision);

  // Input states
  const [janFeb, setJanFeb] = useState(30);
  const [marMay, setMarMay] = useState(380);
  const [lag1, setLag1] = useState(2000);
  const [rolling3yr, setRolling3yr] = useState(2000);

  // Prediction output state
  const [prediction, setPrediction] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync inputs when subdivision changes
  useEffect(() => {
    const subInfo = SUBDIVISION_STATS[subdivision] || SUBDIVISION_STATS['KERALA'];
    setJanFeb(subInfo.mean_winter);
    setMarMay(subInfo.mean_premonsoon);
    setLag1(subInfo.mean_monsoon);
    setRolling3yr(subInfo.mean_monsoon);
  }, [subdivision]);

  // Execute prediction
  const handlePredict = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const res = predictRainfall({
        subdivision,
        janFeb: parseFloat(janFeb),
        marMay: parseFloat(marMay),
        lag1: parseFloat(lag1),
        rolling3yr: parseFloat(rolling3yr)
      });
      setPrediction(res);
      setIsSimulating(false);
    }, 120);
  };

  // Run on first load & whenever inputs change
  useEffect(() => {
    handlePredict();
  }, [subdivision, janFeb, marMay, lag1, rolling3yr]);

  // Scenario Presets
  const applyScenario = (type) => {
    const subInfo = SUBDIVISION_STATS[subdivision] || SUBDIVISION_STATS['KERALA'];
    if (type === 'normal') {
      setJanFeb(subInfo.mean_winter);
      setMarMay(subInfo.mean_premonsoon);
      setLag1(subInfo.mean_monsoon);
      setRolling3yr(subInfo.mean_monsoon);
    } else if (type === 'drought') {
      // 35% drop in pre-monsoon and negative rolling memory
      setJanFeb(Math.max(0, Math.round(subInfo.mean_winter * 0.4)));
      setMarMay(Math.max(5, Math.round(subInfo.mean_premonsoon * 0.55)));
      setLag1(Math.round(subInfo.mean_monsoon * 0.75));
      setRolling3yr(Math.round(subInfo.mean_monsoon * 0.82));
    } else if (type === 'excess') {
      // 40% surge in pre-monsoon convective activity & strong rolling recharge
      setJanFeb(Math.round(subInfo.mean_winter * 1.6));
      setMarMay(Math.round(subInfo.mean_premonsoon * 1.55));
      setLag1(Math.round(subInfo.mean_monsoon * 1.25));
      setRolling3yr(Math.round(subInfo.mean_monsoon * 1.18));
    }
  };

  const subInfo = SUBDIVISION_STATS[subdivision] || SUBDIVISION_STATS['KERALA'];

  return (
    <section id="predictor" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>Real-Time Inference Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Live Predictive Analytics & Scenario Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Adjust pre-monsoon indicators and climate memory to generate instantaneous predictions for Southwest Monsoon and Total Annual Rainfall.
            </p>
          </div>

          {/* Quick Scenario Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Scenarios:</span>
            <button
              onClick={() => applyScenario('normal')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            >
              Normal LPA
            </button>
            <button
              onClick={() => applyScenario('drought')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition"
            >
              Simulate Drought
            </button>
            <button
              onClick={() => applyScenario('excess')}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-950/50 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 transition"
            >
              Simulate Flood Risk
            </button>
          </div>
        </div>

        {/* Studio Grid: Controls on Left, Outputs on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Column: Interactive Parameters (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Subdivision Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Meteorological Subdivision
              </label>
              <select
                value={subdivision}
                onChange={(e) => setSubdivision(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {Object.keys(SUBDIVISION_STATS).sort().map((sub) => (
                  <option key={sub} value={sub}>
                    {sub} ({SUBDIVISION_STATS[sub].climate_zone})
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                <span>Historical LPA: <strong>{subInfo.mean_monsoon} mm</strong> (Monsoon) / <strong>{subInfo.mean_annual} mm</strong> (Annual)</span>
                <span>CV: <strong>{subInfo.cv_annual_pct}%</strong></span>
              </div>
            </div>

            {/* Slider 1: Pre-Monsoon Mar-May */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                  <span>Pre-Monsoon Convective Showers (Mar – May)</span>
                </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {marMay} <span className="text-xs text-slate-400">mm</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(600, Math.round(subInfo.mean_premonsoon * 2.5))}
                step="1"
                value={marMay}
                onChange={(e) => setMarMay(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 mm (Severe Dry)</span>
                <span>Subdivision Baseline: {subInfo.mean_premonsoon} mm</span>
                <span>High Convective Activity</span>
              </div>
            </div>

            {/* Slider 2: Winter Rainfall Jan-Feb */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">
                  Winter Rainfall / Western Disturbances (Jan – Feb)
                </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {janFeb} <span className="text-xs text-slate-400">mm</span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(250, Math.round(subInfo.mean_winter * 3))}
                step="1"
                value={janFeb}
                onChange={(e) => setJanFeb(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>0 mm</span>
                <span>Subdivision Baseline: {subInfo.mean_winter} mm</span>
                <span>Max Disturbance</span>
              </div>
            </div>

            {/* Slider 3: 3-Year Rolling Monsoon Mean */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold text-white">
                    Recent 3-Year Rolling Monsoon Mean (Climate Memory)
                  </span>
                  <span className="block text-[10px] text-slate-400">Accounts for 95.5% feature importance</span>
                </div>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {rolling3yr} <span className="text-xs text-slate-400">mm</span>
                </span>
              </div>
              <input
                type="range"
                min={Math.round(subInfo.mean_monsoon * 0.4)}
                max={Math.round(subInfo.mean_monsoon * 1.8)}
                step="5"
                value={rolling3yr}
                onChange={(e) => setRolling3yr(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Drought Cycle ({Math.round(subInfo.mean_monsoon * 0.4)} mm)</span>
                <span>Normal ({subInfo.mean_monsoon} mm)</span>
                <span>Wet Cycle ({Math.round(subInfo.mean_monsoon * 1.8)} mm)</span>
              </div>
            </div>

            {/* Slider 4: Previous Year Lag-1 */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">
                  Previous Year Monsoon Rainfall (Lag-1)
                </span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {lag1} <span className="text-xs text-slate-400">mm</span>
                </span>
              </div>
              <input
                type="range"
                min={Math.round(subInfo.mean_monsoon * 0.4)}
                max={Math.round(subInfo.mean_monsoon * 1.8)}
                step="5"
                value={lag1}
                onChange={(e) => setLag1(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          </div>

          {/* Right Column: Prediction Output Card (5 Cols) */}
          <div className="lg:col-span-5">
            {prediction && (
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-2xl border border-cyan-500/30 shadow-xl shadow-cyan-950/40 space-y-6">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Model Inference Output
                  </span>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${prediction.riskColor}`}>
                    {prediction.riskBadge}
                  </div>
                </div>

                {/* Main Predicted Monsoon Metric */}
                <div>
                  <span className="text-xs font-medium text-slate-400">Predicted Southwest Monsoon (Jun–Sep)</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {prediction.predictedMonsoon}
                    </span>
                    <span className="text-base font-semibold text-slate-400">mm</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs font-semibold text-slate-400">Departure from LPA:</span>
                    <span className={`text-xs font-bold ${prediction.departurePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {prediction.departurePct > 0 ? `+${prediction.departurePct}` : prediction.departurePct}%
                    </span>
                    <span className="text-[11px] text-slate-500">(LPA: {prediction.lpaMonsoon} mm)</span>
                  </div>
                </div>

                {/* Total Predicted Annual */}
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-300">Predicted Total Annual</span>
                    <span className="text-lg font-extrabold text-cyan-300 font-mono">
                      {prediction.predictedAnnual} mm
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Subdivision baseline annual LPA: {prediction.lpaAnnual} mm
                  </span>
                </div>

                {/* 95% Confidence Interval Band */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">95% Confidence Interval:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {prediction.confidenceInterval.lower} – {prediction.confidenceInterval.upper} mm
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{
                        marginLeft: `${Math.max(5, (prediction.confidenceInterval.lower / (prediction.confidenceInterval.upper * 1.3)) * 100)}%`,
                        width: '60%'
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Calculated from out-of-time test MAE error bounds (±{prediction.confidenceInterval.margin} mm).
                  </span>
                </div>

                {/* Model Attribution in Card */}
                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Ensemble Algorithm:</span>
                    <span className="text-slate-200 font-medium">Ridge & Linear OLS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Test Set R² Score:</span>
                    <span className="text-emerald-400 font-semibold">{prediction.metrics.r2}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inference Latency:</span>
                    <span className="text-cyan-400 font-mono">&lt; 1 ms (Edge/Local)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
