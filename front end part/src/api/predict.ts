import { apiRequest } from './client';
import type { PredictionResult } from '@/lib/predictions';

export interface PredictResponse {
  submission_id: number;
  mode: 'all' | 'specific';
  title: string;
  results: PredictionResult[];
  created_at: string;
}

export const predictAPI = {
  predictDisease: (disease: string, params: Record<string, any>) =>
    apiRequest<PredictResponse>('/predict/disease', {
      method: 'POST',
      data: { disease, params },
    }),

  predictAll: (params: Record<string, any>) =>
    apiRequest<PredictResponse>('/predict/all', {
      method: 'POST',
      data: { params },
    }),
};
