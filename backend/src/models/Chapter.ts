export interface Chapter {
  id: string;
  title: string;
  description: string;
  theme_region: string;
  order: number;
  is_premium: boolean;
  unlock_requirements: {
    previousChapter?: string;
    minimumLevel?: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface CreateChapterInput {
  title: string;
  description: string;
  theme_region: string;
  order: number;
  is_premium?: boolean;
  unlock_requirements?: {
    previousChapter?: string;
    minimumLevel?: number;
  };
}

export interface UpdateChapterInput {
  title?: string;
  description?: string;
  theme_region?: string;
  order?: number;
  is_premium?: boolean;
  unlock_requirements?: {
    previousChapter?: string;
    minimumLevel?: number;
  };
}
