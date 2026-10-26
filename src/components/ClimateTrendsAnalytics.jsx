import React from 'react';
import { Line } from 'react-chartjs-2';
import { Calendar, AlertTriangle, CloudLightning, ShieldAlert, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { DECADAL_TRENDS, HISTORICAL_EXTREMES } from '../data/climateData';

export default function ClimateTrendsAnalytics() {
  const decades = DECADAL_TRENDS.map(d => d.decade);
  const annualMeans = DECADAL_TRENDS.map(d => d.mean_annual);
  const monsoonMeans = DECADAL_TRENDS.map(d => d.mean_monsoon);

  const decadalChartData = {
    labels: decades,
    datasets: [
      {
        label: 'Decadal Mean Annual (mm)',
        data: annualMeans,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.2,
        pointRadius: 4,
        pointBackgroundColor: '#38bdf8'
      },
      {
        label: 'Decadal Mean Monsoon Jun-Sep (mm)',
        data: monsoonMeans,
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        tension: 0.3,
        borderWidth: 2.2,
        pointRadius: 4,
        pointBackgroundColor: '#0284c7'
      }
    ]
  };

  const decadalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  const topDroughts = HISTORICAL_EXTREMES.top_historical_drought_years.slice(0, 6);
  const topFloods = HISTORICAL_EXTREMES.top_historical_excess_flood_years.slice(0, 6);

  return (
    <section id="trends" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Climate History & Extreme Events</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            115-Year Decadal Trends & Historical Climate Extremes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Analyzing long-term climate trajectory from 1901 to 2015 alongside documented national drought and flood anomalies.
          </p>
        </div>

        {/* Decadal Trend Line Chart */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                Decadal Precipitation Evolution (1900s to 2010s)
              </h3>
              <p className="text-[11px] text-slate-400">
                10-year rolling averages across all Indian meteorological monitoring stations
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
              National Monsoon LPA: <strong className="text-cyan-400">{HISTORICAL_EXTREMES.lpa_national_monsoon_mm} mm</strong>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <Line data={decadalChartData} options={decadalChartOptions} />
          </div>
        </div>

        {/* Dual Cards: Historical Severe Droughts vs Historic Record Floods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Drought Extremes */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-rose-900/30">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top All-India Drought Years</h3>
                <p className="text-[11px] text-slate-400">Severe negative departure from national monsoon LPA</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {topDroughts.map((d) => (
                <div key={d.YEAR} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm font-mono">{d.YEAR}</span>
                    <span className="text-[11px] text-slate-400">Monsoon: {d.national_monsoon.toFixed(1)} mm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                    {d.monsoon_departure}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Flood / Excess Extremes */}
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-blue-900/30">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <CloudLightning className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Top All-India Excess / Flood Years</h3>
                <p className="text-[11px] text-slate-400">Highest recorded national monsoon surplus years</p>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {topFloods.map((f) => (
                <div key={f.YEAR} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-white text-sm font-mono">{f.YEAR}</span>
                    <span className="text-[11px] text-slate-400">Monsoon: {f.national_monsoon.toFixed(1)} mm</span>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                    +{f.monsoon_departure}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
