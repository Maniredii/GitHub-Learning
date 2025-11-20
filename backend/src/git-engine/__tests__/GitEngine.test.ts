import { GitEngine } from '../GitEngine';
import { Repository, Branch } from '../models';

describe('GitEngine Core Functionality', () => {
  let gitEngine: GitEngine;

  beforeEach(() => {
    // Create a new repository with some initial files
    const repo = Repository.create({
      'README.md': { content: '# Test Project', modified: false },
      'index.js': { content: 'console.log("Hello");', modified: false },
    });
    gitEngine = new GitEngine(repo);
  });

  describe('Working Directory and Staging', () => {
    test('should add a single file to staging area', () => {
      const result = gitEngine.add('README.md');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Added');

      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md']).toBeDefined();
    });

    test('should add all files to staging area', () => {
      const result = gitEngine.addAll();

      expect(result.success).toBe(true);

      const repo = gitEngine.getRepository();
      expect(Object.keys(repo.stagingArea).length).toBe(2);
      expect(repo.stagingArea['README.md']).toBeDefined();
      expect(repo.stagingArea['index.js']).toBeDefined();
    });

    test('should fail to add non-existent file', () => {
      const result = gitEngine.add('nonexistent.txt');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should show status with untracked files', () => {
      const result = gitEngine.status();

      expect(result.success).toBe(true);
      expect(result.output).toContain('Untracked files');
      expect(result.output).toContain('README.md');
      expect(result.output).toContain('index.js');
    });

    test('should show status with staged files', () => {
      gitEngine.add('README.md');
      const result = gitEngine.status();

      expect(result.success).toBe(true);
      expect(result.output).toContain('Changes to be committed');
      expect(result.output).toContain('README.md');
    });
  });

  describe('Commit Functionality', () => {
    test('should create a commit with staged changes', () => {
      gitEngine.addAll();
      const result = gitEngine.commit('Initial commit', 'Test User');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Initial commit');

      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(1);
      expect(Object.keys(repo.stagingArea).length).toBe(0);
    });

    test('should fail to commit without staged changes', () => {
      const result = gitEngine.commit('Empty commit');

      expect(result.success).toBe(false);
      expect(result.error).toContain('No changes staged');
    });

    test('should fail to commit with empty message', () => {
      gitEngine.addAll();
      const result = gitEngine.commit('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('should link commits with parent', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      gitEngine.modifyFile('README.md', '# Updated Project');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(2);

      const commits = Array.from(repo.commits.values());
      const secondCommit = commits[1];
      expect(secondCommit.parent).toBe(commits[0].hash);
    });
  });

  describe('Log Operations', () => {
    test('should display commit history', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const result = gitEngine.log();

      expect(result.success).toBe(true);
      expect(result.output).toContain('commit');
      expect(result.output).toContain('First commit');
      expect(result.output).toContain('Author:');
    });

    test('should display oneline log format', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const result = gitEngine.logOneline();

      expect(result.success).toBe(true);
      expect(result.output).toContain('First commit');
      expect(result.output).not.toContain('Author:');
    });

    test('should fail log on empty repository', () => {
      const result = gitEngine.log();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No commits');
    });

    test('should display multiple commits in history', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      gitEngine.modifyFile('README.md', '# Updated');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      const result = gitEngine.log();

      expect(result.success).toBe(true);
      expect(result.output).toContain('First commit');
      expect(result.output).toContain('Second commit');
    });
  });

  describe('File Operations', () => {
    test('should modify existing file', () => {
      const result = gitEngine.modifyFile('README.md', '# Modified Content');

      expect(result.success).toBe(true);

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md'].content).toBe('# Modified Content');
      expect(repo.workingDirectory['README.md'].modified).toBe(true);
    });

    test('should create new file', () => {
      const result = gitEngine.createFile('newfile.txt', 'New content');

      expect(result.success).toBe(true);

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['newfile.txt']).toBeDefined();
      expect(repo.workingDirectory['newfile.txt'].content).toBe('New content');
    });

    test('should fail to create duplicate file', () => {
      const result = gitEngine.createFile('README.md', 'Content');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('should delete file', () => {
      const result = gitEngine.deleteFile('README.md');

      expect(result.success).toBe(true);

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md']).toBeUndefined();
    });
  });

  describe('Commit Hash Generation', () => {
    test('should generate unique hash for each commit', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      gitEngine.modifyFile('README.md', '# Updated');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      const repo = gitEngine.getRepository();
      const commits = Array.from(repo.commits.values());

      expect(commits[0].hash).toBeDefined();
      expect(commits[1].hash).toBeDefined();
      expect(commits[0].hash).not.toBe(commits[1].hash);
    });

    test('should generate SHA-1 format hash', () => {
      gitEngine.addAll();
      gitEngine.commit('Test commit');

      const repo = gitEngine.getRepository();
      const commits = Array.from(repo.commits.values());
      const hash = commits[0].hash;

      // SHA-1 hash should be 40 characters long and hexadecimal
      expect(hash).toHaveLength(40);
      expect(hash).toMatch(/^[a-f0-9]{40}$/);
    });

    test('should generate different hash for different content', () => {
      const repo1 = Repository.create({
        'test.txt': { content: 'test1', modified: false },
      });
      const engine1 = new GitEngine(repo1);
      engine1.addAll();
      engine1.commit('Test', 'Author');

      const repo2 = Repository.create({
        'test.txt': { content: 'test2', modified: false },
      });
      const engine2 = new GitEngine(repo2);
      engine2.addAll();
      engine2.commit('Test', 'Author');

      const hash1 = Array.from(engine1.getRepository().commits.values())[0].hash;
      const hash2 = Array.from(engine2.getRepository().commits.values())[0].hash;

      // Hashes should be different due to different content
      expect(hash1).not.toBe(hash2);
    });

    test('should include short hash in commit', () => {
      gitEngine.addAll();
      gitEngine.commit('Test commit');

      const repo = gitEngine.getRepository();
      const commit = Array.from(repo.commits.values())[0];

      expect(commit.shortHash).toHaveLength(7);
      expect(commit.hash.startsWith(commit.shortHash)).toBe(true);
    });
  });

  describe('Staging and Unstaging Operations', () => {
    test('should stage multiple files individually', () => {
      gitEngine.add('README.md');
      gitEngine.add('index.js');

      const repo = gitEngine.getRepository();
      expect(Object.keys(repo.stagingArea).length).toBe(2);
      expect(repo.stagingArea['README.md']).toBeDefined();
      expect(repo.stagingArea['index.js']).toBeDefined();
    });

    test('should preserve file content when staging', () => {
      const originalContent = gitEngine.getRepository().workingDirectory['README.md'].content;
      gitEngine.add('README.md');

      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md'].content).toBe(originalContent);
    });

    test('should stage modified files', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# Modified');
      gitEngine.add('README.md');

      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md'].content).toBe('# Modified');
    });

    test('should clear staging area after commit', () => {
      gitEngine.addAll();
      gitEngine.commit('Test commit');

      const repo = gitEngine.getRepository();
      expect(Object.keys(repo.stagingArea).length).toBe(0);
    });

    test('should handle staging empty directory', () => {
      const emptyRepo = Repository.create();
      const emptyEngine = new GitEngine(emptyRepo);

      const result = emptyEngine.addAll();

      expect(result.success).toBe(true);
      expect(result.message).toContain('No files');
    });
  });

  describe('Commit History Traversal', () => {
    test('should traverse linear commit history', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      gitEngine.modifyFile('README.md', '# V3');
      gitEngine.add('README.md');
      gitEngine.commit('Third commit');

      const result = gitEngine.log();

      expect(result.success).toBe(true);
      expect(result.output).toContain('Third commit');
      expect(result.output).toContain('Second commit');
      expect(result.output).toContain('First commit');
    });

    test('should maintain parent-child relationships', () => {
      gitEngine.addAll();
      gitEngine.commit('First');

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second');

      gitEngine.modifyFile('README.md', '# V3');
      gitEngine.add('README.md');
      gitEngine.commit('Third');

      const repo = gitEngine.getRepository();
      const commits = Array.from(repo.commits.values());

      expect(commits[0].parent).toBeNull();
      expect(commits[1].parent).toBe(commits[0].hash);
      expect(commits[2].parent).toBe(commits[1].hash);
    });

    test('should display commits in reverse chronological order', () => {
      gitEngine.addAll();
      gitEngine.commit('First');

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second');

      const result = gitEngine.log();
      const firstIndex = result.output!.indexOf('First');
      const secondIndex = result.output!.indexOf('Second');

      expect(secondIndex).toBeLessThan(firstIndex);
    });

    test('should limit log output with maxCount', () => {
      gitEngine.addAll();
      gitEngine.commit('First');

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second');

      gitEngine.modifyFile('README.md', '# V3');
      gitEngine.add('README.md');
      gitEngine.commit('Third');

      const result = gitEngine.log({ maxCount: 2 });

      expect(result.output).toContain('Third');
      expect(result.output).toContain('Second');
      expect(result.output).not.toContain('First');
    });
  });

  describe('Working Directory State Management', () => {
    test('should track file modifications', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# Modified');

      const status = gitEngine.status();
      expect(status.output).toContain('Changes not staged');
      expect(status.output).toContain('README.md');
    });

    test('should distinguish between staged and unstaged changes', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# Modified');
      gitEngine.add('README.md');

      gitEngine.modifyFile('index.js', 'console.log("changed");');

      const status = gitEngine.status();
      expect(status.output).toContain('Changes to be committed');
      expect(status.output).toContain('Changes not staged');
    });

    test('should track new untracked files', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.createFile('newfile.txt', 'content');

      const status = gitEngine.status();
      expect(status.output).toContain('Untracked files');
      expect(status.output).toContain('newfile.txt');
    });

    test('should update working directory after commit', () => {
      gitEngine.addAll();
      const result = gitEngine.commit('Test commit');

      const repo = gitEngine.getRepository();
      const commit = Array.from(repo.commits.values())[0];

      expect(repo.workingDirectory['README.md'].content).toBe(commit.tree['README.md'].content);
      expect(repo.workingDirectory['index.js'].content).toBe(commit.tree['index.js'].content);
    });

    test('should show clean working tree when no changes', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const status = gitEngine.status();
      expect(status.output).toContain('working tree clean');
    });

    test('should handle deleted files in working directory', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.deleteFile('README.md');

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md']).toBeUndefined();
    });

    test('should maintain separate working directory and staging area', () => {
      gitEngine.add('README.md');
      gitEngine.modifyFile('README.md', '# Changed after staging');

      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md'].content).not.toBe(
        repo.workingDirectory['README.md'].content
      );
    });
  });

  describe('Branch Operations', () => {
    test('should list all branches', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.branch();

      expect(result.success).toBe(true);
      expect(result.output).toContain('* main');
    });

    test('should create a new branch', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.branch('feature');

      expect(result.success).toBe(true);
      expect(result.message).toContain('created');

      const repo = gitEngine.getRepository();
      expect(repo.getBranch('feature')).toBeDefined();
    });

    test('should fail to create branch without commits', () => {
      const result = gitEngine.branch('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('without any commits');
    });

    test('should fail to create duplicate branch', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');
      gitEngine.branch('feature');

      const result = gitEngine.branch('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('should create branch at current commit', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const repo = gitEngine.getRepository();
      const currentCommit = repo.getCurrentCommit();

      gitEngine.branch('feature');
      const featureBranch = repo.getBranch('feature');

      expect(featureBranch?.commitHash).toBe(currentCommit?.hash);
    });

    test('should switch to existing branch', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');
      gitEngine.branch('feature');

      const result = gitEngine.checkout('feature');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Switched to branch');

      const repo = gitEngine.getRepository();
      expect(repo.head).toBe('feature');
    });

    test('should create and switch to new branch with -b', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.checkout('feature', true);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Switched to a new branch');

      const repo = gitEngine.getRepository();
      expect(repo.head).toBe('feature');
      expect(repo.getBranch('feature')).toBeDefined();
    });

    test('should fail to switch branch with uncommitted changes', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');
      gitEngine.branch('feature');

      gitEngine.modifyFile('README.md', '# Changed');
      gitEngine.add('README.md');

      const result = gitEngine.checkout('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Uncommitted changes');
    });

    test('should update working directory when switching branches', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');
      gitEngine.checkout('feature');

      gitEngine.modifyFile('README.md', '# Feature branch');
      gitEngine.add('README.md');
      gitEngine.commit('Feature commit');

      gitEngine.checkout('main');

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md'].content).toBe('# Test Project');
    });

    test('should checkout commit hash (detached HEAD)', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const repo = gitEngine.getRepository();
      const firstCommit = Array.from(repo.commits.values())[0];

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      const result = gitEngine.checkout(firstCommit.hash);

      expect(result.success).toBe(true);
      expect(result.output).toContain('detached HEAD');
      expect(repo.head).toBe(firstCommit.hash);
      expect(repo.isDetachedHead()).toBe(true);
    });

    test('should fail to checkout non-existent branch', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.checkout('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Merge Operations', () => {
    test('should perform fast-forward merge', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');
      gitEngine.checkout('feature');

      gitEngine.modifyFile('README.md', '# Feature');
      gitEngine.add('README.md');
      gitEngine.commit('Feature commit');

      gitEngine.checkout('main');
      const result = gitEngine.merge('feature');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Fast-forward');

      const repo = gitEngine.getRepository();
      const mainBranch = repo.getBranch('main');
      const featureBranch = repo.getBranch('feature');
      expect(mainBranch?.commitHash).toBe(featureBranch?.commitHash);
    });

    test('should perform three-way merge without conflicts', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');

      // Make changes on main
      gitEngine.modifyFile('README.md', '# Main branch');
      gitEngine.add('README.md');
      gitEngine.commit('Main commit');

      // Make changes on feature
      gitEngine.checkout('feature');
      gitEngine.modifyFile('index.js', 'console.log("feature");');
      gitEngine.add('index.js');
      gitEngine.commit('Feature commit');

      // Merge feature into main
      gitEngine.checkout('main');
      const result = gitEngine.merge('feature');

      expect(result.success).toBe(true);
      expect(result.output).toContain('recursive');

      const repo = gitEngine.getRepository();
      const currentCommit = repo.getCurrentCommit();
      expect(currentCommit?.isMergeCommit).toBe(true);
      expect(currentCommit?.parents?.length).toBe(2);
    });

    test('should detect merge conflicts', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');

      // Modify same file on main
      gitEngine.modifyFile('README.md', '# Main version');
      gitEngine.add('README.md');
      gitEngine.commit('Main commit');

      // Modify same file on feature
      gitEngine.checkout('feature');
      gitEngine.modifyFile('README.md', '# Feature version');
      gitEngine.add('README.md');
      gitEngine.commit('Feature commit');

      // Merge should conflict
      gitEngine.checkout('main');
      const result = gitEngine.merge('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('conflicts');
      expect(result.output).toContain('CONFLICT');
    });

    test('should generate conflict markers', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');

      gitEngine.modifyFile('README.md', '# Main version');
      gitEngine.add('README.md');
      gitEngine.commit('Main commit');

      gitEngine.checkout('feature');
      gitEngine.modifyFile('README.md', '# Feature version');
      gitEngine.add('README.md');
      gitEngine.commit('Feature commit');

      gitEngine.checkout('main');
      gitEngine.merge('feature');

      const repo = gitEngine.getRepository();
      const conflictedContent = repo.workingDirectory['README.md'].content;

      expect(conflictedContent).toContain('<<<<<<< HEAD');
      expect(conflictedContent).toContain('=======');
      expect(conflictedContent).toContain('>>>>>>>');
      expect(conflictedContent).toContain('# Main version');
      expect(conflictedContent).toContain('# Feature version');
    });

    test('should fail to merge non-existent branch', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.merge('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('should fail to merge branch into itself', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.merge('main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('into itself');
    });

    test('should fail to merge with uncommitted changes', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');
      gitEngine.modifyFile('README.md', '# Changed');
      gitEngine.add('README.md');

      const result = gitEngine.merge('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Uncommitted changes');
    });

    test('should handle already up-to-date merge', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.branch('feature');

      const result = gitEngine.merge('feature');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Already up to date');
    });

    test('should fail to merge in detached HEAD state', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const repo = gitEngine.getRepository();
      const commit = Array.from(repo.commits.values())[0];

      gitEngine.checkout(commit.hash);
      gitEngine.branch('feature');

      const result = gitEngine.merge('feature');

      expect(result.success).toBe(false);
      expect(result.error).toContain('detached HEAD');
    });
  });

  describe('Reset Operations', () => {
    test('should unstage a file with reset HEAD', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# Modified');
      gitEngine.add('README.md');

      const result = gitEngine.reset('HEAD', 'mixed', 'README.md');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Unstaged');

      const repo = gitEngine.getRepository();
      expect(repo.stagingArea['README.md']).toBeUndefined();
    });

    test('should fail to unstage non-staged file', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.reset('HEAD', 'mixed', 'README.md');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not staged');
    });

    test('should reset to specific commit with --hard', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const repo = gitEngine.getRepository();
      const firstCommit = Array.from(repo.commits.values())[0];

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      const result = gitEngine.reset(firstCommit.hash, 'hard');

      expect(result.success).toBe(true);
      expect(result.output).toContain('HEAD is now at');

      const currentCommit = repo.getCurrentCommit();
      expect(currentCommit?.hash).toBe(firstCommit.hash);
      expect(repo.workingDirectory['README.md'].content).toBe('# Test Project');
    });

    test('should clear staging area on hard reset', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const repo = gitEngine.getRepository();
      const firstCommit = Array.from(repo.commits.values())[0];

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      gitEngine.modifyFile('index.js', 'changed');
      gitEngine.add('index.js');

      gitEngine.reset(firstCommit.hash, 'hard');

      expect(Object.keys(repo.stagingArea).length).toBe(0);
    });

    test('should fail to reset to non-existent commit', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.reset('nonexistent', 'hard');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Checkout File Operations', () => {
    test('should discard working directory changes', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# Modified');

      const result = gitEngine.checkoutFile('README.md');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Restored');

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md'].content).toBe('# Test Project');
    });

    test('should fail to checkout file without commits', () => {
      const result = gitEngine.checkoutFile('README.md');

      expect(result.success).toBe(false);
      expect(result.error).toContain('without commits');
    });

    test('should fail to checkout non-existent file', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      const result = gitEngine.checkoutFile('nonexistent.txt');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found in HEAD');
    });

    test('should restore file to last committed version', () => {
      gitEngine.addAll();
      gitEngine.commit('Initial commit');

      gitEngine.modifyFile('README.md', '# V2');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');

      gitEngine.modifyFile('README.md', '# V3 - not committed');

      gitEngine.checkoutFile('README.md');

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['README.md'].content).toBe('# V2');
    });
  });
});

