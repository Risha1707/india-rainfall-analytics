import React from 'react';
import { CloudRain, Github, ExternalLink, Heart, Shield, Database, Code, Globe } from 'lucide-react';

export default function Footer({ onOpenProvenance }) {
  return (
    <footer id="methodology" className="border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <CloudRain className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white">
                Varsha<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              A full-stack predictive analytics system built on <strong className="text-slate-200">115 years of continuous meteorological observations (1901–2015)</strong> from the India Meteorological Department (IMD), sourced through the Open Government Data (OGD) Platform India (<a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">data.gov.in</a>).
            </p>
            <div className="flex items-center space-x-3 pt-2 text-slate-500 text-[11px]">
              <span>Government Open Data License (GODL)</span>
              <span>•</span>
              <span>Non-fabricated Machine Learning</span>
            </div>
          </div>

          {/* Col 2: Dataset & Governance */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Data & Attribution
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button
                  onClick={onOpenProvenance}
                  className="hover:text-cyan-400 transition"
                >
                  Provenance & Cleaning Log
                </button>
              </li>
              <li>
                <a
                  href="https://data.gov.in/catalog/rainfall-statistics-india"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center space-x-1"
                >
                  <span>data.gov.in Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://mausam.imd.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition inline-flex items-center space-x-1"
                >
                  <span>IMD Official Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Stack & Deployment */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Architecture & Stack
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>Python 3.13 & Scikit-learn 1.8.0</li>
              <li>Pandas 3.0 & NumPy 2.4</li>
              <li>React 18 & Vite & Tailwind CSS</li>
              <li>Chart.js Interactive Visualizations</li>
              <li>Vercel Serverless & Static Deployment</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © 1901–2015 India Meteorological Department Data Records. Built with open-source scientific principles.
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Ready for GitHub & Vercel</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
