import { RepositoryState } from '../../../shared/src/types';
import { ValidationCriteria } from './Quest';

export interface BossBattle {
  id: string;
  chapter_id: string;
  name: string;
  description: string;
  narrative: string;
  initial_state: RepositoryState;
  victory_conditions: ValidationCriteria[];
  bonus_xp: number;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBossBattleInput {
  chapter_id: string;
  name: string;
  description: string;
  narrative: string;
  initial_state: RepositoryState;
  victory_conditions: ValidationCriteria[];
  bonus_xp: number;
  order: number;
}

export interface UpdateBossBattleInput {
  chapter_id?: string;
  name?: string;
  description?: string;
  narrative?: string;
  initial_state?: RepositoryState;
  victory_conditions?: ValidationCriteria[];
  bonus_xp?: number;
  order?: number;
}
