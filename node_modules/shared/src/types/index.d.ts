export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  rank: string;
  currentChapter: string;
  currentQuest: string;
  completedQuests: string[];
  isPremium: boolean;
  premiumExpiresAt?: Date;
}
export interface Quest {
  id: string;
  chapterId: string;
  title: string;
  narrative: string;
  objective: string;
  hints: string[];
  xpReward: number;
  order: number;
  validationCriteria: ValidationCriteria;
  initialRepositoryState?: RepositoryState;
}
export interface ValidationCriteria {
  type: 'commit_exists' | 'branch_exists' | 'file_content' | 'merge_completed' | 'custom';
  parameters: Record<string, any>;
}
export interface Chapter {
  id: string;
  title: string;
  description: string;
  themeRegion: string;
  order: number;
  isPremium: boolean;
  unlockRequirements: {
    previousChapter?: string;
    minimumLevel?: number;
  };
}
export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string;
  triggerCondition: {
    type: 'first_commit' | 'first_merge' | 'resolve_conflict' | 'first_pr' | 'use_rebase';
    parameters?: Record<string, any>;
  };
}
export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedAt: Date;
}
export interface RepositoryState {
  id: string;
  workingDirectory: FileTree;
  stagingArea: FileTree;
  commits: Commit[];
  branches: Branch[];
  head: string;
  remotes: Remote[];
}
export interface FileTree {
  [path: string]: {
    content: string;
    modified: boolean;
  };
}
export interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: Date;
  parent: string | null;
  parents?: string[];
  tree: FileTree;
}
export interface Branch {
  name: string;
  commitHash: string;
}
export interface Remote {
  name: string;
  url: string;
  branches: Branch[];
}
export interface BossBattle {
  id: string;
  name: string;
  description: string;
  narrative: string;
  chapterId: string;
  initialState: RepositoryState;
  victoryConditions: ValidationCriteria[];
  bonusXp: number;
}
//# sourceMappingURL=index.d.ts.map
