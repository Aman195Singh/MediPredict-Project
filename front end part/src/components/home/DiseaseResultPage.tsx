import { useState, useRef } from 'react';
import { ArrowLeft, X, ChevronDown, ChevronUp, AlertTriangle, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RiskDoughnut } from '@/components/charts/RiskDoughnut';
import { FeatureBarChart } from '@/components/charts/FeatureBarChart';
import type { PredictionResult } from '@/lib/predictions';
import { diseaseNames, diseaseKeys, diseaseIcons } from '@/lib/diseaseFields';

interface DiseaseResultPageProps {
  result: PredictionResult;
  allResults?: PredictionResult[];
  onBack: () => void;
  onClose: () => void;
  onSwitchDisease: (result: PredictionResult) => void;
  mode: 'all' | 'specific';
  onPredictOther?: (diseaseKey: string) => void;
}

const DiseaseResultPage = ({ result, allResults, onBack, onClose, onSwitchDisease, mode, onPredictOther }: DiseaseResultPageProps) => {
  const [showAllParams, setShowAllParams] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${result.disease.replace(/\\s+/g, '_')}_Risk_Report.pdf`);
    } catch (err) {
      console.error("Failed to export PDF", err);
    } finally {
      setIsExporting(false);
    }
  };

  const paramEntries = Object.entries(result.inputParams).filter(([_, v]) => v !== '' && v !== undefined);

  return (
    <div className="flex flex-1 h-full overflow-hidden animate-fade-in">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-card/95 backdrop-blur border-b border-border">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-foreground">{result.disease} — Risk Analysis</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={exportPDF} 
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div ref={contentRef} className="p-6 space-y-8 max-w-4xl mx-auto bg-background">
          {/* Visualization Section */}
          <section className="grid md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center">
              <RiskDoughnut percentage={result.riskPercentage} size={280} />
              <p className="text-sm text-muted-foreground mt-3">{new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Contributing Factors</h3>
              <FeatureBarChart features={result.featureImportances} showAll={showAllParams} />
              <button
                onClick={() => setShowAllParams(!showAllParams)}
                className="flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
              >
                {showAllParams ? <><ChevronUp className="h-4 w-4" /> Show Top 5</> : <><ChevronDown className="h-4 w-4" /> Show All Parameters</>}
              </button>
            </div>
          </section>

          {/* Parameters Used */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Parameters Used for Prediction</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paramEntries.map(([key, val]) => (
                <div key={key} className="flex justify-between rounded-lg bg-background px-3 py-2">
                  <span className="text-sm text-muted-foreground">{key.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-foreground">{String(val)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Factor Analysis */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Why This Result? (Risk Factor Analysis)</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">{result.explanation}</p>
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">Top factors driving your {result.disease.toLowerCase()} risk:</p>
              {result.featureImportances.slice(0, 5).map(f => (
                <p key={f.feature} className="flex items-center gap-2 mb-1">
                  <span className={f.impact > 0 ? 'text-danger' : 'text-success'}>{f.impact > 0 ? '↑' : '↓'}</span>
                  <span>{f.displayName}: {f.impact > 0 ? 'increases' : 'lowers'} risk ({Math.round(Math.abs(f.impact) * 100)}%)</span>
                </p>
              ))}
            </div>
          </section>

          {/* Health Suggestions */}
          <section className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Personalised Health Suggestions</h3>
            <ol className="space-y-3">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span>
                  <span className="text-muted-foreground leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-warning/10 p-3">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">These suggestions are based on your parameters and do not replace professional medical advice. Please consult a licensed physician.</p>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center py-6 border-t border-border">
            <p className="text-xs text-muted-foreground">MediPredict — Your data is processed securely and never shared with third parties.</p>
          </footer>
        </div>
      </div>

      {/* Right Sidebar - fixed */}
      <div className="hidden lg:flex flex-col w-56 border-l border-border bg-card p-4 overflow-y-auto">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">Other Predictions</h4>
        <div className="space-y-2">
          {diseaseKeys.map((key, i) => {
            const existing = allResults?.find(r => r.disease === diseaseNames[i]);
            const isActive = result.disease === diseaseNames[i];
            return (
              <button
                key={key}
                onClick={() => {
                  if (existing) onSwitchDisease(existing);
                  else if (onPredictOther) onPredictOther(key);
                }}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
                }`}
              >
                <img src={diseaseIcons[key]} alt={diseaseNames[i]} className="w-5 h-5 object-contain" />
                <span className="flex-1 text-left">{diseaseNames[i]}</span>
                {existing && (
                  <span className={`text-xs font-bold ${
                    existing.riskPercentage >= 60 ? 'text-danger' : existing.riskPercentage >= 30 ? 'text-warning' : 'text-success'
                  }`}>
                    {existing.riskPercentage}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DiseaseResultPage;
