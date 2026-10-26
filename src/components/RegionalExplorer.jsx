import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, TrendingUp, AlertCircle, ArrowUpRight, Award, BarChart2, Zap } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { SUBDIVISION_STATS } from '../data/climateData';

export default function RegionalExplorer({ selectedSubdivision, onSelectSubdivision, onSendToPredictor }) {
  const [currentSub, setCurrentSub] = useState(selectedSubdivision || 'KERALA');

  const subData = useMemo(() => {
    return SUBDIVISION_STATS[currentSub] || SUBDIVISION_STATS['KERALA'];
  }, [currentSub]);

  // Group subdivisions by Climate Zone
  const subdivisionsByZone = useMemo(() => {
    const groups = {};
    Object.values(SUBDIVISION_STATS).forEach(s => {
      const zone = s.climate_zone || 'Other';
      if (!groups[zone]) groups[zone] = [];
      groups[zone].push(s.subdivision);
    });
    return groups;
  }, []);

  const handleSubChange = (e) => {
    const newSub = e.target.value;
    setCurrentSub(newSub);
    if (onSelectSubdivision) onSelectSubdivision(newSub);
  };

  // Chart 1: 115-Year Time Series
  const lineChartData = {
    labels: subData.time_series.years,
    datasets: [
      {
        label: 'Annual Rainfall (mm)',
        data: subData.time_series.annual,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.08)',
        fill: true,
        tension: 0.15,
        borderWidth: 1.8,
        pointRadius: 1,
        pointHoverRadius: 5
      },
      {
        label: 'Monsoon Jun-Sep (mm)',
        data: subData.time_series.monsoon,
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5
      },
      {
        label: '5-Yr Rolling Monsoon Mean (mm)',
        data: subData.time_series.rolling_5yr_monsoon,
        borderColor: '#f59e0b',
        borderDash: [4, 4],
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#38bdf8',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: { color: '#64748b', maxTicksLimit: 12 }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: { color: '#64748b' },
        title: { display: true, text: 'Precipitation (mm)', color: '#64748b', font: { size: 11 } }
      }
    }
  };

  // Chart 2: Monthly Precipitation Profile
  const monthsList = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthlyValues = monthsList.map(m => subData.monthly_means[m] || 0);

  const barChartData = {
    labels: monthsList,
    datasets: [
      {
        label: 'Mean Monthly Rainfall (mm)',
        data: monthlyValues,
        backgroundColor: monthsList.map(m =>
          ['JUN', 'JUL', 'AUG', 'SEP'].includes(m) ? 'rgba(14, 165, 233, 0.85)' : 'rgba(51, 65, 85, 0.7)'
        ),
        borderColor: monthsList.map(m =>
          ['JUN', 'JUL', 'AUG', 'SEP'].includes(m) ? '#0ea5e9' : '#475569'
        ),
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.25)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  return (
    <section id="explorer" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800">
        {/* Header & Subdivision Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>36 Meteorological Subdivisions</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Regional Climate & Historical Explorer
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select any meteorological region of India to inspect continuous 115-year rainfall trajectories, extreme years, and monthly profiles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <select
                value={currentSub}
                onChange={handleSubChange}
                className="w-full sm:w-72 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              >
                {Object.entries(subdivisionsByZone).map(([zone, subs]) => (
                  <optgroup key={zone} label={zone} className="bg-slate-900 text-slate-300 font-semibold">
                    {subs.map(s => (
                      <option key={s} value={s} className="bg-slate-950 text-white font-normal">
                        {s}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              onClick={() => onSendToPredictor && onSendToPredictor(currentSub)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Predict for {currentSub.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Detailed Regional Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-6">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Climate Zone</span>
            <div className="text-xs sm:text-sm font-bold text-cyan-300 truncate mt-1">
              {subData.climate_zone}
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Annual LPA (Mean)</span>
            <div className="text-base sm:text-lg font-extrabold text-white mt-1">
              {subData.mean_annual} <span className="text-[10px] text-slate-400 font-normal">mm</span>
            </div>
            <span className="text-[10px] text-slate-500">σ = ±{subData.std_annual} mm</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Monsoon Volume</span>
            <div className="text-base sm:text-lg font-extrabold text-blue-400 mt-1">
              {subData.mean_monsoon} <span className="text-[10px] text-slate-400 font-normal">mm</span>
            </div>
            <span className="text-[10px] text-slate-400">{subData.monsoon_share_pct}% of annual</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Volatility (CV)</span>
            <div className="text-base sm:text-lg font-extrabold text-amber-400 mt-1">
              {subData.cv_annual_pct}%
            </div>
            <span className="text-[10px] text-slate-500">{subData.cv_annual_pct > 25 ? 'High Variability' : 'Stable Regimes'}</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Record Wettest Year</span>
            <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1">
              {subData.wettest_year.year}
            </div>
            <span className="text-[10px] text-slate-400">{subData.wettest_year.annual} mm</span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Record Driest Year</span>
            <div className="text-base sm:text-lg font-extrabold text-rose-400 mt-1">
              {subData.driest_year.year}
            </div>
            <span className="text-[10px] text-slate-400">{subData.driest_year.annual} mm</span>
          </div>
        </div>

        {/* Dual Visual Analytics Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* 115-Year Timeline (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900/60 p-5 rounded-2xl border border-slate-800/90">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>115-Year Rainfall Trajectory (1901 – 2015)</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Annual total, Southwest Monsoon, and 5-year rolling climate signal
                </p>
              </div>
              <div className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                Shift: <strong className={subData.trend_shift_pct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {subData.trend_shift_pct > 0 ? `+${subData.trend_shift_pct}` : subData.trend_shift_pct}%
                </strong> (1996-2015 vs 1901-1970)
              </div>
            </div>
            <div className="h-72 w-full">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          </div>

          {/* Monthly Climatology Bar Chart (1 Col) */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/90">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <span>Monthly Seasonality Profile</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                115-year mean precipitation per calendar month
              </p>
            </div>
            <div className="h-72 w-full">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
