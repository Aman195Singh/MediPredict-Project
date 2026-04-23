import { Activity, Layers } from 'lucide-react';

interface WelcomeStateProps {
  onSelectMode: (mode: 'all' | 'specific') => void;
}

const WelcomeState = ({ onSelectMode }: WelcomeStateProps) => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="max-w-2xl w-full text-center animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
        <Activity className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-3">Welcome to MediPredict</h1>
      <p className="text-muted-foreground mb-10 max-w-md mx-auto">
        Select a prediction mode to get started. Fill out your medical parameters and receive ML-powered risk analysis.
      </p>
      <div className="grid sm:grid-cols-2 gap-5 max-w-lg mx-auto">
        <button
          onClick={() => onSelectMode('all')}
          className="group rounded-xl border-2 border-border bg-card p-6 text-left hover:border-primary hover:shadow-lg transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Layers className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Predict All Diseases</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive analysis for Diabetes, Heart, Kidney & Liver disease at once.
          </p>
        </button>
        <button
          onClick={() => onSelectMode('specific')}
          className="group rounded-xl border-2 border-border bg-card p-6 text-left hover:border-primary hover:shadow-lg transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Predict Specific Disease</h3>
          <p className="text-sm text-muted-foreground">
            Choose one disease and fill only the relevant parameters.
          </p>
        </button>
      </div>
    </div>
  </div>
);

export default WelcomeState;
