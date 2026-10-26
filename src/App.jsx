import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroOverview from './components/HeroOverview';
import KeyMetricsCards from './components/KeyMetricsCards';
import RegionalExplorer from './components/RegionalExplorer';
import PredictiveModelStudio from './components/PredictiveModelStudio';
import ModelBenchmarkComparison from './components/ModelBenchmarkComparison';
import ClimateTrendsAnalytics from './components/ClimateTrendsAnalytics';
import DataProvenanceModal from './components/DataProvenanceModal';
import Footer from './components/Footer';

export default function App() {
  const [selectedSubdivision, setSelectedSubdivision] = useState('KERALA');
  const [isProvenanceOpen, setIsProvenanceOpen] = useState(false);

  const handleSendToPredictor = (sub) => {
    setSelectedSubdivision(sub);
    const predictorElem = document.getElementById('predictor');
    if (predictorElem) {
      predictorElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navigation */}
      <Navbar onOpenProvenance={() => setIsProvenanceOpen(true)} />

      {/* Main Content Sections */}
      <main className="flex-1 space-y-4">
        {/* Hero & High-Level Summary */}
        <HeroOverview
          onExploreSubdivision={() => {
            const el = document.getElementById('explorer');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenPredictor={() => {
            const el = document.getElementById('predictor');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Climatological Baselines & Insights */}
        <KeyMetricsCards />

        {/* Interactive 36 Subdivisions Explorer */}
        <RegionalExplorer
          selectedSubdivision={selectedSubdivision}
          onSelectSubdivision={setSelectedSubdivision}
          onSendToPredictor={handleSendToPredictor}
        />

        {/* Live Machine Learning Prediction Studio */}
        <PredictiveModelStudio initialSubdivision={selectedSubdivision} />

        {/* Multi-Model Benchmark & Confusion Matrix */}
        <ModelBenchmarkComparison />

        {/* 115-Year Decadal Trends & Historic Extremes */}
        <ClimateTrendsAnalytics />
      </main>

      {/* Provenance & Methodology Modal */}
      <DataProvenanceModal
        isOpen={isProvenanceOpen}
        onClose={() => setIsProvenanceOpen(false)}
      />

      {/* Footer */}
      <Footer onOpenProvenance={() => setIsProvenanceOpen(true)} />
    </div>
  );
}
