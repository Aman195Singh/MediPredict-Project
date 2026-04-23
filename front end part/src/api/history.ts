import { apiRequest } from './client';
import type { PredictionResult } from '@/lib/predictions';

export interface HistoryItem {
  id: number;
  mode: 'all' | 'specific';
  title: string;
  created_at: string;
  diseases: string[];
  risk_percentages: Record<string, number>;
}

export interface HistoryDetailResponse {
  id: number;
  mode: 'all' | 'specific';
  title: string;
  created_at: string;
  results: PredictionResult[];
}

export const historyAPI = {
  getAll: () =>
    apiRequest<HistoryItem[]>('/history', {
      method: 'GET',
    }),

  getById: (id: number) =>
    apiRequest<HistoryDetailResponse>(`/history/${id}`, {
      method: 'GET',
    }),

  deleteById: (id: number) =>
    apiRequest<void>(`/history/${id}`, {
      method: 'DELETE',
    }),
};
