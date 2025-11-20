import { GitEngine } from '../GitEngine';
import { CommandExecutor } from '../CommandExecutor';
import { Repository } from '../models/Repository';

describe('CommandExecutor', () => {
  let gitEngine: GitEngine;
  let executor: CommandExecutor;

  beforeEach(() => {
    const repo = Repository.create();
    gitEngine = new GitEngine(repo);
    executor = new CommandExecutor();
  });

  describe('Basic Commands', () => {
    test('should execute git status', () => {
      const result = executor.execute(gitEngine, 'git status');
      expect(result.success).toBe(true);
      expect(result.output).toContain('On branch main');
    });

    test('should execute git add with file', () => {
      gitEngine.createFile('test.txt', 'content');
      const result = executor.execute(gitEngine, 'git add test.txt');
      expect(result.success).toBe(true);
    });

    test('should execute git add .', () => {
      gitEngine.createFile('test.txt', 'content');
      const result = executor.execute(gitEngine, 'git add .');
      expect(result.success).toBe(true);
    });

    test('should execute git commit with message', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      const result = executor.execute(gitEngine, 'git commit -m "Initial commit"');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Initial commit');
    });

    test('should fail git commit without message', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      const result = executor.execute(gitEngine, 'git commit');
      expect(result.success).toBe(false);
      expect(result.message).toContain('commit message');
    });
  });

  describe('Branch Commands', () => {
    test('should execute git branch to list branches', () => {
      const result = executor.execute(gitEngine, 'git branch');
      expect(result.success).toBe(true);
      expect(result.output).toContain('main');
    });

    test('should execute git branch to create branch', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      gitEngine.commit('Initial commit');

      const result = executor.execute(gitEngine, 'git branch feature');
      expect(result.success).toBe(true);
    });

    test('should execute git checkout', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      gitEngine.commit('Initial commit');
      gitEngine.branch('feature');

      const result = executor.execute(gitEngine, 'git checkout feature');
      expect(result.success).toBe(true);
    });

    test('should execute git checkout -b', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      gitEngine.commit('Initial commit');

      const result = executor.execute(gitEngine, 'git checkout -b feature');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Switched to a new branch');
    });
  });

  describe('Log Commands', () => {
    test('should execute git log', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      gitEngine.commit('Initial commit');

      const result = executor.execute(gitEngine, 'git log');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Initial commit');
    });

    test('should execute git log --oneline', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      gitEngine.commit('Initial commit');

      const result = executor.execute(gitEngine, 'git log --oneline');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Initial commit');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid command', () => {
      const result = executor.execute(gitEngine, 'git invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should suggest correction for typo', () => {
      const result = executor.execute(gitEngine, 'git comit');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Did you mean');
    });

    test('should handle missing arguments', () => {
      const result = executor.execute(gitEngine, 'git add');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Nothing specified');
    });
  });

  describe('Command Parsing', () => {
    test('should parse command with quotes', () => {
      gitEngine.createFile('test.txt', 'content');
      gitEngine.add('test.txt');
      const result = executor.execute(gitEngine, 'git commit -m "Test message with spaces"');
      expect(result.success).toBe(true);
      expect(result.output).toContain('Test message with spaces');
    });

    test('should parse command without git prefix', () => {
      const result = executor.execute(gitEngine, 'status');
      expect(result.success).toBe(true);
    });
  });
});
