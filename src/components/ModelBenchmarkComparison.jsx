import React from 'react';
import { Award, CheckCircle2, AlertCircle, BarChart3, Layers, GitCompare, HelpCircle } from 'lucide-react';
import { MODEL_METRICS, FEATURE_IMPORTANCE } from '../data/climateData';

export default function ModelBenchmarkComparison() {
  const benchmarks = MODEL_METRICS.regression_benchmarks;
  const classification = MODEL_METRICS.classification_benchmark;
  const groupedFactors = FEATURE_IMPORTANCE.grouped_factors;

  return (
    <section id="benchmarks" className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-slate-800">
        <div className="mb-6">
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 text-xs font-semibold mb-2">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Strict ML Best Practices</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Model Evaluation & Benchmark Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Trained with strict chronological featurization ordering (1901–1995 Train vs. 1996–2015 Out-of-Time Test). No future data leakage.
          </p>
        </div>

        {/* Regression Models Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 mb-8">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Algorithm / Model</th>
                <th className="py-3 px-3 text-right">Test R²</th>
                <th className="py-3 px-3 text-right">Test RMSE</th>
                <th className="py-3 px-3 text-right">Test MAE</th>
                <th className="py-3 px-3 text-right">MAPE (%)</th>
                <th className="py-3 px-3 text-right">5-Fold CV R²</th>
                <th className="py-3 px-3 text-right">Train R²</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {benchmarks.map((row) => (
                <tr
                  key={row.model_name}
                  className={`hover:bg-slate-800/40 transition ${
                    row.is_best ? 'bg-cyan-950/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-semibold text-white flex items-center space-x-2">
                    {row.is_best && <Award className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />}
                    <span>{row.model_name}</span>
                  </td>
                  <td className={`py-3 px-3 text-right font-bold ${
                    row.test_r2 > 0.9 ? 'text-emerald-400' : (row.test_r2 < 0 ? 'text-rose-400' : 'text-slate-200')
                  }`}>
                    {row.test_r2.toFixed(4)}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-200">{row.test_rmse_mm} mm</td>
                  <td className="py-3 px-3 text-right text-slate-200">{row.test_mae_mm} mm</td>
                  <td className="py-3 px-3 text-right text-slate-300">{row.test_mape_pct}%</td>
                  <td className="py-3 px-3 text-right text-slate-400">{row.cv_r2_mean.toFixed(4)} ± {row.cv_r2_std.toFixed(4)}</td>
                  <td className="py-3 px-3 text-right text-slate-400">{row.train_r2.toFixed(4)}</td>
                  <td className="py-3 px-4 text-center font-sans">
                    {row.is_best ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Top Performer
                      </span>
                    ) : row.test_r2 < 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Naive Baseline
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        Evaluated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grid: Feature Importance (Left) & Risk Confusion Matrix (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Feature Importance Factors (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Feature Importance & Driving Meteorological Factors</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-4">
              Determined via Gini importance and variance decomposition from Random Forest regressor ensembles.
            </p>

            <div className="space-y-3">
              {groupedFactors.map((item) => (
                <div key={item.factor}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">{item.factor}</span>
                    <span className="text-cyan-400 font-mono font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(2, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Interpretation:</strong> The 3-year rolling mean accounts for 95.5% of variance because rainfall has persistent multidecadal oscillations (Indian Ocean Dipole and Pacific Decadal Oscillation). Convective pre-monsoon rains (Mar-May) provide crucial marginal adjustments.
              </span>
            </div>
          </div>

          {/* 3-Class Monsoon Risk Classification (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-1">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Monsoon Risk Classifier (Deficit / Normal / Excess)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-4">
                Random Forest 3-class classifier evaluated on 720 test season observations.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Test Accuracy</span>
                  <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                    {(classification.accuracy * 100).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-500">vs 33.3% random baseline</span>
                </div>
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Macro F1 Score</span>
                  <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                    {classification.macro_f1.toFixed(3)}
                  </div>
                  <span className="text-[10px] text-slate-500">Balanced class weight</span>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              <div className="text-[11px]">
                <span className="text-slate-400 font-semibold block mb-2">Confusion Matrix (Predicted vs Actual):</span>
                <div className="grid grid-cols-4 gap-1 text-center font-mono">
                  <div className="text-[10px] text-slate-500 py-1">Act \ Pred</div>
                  <div className="text-[10px] text-cyan-400 py-1">Deficit</div>
                  <div className="text-[10px] text-cyan-400 py-1">Normal</div>
                  <div className="text-[10px] text-cyan-400 py-1">Excess</div>

                  <div className="text-[10px] text-cyan-400 py-1 text-left">Deficit</div>
                  <div className="bg-emerald-950/50 text-emerald-300 p-1.5 rounded border border-emerald-800/40 font-bold">{classification.confusion_matrix[0][0]}</div>
                  <div className="bg-slate-950 text-slate-400 p-1.5 rounded">{classification.confusion_matrix[0][1]}</div>
                  <div className="bg-slate-950 text-slate-500 p-1.5 rounded">{classification.confusion_matrix[0][2]}</div>

                  <div className="text-[10px] text-cyan-400 py-1 text-left">Normal</div>
                  <div className="bg-slate-950 text-slate-400 p-1.5 rounded">{classification.confusion_matrix[1][0]}</div>
                  <div className="bg-emerald-950/50 text-emerald-300 p-1.5 rounded border border-emerald-800/40 font-bold">{classification.confusion_matrix[1][1]}</div>
                  <div className="bg-slate-950 text-slate-400 p-1.5 rounded">{classification.confusion_matrix[1][2]}</div>

                  <div className="text-[10px] text-cyan-400 py-1 text-left">Excess</div>
                  <div className="bg-slate-950 text-slate-500 p-1.5 rounded">{classification.confusion_matrix[2][0]}</div>
                  <div className="bg-slate-950 text-slate-400 p-1.5 rounded">{classification.confusion_matrix[2][1]}</div>
                  <div className="bg-emerald-950/50 text-emerald-300 p-1.5 rounded border border-emerald-800/40 font-bold">{classification.confusion_matrix[2][2]}</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 mt-4 pt-3 border-t border-slate-800">
              IMD Criteria: Deficit (&lt; -10% departure), Normal (-10% to +10%), Excess (&gt; +10%).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
