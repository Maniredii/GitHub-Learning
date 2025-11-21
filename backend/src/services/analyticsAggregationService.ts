import db from '../database/db';

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

class AnalyticsAggregationService {
  /**
   * Get quest completion rates
   */
  async getQuestCompletionRates(questIds?: string[]): Promise<QuestCompletionRate[]> {
    let query = db('analytics_events')
      .select('quest_id')
      .count('* as total_attempts')
      .sum(db.raw("CASE WHEN event_type = 'quest_complete' THEN 1 ELSE 0 END as completions"))
      .sum(db.raw("CASE WHEN event_type = 'quest_fail' THEN 1 ELSE 0 END as failures"))
      .whereIn('event_type', ['quest_complete', 'quest_fail'])
      .groupBy('quest_id');

    if (questIds && questIds.length > 0) {
      query = query.whereIn('quest_id', questIds);
    }

    const results = await query;

    return results.map((row: any) => ({
      questId: row.quest_id,
      totalAttempts: parseInt(row.total_attempts),
      completions: parseInt(row.completions),
      failures: parseInt(row.failures),
      completionRate: parseInt(row.total_attempts) > 0
        ? (parseInt(row.completions) / parseInt(row.total_attempts)) * 100
        : 0,
    }));
  }

  /**
   * Get average time spent per quest
   */
  async getQuestAverageTimes(questIds?: string[]): Promise<QuestAverageTime[]> {
    let query = db('quest_sessions')
      .select('quest_id')
      .avg('time_spent_seconds as avg_time')
      .count('* as total_sessions')
      .whereNotNull('time_spent_seconds')
      .groupBy('quest_id');

    if (questIds && questIds.length > 0) {
      query = query.whereIn('quest_id', questIds);
    }

    const results = await query;

    // Get median times separately (PostgreSQL specific)
    const medianResults = await Promise.all(
      results.map(async (row: any) => {
        const median = await db('quest_sessions')
          .select(db.raw('PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_spent_seconds) as median'))
          .where('quest_id', row.quest_id)
          .whereNotNull('time_spent_seconds')
          .first();

        return {
          questId: row.quest_id,
          median: parseFloat(median?.median || '0'),
        };
      })
    );

    return results.map((row: any) => {
      const medianData = medianResults.find(m => m.questId === row.quest_id);
      return {
        questId: row.quest_id,
        averageTimeSeconds: Math.round(parseFloat(row.avg_time || '0')),
        medianTimeSeconds: Math.round(medianData?.median || 0),
        totalSessions: parseInt(row.total_sessions),
      };
    });
  }

  /**
   * Get common error patterns by quest
   */
  async getCommonErrors(questId?: string, limit: number = 10): Promise<CommonError[]> {
    let query = db('analytics_events')
      .select('quest_id')
      .select(db.raw("metadata->>'command' as command"))
      .select(db.raw("metadata->>'error' as error_message"))
      .count('* as occurrences')
      .where('event_type', 'command_execute')
      .where(db.raw("metadata->>'success'"), 'false')
      .whereNotNull(db.raw("metadata->>'error'"))
      .groupBy('quest_id', db.raw("metadata->>'command'"), db.raw("metadata->>'error'"))
      .orderBy('occurrences', 'desc')
      .limit(limit);

    if (questId) {
      query = query.where('quest_id', questId);
    }

    const results = await query;

    return results.map((row: any) => ({
      questId: row.quest_id,
      command: row.command,
      errorMessage: row.error_message,
      occurrences: parseInt(row.occurrences),
    }));
  }

  /**
   * Calculate retention rates
   */
  async getRetentionRates(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ day1: RetentionRate[]; day7: RetentionRate[]; day30: RetentionRate[] }> {
    const day1Retention = await this.calculateRetention(1, startDate, endDate);
    const day7Retention = await this.calculateRetention(7, startDate, endDate);
    const day30Retention = await this.calculateRetention(30, startDate, endDate);

    return {
      day1: day1Retention,
      day7: day7Retention,
      day30: day30Retention,
    };
  }

