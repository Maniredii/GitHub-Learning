import { Knex } from 'knex';
import { RepositoryState } from '../../../../shared/src/types';

export async function seed(knex: Knex): Promise<void> {
  // Get chapter IDs for reference
  const chapters = await knex('chapters').select('id', 'order');
  const chapter5 = chapters.find((c) => c.order === 5);
  const chapter7 = chapters.find((c) => c.order === 7);

  if (!chapter5 || !chapter7) {
    console.log('Required chapters not found, skipping boss battle seeding');
    return;
  }

  // Delete existing boss battles
  await knex('boss_battles').del();

  // Boss Battle 1: The Corrupted Timeline
  const corruptedTimelineState: RepositoryState = {
    id: 'boss-battle-1-repo',
    workingDirectory: {
      'README.md': {
        content: 'This file has been corrupted!',
        modified: false,
      },
      'app.js': {
        content: 'console.log("Corrupted code");',
        modified: false,
      },
    },
    stagingArea: {},
    commits: [
      {
        hash: 'abc123',
        message: 'Initial commit - The Golden Age',
        author: 'Ancient Developer',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        parent: null,
        tree: {
          'README.md': {
            content: '# The Lost Project\n\nThis is the legendary project.',
            modified: false,
          },
          'app.js': {
            content: 'console.log("Hello, World!");',
            modified: false,
          },
        },
      },
      {
        hash: 'def456',
        message: 'Add feature X',
        author: 'Ancient Developer',
        timestamp: new Date('2024-01-02T10:00:00Z'),
        parent: 'abc123',
        tree: {
          'README.md': {
            content: '# The Lost Project\n\nThis is the legendary project.',
            modified: false,
          },
          'app.js': {
            content: 'console.log("Hello, World!");\nconsole.log("Feature X");',
            modified: false,
          },
        },
      },
      {
        hash: 'ghi789',
        message: 'CORRUPTION: Timeline damaged',
        author: 'Time Anomaly',
        timestamp: new Date('2024-01-03T10:00:00Z'),
        parent: 'def456',
        tree: {
          'README.md': {
            content: 'This file has been corrupted!',
            modified: false,
          },
          'app.js': {
            content: 'console.log("Corrupted code");',
            modified: false,
          },
        },
      },
    ],
    branches: [
      {
        name: 'main',
        commitHash: 'ghi789',
      },
    ],
    head: 'main',
    remotes: [],
  };

  // Boss Battle 2: The Convergence Conflict
  const convergenceConflictState: RepositoryState = {
    id: 'boss-battle-2-repo',
    workingDirectory: {
      'story.txt': {
        content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
The hero set forth...

Chapter 3: The End
And they lived happily ever after.`,
        modified: false,
      },
    },
    stagingArea: {},
    commits: [
      {
        hash: 'aaa111',
        message: 'Initial story',
        author: 'Author A',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        parent: null,
        tree: {
          'story.txt': {
            content: `Chapter 1: The Beginning
Once upon a time...`,
            modified: false,
          },
        },
      },
      {
        hash: 'bbb222',
        message: 'Add Chapter 2 - Version A',
        author: 'Author A',
        timestamp: new Date('2024-01-02T10:00:00Z'),
        parent: 'aaa111',
        tree: {
          'story.txt': {
            content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
The hero set forth on a quest for knowledge...`,
            modified: false,
          },
        },
      },
      {
        hash: 'ccc333',
        message: 'Add Chapter 2 - Version B',
        author: 'Author B',
        timestamp: new Date('2024-01-02T11:00:00Z'),
        parent: 'aaa111',
        tree: {
          'story.txt': {
            content: `Chapter 1: The Beginning
Once upon a time...

Chapter 2: The Journey
The hero embarked on an adventure for glory...`,
            modified: false,
          },
        },
      },
    ],
    branches: [
      {
        name: 'main',
        commitHash: 'bbb222',
      },
      {
        name: 'feature-alternate-story',
        commitHash: 'ccc333',
      },
    ],
    head: 'main',
    remotes: [],
  };

  await knex('boss_battles').insert([
    {
      chapter_id: chapter5.id,
      name: 'The Corrupted Timeline',
      description:
        'A temporal anomaly has corrupted the project timeline. You must use your time-manipulation powers to restore the Golden Age commit.',
      narrative: `The archives tremble as you approach. Ancient commit logs flicker with corruption.
      
"Chrono-Coder," the Archive Guardian speaks, "a temporal anomaly has damaged our timeline. The project was once pristine in the Golden Age, but now corruption spreads through the commits. You must journey back through the git log, find the commit from before the corruption, and restore it using git reset or git checkout. The fate of the Lost Project depends on your mastery of time manipulation!"

Your mission: Find the last good commit before the corruption and restore the repository to that state.`,
      initial_state: JSON.stringify(corruptedTimelineState),
      victory_conditions: JSON.stringify([
        {
          type: 'custom',
          parameters: {
            validator: 'corrupted_timeline',
            description: 'Repository must be restored to commit abc123 or def456',
            requiredCommitHashes: ['abc123', 'def456'],
          },
        },
      ]),
      bonus_xp: 500,
      order: 1,
    },
    {
      chapter_id: chapter7.id,
      name: 'The Convergence Conflict',
      description:
        'Two parallel timelines have collided, creating a merge conflict. You must resolve the conflict and unite the timelines.',
      narrative: `Two realities converge before you. The fabric of the codebase tears as parallel timelines collide.

"Chrono-Coder," the Merge Master warns, "two authors have written different versions of Chapter 2 in parallel branches. When you attempt to merge feature-alternate-story into main, a conflict will arise. You must manually edit the conflicted file, choose the best elements from both versions, remove the conflict markers, and complete the merge. Only then will the timelines be unified!"

Your mission: Merge the feature-alternate-story branch into main, resolve the conflict in story.txt, and complete the merge commit.`,
      initial_state: JSON.stringify(convergenceConflictState),
      victory_conditions: JSON.stringify([
        {
          type: 'custom',
          parameters: {
            validator: 'convergence_conflict',
            description: 'Conflict must be resolved and merge completed',
            requiredBranch: 'main',
            mustHaveMergeCommit: true,
            fileMustNotHaveConflictMarkers: 'story.txt',
          },
        },
      ]),
      bonus_xp: 750,
      order: 2,
    },
  ]);

  console.log('Boss battles seeded successfully');
}
