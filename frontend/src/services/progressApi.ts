import type { UserProgress } from '../../../shared/src/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface ProgressResponse {
  xp: number;
  level: number;
  rank: string;
  currentChapter: string | null;
  currentQuest: string | null;
  completedQuests: string[];
  xpToNextLevel: number | null;
  totalQuestsCompleted: number;
}

export interface CompleteQuestResponse {
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  unlockedQuests: string[];
  xpEarned: number;
  newRank?: string;
}

export const progressApi = {
  async getUserProgress(): Promise<ProgressResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch user progress');
    }

    const result = await response.json();
    return result.data;
  },

  async completeQuest(questId: string): Promise<CompleteQuestResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/progress/complete-quest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ questId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to complete quest');
    }

    const result = await response.json();
    return result.data;
  },
};