  /**
   * Calculate retention for a specific period
   */
  private async calculateRetention(
    days: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<RetentionRate[]> {
    // Get cohorts (users who registered on each date)
    let cohortQuery = db('users')
      .select(db.raw('DATE(created_at) as cohort_date'))
      .count('* as total_users')
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('cohort_date', 'desc');

    if (startDate) {
      cohortQuery = cohortQuery.where('created_at', '>=', startDate);
    }
    if (endDate) {
      cohortQuery = cohortQuery.where('created_at', '<=', endDate);
    }

    const cohorts = await cohortQuery;

    // For each cohort, calculate how many returned after N days
    const retentionData = await Promise.all(
      cohorts.map(async (cohort: any) => {
        const cohortDate = new Date(cohort.cohort_date);
        const returnDate = new Date(cohortDate);
        returnDate.setDate(returnDate.getDate() + days);

        // Get users who registered on cohort date
        const cohortUsers = await db('users')
          .select('id')
          .where(db.raw('DATE(created_at)'), cohortDate.toISOString().split('T')[0]);

        const cohortUserIds = cohortUsers.map((u: any) => u.id);

        if (cohortUserIds.length === 0) {
          return {
            cohortDate: cohort.cohort_date,
            totalUsers: 0,
            returnedUsers: 0,
            retentionRate: 0,
          };
        }

        // Count how many of those users had activity on or after the return date
        const returnedUsers = await db('analytics_events')
          .countDistinct('user_id as count')
          .whereIn('user_id', cohortUserIds)
          .where('created_at', '>=', returnDate)
          .first();

        const returned = parseInt(returnedUsers?.count || '0');
        const total = parseInt(cohort.total_users);

        return {
          cohortDate: cohort.cohort_date,
          totalUsers: total,
          returnedUsers: returned,
          retentionRate: total > 0 ? (returned / total) * 100 : 0,
        };
      })
    );

    const period = days === 1 ? '1day' : days === 7 ? '7day' : '30day';

    return retentionData.map(data => ({
      period,
      cohortDate: data.cohortDate,
      totalUsers: data.totalUsers,
      returnedUsers: data.returnedUsers,
      retentionRate: Math.round(data.retentionRate * 100) / 100,
    }));
  }

  /**
   * Get overall analytics summary
   */
  async getAnalyticsSummary(startDate?: Date, endDate?: Date): Promise<any> {
    let dateFilter = db.raw('1=1');
    if (startDate) {
      dateFilter = db.raw('created_at >= ?', [startDate]);
    }
    if (endDate) {
      dateFilter = db.raw('created_at <= ?', [endDate]);
    }

    const [
      totalUsers,
      totalQuestStarts,
      totalQuestCompletions,
      totalCommands,
      totalHintsUsed,
    ] = await Promise.all([
      db('users').count('* as count').first(),
      db('analytics_events')
        .count('* as count')
        .where('event_type', 'quest_start')
        .where(dateFilter)
        .first(),
      db('analytics_events')
        .count('* as count')
        .where('event_type', 'quest_complete')
        .where(dateFilter)
        .first(),
      db('analytics_events')
        .count('* as count')
        .where('event_type', 'command_execute')
        .where(dateFilter)
        .first(),
      db('analytics_events')
        .count('* as count')
        .where('event_type', 'hint_used')
        .where(dateFilter)
        .first(),
    ]);

    return {
      totalUsers: parseInt(totalUsers?.count || '0'),
      totalQuestStarts: parseInt(totalQuestStarts?.count || '0'),
      totalQuestCompletions: parseInt(totalQuestCompletions?.count || '0'),
      totalCommands: parseInt(totalCommands?.count || '0'),
      totalHintsUsed: parseInt(totalHintsUsed?.count || '0'),
      overallCompletionRate:
        parseInt(totalQuestStarts?.count || '0') > 0
          ? (parseInt(totalQuestCompletions?.count || '0') /
              parseInt(totalQuestStarts?.count || '0')) *
            100
          : 0,
    };
  }
}

export default new AnalyticsAggregationService();
