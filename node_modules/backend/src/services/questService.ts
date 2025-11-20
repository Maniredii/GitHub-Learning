import db from '../database/db';
import { Quest } from '../models/Quest';
import { Chapter } from '../models/Chapter';

export class QuestService {
  /**
   * Get all quests with optional filtering
   */
  async getAllQuests(filters?: {
    chapterId?: string;
    unlocked?: boolean;
    userId?: string;
  }): Promise<Quest[]> {
    let query = db('quests')
      .select('*')
      .orderBy([{ column: 'chapter_id' }, { column: 'order' }]);

    if (filters?.chapterId) {
      query = query.where('chapter_id', filters.chapterId);
    }

    const quests = await query;

    // If unlocked filter is requested, we need user progress
    if (filters?.unlocked !== undefined && filters?.userId) {
      const userProgress = await db('user_progress').where('user_id', filters.userId).first();

      const completedQuests = await db('quest_completions')
        .where('user_id', filters.userId)
        .pluck('quest_id');

      const chapters = await db('chapters').select('*');
      const chapterMap = new Map(chapters.map((c: Chapter) => [c.id, c]));

      // Filter based on unlock status
      return quests.filter((quest: Quest) => {
        const chapter = chapterMap.get(quest.chapter_id);
        if (!chapter) return false;

        // Check if chapter is unlocked
        const isChapterUnlocked = this.isChapterUnlocked(
          chapter,
          userProgress,
          completedQuests,
          chapters
        );

        if (filters.unlocked) {
          return isChapterUnlocked;
        } else {
          return !isChapterUnlocked;
        }
      });
    }

    return quests;
  }

  /**
   * Get a specific quest by ID
   */
  async getQuestById(questId: string): Promise<Quest | null> {
    const quest = await db('quests').where('id', questId).first();
    return quest || null;
  }

  /**
   * Get all chapters
   */
  async getAllChapters(): Promise<Chapter[]> {
    return db('chapters').select('*').orderBy('order');
  }

  /**
   * Get a specific chapter by ID
   */
  async getChapterById(chapterId: string): Promise<Chapter | null> {
    const chapter = await db('chapters').where('id', chapterId).first();
    return chapter || null;
  }

  /**
   * Get all quests for a specific chapter
   */
  async getQuestsByChapterId(chapterId: string): Promise<Quest[]> {
    return db('quests').where('chapter_id', chapterId).orderBy('order');
  }

  /**
   * Check if a chapter is unlocked for a user
   */
  private isChapterUnlocked(
    chapter: Chapter,
    userProgress: any,
    completedQuests: string[],
    allChapters: Chapter[]
  ): boolean {
    // First chapter is always unlocked
    if (chapter.order === 1) {
      return true;
    }

    const unlockReqs = chapter.unlock_requirements;

    // Check minimum level requirement
    if (unlockReqs.minimumLevel && userProgress) {
      if (userProgress.level < unlockReqs.minimumLevel) {
        return false;
      }
    }

    // Check previous chapter requirement
    if (unlockReqs.previousChapter) {
      const previousChapter = allChapters.find((c: Chapter) => c.id === unlockReqs.previousChapter);
      if (previousChapter) {
        // Check if all quests in previous chapter are completed
        const previousChapterQuestIds = completedQuests.filter((qId: string) => {
          // This is a simplified check - in production, you'd query the quests table
          return true; // Placeholder
        });

        // For now, just check if previous chapter exists
        return true; // Simplified - should check if previous chapter is completed
      }
    }

    return true;
  }

  /**
   * Get quest with lock status for a specific user
   */
  async getQuestsWithLockStatus(userId: string): Promise<Array<Quest & { isLocked: boolean }>> {
    const quests = await this.getAllQuests();
    const userProgress = await db('user_progress').where('user_id', userId).first();
    const completedQuests = await db('quest_completions')
      .where('user_id', userId)
      .pluck('quest_id');
    const chapters = await db('chapters').select('*');
    const chapterMap = new Map(chapters.map((c: Chapter) => [c.id, c]));

    return quests.map((quest: Quest) => {
      const chapter = chapterMap.get(quest.chapter_id);
      const isLocked = chapter
        ? !this.isChapterUnlocked(chapter, userProgress, completedQuests, chapters)
        : true;

      return {
        ...quest,
        isLocked,
      };
    });
  }
}

export default new QuestService();
