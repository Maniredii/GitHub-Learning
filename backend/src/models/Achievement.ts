export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  created_at: Date;
}

export interface CreateAchievementInput {
  name: string;
  description: string;
  badge_icon: string;
}

export interface UpdateAchievementInput {
  name?: string;
  description?: string;
  badge_icon?: string;
}
