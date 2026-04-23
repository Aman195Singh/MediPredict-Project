import { RiskDoughnut } from '@/components/charts/RiskDoughnut';
import type { PredictionResult } from '@/lib/predictions';
import { diseaseIcons, diseaseKeys, diseaseNames } from '@/lib/diseaseFields';

interface TileResultViewProps {
  results: PredictionResult[];
  onSelectDisease: (result: PredictionResult) => void;
}

const TileResultView = ({ results, onSelectDisease }: TileResultViewProps) => (
  <div className="flex-1 p-8 overflow-y-auto">
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Prediction Results</h2>
          <p className="text-muted-foreground text-sm mt-1">Click any tile for detailed analysis</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {results.map((r, i) => {
          const key = diseaseKeys[i] || 'diabetes';
          return (
            <button
              key={r.disease}
              onClick={() => onSelectDisease(r)}
              className="group rounded-xl border-2 border-border bg-card p-6 hover:border-primary hover:shadow-xl transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <img src={diseaseIcons[key]} alt={diseaseNames[i]} className="w-8 h-8 object-contain" />
                <h3 className="text-lg font-bold text-foreground">{r.disease}</h3>
              </div>
              <RiskDoughnut percentage={r.riskPercentage} size={160} />
            </button>
          );
        })}
      </div>
    </div>
  </div>
);

export default TileResultView;
