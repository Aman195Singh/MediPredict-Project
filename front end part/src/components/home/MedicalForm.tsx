import { useState, useMemo } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { diseaseFieldsMap, allDiseaseFields, diseaseKeys, diseaseNames, diseaseIcons, type FormField } from '@/lib/diseaseFields';

interface MedicalFormProps {
  mode: 'all' | 'specific';
  onSubmit: (params: Record<string, any>, mode: 'all' | 'specific', disease?: string) => void;
  onBack: () => void;
}

const DiseaseSelector = ({ onSelect }: { onSelect: (key: string) => void }) => (
  <div className="max-w-2xl mx-auto animate-fade-in-up">
    <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Select a Disease</h2>
    <p className="text-muted-foreground text-center mb-8">Choose which disease you want to predict</p>
    <div className="grid grid-cols-2 gap-4">
      {diseaseKeys.map((key, i) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className="group rounded-xl border-2 border-border bg-card p-6 text-center hover:border-primary hover:shadow-lg transition-all duration-200"
        >
          <img src={diseaseIcons[key]} alt={diseaseNames[i]} className="w-12 h-12 object-contain mb-3" />
          <h3 className="font-semibold text-foreground">{diseaseNames[i]}</h3>
        </button>
      ))}
    </div>
  </div>
);

const FormFieldInput = ({ field, value, onChange }: { field: FormField; value: string; onChange: (v: string) => void }) => (
  <div>
    <div className="flex items-center gap-1.5 mb-1.5">
      <Label htmlFor={field.name} className="text-sm font-medium">{field.label}</Label>
      {field.tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent><p className="max-w-xs text-xs">{field.tooltip}</p></TooltipContent>
        </Tooltip>
      )}
    </div>
    {field.type === 'number' ? (
      <Input
        id={field.name}
        type="number"
        min={field.min}
        max={field.max}
        step={field.step || 1}
        placeholder={field.placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-11"
        required
      />
    ) : (
      <select
        id={field.name}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        required
      >
        <option value="">Select...</option>
        {field.options?.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    )}
  </div>
);

const MedicalForm = ({ mode, onSubmit, onBack }: MedicalFormProps) => {
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const fields = useMemo(() => {
    if (mode === 'all') return allDiseaseFields;
    if (selectedDisease) return diseaseFieldsMap[selectedDisease] || [];
    return [];
  }, [mode, selectedDisease]);

  const sections = useMemo(() => {
    const map = new Map<string, FormField[]>();
    fields.forEach(f => {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    });
    return map;
  }, [fields]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, mode, selectedDisease || undefined);
  };

  if (mode === 'specific' && !selectedDisease) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <DiseaseSelector onSelect={setSelectedDisease} />
      </div>
    );
  }

  const diseaseLabel = mode === 'all' ? 'All Diseases' : diseaseNames[diseaseKeys.indexOf(selectedDisease as any)];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {mode === 'all' ? 'Comprehensive Medical Form' : `${diseaseLabel} Assessment`}
        </h2>
        <p className="text-muted-foreground mb-6">Fill in the medical parameters below for prediction.</p>
        <form onSubmit={handleSubmit}>
          {Array.from(sections.entries()).map(([section, sectionFields]) => (
            <div key={section} className="mb-8">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 border-b border-border pb-2">{section}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {sectionFields.map(f => (
                  <FormFieldInput key={f.name} field={f} value={formData[f.name] || ''} onChange={v => handleChange(f.name, v)} />
                ))}
              </div>
            </div>
          ))}
          <Button type="submit" size="lg" className="w-full mt-4 h-12 text-base">
            {mode === 'all' ? 'Predict All Diseases' : `Predict ${diseaseLabel}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MedicalForm;
