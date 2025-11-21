import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // This seed file adds premium quest content for Chapters 5-7
  // It does not delete existing data, only adds new quests

  const premiumQuests = [
    // ============================================================================
    // CHAPTER 5: REWINDING TIME (undoing changes)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000019',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'The Temporal Nexus',
      narrative:
        'You step into the Temporal Nexus, where time flows in all directions. The voice echoes with new power: "Welcome to the premium realms, Chrono-Coder. Here you will learn to undo mistakes, rewrite history, and master the flow of time itself. Your first lesson: git reset."',
      objective: 'Learn about different ways to undo changes in Git.',
      hints: JSON.stringify([
        'git reset moves the HEAD pointer to a different commit',
        'git checkout can discard changes in working directory',
        'git revert creates a new commit that undoes previous changes',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000020',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'Unstaging the Staged',
      narrative:
        'A file glows in the staging area, but you realize it should not be committed yet. "Use git reset HEAD <file>," the voice instructs, "to unstage a file without losing your changes. The file returns to the working directory, awaiting your next decision."',
      objective: 'Unstage a file using git reset HEAD.',
      hints: JSON.stringify([
        'The file config.js is currently staged',
        'Use git reset HEAD config.js to unstage it',
        'The file will remain modified in your working directory',
      ]),
      xp_reward: 250,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkStagingArea: true, fileNotStaged: 'config.js' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter5-quest-2',
        workingDirectory: {
          'config.js': { content: 'module.exports = { debug: true };', modified: false },
        },
        stagingArea: {
          'config.js': { content: 'module.exports = { debug: true };', modified: false },
        },
        commits: [
          {
            hash: 'pqr678',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'pqr678' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000021',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'Discarding Changes',
      narrative:
        'You have made changes to a file, but they are wrong. The voice speaks urgently: "Use git checkout -- <file> to discard changes in your working directory. This is powerful magic - the changes will be lost forever. Use it wisely."',
      objective: 'Discard working directory changes using git checkout.',
      hints: JSON.stringify([
        'The file buggy.js has unwanted changes',
        'Use git checkout -- buggy.js to restore it',
        'This discards all changes since the last commit',
      ]),
      xp_reward: 250,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'file_content',
        parameters: { 
          filePath: 'buggy.js', 
          expectedContent: 'function working() { return true; }',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter5-quest-3',
        workingDirectory: {
          'buggy.js': { content: 'function broken() { return false; // BUG }', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'stu901',
            message: 'Add working function',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'buggy.js': { content: 'function working() { return true; }', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'stu901' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000022',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'The Soft Reset',
      narrative:
        'Time swirls around you as the voice reveals deeper secrets. "git reset --soft moves HEAD to a previous commit, but keeps your changes staged. Use this when you want to recommit with a better message or combine commits."',
      objective: 'Perform a soft reset to the previous commit.',
      hints: JSON.stringify([
        'Use git log to see commit history',
        'Use git reset --soft HEAD~1 to go back one commit',
        'Your changes will remain staged',
      ]),
      xp_reward: 300,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkCommitCount: 1, checkStagingNotEmpty: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter5-quest-4',
        workingDirectory: {
          'feature.js': { content: 'function newFeature() { return "done"; }', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'vwx234',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'yza567',
            message: 'Typo in commit message',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'vwx234',
            tree: {
              'feature.js': { content: 'function newFeature() { return "done"; }', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'yza567' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000023',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'The Hard Reset',
      narrative:
        'The Temporal Nexus darkens. "Now witness the most powerful and dangerous spell: git reset --hard. This resets everything - HEAD, staging area, and working directory - to a previous commit. All uncommitted changes are destroyed. Use with extreme caution."',
      objective: 'Perform a hard reset to clean your repository.',
      hints: JSON.stringify([
        'Use git reset --hard HEAD to discard all changes',
        'Or use git reset --hard <commit-hash> to go to a specific commit',
        'This cannot be undone - all changes are lost',
      ]),
      xp_reward: 300,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkCleanWorkingDirectory: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter5-quest-5',
        workingDirectory: {
          'mess.js': { content: 'This is a mess', modified: true },
          'garbage.txt': { content: 'Delete this', modified: true },
        },
        stagingArea: {
          'staged.js': { content: 'Should not be here', modified: false },
        },
        commits: [
          {
            hash: 'bcd890',
            message: 'Clean state',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'console.log("Clean");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'bcd890' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000024',
      chapter_id: '00000000-0000-0000-0000-000000000006',
      title: 'The Revert Spell',
      narrative:
        'A safer path appears. "When you need to undo a commit but preserve history," the voice teaches, "use git revert. This creates a new commit that undoes the changes of a previous commit. History remains intact, making it safe for shared repositories."',
      objective: 'Revert a commit using git revert.',
      hints: JSON.stringify([
        'Use git log to find the commit to revert',
        'Use git revert <commit-hash> to create an undo commit',
        'This is safer than reset for public branches',
      ]),
      xp_reward: 350,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 3, checkRevertCommit: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter5-quest-6',
        workingDirectory: {
          'bad-feature.js': { content: 'This feature breaks everything', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'efg123',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'hij456',
            message: 'Add bad feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'efg123',
            tree: {
              'bad-feature.js': { content: 'This feature breaks everything', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'hij456' }],
        head: 'main',
        remotes: [],
      }),
    },

    // ============================================================================
    // CHAPTER 6: THE GREAT LIBRARY (remotes)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000025',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'The Great Library Awaits',
      narrative:
        'You emerge from the Temporal Nexus and behold a magnificent structure: The Great Library. "This," the voice proclaims, "is where code is shared across the world. Remote repositories allow collaboration with other Chrono-Coders. Your local repository is but one node in a vast network."',
      objective: 'Learn about remote repositories and collaboration.',
      hints: JSON.stringify([
        'Remote repositories are hosted on servers (like GitHub)',
        'You can push your changes to remotes',
        'You can pull changes from remotes',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000026',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'Adding a Remote',
      narrative:
        'The librarian appears, holding a glowing key. "To connect to a remote repository," they explain, "use git remote add. Give it a name - traditionally \'origin\' - and a URL. This creates a link between your local repository and the remote."',
      objective: 'Add a remote repository using git remote add.',
      hints: JSON.stringify([
        'Use git remote add origin <url>',
        'The name "origin" is conventional for the main remote',
        'Use git remote -v to verify the remote was added',
      ]),
      xp_reward: 250,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkRemoteExists: true, remoteName: 'origin' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter6-quest-2',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'klm789',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'README.md': { content: '# My Project', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'klm789' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000027',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'Cloning a Repository',
      narrative:
        'The librarian gestures to countless shelves of code. "To copy an entire repository from the Great Library to your local machine, use git clone. This downloads all commits, branches, and history. It is how most journeys begin."',
      objective: 'Clone a remote repository using git clone.',
      hints: JSON.stringify([
        'Use git clone <url> to copy a repository',
        'This creates a new directory with the repository name',
        'The remote is automatically added as "origin"',
      ]),
      xp_reward: 300,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkRepositoryCloned: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter6-quest-3',
        workingDirectory: {},
        stagingArea: {},
        commits: [],
        branches: [],
        head: '',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000028',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'Pushing to the Library',
      narrative:
        'You have made commits locally, and now it is time to share them. "Use git push," the voice commands, "to upload your commits to the remote repository. Your work will be preserved in the Great Library for all to see."',
      objective: 'Push your commits to the remote using git push.',
      hints: JSON.stringify([
        'Use git push origin main to push to the main branch',
        'You must have commits to push',
        'The remote must be configured first',
      ]),
      xp_reward: 350,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkRemotePushed: true, branch: 'main' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter6-quest-4',
        workingDirectory: {
          'feature.js': { content: 'function myFeature() {}', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'nop012',
            message: 'Add feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'feature.js': { content: 'function myFeature() {}', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'nop012' }],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/example/repo.git',
            branches: [],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000029',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'Fetching from the Library',
      narrative:
        'Other Chrono-Coders have made changes to the remote repository. "Use git fetch," the librarian instructs, "to download their changes without merging them. This lets you review what has changed before integrating it into your work."',
      objective: 'Fetch changes from the remote using git fetch.',
      hints: JSON.stringify([
        'Use git fetch origin to download changes',
        'This updates your remote-tracking branches',
        'Your local branches are not modified',
      ]),
      xp_reward: 300,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkFetchExecuted: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter6-quest-5',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'qrs345',
            message: 'Local commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'qrs345' }],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/example/repo.git',
            branches: [
              { name: 'main', commitHash: 'tuv678' },
            ],
          },
        ],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000030',
      chapter_id: '00000000-0000-0000-0000-000000000007',
      title: 'Pulling Changes',
      narrative:
        'The time has come to integrate remote changes. "git pull," the voice explains, "is a combination of fetch and merge. It downloads changes and immediately merges them into your current branch. Use it when you trust the remote changes."',
      objective: 'Pull and merge remote changes using git pull.',
      hints: JSON.stringify([
        'Use git pull origin main to fetch and merge',
        'This is equivalent to git fetch + git merge',
        'Conflicts may occur if both you and others modified the same files',
      ]),
      xp_reward: 350,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkPullExecuted: true, checkMergeCommit: true },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter6-quest-6',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'wxy901',
            message: 'Local work',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'local.js': { content: 'console.log("local");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'wxy901' }],
        head: 'main',
        remotes: [
          {
            name: 'origin',
            url: 'https://github.com/example/repo.git',
            branches: [
              { name: 'main', commitHash: 'zab234' },
            ],
          },
        ],
      }),
    },

    // ============================================================================
    // CHAPTER 7: THE PARALLEL TIMELINES (branching)
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000031',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'The Branching Forests',
      narrative:
        'You enter a mystical forest where paths split and converge. "Welcome to the Branching Forests," the voice resonates. "Here you will learn to create parallel timelines - branches - where you can experiment without affecting the main path. This is the true power of Git."',
      objective: 'Learn about Git branches and their purpose.',
      hints: JSON.stringify([
        'Branches let you work on features independently',
        'The main branch (often called main or master) is the stable version',
        'You can create, switch, and merge branches',
      ]),
      xp_reward: 200,
      order: 1,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { requiresManualCompletion: true },
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000032',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Creating a Branch',
      narrative:
        'A path splits before you. "Use git branch <name>," the voice instructs, "to create a new branch. This creates a new pointer to the current commit. The branch exists, but you have not yet traveled down it."',
      objective: 'Create a new branch using git branch.',
      hints: JSON.stringify([
        'Use git branch feature-login to create a branch',
        'Use git branch to list all branches',
        'Creating a branch does not switch to it',
      ]),
      xp_reward: 250,
      order: 2,
      validation_criteria: JSON.stringify({
        type: 'branch_exists',
        parameters: { branchName: 'feature-login' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-2',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'cde567',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'console.log("app");', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'cde567' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000033',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Switching Branches',
      narrative:
        'You stand at the fork in the path. "To travel down a different branch," the voice guides, "use git checkout <branch-name>. Your working directory will transform to match that branch\'s state. You can move freely between timelines."',
      objective: 'Switch to a different branch using git checkout.',
      hints: JSON.stringify([
        'Use git checkout feature-login to switch branches',
        'Your working directory will update to match the branch',
        'The HEAD pointer moves to the new branch',
      ]),
      xp_reward: 250,
      order: 3,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkCurrentBranch: 'feature-login' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-3',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'fgh890',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [
          { name: 'main', commitHash: 'fgh890' },
          { name: 'feature-login', commitHash: 'fgh890' },
        ],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000034',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Branch and Switch',
      narrative:
        'The forest reveals a shortcut. "You can create and switch to a branch in one command," the voice reveals. "Use git checkout -b <name> to create a new branch and immediately travel down it. This is the way of the efficient Chrono-Coder."',
      objective: 'Create and switch to a new branch in one command.',
      hints: JSON.stringify([
        'Use git checkout -b feature-dashboard',
        'This is equivalent to git branch + git checkout',
        'You will immediately be on the new branch',
      ]),
      xp_reward: 300,
      order: 4,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkBranchExists: 'feature-dashboard',
          checkCurrentBranch: 'feature-dashboard',
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-4',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'ijk123',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [{ name: 'main', commitHash: 'ijk123' }],
        head: 'main',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000035',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Working on a Branch',
      narrative:
        'You are now on a feature branch. "Make commits here," the voice encourages. "They will only affect this branch. The main branch remains untouched, safe and stable. This is how teams work on multiple features simultaneously."',
      objective: 'Make commits on a feature branch.',
      hints: JSON.stringify([
        'You are on the feature-api branch',
        'Make changes, stage them, and commit',
        'These commits will not appear on main',
      ]),
      xp_reward: 300,
      order: 5,
      validation_criteria: JSON.stringify({
        type: 'commit_exists',
        parameters: { minimumCommits: 2, onBranch: 'feature-api' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-5',
        workingDirectory: {
          'api.js': { content: 'module.exports = { getData: () => {} };', modified: true },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'lmn456',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [
          { name: 'main', commitHash: 'lmn456' },
          { name: 'feature-api', commitHash: 'lmn456' },
        ],
        head: 'feature-api',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000036',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'The Fast-Forward Merge',
      narrative:
        'Your feature is complete. The paths must converge. "When your feature branch is ahead of main," the voice explains, "Git can perform a fast-forward merge. It simply moves the main pointer forward. No merge commit is needed."',
      objective: 'Merge a feature branch using fast-forward.',
      hints: JSON.stringify([
        'Switch to main branch first: git checkout main',
        'Then merge: git merge feature-complete',
        'This will fast-forward main to match feature-complete',
      ]),
      xp_reward: 350,
      order: 6,
      validation_criteria: JSON.stringify({
        type: 'merge_completed',
        parameters: { 
          targetBranch: 'main',
          sourceBranch: 'feature-complete',
          fastForward: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-6',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'opq789',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'rst012',
            message: 'Add feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'opq789',
            tree: {
              'feature.js': { content: 'module.exports = {};', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'opq789' },
          { name: 'feature-complete', commitHash: 'rst012' },
        ],
        head: 'feature-complete',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000037',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'The Three-Way Merge',
      narrative:
        'The forest grows complex. Two paths have diverged and both have progressed. "When both branches have new commits," the voice intones, "Git performs a three-way merge. It creates a new merge commit with two parents, uniting the timelines."',
      objective: 'Perform a three-way merge.',
      hints: JSON.stringify([
        'Both main and feature-auth have new commits',
        'Switch to main: git checkout main',
        'Merge: git merge feature-auth',
        'A merge commit will be created',
      ]),
      xp_reward: 400,
      order: 7,
      validation_criteria: JSON.stringify({
        type: 'merge_completed',
        parameters: { 
          targetBranch: 'main',
          sourceBranch: 'feature-auth',
          threeWay: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-7',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'uvw345',
            message: 'Initial commit',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {},
          },
          {
            hash: 'xyz678',
            message: 'Update main',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'uvw345',
            tree: {
              'main.js': { content: 'console.log("main");', modified: false },
            },
          },
          {
            hash: 'abc901',
            message: 'Add auth',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T11:30:00Z',
            parent: 'uvw345',
            tree: {
              'auth.js': { content: 'module.exports = { login: () => {} };', modified: false },
            },
          },
        ],
        branches: [
          { name: 'main', commitHash: 'xyz678' },
          { name: 'feature-auth', commitHash: 'abc901' },
        ],
        head: 'feature-auth',
        remotes: [],
      }),
    },
    {
      id: '10000000-0000-0000-0000-000000000038',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Deleting a Branch',
      narrative:
        'A merged branch lingers, no longer needed. "Once a branch is merged," the voice advises, "you can delete it with git branch -d. The commits remain in history, but the branch pointer is removed. Keep your forest tidy."',
      objective: 'Delete a merged branch.',
      hints: JSON.stringify([
        'Use git branch -d old-feature to delete',
        'The -d flag only deletes merged branches (safe)',
        'Use -D to force delete unmerged branches (dangerous)',
      ]),
      xp_reward: 200,
      order: 8,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { checkBranchDeleted: 'old-feature' },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-chapter7-quest-8',
        workingDirectory: {},
        stagingArea: {},
        commits: [
          {
            hash: 'def234',
            message: 'Merge old-feature',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T12:00:00Z',
            parent: null,
            tree: {},
          },
        ],
        branches: [
          { name: 'main', commitHash: 'def234' },
          { name: 'old-feature', commitHash: 'def234' },
        ],
        head: 'main',
        remotes: [],
      }),
    },

    // ============================================================================
    // BOSS BATTLE 1: THE CORRUPTED TIMELINE
    // ============================================================================
    {
      id: '10000000-0000-0000-0000-000000000039',
      chapter_id: '00000000-0000-0000-0000-000000000008',
      title: 'Boss Battle: The Corrupted Timeline',
      narrative:
        'The forest trembles. A dark presence emerges - The Corrupted Timeline. "A catastrophic commit has corrupted the main branch," the voice warns urgently. "You must use git log to find the last good commit, then use git reset --hard to restore it. The fate of the project depends on you!"',
      objective: 'Find and restore the last good commit before the corruption.',
      hints: JSON.stringify([
        'Use git log to examine the commit history',
        'Look for the commit message "Last stable version"',
        'Use git reset --hard <commit-hash> to restore that commit',
        'All commits after that point will be removed',
      ]),
      xp_reward: 500,
      order: 9,
      validation_criteria: JSON.stringify({
        type: 'custom',
        parameters: { 
          checkCurrentCommit: 'ghi567',
          checkCommitMessage: 'Last stable version',
          bossBattle: true,
        },
      }),
      initial_repository_state: JSON.stringify({
        id: 'repo-boss-battle-1',
        workingDirectory: {
          'corrupted.js': { content: '// CORRUPTED DATA !!!', modified: false },
        },
        stagingArea: {},
        commits: [
          {
            hash: 'ghi567',
            message: 'Last stable version',
            author: 'Chrono-Coder',
            timestamp: '2024-01-01T10:00:00Z',
            parent: null,
            tree: {
              'app.js': { content: 'console.log("Working");', modified: false },
            },
          },
          {
            hash: 'jkl890',
            message: 'CORRUPTION: DO NOT USE',
            author: 'Unknown',
            timestamp: '2024-01-01T11:00:00Z',
            parent: 'ghi567',
            tree: {
              'corrupted.js': { content: '// CORRUPTED DATA !!!', modified: false },
            },
          },
        ],
        branches: [{ name: 'main', commitHash: 'jkl890' }],
        head: 'main',
        remotes: [],
      }),
    },
  ];

  // Insert premium quests
  await knex('quests').insert(premiumQuests);
}
