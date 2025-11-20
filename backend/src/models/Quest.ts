import { RepositoryState } from '../../../shared/src/types';

export interface ValidationCriteria {
  type: 'commit_exists' | 'branch_exists' | 'file_content' | 'merge_completed' | 'custom';
  parameters: Record<string, any>;
}

export interface Quest {
  id: string;
  chapter_id: string;
  title: string;
  narrative: string;
  objective: string;
  hints: string[];
  xp_reward: number;
  order: number;
  validation_criteria: ValidationCriteria;
  initial_repository_state?: RepositoryState;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestInput {
  chapter_id: string;
  title: string;
  narrative: string;
  objective: string;
  hints?: string[];
  xp_reward: number;
  order: number;
  validation_criteria: ValidationCriteria;
  initial_repository_state?: RepositoryState;
}

export interface UpdateQuestInput {
  chapter_id?: string;
  title?: string;
  narrative?: string;
  objective?: string;
  hints?: string[];
  xp_reward?: number;
  order?: number;
  validation_criteria?: ValidationCriteria;
  initial_repository_state?: RepositoryState;
}
