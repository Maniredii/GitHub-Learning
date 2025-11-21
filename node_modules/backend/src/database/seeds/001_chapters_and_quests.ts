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
    {
      id: '00000000-0000-0000-0000-000000000009',
      title: 'Chapter 8: The Council of Coders',
      description: 'Learn collaborative workflows and team practices.',
      theme_region: 'The Council Chambers',
      order: 9,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000008' },
    },
    {
      id: '00000000-0000-0000-0000-000000000010',
      title: 'Chapter 9: The Audition',
      description: 'Master pull requests and code review workflows.',
      theme_region: 'The Grand Stage',
      order: 10,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000009' },
    },
    {
      id: '00000000-0000-0000-0000-000000000011',
      title: 'Epilogue: The Master Chrono-Coder',
      description: 'Advanced Git techniques and final challenges.',
      theme_region: 'The Eternal Archive',
      order: 11,
      is_premium: true,
      unlock_requirements: { previousChapter: '00000000-0000-0000-0000-000000000010' },
    },
  ];

  await knex('chapters').insert(chapters);

  // ============================================================================
  // PROLOGUE: THE LOST ARCHIVES
  // ============================================================================
  const quests = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      chapter_id: '00000000-0000-0000-0000-000000000001',
      title: 'The Awakening',
      narrative:
        'You stand before the Ancient Library, its digital halls filled with forgotten code. A mysterious voice echoes: "Welcome, Chrono-Coder. To restore the Lost Project, you must first understand what version control truly means. It is the art of preserving history, tracking changes, and collaborating across time itself."',
      objective: 'Learn what Git is and why version control matters.',
      hints: JSON.stringify([
        'Git tracks changes to files over time',
        'Version control helps teams collaborate without overwriting each other\'s work',
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
        'The voice guides you to an empty chamber. "Every journey begins with a single step. Create your first repository - a container for your project\'s history. This sacred space will hold all the changes you make, every decision you record."',
      objective: 'Initialize a new Git repository using git init.',
      hints: JSON.stringify([
        'Use the git init command',
        'This creates a hidden .git folder that stores all version history',
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

    // ============================================================================
    // CHAPTER 1: THE ART OF CHRONO-CODING
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000003',
      chapter_id: '00000000-0000-0000-0000-000000000002',
      title: 'The First Spell',
      narrative:
        'You enter the Caves of Commitment. Ancient runes glow on the walls, showing the command "git add". "This spell," the voice explains, "prepares your changes for preservation. It moves files from your working directory to the staging area, where they await their moment of permanence."',
      objective: 'Stage the README.md file using git add.',
      hints: JSON.stringify([
        'The file README.md is already in your working directory',
        'Use git add README.md to stage it',
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
        'The cave trembles as you approach the Sealing Stone. "Now," the voice commands, "seal this moment in time with git commit. Your changes will be preserved forever in the repository\'s history. Choose your words wisely - your commit message will guide future travelers."',
      objective: 'Create your first commit with a meaningful message.',
      hints: JSON.stringify([
        'Use git commit -m "Your message here"',
        'Write a clear, descriptive message like "Add initial README"',
        'This creates a permanent snapshot of your staged changes',
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
        'Ancient scrolls line the cave walls. "Use git log," the voice instructs, "to read the chronicles of your journey. Every commit tells a story - who made the change, when it happened, and why it mattered."',
      objective: 'View your commit history using git log.',
      hints: JSON.stringify([
        'Simply type git log',
        "You'll see commit hashes, authors, dates, and messages",
        'Try git log --oneline for a condensed view',
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
    {
      id: '10000000-0000-0000-0000-000000000006',
      chapter_id: '00000000-0000-0000-0000-000000000002',
      title: 'The Status Oracle',
      narrative:
        'A glowing crystal appears before you. "This is the Status Oracle," the voice explains. "It reveals the state of your repository - what has changed, what is staged, and what awaits commitment. Consult it often."',
      objective: 'Use git status to check your repository state.',
      hints: JSON.stringify([
        'Type git status to see the current state',
        'It shows modified files, staged files, and untracked files',
        'This is one of the most frequently used Git commands',
      ]),
      xp_reward: 100,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter1-quest-4',
        workingDirectory: {
          'README.md': { content: '# My First Project\n\nUpdated content.', modified: true },
          'newfile.txt': { content: 'New file content', modified: true },
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

    // ============================================================================
    // CHAPTER 2: FORGING YOUR TOOLS (git config)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000007',
      chapter_id: '00000000-0000-0000-0000-000000000003',
      title: 'Forging Your Identity',
      narrative:
        'You enter the Workshop of Time, where ancient tools hang on crystalline walls. "Before you can leave your mark on history," the voice intones, "you must forge your identity. Every commit you make will bear your name and email."',
      objective: 'Configure your Git username and email.',
      hints: JSON.stringify([
        'Use git config user.name "Your Name"',
        'Use git config user.email "your.email@example.com"',
        'These settings identify you as the author of commits',
      ]),
      xp_reward: 150,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkGitConfig: true, requiredFields: ['user.name', 'user.email'] },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter2-quest-1',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000008',
      chapter_id: '00000000-0000-0000-0000-000000000003',
      title: 'The Global Forge',
      narrative:
        'The workshop master appears. "You can forge tools for a single project, or for all your journeys. The --global flag creates tools that work everywhere, across all repositories."',
      objective: 'Set your global Git configuration.',
      hints: JSON.stringify([
        'Add --global flag: git config --global user.name "Your Name"',
        'Global settings apply to all repositories on your system',
        'Local settings (without --global) override global ones',
      ]),
      xp_reward: 100,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000009',
      chapter_id: '00000000-0000-0000-0000-000000000003',
      title: 'Inspecting Your Tools',
      narrative:
        'A mirror of truth appears on the wall. "To see your configurations," the voice explains, "use git config --list. This reveals all the settings that shape your Git experience."',
      objective: 'View your Git configuration settings.',
      hints: JSON.stringify([
        'Use git config --list to see all settings',
        'Use git config user.name to see a specific setting',
        'Configuration comes from global and local sources',
      ]),
      xp_reward: 100,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },

    // ============================================================================
    // CHAPTER 3: THE THREE STATES (working directory, staging, repository)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000010',
      chapter_id: '00000000-0000-0000-0000-000000000004',
      title: 'The Tri-Realm Gateway',
      narrative:
        'You stand before three glowing portals. "Behold the Three States," the voice proclaims. "The Working Directory, where you create and modify. The Staging Area, where you prepare. And the Repository, where history is sealed forever. Understanding these realms is the key to mastering Git."',
      objective: 'Learn about the three states of Git.',
      hints: JSON.stringify([
        'Working Directory: where you edit files',
        'Staging Area (Index): where you prepare commits',
        'Repository (.git directory): where commits are stored',
      ]),
      xp_reward: 150,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000011',
      chapter_id: '00000000-0000-0000-0000-000000000004',
      title: 'Journey Through the Realms',
      narrative:
        'The voice guides you: "Watch as a file travels through the realms. First, you modify it in the Working Directory. Then, git add moves it to the Staging Area. Finally, git commit seals it in the Repository. This is the sacred cycle."',
      objective: 'Move a file through all three states.',
      hints: JSON.stringify([
        'The file is already modified in your working directory',
        'Use git add to move it to staging',
        'Use git commit to seal it in the repository',
      ]),
      xp_reward: 200,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 1 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter3-quest-2',
        workingDirectory: {
          'journey.txt': { content: 'I am traveling through the three states.', modified: true },
        },
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000012',
      chapter_id: '00000000-0000-0000-0000-000000000004',
      title: 'The Staging Grounds',
      narrative:
        'You arrive at a vast staging ground where files await their destiny. "The staging area," the voice explains, "lets you craft the perfect commit. You can stage some changes while leaving others for later. This is the art of atomic commits."',
      objective: 'Stage multiple files selectively.',
      hints: JSON.stringify([
        'You have three modified files',
        'Use git add <filename> to stage specific files',
        'You can also use git add . to stage all files',
      ]),
      xp_reward: 150,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkStagingArea: true, minimumFiles: 2 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter3-quest-3',
        workingDirectory: {
          'feature.js': { content: 'function newFeature() {}', modified: true },
          'test.js': { content: 'test("feature works", () => {});', modified: true },
          'docs.md': { content: '# Documentation', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'def456',
            message: 'Initial setup',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'def456' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000013',
      chapter_id: '00000000-0000-0000-0000-000000000004',
      title: 'The Diff Oracle',
      narrative:
        'A mystical oracle appears, showing you the differences between realms. "Use git diff," it whispers, "to see what has changed in your working directory. Use git diff --staged to see what awaits commitment."',
      objective: 'View differences using git diff.',
      hints: JSON.stringify([
        'git diff shows unstaged changes',
        'git diff --staged shows staged changes',
        'Lines starting with + are additions, - are deletions',
      ]),
      xp_reward: 100,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter3-quest-4',
        workingDirectory: {
          'README.md': { content: '# Updated Project\n\nNew content here.', modified: true },
        },
        stagingArea: {
          'feature.js': { content: 'function newFeature() { return true; }', modified: false },
        },
        commits: [
          {
            hash: 'ghi789',
            message: 'Previous commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'README.md': { content: '# Project', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'ghi789' }],
        head: 'main',
        remotes: [],
      }),
    },

    // ============================================================================
    // CHAPTER 4: THE FIRST SEAL (basic workflow)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000014',
      chapter_id: '00000000-0000-0000-0000-000000000005',
      title: 'The Complete Ritual',
      narrative:
        'You enter the Sealing Grounds, where the complete workflow is revealed. "Now you will perform the full ritual," the voice commands. "Check status, stage your changes, commit them, and verify your work. This is the heartbeat of version control."',
      objective: 'Complete a full Git workflow: status, add, commit, log.',
      hints: JSON.stringify([
        'Start with git status to see what changed',
        'Use git add to stage files',
        'Use git commit -m "message" to commit',
        'Verify with git log',
      ]),
      xp_reward: 250,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 1 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter4-quest-1',
        workingDirectory: {
          'app.js': { content: 'console.log("Hello World");', modified: true },
        },
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000015',
      chapter_id: '00000000-0000-0000-0000-000000000005',
      title: 'Multiple Seals',
      narrative:
        'The ground shakes as multiple sealing stones rise from the earth. "A project grows through many commits," the voice explains. "Each commit should be focused and meaningful. Create multiple commits to tell the story of your work."',
      objective: 'Make three separate commits with different files.',
      hints: JSON.stringify([
        'You have three files to commit',
        'Stage and commit each file separately',
        'Write descriptive messages for each commit',
      ]),
      xp_reward: 300,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 3 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter4-quest-2',
        workingDirectory: {
          'index.html': { content: '<html><body>Hello</body></html>', modified: true },
          'style.css': { content: 'body { margin: 0; }', modified: true },
          'script.js': { content: 'document.addEventListener("DOMContentLoaded", () => {});', modified: true },
        },
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000016',
      chapter_id: '00000000-0000-0000-0000-000000000005',
      title: 'The Art of the Message',
      narrative:
        'An ancient tome opens before you, revealing the wisdom of commit messages. "A good commit message," the voice teaches, "tells future travelers why a change was made, not just what changed. Write messages that your future self will thank you for."',
      objective: 'Create commits with well-formatted messages.',
      hints: JSON.stringify([
        'Use present tense: "Add feature" not "Added feature"',
        'Be specific: "Fix login button alignment" not "Fix bug"',
        'Keep the first line under 50 characters',
      ]),
      xp_reward: 200,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 1, checkMessageQuality: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter4-quest-3',
        workingDirectory: {
          'login.js': { content: 'function login(user, pass) { /* implementation */ }', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'jkl012',
            message: 'Initial setup',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'jkl012' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000017',
      chapter_id: '00000000-0000-0000-0000-000000000005',
      title: 'The Gitignore Shield',
      narrative:
        'Dark shadows lurk in your working directory - temporary files, build artifacts, secrets. "Use the .gitignore shield," the voice warns. "It protects your repository from files that should never be committed."',
      objective: 'Create a .gitignore file to exclude unwanted files.',
      hints: JSON.stringify([
        'Create a file named .gitignore',
        'Add patterns like *.log, node_modules/, .env',
        'Files matching these patterns will be ignored by Git',
      ]),
      xp_reward: 200,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'file_content',
        parameters: { filePath: '.gitignore', mustExist: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter4-quest-4',
        workingDirectory: {
          'app.js': { content: 'const app = require("express")();', modified: false },
          'debug.log': { content: 'Debug info...', modified: true },
          '.env': { content: 'SECRET_KEY=abc123', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'mno345',
            message: 'Add app.js',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'const app = require("express")();', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'mno345' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000018',
      chapter_id: '00000000-0000-0000-0000-000000000005',
      title: 'The First Seal Complete',
      narrative:
        'The Sealing Grounds glow with power as you complete your training. "You have mastered the basic workflow," the voice proclaims. "You can now track changes, stage commits, and build a history. But this is only the beginning. Greater challenges await in the premium realms."',
      objective: 'Demonstrate mastery by completing a full project workflow.',
      hints: JSON.stringify([
        'Create multiple files and commit them',
        'Use proper commit messages',
        'Check your work with git log',
      ]),
      xp_reward: 300,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 2 },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter4-quest-5',
        workingDirectory: {
          'README.md': { content: '# My Project\n\nA complete project.', modified: true },
          'src/main.js': { content: 'function main() { console.log("Running"); }', modified: true },
          'package.json': { content: '{"name": "my-project", "version": "1.0.0"}', modified: true },
        },
        stagingArea: {},
        commits: [],
        branches: [{ name: 'main', commitHash: '' }],
        head: 'main',
        remotes: [],
      }),
    },
  ];

  await knex('quests').insert(quests);
}
