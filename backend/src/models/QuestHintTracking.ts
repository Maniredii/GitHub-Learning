export interface QuestHintTracking {
  id: string;
  user_id: string;
  quest_id: string;
  incorrect_attempts: number;
  hints_shown: number;
  shown_hint_indices: number[];
  last_attempt_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestHintTrackingInput {
  user_id: string;
  quest_id: string;
  incorrect_attempts?: number;
  hints_shown?: number;
  shown_hint_indices?: number[];
}

export interface UpdateQuestHintTrackingInput {
  incorrect_attempts?: number;
  hints_shown?: number;
  shown_hint_indices?: number[];
  last_attempt_at?: Date;
}
