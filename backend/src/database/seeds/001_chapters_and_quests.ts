import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex('quests').del();
  await knex('chapters').del();

  // Insert chapters
  const chapters = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Prologue: The Lost Archives',
      description: 'Begin your journey as a Chrono-Coder and learn the basics of version control.',
      theme_region: 'The Ancient Library',
      order: 1,
      is_premium: false,
      unlock_requirements: {},
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      title: 'Chapter 1: The Art of Chrono-Coding',
      description: 'Master the fundamental concepts of Git and version control.',
      theme_region: 'The Caves of Commitment',
      order: 2,
      is_premium: false,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000001' },
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      title: 'Chapter 2: Forging Your Tools',
      description: 'Configure your Git environment and learn essential setup commands.',
      theme_region: 'The Workshop of Time',
      order: 3,
      is_premium: false,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000002' },
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      title: 'Chapter 3: The Three States',
      description: 'Understand the working directory, staging area, and repository.',
      theme_region: 'The Tri-Realm Gateway',
      order: 4,
      is_premium: false,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000003' },
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      title: 'Chapter 4: The First Seal',
      description: 'Learn the basic Git workflow: add, commit, and status.',
      theme_region: 'The Sealing Grounds',
      order: 5,
      is_premium: false,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000004' },
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      title: 'Chapter 5: Rewinding Time',
      description: 'Master the art of undoing changes with reset and checkout.',
      theme_region: 'The Temporal Nexus',
      order: 6,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000005' },
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      title: 'Chapter 6: The Great Library',
      description: 'Learn about remote repositories and collaboration.',
      theme_region: 'The Great Library',
      order: 7,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000006' },
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      title: 'Chapter 7: The Parallel Timelines',
      description: 'Master branching and merging strategies.',
      theme_region: 'The Branching Forests',
      order: 8,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000007' },
    },
  ];

  await knex('chapters').insert(chapters);

  // Insert quests for Prologue
  const quests = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      chapter_id: '00000000-0000-0000-0000-000000000001',
      title: 'The Awakening',
      narrative:
        'You stand before the Ancient Library, its digital halls filled with forgotten code. A mysterious voice echoes: "Welcome, Chrono-Coder. To restore the Lost Project, you must first understand what version control truly means."',
      objective: 'Learn what Git is and why version control matters.',
      hints: JSON.stringify([
        'Git tracks changes to files over time',
        'Version control helps teams collaborate',
        'You can travel back to any point in your project history',
      ]),
      xp_reward: 50,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      chapter_id: '00000000-0000-0000-0000-000000000001',
      title: 'Your First Repository',
      narrative:
        'The voice guides you to an empty chamber. "Every journey begins with a single step. Create your first repository - a container for your project\'s history."',
      objective: 'Initialize a new Git repository.',
      hints: JSON.stringify([
        'Use the git init command',
        'This creates a hidden .git folder',
        'The repository is now ready to track changes',
      ]),
      xp_reward: 100,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkRepositoryInitialized: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-prologue-quest-2',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [],
        head: 'main',
        remotes: [],
      }),
    },
    // Chapter 1 quests
    {
      id: '10000000-0000-0000-0000-000000000003',
      chapter_id: '00000000-0000-0000-0000-000000000002',
      title: 'The First Spell',
      narrative:
        'You enter the Caves of Commitment. Ancient runes glow on the walls, showing the command "git add". "This spell," the voice explains, "prepares your changes for preservation."',
      objective: 'Stage a file using git add.',
      hints: JSON.stringify([
        'Create or modify a file first',
        'Use git add <filename> to stage it',
        'Check git status to see staged files',
      ]),
      xp_reward: 150,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkStagingArea: true, minimumFiles: 1 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter1-quest-1',
        workingDirectory: {
          'README.md': { content: '# My First Project\n\nThis is a test file.', modified: true },
        },
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      chapter_id: '00000000-0000-0000-0000-000000000002',
      title: 'Sealing the Moment',
      narrative:
        'The cave trembles as you approach the Sealing Stone. "Now," the voice commands, "seal this moment in time with git commit. Your changes will be preserved forever."',
      objective: 'Create your first commit with a meaningful message.',
      hints: JSON.stringify([
        'Use git commit -m "Your message here"',
        'Write a clear, descriptive message',
        'This creates a snapshot of your staged changes',
      ]),
      xp_reward: 200,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 1 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter1-quest-2',
        workingDirectory: {
          'README.md': { content: '# My First Project\n\nThis is a test file.', modified: false },
        },
        stagingArea: {
          'README.md': { content: '# My First Project\n\nThis is a test file.', modified: false },
        },
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      chapter_id: '00000000-0000-0000-0000-000000000002',
      title: 'Reading the Chronicles',
      narrative:
        'Ancient scrolls line the cave walls. "Use git log," the voice instructs, "to read the chronicles of your journey. Every commit tells a story."',
      objective: 'View your commit history using git log.',
      hints: JSON.stringify([
        'Simply type git log',
        "You'll see commit hashes, authors, dates, and messages",
        'Press q to exit the log view',
      ]),
      xp_reward: 100,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter1-quest-3',
        workingDirectory: {
          'README.md': { content: '# My First Project\n\nThis is a test file.', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'abc123',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'README.md': {
                content: '# My First Project\n\nThis is a test file.',
                modified: false,
              },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'abc123' }],
        head: 'main',
        remotes: [],
      }),
    },
  ];

  await knex('quests').insert(quests);
}
