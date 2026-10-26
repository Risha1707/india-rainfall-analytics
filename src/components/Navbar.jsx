import React, { useState } from 'react';
import { CloudRain, ExternalLink, Database, GitBranch, Sparkles, Menu, X, Cpu } from 'lucide-react';

export default function Navbar({ onOpenProvenance }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '#overview' },
    { name: 'Regional Explorer', href: '#explorer' },
    { name: 'Live Predictor', href: '#predictor' },
    { name: 'Model Benchmarks', href: '#benchmarks' },
    { name: 'Decadal Trends', href: '#trends' },
    { name: 'Methodology', href: '#methodology' }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white">
              <CloudRain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  Varsha<span className="text-cyan-400">.AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  data.gov.in Official
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400">
                115-Year IMD Meteorological Predictive Analytics
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={onOpenProvenance}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition shadow-sm"
              title="Inspect OGD Source Attribution & Preprocessing"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dataset Provenance</span>
            </button>
            <a
              href="https://data.gov.in/catalog/rainfall-statistics-india"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 rounded-lg transition shadow-sm"
            >
              <span>OGD Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            <button
              onClick={() => {
                onOpenProvenance();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center space-x-2 w-full py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-lg"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dataset Provenance</span>
            </button>
            <a
              href="https://data.gov.in/catalog/rainfall-statistics-india"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center space-x-2 w-full py-2 text-xs font-medium text-cyan-300 bg-cyan-950 border border-cyan-800 rounded-lg"
            >
              <span>data.gov.in Official Catalog</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
