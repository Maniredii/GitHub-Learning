export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_at: Date;
  xp_earned: number;
}

export interface CreateQuestCompletionInput {
  user_id: string;
  quest_id: string;
  xp_earned: number;
}
