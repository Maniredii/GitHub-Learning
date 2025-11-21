import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // This seed file adds premium quest content for Chapters 8-9 and Epilogue
  // It does not delete existing data, only adds new quests

  const premiumQuests = [
    // ============================================================================
    // CHAPTER 8: THE COUNCIL OF CODERS (collaboration)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000040',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'The Council Chambers',
      narrative:
        'You ascend to the Council Chambers, where Chrono-Coders from across the realm collaborate. "Welcome to the art of collaboration," the Council Leader proclaims. "Here you will learn to work with others, resolve conflicts, and contribute to shared projects. The true power of Git lies in teamwork."',
      objective: 'Learn about collaborative Git workflows.',
      hints: JSON.stringify([
        'Collaboration involves working with remote repositories',
        'Multiple developers can work on the same project simultaneously',
        'Git helps coordinate changes and resolve conflicts',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000041',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'Forking a Repository',
      narrative:
        'The Council Leader gestures to a glowing repository. "To contribute to someone else\'s project," they explain, "you first create a fork - your own copy of their repository. This allows you to experiment freely without affecting the original."',
      objective: 'Fork a repository to create your own copy.',
      hints: JSON.stringify([
        'Forking creates a copy under your account',
        'You have full control over your fork',
        'Changes to your fork don\'t affect the original',
      ]),
      xp_reward: 250,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkRepositoryForked: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-2',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'mno123',
            message: 'Original project',
            author: 'Original Author',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'README.md': { content: '# Open Source Project', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'mno123' }],
        head: 'main',
        remotes: [
          {
            name: 'upstream',
            url: 'https://github.com/original/project.git',
            branches: [{ name: 'main', commitHash: 'mno123' }],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000042',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'Keeping Your Fork Updated',
      narrative:
        'Time passes, and the original repository has evolved. "Your fork can become outdated," the Council warns. "Add the original repository as an upstream remote, then fetch and merge its changes to stay synchronized."',
      objective: 'Sync your fork with the upstream repository.',
      hints: JSON.stringify([
        'Add upstream remote: git remote add upstream <url>',
        'Fetch changes: git fetch upstream',
        'Merge changes: git merge upstream/main',
      ]),
      xp_reward: 300,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkRemoteExists: 'upstream',
          checkMergedFromUpstream: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-3',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'pqr456',
            message: 'Fork initial state',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'pqr456' }],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [{ name: 'main', commitHash: 'pqr456' }],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000043',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'The Merge Conflict',
      narrative:
        'Suddenly, alarms sound throughout the chamber. "A merge conflict!" the Council Leader exclaims. "Two Chrono-Coders have modified the same file. Git cannot automatically merge them. You must manually resolve the conflict by editing the file and choosing which changes to keep."',
      objective: 'Resolve a merge conflict manually.',
      hints: JSON.stringify([
        'Open the conflicted file in the editor',
        'Look for conflict markers: <<<<<<<, =======, >>>>>>>',
        'Choose which changes to keep or combine both',
        'Remove the conflict markers',
        'Stage the resolved file and commit',
      ]),
      xp_reward: 400,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkConflictResolved: true,
          checkNoConflictMarkers: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-4',
        workingDirectory: {
          'config.js': { 
            content: '<<<<<<< HEAD\nmodule.exports = { port: 3000 };\n=======\nmodule.exports = { port: 8080 };\n>>>>>>> feature-branch',
            modified: true,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'stu789',
            message: 'Set port to 3000',
            author: 'Developer A',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'config.js': { content: 'module.exports = { port: 3000 };', modified: false },
            },
          },
          {
            hash: 'vwx012',
            message: 'Set port to 8080',
            author: 'Developer B',
            timestamp: '2024-01-01T10:30:00Z',
            parent: 'stu789',
            tree: {
              'config.js': { content: 'module.exports = { port: 8080 };', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'stu789' },
          { name: 'feature-branch', commitHash: 'vwx012' },
        ],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000044',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'The Stash Vault',
      narrative:
        'You are working on a feature when an urgent bug appears. "Use git stash," the Council advises, "to temporarily save your uncommitted changes. This clears your working directory so you can switch branches, fix the bug, then return and restore your work."',
      objective: 'Stash your changes, switch branches, then restore them.',
      hints: JSON.stringify([
        'Use git stash to save changes',
        'Switch branches with git checkout',
        'Use git stash pop to restore changes',
        'Use git stash list to see stashed changes',
      ]),
      xp_reward: 350,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkStashUsed: true,
          checkChangesRestored: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-5',
        workingDirectory: {
          'feature.js': { content: 'function incomplete() { // TODO }', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'yza345',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [
          { name: 'main', commitHash: 'yza345' },
          { name: 'feature', commitHash: 'yza345' },
        ],
        head: 'feature',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000045',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'The Blame Chronicle',
      narrative:
        'A bug has been discovered, but who introduced it? "Use git blame," the Council instructs, "to see who last modified each line of a file. This is not about assigning fault, but about understanding history and finding the context for changes."',
      objective: 'Use git blame to investigate file history.',
      hints: JSON.stringify([
        'Use git blame <filename> to see line-by-line history',
        'Each line shows the commit hash, author, and date',
        'This helps you understand why changes were made',
      ]),
      xp_reward: 250,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-6',
        workingDirectory: {
          'buggy.js': { 
            content: 'function calculate(x) {\n  return x * 2; // Bug: should be x * 3\n}',
            modified: false,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'bcd678',
            message: 'Add calculate function',
            author: 'Developer A',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'buggy.js': { content: 'function calculate(x) {\n  return x * 2;\n}', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'bcd678' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000046',
      chapter_id: '00000000-0000-0000-0000-000000000009',
      title: 'The Tag Marker',
      narrative:
        'The Council prepares for a release. "Use git tag," they announce, "to mark important points in history. Tags are like permanent bookmarks - typically used for version releases like v1.0.0. They make it easy to return to specific versions."',
      objective: 'Create a tag for a release version.',
      hints: JSON.stringify([
        'Use git tag v1.0.0 to create a lightweight tag',
        'Use git tag -a v1.0.0 -m "Release version 1.0" for an annotated tag',
        'Tags can be pushed to remotes with git push --tags',
      ]),
      xp_reward: 300,
      order: 7,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkTagExists: 'v1.0.0',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter8-quest-7',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'efg901',
            message: 'Release ready',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'console.log("v1.0.0");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'efg901' }],
        head: 'main',
        remotes: [],
      }),
    },

    // ============================================================================
    // CHAPTER 9: THE AUDITION (pull requests)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000047',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'The Grand Stage',
      narrative:
        'You enter the Grand Stage, where code is reviewed and judged. "Welcome to the world of Pull Requests," a voice announces. "Here, your contributions are reviewed by peers before being merged. This ensures code quality and facilitates knowledge sharing. Your audition begins now."',
      objective: 'Learn about pull requests and code review.',
      hints: JSON.stringify([
        'Pull requests propose changes from one branch to another',
        'They enable code review and discussion',
        'PRs are a key part of collaborative development',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000048',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Creating a Feature Branch',
      narrative:
        'The stage master instructs: "Before creating a pull request, you must work on a feature branch. Create a branch, make your changes, and commit them. This isolates your work and makes it easy to propose for review."',
      objective: 'Create a feature branch and make commits.',
      hints: JSON.stringify([
        'Create and switch to a branch: git checkout -b feature/add-login',
        'Make your changes and commit them',
        'Push the branch to your remote: git push origin feature/add-login',
      ]),
      xp_reward: 300,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkBranchExists: 'feature/add-login',
          checkCommitsOnBranch: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter9-quest-2',
        workingDirectory: {
          'login.js': { content: 'function login(user, pass) { return true; }', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'hij234',
            message: 'Initial project',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'hij234' }],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [{ name: 'main', commitHash: 'hij234' }],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000049',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Pushing Your Branch',
      narrative:
        'Your feature is ready. "Now push your branch to the remote repository," the stage master commands. "This makes your changes visible to others and prepares them for review. Use git push to upload your branch."',
      objective: 'Push your feature branch to the remote.',
      hints: JSON.stringify([
        'Use git push origin feature/add-dashboard',
        'The -u flag sets up tracking: git push -u origin feature/add-dashboard',
        'Your branch is now visible on the remote repository',
      ]),
      xp_reward: 250,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkBranchPushed: 'feature/add-dashboard',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter9-quest-3',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'klm567',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'nop890',
            message: 'Add dashboard',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'klm567',
            tree: {
              'dashboard.js': { content: 'module.exports = {};', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'klm567' },
          { name: 'feature/add-dashboard', commitHash: 'nop890' },
        ],
        head: 'feature/add-dashboard',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [{ name: 'main', commitHash: 'klm567' }],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000050',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Opening a Pull Request',
      narrative:
        'The curtain rises. "Now create a pull request," the voice announces. "This formally proposes your changes for review. Write a clear title and description explaining what you changed and why. Good communication is as important as good code."',
      objective: 'Create a pull request for your feature branch.',
      hints: JSON.stringify([
        'In the simulated environment, use the PR creation command',
        'Provide a clear title: "Add user authentication"',
        'Describe what changed and why in the description',
        'Reference any related issues',
      ]),
      xp_reward: 350,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkPullRequestCreated: true,
          checkPRHasDescription: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter9-quest-4',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'qrs123',
            message: 'Add authentication',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: null,
            tree: {
              'auth.js': { content: 'module.exports = { authenticate: () => {} };', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'qrs123' },
          { name: 'feature/auth', commitHash: 'qrs123' },
        ],
        head: 'feature/auth',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [
              { name: 'main', commitHash: 'qrs123' },
              { name: 'feature/auth', commitHash: 'qrs123' },
            ],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000051',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Responding to Review Feedback',
      narrative:
        'A reviewer has examined your code and left comments. "Address the feedback," the stage master instructs. "Make the requested changes, commit them to your feature branch, and push again. The pull request will automatically update with your new commits."',
      objective: 'Update your PR based on review feedback.',
      hints: JSON.stringify([
        'Make the requested changes in your working directory',
        'Commit the changes: git commit -m "Address review feedback"',
        'Push to update the PR: git push origin feature/api',
        'The PR updates automatically',
      ]),
      xp_reward: 350,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkAdditionalCommitsPushed: true,
          minimumCommits: 2,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter9-quest-5',
        workingDirectory: {
          'api.js': { 
            content: 'function getData() { return data; } // TODO: Add error handling',
            modified: true,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'tuv456',
            message: 'Add API',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: null,
            tree: {
              'api.js': { content: 'function getData() { return data; }', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'tuv456' },
          { name: 'feature/api', commitHash: 'tuv456' },
        ],
        head: 'feature/api',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [
              { name: 'main', commitHash: 'tuv456' },
              { name: 'feature/api', commitHash: 'tuv456' },
            ],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000052',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Merging the Pull Request',
      narrative:
        'The review is complete. Approval has been granted! "Now merge the pull request," the voice proclaims. "This integrates your changes into the main branch. The feature branch can then be deleted. Your contribution is now part of the project!"',
      objective: 'Merge an approved pull request.',
      hints: JSON.stringify([
        'In the simulated environment, use the PR merge command',
        'The changes will be merged into the target branch',
        'Delete the feature branch after merging',
      ]),
      xp_reward: 400,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkPullRequestMerged: true,
          checkFeatureBranchDeleted: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter9-quest-6',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'wxy789',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'zab012',
            message: 'Add feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'wxy789',
            tree: {
              'feature.js': { content: 'module.exports = {};', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'wxy789' },
          { name: 'feature/complete', commitHash: 'zab012' },
        ],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/you/project.git',
            branches: [
              { name: 'main', commitHash: 'wxy789' },
              { name: 'feature/complete', commitHash: 'zab012' },
            ],
          },
        ],
      }),
    },

    // ============================================================================
    // BOSS BATTLE 2: THE CONVERGENCE CONFLICT
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000053',
      chapter_id: '00000000-0000-0000-0000-000000000010',
      title: 'Boss Battle: The Convergence Conflict',
      narrative:
        'The Grand Stage trembles as The Convergence Conflict materializes - a massive merge conflict involving multiple files. "Two major features have been developed in parallel," the voice warns. "They both modified critical files. You must resolve all conflicts, ensuring both features work together harmoniously. This is your greatest challenge yet!"',
      objective: 'Resolve a complex multi-file merge conflict.',
      hints: JSON.stringify([
        'Use git status to see all conflicted files',
        'Open each conflicted file and resolve the conflicts',
        'Look for <<<<<<<, =======, and >>>>>>> markers',
        'Test that both features work after resolution',
        'Stage all resolved files and complete the merge commit',
      ]),
      xp_reward: 600,
      order: 7,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkAllConflictsResolved: true,
          checkNoConflictMarkers: true,
          checkMergeCommitCreated: true,
          bossBattle: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-boss-battle-2',
        workingDirectory: {
          'app.js': { 
            content: '<<<<<<< HEAD\nconst express = require("express");\nconst app = express();\napp.use(authMiddleware);\n=======\nconst express = require("express");\nconst app = express();\napp.use(loggingMiddleware);\n>>>>>>> feature-logging',
            modified: true,
          },
          'config.js': {
            content: '<<<<<<< HEAD\nmodule.exports = {\n  port: 3000,\n  auth: true\n};\n=======\nmodule.exports = {\n  port: 3000,\n  logging: true\n};\n>>>>>>> feature-logging',
            modified: true,
          },
          'routes.js': {
            content: '<<<<<<< HEAD\nmodule.exports = [\n  { path: "/login", handler: loginHandler },\n  { path: "/logout", handler: logoutHandler }\n];\n=======\nmodule.exports = [\n  { path: "/logs", handler: logsHandler },\n  { path: "/metrics", handler: metricsHandler }\n];\n>>>>>>> feature-logging',
            modified: true,
          },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'cde345',
            message: 'Add authentication feature',
            author: 'Developer A',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'const express = require("express");\nconst app = express();\napp.use(authMiddleware);', modified: false },
              'config.js': { content: 'module.exports = {\n  port: 3000,\n  auth: true\n};', modified: false },
              'routes.js': { content: 'module.exports = [\n  { path: "/login", handler: loginHandler },\n  { path: "/logout", handler: logoutHandler }\n];', modified: false },
            },
          },
          {
            hash: 'fgh678',
            message: 'Add logging feature',
            author: 'Developer B',
            timestamp: '2024-01-01T10:30:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'const express = require("express");\nconst app = express();\napp.use(loggingMiddleware);', modified: false },
              'config.js': { content: 'module.exports = {\n  port: 3000,\n  logging: true\n};', modified: false },
              'routes.js': { content: 'module.exports = [\n  { path: "/logs", handler: logsHandler },\n  { path: "/metrics", handler: metricsHandler }\n];', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'cde345' },
          { name: 'feature-logging', commitHash: 'fgh678' },
        ],
        head: 'main',
        remotes: [],
      }),
    },

    // ============================================================================
    // EPILOGUE: THE MASTER CHRONO-CODER (advanced topics)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000054',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Eternal Archive',
      narrative:
        'You ascend to the highest chamber - The Eternal Archive, where master Chrono-Coders practice the most advanced arts. "Welcome, nearly-master," an ancient voice echoes. "Here you will learn the advanced techniques that separate masters from apprentices. Your final trials begin."',
      objective: 'Prepare for advanced Git techniques.',
      hints: JSON.stringify([
        'Advanced techniques include rebase, cherry-pick, and interactive staging',
        'These tools give you precise control over history',
        'Use them wisely - with great power comes great responsibility',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000055',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Rebase Ritual',
      narrative:
        'The ancient voice speaks: "Rebase is the art of rewriting history. Unlike merge, which creates a new commit, rebase moves your commits to a new base. This creates a linear history, cleaner and easier to understand. But beware - never rebase commits that others have based work on."',
      objective: 'Rebase your feature branch onto main.',
      hints: JSON.stringify([
        'Switch to your feature branch',
        'Use git rebase main to rebase onto main',
        'Your commits will be replayed on top of main',
        'Resolve any conflicts that arise',
      ]),
      xp_reward: 400,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkRebaseCompleted: true,
          checkLinearHistory: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-2',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'ijk901',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'lmn234',
            message: 'Update main',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'ijk901',
            tree: {
              'main.js': { content: 'console.log("main updated");', modified: false },
            },
          },
          {
            hash: 'opq567',
            message: 'Feature work',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:30:00Z',
            parent: 'ijk901',
            tree: {
              'feature.js': { content: 'console.log("feature");', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'lmn234' },
          { name: 'feature', commitHash: 'opq567' },
        ],
        head: 'feature',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000056',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'Interactive Rebase',
      narrative:
        'The voice reveals deeper secrets: "Interactive rebase gives you complete control over your commit history. You can reorder commits, squash multiple commits into one, edit commit messages, or even split commits. Use git rebase -i to enter this powerful mode."',
      objective: 'Use interactive rebase to clean up commit history.',
      hints: JSON.stringify([
        'Use git rebase -i HEAD~3 to rebase the last 3 commits',
        'An editor will open with commands: pick, reword, squash, fixup, drop',
        'Squash combines commits, reword changes messages',
        'Save and close the editor to apply changes',
      ]),
      xp_reward: 450,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkInteractiveRebaseUsed: true,
          checkCommitsSquashed: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-3',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'rst890',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'uvw123',
            message: 'WIP: add feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'rst890',
            tree: {
              'feature.js': { content: 'function feature() {}', modified: false },
            },
          },
          {
            hash: 'xyz456',
            message: 'fix typo',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:15:00Z',
            parent: 'uvw123',
            tree: {
              'feature.js': { content: 'function feature() { return true; }', modified: false },
            },
          },
          {
            hash: 'abc789',
            message: 'add tests',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:30:00Z',
            parent: 'xyz456',
            tree: {
              'feature.test.js': { content: 'test("feature works", () => {});', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'abc789' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000057',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Cherry-Pick Spell',
      narrative:
        'A glowing cherry tree appears. "Sometimes," the voice explains, "you need just one commit from another branch, not the entire branch. Use git cherry-pick to pluck a specific commit and apply it to your current branch. This is surgical precision."',
      objective: 'Cherry-pick a specific commit from another branch.',
      hints: JSON.stringify([
        'Use git log to find the commit hash you want',
        'Switch to the target branch',
        'Use git cherry-pick <commit-hash> to apply that commit',
        'The commit is copied, not moved',
      ]),
      xp_reward: 400,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkCherryPickApplied: true,
          checkCommitCopied: 'def012',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-4',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'ghi345',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'def012',
            message: 'Critical bugfix',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'ghi345',
            tree: {
              'bugfix.js': { content: 'function fix() { return true; }', modified: false },
            },
          },
          {
            hash: 'jkl678',
            message: 'Experimental feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:30:00Z',
            parent: 'def012',
            tree: {
              'experimental.js': { content: 'function experiment() {}', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'ghi345' },
          { name: 'experimental', commitHash: 'jkl678' },
        ],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000058',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Reflog Guardian',
      narrative:
        'A mystical guardian appears. "Even when commits seem lost," it speaks, "the reflog remembers. Git keeps a log of every HEAD movement. Use git reflog to see this history, and recover from mistakes. Even a hard reset can be undone if you act quickly."',
      objective: 'Use reflog to recover a lost commit.',
      hints: JSON.stringify([
        'Use git reflog to see HEAD history',
        'Find the commit you want to recover',
        'Use git reset --hard <commit-hash> to restore it',
        'Or use git cherry-pick to apply it',
      ]),
      xp_reward: 450,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkReflogUsed: true,
          checkCommitRecovered: 'mno901',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-5',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'pqr234',
            message: 'Safe commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'safe.js': { content: 'console.log("safe");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'pqr234' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000059',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Bisect Hunt',
      narrative:
        'A bug has appeared, but when was it introduced? "Use git bisect," the voice commands, "to perform a binary search through your commit history. Mark commits as good or bad, and Git will help you find the exact commit that introduced the bug."',
      objective: 'Use git bisect to find a bug-introducing commit.',
      hints: JSON.stringify([
        'Start with git bisect start',
        'Mark current commit as bad: git bisect bad',
        'Mark a known good commit: git bisect good <commit-hash>',
        'Test each commit Git checks out, marking as good or bad',
        'Git will identify the first bad commit',
      ]),
      xp_reward: 450,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkBisectUsed: true,
          checkBugCommitFound: 'stu567',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-6',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'vwx890',
            message: 'Working version',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'function calculate(x) { return x * 2; }', modified: false },
            },
          },
          {
            hash: 'stu567',
            message: 'Refactor calculation',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'vwx890',
            tree: {
              'app.js': { content: 'function calculate(x) { return x * 0; } // BUG!', modified: false },
            },
          },
          {
            hash: 'yza123',
            message: 'Add feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T12:00:00Z',
            parent: 'stu567',
            tree: {
              'feature.js': { content: 'console.log("feature");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'yza123' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000060',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Submodule Nexus',
      narrative:
        'The archive reveals a portal to other repositories. "Submodules," the voice explains, "allow you to include one Git repository inside another. This is useful for managing dependencies or shared code. Each submodule maintains its own history."',
      objective: 'Add and work with a Git submodule.',
      hints: JSON.stringify([
        'Use git submodule add <url> <path> to add a submodule',
        'Submodules are tracked by commit hash',
        'Use git submodule update to sync submodules',
        'Each submodule is a separate repository',
      ]),
      xp_reward: 400,
      order: 7,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkSubmoduleAdded: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-epilogue-quest-7',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'bcd456',
            message: 'Initial project',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'bcd456' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000061',
      chapter_id: '00000000-0000-0000-0000-000000000011',
      title: 'The Final Challenge',
      narrative:
        'The Eternal Archive glows with power. "You have learned all the techniques," the ancient voice proclaims. "Now face the Final Challenge - a complex scenario combining everything you have mastered. You must fork a repository, create a feature branch, make commits, rebase onto main, resolve conflicts, squash commits, and create a perfect pull request. Prove you are a Master Chrono-Coder!"',
      objective: 'Complete a comprehensive Git workflow combining multiple advanced techniques.',
      hints: JSON.stringify([
        'Fork the repository and clone your fork',
        'Create a feature branch',
        'Make multiple commits',
        'Rebase onto the updated main branch',
        'Resolve any conflicts',
        'Use interactive rebase to squash commits',
        'Push and create a pull request',
      ]),
      xp_reward: 1000,
      order: 8,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkRepositoryForked: true,
          checkFeatureBranchCreated: true,
          checkRebaseCompleted: true,
          checkConflictsResolved: true,
          checkCommitsSquashed: true,
          checkPullRequestCreated: true,
          finalChallenge: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-final-challenge',
        workingDirectory: {
          'README.md': { content: '# Open Source Project\n\nContributions welcome!', modified: false },
          'src/core.js': { content: 'module.exports = { version: "1.0.0" };', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'efg789',
            message: 'Initial project',
            author: 'Original Author',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'README.md': { content: '# Open Source Project\n\nContributions welcome!', modified: false },
              'src/core.js': { content: 'module.exports = { version: "1.0.0" };', modified: false },
            },
          },
          {
            hash: 'hij012',
            message: 'Update core',
            author: 'Original Author',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'efg789',
            tree: {
              'src/core.js': { content: 'module.exports = { version: "1.1.0", features: [] };', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'hij012' }],
        head: 'main',
        remotes: [
          {
            name: 'upstream',
            url: 'https://github.com/original/project.git',
            branches: [{ name: 'main', commitHash: 'hij012' }],
          },
        ],
      }),
    },
  ];

  // Insert premium quests
  await knex('quests').insert(premiumQuests);
}
