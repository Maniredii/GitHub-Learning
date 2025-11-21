const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface UserProfile {
  user: {
    id: string;
    username: string;
    email: string;
  };
  progress: {
    xp: number;
    level: number;
    rank: string;
    currentChapter: string | null;
    currentQuest: string | null;
  };
  statistics: {
    questsCompleted: number;
    chaptersUnlocked: number;
    achievementsEarned: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    badgeIcon: string;
    earnedAt: Date;
  }>;
}

/**
 * Get user profile with progress and achievements
 */
export async function getUserProfile(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to fetch user profile');
  }

  return response.json();
}
