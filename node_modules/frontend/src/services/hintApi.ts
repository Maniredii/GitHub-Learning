const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface HintTracking {
  incorrect_attempts: number;
  hints_shown: number;
  shown_hint_indices: number[];
}

export interface NextHintResponse {
  hint: string | null;
  hintIndex?: number;
  totalHints?: number;
  hintsShown?: number;
  adjustedXp?: number;
  xpPenalty?: number;
  message?: string;
}

export interface IncorrectAttemptResponse {
  incorrect_attempts: number;
  should_offer_hint: boolean;
}

export const hintApi = {
  async getHintTracking(questId: string): Promise<HintTracking> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/hints/${questId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch hint tracking');
    }

    const result = await response.json();
    return result.data;
  },

  async getNextHint(questId: string): Promise<NextHintResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/hints/${questId}/next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get hint');
    }

    const result = await response.json();
    return result.data;
  },

  async recordIncorrectAttempt(questId: string): Promise<IncorrectAttemptResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/hints/${questId}/incorrect-attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to record incorrect attempt');
    }

    const result = await response.json();
    return result.data;
  },
};
