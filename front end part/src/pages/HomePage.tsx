import { useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp, type Submission } from '@/context/AppContext';
import { predictAPI } from '@/api/predict';
import { historyAPI } from '@/api/history';
import type { PredictionResult } from '@/lib/predictions';
import { diseaseNames, diseaseKeys } from '@/lib/diseaseFields';
import Sidebar from '@/components/home/Sidebar';
import WelcomeState from '@/components/home/WelcomeState';
import MedicalForm from '@/components/home/MedicalForm';
import TileResultView from '@/components/home/TileResultView';
import DiseaseResultPage from '@/components/home/DiseaseResultPage';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ViewState = 'welcome' | 'form' | 'loading' | 'tiles' | 'disease-detail';

const mapBackendResultToFrontend = (r: any): PredictionResult => {
  const risk = r.risk_percentage ?? r.riskPercentage;
  return {
    disease: r.disease_name || r.disease,
    riskPercentage: risk,
    riskLevel: risk >= 60 ? 'high' : risk >= 30 ? 'moderate' : 'low',
    inputParams: r.input_parameters || r.inputParams || {},
    featureImportances: (r.feature_importances || r.features || r.featureImportances || []).map((f: any) => ({
      feature: f.feature,
      impact: f.shap_value ?? f.impact,
      displayName: f.display_name || f.displayName,
      value: f.value || 0,
    })),
    explanation: r.explanation || '',
    suggestions: r.suggestions || r.ai_suggestions || [],
  };
};

const HomePage = () => {
  const { isAuthenticated, isLoading, addSubmission } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [view, setView] = useState<ViewState>('welcome');
  const [mode, setMode] = useState<'all' | 'specific'>('all');
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  const handleSelectMode = useCallback((m: 'all' | 'specific') => {
    setMode(m);
    setView('form');
  }, []);

  const handleNewPrediction = useCallback(() => {
    setView('welcome');
    setResults([]);
    setSelectedResult(null);
    setActiveSubmission(null);
    setMobileMenuOpen(false);
  }, []);

  const handleFormSubmit = useCallback(async (params: Record<string, any>, m: 'all' | 'specific', disease?: string) => {
    setView('loading');
    try {
      let response;
      if (m === 'all') {
        response = await predictAPI.predictAll(params);
      } else {
        response = await predictAPI.predictDisease(disease || 'diabetes', params);
      }
      
      const predResults = response.results.map(mapBackendResultToFrontend);
      setResults(predResults);

      const sub: Submission = {
        id: response.submission_id.toString(),
        title: response.title,
        mode: response.mode,
        disease: disease,
        date: new Date(response.created_at),
        diseases: predResults.map((r: any) => r.disease),
        risk_percentages: predResults.reduce((acc: any, r: any) => {
          if (r.disease) {
            acc[r.disease.toLowerCase().replace(' disease', '')] = r.riskPercentage;
          }
          return acc;
        }, {})
      };
      
      addSubmission(sub);
      setActiveSubmission(sub);

      if (m === 'specific') {
        setSelectedResult(predResults[0]);
        setView('disease-detail');
      } else {
        setView('tiles');
      }
    } catch (error: any) {
      console.error("Prediction failed:", error);
      toast.error(error.message || "Failed to generate prediction. Please try again.");
      setView('welcome');
    }
  }, [addSubmission]);

  const handleSelectSubmission = useCallback(async (sub: Submission) => {
    setView('loading');
    setActiveSubmission(sub);
    setMode(sub.mode);
    setMobileMenuOpen(false);
    try {
      const response = await historyAPI.getById(parseInt(sub.id));
      const fetchedResults = response.results.map(mapBackendResultToFrontend);
      setResults(fetchedResults);
      
      if (sub.mode === 'specific' || fetchedResults.length === 1) {
        setSelectedResult(fetchedResults[0]);
        setView('disease-detail');
      } else {
        setView('tiles');
      }
    } catch (error: any) {
      console.error("Failed to fetch submission details:", error);
      toast.error("Failed to load historical data.");
      setView('welcome');
    }
  }, []);

  const handlePredictOther = useCallback((_diseaseKey: string) => {
    setMode('specific');
    setView('form');
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const renderMain = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeState onSelectMode={handleSelectMode} />;
      case 'form':
        return <MedicalForm mode={mode} onSubmit={handleFormSubmit} onBack={() => setView('welcome')} />;
      case 'loading':
        return (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium text-foreground">Analysing your medical data...</p>
            <p className="text-sm text-muted-foreground">Running ML models and generating insights</p>
          </div>
        );
      case 'tiles':
        return <TileResultView results={results} onSelectDisease={r => { setSelectedResult(r); setView('disease-detail'); }} />;
      case 'disease-detail':
        return selectedResult ? (
          <DiseaseResultPage
            result={selectedResult}
            allResults={results}
            onBack={() => results.length > 1 ? setView('tiles') : setView('welcome')}
            onClose={handleNewPrediction}
            onSwitchDisease={r => setSelectedResult(r)}
            mode={mode}
            onPredictOther={handlePredictOther}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <div className="md:hidden absolute top-0 left-0 w-full h-14 bg-card border-b border-border z-30 flex items-center px-4">
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-foreground">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <span className="font-bold ml-2 text-primary">MediPredict</span>
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewPrediction={handleNewPrediction}
        onSelectSubmission={handleSelectSubmission}
        activeSubmissionId={activeSubmission?.id}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex flex-1 flex-col overflow-hidden md:mt-0 mt-14">
        {renderMain()}
      </main>
    </div>
  );
};

export default HomePage;
