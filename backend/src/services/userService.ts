import knex from '../database/db';
import achievementService from './achievementService';

interface UserProfile {
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
 * User Service
 * Handles user profile and related operations
 */
export class UserService {
  /**
   * Get rank name based on level
   */
  private static getRankForLevel(level: number): string {
    if (level >= 50) return 'Master Chrono-Coder';
    if (level >= 40) return 'Legendary Archivist';
    if (level >= 30) return 'Expert Time Weaver';
    if (level >= 20) return 'Advanced Historian';
    if (level >= 10) return 'Skilled Chronicler';
    if (level >= 5) return 'Journeyman Archivist';
    return 'Apprentice Coder';
  }

  /**
   * Get complete user profile with progress and achievements
   */
  static async getUserProfile(userId: string): Promise<UserProfile> {
    // Get user basic info
    const user = await knex('users')
      .where({ id: userId })
      .select('id', 'username', 'email')
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Get user progress
    const progress = await knex('user_progress')
      .where({ user_id: userId })
      .select('xp', 'level', 'current_chapter', 'current_quest')
      .first();

    if (!progress) {
      throw new Error('User progress not found');
    }

    // Get quests completed count
    const questsCompletedResult = await knex('quest_completions')
      .where({ user_id: userId })
      .count('* as count')
      .first();

    const questsCompleted = Number(questsCompletedResult?.count || 0);

    // Get chapters unlocked count (chapters with at least one completed quest)
    const chaptersUnlockedResult = await knex('quest_completions')
      .join('quests', 'quest_completions.quest_id', 'quests.id')
      .where({ 'quest_completions.user_id': userId })
      .countDistinct('quests.chapter_id as count')
      .first();

    const chaptersUnlocked = Number(chaptersUnlockedResult?.count || 0);

    // Get achievements
    const achievements = await achievementService.getUserAchievements(userId);

    // Calculate rank
    const rank = this.getRankForLevel(progress.level);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      progress: {
        xp: progress.xp,
        level: progress.level,
        rank,
        currentChapter: progress.current_chapter,
        currentQuest: progress.current_quest,
      },
      statistics: {
        questsCompleted,
        chaptersUnlocked,
        achievementsEarned: achievements.length,
      },
      achievements: achievements.map((a) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        badgeIcon: a.badge_icon,
        earnedAt: a.earnedAt,
      })),
    };
  }
}
