import React from 'react';
import { Droplets, Sun, Compass, AlertTriangle, Wind, Info } from 'lucide-react';
import { SEASONAL_DISTRIBUTION, SUBDIVISION_STATS } from '../data/climateData';

export default function KeyMetricsCards() {
  const annualMean = SEASONAL_DISTRIBUTION.overall_mean_annual;
  const monsoonMean = SEASONAL_DISTRIBUTION.overall_mean_monsoon;
  const monsoonShare = SEASONAL_DISTRIBUTION.seasonal_share_pct["Southwest Monsoon (Jun-Sep)"];

  return (
    <section className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <span>Climatological Baselines & Key Insights</span>
          </h2>
          <p className="text-xs text-slate-400">
            Synthesized across 4,116 subdivision-year records from the India Meteorological Department
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Monsoon Dominance */}
        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Monsoon Concentration</h3>
              <p className="text-[11px] text-slate-400">Southwest Monsoon (Jun – Sep)</p>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-blue-400">{monsoonShare}%</span>
            <span className="text-xs text-slate-300">of All-India Annual Rain</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The national average monsoon volume is <strong className="text-slate-200">{monsoonMean} mm</strong> out of an annual total of <strong className="text-slate-200">{annualMean} mm</strong>. Pre-monsoon showers (Mar-May) contribute 11.2%, while winter disturbances supply 3.0%.
          </p>
        </div>

        {/* Card 2: Continental Geographic Contrast */}
        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Geographic Diversity</h3>
              <p className="text-[11px] text-slate-400">Arid West vs. Wet East/Coasts</p>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400">11.7x</span>
            <span className="text-xs text-slate-300">Annual Rainfall Disparity</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Arunachal Pradesh receives <strong className="text-slate-200">3,418.9 mm/yr</strong>, whereas West Rajasthan averages only <strong className="text-slate-200">292.7 mm/yr</strong>. Global models fail here; sub-regional modeling with localized baselines is mandatory.
          </p>
        </div>

        {/* Card 3: Climate Volatility & Drought Risk */}
        <div className="glass-panel p-5 rounded-2xl border-slate-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Pre-Monsoon Signaling</h3>
              <p className="text-[11px] text-slate-400">Predictive Feature Driving ML</p>
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-400">95.5%</span>
            <span className="text-xs text-slate-300">Memory in 3-Yr Rolling Mean</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Random forest feature importance reveals that multi-year ocean-atmosphere coupling (ENSO/IOD) combined with Mar–May pre-monsoon convective rainfall provides early warning signals for monsoon deficit anomalies.
          </p>
        </div>
      </div>
    </section>
  );
}
