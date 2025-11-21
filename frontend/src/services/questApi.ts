import type { Quest, Chapter, RepositoryState } from '../../../shared/src/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface QuestValidationResponse {
  success: boolean;
  feedback: string;
  xpAwarded: number;
  details?: Record<string, any>;
}

export const questApi = {
  async getAllQuests(chapterId?: string, unlocked?: boolean): Promise<Quest[]> {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (chapterId) params.append('chapter', chapterId);
    if (unlocked !== undefined) params.append('unlocked', String(unlocked));

    const response = await fetch(`${API_BASE_URL}/quests?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch quests');
    }

    const result = await response.json();
    return result.data;
  },

  async getQuestById(questId: string): Promise<Quest> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/quests/${questId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch quest');
    }

    const result = await response.json();
    return result.data;
  },

  async validateQuest(
    questId: string,
    repositoryState: RepositoryState
  ): Promise<QuestValidationResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ repositoryState }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to validate quest');
    }

    return response.json();
  },

  async getAllChapters(): Promise<Chapter[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chapters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch chapters');
    }

    const result = await response.json();
    return result.data;
  },

  async getChapterQuests(chapterId: string): Promise<Quest[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}/quests`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch chapter quests');
    }

    const result = await response.json();
    return result.data;
  },

  async getChapterById(chapterId: string): Promise<Chapter> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/chapters/${chapterId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch chapter');
    }

    const result = await response.json();
    return result.data;
  },
};