describe('Remote Repository Operations', () => {
  let gitEngine: GitEngine;

  beforeEach(() => {
    // Clear remote repositories before each test
    Repository.clearRemoteRepositories();
    Repository.clearPullRequests();

    const repo = Repository.create({
      'README.md': { content: '# Test Project', modified: false },
      'index.js': { content: 'console.log("Hello");', modified: false },
    });
    gitEngine = new GitEngine(repo);
  });

  afterEach(() => {
    // Clean up after tests
    Repository.clearRemoteRepositories();
    Repository.clearPullRequests();
  });

  describe('Remote Registration', () => {
    test('should add a remote repository', () => {
      const result = gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');

      expect(result.success).toBe(true);
      expect(result.message).toContain('added');

      const repo = gitEngine.getRepository();
      const remote = repo.getRemote('origin');
      expect(remote).toBeDefined();
      expect(remote?.name).toBe('origin');
      expect(remote?.url).toBe('https://github.com/test/repo.git');
    });

    test('should fail to add duplicate remote', () => {
      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      const result = gitEngine.remoteAdd('origin', 'https://github.com/test/other.git');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('should list configured remotes', () => {
      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      gitEngine.remoteAdd('upstream', 'https://github.com/original/repo.git');

      const result = gitEngine.remoteList();

      expect(result.success).toBe(true);
      expect(result.output).toContain('origin');
      expect(result.output).toContain('upstream');
      expect(result.output).toContain('https://github.com/test/repo.git');
      expect(result.output).toContain('https://github.com/original/repo.git');
    });

    test('should show empty list when no remotes configured', () => {
      const result = gitEngine.remoteList();

      expect(result.success).toBe(true);
      expect(result.output).toBe('');
    });
  });

  describe('Clone Operation', () => {
    test('should clone a remote repository', () => {
      // Create a remote repository with commits
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({
          'README.md': { content: '# Remote Project', modified: false },
        })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Initial commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      // Clone the repository
      const result = gitEngine.clone('https://github.com/test/repo.git');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Cloned');

      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(1);
      expect(repo.branches.size).toBe(1);
      expect(repo.workingDirectory['README.md'].content).toBe('# Remote Project');
      expect(repo.getRemote('origin')).toBeDefined();
    });

    test('should fail to clone non-existent repository', () => {
      const result = gitEngine.clone('https://github.com/nonexistent/repo.git');

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('should set HEAD to main branch after clone', () => {
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Initial commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      gitEngine.clone('https://github.com/test/repo.git');

      const repo = gitEngine.getRepository();
      expect(repo.head).toBe('main');
    });
  });

  describe('Push Operation', () => {
    test('should push commits to remote repository', () => {
      // Create remote repository
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );

      // Add remote and create commits locally
      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const result = gitEngine.push('origin', 'main');

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');

      // Verify commits were pushed
      const localCommit = gitEngine.getRepository().getCurrentCommit();
      const remoteCommit = remoteRepo.getCommit(localCommit!.hash);
      expect(remoteCommit).toBeDefined();
    });

    test('should fail to push to non-existent remote', () => {
      gitEngine.addAll();
      gitEngine.commit('First commit');

      const result = gitEngine.push('origin', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should fail to push non-existent branch', () => {
      Repository.createRemoteRepository('test-repo', 'https://github.com/test/repo.git');
      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');

      const result = gitEngine.push('origin', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should update remote branch on push', () => {
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );

      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      gitEngine.addAll();
      gitEngine.commit('First commit');
      gitEngine.push('origin', 'main');

      gitEngine.modifyFile('README.md', '# Updated');
      gitEngine.add('README.md');
      gitEngine.commit('Second commit');
      gitEngine.push('origin', 'main');

      const localBranch = gitEngine.getRepository().getBranch('main');
      const remoteBranch = remoteRepo.getBranch('main');
      expect(remoteBranch?.commitHash).toBe(localBranch?.commitHash);
    });
  });

  describe('Fetch Operation', () => {
    test('should fetch commits from remote', () => {
      // Create remote with commits
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Remote commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      // Fetch from remote
      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      const result = gitEngine.fetch('origin');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Fetched');

      const repo = gitEngine.getRepository();
      expect(repo.commits.size).toBe(1);
    });

    test('should fail to fetch from non-existent remote', () => {
      const result = gitEngine.fetch('origin');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should update remote branch tracking', () => {
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Remote commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      gitEngine.remoteAdd('origin', 'https://github.com/test/repo.git');
      gitEngine.fetch('origin');

      const repo = gitEngine.getRepository();
      const remote = repo.getRemote('origin');
      expect(remote?.branches.length).toBeGreaterThan(0);
    });
  });

  describe('Pull Operation', () => {
    test('should pull and merge changes from remote', () => {
      // Create remote with initial commit
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'initial', modified: false } })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Initial commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      // Clone and make remote changes
      gitEngine.clone('https://github.com/test/repo.git');

      // Add new commit to remote
      remoteEngine.modifyFile('test.txt', 'updated');
      remoteEngine.add('test.txt');
      remoteEngine.commit('Remote update');
      remoteRepoObj.getCommitsArray().forEach((c) => {
        if (!remoteRepo.getCommit(c.hash)) {
          remoteRepo.addCommit(c);
        }
      });
      const mainBranch = remoteRepoObj.getBranch('main');
      if (mainBranch) {
        remoteRepo.updateBranch('main', mainBranch.commitHash);
      }

      // Pull changes
      const result = gitEngine.pull('origin', 'main');

      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');

      const repo = gitEngine.getRepository();
      expect(repo.workingDirectory['test.txt'].content).toBe('updated');
    });

    test('should fail to pull from non-existent remote', () => {
      const result = gitEngine.pull('origin', 'main');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should handle already up-to-date pull', () => {
      const remoteRepo = Repository.createRemoteRepository(
        'test-repo',
        'https://github.com/test/repo.git'
      );
      const remoteEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      remoteEngine.addAll();
      remoteEngine.commit('Initial commit');

      const remoteRepoObj = remoteEngine.getRepository();
      remoteRepoObj.getCommitsArray().forEach((c) => remoteRepo.addCommit(c));
      remoteRepoObj.getBranchesArray().forEach((b) => remoteRepo.addBranch(b));

      gitEngine.clone('https://github.com/test/repo.git');
      const result = gitEngine.pull('origin', 'main');

      expect(result.success).toBe(true);
      expect(result.output).toContain('Already up to date');
    });
  });

  describe('Fork Operation', () => {
    test('should fork a remote repository', () => {
      // Create source repository
      const sourceRepo = Repository.createRemoteRepository(
        'source',
        'https://github.com/original/repo.git'
      );
      const sourceEngine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      sourceEngine.addAll();
      sourceEngine.commit('Initial commit');

      const sourceRepoObj = sourceEngine.getRepository();
      sourceRepoObj.getCommitsArray().forEach((c) => sourceRepo.addCommit(c));
      sourceRepoObj.getBranchesArray().forEach((b) => sourceRepo.addBranch(b));

      // Fork the repository
      const result = gitEngine.fork(
        'https://github.com/original/repo.git',
        'https://github.com/user/repo.git',
        'fork'
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Forked');

      const forkRepo = Repository.getRemoteRepository('https://github.com/user/repo.git');
      expect(forkRepo).toBeDefined();
      expect(forkRepo?.getCommitsArray().length).toBe(1);
    });

    test('should fail to fork non-existent repository', () => {
      const result = gitEngine.fork(
        'https://github.com/nonexistent/repo.git',
        'https://github.com/user/repo.git'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('should fail to fork to existing URL', () => {
      const sourceRepo = Repository.createRemoteRepository(
        'source',
        'https://github.com/original/repo.git'
      );
      Repository.createRemoteRepository('existing', 'https://github.com/user/repo.git');

      const result = gitEngine.fork(
        'https://github.com/original/repo.git',
        'https://github.com/user/repo.git'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('already');
    });
  });

  describe('Pull Request Operations', () => {
    test('should create a pull request', () => {
      // Create source and target repositories
      const sourceRepo = Repository.createRemoteRepository(
        'source',
        'https://github.com/user/repo.git'
      );
      const targetRepo = Repository.createRemoteRepository(
        'target',
        'https://github.com/original/repo.git'
      );

      // Add commits and branches
      const engine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      engine.addAll();
      engine.commit('Initial commit');

      const repo = engine.getRepository();
      repo.getCommitsArray().forEach((c) => {
        sourceRepo.addCommit(c);
        targetRepo.addCommit(c);
      });
      repo.getBranchesArray().forEach((b) => {
        sourceRepo.addBranch(Branch.create(b.name, b.commitHash));
        targetRepo.addBranch(Branch.create(b.name, b.commitHash));
      });

      // Create pull request
      const result = gitEngine.createPullRequest(
        'Add new feature',
        'This PR adds a new feature',
        'https://github.com/user/repo.git',
        'main',
        'https://github.com/original/repo.git',
        'main'
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('created');
      expect(result.output).toContain('Pull Request');
    });

    test('should fail to create PR with non-existent source repository', () => {
      const targetRepo = Repository.createRemoteRepository(
        'target',
        'https://github.com/original/repo.git'
      );

      const result = gitEngine.createPullRequest(
        'Test PR',
        'Description',
        'https://github.com/nonexistent/repo.git',
        'main',
        'https://github.com/original/repo.git',
        'main'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('should merge a pull request', () => {
      // Setup repositories
      const sourceRepo = Repository.createRemoteRepository(
        'source',
        'https://github.com/user/repo.git'
      );
      const targetRepo = Repository.createRemoteRepository(
        'target',
        'https://github.com/original/repo.git'
      );

      const engine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      engine.addAll();
      engine.commit('Initial commit');

      const repo = engine.getRepository();
      repo.getCommitsArray().forEach((c) => {
        sourceRepo.addCommit(c);
        targetRepo.addCommit(c);
      });
      repo.getBranchesArray().forEach((b) => {
        sourceRepo.addBranch(Branch.create(b.name, b.commitHash));
        targetRepo.addBranch(Branch.create(b.name, b.commitHash));
      });

      // Create and merge PR
      const createResult = gitEngine.createPullRequest(
        'Test PR',
        'Description',
        'https://github.com/user/repo.git',
        'main',
        'https://github.com/original/repo.git',
        'main'
      );

      const prId = createResult.output?.match(/Pull Request #([^\n]+)/)?.[1];
      expect(prId).toBeDefined();

      const mergeResult = gitEngine.mergePullRequest(prId!);

      expect(mergeResult.success).toBe(true);
      expect(mergeResult.message).toContain('merged');

      const pr = gitEngine.getPullRequest(prId!);
      expect(pr?.status).toBe('merged');
    });

    test('should fail to merge non-existent pull request', () => {
      const result = gitEngine.mergePullRequest('nonexistent-pr');

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    test('should fail to merge already merged pull request', () => {
      // Setup and create PR
      const sourceRepo = Repository.createRemoteRepository(
        'source',
        'https://github.com/user/repo.git'
      );
      const targetRepo = Repository.createRemoteRepository(
        'target',
        'https://github.com/original/repo.git'
      );

      const engine = new GitEngine(
        Repository.create({ 'test.txt': { content: 'test', modified: false } })
      );
      engine.addAll();
      engine.commit('Initial commit');

      const repo = engine.getRepository();
      repo.getCommitsArray().forEach((c) => {
        sourceRepo.addCommit(c);
        targetRepo.addCommit(c);
      });
      repo.getBranchesArray().forEach((b) => {
        sourceRepo.addBranch(Branch.create(b.name, b.commitHash));
        targetRepo.addBranch(Branch.create(b.name, b.commitHash));
      });

      const createResult = gitEngine.createPullRequest(
        'Test PR',
        'Description',
        'https://github.com/user/repo.git',
        'main',
        'https://github.com/original/repo.git',
        'main'
      );

      const prId = createResult.output?.match(/Pull Request #([^\n]+)/)?.[1];
      gitEngine.mergePullRequest(prId!);

      // Try to merge again
      const result = gitEngine.mergePullRequest(prId!);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already merged');
    });
  });
});
