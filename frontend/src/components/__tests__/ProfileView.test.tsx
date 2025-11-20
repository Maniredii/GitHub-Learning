import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileView } from '../ProfileView';
import * as userApi from '../../services/userApi';

vi.mock('../../services/userApi');

describe('ProfileView', () => {
  const mockToken = 'test-token';
  const mockProfile: userApi.UserProfile = {
    user: {
      id: 'user-1',
      username: 'testuser',
      email: 'test@example.com',
    },
    progress: {
      xp: 150,
      level: 2,
      rank: 'Apprentice Coder',
      currentChapter: 'chapter-1',
      currentQuest: 'quest-1',
    },
    statistics: {
      questsCompleted: 5,
      chaptersUnlocked: 2,
      achievementsEarned: 1,
    },
    achievements: [
      {
        id: 'achievement-1',
        name: 'First Blood',
        description: 'Made your first commit',
        badgeIcon: '🎯',
        earnedAt: new Date('2024-01-01'),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(userApi.getUserProfile).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ProfileView token={mockToken} />);

    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('should display user profile after loading', async () => {
    vi.mocked(userApi.getUserProfile).mockResolvedValue(mockProfile);

    render(<ProfileView token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    expect(screen.getByText('Apprentice Coder')).toBeInTheDocument();
    expect(screen.getByText('Level 2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Quests completed
    expect(screen.getByText('2')).toBeInTheDocument(); // Chapters unlocked
    expect(screen.getByText('1')).toBeInTheDocument(); // Achievements earned
  });

  it('should display achievements', async () => {
    vi.mocked(userApi.getUserProfile).mockResolvedValue(mockProfile);

    render(<ProfileView token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('First Blood')).toBeInTheDocument();
    });

    expect(screen.getByText('Made your first commit')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('should display message when no achievements', async () => {
    const profileWithoutAchievements = {
      ...mockProfile,
      achievements: [],
      statistics: {
        ...mockProfile.statistics,
        achievementsEarned: 0,
      },
    };

    vi.mocked(userApi.getUserProfile).mockResolvedValue(profileWithoutAchievements);

    render(<ProfileView token={mockToken} />);

    await waitFor(() => {
      expect(
        screen.getByText('No achievements yet. Complete quests to earn badges!')
      ).toBeInTheDocument();
    });
  });

  it('should display error message on failure', async () => {
    vi.mocked(userApi.getUserProfile).mockRejectedValue(new Error('Network error'));

    render(<ProfileView token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should display XP progress bar', async () => {
    vi.mocked(userApi.getUserProfile).mockResolvedValue(mockProfile);

    render(<ProfileView token={mockToken} />);

    await waitFor(() => {
      expect(screen.getByText('150 / 300 XP')).toBeInTheDocument();
    });
  });
});
