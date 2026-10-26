import React from 'react';
import { CloudRain, Cpu, ShieldCheck, TrendingUp, Sparkles, ArrowRight, BarChart3, Database } from 'lucide-react';
import { MODEL_METRICS, DATASET_METADATA } from '../data/climateData';

export default function HeroOverview({ onExploreSubdivision, onOpenPredictor }) {
  const bestReg = MODEL_METRICS.regression_benchmarks.find(m => m.is_best) || MODEL_METRICS.regression_benchmarks[1];

  return (
    <section id="overview" className="relative pt-8 pb-12 overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Government of India (OGD) Meteorological Dataset</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Indian Climate & Rainfall <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Predictive Analytics Suite
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A complete, production-ready machine learning system trained on <strong className="text-white">115 years of genuine IMD data (1901–2015)</strong> sourced from the official <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">data.gov.in</a> portal. Featuring strict chronological splits, outlier auditing, multi-model benchmarking, and real-time interactive predictions.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#predictor"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Live Prediction Engine</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            <a
              href="#explorer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-medium transition"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Explore 36 Subdivisions</span>
            </a>
          </div>
        </div>

        {/* 4 Headline Metric Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800/80 hover:border-cyan-500/30 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Historical Depth</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              115 <span className="text-sm font-semibold text-slate-400">Years</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Continuous records: 1901 – 2015 across India
            </p>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800/80 hover:border-cyan-500/30 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Spatial Coverage</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <CloudRain className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              36 <span className="text-sm font-semibold text-slate-400">Subdivisions</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              5 Macro Climate Zones & 4,116 reconciled records
            </p>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800/80 hover:border-cyan-500/30 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Model Accuracy</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {bestReg.test_r2.toFixed(4)} <span className="text-xs font-medium text-slate-400">R²</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Out-of-time test score (1996–2015, zero leakage)
            </p>
          </div>

          <div className="glass-panel p-4 sm:p-5 rounded-2xl border-slate-800/80 hover:border-cyan-500/30 transition shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Mean Absolute Error</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {bestReg.test_mae_mm} <span className="text-sm font-semibold text-slate-400">mm</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Test MAPE: {bestReg.test_mape_pct}% on monsoon totals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
