import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AnalyticsSummary {
  totalUsers: number;
  totalQuestStarts: number;
  totalQuestCompletions: number;
  totalCommands: number;
  totalHintsUsed: number;
  overallCompletionRate: number;
}

export interface QuestCompletionRate {
  questId: string;
  totalAttempts: number;
  completions: number;
  failures: number;
  completionRate: number;
}

export interface QuestAverageTime {
  questId: string;
  averageTimeSeconds: number;
  medianTimeSeconds: number;
  totalSessions: number;
}

export interface CommonError {
  questId: string;
  command: string;
  errorMessage: string;
  occurrences: number;
}

export interface RetentionRate {
  period: '1day' | '7day' | '30day';
  cohortDate: string;
  totalUsers: number;
  returnedUsers: number;
  retentionRate: number;
}

export interface RetentionData {
  day1: RetentionRate[];
  day7: RetentionRate[];
  day30: RetentionRate[];
}

export const analyticsApi = {
  getSummary: async (startDate?: string, endDate?: string): Promise<AnalyticsSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/analytics/summary?${params.toString()}`);
    return response.data.data;
  },

  getQuestCompletionRates: async (questIds?: string[]): Promise<QuestCompletionRate[]> => {
    const params = new URLSearchParams();
    if (questIds && questIds.length > 0) {
      params.append('questIds', questIds.join(','));
    }

    const response = await api.get(`/analytics/quest-completion-rates?${params.toString()}`);
    return response.data.data;
  },

  getQuestAverageTimes: async (questIds?: string[]): Promise<QuestAverageTime[]> => {
    const params = new URLSearchParams();
    if (questIds && questIds.length > 0) {
      params.append('questIds', questIds.join(','));
    }

    const response = await api.get(`/analytics/quest-average-times?${params.toString()}`);
    return response.data.data;
  },

  getCommonErrors: async (questId?: string, limit?: number): Promise<CommonError[]> => {
    const params = new URLSearchParams();
    if (questId) params.append('questId', questId);
    if (limit) params.append('limit', limit.toString());

    const response = await api.get(`/analytics/common-errors?${params.toString()}`);
    return response.data.data;
  },

  getRetentionRates: async (startDate?: string, endDate?: string): Promise<RetentionData> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/analytics/retention-rates?${params.toString()}`);
    return response.data.data;
  },
};
