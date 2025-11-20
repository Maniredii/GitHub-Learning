export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: Date;
}

export interface CreateUserAchievementInput {
  user_id: string;
  achievement_id: string;
}
