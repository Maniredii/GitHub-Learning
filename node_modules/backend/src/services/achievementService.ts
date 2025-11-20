import knex from '../database/db';
import { Achievement } from '../models/Achievement';

export interface AchievementCheckResult {
  newAchievements: Achievement[];
  message?: string;
}

export interface AchievementAction {
  type: 'commit' | 'merge' | 'conflict_resolution' | 'pull_request' | 'rebase';
  userId: string;
  context?: Record<string, any>;
}

/**
 * Achievement Service
 * Handles checking and awarding achievements to users
 */
class AchievementService {
  /**
   * Check if user should be awarded any achievements based on their action
   */
  async checkAchievements(action: AchievementAction): Promise<AchievementCheckResult> {
    const { type, userId } = action;
    const newAchievements: Achievement[] = [];

    // Map action types to achievement names
    const achievementMap: Record<string, string> = {
      commit: 'First Blood',
      merge: 'Branch Master',
      conflict_resolution: 'Conflict Resolver',
      pull_request: 'Collaborator',
      rebase: 'Time Lord',
    };

    const achievementName = achievementMap[type];
    if (!achievementName) {
      return { newAchievements };
    }

    // Check if user already has this achievement
    const hasAchievement = await this.userHasAchievement(userId, achievementName);
    if (hasAchievement) {
      return { newAchievements };
    }

    // Award the achievement
    const achievement = await this.awardAchievement(userId, achievementName);
    if (achievement) {
      newAchievements.push(achievement);
    }

    return {
      newAchievements,
      message:
        newAchievements.length > 0
          ? `Congratulations! You've earned the "${achievementName}" achievement!`
          : undefined,
    };
  }

  /**
   * Check if user already has a specific achievement
   */
  private async userHasAchievement(userId: string, achievementName: string): Promise<boolean> {
    const result = await knex('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where({
        'user_achievements.user_id': userId,
        'achievements.name': achievementName,
      })
      .first();

    return !!result;
  }

  /**
   * Award an achievement to a user
   */
  private async awardAchievement(
    userId: string,
    achievementName: string
  ): Promise<Achievement | null> {
    try {
      // Get the achievement
      const achievement = await knex('achievements').where({ name: achievementName }).first();

      if (!achievement) {
        console.error(`Achievement not found: ${achievementName}`);
        return null;
      }

      // Award it to the user (ignore if already exists due to unique constraint)
      await knex('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
        })
        .onConflict(['user_id', 'achievement_id'])
        .ignore();

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        badge_icon: achievement.badge_icon,
        created_at: achievement.created_at,
      };
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  /**
   * Get all achievements earned by a user
   */
  async getUserAchievements(userId: string): Promise<Array<Achievement & { earnedAt: Date }>> {
    const results = await knex('user_achievements')
      .join('achievements', 'user_achievements.achievement_id', 'achievements.id')
      .where({ 'user_achievements.user_id': userId })
      .select(
        'achievements.id',
        'achievements.name',
        'achievements.description',
        'achievements.badge_icon',
        'achievements.created_at',
        'user_achievements.earned_at'
      )
      .orderBy('user_achievements.earned_at', 'desc');

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      badge_icon: row.badge_icon,
      created_at: row.created_at,
      earnedAt: row.earned_at,
    }));
  }

  /**
   * Get all available achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const results = await knex('achievements')
      .select('id', 'name', 'description', 'badge_icon', 'created_at')
      .orderBy('name');

    return results;
  }
}

export default new AchievementService();
