import React from 'react';
import { X, Database, ExternalLink, ShieldCheck, FileText, CheckCircle, Download, BookOpen } from 'lucide-react';
import { DATASET_METADATA } from '../data/climateData';

export default function DataProvenanceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Dataset Provenance & Scientific Methodology
            </h2>
            <p className="text-xs text-slate-400">
              Official Open Government Data (OGD) Platform India (data.gov.in)
            </p>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-300">
          {/* Attribution Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">Dataset Name:</span>
              <span className="text-right text-slate-300 font-medium">
                {DATASET_METADATA.dataset_name}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">Official Source:</span>
              <span className="text-right text-cyan-400 font-medium">
                India Meteorological Department (IMD)
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">Ministry:</span>
              <span className="text-right text-slate-300 font-medium">
                Ministry of Earth Sciences, Government of India
              </span>
            </div>
            <div className="flex justify-between items-start">
              <span className="font-semibold text-white">Portal & License:</span>
              <span className="text-right text-slate-300 font-medium">
                data.gov.in / Government Open Data License (GODL)
              </span>
            </div>
            <div className="pt-2">
              <a
                href={DATASET_METADATA.portal_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                <span>Visit data.gov.in Official Catalog Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Preprocessing Summary */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Preprocessing & Auditing Log</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-800">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Duplicate Auditing:</strong> Evaluated compound key <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">SUBDIVISION + YEAR</code>. 0 duplicate records found.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Missing Value Imputation:</strong> Out of 49,392 month records, only 70 (0.14%) were missing in island/frontier stations. Imputed using <em>subdivision-specific historical monthly medians</em> to preserve regional climatological differences.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mathematical Reconciliation:</strong> Recomputed all seasonal aggregates (<code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Jan-Feb</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Mar-May</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Jun-Sep</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">Oct-Dec</code>, <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">ANNUAL</code>) to eliminate scanning and rounding discrepancies.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict ML Featurization Ordering:</strong> Chronological train/test split (1901–1995 Train, 1996–2015 Test). Standard scalers and one-hot encoders fitted exclusively on training set to guarantee zero data leakage.
                </span>
              </li>
            </ul>
          </div>

          {/* Dataset Schema Dictionary */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Data Dictionary & Features</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">SUBDIVISION</strong>
                <span className="text-slate-400">36 IMD met divisions</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">YEAR</strong>
                <span className="text-slate-400">1901 to 2015 (115 yrs)</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">JAN - DEC</strong>
                <span className="text-slate-400">Monthly rainfall (mm)</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">Jun-Sep</strong>
                <span className="text-slate-400">Monsoon aggregate (mm)</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">ANNUAL</strong>
                <span className="text-slate-400">12-month total (mm)</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-cyan-400 font-sans block">CLIMATE_ZONE</strong>
                <span className="text-slate-400">5 macro regimes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            Close Provenance
          </button>
        </div>
      </div>
    </div>
  );
}
