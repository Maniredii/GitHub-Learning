export interface UserProgress {
  id: string;
  user_id: string;
  xp: number;
  level: number;
  current_chapter: string | null;
  current_quest: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserProgressInput {
  user_id: string;
  xp?: number;
  level?: number;
  current_chapter?: string | null;
  current_quest?: string | null;
}

export interface UpdateUserProgressInput {
  xp?: number;
  level?: number;
  current_chapter?: string | null;
  current_quest?: string | null;
}
